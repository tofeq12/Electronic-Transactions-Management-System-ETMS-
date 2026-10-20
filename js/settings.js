// settings.js — Settings screen: saved preferences, password form validation, demo backup (front-end only)
(function () {
  'use strict';
  const KEY = 'itqan_settings';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = data => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { } };

  function note(el, text, kind) {
    el.textContent = text;
    el.classList.toggle('is-ok', kind === 'ok');
    el.classList.toggle('is-error', kind === 'error');
  }

  function init() {
    const root = document.querySelector('.st-main');
    if (!root || root.dataset.stBound) return;
    root.dataset.stBound = '1';
    const $ = id => root.querySelector('#' + id);

    // ---- System preferences (saved on change) ----
    const prefs = { lang: $('st-lang'), timezone: $('st-timezone'), dateFormat: $('st-date-format') };
    const sysNote = $('st-system-note');
    const saved = load();
    prefs.lang.value = window.Lang ? Lang.get() : 'ar';
    if (saved.timezone) prefs.timezone.value = saved.timezone;
    if (saved.dateFormat) prefs.dateFormat.value = saved.dateFormat;
    Object.entries(prefs).forEach(([name, el]) => el.addEventListener('change', () => {
      const data = load(); data[name] = el.value; save(data);
      if (name === 'lang' && window.Lang) Lang.set(el.value);
      note(sysNote, 'تم حفظ الإعدادات', 'ok');
    }));

    // ---- Change password ----
    const form = $('st-password-form'), pwNote = $('st-password-note');
    const [current, next, confirm] = ['st-current', 'st-new', 'st-confirm'].map($);
    const mark = (el, bad) => el.parentNode.classList.toggle('is-invalid', bad);
    form.addEventListener('submit', e => {
      e.preventDefault();
      [current, next, confirm].forEach(el => mark(el, false));
      let error = '';
      if (!current.value) { mark(current, true); error = 'أدخل كلمة المرور الحالية.'; }
      else if (next.value.length < 8 || !/\d/.test(next.value) || !/\D/.test(next.value)) { mark(next, true); error = 'كلمة المرور الجديدة 8 أحرف على الأقل وتجمع بين الأرقام والحروف.'; }
      else if (next.value !== confirm.value) { mark(confirm, true); error = 'تأكيد كلمة المرور غير مطابق.'; }
      if (error) return note(pwNote, error, 'error');
      form.reset();
      note(pwNote, 'تم حفظ التغييرات بنجاح', 'ok');
    });

    // ---- Backup: downloads the saved settings as a JSON file (no server in this front-end project) ----
    const backupNote = $('st-backup-note');
    $('st-backup').addEventListener('click', () => {
      const stamp = new Date().toISOString();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ createdAt: stamp, settings: load() }, null, 2)], { type: 'application/json' }));
      a.download = `itqan-backup-${stamp.slice(0, 10)}.json`;
      a.addEventListener('click', e => e.stopPropagation());   // keep the page-router (motion.js) out of downloads
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      note(backupNote, 'تم إنشاء النسخة الاحتياطية', 'ok');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
