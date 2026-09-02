/* Centa site: form states, sticky CTA visibility, analytics notice. No frameworks. */
(function () {
  'use strict';
  var cfg = window.CENTA || {};

  // ---- Support form: validation, loading state, submit -------------------
  var form = document.querySelector('form[data-form]');
  if (form) {
    var status = form.querySelector('.status');
    var button = form.querySelector('button[type="submit"]');
    var fields = {
      email: { el: form.querySelector('[name="email"]'), test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, msg: 'Enter a valid email so we can reply.' },
      message: { el: form.querySelector('[name="message"]'), test: function (v) { return v.trim().length >= 10; }, msg: 'Tell us a little more (at least 10 characters).' },
    };

    function setError(key, show) {
      var wrap = fields[key].el.closest('.field');
      wrap.classList.toggle('has-error', show);
      fields[key].el.setAttribute('aria-invalid', show ? 'true' : 'false');
    }
    function validate() {
      var ok = true;
      Object.keys(fields).forEach(function (k) {
        var bad = !fields[k].test(fields[k].el.value || '');
        setError(k, bad);
        if (bad) ok = false;
      });
      return ok;
    }
    Object.keys(fields).forEach(function (k) {
      fields[k].el.addEventListener('input', function () { if (fields[k].el.closest('.field').classList.contains('has-error')) validate(); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-error');
      if (!validate()) {
        status.textContent = 'Fix the highlighted fields and try again.';
        status.classList.add('is-error');
        var first = form.querySelector('.has-error input, .has-error textarea');
        if (first) first.focus();
        return;
      }
      // Honeypot: bots fill hidden fields.
      var hp = form.querySelector('[name="website"]');
      if (hp && hp.value) { window.location.href = form.dataset.thanks; return; }

      if (!cfg.formEndpoint) {
        // No endpoint configured yet: fall back to email.
        var subject = encodeURIComponent('Centa support');
        var body = encodeURIComponent(fields.message.el.value + '\n\nfrom: ' + fields.email.el.value);
        window.location.href = 'mailto:' + cfg.contactEmail + '?subject=' + subject + '&body=' + body;
        return;
      }

      button.classList.add('is-loading');
      button.disabled = true;
      status.textContent = 'Sending…';
      fetch(cfg.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw new Error('Request failed (' + r.status + ')'); window.location.href = form.dataset.thanks; })
        .catch(function (err) {
          status.textContent = 'Could not send: ' + err.message + '. Email us instead at ' + cfg.contactEmail + '.';
          status.classList.add('is-error');
          button.classList.remove('is-loading');
          button.disabled = false;
        });
    });
  }

  // ---- Analytics (cookieless) + notice ----------------------------------------
  if (cfg.analytics && cfg.analytics.domain) {
    var s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', cfg.analytics.domain);
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
    var notice = document.querySelector('.notice');
    try {
      if (notice && !localStorage.getItem('centa-notice')) {
        notice.classList.add('is-visible');
        notice.querySelector('button').addEventListener('click', function () {
          notice.classList.remove('is-visible');
          localStorage.setItem('centa-notice', '1');
        });
      }
    } catch (e) { /* storage blocked: leave the notice visible */ if (notice) notice.classList.add('is-visible'); }
  }

  // ---- Sticky CTA hides while the hero CTA is on screen ----------------------
  var sticky = document.querySelector('.sticky-cta');
  var heroCta = document.querySelector('.hero .cta');
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      sticky.style.opacity = entries[0].isIntersecting ? '0' : '1';
      sticky.style.pointerEvents = entries[0].isIntersecting ? 'none' : 'auto';
    }, { threshold: 0.2 }).observe(heroCta);
  }
})();
