/* Visual effects: theme toggle, scroll progress, reveal animations, parallax,
   counters, card spotlight and hero video controls. Pure JS, no libraries. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- Light / dark theme ---------- */
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function applyTheme(t, save) {
    root.setAttribute('data-theme', t);
    var m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', t === 'dark' ? '#0e1814' : '#173D32');
    $$('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark');
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    if (save) { try { localStorage.setItem('gip-theme', t); } catch (e) {} }
  }
  applyTheme(currentTheme(), false);
  $$('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true); });
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onMq = function (e) { var saved = null; try { saved = localStorage.getItem('gip-theme'); } catch (x) {} if (!saved) applyTheme(e.matches ? 'dark' : 'light', false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
  }

  /* ---------- Stagger delays for grouped items ---------- */
  var groups = '.grid, .contact-cards, .mini-quotes, .chips, .footer-grid';
  $$(groups).forEach(function (g) {
    $$(':scope > .reveal', g).forEach(function (el, i) { el.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'); });
  });
  // slide direction for split layouts (text one way, image the other)
  $$('.split').forEach(function (s) {
    var rev = s.classList.contains('rev');
    var kids = $$(':scope > .reveal', s);
    kids.forEach(function (k) {
      var isImg = k.classList.contains('split-img');
      if (isImg) k.setAttribute('data-anim', rev ? 'right' : 'left');
      else k.setAttribute('data-anim', rev ? 'left' : 'right');
    });
  });
  $$('.vm-card').forEach(function (c, i) { if (!c.hasAttribute('data-anim')) c.setAttribute('data-anim', i % 2 ? 'right' : 'left'); });
  $$('.quote-inline, .cta-block, .map-box, .empty').forEach(function (c) { if (!c.hasAttribute('data-anim')) c.setAttribute('data-anim', 'zoom'); });

  /* ---------- Reveal on scroll ---------- */
  var targets = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Counters ---------- */
  function runCounter(el) {
    var end = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end + suffix; return; }
    var t0 = null, dur = 1600;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { runCounter(x.target); co.unobserve(x.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(function (c) { c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || ''); });

  /* ---------- Scroll progress + parallax ---------- */
  var bar = $('.scroll-progress'), par = $$('.hero > img, .hero-video, .quote-banner > img'), ticking = false;
  function frame() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    if (!reduce) {
      par.forEach(function (el) {
        var box = el.parentElement.getBoundingClientRect();
        if (box.bottom < -50 || box.top > window.innerHeight + 50) return;
        var offset = (box.top + box.height / 2 - window.innerHeight / 2) * -0.12;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);
  frame();

  /* ---------- Card spotlight following the cursor ---------- */
  $$('.card, .vm-card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Hero video ---------- */
  var video = $('.hero-video');
  if (video) {
    var C = window.GIP_CONFIG || {};
    if (C.heroVideo) { video.src = C.heroVideo; video.load(); }
    var ctrl = $('.vid-ctrl');
    function setCtrl(paused) {
      if (!ctrl) return;
      ctrl.classList.toggle('paused', paused);
      ctrl.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
    }
    video.addEventListener('playing', function () { video.classList.add('ready'); setCtrl(false); });
    video.addEventListener('error', function () { video.style.display = 'none'; if (ctrl) ctrl.style.display = 'none'; }, true);
    var srcEl = $('source', video);
    if (srcEl) srcEl.addEventListener('error', function () { video.style.display = 'none'; if (ctrl) ctrl.style.display = 'none'; });
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); setCtrl(true); }
    else {
      var pr = video.play();
      if (pr && pr.catch) pr.catch(function () { setCtrl(true); });
    }
    if (ctrl) ctrl.addEventListener('click', function () {
      if (video.paused) { video.play(); setCtrl(false); } else { video.pause(); setCtrl(true); }
    });
    // save battery: pause when hero is off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (reduce || (ctrl && ctrl.classList.contains('paused') && video.paused)) return;
          if (!x.isIntersecting) video.pause(); else video.play().catch(function () {});
        });
      }, { threshold: 0.05 }).observe(video.parentElement);
    }
  }
})();
