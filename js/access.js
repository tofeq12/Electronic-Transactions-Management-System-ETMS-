// access.js — صلاحيات الأدوار في الواجهة (مدير / موظف / مراجع).
// تنبيه: هذا لتجربة الواجهة فقط. الحماية الحقيقية تكون في الخادم (Routes + Policies في Laravel)،
// فإخفاء زر أو صفحة هنا لا يمنع أي شخص من الطلب المباشر.
(function () {
  if (window.Access) return;
  const ROLES = {
    'مدير': ['*'],
    'موظف': ['trx.create', 'trx.edit', 'trx.forward', 'urgent.view'],
    'مراجع': ['urgent.view', 'reports.view']
  };
  const KEY = 'itqan_demo_role';                       // لتجربة الأدوار فقط: Access.setRole('موظف') ثم Access.setRole() للرجوع
  const PAGE = {
    'dashboard-users.html': 'users.manage', 'add-user.html': 'users.manage', 'edit-user.html': 'users.manage',
    'reports.html': 'reports.view', 'departments.html': 'departments.manage', 'department-form.html': 'departments.manage',
    'activity-log.html': 'activity.view', 'urgent.html': 'urgent.view',
    'transaction-new.html': 'trx.create', 'transaction-edit.html': 'trx.edit', 'transaction-forward.html': 'trx.forward'
  };
  const NAV = { users: 'users.manage', reports: 'reports.view', departments: 'departments.manage', activity: 'activity.view', urgent: 'urgent.view' };

  try { const r = localStorage.getItem(KEY); if (r && ROLES[r] && window.ITQAN) ITQAN.CURRENT_USER.role = r; } catch (e) { }

  const role = () => (window.ITQAN && ITQAN.CURRENT_USER.role) || 'موظف';
  const can = perm => { const p = ROLES[role()] || []; return p.includes('*') || p.includes(perm); };
  window.Access = {
    can, roles: Object.keys(ROLES),
    setRole(r) { try { r ? localStorage.setItem(KEY, r) : localStorage.removeItem(KEY); } catch (e) { } location.reload(); }
  };

  let denied = false;
  function apply() {
    document.querySelectorAll('[data-perm]').forEach(el => el.classList.toggle('no-perm', !can(el.dataset.perm)));
    document.querySelectorAll('.sidebar-nav a[data-page]').forEach(a => { const p = NAV[a.dataset.page]; if (p) a.classList.toggle('no-perm', !can(p)); });
    const need = PAGE[location.pathname.split('/').pop()];
    if (need && !can(need) && !denied) {
      denied = true;
      document.querySelector('.main-area')?.classList.add('no-perm');
      setTimeout(() => { denied = false; window.MotionNav ? MotionNav.go('../403.html') : location.replace('../403.html'); }, 30);
    }
  }
  document.addEventListener('DOMContentLoaded', apply);
  document.addEventListener('itqan:changed', apply);
  if (document.readyState !== 'loading') apply();
})();
