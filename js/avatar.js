// avatar.js — صورة الملف الشخصي (اختيارية). تُحفظ في localStorage كصورة مصغّرة 256×256 لتظهر في كل الصفحات.
// في Laravel تُرفع إلى storage ويُحفظ مسارها في جدول المستخدمين.
(function () {
  const KEY = 'itqan_avatar', MAX = 3 * 1024 * 1024, TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  const get = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
  const put = v => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); return true; } catch (e) { return false; } };
  const toast = (m, t) => window.UI ? UI.toast(m, t) : alert(m);

  function paint() {
    const src = get();
    document.querySelectorAll('.sidebar-user img, .pf-head img').forEach(img => {
      if (!img.dataset.def) img.dataset.def = img.getAttribute('src');
      img.src = src || img.dataset.def;
    });
    document.querySelectorAll('[data-avatar-remove]').forEach(b => { b.hidden = !src; });
  }

  function resize(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(img.width, img.height), c = document.createElement('canvas');
        c.width = c.height = 256;
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(); };
      img.src = url;
    });
  }

  if (!window.__avatarBound) {
    window.__avatarBound = true;
    document.addEventListener('click', e => {
      if (e.target.closest('[data-avatar-pick]')) { document.getElementById('pf-avatar-input')?.click(); }
      if (e.target.closest('[data-avatar-remove]')) { put(''); paint(); toast('تمت إزالة الصورة'); }
    });
    document.addEventListener('change', async e => {
      if (e.target.id !== 'pf-avatar-input') return;
      const f = e.target.files[0]; e.target.value = '';
      if (!f) return;
      if (!TYPES.includes(f.type)) return toast('الصيغ المسموحة: PNG أو JPG أو WEBP', 'err');
      if (f.size > MAX) return toast('حجم الصورة يجب ألا يتجاوز 3 ميغابايت', 'err');
      try {
        const data = await resize(f);
        if (!put(data)) return toast('تعذّر حفظ الصورة في هذا المتصفح', 'err');
        paint(); toast('تم تحديث الصورة الشخصية');
        window.ITQAN && ITQAN.logActivity && ITQAN.logActivity('تغيير الصورة الشخصية', ITQAN.CURRENT_USER.name);
      } catch (err) { toast('ملف الصورة غير صالح', 'err'); }
    });
  }
  document.addEventListener('DOMContentLoaded', paint);
  if (document.readyState !== 'loading') paint();
})();
