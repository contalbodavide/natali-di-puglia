(function () {
  'use strict';
  var box = document.querySelector('[data-tlr-slideshow]');
  var cfg = (window.TLR_CONFIG || {}).slideshow;
  if (!box || !cfg || !cfg.immagini || !cfg.immagini.length) { return; }

  var pista = box.querySelector('.tlr-slide-pista'), dots = box.querySelector('.tlr-slide-dots');
  var btnPausa = box.querySelector('[data-tlr-pausa]');
  var riduci = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var n = cfg.immagini.length, i = 0, timer = null, inPausa = riduci;

  cfg.immagini.forEach(function (im, k) {
    var f = document.createElement('figure'); f.className = 'tlr-slide-f'; f.setAttribute('role', 'group');
    f.setAttribute('aria-roledescription', 'slide'); f.setAttribute('aria-label', (k + 1) + ' di ' + n);
    var img = new Image(); img.src = im.src; img.alt = im.alt || ''; img.decoding = 'async';
    if (k) { img.loading = 'lazy'; }
    f.appendChild(img); pista.appendChild(f);
    var d = document.createElement('button'); d.type = 'button'; d.className = 'tlr-slide-dot';
    d.setAttribute('aria-label', 'Vai all’immagine ' + (k + 1));
    d.addEventListener('click', function () { vai(k); riavvia(); });
    dots.appendChild(d);
  });

  function vai(k) {
    i = (k + n) % n;
    Array.prototype.forEach.call(pista.children, function (f, j) {
      f.classList.toggle('is-attiva', j === i); f.setAttribute('aria-hidden', j === i ? 'false' : 'true');
    });
    Array.prototype.forEach.call(dots.children, function (d, j) {
      d.classList.toggle('is-attiva', j === i);
      if (j === i) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
    });
  }
  function ferma() { clearInterval(timer); timer = null; }
  function parti() { ferma(); if (!inPausa && n > 1) { timer = setInterval(function () { vai(i + 1); }, cfg.intervallo || 6000); } }
  function riavvia() { if (!inPausa) { parti(); } }
  function stato() {
    btnPausa.setAttribute('aria-label', inPausa ? 'Avvia lo scorrimento automatico' : 'Metti in pausa lo scorrimento');
    btnPausa.classList.toggle('is-pausa', inPausa);
  }

  box.querySelector('.is-prev').addEventListener('click', function () { vai(i - 1); riavvia(); });
  box.querySelector('.is-next').addEventListener('click', function () { vai(i + 1); riavvia(); });
  btnPausa.addEventListener('click', function () { inPausa = !inPausa; stato(); parti(); });
  box.addEventListener('mouseenter', ferma);
  box.addEventListener('mouseleave', riavvia);
  box.addEventListener('focusin', ferma);
  box.addEventListener('focusout', riavvia);
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { vai(i - 1); riavvia(); } else if (e.key === 'ArrowRight') { vai(i + 1); riavvia(); }
  });

  var touchStartX = 0, touchStartY = 0;
  box.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      ferma();
    }
  }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (e.changedTouches && e.changedTouches.length === 1) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) { vai(i + 1); } else { vai(i - 1); }
      }
      riavvia();
    }
  }, { passive: true });

  box.classList.add('is-pronta'); stato(); vai(0); parti();
})();
