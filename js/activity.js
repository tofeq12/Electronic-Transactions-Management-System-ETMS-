// activity.js — سجل النشاطات (Audit log). في الذاكرة فقط؛ في Laravel يصبح جدول activity_logs.
// يُبنى مبدئياً من سجل إجراءات كل معاملة، ثم تُضاف إليه الأحداث الجديدة عبر ITQAN.logActivity(action, target).
(function () {
  if (!window.ITQAN || ITQAN.activity) return;
  const act = ITQAN.activity = [];
  ITQAN.transactions.forEach(t => (t.log || []).forEach(l => act.push({ at: l.at, by: l.by, action: l.t, target: t.id })));
  ITQAN.logActivity = (action, target) => {
    act.push({ at: window.UI ? UI.nowStamp() : '', by: ITQAN.CURRENT_USER.name, action, target: target || '—' });
  };
})();
