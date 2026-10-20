// =========================================================
// auth.js — Login / Register: show-hide password, validation, submit
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-7 0-11-7-11-7a19 19 0 0 1 5-5.7M9.9 5.2A10 10 0 0 1 12 5c7 0 11 7 11 7a19 19 0 0 1-3.2 4.2M1 1l22 22"/></svg>';

  document.querySelectorAll('.ax-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const hide = input.type === 'password';
      input.type = hide ? 'text' : 'password';
      btn.innerHTML = hide ? EYE_OFF : EYE;
      btn.setAttribute('aria-label', hide ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
    });
  });

  const rules = {
    fullname: v => v.trim().length >= 3 || 'أدخل اسمك الكامل (3 أحرف على الأقل)',
    user: v => v.trim().length >= 3 && (!v.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      || 'أدخل اسم مستخدم أو بريداً إلكترونياً صحيحاً',
    phone: v => /^\+?\d{9,15}$/.test(v.replace(/[\s()-]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      || 'أدخل رقم هاتف صحيحاً',
    loginpass: v => v.length > 0 || 'أدخل كلمة المرور',
    newpassword: v => (v.length >= 8 && /\d/.test(v) && /\D/.test(v)) || 'كلمة المرور 8 أحرف على الأقل وتجمع بين الأرقام والحروف',
    confirm: (v, form) => (v.length > 0 && v === form.querySelector('[name="password"]').value)
      || 'كلمتا المرور غير متطابقتين'
  };

  function check(input, form) {
    const rule = rules[input.dataset.rule];
    if (!rule) return true;
    const res = rule(input.value, form);
    const field = input.closest('.ax-field');
    const ok = res === true;
    field.classList.toggle('has-error', !ok);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    field.querySelector('.ax-error').textContent = ok ? '' : res;
    return ok;
  }

  [['login-form', 'dashboard-home.html'], ['register-form', 'dashboard-home.html']].forEach(([id, target]) => {
    const form = document.getElementById(id);
    if (!form) return;
    const inputs = [...form.querySelectorAll('[data-rule]')];
    inputs.forEach(i => {
      i.addEventListener('blur', () => i.value && check(i, form));
      i.addEventListener('input', () => { if (i.closest('.ax-field').classList.contains('has-error')) check(i, form); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const results = inputs.map(i => check(i, form));
      if (results.every(Boolean)) {
        const btn = form.querySelector('.ax-submit');
        btn.disabled = true;
        btn.textContent = 'جارٍ المتابعة...';
        window.MotionNav ? MotionNav.go(target) : (window.location.href = target);
      } else {
        const card = form.closest('.ax-card');
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        inputs[results.indexOf(false)].focus();
      }
    });
  });
});
