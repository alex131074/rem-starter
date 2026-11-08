/* Рем-Стартер: настройки страницы и кнопка «Повернуть ключ». */
window.CFG = {
  tel: 'Позвоните: <a href="tel:+79254591050">+7 (925) 459-10-50</a> или напишите в <a href="https://wa.me/79254591050" target="_blank" rel="noopener">WhatsApp</a>.',
  hours: [null, [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080], [600, 840]],
  rise: '.sec h2,.sec .sub,.sy,.idea-n,.facts li,.clock li,.how-f,.steps li,.pc,.dict div,.score,.rev,.maplink,.form',
  init: function ($) {
    var key = $('key'), kt = $('keyT'), ks = $('keyS');
    if (!window.G3 || !G3.start) { key.hidden = true; return; }
    key.addEventListener('click', function () {
      G3.start(function (s) {
        if (s === 'crank') { key.classList.add('on'); kt.textContent = 'Крутит…'; ks.textContent = 'Реле щёлкнуло, бендикс вошёл в венец и прокручивает маховик.'; }
        if (s === 'run') { kt.textContent = 'Завёлся'; ks.textContent = 'Двигатель подхватил – бендикс вышел из зацепления. Так и должно быть.'; }
        if (s === 'idle') { key.classList.remove('on'); kt.textContent = 'Повернуть ключ'; ks.textContent = 'Если в жизни на этом месте только «щёлк» – привозите стартер.'; }
      });
    });
  }
};

/* Общее поведение: открыто ли сейчас (время Коломны, UTC+3), 3D на первом экране, появление блоков, отзывы, форма, кнопки на телефоне. */
(function () {
  var C = window.CFG, FORM_ENDPOINT = ''; /* {{адрес приёма заявок}} */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  function all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var hero = $('hero'), bar = $('bar'), contacts = $('contacts');

  /* часы работы: C.hours[день недели 0–6, с воскресенья] = [открытие, закрытие] в минутах или null */
  var now = $('now');
  if (now && C.hours) {
    var o = new Date(Date.now() + 3 * 3600000), d = o.getUTCDay(), m = o.getUTCHours() * 60 + o.getUTCMinutes();
    var fmt = function (x) { return Math.floor(x / 60) + ':' + ('0' + x % 60).slice(-2); };
    var t = C.hours[d], open = t && m >= t[0] && m < t[1], txt;
    if (open) txt = 'Сейчас открыто до ' + fmt(t[1]);
    else if (t && m < t[0]) txt = 'Сегодня откроемся в ' + fmt(t[0]);
    else { for (var k = 1; k < 8; k++) { var n = C.hours[(d + k) % 7]; if (n) { txt = (k === 1 ? 'Завтра с ' : ['В воскресенье', 'В понедельник', 'Во вторник', 'В среду', 'В четверг', 'В пятницу', 'В субботу'][(d + k) % 7] + ' с ') + fmt(n[0]); break; } } }
    now.textContent = txt; now.classList.toggle('off', !open); now.hidden = false;
  }

  function update() {
    var H = innerHeight, hr = hero.getBoundingClientRect(), cr = contacts.getBoundingClientRect();
    if (window.G3) { G3.live(hr.bottom > 0); if (G3.scroll) G3.scroll(Math.max(0, Math.min(1, -hr.top / Math.max(1, hr.height)))); }
    if (bar) bar.classList.toggle('on', hr.bottom < H * .3 && cr.top > H * .6);
    if (C.onScroll) C.onScroll(H);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } }, { passive: true });
  addEventListener('resize', update);
  update();

  if (!reduce && 'IntersectionObserver' in window) {
    var rise = all(C.rise);
    rise.forEach(function (el) { el.classList.add('rise'); });
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rise.forEach(function (el) { seen.observe(el); });
  }

  var more = $('revMore'), btn = $('revBtn');
  if (btn) btn.addEventListener('click', function () {
    more.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); btn.hidden = true;
    all('.rise', more).forEach(function (el) { el.classList.add('in'); });
  });

  var form = $('form'), fm = $('formMsg');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ph = form.elements.phone, ok = ph.value.replace(/\D/g, '').length >= 10;
    ph.classList.toggle('invalid', !ok);
    if (!ok) { fm.textContent = 'Укажите телефон, чтобы мы могли перезвонить.'; ph.focus(); return; }
    if (!FORM_ENDPOINT) { fm.innerHTML = 'Заявки с сайта пока не подключены, поэтому ваш номер не отправлен. ' + C.tel; return; }
    fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form) })
      .then(function (r) { if (!r.ok) throw 0; fm.textContent = 'Заявка принята, перезвоним.'; form.reset(); })
      .catch(function () { fm.innerHTML = 'Заявка не отправилась. ' + C.tel; });
  });
  if (C.init) C.init($, all, reduce);
})();
