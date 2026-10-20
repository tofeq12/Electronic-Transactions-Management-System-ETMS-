// departments-page.js — قائمة الأقسام + نموذج إضافة/تعديل قسم (?id=)
(function () {
  const $ = id => document.getElementById(id);
  const go = to => window.MotionNav ? MotionNav.go(to) : (location.href = to);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const same = (a, b) => a.trim().replace(/\s+/g, ' ').toLowerCase() === b.trim().replace(/\s+/g, ' ').toLowerCase();

  function renderList() {
    const table = $('dept-table'); if (!table) return;
    table.tBodies[0].innerHTML = ITQAN.departments.length ? ITQAN.departments.map(d =>
      '<tr data-id="' + d.id + '"><td>' + d.id + '</td><td>' + esc(d.name) + '</td><td>' + (d.desc ? esc(d.desc) : '—') + '</td><td>' + ITQAN.deptTrxCount(d.id) + '</td>' +
      '<td><div class="row-actions"><button class="icon-btn edit" data-action="dept-edit" aria-label="تعديل">' + UI.icons.edit + '</button>' +
      '<button class="icon-btn delete" data-action="dept-delete" aria-label="حذف">' + UI.icons.trash + '</button></div></td></tr>').join('')
      : '<tr class="table-empty"><td colspan="5">لا توجد أقسام. أضف القسم الأول.</td></tr>';
  }

  async function deptAction(act, id) {
    const d = ITQAN.dept(id); if (!d) return;
    if (window.Access && !Access.can('departments.manage')) { UI.toast('غير مصرح لك بتنفيذ هذا الإجراء', 'err'); return; }
    if (act === 'edit') return go('department-form.html?id=' + d.id);
    if (act === 'delete') {
      if (ITQAN.deptTrxCount(d.id)) return UI.toast('لا يمكن حذف قسم أُحيلت إليه معاملات', 'err');
      const yes = await UI.confirm({ title: 'حذف القسم', text: 'سيتم حذف قسم "' + d.name + '" نهائياً ولا يمكن التراجع.', ok: 'حذف', kind: 'danger' });
      if (!yes) return;
      ITQAN.departments.splice(ITQAN.departments.indexOf(d), 1);
      ITQAN.logActivity && ITQAN.logActivity('حذف قسم', d.name);
      UI.toast('تم حذف القسم'); renderList();
    }
  }

  function bindForm() {
    const f = $('dept-form'); if (!f || f.dataset.bound) return; f.dataset.bound = 1;
    const id = ITQAN.param('id'), d = id ? ITQAN.dept(id) : null;
    if (id && !d) { f.closest('.form-panel-body').innerHTML = '<div class="td-notfound"><h2>القسم غير موجود</h2><p>قد يكون حُذف أو أن الرابط غير صحيح.</p><button class="btn btn-primary" type="button" data-goto="departments.html">العودة إلى الأقسام</button></div>'; return; }
    if (d) { $('dept-title').textContent = 'تعديل القسم'; $('dept-name').value = d.name; $('dept-desc').value = d.desc || ''; }
    f.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('dept-name').value.trim(), desc = $('dept-desc').value.trim();
      if (name.length < 2) { UI.toast('اسم القسم حرفان على الأقل', 'err'); $('dept-name').focus(); return; }
      if (ITQAN.departments.some(x => x !== d && same(x.name, name))) { UI.toast('اسم القسم مستخدم مسبقاً', 'err'); $('dept-name').focus(); return; }
      if (d) { d.name = name; d.desc = desc; ITQAN.logActivity && ITQAN.logActivity('تعديل قسم', name); UI.toast('تم حفظ القسم'); }
      else { ITQAN.departments.push({ id: Math.max(0, ...ITQAN.departments.map(x => x.id)) + 1, name, desc }); ITQAN.logActivity && ITQAN.logActivity('إضافة قسم', name); UI.toast('تمت إضافة القسم'); }
      go('departments.html');
    });
  }

  if (!window.__deptBound) {
    window.__deptBound = true;
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-action^="dept-"]'); if (!b) return;
      const tr = b.closest('tr'); deptAction(b.dataset.action.slice(5), tr && tr.dataset.id);
    });
  }
  const init = () => { renderList(); bindForm(); };
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('itqan:changed', renderList);
  if (document.readyState !== 'loading') init();
})();
