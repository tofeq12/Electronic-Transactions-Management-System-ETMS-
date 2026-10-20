// transaction-details.js — تعبئة صفحة تفاصيل المعاملة من ITQAN حسب ?id=
(function () {
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/></svg>';
  const DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = id => document.getElementById(id);

  function render() {
    const page = $('td-page'); if (!page) return;
    const id = ITQAN.param('id');
    const t = ITQAN.trx(id);
    page.hidden = !t; $('td-notfound').hidden = !!t;
    if (!t) {
      if (page.dataset.rendered) { (window.MotionNav ? MotionNav.go('transactions.html') : (location.href = 'transactions.html')); }
      return;
    }
    page.dataset.rendered = 1;
    $('td-no').textContent = t.id;
    const st = ITQAN.STATUS[t.status];
    const b = $('td-status'); b.className = 'badge ' + st.cls; b.textContent = st.label;
    $('td-type').textContent = t.type;
    $('td-date').textContent = t.date + ' - ' + t.time;
    $('td-subject').textContent = t.subject;
    $('td-to').textContent = t.to;
    $('td-from').textContent = t.from;
    const pr = ITQAN.PRIORITY[t.priority] || ITQAN.PRIORITY.normal;
    $('td-priority').innerHTML = '<span class="badge ' + pr.cls + '">' + pr.label + '</span>';
    const dept = ITQAN.dept && ITQAN.dept(t.deptId), who = t.assignedTo && ITQAN.user(t.assignedTo);
    $('td-assign').textContent = (dept || who) ? [dept && dept.name, who && who.name].filter(Boolean).join(' — ') : '—';
    $('td-amount').textContent = t.amount + ' ريال';
    $('td-desc').textContent = t.desc || '—';

    $('td-files').innerHTML = t.files.length
      ? t.files.map(f => '<div class="td-file"><span class="f-ico">' + FILE + '</span><button type="button" class="f-dl icon-btn" data-action="download" aria-label="تنزيل">' + DL + '</button><span class="f-name">' + esc(f) + '</span></div>').join('')
      : '<div class="td-none">لا توجد مرفقات</div>';

    $('td-log').innerHTML = t.log.map(s => '<div class="td-step' + (/رفض/.test(s.t) ? ' rej' : '') + '"><div><div class="s-t">' + esc(s.t) + '</div><div class="s-by">' + esc(s.by) + '</div>' + (s.n ? '<div class="s-n">' + esc(s.n) + '</div>' : '') + '</div><div class="s-at">' + esc(s.at) + '</div></div>').join('');

    const acts = $('td-actions');
    acts.querySelectorAll('[data-action]').forEach(a => { a.dataset.id = t.id; });
    acts.querySelectorAll('[data-only-pending]').forEach(a => { a.hidden = t.status !== 'pending'; });
  }
  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('itqan:changed', render);
  if (document.readyState !== 'loading') render();
})();
