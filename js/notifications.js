// notifications.js — فلترة (الكل / غير مقروء) + تعليم كمقروء + نقطة الشريط الجانبي
document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.nf-list'); if (!list) return;
  const tabs = document.querySelectorAll('.nf-tab');
  const empty = document.querySelector('.nf-empty');
  const dots = () => document.querySelectorAll('.sidebar-nav .nav-dot');

  function render() {
    const onlyUnread = document.querySelector('.nf-tab.active')?.dataset.filter === 'unread';
    let shown = 0;
    list.querySelectorAll('.nf-item').forEach(it => {
      const hide = onlyUnread && !it.classList.contains('unread');
      it.hidden = hide; if (!hide) shown++;
    });
    empty?.classList.toggle('show', shown === 0);
    const anyUnread = !!list.querySelector('.unread');
    dots().forEach(d => d.hidden = !anyUnread);
  }
  tabs.forEach(t => t.addEventListener('click', () => { tabs.forEach(x => x.classList.remove('active')); t.classList.add('active'); render(); }));
  list.addEventListener('click', e => { const it = e.target.closest('.nf-item'); if (it) { it.classList.remove('unread'); render(); } });
  document.querySelector('.nf-more')?.addEventListener('click', e => {
    e.preventDefault(); tabs.forEach(x => x.classList.toggle('active', x.dataset.filter === 'all')); render();
  });
  render();
});
