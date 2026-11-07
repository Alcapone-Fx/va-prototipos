/* Burbuja de feedback -> GitHub Issues */
(function () {
  var cfg = window.VA_FEEDBACK || {};
  var base = (document.currentScript && document.currentScript.src) || '';
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = base.replace(/js\/feedback\.js.*$/, 'css/feedback.css');
  document.head.appendChild(link);

  var TYPES = [['Me gusta', 'me-gusta'], ['Cambiar', 'cambiar'], ['Idea', 'idea'], ['Problema', 'problema']];
  var version = document.body.dataset.version || 'general';

  var fab = document.createElement('button');
  fab.className = 'fb-fab'; fab.type = 'button';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg><span>Dar opinión</span>';

  var panel = document.createElement('div');
  panel.className = 'fb-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Enviar opinión');
  panel.innerHTML =
    '<form novalidate>' +
    '<div class="fb-head"><strong>¿Qué opinas?</strong><button type="button" class="fb-x" aria-label="Cerrar">×</button></div>' +
    '<p class="fb-hint">Estás viendo la versión <b>' + version + '</b>. Tu opinión llega directo al equipo.</p>' +
    '<div class="fb-types" role="radiogroup" aria-label="Tipo de opinión">' +
    TYPES.map(function (t, i) {
      return '<label><input type="radio" name="tipo" value="' + t[1] + '"' + (i === 0 ? ' checked' : '') + '><span>' + t[0] + '</span></label>';
    }).join('') + '</div>' +
    '<label class="fb-l">Cuéntanos<textarea name="msg" rows="4" required placeholder="Escribe aquí lo que te gusta o lo que cambiarías…"></textarea></label>' +
    '<label class="fb-l">Tu nombre (opcional)<input name="nombre" type="text" autocomplete="name"></label>' +
    '<input name="website" tabindex="-1" autocomplete="off" class="fb-hp" aria-hidden="true">' +
    '<button class="fb-send" type="submit">Enviar opinión</button>' +
    '<p class="fb-status" role="status" aria-live="polite"></p>' +
    '</form>';
  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var form = panel.querySelector('form'), status = panel.querySelector('.fb-status');
  try { form.nombre.value = localStorage.getItem('va-nombre') || ''; } catch (e) {}

  function toggle(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', open);
    if (open) { status.textContent = ''; form.msg.focus(); }
  }
  fab.addEventListener('click', function () { toggle(panel.hidden); });
  panel.querySelector('.fb-x').addEventListener('click', function () { toggle(false); fab.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) toggle(false); });

  function sectionHere() {
    var el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    var s = el && el.closest('section[id],header[id],footer[id]');
    return s ? '#' + s.id : '(arriba de la página)';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = form.msg.value.trim();
    if (!msg) { status.textContent = 'Escribe tu opinión antes de enviar.'; form.msg.focus(); return; }
    if (form.website.value) return; // trampa para bots
    var tipo = form.tipo.value, nombre = form.nombre.value.trim();
    try { localStorage.setItem('va-nombre', nombre); } catch (e2) {}
    var firstLine = msg.split('\n')[0].slice(0, 70);
    var payload = {
      title: '[' + version + '] ' + firstLine,
      body: msg + '\n\n---\n' +
        '- Tipo: ' + tipo + '\n- Versión: ' + version + '\n- Sección a la vista: ' + sectionHere() + '\n' +
        '- Pantalla: ' + window.innerWidth + '×' + window.innerHeight + '\n- Página: ' + location.href + '\n' +
        '- Enviado por: ' + (nombre || 'anónimo'),
      labels: ['feedback', 'v-' + version, tipo],
      website: ''
    };
    var btn = form.querySelector('.fb-send');
    btn.disabled = true;

    function fallback() {
      var url = 'https://github.com/' + cfg.repo + '/issues/new?title=' + encodeURIComponent(payload.title) +
        '&body=' + encodeURIComponent(payload.body) + '&labels=' + encodeURIComponent(payload.labels.join(','));
      window.open(url, '_blank', 'noopener');
      status.textContent = 'Se abrió GitHub con tu opinión lista. Solo pulsa “Submit new issue”.';
      btn.disabled = false;
    }
    if (!cfg.endpoint) { fallback(); return; }
    status.textContent = 'Enviando…';
    fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error('fail');
        status.textContent = '¡Gracias! Tu opinión quedó registrada (#' + res.j.number + ').';
        form.msg.value = ''; btn.disabled = false;
        setTimeout(function () { toggle(false); }, 2200);
      })
      .catch(function () { fallback(); });
  });
})();
