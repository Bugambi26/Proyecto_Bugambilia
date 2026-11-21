/* =========================================================
   main.js — interacción del sitio público
   ---------------------------------------------------------
   Cada bloque se activa solo si su contenedor existe en la
   página (data-atributos), así un único archivo sirve a
   index, catalogo, producto y sucursales.
   ========================================================= */
(function () {
  'use strict';
  var BG = window.BG, U = BG.util, esc = U.esc;
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Enlaces de Instagram desde la configuración ---------- */
  $$('[data-instagram]').forEach(function (a) { a.href = BG.CONFIG.instagram; });

  /* ---------- Pestañas Faciales / Capilares ---------- */
  var tabs = $$('[role="tab"]');
  function activarTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activarTab(tab); });
    // Flechas izquierda/derecha entre pestañas (patrón ARIA de tabs)
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      activarTab(next); next.focus();
    });
  });

  /* ---------- Comparador antes / después ----------
     Un <input type="range"> invisible controla la variable CSS --pos;
     el CSS recorta la capa "después" con clip-path. */
  $$('[data-compare]').forEach(function (box) {
    var range = $('.compare__range', box);
    function update() { box.style.setProperty('--pos', range.value + '%'); }
    range.addEventListener('input', update);
    update();
  });

  // Colores de la etiqueta de cada línea como variables CSS (--l-bg / --l-ink)
  function colorLinea(l) { return l && l.color ? ' style="--l-bg: ' + esc(l.color) + '; --l-ink: ' + esc(l.tinta) + '"' : ''; }

  /* ---------- Inicio: tarjetas de las 7 líneas ---------- */
  var lineasBox = $('[data-lineas]');
  if (lineasBox) {
    var productos = BG.db.productos().filter(function (p) { return p.activo; });
    lineasBox.innerHTML = BG.LINEAS.map(function (l) {
      var n = productos.filter(function (p) { return p.linea === l.id; }).length;
      return '<a href="catalogo.html?linea=' + l.id + '" class="card line-card"' + colorLinea(l) + '>' +
        '<img class="ph line-card__img" src="' + esc(U.src(l.img)) + '" alt="" loading="lazy" decoding="async">' +
        '<div class="line-card__body">' +
          '<span class="meta">' + esc(l.num) + '</span>' +
          '<span class="line-card__name">' + esc(l.ritual) + '</span>' +
          '<span class="small">' + esc(l.ingrediente) + ' · ' + n + ' productos</span>' +
        '</div></a>';
    }).join('');
  }

  /* ---------- Inicio: vista previa de sucursales ---------- */
  var sucPrev = $('[data-sucursales-preview]');
  if (sucPrev) {
    sucPrev.innerHTML = BG.db.sucursales().map(function (s) {
      return '<a href="sucursales.html#' + esc(s.id) + '" class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 6px; text-decoration: none">' +
        '<span class="meta">' + (s.tipo === 'propia' ? 'Establecimiento propio' : 'Punto de venta') + '</span>' +
        '<span style="font-size: 18px; font-weight: 700">' + esc(s.nombre) + '</span>' +
        '<span class="small">' + esc(s.direccion || '[Dirección]') + ' · Hoy: ' + esc(U.horarioHoy(s)) + '</span></a>';
    }).join('');
  }

  /* ---------- Catálogo ---------- */
  var grid = $('[data-productos]');
  if (grid) {
    var todos = BG.db.productos().filter(function (p) { return p.activo; }); // los dados de baja no se muestran
    var estado = { linea: U.param('linea') || 'todas', q: '', tipos: [] };
    if (estado.linea !== 'todas' && !U.linea(estado.linea)) estado.linea = 'todas';

    // Botones de línea
    var lineasF = $('[data-filtro-lineas]');
    lineasF.innerHTML = [{ id: 'todas', filtro: 'Todas' }].concat(BG.LINEAS).map(function (l) {
      return '<button type="button" class="filter-btn" data-linea="' + l.id + '" aria-pressed="false"' + colorLinea(l) + '>' + esc(l.filtro) + '</button>';
    }).join('');
    // Casillas de tipo de producto
    $('[data-filtro-tipos]').innerHTML = BG.TIPOS.map(function (t) {
      return '<label class="check"><input type="checkbox" value="' + esc(t) + '"> ' + esc(t) + '</label>';
    }).join('');

    function render() {
      $$('.filter-btn', lineasF).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.linea === estado.linea ? 'true' : 'false'); });
      var q = estado.q.toLowerCase();
      var lista = todos.filter(function (p) {
        return (estado.linea === 'todas' || p.linea === estado.linea) &&
          (!estado.tipos.length || estado.tipos.indexOf(p.tipo) !== -1) &&
          (!q || (p.nombre + ' ' + U.linea(p.linea).ritual + ' ' + p.tipo).toLowerCase().indexOf(q) !== -1);
      });
      $('[data-total]').textContent = lista.length;
      $('[data-filtro-actual]').textContent = estado.linea === 'todas' ? 'Todas las líneas' : U.linea(estado.linea).filtro;
      // Banner con la foto y descripción de la línea elegida
      var banner = $('[data-banner-linea]');
      if (estado.linea === 'todas') { banner.hidden = true; banner.innerHTML = ''; }
      else {
        var ln = U.linea(estado.linea);
        banner.hidden = false;
        banner.setAttribute('style', '--l-bg: ' + ln.color + '; --l-ink: ' + ln.tinta);
        banner.innerHTML = '<img class="ph line-banner__img" src="' + esc(U.src(ln.img)) + '" alt="Productos de la línea ' + esc(ln.filtro) + '">' +
          '<div class="line-banner__body"><span class="meta">' + esc(ln.num) + ' · ' + esc(ln.ritual) + '</span>' +
          '<h2 class="title-sm">' + esc(ln.filtro) + '</h2><p class="text">' + esc(ln.descripcion) + '</p>' +
          '<span class="small">Ingrediente protagonista: ' + esc(ln.ingrediente) + '</span></div>';
      }
      grid.innerHTML = lista.length ? lista.map(tarjetaProducto).join('') :
        '<p class="empty" style="grid-column: 1 / -1">No hay productos con esos filtros.</p>';
    }
    lineasF.addEventListener('click', function (e) {
      var b = e.target.closest('[data-linea]'); if (!b) return;
      estado.linea = b.dataset.linea;
      // Mantiene el filtro en la URL (se puede compartir el enlace)
      var url = estado.linea === 'todas' ? 'catalogo.html' : 'catalogo.html?linea=' + estado.linea;
      history.replaceState(null, '', url);
      render();
    });
    $('#buscar').addEventListener('input', function (e) { estado.q = e.target.value.trim(); render(); });
    $('[data-filtro-tipos]').addEventListener('change', function () {
      estado.tipos = $$('[data-filtro-tipos] input:checked').map(function (i) { return i.value; });
      render();
    });
    render();
  }

  function tarjetaProducto(p) {
    var l = U.linea(p.linea), hay = U.disponible(p);
    return '<article class="card product-card"' + colorLinea(l) + '>' +
      U.imgProducto(p, 'product-card__img') +
      '<div class="product-card__body">' +
        '<span class="product-card__line">' + esc(l.filtro) + '</span>' +
        '<h2 class="product-card__name">' + esc(p.nombre) + '</h2>' +
        '<span class="small">' + esc(U.contenido(p.contenido)) + '</span>' +
        '<div class="product-card__foot"><span style="font-weight: 700">' + esc(U.precio(p.precio)) + '</span>' +
          '<span class="badge' + (hay ? '' : ' badge--out') + '">' + (hay ? 'Disponible' : 'Agotado') + '</span></div>' +
        '<a href="producto.html?id=' + encodeURIComponent(p.id) + '" class="btn btn--sm" style="margin-top: 8px">Ver detalle<span class="sr-only"> de ' + esc(p.nombre) + '</span></a>' +
      '</div></article>';
  }

  /* ---------- Detalle de producto ---------- */
  var detalle = $('[data-detalle]');
  if (detalle) {
    var lista = BG.db.productos();
    var prod = lista.filter(function (p) { return p.id === U.param('id') && p.activo; })[0];
    if (!prod) {
      detalle.hidden = true;
      $('[data-no-encontrado]').hidden = false;
    } else {
      var l = U.linea(prod.linea), hay = U.disponible(prod);
      document.title = prod.nombre + ' — ' + l.ritual + ' — Bugambilia';
      if (l.color) { detalle.style.setProperty('--l-bg', l.color); detalle.style.setProperty('--l-ink', l.tinta); }
      var bc = $('[data-bc-linea]'); bc.textContent = l.filtro; bc.href = 'catalogo.html?linea=' + l.id;
      $('[data-bc-nombre]').textContent = prod.nombre;
      $('[data-d-linea]').textContent = l.num.toUpperCase() + ' — ' + l.ritual.toUpperCase();
      $('[data-d-nombre]').textContent = prod.nombre;
      $('[data-d-precio]').textContent = U.precio(prod.precio);
      var est = $('[data-d-estado]'); est.textContent = hay ? 'Disponible' : 'Agotado'; est.classList.toggle('badge--out', !hay);
      $('[data-d-descripcion]').textContent = l.descripcion;
      $('[data-d-ingredientes]').textContent = prod.ingredientes || l.ingrediente;
      var dImg = $('[data-d-img]');
      dImg.src = U.src(prod.img || 'img/logo.webp');
      dImg.alt = prod.nombre + ' — ' + l.filtro + ', ' + U.contenido(prod.contenido);
      dImg.classList.toggle('ph--logo', !prod.img);
      var ingImg = $('[data-d-ing-img]');
      if (l.ingImg) { ingImg.src = U.src(l.ingImg); ingImg.hidden = false; }
      $('[data-d-contenido]').textContent = U.contenido(prod.contenido);
      $('[data-d-beneficio]').textContent = prod.beneficio || '[Beneficio principal — de la etiqueta]';
      $('[data-d-completa]').textContent = 'Completa tu ' + l.ritual;
      var rel = lista.filter(function (p) { return p.linea === prod.linea && p.id !== prod.id && p.activo; });
      $('[data-relacionados]').innerHTML = rel.map(function (r) {
        return '<a href="producto.html?id=' + encodeURIComponent(r.id) + '" class="card related-card">' +
          U.imgProducto(r) + '<div class="stack" style="gap: 4px">' +
          '<span style="font-size: 17px; font-weight: 700">' + esc(r.nombre) + '</span>' +
          '<span class="small">' + esc(U.precio(r.precio)) + ' · Ver detalle</span></div></a>';
      }).join('');
    }
  }

  /* ---------- Sucursales: mapa + acordeón ---------- */
  var sucBox = $('[data-sucursales]');
  if (sucBox) {
    var sucs = BG.db.sucursales();
    var abierta = window.location.hash ? window.location.hash.slice(1) : (sucs[0] && sucs[0].id);

    function renderSucursales() {
      sucBox.innerHTML = sucs.map(function (s) {
        var on = s.id === abierta, hoy = (new Date().getDay() + 6) % 7;
        var tel = (s.telefono || '').replace(/\D/g, ''), wa = (s.whatsapp || '').replace(/\D/g, '');
        var horas = BG.DIAS.map(function (d, i) {
          return '<tr' + (i === hoy ? ' aria-current="date"' : '') + '><th scope="row">' + BG.DIAS_LABEL[i] + '</th><td>' + esc(U.formatoHorario(s.horario[d])) + '</td></tr>';
        }).join('');
        return '<article class="card branch" id="' + esc(s.id) + '" data-open="' + on + '">' +
          '<button type="button" class="branch__toggle" aria-expanded="' + on + '" aria-controls="b-' + esc(s.id) + '" data-suc="' + esc(s.id) + '">' +
            (s.foto ? '<img class="ph" src="' + esc(U.src(s.foto)) + '" alt="" loading="lazy">' : '<div class="ph" aria-hidden="true">Foto</div>') +
            '<div class="stack" style="gap: 4px"><span class="meta" style="font-size: 11.5px">' + (s.tipo === 'propia' ? 'Establecimiento propio' : 'Punto de venta · tercero') + '</span>' +
            '<span class="branch__name">' + esc(s.nombre) + '</span><span class="small">' + esc(s.direccion || '[Dirección]') + '</span></div>' +
          '</button>' +
          '<div class="branch__body" id="b-' + esc(s.id) + '"' + (on ? '' : ' hidden') + '>' +
            '<table class="hours"><caption>Horario</caption><tbody>' + horas + '</tbody></table>' +
            '<div class="row gap-10">' +
              '<a class="btn btn--primary btn--sm" ' + (wa ? 'href="https://wa.me/' + wa + '" target="_blank" rel="noopener"' : 'aria-disabled="true"') + '>WhatsApp</a>' +
              '<a class="btn btn--sm" ' + (tel ? 'href="tel:' + tel + '"' : 'aria-disabled="true"') + '>Llamar · ' + esc(s.telefono || '[Teléfono]') + '</a>' +
              '<a class="btn btn--sm" ' + (s.direccion ? 'href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.direccion) + '" target="_blank" rel="noopener"' : 'aria-disabled="true"') + '>Cómo llegar</a>' +
            '</div></div></article>';
      }).join('');
      // Marcadores en el mapa
      var mapa = $('[data-mapa]');
      $$('.map__pin', mapa).forEach(function (n) { n.remove(); });
      sucs.forEach(function (s) {
        var pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'map__pin' + (s.tipo === 'tercero' ? ' map__pin--third' : '');
        pin.style.left = s.mapa.x + '%'; pin.style.top = s.mapa.y + '%';
        pin.dataset.suc = s.id;
        pin.innerHTML = '<span class="map__pin-dot" aria-hidden="true"></span><span class="map__pin-label">' + esc(s.nombre) + '</span>';
        pin.setAttribute('aria-label', 'Ver ' + s.nombre);
        mapa.appendChild(pin);
      });
    }
    // Un solo listener para tarjetas y marcadores (delegación de eventos)
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-suc]'); if (!t) return;
      var id = t.dataset.suc;
      abierta = (abierta === id && t.classList.contains('branch__toggle')) ? null : id;
      renderSucursales();
      if (t.classList.contains('map__pin')) document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    // Los botones sin datos no hacen nada (evita enlaces vacíos)
    document.addEventListener('click', function (e) {
      if (e.target.closest('[aria-disabled="true"]')) e.preventDefault();
    });
    renderSucursales();
  }
})();
