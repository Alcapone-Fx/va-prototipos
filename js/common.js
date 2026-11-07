/* Selector de versión, menú móvil e idioma básico (ES/EN) */
(function () {
  var VERSIONS = [
    ['atrevido', '1', 'Atrevido'],
    ['editorial', '2', 'Editorial'],
    ['series', '3', 'Series'],
    ['mosaico', '4', 'Mosaico']
  ];
  var cur = document.body.dataset.version;
  try { localStorage.setItem('va-version', cur); } catch (e) {}

  /* Selector */
  var bar = document.createElement('nav');
  bar.className = 'vsw';
  bar.setAttribute('aria-label', 'Cambiar versión del diseño');
  bar.innerHTML = '<span class="vsw-label">Diseño</span>' + VERSIONS.map(function (v) {
    return '<a href="home-' + v[0] + '.html"' + (v[0] === cur ? ' aria-current="page"' : '') +
      ' title="Tecla ' + v[1] + '"><b>' + v[1] + '</b>' + v[2] + '</a>';
  }).join('');
  document.body.appendChild(bar);
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/input|textarea|select/i.test((e.target || {}).tagName || '')) return;
    var v = VERSIONS.filter(function (x) { return x[1] === e.key; })[0];
    if (v && v[0] !== cur) location.href = 'home-' + v[0] + '.html';
  });

  /* Menú móvil */
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('[data-nav]');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* Idioma básico: solo textos fijos con data-en */
  var lang = 'es';
  try { lang = localStorage.getItem('va-lang') || 'es'; } catch (e) {}
  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.es) el.dataset.es = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.textContent = lang === 'en' ? 'ES' : 'EN';
      b.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
    });
  }
  document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = lang === 'en' ? 'es' : 'en';
      try { localStorage.setItem('va-lang', lang); } catch (e) {}
      apply();
    });
  });
  apply();
})();
