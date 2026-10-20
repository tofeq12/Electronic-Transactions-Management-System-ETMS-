// departments.js — بيانات الأقسام (تُستبدل بجدول departments في Laravel)
// الأقسام الأولية مأخوذة من أسماء الأقسام الواردة في وصف المعاملات التجريبية (الإدارة المالية، التشغيل، الأرشفة).
(function () {
  if (!window.ITQAN || ITQAN.departments) return;
  ITQAN.departments = [
    { id: 1, name: 'الإدارة المالية', desc: '' },
    { id: 2, name: 'قسم التشغيل', desc: '' },
    { id: 3, name: 'قسم الأرشفة', desc: '' }
  ];
  ITQAN.dept = id => ITQAN.departments.find(d => String(d.id) === String(id));
  ITQAN.deptTrxCount = id => ITQAN.transactions.filter(t => String(t.deptId) === String(id)).length;
})();
