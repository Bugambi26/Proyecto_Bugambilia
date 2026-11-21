/* =========================================================
   admin.js — lógica del panel de administración
   ---------------------------------------------------------
   <body data-page="..."> indica qué pantalla es; abajo hay
   una función por pantalla y solo se ejecuta la que toca.

   IMPORTANTE: la "sesión" aquí es una simulación en el
   navegador (sessionStorage) para que el prototipo funcione.
   En producción el login, la recuperación de contraseña y la
   protección de las rutas los hace el backend.
   ========================================================= */
(function () {
  'use strict';
  var BG = window.BG, U = BG.util, esc = U.esc;
  var page = document.body.dataset.page;
  var SESSION_KEY = 'bugambilia:sesion';
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Sesión (simulada) ---------- */
  function haySesion() { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return true; } }
  function iniciarSesion() { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* sin almacenamiento */ } }
  function cerrarSesion() { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* nada */ } }

  if (page !== 'login' && !haySesion()) { window.location.replace('login.html'); return; }
  $$('[data-logout]').forEach(function (b) {
    b.addEventListener('click', function () { cerrarSesion(); window.location.href = 'login.html'; });
  });

  /* ---------- Aviso flotante ---------- */
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  // Mensaje pendiente al cambiar de página (ej. "Producto guardado")
  try {
    var pend = sessionStorage.getItem('bugambilia:toast');
    if (pend) { sessionStorage.removeItem('bugambilia:toast'); setTimeout(function () { toast(pend); }, 50); }
  } catch (e) { /* nada */ }
  // Reduce una imagen elegida a 'max' px (lado mayor) y la devuelve como data URL WebP/JPEG.
  // Así cabe en localStorage; en producción la imagen se sube al servidor.
  function reducirImagen(file, max, listo) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var k = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      var out = c.toDataURL('image/webp', 0.8);
      if (out.indexOf('data:image/webp') !== 0) out = c.toDataURL('image/jpeg', 0.8);
      listo(out);
    };
    img.onerror = function () { URL.revokeObjectURL(url); toast('No se pudo leer la imagen'); };
    img.src = url;
  }
  function toastSiguiente(msg) { try { sessionStorage.setItem('bugambilia:toast', msg); } catch (e) { /* nada */ } }

  var pages = {

    /* =====================================================
       Login + recuperación de contraseña
       ===================================================== */
    login: function () {
      function ver(nombre) {
        $$('[data-vista]').forEach(function (f) { f.hidden = f.dataset.vista !== nombre; });
        var f = $('[data-vista="' + nombre + '"] input'); if (f) f.focus();
      }
      $$('[data-ir]').forEach(function (b) { b.addEventListener('click', function () { ver(b.dataset.ir); }); });

      $('[data-vista="login"]').addEventListener('submit', function (e) {
        e.preventDefault();
        var correo = $('#correo').value.trim().toLowerCase(), pass = $('#pass').value;
        var ok = correo === BG.CONFIG.admin.correo && pass === BG.CONFIG.admin.contrasena;
        $('[data-error]').hidden = ok;
        $('#correo').setAttribute('aria-invalid', ok ? 'false' : 'true');
        $('#pass').setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (ok) { iniciarSesion(); window.location.href = 'inventario.html'; }
      });

      $('[data-vista="recuperar"]').addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('#correo2');
        if (!input.checkValidity()) { input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
        input.setAttribute('aria-invalid', 'false');
        $('[data-enviado]').hidden = false;
        // Demo: simulamos que la persona abrió el enlace del correo
        setTimeout(function () { ver('nueva'); }, 1400);
      });

      $('[data-vista="nueva"]').addEventListener('submit', function (e) {
        e.preventDefault();
        var a = $('#n1').value, b = $('#n2').value, err = $('[data-error-nueva]');
        var msg = a.length < 8 ? 'La contraseña debe tener al menos 8 caracteres.' : (a !== b ? 'Las contraseñas no coinciden.' : '');
        err.textContent = msg; err.hidden = !msg;
        if (!msg) { ver('login'); $('#correo').focus(); }
      });
    },

    /* =====================================================
       Inventario: tabla, filtros, paginación, stock y bajas
       ===================================================== */
    inventario: function () {
      var productos = BG.db.productos();
      var estado = { q: '', linea: 'todas', vista: 'activos', pagina: 1 };
      var POR_PAGINA = 10;
      var pendienteBaja = null;
      var tbody = $('[data-filas]'), dlg = $('[data-dialog-baja]');

      $('#fl').insertAdjacentHTML('beforeend', BG.LINEAS.map(function (l) {
        return '<option value="' + l.id + '">' + esc(l.filtro) + '</option>';
      }).join(''));

      function guardar() { BG.db.guardarProductos(productos); }

      function render() {
        $('[data-stat="activos"]').textContent = productos.filter(function (p) { return p.activo; }).length;
        $('[data-stat="agotados"]').textContent = productos.filter(function (p) { return p.activo && p.stock === 0; }).length;
        $('[data-stat="inactivos"]').textContent = productos.filter(function (p) { return !p.activo; }).length;

        var q = estado.q.toLowerCase();
        var lista = productos.filter(function (p) {
          var okVista = estado.vista === 'todos' || (estado.vista === 'activos' ? p.activo : !p.activo);
          return okVista && (estado.linea === 'todas' || p.linea === estado.linea) && (!q || p.nombre.toLowerCase().indexOf(q) !== -1);
        });
        var paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
        estado.pagina = Math.min(estado.pagina, paginas);
        var ini = (estado.pagina - 1) * POR_PAGINA;
        var visibles = lista.slice(ini, ini + POR_PAGINA);

        tbody.innerHTML = visibles.length ? visibles.map(function (p) {
          var badge = !p.activo ? '<span class="badge badge--out">Inactivo</span>' :
            (p.stock === 0 ? '<span class="badge badge--out">Agotado</span>' : '<span class="badge">Activo</span>');
          var accion = p.activo ?
            '<button type="button" class="btn btn--xs" data-baja="' + esc(p.id) + '">Dar de baja</button>' :
            '<button type="button" class="btn btn--xs" data-reactivar="' + esc(p.id) + '">Reactivar</button>';
          return '<tr>' +
            '<td><div class="cell-prod">' + U.imgProducto(p, 'thumb') + '<strong>' + esc(p.nombre) + '</strong></div></td>' +
            '<td class="muted">' + esc(U.linea(p.linea).filtro) + '</td>' +
            '<td>' + esc(U.precio(p.precio)) + '</td>' +
            '<td><div class="stepper">' +
              '<button type="button" data-menos="' + esc(p.id) + '" aria-label="Restar una pieza a ' + esc(p.nombre) + '">−</button>' +
              '<output aria-live="polite">' + p.stock + '</output>' +
              '<button type="button" data-mas="' + esc(p.id) + '" aria-label="Sumar una pieza a ' + esc(p.nombre) + '">+</button>' +
            '</div></td>' +
            '<td>' + badge + '</td>' +
            '<td><div class="actions"><a class="btn btn--xs" href="producto.html?id=' + encodeURIComponent(p.id) + '">Editar</a>' + accion + '</div></td>' +
          '</tr>';
        }).join('') : '<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--muted)">No hay productos con esos filtros.</td></tr>';

        $('[data-pager-info]').textContent = lista.length ?
          'Mostrando ' + (ini + 1) + '–' + (ini + visibles.length) + ' de ' + lista.length + ' productos' : 'Sin resultados';
        var pager = '';
        for (var i = 1; i <= paginas; i++) {
          pager += '<button type="button" class="btn btn--sm" data-pagina="' + i + '"' + (i === estado.pagina ? ' aria-current="page"' : '') + ' aria-label="Página ' + i + '">' + i + '</button>';
        }
        $('[data-pager]').innerHTML = pager;
      }

      function porId(id) { return productos.filter(function (p) { return p.id === id; })[0]; }

      tbody.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var d = b.dataset, prod;
        if (d.menos || d.mas) {
          prod = porId(d.menos || d.mas);
          prod.stock = Math.max(0, prod.stock + (d.mas ? 1 : -1));
          guardar(); render();
          // Devuelve el foco al mismo botón después de redibujar la tabla
          var again = tbody.querySelector('[data-' + (d.mas ? 'mas' : 'menos') + '="' + prod.id + '"]'); if (again) again.focus();
        } else if (d.baja) {
          pendienteBaja = porId(d.baja);
          $('[data-baja-nombre]').textContent = pendienteBaja.nombre;
          dlg.showModal();
        } else if (d.reactivar) {
          porId(d.reactivar).activo = true; guardar(); render(); toast('Producto reactivado');
        }
      });
      dlg.addEventListener('close', function () {
        if (dlg.returnValue === 'confirmar' && pendienteBaja) {
          pendienteBaja.activo = false; guardar(); render(); toast('«' + pendienteBaja.nombre + '» dado de baja');
        }
        pendienteBaja = null;
      });
      $('[data-pager]').addEventListener('click', function (e) {
        var b = e.target.closest('[data-pagina]'); if (!b) return;
        estado.pagina = Number(b.dataset.pagina); render();
      });
      $('#q').addEventListener('input', function (e) { estado.q = e.target.value.trim(); estado.pagina = 1; render(); });
      $('#fl').addEventListener('change', function (e) { estado.linea = e.target.value; estado.pagina = 1; render(); });
      $('#fe').addEventListener('change', function (e) { estado.vista = e.target.value; estado.pagina = 1; render(); });
      render();
    },

    /* =====================================================
       Alta / cambio de producto (mismo formulario)
       ===================================================== */
    producto: function () {
      var productos = BG.db.productos();
      var arbol = BG.db.arbol();
      var id = U.param('id');
      var actual = id ? productos.filter(function (p) { return p.id === id; })[0] : null;
      var form = $('[data-form-producto]');
      var datos = actual ? JSON.parse(JSON.stringify(actual)) :
        { id: '', linea: BG.LINEAS[0].id, nombre: '', tipo: BG.TIPOS[0], ingredientes: '', beneficio: '', contenido: '250 ml', precio: null, stock: 0, activo: true, img: '', necesidades: [] };

      $('[data-titulo]').textContent = actual ? 'Editar producto' : 'Dar de alta producto';
      document.title = (actual ? 'Editar ' + actual.nombre : 'Nuevo producto') + ' — Panel Bugambilia';
      $('#linea').innerHTML = BG.LINEAS.map(function (l) { return '<option value="' + l.id + '">' + esc(l.filtro) + '</option>'; }).join('');
      $('#tipo').innerHTML = BG.TIPOS.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('');

      // Cargar valores en el formulario
      form.nombre.value = datos.nombre; form.linea.value = datos.linea; form.tipo.value = datos.tipo;
      form.ingredientes.value = datos.ingredientes; form.beneficio.value = datos.beneficio;
      form.contenido.value = datos.contenido; form.precio.value = datos.precio == null ? '' : datos.precio;
      form.stock.value = datos.stock;

      var sw = $('[data-activo]');
      function pintarSwitch() { sw.setAttribute('aria-checked', datos.activo ? 'true' : 'false'); sw.textContent = datos.activo ? 'Activo' : 'Inactivo (dado de baja)'; }
      sw.addEventListener('click', function () { datos.activo = !datos.activo; pintarSwitch(); preview(); });
      pintarSwitch();

      // Chips de necesidades (vienen del árbol del chatbot)
      var chips = $('[data-necesidades]');
      function pintarChips() {
        chips.innerHTML = arbol.necesidades.map(function (n) {
          var on = datos.necesidades.indexOf(n.id) !== -1;
          return '<button type="button" class="chip" aria-pressed="' + on + '" data-nec="' + esc(n.id) + '">' + esc(n.nombre) + '</button>';
        }).join('');
      }
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('[data-nec]'); if (!b) return;
        var i = datos.necesidades.indexOf(b.dataset.nec);
        if (i === -1) datos.necesidades.push(b.dataset.nec); else datos.necesidades.splice(i, 1);
        pintarChips();
      });
      pintarChips();

      // Imagen: se muestra la actual (o el logo). Al elegir otra se reduce
      // a 600 px y se guarda con el producto (en producción se sube al servidor).
      function pintarImagen() {
        [$('[data-img-preview]'), $('[data-pv-img]')].forEach(function (img) {
          img.src = U.src(datos.img || 'img/logo.webp');
          img.classList.toggle('ph--logo', !datos.img);
        });
        $('[data-img-quitar]').hidden = !datos.img;
      }
      $('#img').addEventListener('change', function (e) {
        var f = e.target.files[0];
        if (!f) return;
        reducirImagen(f, 600, function (dataUrl) { datos.img = dataUrl; pintarImagen(); });
      });
      $('[data-img-quitar]').addEventListener('click', function () { datos.img = ''; $('#img').value = ''; pintarImagen(); });
      pintarImagen();

      // Vista previa de la tarjeta del catálogo, en vivo
      function preview() {
        var stock = parseInt(form.stock.value, 10) || 0;
        $('[data-pv-linea]').textContent = U.linea(form.linea.value).filtro;
        $('[data-pv-nombre]').textContent = form.nombre.value || '[Nombre del producto]';
        $('[data-pv-contenido]').textContent = U.contenido(form.contenido.value.trim());
        $('[data-pv-precio]').textContent = U.precio(form.precio.value.trim() === '' ? null : form.precio.value);
        var est = $('[data-pv-estado]');
        est.textContent = !datos.activo ? 'Inactivo' : (stock > 0 ? 'Disponible' : 'Agotado');
        est.classList.toggle('badge--out', !datos.activo || stock === 0);
      }
      form.addEventListener('input', preview);
      preview();

      // Validación y guardado
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var errores = 0;
        function marcar(input, mal) { input.setAttribute('aria-invalid', mal ? 'true' : 'false'); if (mal) errores++; }
        marcar(form.nombre, !form.nombre.value.trim());
        var precioTxt = form.precio.value.trim().replace(',', '.');
        var precioMal = precioTxt !== '' && !(parseFloat(precioTxt) > 0);
        marcar(form.precio, precioMal); $('#precio-error').hidden = !precioMal;
        var stock = Number(form.stock.value);
        marcar(form.stock, !(Number.isInteger(stock) && stock >= 0));
        $('[data-form-error]').hidden = errores === 0;
        if (errores) { var primero = form.querySelector('[aria-invalid="true"]'); if (primero) primero.focus(); return; }

        datos.nombre = form.nombre.value.trim();
        datos.linea = form.linea.value; datos.tipo = form.tipo.value;
        datos.ingredientes = form.ingredientes.value.trim(); datos.beneficio = form.beneficio.value.trim();
        datos.contenido = form.contenido.value.trim();
        datos.precio = precioTxt === '' ? null : Math.round(parseFloat(precioTxt) * 100) / 100;
        datos.stock = stock;
        if (actual) {
          productos = productos.map(function (p) { return p.id === actual.id ? datos : p; });
        } else {
          var base = U.slug(datos.nombre + '-' + datos.linea), nuevoId = base, n = 2;
          while (productos.some(function (p) { return p.id === nuevoId; })) nuevoId = base + '-' + (n++);
          datos.id = nuevoId; productos.push(datos);
        }
        BG.db.guardarProductos(productos);
        toastSiguiente(actual ? 'Cambios guardados' : 'Producto dado de alta');
        window.location.href = 'inventario.html';
      });
    },

    /* =====================================================
       Sucursales: lista, formulario, mapa, horario, eliminar
       ===================================================== */
    sucursales: function () {
      var sucursales = BG.db.sucursales();
      var form = $('[data-form-sucursal]'), lista = $('[data-lista]'), dlg = $('[data-dialog-eliminar]');
      var seleccion = sucursales[0] ? sucursales[0].id : null; // null = nueva
      var borrador, pendiente = null;

      function vacia() {
        return { id: '', nombre: '', tipo: 'propia', direccion: '', telefono: '', whatsapp: '', latitud: null, longitud: null, mapa: { x: 50, y: 50 }, foto: '', horario: BG.horarioVacio() };
      }
      function porId(id) { return sucursales.filter(function (s) { return s.id === id; })[0]; }

      function pintarLista() {
        lista.innerHTML = sucursales.map(function (s) {
          return '<article class="item" aria-current="' + (s.id === seleccion) + '">' +
            '<div class="row gap-12" style="flex-wrap: nowrap">' + (s.foto ? '<img class="ph" src="' + esc(U.src(s.foto)) + '" alt="">' : '<div class="ph" aria-hidden="true">Foto</div>') +
            '<div class="stack" style="gap: 2px; min-width: 0"><span class="meta" style="font-size: 11px">' + (s.tipo === 'propia' ? 'Establecimiento propio' : 'Punto de venta · tercero') + '</span>' +
            '<strong style="font-size: 16px">' + esc(s.nombre) + '</strong><span class="hint">' + esc(s.direccion || '[Dirección]') + '</span></div></div>' +
            '<div class="row gap-8" style="flex-wrap: nowrap"><button type="button" class="btn btn--xs" style="flex: 1" data-editar="' + esc(s.id) + '">Editar</button>' +
            '<button type="button" class="btn btn--xs" style="flex: 1" data-eliminar="' + esc(s.id) + '">Eliminar</button></div></article>';
        }).join('') || '<p class="empty">No hay sucursales. Agrega la primera.</p>';
      }

      function cargarFormulario() {
        var s = seleccion ? porId(seleccion) : null;
        borrador = JSON.parse(JSON.stringify(s || vacia()));
        $('[data-form-titulo]').textContent = s ? 'Editar: ' + s.nombre : 'Nueva sucursal';
        form.nombre.value = borrador.nombre; form.direccion.value = borrador.direccion;
        form.telefono.value = borrador.telefono; form.whatsapp.value = borrador.whatsapp;
        $$('input[name="tipo"]', form).forEach(function (r) { r.checked = r.value === borrador.tipo; });
        pintarPin();
        pintarFoto();
        $('[data-horario]').innerHTML = BG.DIAS.map(function (d, i) {
          var h = borrador.horario[d];
          return '<div class="hours-row" data-dia="' + d + '"><span>' + BG.DIAS_LABEL[i] + '</span>' +
            '<input class="input" type="time" aria-label="Apertura ' + BG.DIAS_LABEL[i] + '" data-abre value="' + esc(h.abre) + '"' + (h.cerrado ? ' disabled' : '') + '>' +
            '<input class="input" type="time" aria-label="Cierre ' + BG.DIAS_LABEL[i] + '" data-cierra value="' + esc(h.cierra) + '"' + (h.cerrado ? ' disabled' : '') + '>' +
            '<label class="check-inline"><input type="checkbox" data-cerrado' + (h.cerrado ? ' checked' : '') + '> Cerrado</label></div>';
        }).join('');
        $('[data-form-error]').hidden = true;
        $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      }

      function pintarFoto() {
        var img = $('[data-foto-preview]'), ph = $('[data-foto-vacia]');
        img.hidden = !borrador.foto; ph.hidden = !!borrador.foto;
        if (borrador.foto) img.src = U.src(borrador.foto);
      }
      $('#s-foto').addEventListener('change', function (e) {
        var f = e.target.files[0];
        if (!f) return;
        reducirImagen(f, 800, function (dataUrl) { borrador.foto = dataUrl; pintarFoto(); });
        e.target.value = '';
      });

      function pintarPin() {
        var pin = $('[data-map-pin]');
        pin.style.left = borrador.mapa.x + '%'; pin.style.top = borrador.mapa.y + '%';
      }

      // Colocar el marcador: clic en el mapa (o Enter/flechas con teclado)
      var picker = $('[data-map-picker]');
      picker.addEventListener('click', function (e) {
        var r = picker.getBoundingClientRect();
        borrador.mapa = { x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) };
        pintarPin();
      });
      picker.addEventListener('keydown', function (e) {
        var d = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
        if (!d) return;
        e.preventDefault();
        borrador.mapa = { x: Math.min(100, Math.max(0, borrador.mapa.x + d[0])), y: Math.min(100, Math.max(0, borrador.mapa.y + d[1])) };
        pintarPin();
      });

      // "Cerrado" desactiva las horas de ese día
      $('[data-horario]').addEventListener('change', function (e) {
        if (!e.target.matches('[data-cerrado]')) return;
        var row = e.target.closest('.hours-row');
        $$('input[type="time"]', row).forEach(function (i) { i.disabled = e.target.checked; });
      });

      lista.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.editar) { seleccion = b.dataset.editar; pintarLista(); cargarFormulario(); form.nombre.focus(); }
        if (b.dataset.eliminar) { pendiente = porId(b.dataset.eliminar); $('[data-eliminar-nombre]').textContent = pendiente.nombre; dlg.showModal(); }
      });
      dlg.addEventListener('close', function () {
        if (dlg.returnValue === 'confirmar' && pendiente) {
          sucursales = sucursales.filter(function (s) { return s.id !== pendiente.id; });
          BG.db.guardarSucursales(sucursales);
          if (seleccion === pendiente.id) seleccion = sucursales[0] ? sucursales[0].id : null;
          toast('Sucursal eliminada');
          pintarLista(); cargarFormulario();
        }
        pendiente = null;
      });
      $('[data-nueva]').addEventListener('click', function () { seleccion = null; pintarLista(); cargarFormulario(); form.nombre.focus(); });
      $('[data-cancelar]').addEventListener('click', cargarFormulario);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var faltan = 0;
        ['nombre', 'direccion'].forEach(function (k) {
          var mal = !form[k].value.trim(); form[k].setAttribute('aria-invalid', mal ? 'true' : 'false'); if (mal) faltan++;
        });
        $('[data-form-error]').hidden = !faltan;
        if (faltan) return;
        borrador.nombre = form.nombre.value.trim();
        borrador.direccion = form.direccion.value.trim();
        borrador.telefono = form.telefono.value.trim();
        borrador.whatsapp = form.whatsapp.value.trim();
        borrador.tipo = $('input[name="tipo"]:checked', form).value;
        $$('.hours-row', form).forEach(function (row) {
          borrador.horario[row.dataset.dia] = { abre: $('[data-abre]', row).value, cierra: $('[data-cierra]', row).value, cerrado: $('[data-cerrado]', row).checked };
        });
        if (seleccion) {
          sucursales = sucursales.map(function (s) { return s.id === seleccion ? borrador : s; });
        } else {
          borrador.id = U.slug(borrador.nombre);
          while (porId(borrador.id)) borrador.id += '-2';
          sucursales.push(borrador); seleccion = borrador.id;
        }
        BG.db.guardarSucursales(sucursales);
        toast('Sucursal guardada');
        pintarLista(); cargarFormulario();
      });

      pintarLista(); cargarFormulario();
    },

    /* =====================================================
       Árbol del chatbot
       ===================================================== */
    arbol: function () {
      var arbol = BG.db.arbol();
      var form = $('[data-form-pregunta]');
      var seleccion = arbol.preguntas[0] ? arbol.preguntas[0].id : null;
      var borrador;

      function porId(id) { return arbol.preguntas.filter(function (q) { return q.id === id; })[0]; }
      function nombreNec(id) { var n = arbol.necesidades.filter(function (x) { return x.id === id; })[0]; return n ? n.nombre : id; }
      function etiqueta(q, i) { return q.texto || '[Pregunta ' + (i + 1) + ']'; }

      function pintarLista() {
        $('[data-preguntas]').innerHTML = arbol.preguntas.map(function (q, i) {
          var finales = q.opciones.length && q.opciones.every(function (o) { return !o.siguiente; });
          var meta = (q.inicial ? 'Inicial · ' : '') + q.opciones.length + ' opciones' + (finales ? ' · todas llevan a Fin' : '');
          return '<button type="button" class="q-btn" aria-current="' + (q.id === seleccion) + '" data-q="' + esc(q.id) + '">' +
            '<strong>' + esc(etiqueta(q, i)) + '</strong><span>' + esc(meta) + '</span></button>';
        }).join('');
      }

      function cargar() {
        var q = porId(seleccion);
        if (!q) { form.hidden = true; return; }
        form.hidden = false;
        borrador = JSON.parse(JSON.stringify(q));
        $('[data-titulo]').textContent = 'Editar: ' + etiqueta(q, arbol.preguntas.indexOf(q));
        $('#q-texto').value = borrador.texto;
        $('#q-inicial').checked = !!borrador.inicial;
        $('[data-form-error]').hidden = true;
        pintarOpciones();
      }

      function pintarOpciones() {
        var destinos = arbol.preguntas.filter(function (q) { return q.id !== borrador.id; });
        $('[data-opciones]').innerHTML = borrador.opciones.map(function (o, i) {
          var letra = String.fromCharCode(65 + i);
          var opts = destinos.map(function (q) {
            return '<option value="' + esc(q.id) + '"' + (o.siguiente === q.id ? ' selected' : '') + '>' + esc(etiqueta(q, arbol.preguntas.indexOf(q))) + '</option>';
          }).join('') + '<option value=""' + (!o.siguiente ? ' selected' : '') + '>Fin → generar recomendación</option>';
          var libres = arbol.necesidades.filter(function (n) { return o.necesidades.indexOf(n.id) === -1; });
          return '<fieldset class="option" data-i="' + i + '"><legend>Opción ' + letra + '</legend>' +
            '<div class="option__grid">' +
              '<div class="field"><label for="op-t-' + i + '">Texto</label><input id="op-t-' + i + '" class="input" data-op-texto value="' + esc(o.texto) + '"></div>' +
              '<div class="field"><label for="op-s-' + i + '">Lleva a</label><select id="op-s-' + i + '" class="input" data-op-sig>' + opts + '</select></div>' +
            '</div>' +
            '<div class="stack gap-6"><span style="font-size: 13px; font-weight: 600">Necesidades que agrega</span><div class="chips">' +
              o.necesidades.map(function (n) {
                return '<span class="chip chip--sm chip--on">' + esc(nombreNec(n)) + '<button type="button" class="chip__x" data-quitar="' + esc(n) + '" aria-label="Quitar ' + esc(nombreNec(n)) + '">×</button></span>';
              }).join('') +
              (libres.length ? '<label class="sr-only" for="op-n-' + i + '">Agregar necesidad</label><select id="op-n-' + i + '" class="input chip chip--sm" style="width: auto; min-height: 32px" data-agregar-nec>' +
                '<option value="">+ Agregar necesidad</option>' + libres.map(function (n) { return '<option value="' + esc(n.id) + '">' + esc(n.nombre) + '</option>'; }).join('') + '</select>' : '') +
            '</div></div>' +
            '<button type="button" class="btn-link" style="align-self: flex-start; min-height: 32px" data-borrar-op>Quitar opción</button>' +
          '</fieldset>';
        }).join('');
        pintarFlujo();
      }

      // Vista del flujo: muestra a dónde lleva cada opción y avisa de ciclos
      function pintarFlujo() {
        var lineas = borrador.opciones.map(function (o, i) {
          var dest = o.siguiente ? porId(o.siguiente) : null;
          return '[' + (o.texto || 'Opción ' + String.fromCharCode(65 + i)) + '] → ' + (dest ? etiqueta(dest, arbol.preguntas.indexOf(dest)) : 'Fin (recomendación)');
        });
        var avisos = [];
        if (!borrador.opciones.length) avisos.push('Esta pregunta no tiene opciones.');
        if (borrador.opciones.some(function (o) { return !o.texto.trim(); })) avisos.push('Hay opciones sin texto.');
        var inaccesibles = arbol.preguntas.filter(function (q) {
          return !q.inicial && !arbol.preguntas.some(function (p) { return p.opciones.some(function (o) { return o.siguiente === q.id; }); });
        });
        if (inaccesibles.length) avisos.push('Sin ninguna opción que lleve a: ' + inaccesibles.map(function (q) { return etiqueta(q, arbol.preguntas.indexOf(q)); }).join(', '));
        $('[data-flujo]').innerHTML = '<span>Vista del flujo de «' + esc(borrador.texto || 'esta pregunta') + '»:</span>' +
          lineas.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') +
          avisos.map(function (a) { return '<span class="warn">⚠ ' + esc(a) + '</span>'; }).join('');
      }

      // Edición de opciones (delegación de eventos)
      var cont = $('[data-opciones]');
      cont.addEventListener('input', function (e) {
        var fs = e.target.closest('[data-i]'); if (!fs) return;
        var o = borrador.opciones[Number(fs.dataset.i)];
        if (e.target.matches('[data-op-texto]')) { o.texto = e.target.value; pintarFlujo(); }
      });
      cont.addEventListener('change', function (e) {
        var fs = e.target.closest('[data-i]'); if (!fs) return;
        var o = borrador.opciones[Number(fs.dataset.i)];
        if (e.target.matches('[data-op-sig]')) { o.siguiente = e.target.value || null; pintarFlujo(); }
        if (e.target.matches('[data-agregar-nec]') && e.target.value) { o.necesidades.push(e.target.value); pintarOpciones(); }
      });
      cont.addEventListener('click', function (e) {
        var fs = e.target.closest('[data-i]'); if (!fs) return;
        var i = Number(fs.dataset.i), o = borrador.opciones[i];
        if (e.target.closest('[data-quitar]')) { o.necesidades = o.necesidades.filter(function (n) { return n !== e.target.closest('[data-quitar]').dataset.quitar; }); pintarOpciones(); }
        if (e.target.closest('[data-borrar-op]')) { borrador.opciones.splice(i, 1); pintarOpciones(); }
      });
      $('#q-texto').addEventListener('input', function (e) { borrador.texto = e.target.value; pintarFlujo(); });
      $('[data-agregar-opcion]').addEventListener('click', function () {
        borrador.opciones.push({ id: U.uid('o'), texto: '', siguiente: null, necesidades: [] });
        pintarOpciones();
        var ins = $$('[data-op-texto]'); ins[ins.length - 1].focus();
      });

      $('[data-preguntas]').addEventListener('click', function (e) {
        var b = e.target.closest('[data-q]'); if (!b) return;
        seleccion = b.dataset.q; pintarLista(); cargar();
      });
      $('[data-nueva-pregunta]').addEventListener('click', function () {
        var q = { id: U.uid('q'), texto: '', inicial: !arbol.preguntas.length, opciones: [] };
        arbol.preguntas.push(q); BG.db.guardarArbol(arbol);
        seleccion = q.id; pintarLista(); cargar(); $('#q-texto').focus();
      });
      $('[data-eliminar-pregunta]').addEventListener('click', function () {
        var q = porId(seleccion);
        if (!q || !window.confirm('¿Eliminar «' + etiqueta(q, arbol.preguntas.indexOf(q)) + '»? Las opciones que llevaban aquí pasarán a «Fin».')) return;
        arbol.preguntas = arbol.preguntas.filter(function (x) { return x.id !== q.id; });
        arbol.preguntas.forEach(function (p) { p.opciones.forEach(function (o) { if (o.siguiente === q.id) o.siguiente = null; }); });
        if (q.inicial && arbol.preguntas[0]) arbol.preguntas[0].inicial = true;
        BG.db.guardarArbol(arbol);
        seleccion = arbol.preguntas[0] ? arbol.preguntas[0].id : null;
        pintarLista(); cargar(); toast('Pregunta eliminada');
      });
      $('[data-cancelar]').addEventListener('click', cargar);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        borrador.texto = $('#q-texto').value.trim();
        var err = !borrador.texto ? 'Escribe el texto de la pregunta.' :
          (!borrador.opciones.length ? 'Agrega al menos una opción.' :
          (borrador.opciones.some(function (o) { return !o.texto.trim(); }) ? 'Todas las opciones necesitan texto.' : ''));
        var box = $('[data-form-error]'); box.textContent = err; box.hidden = !err;
        if (err) return;
        borrador.inicial = $('#q-inicial').checked;
        if (borrador.inicial) arbol.preguntas.forEach(function (q) { q.inicial = false; }); // solo una inicial
        arbol.preguntas = arbol.preguntas.map(function (q) { return q.id === borrador.id ? borrador : q; });
        if (!arbol.preguntas.some(function (q) { return q.inicial; })) arbol.preguntas[0].inicial = true;
        BG.db.guardarArbol(arbol);
        toast('Pregunta guardada');
        pintarLista(); cargar();
      });

      pintarLista(); cargar();
    }
  };

  if (pages[page]) pages[page]();
})();
