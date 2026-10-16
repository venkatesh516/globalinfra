(function () {
  'use strict';
  var C = window.GIP_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Header scroll shadow ---------- */
  var header = $('.site-header');
  var hasHero = !!$('.hero');
  function onScroll() { if (header) header.classList.toggle('scrolled', !hasHero || window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger'), mm = $('.mobile-menu');
  function setMenu(open) {
    if (!burger || !mm) return;
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mm.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); $$('.has-dd.open').forEach(function (d) { d.classList.remove('open'); $('button', d).setAttribute('aria-expanded', 'false'); }); }
  });
  $$('.m-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open);
      var sub = b.nextElementSibling;
      sub.style.maxHeight = open ? sub.scrollHeight + 'px' : '0';
    });
  });
  $$('.mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 980) setMenu(false); });

  /* ---------- Desktop dropdowns (click/keyboard friendly) ---------- */
  $$('.has-dd > button').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.parentElement, open = !li.classList.contains('open');
      $$('.has-dd.open').forEach(function (d) { d.classList.remove('open'); $('button', d).setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dd')) $$('.has-dd.open').forEach(function (d) { d.classList.remove('open'); $('button', d).setAttribute('aria-expanded', 'false'); });
  });

  /* Reveal-on-scroll, parallax, counters, theme toggle and hero video live in effects.js */

  /* ---------- Image fallback (hide broken img; gradient shows) ---------- */
  document.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.target.style.opacity = '0';
  }, true);

  /* ---------- Contact details from config ---------- */
  function setText(key, val, href) {
    if (!val) return;
    $$('[data-contact="' + key + '"]').forEach(function (el) {
      el.textContent = val; el.classList.remove('placeholder');
      if (href && el.tagName === 'A') el.href = href;
    });
  }
  setText('phone', C.phone, 'tel:' + (C.phone || '').replace(/\s/g, ''));
  setText('email', C.email, 'mailto:' + C.email);
  setText('address', C.address);
  setText('hours', C.hours);
  setText('whatsapp', C.whatsapp ? '+' + C.whatsapp.replace(/^\+/, '') : '', C.whatsapp ? 'https://wa.me/' + C.whatsapp.replace(/\D/g, '') : '');
  $$('a[data-act="call"]').forEach(function (a) { if (C.phone) a.href = 'tel:' + C.phone.replace(/\s/g, ''); });
  $$('a[data-act="wa"]').forEach(function (a) {
    if (C.whatsapp) { a.href = 'https://wa.me/' + C.whatsapp.replace(/\D/g, ''); a.target = '_blank'; a.rel = 'noopener'; }
  });
  var mapBox = $('#map-box');
  if (mapBox && C.mapEmbedUrl) {
    mapBox.className = '';
    mapBox.innerHTML = '<iframe title="Office location map" src="' + C.mapEmbedUrl.replace(/"/g, '&quot;') +
      '" width="100%" height="380" style="border:0;border-radius:14px" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
  }

  /* ---------- Enquiry form ---------- */
  var form = $('#enquiry-form');
  if (form) {
    var started = Date.now(), sending = false, msg = $('.form-msg', form);
    var btn = $('button[type=submit]', form);
    function show(type, text) { msg.className = 'form-msg show ' + type; msg.textContent = text; msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    function fieldErr(name, text) {
      var f = $('[name=' + name + ']', form).closest('.field'); if (!f) return;
      f.classList.toggle('invalid', !!text);
      var e = $('.err', f); if (e) e.textContent = text || '';
    }
    function validate() {
      var ok = true, v = function (n) { return form.elements[n].value.trim(); };
      var name = v('name'), mobile = v('mobile').replace(/[\s-]/g, ''), email = v('email'), interest = v('interest');
      var e1 = name.length < 2 ? 'Please enter your full name.' : '';
      var e2 = !/^(\+?91)?[6-9]\d{9}$/.test(mobile) ? 'Enter a valid 10-digit Indian mobile number.' : '';
      var e3 = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : '';
      var e4 = !interest ? 'Please choose a property interest.' : '';
      fieldErr('name', e1); fieldErr('mobile', e2); fieldErr('email', e3); fieldErr('interest', e4);
      if (e1 || e2 || e3 || e4) ok = false;
      var cons = form.elements['consent'], ce = $('#consent-err');
      if (!cons.checked) { ce.style.display = 'block'; ok = false; } else ce.style.display = 'none';
      return ok;
    }
    ['name', 'mobile', 'email', 'interest'].forEach(function (n) {
      form.elements[n].addEventListener('blur', validate);
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (sending) return;
      msg.className = 'form-msg';
      if (!validate()) { var first = $('.field.invalid input, .field.invalid select', form); if (first) first.focus(); return; }
      // spam protection: honeypot + minimum fill time
      if (form.elements['website'].value || Date.now() - started < 2500) { show('fail', 'Submission blocked. Please try again.'); return; }
      if (!C.formEndpoint) {
        show('info', 'Your details are valid, but this demo form is not connected to a backend yet, so nothing was sent. Please call or WhatsApp us once contact details are live.');
        return;
      }
      sending = true; btn.disabled = true; var old = btn.textContent; btn.textContent = 'Sending…';
      var data = {
        name: form.elements['name'].value.trim(),
        mobile: form.elements['mobile'].value.trim(),
        email: form.elements['email'].value.trim(),
        interest: form.elements['interest'].value,
        message: form.elements['message'].value.trim(),
        page: location.href
      };
      fetch(C.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          show('ok', 'Thank you! Your enquiry has been received. Our team will contact you shortly.');
          form.reset(); started = Date.now();
        })
        .catch(function () { show('fail', 'Sorry, we could not send your enquiry. Please try again or contact us directly.'); })
        .then(function () { sending = false; btn.disabled = false; btn.textContent = old; });
    });
    // preselect interest from ?interest=
    var q = new URLSearchParams(location.search).get('interest');
    if (q) form.elements['interest'].value = q;
  }

  /* ---------- Projects rendering (data-driven) ---------- */
  var P = window.GIP_PROJECTS || [];
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  var root = (document.body.getAttribute('data-root') || '');
  function card(p) {
    return '<article class="cat-card"><div class="img-box">' + (p.image ? '<img loading="lazy" src="' + esc(p.image) + '" alt="' + esc(p.name) + '">' : '') +
      '</div><div class="cat-body"><h3>' + esc(p.name) + '</h3><p>' + esc(p.location || '') + '</p><p>' + esc(p.summary || '') +
      '</p><a class="link-arrow" href="' + root + 'projects/project/index.html?id=' + encodeURIComponent(p.id) + '">View Details →</a></div></article>';
  }
  $$('[data-projects]').forEach(function (box) {
    var cat = box.getAttribute('data-projects');
    var list = P.filter(function (p) { return p.category === cat; });
    var empty = $('.empty-state', box.parentElement);
    if (list.length) {
      box.innerHTML = list.map(card).join('');
      if (empty) empty.style.display = 'none';
    }
  });
  var detail = $('#project-detail');
  if (detail) {
    var id = new URLSearchParams(location.search).get('id');
    var p = P.filter(function (x) { return x.id === id; })[0];
    if (!p) {
      detail.innerHTML = '<div class="empty"><h3>Project not found</h3><p>No verified project data is available for this link yet.</p><a class="btn btn-green" href="' + root + 'projects/index.html">Back to Projects</a></div>';
    } else {
      document.title = p.name + ' | GLOBAL INFRA PROJECTS';
      var list = function (t, a) { return a && a.length ? '<h2>' + t + '</h2><ul class="checks">' + a.map(function (i) { return '<li>• ' + esc(i) + '</li>'; }).join('') + '</ul>' : ''; };
      detail.innerHTML = '<h1>' + esc(p.name) + '</h1><p class="lead">' + esc(p.location || '') + '</p>' +
        (p.gallery && p.gallery.length ? '<div class="grid grid-3" style="margin:24px 0">' + p.gallery.map(function (g) { return '<div class="img-box"><img loading="lazy" src="' + esc(g) + '" alt="' + esc(p.name) + ' gallery image"></div>'; }).join('') + '</div>' : '') +
        (p.overview ? '<h2>Overview</h2><p>' + esc(p.overview) + '</p>' : '') +
        list('Plot Sizes / Configurations', p.configurations) + list('Amenities & Infrastructure', p.amenities) +
        (p.pricing ? '<h2>Pricing</h2><p>' + esc(p.pricing) + '</p>' : '') +
        (p.approvals ? '<h2>Approvals & Registration</h2><p>' + esc(p.approvals) + '</p>' : '') +
        (p.mapEmbedUrl ? '<h2>Map & Directions</h2><iframe title="Project map" src="' + esc(p.mapEmbedUrl) + '" width="100%" height="380" style="border:0;border-radius:14px" loading="lazy"></iframe>' : '') +
        '<div class="btn-row" style="margin-top:28px"><a class="btn btn-green" href="' + root + 'contact-us/index.html#enquiry">Enquire About This Project</a></div>';
    }
  }
})();
