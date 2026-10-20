// =========================================================
// main.js — Shared helpers used across all pages
// =========================================================

/**
 * Language toggle button.
 * The PDF design only shows an "English" switch (system is Arabic-first).
 * Since only the Arabic screens exist in the source design, the toggle
 * simply confirms the action; wire this to real i18n when English
 * screens are added.
 */
window.Lang = {
  get() { try { return localStorage.getItem('itqan_lang') || 'ar'; } catch (e) { return 'ar'; } },
  set(l) { try { localStorage.setItem('itqan_lang', l); } catch (e) { } this.apply(); },
  apply() {
    const l = this.get();
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('.lang-toggle').forEach(b => { if (b.lastChild) b.lastChild.textContent = l === 'ar' ? ' English' : ' العربية'; });
  }
};
Lang.apply();
function initLangToggle() {
  Lang.apply();
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    if (btn.dataset.bound) return; btn.dataset.bound = 1;
    btn.addEventListener('click', () => Lang.set(Lang.get() === 'ar' ? 'en' : 'ar'));
  });
}

/** Highlight the current page's sidebar link (used on dashboard pages). */
function initActiveNav() {
  const current = document.body.getAttribute('data-page');
  if (!current) return;
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === current) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLangToggle();
  initActiveNav();
});
