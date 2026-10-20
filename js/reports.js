// reports.js — Reports screen: demo data, animated counters, SVG bar chart, Word / PDF export (front-end only)
(function () {
  'use strict';

  const CATEGORIES = ['تحويل مبالغ', 'شراء أجهزة', 'دفع فواتير', 'تعاقد', 'أخرى'];
  const DATA = {
    transactions: { label: 'تقرير المعاملات', stats: { rejected: 20, pending: 50, approved: 280, total: 350 }, bars: [37, 44, 30, 26, 25] },
    monthly: { label: 'تقرير شهري', stats: { rejected: 8, pending: 21, approved: 96, total: 125 }, bars: [18, 31, 22, 14, 9] },
    yearly: { label: 'تقرير سنوي', stats: { rejected: 64, pending: 97, approved: 1180, total: 1341 }, bars: [120, 160, 95, 80, 64] }
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => n.toLocaleString('en-US');
  const slashDate = v => v.replace(/-/g, '/');

  function scale(max) {
    const step = max <= 50 ? 10 : max <= 100 ? 20 : 50;
    return { step, top: Math.ceil(max / step) * step };
  }

  function chartSvg(w, bars, animate, delay) {
    const compact = w < 520;
    const h = compact ? 240 : 290;
    const m = { t: 12, r: 10, b: compact ? 44 : 36, l: 36 };
    const pw = w - m.l - m.r, ph = h - m.t - m.b;
    const { step, top } = scale(Math.max(...bars));
    const slot = pw / bars.length, bw = Math.min(slot * .46, 54), r = Math.min(4, bw / 2);
    const base = m.t + ph;

    let grid = '';
    for (let v = 0; v <= top; v += step) {
      const y = base - (v / top) * ph;
      grid += `<line class="rp-grid" x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}"/>` +
        `<text class="rp-axis-text" x="${m.l - 10}" y="${y + 4}" text-anchor="end">${v}</text>`;
    }
    const cols = bars.map((v, i) => {
      const x = m.l + slot * i + (slot - bw) / 2, bh = (v / top) * ph, y = base - bh, cx = x + bw / 2;
      const d = `M${x} ${base}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + bw - r}Q${x + bw} ${y} ${x + bw} ${y + r}V${base}Z`;
      const words = CATEGORIES[i].split(' ');
      const label = slot < 92 && words.length > 1
        ? words.map((t, k) => `<tspan x="${cx}" dy="${k ? 13 : 0}">${t}</tspan>`).join('')
        : CATEGORIES[i];
      return `<path class="rp-bar" style="--i:${i}" d="${d}"><title>${CATEGORIES[i]}: ${v}</title></path>` +
        `<text class="rp-axis-text" x="${cx}" y="${base + 18}" text-anchor="middle">${label}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="إحصائيات المعاملات" class="${animate ? 'is-animated' : ''}" style="--rp-delay:${delay}s">` +
      `${grid}<line class="rp-axis" x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${base}"/>` +
      `<line class="rp-axis" x1="${m.l}" x2="${w - m.r}" y1="${base}" y2="${base}"/>${cols}</svg>`;
  }

  function countUp(el, to, delay) {
    cancelAnimationFrame(el._raf); clearTimeout(el._t);
    const from = +el.dataset.v || 0;
    el.dataset.v = to;
    if (reduce) { el.textContent = fmt(to); return; }
    el.textContent = fmt(from);
    el._t = setTimeout(() => {
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / 800);
        el.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) el._raf = requestAnimationFrame(tick);
      };
      el._raf = requestAnimationFrame(tick);
    }, delay * 1000);
  }

  function download(name, mime, content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff', content], { type: mime }));
    a.download = name;
    a.addEventListener('click', e => e.stopPropagation());   // keep the global page-router (motion.js) out of file downloads
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function init() {
    const root = document.querySelector('.rp-main');
    if (!root || root.dataset.rpBound) return;
    root.dataset.rpBound = '1';

    const $ = id => root.querySelector('#' + id);
    const typeEl = $('rp-type'), fromEl = $('rp-from'), toEl = $('rp-to');
    const errorEl = $('rp-error'), chartEl = $('rp-chart'), metaEl = $('rp-print-meta');
    let current = DATA[typeEl.value], lastW = 0;

    const drawChart = (animate, delay) => {
      const w = chartEl.clientWidth; if (!w) return;
      lastW = w;
      chartEl.innerHTML = chartSvg(w, current.bars, animate && !reduce, delay || 0);
    };
    const drawStats = delay => root.querySelectorAll('.rp-stat').forEach((card, i) =>
      countUp(card.querySelector('.rp-stat__value'), current.stats[card.dataset.stat], delay + i * .08));
    const showDates = () => [fromEl, toEl].forEach(el => { el.parentNode.querySelector('.rp-control__value').textContent = slashDate(el.value); });
    const updateMeta = () => { metaEl.textContent = `${current.label} — من ${slashDate(fromEl.value)} إلى ${slashDate(toEl.value)}`; };

    function valid() {
      const bad = !!(fromEl.value && toEl.value && fromEl.value > toEl.value);
      errorEl.hidden = !bad;
      fromEl.parentNode.classList.toggle('is-invalid', bad);
      toEl.parentNode.classList.toggle('is-invalid', bad);
      return !bad;
    }
    function show() {
      if (!valid()) return;
      current = DATA[typeEl.value];
      drawStats(0); drawChart(true, 0); updateMeta();
    }

    function exportWord() {
      if (!valid()) return;
      const cards = [...root.querySelectorAll('.rp-stat')].map(c =>
        `<tr><td>${c.querySelector('.rp-stat__label').textContent}</td><td>${fmt(current.stats[c.dataset.stat])}</td></tr>`).join('');
      const rows = CATEGORIES.map((c, i) => `<tr><td>${c}</td><td>${current.bars[i]}</td></tr>`).join('');
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${current.label}</title>` +
        `<style>body{font-family:Arial,sans-serif;direction:rtl}table{border-collapse:collapse;width:100%;margin-bottom:18px}th,td{border:1px solid #999;padding:6px 10px;text-align:right}th{background:#e7edfd}</style></head>` +
        `<body dir="rtl"><h1>${current.label}</h1><p>الفترة: من ${slashDate(fromEl.value)} إلى ${slashDate(toEl.value)}</p>` +
        `<h2>ملخص الإحصائيات</h2><table><tr><th>البند</th><th>العدد</th></tr>${cards}</table>` +
        `<h2>إحصائيات المعاملات</h2><table><tr><th>التصنيف</th><th>العدد</th></tr>${rows}</table></body></html>`;
      download(`itqan-report-${toEl.value}.doc`, 'application/msword', html);
    }
    function exportPdf() {
      if (!valid()) return;
      updateMeta();
      document.body.classList.add('rp-printing');
      addEventListener('afterprint', () => document.body.classList.remove('rp-printing'), { once: true });
      window.print();
    }

    typeEl.addEventListener('change', show);
    [fromEl, toEl].forEach(el => el.addEventListener('change', () => { showDates(); valid(); }));
    $('rp-view').addEventListener('click', show);
    $('rp-pdf').addEventListener('click', exportPdf);
    $('rp-word').addEventListener('click', exportWord);

    if (window.ResizeObserver) new ResizeObserver(() => { if (chartEl.clientWidth && chartEl.clientWidth !== lastW) drawChart(false); }).observe(chartEl);
    else addEventListener('resize', () => drawChart(false));

    showDates(); updateMeta();
    drawStats(.5);
    drawChart(true, .7);
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
