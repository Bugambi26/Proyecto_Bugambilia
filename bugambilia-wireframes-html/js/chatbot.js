/* =========================================================
   chatbot.js — widget de recomendación (árbol + IA)
   ---------------------------------------------------------
   Flujo (igual al diagrama de flujo de la Fase 1):
   1. Carga la pregunta inicial del árbol.
   2. El visitante elige una opción → se suman sus necesidades.
   3. Si la opción lleva a otra pregunta, se repite.
   4. Al terminar, se buscan productos activos con esas necesidades.
   5a. Hay productos  → recomendación (estado B).
   5b. No hay        → sugerir diagnóstico + Instagram (estado C).

   La redacción de la IA generativa está simulada en
   redactarRecomendacion(). En producción esa función hará un
   fetch() al backend, y el backend llamará al LLM con el
   contexto (necesidades + productos candidatos).
   No se guarda nada de la conversación.
   ========================================================= */
(function () {
  'use strict';
  var BG = window.BG, U = BG.util, esc = U.esc;

  /* ---------- Estructura del widget ---------- */
  var bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'chat-bubble';
  bubble.setAttribute('aria-label', 'Abrir asistente de recomendación');
  bubble.setAttribute('aria-expanded', 'false');
  bubble.setAttribute('aria-controls', 'chat');
  bubble.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';

  var panel = document.createElement('section');
  panel.id = 'chat';
  panel.className = 'chat';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Asistente Bugambilia');
  panel.hidden = true;
  panel.innerHTML =
    '<header class="chat__head">' +
      '<div class="row gap-10"><img class="ph ph--round chat__avatar" src="' + esc(U.src('img/logo.webp')) + '" alt="" aria-hidden="true">' +
      '<div class="stack"><strong style="font-size: 15px">Asistente Bugambilia</strong>' +
      '<span class="chat__step" style="font-size: 12px; color: var(--muted)"></span></div></div>' +
      '<button type="button" class="chat__close" aria-label="Cerrar chat">×</button>' +
    '</header>' +
    '<div class="chat__progress" aria-hidden="true"><span></span></div>' +
    '<div class="chat__log" aria-live="polite"></div>' +
    '<div class="chat__foot"></div>';

  document.body.appendChild(panel);
  document.body.appendChild(bubble);

  var log = panel.querySelector('.chat__log');
  var foot = panel.querySelector('.chat__foot');
  var stepLbl = panel.querySelector('.chat__step');
  var bar = panel.querySelector('.chat__progress > span');

  /* ---------- Estado de la conversación (solo en memoria) ---------- */
  var arbol, preguntaActual, numPregunta, necesidades, profundidad;

  function porId(id) { return arbol.preguntas.filter(function (q) { return q.id === id; })[0]; }

  // Profundidad máxima del árbol, para la barra de progreso
  function calcProfundidad(q, visitadas) {
    if (!q || visitadas[q.id]) return 0;
    visitadas[q.id] = true;
    var max = 0;
    q.opciones.forEach(function (o) { max = Math.max(max, calcProfundidad(porId(o.siguiente), Object.assign({}, visitadas))); });
    return 1 + max;
  }

  function botMsg(html) { var d = document.createElement('div'); d.className = 'msg-bot'; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function meMsg(text) { var d = document.createElement('div'); d.className = 'msg-me'; d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; }

  function iniciar() {
    arbol = BG.db.arbol();
    necesidades = [];
    numPregunta = 0;
    log.innerHTML = '';
    var inicial = arbol.preguntas.filter(function (q) { return q.inicial; })[0] || arbol.preguntas[0];
    profundidad = Math.max(1, calcProfundidad(inicial, {}));
    botMsg('¡Hola! Te haré unas preguntas para encontrar tu ritual ideal.');
    preguntar(inicial);
  }

  /* Estado A — pregunta del árbol */
  function preguntar(q) {
    preguntaActual = q;
    numPregunta++;
    stepLbl.textContent = 'Pregunta ' + numPregunta;
    bar.style.width = Math.min(100, (numPregunta / profundidad) * 100) + '%';
    botMsg(esc(q.texto));
    foot.className = 'chat__foot';
    foot.innerHTML = q.opciones.map(function (o) {
      return '<button type="button" class="btn btn--left" data-op="' + esc(o.id) + '" style="font-size: 14px">' + esc(o.texto) + '</button>';
    }).join('') + '<button type="button" class="btn-link" data-reiniciar style="font-size: 13px">Empezar de nuevo</button>';
    var first = foot.querySelector('[data-op]'); if (first) first.focus();
  }

  function elegir(opId) {
    var op = preguntaActual.opciones.filter(function (o) { return o.id === opId; })[0];
    if (!op) return;
    meMsg(op.texto);
    op.necesidades.forEach(function (n) { if (necesidades.indexOf(n) === -1) necesidades.push(n); });
    var sig = op.siguiente ? porId(op.siguiente) : null;
    if (sig) preguntar(sig); else terminar();
  }

  function terminar() {
    stepLbl.textContent = '';
    bar.style.width = '100%';
    var candidatos = BG.db.productos().filter(function (p) {
      return p.activo && p.necesidades.some(function (n) { return necesidades.indexOf(n) !== -1; });
    });
    if (candidatos.length) recomendar(candidatos.slice(0, 3)); else sinProductos();
  }

  /* Estado B — recomendación */
  function recomendar(prods) {
    botMsg(esc(redactarRecomendacion(prods)));
    prods.forEach(function (p) {
      var a = document.createElement('a');
      a.className = 'reco';
      a.href = 'producto.html?id=' + encodeURIComponent(p.id);
      a.innerHTML = U.imgProducto(p) + '<div class="stack" style="gap: 2px">' +
        '<span class="meta" style="font-size: 11px">' + esc(U.linea(p.linea).ritual) + '</span>' +
        '<strong style="font-size: 15px">' + esc(p.nombre) + '</strong>' +
        '<span style="font-size: 13px; text-decoration: underline">Ver detalle</span></div>';
      log.appendChild(a);
    });
    log.scrollTop = log.scrollHeight;
    foot.className = 'chat__foot chat__foot--row';
    foot.innerHTML = '<a href="sucursales.html" class="btn btn--primary" style="font-size: 14px">Dónde comprar</a>' +
      '<button type="button" class="btn" data-reiniciar style="font-size: 14px">Empezar de nuevo</button>';
  }

  // Simulación de la IA. En producción: fetch('/api/recomendar', { necesidades, productos })
  function redactarRecomendacion(prods) {
    var nombres = arbol.necesidades.filter(function (n) { return necesidades.indexOf(n.id) !== -1; }).map(function (n) { return n.nombre; });
    var ritual = U.linea(prods[0].linea).ritual;
    return '[Texto de la IA] Por lo que nos contaste (' + nombres.join(', ') + '), te recomendamos el ' + ritual +
      '. Estos productos del catálogo son los que mejor se ajustan a tu cabello:';
  }

  /* Estado C — ningún producto cubre la necesidad */
  function sinProductos() {
    botMsg('Por lo que nos cuentas, tu caso necesita una valoración personalizada.');
    botMsg('Te recomendamos agendar una cita de diagnóstico para diseñar un tratamiento según tu situación.');
    var box = document.createElement('div');
    box.className = 'instagram-box';
    box.innerHTML = '<span style="font-size: 14px; font-weight: 600">Agenda por mensaje directo</span>' +
      '<a href="' + esc(BG.CONFIG.instagram) + '" class="btn btn--primary" target="_blank" rel="noopener" style="font-size: 14px">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#FFFFFF"/></svg>' +
      'Escríbenos en Instagram</a>';
    log.appendChild(box);
    log.scrollTop = log.scrollHeight;
    foot.className = 'chat__foot';
    foot.innerHTML = '<button type="button" class="btn btn--block" data-reiniciar style="font-size: 14px">Empezar de nuevo</button>';
  }

  /* ---------- Abrir / cerrar ---------- */
  var ultimoFoco = null;
  function abrir() {
    if (!panel.hidden) return;
    ultimoFoco = document.activeElement;
    panel.hidden = false;
    bubble.setAttribute('aria-expanded', 'true');
    iniciar();
  }
  function cerrar() {
    panel.hidden = true;
    bubble.setAttribute('aria-expanded', 'false');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  bubble.addEventListener('click', function () { if (panel.hidden) abrir(); else cerrar(); });
  panel.querySelector('.chat__close').addEventListener('click', cerrar);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) cerrar(); });
  // Cualquier botón con data-open-chat abre el asistente
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-chat]')) { e.preventDefault(); abrir(); }
  });
  foot.addEventListener('click', function (e) {
    var op = e.target.closest('[data-op]');
    if (op) return elegir(op.dataset.op);
    if (e.target.closest('[data-reiniciar]')) iniciar();
  });
})();
