// forward.js — شاشة إحالة المعاملة إلى قسم / موظف (?id=TRX-...)
(function () {
  const $ = id => document.getElementById(id);
  const go = to => window.MotionNav ? MotionNav.go(to) : (location.href = to);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const notice = (h, p, to, label) => '<div class="td-notfound"><h2>' + h + '</h2><p>' + p + '</p><button class="btn btn-primary" type="button" data-goto="' + to + '">' + label + '</button></div>';

  function init() {
    const f = $('forward-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    const box = $('fw-body');
    const t = ITQAN.trx(ITQAN.param('id'));
    if (!t) { box.innerHTML = notice('المعاملة غير موجودة', 'قد تكون حُذفت أو أن الرابط غير صحيح.', 'transactions.html', 'العودة إلى المعاملات'); return; }
    if (t.status !== 'pending') { box.innerHTML = notice('لا يمكن إحالة هذه المعاملة', 'الإحالة متاحة للمعاملات قيد الانتظار فقط.', 'transaction-details.html?id=' + t.id, 'العودة إلى تفاصيل المعاملة'); return; }

    $('fw-no').textContent = t.id;
    $('fw-subject').textContent = t.subject;
    $('fw-type').textContent = t.type;
    $('fw-dept').innerHTML = '<option value="">اختر القسم</option>' + ITQAN.departments.map(d => '<option value="' + d.id + '">' + esc(d.name) + '</option>').join('');
    $('fw-user').innerHTML = '<option value="">— بدون تحديد موظف —</option>' + ITQAN.users.filter(u => u.status === 'active').map(u => '<option value="' + u.id + '">' + esc(u.name) + '</option>').join('');
    if (t.deptId) $('fw-dept').value = t.deptId;
    if (t.assignedTo) $('fw-user').value = t.assignedTo;

    $('fw-cancel').addEventListener('click', () => go('transaction-details.html?id=' + t.id));
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (window.Access && !Access.can('trx.forward')) { UI.toast('غير مصرح لك بتنفيذ هذا الإجراء', 'err'); return; }
      const deptId = $('fw-dept').value, userId = $('fw-user').value, note = $('fw-note').value.trim();
      if (!deptId) { UI.toast('اختر القسم المحال إليه', 'err'); $('fw-dept').focus(); return; }
      const d = ITQAN.dept(deptId), u = userId && ITQAN.user(userId);
      if (!d) { UI.toast('القسم المختار غير موجود', 'err'); return; }
      t.deptId = d.id; t.assignedTo = u ? u.id : null;
      const entry = { t: 'تمت إحالة المعاملة إلى ' + d.name + (u ? ' — ' + u.name : ''), by: ITQAN.CURRENT_USER.name, at: UI.nowStamp() };
      if (note) entry.n = note;
      t.log.push(entry);
      ITQAN.logActivity && ITQAN.logActivity('إحالة معاملة', t.id);
      UI.toast('تمت إحالة المعاملة');
      go('transaction-details.html?id=' + t.id);
    });
  }
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
