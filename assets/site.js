// Westeffects shared script: form capture, Westlight lightbox, optional print shop.
(function () {
  // ---- Forms: saved to Airtable through a Netlify Function ----
  document.querySelectorAll('form.cap').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.msg');
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      fetch('/.netlify/functions/capture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d && res.d.error || 'bad');
          form.reset();
          if (msg) { msg.className = 'msg'; msg.textContent = form.getAttribute('data-success') || 'Thanks, you are on the list.'; }
        })
        .catch(function (err) {
          if (msg) { msg.className = 'msg err'; msg.textContent = (err && err.message && err.message !== 'bad' && err.message !== 'Failed to fetch') ? err.message : 'Something went wrong. Please email westworks@westeffects.com instead.'; }
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
  var buy = document.getElementById('lbBuy');
  var cur = 0, lastFocus = null, shop = null;

  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    var t = tiles[cur];
    img.src = t.dataset.full;
    img.alt = t.dataset.title;
    cap.textContent = t.dataset.title + ' — © ' + t.dataset.credit;
    if (buy) buy.hidden = !(shop && shop.open && shop.photos.indexOf(t.dataset.id) > -1);
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

  // ---- Print shop (only appears when the shop is switched on server-side) ----
  fetch('/.netlify/functions/shop').then(function (r) { return r.json(); }).then(function (s) {
    if (!s || !s.open || !buy) return;
    shop = s;
    var sel = document.getElementById('lbSize');
    sel.innerHTML = s.sizes.map(function (z) {
      return '<option value="' + z.id + '">' + z.label + ' — $' + (z.cents / 100).toFixed(0) + ' AUD</option>';
    }).join('');
    var note = document.getElementById('lbShip');
    note.textContent = '+ $' + (s.shipping.cents / 100).toFixed(0) + ' ' + s.shipping.label;
    // Show the "Prints available" band on the page
    var ready = document.getElementById('printsLive');
    if (ready) ready.hidden = false;
    var soon = document.getElementById('prints');
    if (soon) soon.hidden = true;
    if (lb.classList.contains('open')) show(cur);
  }).catch(function () { /* shop stays hidden */ });

  var go = document.getElementById('lbGo');
  if (go) go.addEventListener('click', function () {
    var t = tiles[cur];
    go.disabled = true;
    var m = document.getElementById('lbBuyMsg'); m.textContent = '';
    fetch('/.netlify/functions/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo: t.dataset.id, size: document.getElementById('lbSize').value })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.url) { window.location.href = d.url; } else { throw new Error(d.error || 'bad'); }
    }).catch(function (err) {
      m.textContent = (err && err.message && err.message !== 'bad') ? err.message : 'Could not start checkout. Please try again.';
      go.disabled = false;
    });
  });

  if (/[?&]order=thanks/.test(location.search)) {
    var b = document.getElementById('thanks'); if (b) b.hidden = false;
  }
})();
