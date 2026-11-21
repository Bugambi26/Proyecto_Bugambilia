/* =========================================================
   data.js — datos del sitio y "base de datos" local
   ---------------------------------------------------------
   Mientras no exista el backend (Fase 3), los datos viven
   aquí y los cambios del panel admin se guardan en el
   navegador con localStorage. Así el sitio público refleja
   lo que se edita en el panel (stock, bajas, sucursales…).

   Todo cuelga de un solo objeto global: window.BG
   (se usan <script> normales y no módulos ES para que el
   proyecto funcione abriendo el .html con doble clic).
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Configuración general ---------- */
  var CONFIG = {
    instagram: 'https://instagram.com/', // TODO: URL real del Instagram de Bugambilia
    admin: { correo: 'admin@bugambilia.mx', contrasena: 'bugambilia' } // SOLO demo: la autenticación real va en el backend
  };

  /* ---------- Líneas (Línea Bugambilia) ----------
     color / tinta: fondo y texto de la banda de su etiqueta (se usan en tarjetas y filtros)
     img: foto de la línea · ingImg: foto del ingrediente protagonista
     (rutas relativas a la raíz del sitio; BG.util.src() las ajusta en /admin) */
  var LINEAS = [
    { id: 'blonde', num: '01 · Rubios perfectos', ritual: 'Blonde Ritual', filtro: 'Rubios Perfectos', ingrediente: 'Aceite de pepita de uva',
      color: '#E9E1F4', tinta: '#4E3487', img: 'img/lineas/blonde.webp', ingImg: 'img/ingredientes/blonde.webp',
      descripcion: 'Línea especializada en el mantenimiento y cuidado de cabellos rubios, ayudando a conservar una apariencia luminosa, brillante y tonalmente equilibrada.' },
    { id: 'copper', num: '02 · Cobres brillantes', ritual: 'Copper Ritual', filtro: 'Cobres Brillantes', ingrediente: 'Cacao',
      color: '#F6DCCB', tinta: '#9A3F22', img: 'img/lineas/copper.webp', ingImg: 'img/ingredientes/copper.webp',
      descripcion: 'Línea diseñada para el cuidado y mantenimiento de tonos cobrizos, buscando conservar intensidad, brillo y una apariencia saludable.' },
    { id: 'hydra', num: '03 · Hidratación', ritual: 'Hydra Ritual', filtro: 'Hidratación', ingrediente: 'Aloe vera + sangre de grado',
      color: '#DFE8DA', tinta: '#3F5C3D', img: 'img/lineas/hydra.webp', ingImg: 'img/ingredientes/hydra.webp',
      descripcion: 'Ritual de hidratación para cabello que necesita recuperar suavidad, luminosidad y una sensación de mayor nutrición.' },
    { id: 'repair', num: '04 · Reestructurante', ritual: 'Repair Ritual', filtro: 'Reestructurante', ingrediente: 'Ácido hialurónico, células madre, colágeno',
      color: '#F1E5D2', tinta: '#735A3A', img: 'img/lineas/repair.webp', ingImg: 'img/ingredientes/repair.webp',
      descripcion: 'Ritual especializado para cabello sensibilizado, procesado o que necesita un cuidado intensivo.' },
    { id: 'growth', num: '05 · Crecimiento', ritual: 'Growth Ritual', filtro: 'Crecimiento', ingrediente: 'Romero, jengibre y biotina',
      color: '#DCE5CF', tinta: '#4A5A2E', img: 'img/lineas/growth.webp', ingImg: 'img/ingredientes/growth.webp',
      descripcion: 'Una combinación de activos naturales que estimulan el crecimiento, fortalecen la raíz y mantienen un cabello más fuerte, sano y abundante.' },
    { id: 'cotton', num: '06 · Cotton Candy', ritual: 'Sweet Ritual', filtro: 'Cotton Candy', ingrediente: 'Extracto de vainilla y algodón',
      color: '#F8DCE3', tinta: '#A42A55', img: 'img/lineas/cotton.webp', ingImg: 'img/ingredientes/cotton.webp',
      descripcion: 'Una fórmula inspirada en la suavidad del algodón y la calidez de la vainilla, que envuelve tu cabello en un aroma irresistible, dejándolo suave, brillante y lleno de vida.' },
    { id: 'antiox', num: '07 · Kit Antioxidante', ritual: 'Kit Antioxidante', filtro: 'Kit Antioxidante', ingrediente: '[Ingrediente protagonista]',
      color: '#EDE1CF', tinta: '#6B4A2B', img: 'img/lineas/antiox.webp', ingImg: 'img/ingredientes/antiox.webp',
      descripcion: 'Una rutina completa para devolverle vida a tu cabello: elimina la acumulación de minerales, prepara el cabello para recibir mejor los nutrientes y potencia los resultados de tu rutina de cuidado.' }
  ];

  var TIPOS = ['Shampoo', 'Bálsamo', 'Mascarilla', 'Crema para peinar', 'Loción'];

  /* ---------- Productos (21, según las etiquetas de la clienta) ----------
     precio: null  → se muestra "[Precio]" (pendiente con la clienta)
     img           → foto del producto; si está vacía se muestra el logo
     necesidades   → etiquetas del chatbot. Los valores reales se definen
                     en la Fase 4; estos son marcadores para probar el flujo. */
  function p(id, linea, nombre, tipo, beneficio, stock, necesidades) {
    var l = LINEAS.filter(function (x) { return x.id === linea; })[0];
    return { id: id, linea: linea, nombre: nombre, tipo: tipo, ingredientes: l.ingrediente,
      beneficio: beneficio, contenido: '250 ml', precio: null, stock: stock, activo: true,
      img: 'img/productos/' + id + '.webp', necesidades: necesidades || [] };
  }
  var PRODUCTOS = [
    p('shampoo-matizante', 'blonde', 'Shampoo Matizante', 'Shampoo', 'Neutraliza, limpia y protege el tono.', 12, ['n1']),
    p('mascarilla-matizante', 'blonde', 'Mascarilla Matizante', 'Mascarilla', 'Matiza, repara y da brillo.', 8, ['n1']),
    p('crema-antioxidante-rubios', 'blonde', 'Crema para Peinar Antioxidante', 'Crema para peinar', 'Protege el color y facilita el peinado.', 5, ['n1']),
    p('shampoo-cobre', 'copper', 'Shampoo Cobre', 'Shampoo', 'Limpia, intensifica y realza el tono.', 0, ['n2']),
    p('balsamo-cobres', 'copper', 'Bálsamo Hidratante', 'Bálsamo', 'Nutre, suaviza y da brillo.', 9, ['n2']),
    p('crema-cobres', 'copper', 'Crema para Peinar', 'Crema para peinar', 'Define, controla y protege el color.', 7, ['n2']),
    p('shampoo-hidratante', 'hydra', 'Shampoo Hidratante', 'Shampoo', 'Limpieza suave y nutritiva.', 10, ['n3']),
    p('balsamo-hidratacion', 'hydra', 'Bálsamo Hidratante', 'Bálsamo', 'Suavidad, nutrición y brillo.', 6, ['n3']),
    p('crema-hidratacion', 'hydra', 'Crema para Peinar', 'Crema para peinar', 'Hidratación, control y suavidad.', 4, ['n3']),
    p('shampoo-hialuronico', 'repair', 'Shampoo Ácido Hialurónico', 'Shampoo', 'Limpia y fortalece la fibra capilar.', 3, ['n4']),
    p('balsamo-celulas-madre', 'repair', 'Bálsamo Células Madre', 'Bálsamo', 'Repara, nutre y revitaliza.', 6, ['n4']),
    p('crema-colageno', 'repair', 'Crema para Peinar Colágeno', 'Crema para peinar', 'Protección, control y movimiento.', 5, ['n4']),
    p('shampoo-estimulante', 'growth', 'Shampoo Estimulante', 'Shampoo', 'Limpia, activa y fortalece la raíz.', 7, ['n5']),
    p('balsamo-fortalecedor', 'growth', 'Bálsamo Fortalecedor', 'Bálsamo', 'Nutre, desenreda y da cuerpo.', 6, ['n5']),
    p('locion-activadora', 'growth', 'Loción Activadora', 'Loción', 'Estimula el crecimiento y reduce la caída.', 4, ['n5']),
    p('shampoo-suavizante', 'cotton', 'Shampoo Suavizante', 'Shampoo', 'Limpia delicadamente y deja un cabello suave y sedoso.', 9, ['n3']),
    p('balsamo-acondicionador', 'cotton', 'Bálsamo Acondicionador', 'Bálsamo', 'Desenreda, hidrata y da brillo.', 8, ['n3']),
    p('crema-control-suavidad', 'cotton', 'Crema para Peinar Control y Suavidad', 'Crema para peinar', 'Facilita el peinado, controla el frizz y deja un acabado sedoso.', 6, []),
    p('shampoo-antioxidante', 'antiox', 'Shampoo Antioxidante', 'Shampoo', 'Limpieza profunda y protección.', 7, ['n6']),
    p('balsamo-antioxidante', 'antiox', 'Bálsamo Antioxidante', 'Bálsamo', 'Suavidad, nutrición y brillo.', 5, ['n6']),
    p('crema-antioxidante', 'antiox', 'Crema para Peinar Antioxidante', 'Crema para peinar', 'Protección, control y movimiento.', 6, ['n6'])
  ];

  /* ---------- Sucursales ----------
     mapa: posición del marcador en el placeholder (en %). Cuando se
     conecte un mapa real se usarán latitud y longitud. */
  var DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  var DIAS_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  function horarioVacio() {
    var h = {};
    DIAS.forEach(function (d) { h[d] = { abre: '', cierra: '', cerrado: false }; });
    return h;
  }
  var SUCURSALES = [
    { id: 'bugambilia', nombre: 'Estética Bugambilia', tipo: 'propia', direccion: '', telefono: '', whatsapp: '',
      latitud: null, longitud: null, mapa: { x: 36, y: 42 }, foto: '', horario: horarioVacio() },
    { id: 'kokoro', nombre: 'Kokoro', tipo: 'tercero', direccion: '', telefono: '', whatsapp: '',
      latitud: null, longitud: null, mapa: { x: 64, y: 66 }, foto: 'img/sucursales/kokoro.webp', horario: horarioVacio() }
  ];

  /* ---------- Árbol del chatbot (marcadores hasta la Fase 4) ----------
     siguiente: id de la pregunta a la que lleva la opción, o null = Fin */
  var NECESIDADES = [
    { id: 'n1', nombre: '[Necesidad 1]' }, { id: 'n2', nombre: '[Necesidad 2]' },
    { id: 'n3', nombre: '[Necesidad 3]' }, { id: 'n4', nombre: '[Necesidad 4]' },
    { id: 'n5', nombre: '[Necesidad 5]' }, { id: 'n6', nombre: '[Necesidad 6]' }
  ];
  var ARBOL = {
    necesidades: NECESIDADES,
    preguntas: [
      { id: 'q1', texto: '[Pregunta 1 del árbol]', inicial: true, opciones: [
        { id: 'o1', texto: '[Opción A]', siguiente: 'q2', necesidades: ['n1'] },
        { id: 'o2', texto: '[Opción B]', siguiente: 'q3', necesidades: ['n2'] },
        { id: 'o3', texto: '[Opción C]', siguiente: null, necesidades: ['n5'] } ] },
      { id: 'q2', texto: '[Pregunta 2 del árbol]', inicial: false, opciones: [
        { id: 'o4', texto: '[Opción A]', siguiente: 'q4', necesidades: ['n3'] },
        { id: 'o5', texto: '[Opción B]', siguiente: null, necesidades: [] } ] },
      { id: 'q3', texto: '[Pregunta 3 del árbol]', inicial: false, opciones: [
        { id: 'o6', texto: '[Opción A]', siguiente: null, necesidades: ['n4'] },
        { id: 'o7', texto: '[Opción B]', siguiente: null, necesidades: ['n3'] },
        { id: 'o8', texto: '[Opción C]', siguiente: null, necesidades: [] },
        { id: 'o9', texto: '[Opción D]', siguiente: null, necesidades: ['n6'] } ] },
      { id: 'q4', texto: '[Pregunta 4 del árbol]', inicial: false, opciones: [
        { id: 'o10', texto: '[Opción A]', siguiente: null, necesidades: [] },
        { id: 'o11', texto: '[Opción B]', siguiente: null, necesidades: ['n6'] } ] }
    ]
  };

  /* ---------- Almacenamiento local ----------
     localStorage puede fallar (modo privado, bloqueado): por eso
     todo va dentro de try/catch y siempre hay un valor por defecto. */
  var PREFIX = 'bugambilia:v2:'; // v2: catálogo de 21 productos con imágenes (ignora datos guardados de la v1)
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(PREFIX + key);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* sin almacenamiento: se usan los datos semilla */ }
      return clone(fallback);
    },
    set: function (key, value) {
      try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    reset: function () {
      try { ['productos', 'sucursales', 'arbol'].forEach(function (k) { window.localStorage.removeItem(PREFIX + k); }); }
      catch (e) { /* nada que limpiar */ }
    }
  };

  /* ---------- API de datos que usan las páginas ---------- */
  var db = {
    productos: function () { return store.get('productos', PRODUCTOS); },
    guardarProductos: function (lista) { return store.set('productos', lista); },
    sucursales: function () { return store.get('sucursales', SUCURSALES); },
    guardarSucursales: function (lista) { return store.set('sucursales', lista); },
    arbol: function () { return store.get('arbol', ARBOL); },
    guardarArbol: function (arbol) { return store.set('arbol', arbol); }
  };

  /* ---------- Utilidades ---------- */
  var util = {
    // Escapa texto antes de insertarlo como HTML (evita inyección de código)
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    // Rutas de imagen: se guardan relativas a la raíz; dentro de /admin se antepone ../
    src: function (ruta) {
      if (!ruta || /^(data:|https?:|blob:|\/)/.test(ruta)) return ruta || '';
      return (/\/admin\//.test(window.location.pathname) ? '../' : '') + ruta;
    },
    // <img> de producto (o el logo si no tiene foto). cls = clases extra
    imgProducto: function (prod, cls) {
      var ruta = prod.img || 'img/logo.webp';
      return '<img class="ph ph--product' + (prod.img ? '' : ' ph--logo') + (cls ? ' ' + cls : '') + '" src="' + util.esc(util.src(ruta)) +
        '" alt="" loading="lazy" decoding="async">';
    },
    linea: function (id) { return LINEAS.filter(function (l) { return l.id === id; })[0]; },
    precio: function (v) {
      if (v == null || v === '') return '[Precio]';
      return '$' + Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    contenido: function (v) { return v ? v : '[Contenido neto]'; },
    disponible: function (prod) { return prod.stock > 0; },
    param: function (name) { return new URLSearchParams(window.location.search).get(name); },
    slug: function (s) {
      return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item';
    },
    uid: function (prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    // Horario de hoy de una sucursal: "10:00 – 20:00", "Cerrado" o marcador
    horarioHoy: function (suc) {
      var idx = (new Date().getDay() + 6) % 7; // getDay(): 0 = domingo → lo pasamos a 0 = lunes
      var h = suc.horario[DIAS[idx]];
      return util.formatoHorario(h);
    },
    formatoHorario: function (h) {
      if (!h) return '[hh:mm – hh:mm]';
      if (h.cerrado) return 'Cerrado';
      if (h.abre && h.cierra) return h.abre + ' – ' + h.cierra;
      return '[hh:mm – hh:mm]';
    }
  };

  window.BG = {
    CONFIG: CONFIG, LINEAS: LINEAS, TIPOS: TIPOS, DIAS: DIAS, DIAS_LABEL: DIAS_LABEL,
    horarioVacio: horarioVacio, store: store, db: db, util: util
  };
})();
