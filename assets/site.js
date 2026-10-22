// Westeffects shared script: Netlify Forms submit + Westlight lightbox.
(function () {
  // ---- Forms (Netlify Forms, submitted in the background) ----
  document.querySelectorAll('form.cap').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.msg');
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error('bad');
          form.reset();
          if (msg) { msg.className = 'msg'; msg.textContent = form.getAttribute('data-success') || 'Thanks, you are on the list.'; }
        })
        .catch(function () {
          if (msg) { msg.className = 'msg err'; msg.textContent = 'Something went wrong. Please email westworks@westeffects.com instead.'; }
        })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  });

  // ---- Westlight lightbox ----
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var lb = document.getElementById('lb');
  if (!tiles.length || !lb) return;
  var img = document.getElementById('lbImg');
  var cap = document.getElementById('lbCap');
  var cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    var t = tiles[cur];
    img.src = t.dataset.full;
    img.alt = t.dataset.title;
    cap.textContent = t.dataset.title + ' — © ' + t.dataset.credit;
  }
  function open(i) { lastFocus = document.activeElement; show(i); lb.classList.add('open'); lb.querySelector('.x').focus(); }
  function close() { lb.classList.remove('open'); img.src = ''; if (lastFocus) lastFocus.focus(); }
  tiles.forEach(function (t, i) { t.addEventListener('click', function () { open(i); }); });
  lb.querySelector('.x').addEventListener('click', close);
  lb.querySelector('.p').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.n').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
