// onboarding.js — 4 linked onboarding screens (Next / Back / Skip / Get Started) -> Language
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('ob-stage');
  if (!stage || stage.dataset.ready) return; stage.dataset.ready = 1;
  const go = to => window.MotionNav ? MotionNav.go(to) : (location.href = to);
  const ICON = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M11 3v5h5"/>',
    clip: '<path d="M21 12l-8.5 8.5a5 5 0 0 1-7-7L14 5a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    chart: '<path d="M4 4v16h16"/><path d="M8 15l3-4 3 3 4-6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>'
  };
  const STEPS = [
    { t: 'إدارة معاملاتك بسهولة', d: 'أنشئ المعاملة، أرفق مستنداتها، وأرسلها للجهة المختصة من مكان واحد.', c: [['doc', 'معاملة'], ['clip', 'مرفقات'], ['send', 'إرسال']] },
    { t: 'تابع حالة كل معاملة', d: 'اعرف أين وصلت معاملتك في كل مرحلة، من الإنشاء حتى الاكتمال.', c: [['doc', 'المعاملات'], ['chart', 'الحالات'], ['bell', 'التنبيهات']] },
    { t: 'تقارير وإشعارات منظمة', d: 'تقارير واضحة وإشعارات فورية تبقيك على اطلاع بكل جديد.', c: [['chart', 'التقارير'], ['bell', 'الإشعارات'], ['doc', 'السجل']] },
    { t: 'نظام متكامل وآمن', d: 'مستخدمون وصلاحيات محددة وحماية لبياناتك في كل خطوة.', c: [['users', 'المستخدمون'], ['lock', 'الصلاحيات'], ['shield', 'الحماية']] }
  ];
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ARROW = '<svg class="ico-next" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, busy = false;

  function render() {
    const s = STEPS[i], last = i === STEPS.length - 1;
    document.querySelector('.ob-step').textContent = `0${i + 1} / 0${STEPS.length}`;
    stage.innerHTML = `
      <div class="ob-art"><img src="../assets/images/hero-laptop.png" alt="">
        ${s.c.map((c, n) => `<span class="ob-chip c${n}">${svg(ICON[c[0]])}<b>${c[1]}</b></span>`).join('')}</div>
      <section class="ob-card">
        <h1 class="ob-title">${s.t}</h1><p class="ob-desc">${s.d}</p>
        <div class="ob-dots">${STEPS.map((_, n) => `<i class="${n === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="ob-actions">
          ${i > 0 ? '<button type="button" class="btn btn-outline" data-ob="back">السابق</button>' : ''}
          <button type="button" class="btn btn-primary" data-ob="${last ? 'start' : 'next'}">${last ? 'ابدأ الآن' : 'التالي'}${ARROW}</button>
        </div></section>`;
    window.MotionPlay && MotionPlay(stage);
  }
  function to(n) {
    if (busy) return; busy = true;
    stage.classList.add('ob-out');
    setTimeout(() => { stage.classList.remove('ob-out'); i = n; render(); busy = false; }, reduce ? 0 : 220);
  }
  document.querySelector('.ob-page').addEventListener('click', e => {
    const b = e.target.closest('[data-ob]'); if (!b) return;
    const a = b.dataset.ob;
    if (a === 'next') to(i + 1); else if (a === 'back') to(i - 1); else if (a === 'start') go('language.html');
  });
  render();
});
