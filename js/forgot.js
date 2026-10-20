// forgot.js — استعادة كلمة المرور: forgot-password.html → verify-code.html → reset-password.html
// ⚠️ واجهة فقط: لا يوجد خادم يرسل الرمز أو يتحقق منه. في Laravel يُنفَّذ بـ Password Broker (رمز/رابط بصلاحية محدودة،
//    مخزّن مشفّراً، يُستعمل مرة واحدة، مع تحديد عدد المحاولات). لا تعتمد على هذه الشاشات كحماية فعلية.
(function () {
  const $ = id => document.getElementById(id);
  const go = to => window.MotionNav ? MotionNav.go(to) : (location.href = to);
  const ss = { get(k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }, del(k) { try { sessionStorage.removeItem(k); } catch (e) { } } };
  const digits = s => String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const mask = m => m.replace(/^(.).*(@.*)$/, '$1•••$2');
  const RESEND_SECS = 60;

  function setError(input, msg) {
    const field = input.closest('.ax-field');
    field.classList.toggle('has-error', !!msg);
    field.querySelector('.ax-error').textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function shake(form) { const c = form.closest('.ax-card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }

  /* ---- 1) نسيت كلمة المرور ---- */
  function initForgot() {
    const f = $('forgot-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    const inp = $('fp-email');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = inp.value.trim().toLowerCase();
      if (!setError(inp, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'أدخل بريداً إلكترونياً صحيحاً')) { shake(f); inp.focus(); return; }
      ss.set('itqan_reset_email', v); ss.del('itqan_reset_ok'); ss.set('itqan_reset_sent', String(Date.now()));
      f.querySelector('.ax-submit').disabled = true;
      go('verify-code.html');          // نفس الرد دائماً سواء وُجد الحساب أو لم يوجد (منعاً لكشف الحسابات)
    });
    inp.addEventListener('input', () => inp.closest('.ax-field').classList.contains('has-error') && setError(inp, ''));
  }

  /* ---- 2) إدخال الرمز ---- */
  let timer = null;
  function initVerify() {
    const f = $('verify-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    const email = ss.get('itqan_reset_email');
    if (!email) { go('forgot-password.html'); return; }
    $('vc-email').textContent = mask(email);
    const inp = $('vc-code'), btn = $('vc-resend'), note = $('vc-note');
    const tick = () => {
      const left = RESEND_SECS - Math.floor((Date.now() - Number(ss.get('itqan_reset_sent') || 0)) / 1000);
      btn.disabled = left > 0;
      btn.textContent = left > 0 ? 'إعادة إرسال الرمز (' + left + ')' : 'إعادة إرسال الرمز';
      if (left <= 0) clearInterval(timer);
    };
    clearInterval(timer); timer = setInterval(tick, 1000); tick();
    btn.addEventListener('click', () => {
      ss.set('itqan_reset_sent', String(Date.now()));
      note.textContent = 'تم إرسال رمز جديد إلى بريدك الإلكتروني'; note.hidden = false;
      clearInterval(timer); timer = setInterval(tick, 1000); tick();
    });
    inp.addEventListener('input', () => { inp.value = digits(inp.value).replace(/\D/g, '').slice(0, 6); setError(inp, ''); });
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!setError(inp, /^\d{6}$/.test(inp.value) ? '' : 'أدخل الرمز المكوّن من 6 أرقام')) { shake(f); inp.focus(); return; }
      ss.set('itqan_reset_ok', email);
      go('reset-password.html');
    });
  }

  /* ---- 3) كلمة مرور جديدة ---- */
  function initReset() {
    const f = $('reset-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    if (!ss.get('itqan_reset_ok')) { go('forgot-password.html'); return; }
    const p1 = $('rp-password'), p2 = $('rp-confirm');
    [p1, p2].forEach(i => i.addEventListener('input', () => i.closest('.ax-field').classList.contains('has-error') && setError(i, '')));
    f.addEventListener('submit', e => {
      e.preventDefault();
      const ok1 = setError(p1, (p1.value.length >= 8 && /\d/.test(p1.value) && /\D/.test(p1.value)) ? '' : 'كلمة المرور 8 أحرف على الأقل وتجمع بين الأرقام والحروف');
      const ok2 = setError(p2, (p2.value && p2.value === p1.value) ? '' : 'كلمتا المرور غير متطابقتين');
      if (!(ok1 && ok2)) { shake(f); (ok1 ? p2 : p1).focus(); return; }
      ['itqan_reset_email', 'itqan_reset_ok', 'itqan_reset_sent'].forEach(ss.del);
      f.hidden = true; $('rp-done').hidden = false;
    });
  }

  const init = () => { initForgot(); initVerify(); initReset(); };
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
