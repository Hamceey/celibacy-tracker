(() => {
  'use strict';
  const KEY = 'resetTracker.v1';
  const ITEMS = [
    'No sex',
    'No masturbation or edging',
    'No pornography or erotic content',
    'No sexual messaging or deliberate stimulation',
    'No unnecessary romantic conversations',
    'Completed meaningful work and exercise'
  ];
  const $ = id => document.getElementById(id);

  // ---- dates (local calendar dates as YYYY-MM-DD, no hour maths) ----
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => fmt(new Date());
  const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const nice = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); };
  const addDays = (s, n) => { const d = new Date((dayNum(s) + n) * 864e5); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
  const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(dayNum(s));

  // ---- storage ----
  const defaults = () => ({ startDate: today(), target: 30, records: {} });
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && isDate(s.startDate) && s.target > 0 && s.records) return s;
    } catch (e) {}
    return defaults();
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { msg('Could not save to browser storage.'); }
  }

  let state = load();
  let draft = null;      // today's unsaved ticks
  let draftDate = null;
  let selected = null;   // history date being inspected

  const blank = () => ITEMS.map(() => false);
  function loadDraft() {
    draftDate = today();
    const r = state.records[draftDate];
    draft = r ? r.items.slice() : blank();
  }
  function msg(t) { $('save-msg').textContent = t; }

  // ---- render ----
  function renderProgress() {
    const diff = dayNum(today()) - dayNum(state.startDate);
    const t = state.target;
    const day = diff + 1;
    const done = day > t;
    const shown = Math.max(0, Math.min(day, t));
    $('title').textContent = `${t}-Day Reset`;
    $('counter').textContent = `${shown} / ${t}`;
    const badge = $('status');
    badge.className = 'badge';
    if (day < 1) { badge.textContent = 'NOT STARTED'; }
    else if (done) { badge.textContent = 'TARGET REACHED'; badge.classList.add('done'); }
    else badge.textContent = 'IN PROGRESS';
    const pct = Math.round(shown / t * 100);
    $('percent').textContent = day < 1 ? `Starts in ${-diff} day${-diff === 1 ? '' : 's'}` : `${pct}% elapsed`;
    const rem = Math.max(0, t - shown);
    $('remaining').textContent = done ? 'Target period complete. Well done.' : `${rem} day${rem === 1 ? '' : 's'} remaining`;
    const bar = $('bar');
    bar.setAttribute('aria-valuenow', pct);
    bar.innerHTML = '';
    if (t <= 60) {
      bar.className = 'bar';
      for (let i = 0; i < t; i++) {
        const s = document.createElement('i'); if (i < shown) s.className = 'on';
        const d = addDays(state.startDate, i);
        s.tabIndex = 0; s.setAttribute('role', 'button'); s.title = `Day ${i + 1} · ${nice(d)}`;
        const open = () => openDay(d);
        s.addEventListener('click', open);
        s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        bar.appendChild(s);
      }
    } else {
      bar.className = 'bar solid';
      const f = document.createElement('i'); f.style.width = pct + '%'; bar.appendChild(f);
    }
  }

  function renderChecks() {
    const ul = $('checks'); ul.innerHTML = '';
    ITEMS.forEach((text, i) => {
      const li = document.createElement('li');
      const lab = document.createElement('label');
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = draft[i];
      lab.classList.toggle('on', draft[i]);
      cb.addEventListener('change', () => { draft[i] = cb.checked; lab.classList.toggle('on', cb.checked); msg(''); });
      lab.append(cb, document.createTextNode(text));
      li.appendChild(lab); ul.appendChild(li);
    });
  }

  function renderHistory() {
    const ul = $('history'); ul.innerHTML = '';
    const dates = Object.keys(state.records).sort().reverse();
    if (!dates.length) {
      const li = document.createElement('li'); li.className = 'muted'; li.textContent = 'No saved check-ins yet.'; ul.appendChild(li);
    }
    dates.forEach(d => {
      const n = state.records[d].items.filter(Boolean).length;
      const li = document.createElement('li');
      const b = document.createElement('button');
      if (d === selected) b.className = 'sel';
      const left = document.createElement('span'); left.textContent = nice(d);
      const right = document.createElement('span');
      right.textContent = `${n}/${ITEMS.length} · ${Math.round(n / ITEMS.length * 100)}%`;
      if (n === ITEMS.length) { const t = document.createElement('span'); t.className = 'tag'; t.textContent = ' · Fully completed'; right.appendChild(t); }
      b.append(left, right);
      b.addEventListener('click', () => { selected = selected === d ? null : d; renderHistory(); });
      li.appendChild(b); ul.appendChild(li);
    });
    const det = $('detail');
    if (selected) {
      det.hidden = false; det.innerHTML = '';
      const h = document.createElement('p'); h.className = 'muted'; h.textContent = nice(selected); det.appendChild(h);
      const rec = state.records[selected];
      if (rec) {
        rec.items.forEach((on, i) => {
          const lab = document.createElement('label'); if (on) lab.className = 'on';
          const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = on; cb.disabled = true;
          lab.append(cb, document.createTextNode(ITEMS[i])); det.appendChild(lab);
        });
      } else {
        const m = document.createElement('p'); m.className = 'muted';
        m.textContent = dayNum(selected) > dayNum(today()) ? 'This day has not arrived yet.' : 'No check-in saved for this day.';
        det.appendChild(m);
      }
    } else det.hidden = true;
  }

  function openDay(d) {
    if (d === today()) { $('checks').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    selected = d; renderHistory(); $('detail').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function renderSettings() {
    $('start').value = state.startDate;
    $('target').value = state.target;
  }

  function renderAll() { renderProgress(); renderChecks(); renderHistory(); renderSettings(); }

  // ---- actions ----
  $('save').addEventListener('click', () => {
    state.records[draftDate] = { items: draft.slice(), savedAt: new Date().toISOString() };
    persist(); renderHistory(); msg('Check-in saved.');
  });
  $('clear').addEventListener('click', () => {
    if (!confirm("Clear today's checklist? Previous days are not affected.")) return;
    delete state.records[draftDate];
    draft = blank(); persist(); renderChecks(); renderHistory(); msg("Today's checklist cleared.");
  });
  $('apply').addEventListener('click', () => {
    const s = $('start').value, t = parseInt($('target').value, 10);
    if (!isDate(s) || !(t >= 1 && t <= 3650)) { alert('Enter a valid start date and a target between 1 and 3650 days.'); return; }
    state.startDate = s; state.target = t; persist(); renderProgress(); renderSettings();
  });
  $('newreset').addEventListener('click', () => {
    if (!confirm('Start a new reset from today? Your history is kept.')) return;
    state.startDate = today(); persist(); renderAll();
  });
  $('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `reset-backup-${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  });
  $('import').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || !isDate(d.startDate) || !(d.target >= 1) || typeof d.records !== 'object') throw 0;
        for (const k in d.records) if (!isDate(k) || !Array.isArray(d.records[k].items) || d.records[k].items.length !== ITEMS.length) throw 0;
        if (!confirm('Replace current data with this backup?')) return;
        state = { startDate: d.startDate, target: d.target, records: d.records };
        persist(); selected = null; loadDraft(); renderAll(); msg('Backup imported.');
      } catch (err) { alert('That file is not a valid backup.'); }
    };
    r.readAsText(f);
  });

  // new day: reload today's checklist
  setInterval(() => { if (today() !== draftDate) { loadDraft(); renderAll(); } }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && today() !== draftDate) { loadDraft(); renderAll(); } });

  loadDraft(); renderAll();
})();
