(() => {
  'use strict';
  const KEY = 'resetTracker.v1', UI = 'resetTracker.widgetMode';
  const SIZES = { open: [320, 210], min: [150, 110] };
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.startDate && s.target > 0) return s; } catch (e) {}
    return { startDate: today(), target: 30 };
  }

  function render() {
    const s = load(), t = s.target;
    const day = dayNum(today()) - dayNum(s.startDate) + 1;
    const shown = Math.max(0, Math.min(day, t));
    const rem = Math.max(0, t - shown);
    $('day').textContent = day < 1 ? 'Not started' : `Day ${shown} / ${t}`;
    $('rem').textContent = day > t ? 'Target reached' : `${rem} day${rem === 1 ? '' : 's'} remaining`;
    $('pill').textContent = `${shown}/${t}`;
    const bar = $('bar'); bar.innerHTML = '';
    if (t <= 60) {
      bar.className = 'bar';
      for (let i = 0; i < t; i++) { const e = document.createElement('i'); if (i < shown) e.className = 'on'; bar.appendChild(e); }
    } else {
      bar.className = 'bar solid';
      const f = document.createElement('i'); f.style.width = Math.round(shown / t * 100) + '%'; bar.appendChild(f);
    }
  }

  function place(mode) {
    const [w, h] = SIZES[mode];
    try {
      window.resizeTo(w, h);
      window.moveTo(screen.availLeft + screen.availWidth - w - 12, screen.availTop + screen.availHeight - h - 12);
    } catch (e) {}
  }
  function setMode(mode) {
    document.body.dataset.mode = mode;
    try { localStorage.setItem(UI, mode); } catch (e) {}
    place(mode);
  }
  function openFull() {
    const w = window.open('index.html', 'reset-full', 'popup,width=440,height=740');
    if (w) w.focus();
  }

  $('min').addEventListener('click', e => { e.stopPropagation(); setMode('min'); });
  $('pill').addEventListener('click', () => setMode('open'));
  $('card').addEventListener('click', openFull);
  $('card').addEventListener('keydown', e => { if (e.key === 'Enter') openFull(); });
  window.addEventListener('storage', render);
  setInterval(render, 30000);

  render();
  const saved = localStorage.getItem(UI) === 'min' ? 'min' : 'open';
  document.body.dataset.mode = saved;
  setTimeout(() => place(saved), 300);
})();
