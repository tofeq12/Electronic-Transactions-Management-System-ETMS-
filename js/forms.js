// forms.js — نماذج: معاملة جديدة/تعديل، مستخدم جديد/تعديل، الملف الشخصي (واجهة فقط — بدون خادم)
(function () {
  const go = to => window.MotionNav ? MotionNav.go(to) : (location.href = to);
  const norm = s => String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();
  const $ = id => document.getElementById(id);
  const fail = (el, msg) => { UI.toast(msg, 'err'); el && el.focus(); return false; };
  const today = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate()); };
  const validPhone = v => /^\+?\d{9,15}$/.test(norm(v).replace(/[\s()-]/g, ''));
  const strongPass = p => p.length >= 8 && /\d/.test(p) && /\D/.test(p);
  const PASS_MSG = 'كلمة المرور 8 أحرف على الأقل وتجمع بين الأرقام والحروف';
  const nextTrxId = () => 'TRX-2024-' + String(Math.max(0, ...ITQAN.transactions.map(t => parseInt(t.id.slice(-4), 10))) + 1).padStart(4, '0');

  /* ---------------- المعاملات ---------------- */
  function readTrx() {
    const subject = $('trx-subject').value.trim();
    const amount = norm($('trx-amount').value).replace(/,/g, '');
    const date = norm($('trx-date').value).replace(/[-.]/g, '/');
    if (!subject) return fail($('trx-subject'), 'أدخل موضوع المعاملة');
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || parseFloat(amount) <= 0) return fail($('trx-amount'), 'أدخل مبلغاً صحيحاً أكبر من صفر');
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(date)) return fail($('trx-date'), 'صيغة التاريخ: YYYY/MM/DD');
    return {
      type: $('trx-type').value, subject, from: $('trx-from').value.trim(), to: $('trx-to').value,
      amount: parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      date, desc: $('trx-desc').value.trim(), priority: $('trx-priority') ? $('trx-priority').value : 'normal'
    };
  }
  function pickedFiles() {
    const inp = document.querySelector('.dropzone input[type=file]');
    return inp ? [...inp.files].map(f => f.name) : [];
  }
  function bindNewTrx() {
    const f = $('transaction-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    if ($('trx-date')) $('trx-date').value = today();
    const save = status => {
      const d = readTrx(); if (!d) return;
      const me = ITQAN.CURRENT_USER.name, at = UI.nowStamp();
      const log = [{ t: 'تم إنشاء المعاملة', by: me, at }];
      if (status === 'pending') log.push({ t: 'تم إرسال المعاملة', by: me, at });
      const d2 = new Date(), time = String(d2.getHours()).padStart(2, '0') + ':' + String(d2.getMinutes()).padStart(2, '0');
      const rec = Object.assign({ id: nextTrxId(), time, status, files: pickedFiles(), log }, d);
      ITQAN.transactions.push(rec);
      ITQAN.logActivity && ITQAN.logActivity(status === 'draft' ? 'حفظ معاملة كمسودة' : 'إنشاء وإرسال معاملة', rec.id);
      UI.toast(status === 'draft' ? 'تم حفظ المعاملة كمسودة' : 'تم إرسال المعاملة بنجاح');
      go('transactions.html');
    };
    f.addEventListener('submit', e => { e.preventDefault(); save('pending'); });
    $('save-draft')?.addEventListener('click', () => save('draft'));
  }
  function bindEditTrx() {
    const f = $('transaction-edit-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    const t = ITQAN.trx(ITQAN.param('id'));
    if (!t) { f.closest('.form-panel-body').innerHTML = '<div class="td-notfound"><h2>المعاملة غير موجودة</h2><p>قد تكون حُذفت أو أن الرابط غير صحيح.</p><button class="btn btn-primary" type="button" data-goto="transactions.html">العودة إلى المعاملات</button></div>'; return; }
    $('trx-no').value = t.id; $('trx-type').value = t.type; $('trx-subject').value = t.subject; $('trx-from').value = t.from;
    $('trx-to').value = t.to; $('trx-amount').value = t.amount; $('trx-date').value = t.date; $('trx-desc').value = t.desc || '';
    if ($('trx-priority')) $('trx-priority').value = t.priority || 'normal';
    const list = $('trx-files');
    const draw = () => { list.innerHTML = t.files.length ? t.files.map((n, i) => '<div class="td-file"><span class="f-name">' + n.replace(/[<>&]/g, '') + '</span><button type="button" class="icon-btn delete" data-rm="' + i + '" aria-label="حذف المرفق">' + UI.icons.x + '</button></div>').join('') : ''; };
    draw();
    list.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { t.files.splice(+b.dataset.rm, 1); draw(); } });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const d = readTrx(); if (!d) return;
      Object.assign(t, d, { files: t.files.concat(pickedFiles()) });
      t.log.push({ t: 'تم تعديل المعاملة', by: ITQAN.CURRENT_USER.name, at: UI.nowStamp() });
      ITQAN.logActivity && ITQAN.logActivity('تعديل معاملة', t.id);
      UI.toast('تم حفظ التعديلات');
      go('transaction-details.html?id=' + t.id);
    });
  }

  /* ---------------- المستخدمون ---------------- */
  function readUser(self) {
    const name = $('u-name').value.trim(), username = $('u-username').value.trim().toLowerCase(), email = $('u-email').value.trim().toLowerCase(), pass = $('u-pass').value, phone = $('u-phone') ? $('u-phone').value.trim() : '';
    if (name.length < 3) return fail($('u-name'), 'الاسم الكامل 3 أحرف على الأقل');
    if (!/^[a-z0-9_.]{3,}$/.test(username)) return fail($('u-username'), 'اسم المستخدم: 3 أحرف إنجليزية/أرقام على الأقل');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail($('u-email'), 'أدخل بريداً إلكترونياً صحيحاً');
    if (!validPhone(phone)) return fail($('u-phone'), 'أدخل رقم هاتف صحيحاً (9 إلى 15 رقماً)');
    if (ITQAN.users.some(u => u !== self && u.username === username)) return fail($('u-username'), 'اسم المستخدم مستخدم مسبقاً');
    if (ITQAN.users.some(u => u !== self && u.email === email)) return fail($('u-email'), 'البريد الإلكتروني مستخدم مسبقاً');
    if ((!self || pass) && !strongPass(pass)) return fail($('u-pass'), PASS_MSG);
    return { name, username, email, phone: norm(phone).replace(/[\s()-]/g, ''), role: $('u-role').value, status: $('u-status').value };
  }
  function bindAddUser() {
    const f = $('add-user-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const d = readUser(null); if (!d) return;
      ITQAN.users.push(Object.assign({ id: Math.max(0, ...ITQAN.users.map(u => u.id)) + 1 }, d));
      ITQAN.logActivity && ITQAN.logActivity('إضافة مستخدم', d.name);
      UI.toast('تمت إضافة المستخدم'); go('dashboard-users.html');
    });
  }
  function bindEditUser() {
    const f = $('edit-user-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    const u = ITQAN.user(ITQAN.param('id'));
    if (!u) { f.closest('.form-panel-body').innerHTML = '<div class="td-notfound"><h2>المستخدم غير موجود</h2><p>قد يكون حُذف أو أن الرابط غير صحيح.</p><button class="btn btn-primary" type="button" data-goto="dashboard-users.html">العودة إلى المستخدمين</button></div>'; return; }
    $('u-name').value = u.name; $('u-username').value = u.username; $('u-email').value = u.email; if ($('u-phone')) $('u-phone').value = u.phone || ''; $('u-role').value = u.role; $('u-status').value = u.status;
    if (u.id === ITQAN.CURRENT_USER.id) { $('u-status').disabled = true; }
    f.addEventListener('submit', e => {
      e.preventDefault();
      const d = readUser(u); if (!d) return;
      if (u.id === ITQAN.CURRENT_USER.id) d.status = 'active';
      Object.assign(u, d);
      if (u.id === ITQAN.CURRENT_USER.id) Object.assign(ITQAN.CURRENT_USER, { name: u.name, username: u.username, email: u.email, phone: u.phone, role: u.role });
      ITQAN.logActivity && ITQAN.logActivity('تعديل مستخدم', u.name);
      UI.toast('تم حفظ بيانات المستخدم'); go('dashboard-users.html');
    });
  }

  /* ---------------- الملف الشخصي + اسم المستخدم في الشريط الجانبي ---------------- */
  function syncSidebarUser() {
    const me = ITQAN.CURRENT_USER;
    document.querySelectorAll('.sidebar-user .su-name').forEach(n => n.textContent = me.name);
    document.querySelectorAll('.sidebar-user .su-role').forEach(n => n.textContent = me.role === 'مدير' ? 'مدير النظام' : me.role);
  }
  function bindProfile() {
    const f = $('profile-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    const me = ITQAN.CURRENT_USER;
    $('pf-name').value = me.name; $('pf-username').value = me.username; $('pf-email').value = me.email; $('pf-phone').value = me.phone || ''; $('pf-role').value = me.role;
    const paint = () => { $('pf-title').textContent = me.name; $('pf-sub').textContent = me.role === 'مدير' ? 'مدير النظام' : me.role; };
    paint();
    f.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('pf-name').value.trim(), email = $('pf-email').value.trim().toLowerCase();
      if (name.length < 3) return fail($('pf-name'), 'الاسم الكامل 3 أحرف على الأقل');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail($('pf-email'), 'أدخل بريداً إلكترونياً صحيحاً');
      if (ITQAN.users.some(u => u.id !== me.id && u.email === email)) return fail($('pf-email'), 'البريد الإلكتروني مستخدم مسبقاً');
      const phone = $('pf-phone').value.trim();
      if (!validPhone(phone)) return fail($('pf-phone'), 'أدخل رقم هاتف صحيحاً (9 إلى 15 رقماً)');
      me.name = name; me.email = email; me.phone = norm(phone).replace(/[\s()-]/g, '');
      const u = ITQAN.user(me.id); if (u) { u.name = name; u.email = email; u.phone = me.phone; }
      ITQAN.logActivity && ITQAN.logActivity('تعديل الملف الشخصي', me.name);
      paint(); syncSidebarUser(); UI.toast('تم حفظ بياناتك');
    });
  }

  function init() { bindNewTrx(); bindEditTrx(); bindAddUser(); bindEditUser(); bindProfile(); syncSidebarUser(); }
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
