/* ===== Main app: views, actions, forms ===== */
const THEMES = [
  ['pink', 'ชมพูพาสเทล', '#ec6a9c'], ['lavender', 'ลาเวนเดอร์', '#9b7ede'], ['mint', 'มิ้นต์', '#3fb68b'],
  ['sky', 'ฟ้าใส', '#4a9be8'], ['peach', 'พีช', '#f08a5d'], ['navy', 'น้ำเงินเข้ม', '#3b82f6'], ['mono', 'มินิมอล', '#555555'],
];
const TABS = [
  ['home', '🏠', 'หน้าแรก'], ['plan', '📖', 'ตารางอ่าน'], ['subjects', '📚', 'แต่ละวิชา'], ['calendar', '📅', 'ปฏิทิน'],
  ['timer', '⏱️', 'จับเวลา'], ['stats', '📊', 'สถิติ'], ['ai', '🤖', 'AI ติว'],
];
const ALL_TABS = [...TABS, ['settings', '⚙️', 'ตั้งค่า']];

const App = {
  tab: 'home', calMonth: todayStr().slice(0, 7), statWeek: weekStart(todayStr()), showPast: false,
  aiSub: '', aiCh: '', aiBusy: false, replanPreview: null, fc: null, quiz: null,

  init() {
    this.applyTheme();
    const h = location.hash.slice(1); if (ALL_TABS.some(t => t[0] === h)) this.tab = h;
    window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (ALL_TABS.some(t => t[0] === h)) { this.tab = h; this.render(); } });
    changeListeners.push(() => { this.applyTheme(); this.render(); });
    bindEvents();
    this.render();
    FileStore.refreshCounts().then(() => this.render()).catch(() => { });
    Sync.init();
    Notifier.start();
    setInterval(() => Timer.tick(), 1000);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  },

  applyTheme() {
    document.documentElement.dataset.theme = DB.prefs.theme || 'navy';
    document.documentElement.dataset.home = this.tab === 'home' ? '1' : '0';
    document.documentElement.dataset.dark = DB.prefs.dark ? '1' : '0';
    const c = (THEMES.find(t => t[0] === DB.prefs.theme) || THEMES[0])[2];
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', DB.prefs.dark ? '#1d1a1f' : c);
  },

  go(tab) { location.hash = tab; this.tab = tab; this.render(); window.scrollTo({ top: 0 }); },

  render() {
    const hdr = document.getElementById('header');
    hdr.classList.toggle('compact', this.tab !== 'home');
    hdr.innerHTML = this.headerHTML();
    document.getElementById('nav').innerHTML = ALL_TABS.map(([id, ic, label]) =>
      `<button class="tab ${this.tab === id ? 'active' : ''}" data-act="go" data-tab="${id}"><span class="ic">${ic}</span><span>${label}</span></button>`).join('');
    const main = document.getElementById('main');
    main.innerHTML = (Views[this.tab] || Views.home)();
    syncGutters();
    if (this.tab === 'ai') { const box = document.getElementById('chatBox'); if (box) box.scrollTop = box.scrollHeight; }
  },

  renderTimerBits() {
    const sec = Timer.left(), txt = `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
    const d = document.getElementById('timerDisplay'); if (d) d.textContent = txt;
    const ring = document.getElementById('timerRing');
    if (ring) ring.style.setProperty('--p', (1 - sec / Timer.dur()) * 100);
    const btn = document.getElementById('timerStartBtn');
    if (btn) { btn.textContent = Timer.running ? '⏸ หยุดชั่วคราว' : '▶ เริ่ม'; btn.dataset.act = Timer.running ? 'timer-pause' : 'timer-start'; }
    const mini = document.getElementById('timerMini');
    if (mini) { mini.textContent = `⏱ ${txt}`; mini.style.display = Timer.running ? '' : 'none'; }
    document.title = Timer.running ? `${txt} · ${Timer.mode === 'work' ? 'โฟกัส' : 'พัก'} — LungAoodyPlanner` : 'LungAoodyPlanner 🐃';
  },

  headerHTML() {
    const t = todayStr(), ex = upcomingExams()[0];
    let left = '';
    if (this.tab === 'home') {
      let sub = 'เพิ่มวิชาและวันสอบเพื่อเริ่มวางแผนกันเลย ✨';
      if (ex) {
        const n = daysBetween(t, ex.examDate);
        sub = n === 0 ? `วันนี้สอบ ${esc(ex.name)} สู้ๆ นะ! 💪` : `อีก ${n} วันสอบ ${esc(ex.name)} — ค่อยๆ อ่านไปด้วยกันนะ`;
      }
      const greet = DB.prefs.theme === 'navy' ? 'หวัดดีค้าบ' : 'หวัดดีค่า';
      left = `<div class="hello">
        <div class="avatar">${avatarImg()}</div>
        <div><h1>${greet}${DB.name ? ' ' + esc(DB.name) : ''}</h1><p>${sub}</p></div>
      </div>`;
    } else {
      const cur = ALL_TABS.find(x => x[0] === this.tab) || ALL_TABS[0];
      left = `<div class="hello compact"><button class="avatar avatar-btn" data-act="go" data-tab="home" title="หน้าแรก">${avatarImg()}</button><h1>${cur[1]} ${cur[2]}</h1></div>`;
    }
    return `${left}
      <div class="head-actions">
        <button id="timerMini" class="chip accent" data-act="go" data-tab="timer" style="display:${Timer.running ? '' : 'none'}">⏱</button>
        ${this.syncBadgeHTML()}
        <button class="icon-btn ${this.tab === 'settings' ? 'active' : ''}" data-act="go" data-tab="settings" title="ตั้งค่า">⚙️</button>
        <button class="icon-btn" data-act="toggle-dark" title="โหมดมืด">${DB.prefs.dark ? '☀️' : '🌙'}</button>
      </div>`;
  },

  syncBadgeHTML() {
    const m = {
      off: ['💾 เก็บในเครื่อง', ''], loading: ['⏳ กำลังเชื่อมต่อ', ''], signedout: ['🔑 ล็อกอินเพื่อ sync', 'warn'],
      syncing: ['🔄 กำลัง sync', ''], synced: ['☁️ sync แล้ว', 'ok'], error: ['⚠️ sync ผิดพลาด', 'err'],
    }[Sync.status] || ['', ''];
    const act = Sync.status === 'signedout' ? 'login' : 'go';
    return `<button id="syncBadge" class="chip ${m[1]}" data-act="${act}" data-tab="settings" title="${esc(Sync.message)}">${m[0]}</button>`;
  },

  toast(msg, ms = 2800) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(this._tt); this._tt = setTimeout(() => el.classList.remove('show'), ms);
  },
};

/* ===== Modal ===== */
function openModal(title, html, wide = false) {
  const m = document.getElementById('modal');
  document.getElementById('modalTitle').innerHTML = title;
  document.getElementById('modalBody').innerHTML = html;
  m.querySelector('.modal-box').classList.toggle('wide', wide);
  m.classList.remove('hidden');
  setTimeout(() => m.querySelector('input:not([type=checkbox]):not([type=color]),textarea')?.focus(), 50);
}
function setModalBody(html) { document.getElementById('modalBody').innerHTML = html; }
function closeModal() {
  const needRender = !!(App.fc || App.filesSid);
  document.getElementById('modal').classList.add('hidden');
  App.fc = null; App.quiz = null; App.filesSid = null; App._examImg = null;
  if (needRender) App.render();
}

/* ===== Small UI pieces ===== */
const tag = id => `<span class="tag" style="--c:${subjectColor(id)}">${esc(subjectName(id))}</span>`;
const progressBar = (pct, color) => `<div class="bar-bg"><div class="bar-fill" style="width:${pct}%;${color ? 'background:' + color : ''}"></div></div>`;
const subjectOptions = (sel, allowNone = true) =>
  (allowNone ? `<option value="">— ทั่วไป —</option>` : '') + DB.subjects.map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
const empty = (icon, text, btn = '') => `<div class="empty"><div class="empty-ic">${icon}</div><p>${text}</p>${btn}</div>`;

function planItemHTML(p, showDate = false) {
  return `<div class="item ${p.done ? 'done' : ''}">
    <input type="checkbox" class="cb" data-act="toggle-plan" data-id="${p.id}" ${p.done ? 'checked' : ''}>
    ${tag(p.subjectId)}
    <span class="grow">${p.kind === 'review' ? '🔁 ' : ''}${esc(p.title)}${showDate ? ` <small class="muted">· ${fmtDate(p.date)}</small>` : ''}</span>
    <span class="item-actions"><button class="mini-btn" data-act="edit-plan" data-id="${p.id}" title="แก้ไข">✎</button>
    <button class="mini-btn" data-act="del-plan" data-id="${p.id}" title="ลบ">✕</button></span>
  </div>`;
}
function countdownCard(s) {
  const n = daysBetween(todayStr(), s.examDate);
  return `<div class="cd-card ${n <= 3 ? 'urgent' : ''}" style="--c:${s.color}" data-act="open-subject" data-id="${s.id}">
    <div class="cd-days">${n === 0 ? 'วันนี้!' : n + ' <small>วัน</small>'}</div>
    <div class="cd-name">${esc(s.name)}</div>
    <div class="cd-meta">${fmtDate(s.examDate)}${s.examTime ? ' · ' + esc(s.examTime) : ''}${roomText(s.room) ? ' · ห้อง ' + esc(roomText(s.room)) : ''}</div>
  </div>`;
}
function barChart(data, fmt = v => v) {
  const max = Math.max(1, ...data.map(d => d.value));
  const rainbow = DB.prefs.theme === 'navy';
  const pal = ['#4a9be8', '#e85d5d', '#f0a04b', '#3fb68b', '#9b7ede', '#ec6a9c', '#5cc5c5'];
  return `<div class="bars">${data.map((d, i) => `<div class="bar-col ${d.hl ? 'hl' : ''}">
    <div class="bar-val">${d.value ? fmt(d.value) : ''}</div>
    <div class="bar-track"><div class="bar" style="height:${d.value / max * 100}%;${rainbow ? 'background:' + pal[i % pal.length] : ''}"></div></div>
    <div class="bar-label">${d.label}</div></div>`).join('')}</div>`;
}


function roomText(room) {
  const r = String(room || '').trim();
  if (!r || /^\d{1,2}:\d{2}(\s*[-–]\s*\d{1,2}:\d{2})?$/.test(r)) return '';
  return r;
}
function dateField(label, name, value, required) {
  const v = value || '';
  return `<label class="field"><span>${label} <small class="muted">${v ? '(' + fmtDateBE(v) + ')' : ''}</small></span><input type="date" name="${name}" value="${esc(v)}" ${required ? 'required' : ''} data-chg="be-hint"></label>`;
}
function avatarImg() {
  return `<img class="avatar-img" src="assets/avatar-profile.webp" alt="อู๊ด" width="46" height="46" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/avatar-profile.png'}">`;
}
function coachBubble(kind) {
  const name = esc(DB.name || 'เพื่อน');
  const nextEx = upcomingExams()[0];
  if (kind === 'action') {
    return `<div class="coach-bubble warn"><b>อู๊ด:</b> อย่ามาอู้อ่านหนังสือนะ! 😤<br><span>${nextEx ? `อย่าคิดจะโดดคาบ ${esc(nextEx.name)} นะ!` : 'รีบไปอ่านหนังสือกัน!'}</span></div>`;
  }
  return `<div class="coach-bubble"><b>อู๊ด:</b> เฮ้ ${name}! วันนี้เราลุยวิชาไหนกันดี?<br><span>อย่าลืมเก็บเช็คลิสต์นะ สู้ๆ 💪</span></div>`;
}
function coachHeroHTML() {
  return `<section class="coach-hero">${coachBubble('hero')}<img src="assets/coach-hero-real.webp" alt="อู๊ด" class="coach-hero-img" width="117" height="210"></section>`;
}
function coachActionHTML() {
  return `<section class="coach-footer">${coachBubble('action')}<img src="assets/coach-action.webp" alt="อู๊ด" class="coach-action-img" width="139" height="180"></section>`;
}
function syncGutters() {
  const home = App.tab === 'home';
  document.documentElement.dataset.home = home ? '1' : '0';
  const right = document.getElementById('gutterRight');
  if (!right) return;
  if (!home) { right.innerHTML = ''; return; }
  right.innerHTML = `${coachBubble('hero')}<img src="assets/coach-hero-real.webp" alt="อู๊ด">`;
}
function normalizeLink(raw) {
  let url = String(raw || '').trim();
  if (!url) return { error: 'ใส่ลิงก์เอกสารด้วยนะ' };
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    if (/^([\w-]+\.)+[a-z]{2,}([/?#].*)?$/i.test(url)) url = 'https://' + url;
    else return { error: 'ลิงก์ไม่ถูกต้อง ใส่เช่น https://drive.google.com/...' };
  }
  try {
    const u = new URL(url);
    if (!/^https?:$/i.test(u.protocol)) return { error: 'ใช้ลิงก์ที่ขึ้นต้นด้วย http หรือ https นะ' };
    return { url: u.href };
  } catch { return { error: 'ลิงก์ไม่ถูกต้อง ใส่เช่น https://drive.google.com/...' }; }
}
function demoButtonHTML() {
  return hasDemo()
    ? `<button class="btn danger" data-act="clear-demo">ลบข้อมูลทดลอง</button>`
    : `<button class="btn ghost" data-act="load-demo">ใส่ข้อมูลทดลอง</button>`;
}

/* ===== Views ===== */
const Views = {
  home() {
    const t = todayStr();
    if (!DB.subjects.length) {
      return `${coachHeroHTML()}<section class="card welcome">
        <h2>ยินดีต้อนรับสู่ LungAoodyPlanner 🐃</h2>
        <p class="muted">เริ่มจาก 3 ขั้นง่ายๆ</p>
        <ol class="steps"><li>เพิ่มวิชา + วันสอบ</li><li>ใส่บท/หัวข้อที่ต้องอ่าน</li><li>กด "จัดตารางอัตโนมัติ" แล้วอ่านตามได้เลย</li></ol>
        ${!DB.name ? `<form data-form="name" class="row"><input name="name" placeholder="ให้เรียกคุณว่าอะไรดี?" value=""><button class="btn ghost">บันทึกชื่อ</button></form>` : ''}
        <div class="row center wrap">
          <button class="btn" data-act="add-subject">+ เพิ่มวิชาแรก</button>
          ${demoButtonHTML()}
        </div>
      </section>`;
    }
    const exams = upcomingExams();
    const today = planForDate(t);
    const overdue = DB.plan.filter(p => !p.done && p.date < t);
    const soonTasks = DB.tasks.filter(x => !x.done && x.date >= t && x.date <= addDays(t, 7)).sort((a, b) => a.date.localeCompare(b.date));
    const ws = weekStart(t);
    const week = [...Array(7)].map((_, i) => { const d = addDays(ws, i); return { label: TH_DAYS[parseDate(d).getDay()], value: minutesOn(d), hl: d === t }; });
    const weekTotal = week.reduce((a, d) => a + d.value, 0);
    const doneToday = today.filter(p => p.done).length;



    return `
    ${coachHeroHTML()}
    <section class="card">
      <h2>⏰ นับถอยหลังสอบ</h2>
      ${exams.length ? `<div class="cd-grid">${exams.map(countdownCard).join('')}</div>` : empty('🎉', 'ไม่มีสอบที่กำลังจะมาถึง')}
    </section>

    <div class="grid2">
      <section class="card today">
        <div class="card-head"><h2>📌 ตารางวันนี้ <small class="muted">(${fmtDateLong(t)})</small></h2>
          <span class="chip">${doneToday}/${today.length}</span></div>
        ${today.length ? today.map(p => planItemHTML(p)).join('') : empty('📖', 'วันนี้ยังไม่มีแผนอ่าน', `<button class="btn" data-act="auto-plan">✨ จัดตารางอัตโนมัติ</button>`)}
        ${overdue.length ? `<div class="warn-box">มีรายการค้าง ${overdue.length} อย่าง <button class="link" data-act="go" data-tab="plan">ดู</button> · <button class="link" data-act="auto-plan">จัดตารางใหม่</button></div>` : ''}
      </section>
      <section class="card">
        <div class="card-head"><h2>📝 การบ้าน / งานใกล้ถึง</h2><button class="mini-btn" data-act="add-task">+ เพิ่ม</button></div>
        ${soonTasks.length ? soonTasks.map(taskItemHTML).join('') : empty('☕', 'ไม่มีงานใน 7 วันนี้')}
      </section>
    </div>

    <div class="grid2">
      <section class="card">
        <h2>📊 ความคืบหน้าแต่ละวิชา</h2>
        ${DB.subjects.map(s => { const p = subjectProgress(s); return `<div class="prog-row" data-act="open-subject" data-id="${s.id}">
          <div class="prog-top"><span style="color:${s.color}">${esc(s.name)}</span><span class="muted">${p.done}/${p.total}</span></div>
          ${progressBar(p.pct, s.color)}</div>`; }).join('')}
      </section>
      <section class="card">
        <div class="card-head"><h2>⏱️ สัปดาห์นี้อ่านไป</h2><span class="chip accent">${fmtMin(weekTotal)}</span></div>
        ${barChart(week, v => Math.round(v / 6) / 10 + 'h')}
        <button class="btn ghost full" data-act="go" data-tab="timer">เริ่มจับเวลาอ่าน ▶</button>
      </section>
    </div>`;
  },

  plan() {
    const t = todayStr();
    const overdue = DB.plan.filter(p => !p.done && p.date < t).sort((a, b) => a.date.localeCompare(b.date));
    const future = DB.plan.filter(p => p.date >= t);
    const past = DB.plan.filter(p => p.date < t && p.done);
    const dates = [...new Set(future.map(p => p.date))];
    DB.subjects.forEach(s => { if (s.examDate && s.examDate >= t && !dates.includes(s.examDate)) dates.push(s.examDate); });
    dates.sort();
    const day = d => {
      const items = planForDate(d), exams = DB.subjects.filter(s => s.examDate === d);
      const n = daysBetween(t, d);
      return `<div class="day-group ${d === t ? 'is-today' : ''}">
        <div class="day-head"><b>${fmtDateLong(d)}</b> ${n === 0 ? '<span class="chip accent">วันนี้</span>' : n === 1 ? '<span class="chip">พรุ่งนี้</span>' : ''}
          ${exams.map(s => `<span class="exam-badge" style="--c:${s.color}">🎯 สอบ ${esc(s.name)} ${s.examTime || ''}</span>`).join('')}
          <button class="mini-btn right" data-act="add-plan" data-date="${d}">+</button></div>
        ${items.map(p => planItemHTML(p)).join('')}
      </div>`;
    };


    return `
    
    <section class="card">
      <div class="toolbar">
        <button class="btn" data-act="auto-plan">✨ จัดตารางอัตโนมัติ</button>
        <label class="inline">อ่านวันละ <input type="number" min="1" max="20" data-bind="prefs.chaptersPerDay" value="${DB.prefs.chaptersPerDay}" class="num"> บท</label>
        <label class="inline"><input type="checkbox" data-bind="prefs.reviewDayBefore" ${DB.prefs.reviewDayBefore ? 'checked' : ''}> ทบทวนวันก่อนสอบ</label>
        <span class="grow"></span>
        <button class="btn ghost" data-act="add-plan" data-date="${t}">+ เพิ่มเอง</button>
      </div>
      <p class="muted small">ระบบจะกระจายบทที่ยังไม่อ่านให้ทันวันสอบ โดยเน้นวิชาที่ใกล้สอบและเหลือเยอะก่อน (รายการที่เพิ่มเองและที่ติ๊กแล้วจะไม่ถูกลบ) · อยากให้ AI ช่วยจัดแบบมีเงื่อนไข ไปที่แท็บ <button class="link" data-act="go" data-tab="ai">AI ติว</button></p>
    </section>
    ${overdue.length ? `<section class="card warn-card"><div class="card-head"><h2>⚠️ ค้างอยู่ (${overdue.length})</h2><button class="btn small" data-act="auto-plan">จัดใหม่ให้ทัน</button></div>${overdue.map(p => planItemHTML(p, true)).join('')}</section>` : ''}
    <section class="card">
      ${dates.length ? dates.map(day).join('') : empty('🗓️', DB.subjects.length ? 'ยังไม่มีตาราง — กด "จัดตารางอัตโนมัติ" ได้เลย' : 'เพิ่มวิชาก่อนนะ', DB.subjects.length ? '' : `<button class="btn" data-act="add-subject">+ เพิ่มวิชา</button>`)}
    </section>
    ${past.length ? `<section class="card"><button class="link" data-act="toggle-past">${App.showPast ? '▾ ซ่อน' : '▸ แสดง'}รายการที่อ่านเสร็จแล้ว (${past.length})</button>
      ${App.showPast ? past.sort((a, b) => b.date.localeCompare(a.date)).map(p => planItemHTML(p, true)).join('') : ''}</section>` : ''}`;
  },

  subjects() {
    return `
    <div class="toolbar subjects-bar"><h2>📚 วิชาทั้งหมด (${DB.subjects.length})</h2>
      <button class="btn ghost" data-act="ai-add-exams">✨ เพิ่มตารางสอบด้วย AI</button>
      <button class="btn" data-act="add-subject">+ เพิ่มวิชา</button></div>
    ${DB.subjects.length ? '' : empty('📚', 'ยังไม่มีวิชา เพิ่มวิชาแรกกันเลย')}
    <div class="subj-list">${DB.subjects.map(s => {
      const p = subjectProgress(s), n = s.examDate ? daysBetween(todayStr(), s.examDate) : null;
      const fcN = DB.flashcards.filter(f => f.subjectId === s.id).length;
      const fileN = FileStore.count(s.id);
      return `<section class="card subj" id="subj-${s.id}" style="--c:${s.color}">
        <div class="subj-head">
          <div class="grow"><h3>${esc(s.name)}</h3>
            <div class="muted small">${s.examDate ? `🎯 สอบ ${fmtDateLong(s.examDate)}${s.examTime ? ' · ' + esc(s.examTime) : ''}${roomText(s.room) ? ' · ห้อง ' + esc(roomText(s.room)) : ''} ${n >= 0 ? `<b class="accent-text">(อีก ${n} วัน)</b>` : '<i>(สอบแล้ว)</i>'}` : 'ยังไม่กำหนดวันสอบ'}</div></div>
          <button class="mini-btn" data-act="edit-subject" data-id="${s.id}">✎ แก้ไข</button>
          <button class="mini-btn" data-act="del-subject" data-id="${s.id}">🗑</button>
        </div>
        <div class="prog-top"><span>ความคืบหน้า</span><span>${p.done}/${p.total} บท (${p.pct}%)</span></div>
        ${progressBar(p.pct, s.color)}
        <div class="chapters">${s.chapters.map((c, i) => `<div class="item ${c.done ? 'done' : ''}">
            <input type="checkbox" class="cb" data-act="toggle-chapter" data-sid="${s.id}" data-id="${c.id}" ${c.done ? 'checked' : ''}>
            <span class="grow">${esc(c.title)}</span>
            <span class="item-actions">
            <button class="mini-btn ${c.note ? 'has' : ''}" data-act="note" data-sid="${s.id}" data-id="${c.id}" title="โน้ต">📝${c.note ? '' : '+'}</button>
            <button class="mini-btn" data-act="move-chapter" data-sid="${s.id}" data-id="${c.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button class="mini-btn" data-act="rename-chapter" data-sid="${s.id}" data-id="${c.id}">✎</button>
            <button class="mini-btn" data-act="del-chapter" data-sid="${s.id}" data-id="${c.id}">✕</button>
            </span>
          </div>`).join('') || '<p class="muted small">ยังไม่มีบท</p>'}</div>
        <div class="row wrap">
          <button class="btn small" data-act="add-chapters" data-sid="${s.id}">+ เพิ่มบท</button>
          <button class="btn small ghost" data-act="files" data-sid="${s.id}">📎 ไฟล์ (${fileN})</button>
          <button class="btn small ghost" data-act="flashcards" data-sid="${s.id}">🃏 แฟลชการ์ด (${fcN})</button>
        </div>
      </section>`;
    }).join('')}</div>`;
  },

  calendar() {
    const [y, m] = App.calMonth.split('-').map(Number);
    const first = new Date(y, m - 1, 1), offset = first.getDay(), dim = new Date(y, m, 0).getDate();
    const cells = Math.ceil((offset + dim) / 7) * 7, t = todayStr();
    let html = '';
    for (let i = 0; i < cells; i++) {
      const d = toDateStr(new Date(y, m - 1, 1 - offset + i));
      const inMonth = d.slice(0, 7) === App.calMonth;
      const exams = DB.subjects.filter(s => s.examDate === d);
      const tasks = DB.tasks.filter(x => x.date === d);
      const plan = DB.plan.filter(p => p.date === d);
      html += `<div class="cal-cell ${inMonth ? '' : 'out'} ${d === t ? 'today' : ''}" data-act="cal-day" data-date="${d}">
        <div class="cal-num">${parseDate(d).getDate()}</div>
        ${exams.map(s => `<div class="cal-chip exam" style="--c:${s.color}">🎯 ${esc(s.name)}</div>`).join('')}
        ${tasks.map(x => `<div class="cal-chip task ${x.done ? 'done' : ''}">${x.type === 'event' ? '📌' : '📝'} ${esc(x.title)}</div>`).join('')}
        ${plan.length ? `<div class="cal-chip plan">📖 ${plan.filter(p => p.done).length}/${plan.length}</div>` : ''}
      </div>`;
    }
    const upcoming = DB.tasks.filter(x => !x.done && x.date >= t).sort((a, b) => a.date.localeCompare(b.date));


    return `
    
    <section class="card">
      <div class="toolbar">
        <button class="icon-btn" data-act="cal-nav" data-dir="-1">‹</button>
        <h2 class="cal-title">${TH_MONTHS_FULL[m - 1]} ${y + 543}</h2>
        <button class="icon-btn" data-act="cal-nav" data-dir="1">›</button>
        <button class="btn ghost small" data-act="cal-today">วันนี้</button>
        <span class="grow"></span>
        <button class="btn" data-act="add-task">+ การบ้าน/กิจกรรม</button>
      </div>
      <div class="cal-grid">${TH_DAYS.map(d => `<div class="cal-dow">${d}</div>`).join('')}${html}</div>
      <p class="muted small">🎯 วันสอบ · 📝 การบ้าน · 📌 กิจกรรม · 📖 แผนอ่าน (เสร็จ/ทั้งหมด) — แตะวันเพื่อดูรายละเอียด</p>
    </section>
    <section class="card"><h2>📝 การบ้าน/กิจกรรมที่ยังไม่เสร็จ</h2>
      ${upcoming.length ? upcoming.map(taskItemHTML).join('') : empty('✅', 'ไม่มีงานค้าง')}
    </section>`;
  },

  timer() {
    const p = DB.prefs.pomo, t = todayStr();
    const sessions = DB.sessions.filter(x => x.date === t).sort((a, b) => b.at - a.at);
    const total = sessions.reduce((a, x) => a + x.minutes, 0);
    const modes = [['work', '🎯 โฟกัส'], ['short', '☕ พักสั้น'], ['long', '🌙 พักยาว']];
    setTimeout(() => App.renderTimerBits(), 0);

    return `
    <div class="grid2">
      <section class="card timer-card">
        <div class="pills">${modes.map(([k, l]) => `<button class="pill ${Timer.mode === k ? 'active' : ''}" data-act="timer-mode" data-mode="${k}">${l}</button>`).join('')}</div>
        <div id="timerRing" class="ring ${Timer.mode}"><div class="ring-inner"><div id="timerDisplay" class="time">--:--</div>
          <div class="muted small">รอบที่ ${Timer.round + 1} · ${Timer.mode === 'work' ? 'ตั้งใจอ่านนะ' : 'พักสายตาหน่อย'}</div></div></div>
        <label class="field">อ่านวิชา<select data-chg="timer-subject">${subjectOptions(Timer.subjectId)}</select></label>
        <div class="row center wrap">
          <button id="timerStartBtn" class="btn big" data-act="timer-start">▶ เริ่ม</button>
          <button class="btn ghost" data-act="timer-reset">↺ รีเซ็ต</button>
          ${Timer.mode === 'work' ? `<button class="btn ghost" data-act="timer-stoplog">⏹ หยุด+บันทึก</button>` : ''}
          <button class="btn ghost" data-act="timer-skip">⏭ ข้าม</button>
        </div>
        <details class="settings-mini"><summary>ตั้งค่าเวลา</summary>
          <div class="row wrap">
            <label class="inline">โฟกัส <input type="number" class="num" min="1" data-bind="prefs.pomo.work" value="${p.work}"> น.</label>
            <label class="inline">พักสั้น <input type="number" class="num" min="1" data-bind="prefs.pomo.short" value="${p.short}"> น.</label>
            <label class="inline">พักยาว <input type="number" class="num" min="1" data-bind="prefs.pomo.long" value="${p.long}"> น.</label>
            <label class="inline">พักยาวทุก <input type="number" class="num" min="1" data-bind="prefs.pomo.every" value="${p.every}"> รอบ</label>
          </div></details>
      </section>
      <section class="card">
        <div class="card-head"><h2>📒 บันทึกการอ่านวันนี้</h2><span class="chip accent">${fmtMin(total)}</span></div>
        ${sessions.length ? sessions.map(x => `<div class="item">${tag(x.subjectId)}<span class="grow">${fmtMin(x.minutes)}</span>
          <small class="muted">${new Date(x.at).toTimeString().slice(0, 5)}</small>
          <button class="mini-btn" data-act="del-session" data-id="${x.id}">✕</button></div>`).join('') : empty('⏳', 'ยังไม่มีบันทึกวันนี้')}
        <h3>+ บันทึกเวลาเอง</h3>
        <form data-form="session" class="session-form">
          <label class="field">วิชา<select name="subjectId">${subjectOptions('')}</select></label>
          <div class="grid2-sm">
            <label class="field"><span>นาที</span><input name="minutes" type="number" min="1" placeholder="เช่น 45" required></label>
            <label class="field"><span>วันที่ <small class="muted">(${fmtDateBE(t)})</small></span><input name="date" type="date" value="${t}" data-chg="be-hint"></label>
          </div>
          <button class="btn small full">💾 บันทึกเวลา</button>
        </form>
      </section>
    </div>
    ${coachActionHTML()}`;
  },

  stats() {
    const ws = App.statWeek, t = todayStr();
    const days = [...Array(7)].map((_, i) => addDays(ws, i));
    const week = days.map(d => ({ label: TH_DAYS[parseDate(d).getDay()] + ' ' + parseDate(d).getDate(), value: minutesOn(d), hl: d === t }));
    const total = week.reduce((a, d) => a + d.value, 0);
    const chDone = DB.subjects.reduce((a, s) => a + s.chapters.filter(c => c.doneAt && c.doneAt >= ws && c.doneAt <= days[6]).length, 0);
    const active = d => minutesOn(d) > 0 || DB.plan.some(p => p.date === d && p.done);
    let streak = 0, sd = active(t) ? t : addDays(t, -1);
    while (active(sd) && streak < 1000) { streak++; sd = addDays(sd, -1); }
    const perSub = DB.subjects.map(s => ({ s, m: DB.sessions.filter(x => x.subjectId === s.id && x.date >= ws && x.date <= days[6]).reduce((a, x) => a + x.minutes, 0) })).sort((a, b) => b.m - a.m);
    const other = DB.sessions.filter(x => !subjectById(x.subjectId) && x.date >= ws && x.date <= days[6]).reduce((a, x) => a + x.minutes, 0);
    const maxSub = Math.max(1, ...perSub.map(x => x.m), other);
    const weeks = [...Array(8)].map((_, i) => { const w = addDays(weekStart(t), -7 * (7 - i)); let m = 0; for (let j = 0; j < 7; j++) m += minutesOn(addDays(w, j)); return { label: fmtDate(w), value: m, hl: w === ws }; });
    const allCh = DB.subjects.reduce((a, s) => a + s.chapters.length, 0), allDone = DB.subjects.reduce((a, s) => a + s.chapters.filter(c => c.done).length, 0);


    return `
    
    <section class="card">
      <div class="toolbar">
        <button class="icon-btn" data-act="week-nav" data-dir="-1">‹</button>
        <h2>สัปดาห์ ${fmtDateBE(ws)} – ${fmtDateBE(days[6])}</h2>
        <button class="icon-btn" data-act="week-nav" data-dir="1">›</button>
      </div>
      <div class="tiles">
        <div class="tile"><div class="tile-v">${(total / 60).toFixed(1)}</div><div class="muted small">ชั่วโมงที่อ่าน</div></div>
        <div class="tile"><div class="tile-v">${(total / 60 / 7).toFixed(1)}</div><div class="muted small">ชม./วัน เฉลี่ย</div></div>
        <div class="tile"><div class="tile-v">${chDone}</div><div class="muted small">บทที่อ่านจบ</div></div>
        <div class="tile"><div class="tile-v">${streak}🔥</div><div class="muted small">วันติดต่อกัน</div></div>
      </div>
      <h3>ชั่วโมงอ่านรายวัน</h3>
      ${barChart(week, v => (v / 60).toFixed(1))}
    </section>
    <div class="grid2">
      <section class="card"><h2>แยกตามวิชา (สัปดาห์นี้)</h2>
        ${perSub.map(({ s, m }) => `<div class="prog-row"><div class="prog-top"><span style="color:${s.color}">${esc(s.name)}</span><span class="muted">${fmtMin(m)}</span></div>${progressBar(m / maxSub * 100, s.color)}</div>`).join('')}
        ${other ? `<div class="prog-row"><div class="prog-top"><span>ทั่วไป</span><span class="muted">${fmtMin(other)}</span></div>${progressBar(other / maxSub * 100, '#aaa')}</div>` : ''}
        ${!DB.subjects.length ? empty('📊', 'ยังไม่มีข้อมูล') : ''}
      </section>
      <section class="card"><h2>แนวโน้ม 8 สัปดาห์ (ชม.)</h2>
        ${barChart(weeks, v => (v / 60).toFixed(1))}
        <p class="muted small">อ่านจบไปแล้วทั้งหมด ${allDone}/${allCh} บท</p>
        ${progressBar(allCh ? allDone / allCh * 100 : 0)}
      </section>
    </div>
    ${coachActionHTML()}`;
  },

  ai() {
    if (!AI.ready()) {
      return `<section class="card welcome"><h2>🤖 AI ติว</h2>
        <p>ต้องใส่ API key ก่อนนะ เลือกได้ทั้ง <b>Google Gemini</b> (มีโควตาฟรี) หรือ <b>OpenAI</b></p>
        <button class="btn" data-act="go" data-tab="settings">ไปที่ตั้งค่า AI →</button></section>`;
    }
    const sub = subjectById(App.aiSub) || DB.subjects[0];
    if (sub) App.aiSub = sub.id;
    const chs = sub ? sub.chapters : [];
    if (!chs.find(c => c.id === App.aiCh)) App.aiCh = chs[0]?.id || '';
    const chat = LOCAL.chat || [];
    const quick = ['วันนี้ควรอ่านอะไรก่อนดี?', 'ช่วยให้กำลังใจหน่อย 🥺', 'มีเทคนิคจำเนื้อหาเยอะๆ ไหม', 'ประเมินหน่อยว่าอ่านทันไหม'];

    return `
    <div class="ai-layout">
      <section class="card chat-card">
        <div class="card-head"><h2>💬 คุยกับน้องติว</h2><span class="chip">${esc(AI.providerLabel())}</span>
          <button class="mini-btn" data-act="clear-chat">ล้างแชท</button></div>
        <div id="chatBox" class="chat-box">
          ${chat.length ? chat.map(m => `<div class="msg ${m.role}">${m.role === 'assistant' ? md(m.content) : esc(m.content).replace(/\n/g, '<br>')}</div>`).join('') :
        `<div class="msg assistant">สวัสดีค่า 🌸 น้องติวพร้อมช่วยแล้ว ถามเนื้อหาที่ไม่เข้าใจ ให้อธิบาย ยกตัวอย่าง หรือให้ช่วยวางแผนการอ่านก็ได้นะคะ</div>`}
          ${App.aiBusy ? '<div class="msg assistant typing"><span></span><span></span><span></span></div>' : ''}
        </div>
        <div class="quick">${quick.map(q => `<button class="chip" data-act="quick-ask" data-q="${esc(q)}">${q}</button>`).join('')}</div>
        <form data-form="chat" class="chat-input">
          <textarea name="q" rows="2" placeholder="พิมพ์คำถาม… (Enter ส่ง, Shift+Enter ขึ้นบรรทัด)" ${App.aiBusy ? 'disabled' : ''}></textarea>
          <button class="btn" ${App.aiBusy ? 'disabled' : ''}>ส่ง</button>
        </form>
      </section>
      <section class="card tools-card">
        <h2>🧰 เครื่องมือ AI</h2>
        <button class="btn full" data-act="ai-add-exams" style="margin-top:0;margin-bottom:12px">📅 เพิ่มตารางสอบด้วย AI (ข้อความ/รูป)</button>
        ${sub ? `
        <label class="field">วิชา<select data-chg="ai-sub">${subjectOptions(App.aiSub, false)}</select></label>
        <label class="field">บท<select data-chg="ai-ch">${chs.map(c => `<option value="${c.id}" ${c.id === App.aiCh ? 'selected' : ''}>${esc(c.title)}${c.note ? ' 📝' : ''}</option>`).join('') || '<option value="">(ยังไม่มีบท)</option>'}</select></label>
        <div class="tool-btns">
          <button class="btn ghost" data-act="ai-summary" ${App.aiCh ? '' : 'disabled'}>📝 สรุปโน้ต</button>
          <button class="btn ghost" data-act="ai-flash" ${App.aiCh ? '' : 'disabled'}>🃏 สร้างแฟลชการ์ด</button>
          <button class="btn ghost" data-act="ai-quiz" ${App.aiCh ? '' : 'disabled'}>❓ ทำข้อสอบ</button>
          <button class="btn ghost" data-act="ai-explain" ${App.aiCh ? '' : 'disabled'}>💡 อธิบายบทนี้</button>
        </div>
        <p class="muted small">ถ้ามีโน้ตในบทนั้น AI จะใช้โน้ตของคุณเป็นหลัก</p>
        <hr>
        <h3>🗓️ ให้ AI จัดตารางใหม่</h3>
        <form data-form="replan">
          <textarea name="req" rows="3" placeholder="เช่น อ่านไม่ทันเลย / วันเสาร์ไม่ว่าง / อยากอ่านบัญชีเยอะๆ ก่อน"></textarea>
          <button class="btn full" ${App.aiBusy ? 'disabled' : ''}>✨ จัดตารางให้หน่อย</button>
        </form>` : empty('📚', 'เพิ่มวิชาก่อนนะ', `<button class="btn" data-act="add-subject">+ เพิ่มวิชา</button>`)}
      </section>
    </div>
    ${coachActionHTML()}`;
  },

  settings() {
    const L = LOCAL;
    const sstat = { off: 'ยังไม่ได้ตั้งค่า', loading: 'กำลังเชื่อมต่อ…', signedout: 'ยังไม่ได้ล็อกอิน', syncing: 'กำลัง sync…', synced: 'sync เรียบร้อย ✓', error: 'ผิดพลาด: ' + Sync.message }[Sync.status];
    const perm = Notifier.supported() ? Notification.permission : 'unsupported';
    const permUI = {
      default: '<span class="chip warn">ยังไม่เปิดสิทธิ์</span> <button class="btn small" data-act="ask-notify">🔔 ขออนุญาตแจ้งเตือน</button>',
      granted: '<span class="chip ok">เปิดรับแจ้งเตือนแล้ว ✓</span>',
      denied: '<span class="chip err">ถูกบล็อก — เปิดได้ที่ไอคอน 🔒 ข้างช่องเว็บ</span>',
      unsupported: '<span class="chip">เบราว์เซอร์นี้ไม่รองรับ</span>',
    }[perm];
    const C = aiCfg();
    const gemPresets = [
      ['gemini-3.8-flash', 'gemini-3.8-flash (แนะนำ · ฉลาดสมดุล)'],
      ['gemini-3.8-flash-lite', 'gemini-3.8-flash-lite (เร็วมาก)'],
      ['gemini-3.8-pro', 'gemini-3.8-pro (วิเคราะห์ลึก)'],
      ['gemini-2.5-flash', 'gemini-2.5-flash (สำหรับคีย์เดิม)'],
    ];
    const oaPresets = [
      ['gpt-4o-mini', 'gpt-4o-mini (แนะนำ · ประหยัด)'],
      ['gpt-4o', 'gpt-4o (ฉลาดขึ้น)'],
      ['gpt-4.1-mini', 'gpt-4.1-mini'],
    ];
    const presets = C.provider === 'gemini' ? gemPresets : oaPresets;
    const curModel = C.provider === 'gemini' ? C.geminiModel : C.openaiModel;
    const isCustom = App._customModel || !presets.some(([v]) => v === curModel);


    return `
    
    <section class="card"><h2>👤 ทั่วไป</h2>
      <form data-form="name" class="row"><input name="name" placeholder="ชื่อเล่น" value="${esc(DB.name)}"><button class="btn small">บันทึก</button></form>
    </section>

    <section class="card"><h2>🎨 ธีม</h2>
      <div class="theme-grid">${THEMES.map(([k, l, c]) => `<button class="theme-sw ${DB.prefs.theme === k ? 'active' : ''}" data-act="theme" data-theme="${k}" style="--c:${c}"><span class="dot"></span>${l}</button>`).join('')}</div>
      <label class="switch"><input type="checkbox" data-bind="prefs.dark" ${DB.prefs.dark ? 'checked' : ''}><span></span> โหมดมืด 🌙</label>
    </section>

    <section class="card"><h2>🔔 การแจ้งเตือน</h2>
      <label class="switch"><input type="checkbox" data-act="toggle-notify" ${DB.prefs.notify ? 'checked' : ''}><span></span> แจ้งเตือนทุกวันว่าต้องอ่านอะไร</label>
      <div class="row wrap">
        <label class="inline">เวลา <input type="time" data-bind="prefs.notifyTime" value="${DB.prefs.notifyTime}"></label>
        <button class="btn ghost small" data-act="test-notify">ทดสอบแจ้งเตือน</button>
      </div>
      <div class="row wrap" style="margin-top:10px">สถานะ: ${permUI}</div>
      <div class="guide-box">
        <b>📲 วิธีติดตั้งเป็นแอปบนมือถือ (เพื่อให้แจ้งเตือนและเปิดใช้ง่าย)</b>
        <div class="guide-cols">
          <div><b>🍎 iPhone (Safari)</b><br>1. กดปุ่ม <b>แชร์</b> (⬆️) ด้านล่าง<br>2. เลือก <b>เพิ่มไปยังหน้าจอโฮม</b><br>3. กด <b>เพิ่ม</b></div>
          <div><b>🤖 Android (Chrome)</b><br>1. กดเมนู <b>⋮</b> มุมขวาบน<br>2. เลือก <b>ติดตั้งแอป</b> หรือเพิ่มลงหน้าจอหลัก<br>3. กด <b>ติดตั้ง</b></div>
        </div>
      </div>
    </section>

    <section class="card"><h2>🤖 AI</h2>
      <div class="pills">
        <button class="pill ${C.provider === 'gemini' ? 'active' : ''}" data-act="ai-provider" data-p="gemini">Google Gemini</button>
        <button class="pill ${C.provider === 'openai' ? 'active' : ''}" data-act="ai-provider" data-p="openai">OpenAI</button>
      </div>
      ${C.provider === 'gemini' ? `
        <label class="field">Gemini API key <input type="password" data-ai="geminiKey" value="${esc(C.geminiKey)}" placeholder="AIza..."></label>
        <p class="muted small" style="margin-top:-6px">ขอ key ฟรีได้ที่ <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a></p>` : `
        <label class="field">OpenAI API key <input type="password" data-ai="openaiKey" value="${esc(C.openaiKey)}" placeholder="sk-..."></label>
        <p class="muted small" style="margin-top:-6px">สร้าง key ที่ <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a> (คิดเงินตามการใช้งาน)</p>`}
      <label class="field">รุ่นโมเดล
        <select data-chg="ai-model-select">
          ${presets.map(([v, lbl]) => `<option value="${v}" ${!isCustom && curModel === v ? 'selected' : ''}>${lbl}</option>`).join('')}
          <option value="__custom__" ${isCustom ? 'selected' : ''}>✏️ พิมพ์ชื่อรุ่นเอง (Custom)…</option>
        </select>
      </label>
      ${isCustom ? `<label class="field">ระบุชื่อรุ่นโมเดลเอง<input data-ai="${C.provider === 'gemini' ? 'geminiModel' : 'openaiModel'}" value="${esc(curModel)}" placeholder="เช่น gemini-3.8-flash"></label>` : ''}
      <button class="btn ghost small" data-act="test-ai">ทดสอบการเชื่อมต่อ</button>
      <label class="switch"><input type="checkbox" data-bind="ai.sync" ${DB.ai?.sync ? 'checked' : ''}><span></span> Sync API key ข้ามเครื่อง (เฉพาะในบัญชี Google ของคุณ)</label>
      <p class="muted small">🔐 <b>ความปลอดภัย:</b> API key ถูกเก็บไว้ในเบราว์เซอร์ของคุณเอง (และเฉพาะในบัญชี Google ส่วนตัวหากเปิด Sync) ข้อมูลจะส่งตรงไปยัง Google / OpenAI โดยไม่ผ่านเซิร์ฟเวอร์กลาง และไม่ติดไปในไฟล์ Export</p>
    </section>

    <section class="card"><h2>☁️ Sync ข้ามเครื่อง (Firebase)</h2>
      <p>สถานะ: <b>${sstat}</b> ${Sync.user ? `· ล็อกอินเป็น <b>${esc(Sync.user.email || Sync.user.displayName)}</b>` : ''}</p>
      <div class="row wrap">
        ${Sync.status === 'signedout' ? '<button class="btn" data-act="login">ล็อกอินด้วย Google</button>' : ''}
        ${Sync.user ? '<button class="btn ghost" data-act="logout">ออกจากระบบ</button> <button class="btn ghost" data-act="force-push">อัปโหลดข้อมูลเครื่องนี้ทับ cloud</button>' : ''}
      </div>
      <details><summary>ใช้ Firebase config อื่น (ไม่บังคับ)</summary>
        <textarea id="fbConfig" rows="8" placeholder="วาง firebaseConfig จาก Firebase Console ที่นี่ เช่น
const firebaseConfig = {
  apiKey: &quot;...&quot;,
  authDomain: &quot;...&quot;,
  projectId: &quot;...&quot;,
  ...
};">${esc(L.firebaseConfig)}</textarea>
        <div class="row"><button class="btn small" data-act="save-fb">บันทึกและเชื่อมต่อ</button>${L.firebaseConfig ? '<button class="btn ghost small" data-act="clear-fb">ลบ config</button>' : ''}</div>
        <p class="muted small">วิธีตั้งค่าทีละขั้นอยู่ในไฟล์ README.md · config นี้เก็บในเครื่อง ต้องวางในทุกเครื่องที่จะใช้ (ครั้งเดียว)</p>
      </details>
    </section>

    <section class="card"><h2>💾 ข้อมูล</h2>
      <div class="row wrap">
        <button class="btn ghost" data-act="export">⬇️ Export (สำรองไฟล์)</button>
        <label class="btn ghost">⬆️ Import<input type="file" accept=".json" data-chg="import" hidden></label>
        ${demoButtonHTML()}
      </div>
    </section>

    <section class="card danger-zone"><h2>⚠️ โซนอันตราย (Danger Zone)</h2>
      <p class="muted small">การล้างข้อมูลจะลบวิชา วันสอบ ตารางอ่าน โน้ต และสถิติทั้งหมด (ไม่สามารถกู้คืนได้หากไม่ได้ Export ไว้)</p>
      <button class="btn danger" data-act="reset">🗑️ ล้างข้อมูลทั้งหมด</button>
    </section>
    <p class="muted small center">LungAoodyPlanner 🐃 · ข้อมูลอัปเดตล่าสุด ${DB.updatedAt ? new Date(DB.updatedAt).toLocaleString('th-TH') : '-'}</p>`;
  },
};

function taskItemHTML(x) {
  const n = daysBetween(todayStr(), x.date);
  return `<div class="item ${x.done ? 'done' : ''}">
    <input type="checkbox" class="cb" data-act="toggle-task" data-id="${x.id}" ${x.done ? 'checked' : ''}>
    <span>${x.type === 'event' ? '📌' : '📝'}</span>
    ${x.subjectId ? tag(x.subjectId) : ''}
    <span class="grow">${esc(x.title)} <small class="muted">· ${fmtDate(x.date)}${x.time ? ' ' + x.time : ''}${!x.done && n >= 0 && n <= 1 ? (n === 0 ? ' · <b class="accent-text">วันนี้</b>' : ' · <b class="accent-text">พรุ่งนี้</b>') : ''}</small></span>
    <span class="item-actions"><button class="mini-btn" data-act="edit-task" data-id="${x.id}">✎</button>
    <button class="mini-btn" data-act="del-task" data-id="${x.id}">✕</button></span>
  </div>`;
}

/* ===== Modal contents ===== */
function subjectForm(s = {}) {
  const color = s.color || SUBJECT_COLORS[DB.subjects.length % SUBJECT_COLORS.length];
  return `<form data-form="subject" data-id="${s.id || ''}">
    <label class="field">ชื่อวิชา<input name="name" required value="${esc(s.name || '')}" placeholder="เช่น Managerial Accounting"></label>
    <div class="row wrap">
      ${dateField('วันสอบ', 'examDate', s.examDate || '')}
      <label class="field">เวลา<input type="time" name="examTime" value="${s.examTime || ''}"></label>
      <label class="field">ห้องสอบ / หมายเหตุ<input name="room" value="${esc(s.room || '')}" placeholder="เช่น อ่านเอง, ห้อง 301"></label>
    </div>
    <div class="field">สี<div class="colors">${SUBJECT_COLORS.map(c => `<label class="color-dot" style="--c:${c}"><input type="radio" name="color" value="${c}" ${c === color ? 'checked' : ''}><span></span></label>`).join('')}
      <input type="color" name="customColor" value="${color}" title="สีอื่น" data-chg="custom-color"></div></div>
    ${s.id ? '' : `<label class="field">บท/หัวข้อ (บรรทัดละ 1 บท, ใส่ทีหลังก็ได้)<textarea name="chapters" rows="4" placeholder="Ch1 Introduction&#10;Ch2 Cost behavior&#10;..."></textarea></label>`}
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function taskForm(x = {}) {
  return `<form data-form="task" data-id="${x.id || ''}">
    <label class="field">ชื่องาน<input name="title" required value="${esc(x.title || '')}" placeholder="เช่น ส่งรายงานกลุ่ม"></label>
    <div class="row wrap">
      <label class="field">ประเภท<select name="type"><option value="homework" ${x.type !== 'event' ? 'selected' : ''}>📝 การบ้าน</option><option value="event" ${x.type === 'event' ? 'selected' : ''}>📌 กิจกรรม</option></select></label>
      ${dateField('วันที่', 'date', x.date || todayStr(), true)}
      <label class="field">เวลา<input type="time" name="time" value="${x.time || ''}"></label>
    </div>
    <label class="field">วิชา<select name="subjectId">${subjectOptions(x.subjectId || '')}</select></label>
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function planForm(p = {}) {
  const sid = p.subjectId || DB.subjects[0]?.id || '';
  return `<form data-form="plan" data-id="${p.id || ''}">
    <label class="field">วิชา<select name="subjectId" data-chg="plan-sub">${subjectOptions(sid)}</select></label>
    <label class="field">บท (เลือก หรือพิมพ์เองด้านล่าง)<select name="chapterId" id="planCh">${planChapterOptions(sid, p.chapterId)}</select></label>
    <label class="field">รายละเอียด<input name="title" value="${esc(p.chapterId ? '' : (p.title || ''))}" placeholder="เช่น ทำแบบฝึกหัดบท 3"></label>
    ${dateField('วันที่', 'date', p.date || todayStr(), true)}
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function planChapterOptions(sid, sel) {
  const s = subjectById(sid);
  return `<option value="">— ไม่ระบุบท —</option>` + (s ? s.chapters.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.title)}${c.done ? ' ✓' : ''}</option>`).join('') : '');
}
function noteModal(s, c) {
  openModal(`📝 ${esc(s.name)} — ${esc(c.title)}`, `
    <form data-form="note" data-sid="${s.id}" data-id="${c.id}">
      <textarea name="note" id="noteText" rows="14" placeholder="จดโน้ต / สรุปของบทนี้…">${esc(c.note || '')}</textarea>
      <div class="row wrap">
        <button class="btn">💾 บันทึก</button>
        <button type="button" class="btn ghost" data-act="ai-summary-note" data-sid="${s.id}" data-id="${c.id}">✨ AI สรุปให้</button>
        <button type="button" class="btn ghost" data-act="ai-flash" data-sid="${s.id}" data-id="${c.id}">🃏 แฟลชการ์ด</button>
        <button type="button" class="btn ghost" data-act="ai-quiz" data-sid="${s.id}" data-id="${c.id}">❓ ข้อสอบ</button>
      </div>
      <div id="aiOut"></div>
    </form>`, true);
}
function dayModal(d) {
  const exams = DB.subjects.filter(s => s.examDate === d), tasks = DB.tasks.filter(x => x.date === d), plan = planForDate(d);
  openModal(`📅 ${fmtDateLong(d)}`, `
    ${exams.map(s => `<div class="exam-badge big" style="--c:${s.color}">🎯 สอบ ${esc(s.name)} ${s.examTime || ''} ${roomText(s.room) ? '· ห้อง ' + esc(roomText(s.room)) : ''}</div>`).join('')}
    <h3>📖 แผนอ่าน</h3>${plan.length ? plan.map(p => planItemHTML(p)).join('') : '<p class="muted small">ไม่มี</p>'}
    <h3>📝 การบ้าน / กิจกรรม</h3>${tasks.length ? tasks.map(taskItemHTML).join('') : '<p class="muted small">ไม่มี</p>'}
    <div class="row wrap"><button class="btn small" data-act="add-task" data-date="${d}">+ การบ้าน/กิจกรรม</button><button class="btn small ghost" data-act="add-plan" data-date="${d}">+ แผนอ่าน</button></div>`);
}

/* flashcards */
function fcRender() {
  const f = App.fc; if (!f) return;
  let cards = DB.flashcards.filter(x => x.subjectId === f.sid);
  if (f.onlyUnknown) cards = cards.filter(x => !x.known);
  const s = subjectById(f.sid);
  if (f.mode === 'list') {
    setModalBody(`
      <div class="row wrap"><button class="btn small" data-act="fc-mode" data-m="review">▶ เริ่มทบทวน</button>
      <label class="inline"><input type="checkbox" data-act="fc-unknown" ${f.onlyUnknown ? 'checked' : ''}> เฉพาะที่ยังจำไม่ได้</label></div>
      <form data-form="fc-add" class="fc-add"><input name="q" placeholder="คำถาม / คำศัพท์" required><input name="a" placeholder="คำตอบ" required><button class="btn small">+ เพิ่ม</button></form>
      ${cards.map(x => `<div class="item ${x.known ? 'done' : ''}"><span class="grow"><b>${esc(x.q)}</b><br><small class="muted">${esc(x.a)}</small></span>
        <button class="mini-btn" data-act="fc-del" data-id="${x.id}">✕</button></div>`).join('') || '<p class="muted">ยังไม่มีการ์ด — เพิ่มเอง หรือให้ AI สร้างจากโน้ต (แท็บ AI ติว / ปุ่มในโน้ต)</p>'}`);
    return;
  }
  if (!cards.length) { f.mode = 'list'; return fcRender(); }
  f.idx = Math.min(f.idx, cards.length - 1);
  const c = cards[f.idx];
  setModalBody(`
    <div class="row"><span class="muted grow">${f.idx + 1} / ${cards.length}</span><button class="link" data-act="fc-mode" data-m="list">ดูรายการ</button></div>
    <div class="flash ${f.flipped ? 'flipped' : ''}" data-act="fc-flip" style="--c:${s?.color}">
      <div class="flash-inner"><div class="flash-front">${esc(c.q)}</div><div class="flash-back">${esc(c.a)}</div></div>
    </div>
    <p class="muted small center">แตะการ์ดเพื่อพลิก</p>
    <div class="row center wrap">
      <button class="btn ghost" data-act="fc-step" data-d="-1">‹ ก่อนหน้า</button>
      <button class="btn ghost" data-act="fc-known" data-id="${c.id}" data-v="0">😵 ยังไม่ได้</button>
      <button class="btn" data-act="fc-known" data-id="${c.id}" data-v="1">😊 จำได้แล้ว</button>
      <button class="btn ghost" data-act="fc-step" data-d="1">ถัดไป ›</button>
    </div>`);
}
function openFlashcards(sid) {
  App.fc = { sid, idx: 0, flipped: false, mode: 'review', onlyUnknown: false };
  if (!DB.flashcards.some(x => x.subjectId === sid)) App.fc.mode = 'list';
  openModal(`🃏 แฟลชการ์ด — ${esc(subjectName(sid))}`, '', true);
  App.fc && fcRender();
}

/* quiz */
function quizRender() {
  const q = App.quiz; if (!q) return;
  const score = q.items.reduce((a, it, i) => a + (q.answers[i] === it.answer ? 1 : 0), 0);
  setModalBody(`
    ${q.submitted ? `<div class="score">ได้ ${score} / ${q.items.length} คะแนน ${score === q.items.length ? '🎉 เก่งมาก!' : score >= q.items.length / 2 ? '👍 ดีเลย' : '💪 ทบทวนอีกนิดนะ'}</div>` : ''}
    ${q.items.map((it, i) => `<div class="quiz-q"><p><b>${i + 1}.</b> ${esc(it.q)}</p>
      ${it.choices.map((c, j) => {
        let cls = ''; if (q.submitted) { if (j === it.answer) cls = 'correct'; else if (q.answers[i] === j) cls = 'wrong'; }
        return `<label class="choice ${cls} ${q.answers[i] === j ? 'sel' : ''}"><input type="radio" name="q${i}" data-act="quiz-pick" data-i="${i}" data-j="${j}" ${q.answers[i] === j ? 'checked' : ''} ${q.submitted ? 'disabled' : ''}> ${esc(c)}</label>`;
      }).join('')}
      ${q.submitted && it.explain ? `<p class="explain">💡 ${esc(it.explain)}</p>` : ''}</div>`).join('')}
    <div class="row end">${q.submitted ? `<button class="btn ghost" data-act="quiz-retry">ทำใหม่</button><button class="btn" data-act="ai-quiz" data-sid="${q.sid}" data-id="${q.cid}">ข้อสอบชุดใหม่</button>` : `<button class="btn" data-act="quiz-submit">ส่งคำตอบ</button>`}</div>`);
}

/* ===== Files per subject ===== */
const fileIcon = (type, name) => {
  if (/pdf/i.test(type) || /\.pdf$/i.test(name)) return '📄';
  if (/image/i.test(type) || /\.(png|jpe?g|gif|webp)$/i.test(name)) return '🖼️';
  if (/presentation|powerpoint|\.pptx?$/i.test(type + name)) return '📊';
  if (/word|document|\.docx?$/i.test(type + name)) return '📝';
  if (/sheet|excel|\.xlsx?$/i.test(type + name)) return '📈';
  return '📁';
};
async function filesRender() {
  const sid = App.filesSid; if (!sid) return;
  const s = subjectById(sid); if (!s) return;
  const files = await FileStore.list(sid).catch(() => []);
  const links = s.links || [];
  setModalBody(`
    <label class="upload-box">
      <input type="file" multiple data-chg="file-upload" hidden>
      <div>📤 <b>เลือกไฟล์จากเครื่อง</b> (PDF, รูปภาพ, สไลด์, เอกสาร — เลือกได้หลายไฟล์)</div>
      <div class="muted small">เก็บไว้ในเครื่องนี้ เปิดดูและดาวน์โหลดได้แม้ออฟไลน์</div>
    </label>
    <h3>📁 ไฟล์ที่บันทึกไว้ (${files.length})</h3>
    ${files.length ? files.map(f => `<div class="item">
      <span>${fileIcon(f.type, f.name)}</span>
      <span class="grow"><b>${esc(f.name)}</b><br><small class="muted">${fmtSize(f.size)} · ${new Date(f.addedAt).toLocaleDateString('th-TH')}</small></span>
      <button class="mini-btn" data-act="file-open" data-id="${f.id}">เปิดดู</button>
      <button class="mini-btn" data-act="file-dl" data-id="${f.id}">⬇️</button>
      <button class="mini-btn" data-act="file-del" data-id="${f.id}">✕</button>
    </div>`).join('') : '<p class="muted small">ยังไม่มีไฟล์</p>'}
    <hr>
    <h3>🔗 ลิงก์เอกสาร (Google Drive, Notion, YouTube ฯลฯ)</h3>
    <form data-form="link-add" class="link-form" novalidate>
      <label class="field">ชื่อเอกสาร
        <input name="title" placeholder="ชื่อเอกสาร" required>
      </label>
      <label class="field">ลิงก์
        <input name="url" type="text" inputmode="url" placeholder="ลิงก์ เช่น https://drive.google.com/..." autocomplete="url" required>
        <small class="field-error" data-url-error hidden></small>
      </label>
      <button class="btn small">+ เพิ่ม</button>
    </form>
    ${links.length ? links.map(l => `<div class="item">
      <span>🔗</span>
      <a class="grow" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title)}</a>
      <button class="mini-btn" data-act="link-del" data-id="${l.id}">✕</button>
    </div>`).join('') : '<p class="muted small">ยังไม่มีลิงก์ (ลิงก์จะ sync ข้ามเครื่องด้วย)</p>'}`);
}
function openFilesModal(sid) {
  App.filesSid = sid;
  openModal(`📎 ไฟล์และเอกสาร — ${esc(subjectName(sid))}`, '<p class="muted">กำลังโหลด…</p>', true);
  filesRender();
}

/* ===== AI Add Exam Schedule ===== */
function openAIExamModal() {
  if (!AI.ready()) { App.toast('ใส่ API key ในตั้งค่าก่อนนะ'); App.go('settings'); return; }
  App._examImg = null;
  openModal('✨ เพิ่มตารางสอบด้วย AI', `
    <p class="muted small">พิมพ์/วางข้อความตารางสอบ หรือแนบรูปตารางสอบได้เลย เดี๋ยว AI ช่วยแยกชื่อวิชา วันสอบ และเวลาให้เอง</p>
    <form data-form="ai-exams">
      <label class="field">ข้อความ / รายละเอียดตารางสอบ
        <textarea name="text" rows="4" placeholder="เช่น&#10;5500111 EXP ENG I สอบ 23 พ.ย. 2569 08:30-10:30&#10;2301119 CAL BUS สอบ 25 พ.ย. 2569 08:30-11:30"></textarea>
      </label>
      <label class="upload-box small">
        <input type="file" accept="image/*" data-chg="exam-img" hidden>
        <span id="examImgLabel">🖼️ แนบรูปภาพตารางสอบ (ไม่บังคับ)</span>
      </label>
      <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">✨ ให้ AI อ่านตาราง</button></div>
    </form>`, true);
}

/* ===== AI helpers ===== */
async function aiRun(label, fn) {
  if (!AI.ready()) { App.toast('ใส่ API key ในตั้งค่าก่อนนะ'); App.go('settings'); return; }
  App.toast(`✨ ${label}…`, 15000);
  try { const r = await fn(); App.toast('เสร็จแล้ว ✓', 1200); return r; }
  catch (e) { App.toast('AI ผิดพลาด: ' + e.message, 6000); console.error(e); }
}
function getSC(el) {
  const sid = el.dataset.sid || App.aiSub, cid = el.dataset.id && el.dataset.sid ? el.dataset.id : App.aiCh;
  const s = subjectById(sid), c = s?.chapters.find(c => c.id === cid);
  return { s, c };
}
async function sendChat(q) {
  q = (q || '').trim(); if (!q || App.aiBusy) return;
  LOCAL.chat = LOCAL.chat || [];
  LOCAL.chat.push({ role: 'user', content: q }); saveLocal();
  App.aiBusy = true; App.render();
  try {
    const ans = await AI.chat(LOCAL.chat.slice(-20));
    LOCAL.chat.push({ role: 'assistant', content: ans });
  } catch (e) { LOCAL.chat.push({ role: 'assistant', content: '⚠️ ' + e.message }); }
  App.aiBusy = false; saveLocal(); if (App.tab === 'ai') App.render();
}

/* ===== Actions ===== */
const Actions = {
  'go': el => { closeModal(); App.go(el.dataset.tab); },
  'close-modal': () => closeModal(),
  'toggle-dark': () => { DB.prefs.dark = !DB.prefs.dark; save(); },
  'theme': el => { DB.prefs.theme = el.dataset.theme; DB.prefs.themeChosen = true; save(); },
  'toggle-past': () => { App.showPast = !App.showPast; App.render(); },

  // plan
  'auto-plan': () => {
    const r = autoSchedule(); save();
    if (r.noExam) App.toast('ต้องมีวิชาที่กำหนดวันสอบ (หลังวันนี้) ก่อนนะ');
    else App.toast(r.leftover ? `จัดแล้ว ${r.added} รายการ แต่ยังเหลือ ${r.leftover} บทที่อ่านไม่ทัน 😥 ลองเพิ่ม "บท/วัน"` : `จัดตารางเรียบร้อย ${r.added} รายการ ✨`, 4500);
  },
  'toggle-plan': el => {
    const p = DB.plan.find(x => x.id === el.dataset.id); if (!p) return;
    p.done = el.checked;
    if (p.chapterId && p.kind === 'read') setChapterDone(p.subjectId, p.chapterId, p.done);
    save(); refreshDayModal();
    if (p.done) App.toast(['เก่งมาก! 🎉', 'อีกนิดเดียว สู้ๆ 💪', 'เยี่ยมไปเลย ✨', 'ภูมิใจในตัวเองด้วยนะ 🌸'][Math.floor(Math.random() * 4)], 1500);
  },
  'add-plan': el => { if (!DB.subjects.length) return App.toast('เพิ่มวิชาก่อนนะ'); openModal('+ เพิ่มแผนอ่าน', planForm({ date: el.dataset.date })); },
  'edit-plan': el => { const p = DB.plan.find(x => x.id === el.dataset.id); if (p) openModal('✎ แก้ไขแผนอ่าน', planForm(p)); },
  'del-plan': el => { DB.plan = DB.plan.filter(x => x.id !== el.dataset.id); save(); refreshDayModal(); },

  // subjects
  'add-subject': () => openModal('+ เพิ่มวิชา', subjectForm()),
  'edit-subject': el => openModal('✎ แก้ไขวิชา', subjectForm(subjectById(el.dataset.id))),
  'del-subject': el => {
    const s = subjectById(el.dataset.id);
    if (!confirm(`ลบวิชา "${s.name}" และแผน/แฟลชการ์ด/ไฟล์ที่เกี่ยวข้อง?`)) return;
    DB.subjects = DB.subjects.filter(x => x.id !== s.id);
    DB.plan = DB.plan.filter(x => x.subjectId !== s.id);
    DB.flashcards = DB.flashcards.filter(x => x.subjectId !== s.id);
    FileStore.delSubject(s.id).catch(() => { });
    save();
  },
  'open-subject': el => { App.go('subjects'); setTimeout(() => document.getElementById('subj-' + el.dataset.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); },
  'toggle-chapter': el => { setChapterDone(el.dataset.sid, el.dataset.id, el.checked); save(); },
  'add-chapters': el => openModal('+ เพิ่มบท/หัวข้อ', `<form data-form="chapters" data-sid="${el.dataset.sid}">
      <label class="field">บรรทัดละ 1 บท<textarea name="list" rows="6" placeholder="Ch1 ...&#10;Ch2 ..."></textarea></label>
      <p class="muted small">หรือสร้างอัตโนมัติ:</p>
      <div class="row wrap"><input name="prefix" value="บทที่ " class="num-lg"><label class="inline">จำนวน <input name="count" type="number" min="0" max="100" class="num"> บท</label></div>
      <div class="row end"><button class="btn">เพิ่ม</button></div></form>`),
  'rename-chapter': el => {
    const s = subjectById(el.dataset.sid), c = s.chapters.find(c => c.id === el.dataset.id);
    const v = prompt('ชื่อบท', c.title); if (v && v.trim()) { c.title = v.trim(); DB.plan.forEach(p => { if (p.chapterId === c.id) p.title = c.title; }); save(); }
  },
  'del-chapter': el => {
    const s = subjectById(el.dataset.sid); if (!confirm('ลบบทนี้?')) return;
    s.chapters = s.chapters.filter(c => c.id !== el.dataset.id); DB.plan = DB.plan.filter(p => p.chapterId !== el.dataset.id); save();
  },
  'move-chapter': el => {
    const s = subjectById(el.dataset.sid), i = s.chapters.findIndex(c => c.id === el.dataset.id), j = i + Number(el.dataset.dir);
    if (j < 0 || j >= s.chapters.length) return;
    [s.chapters[i], s.chapters[j]] = [s.chapters[j], s.chapters[i]]; save();
  },
  'note': el => { const { s, c } = getSC(el); if (c) noteModal(s, c); },

  // tasks
  'add-task': el => openModal('+ การบ้าน / กิจกรรม', taskForm({ date: el.dataset.date })),
  'edit-task': el => openModal('✎ แก้ไข', taskForm(DB.tasks.find(x => x.id === el.dataset.id))),
  'del-task': el => { DB.tasks = DB.tasks.filter(x => x.id !== el.dataset.id); save(); refreshDayModal(); },
  'toggle-task': el => { const x = DB.tasks.find(x => x.id === el.dataset.id); if (x) { x.done = el.checked; save(); refreshDayModal(); } },

  // calendar
  'cal-nav': el => { const [y, m] = App.calMonth.split('-').map(Number); const d = new Date(y, m - 1 + Number(el.dataset.dir), 1); App.calMonth = toDateStr(d).slice(0, 7); App.render(); },
  'cal-today': () => { App.calMonth = todayStr().slice(0, 7); App.render(); },
  'cal-day': (el, e) => { if (e.target.closest('.cal-cell') === el) { App._dayOpen = el.dataset.date; dayModal(el.dataset.date); } },

  // timer
  'timer-start': () => Timer.start(),
  'timer-pause': () => Timer.pause(),
  'timer-reset': () => Timer.reset(),
  'timer-stoplog': () => Timer.stopAndLog(),
  'timer-skip': () => { Timer.mode = Timer.mode === 'work' ? 'short' : 'work'; Timer.reset(); App.render(); },
  'timer-mode': el => { Timer.setMode(el.dataset.mode); App.render(); },
  'del-session': el => { DB.sessions = DB.sessions.filter(x => x.id !== el.dataset.id); save(); },

  // stats
  'week-nav': el => { App.statWeek = addDays(App.statWeek, 7 * Number(el.dataset.dir)); App.render(); },

  // flashcards
  'flashcards': el => openFlashcards(el.dataset.sid),
  'fc-flip': () => { App.fc.flipped = !App.fc.flipped; fcRender(); },
  'fc-step': el => {
    const n = DB.flashcards.filter(x => x.subjectId === App.fc.sid && (!App.fc.onlyUnknown || !x.known)).length;
    App.fc.idx = (App.fc.idx + Number(el.dataset.d) + n) % n; App.fc.flipped = false; fcRender();
  },
  'fc-known': el => {
    const c = DB.flashcards.find(x => x.id === el.dataset.id); c.known = el.dataset.v === '1'; save({ silent: true });
    if (!App.fc.onlyUnknown || !c.known) App.fc.idx++;
    const n = DB.flashcards.filter(x => x.subjectId === App.fc.sid && (!App.fc.onlyUnknown || !x.known)).length;
    if (App.fc.idx >= n) { App.fc.idx = 0; App.toast('ครบทุกใบแล้ว วนรอบใหม่ 🔁'); }
    App.fc.flipped = false; fcRender();
  },
  'fc-mode': el => { App.fc.mode = el.dataset.m; App.fc.idx = 0; App.fc.flipped = false; fcRender(); },
  'fc-unknown': el => { App.fc.onlyUnknown = el.checked; fcRender(); },
  'fc-del': el => { DB.flashcards = DB.flashcards.filter(x => x.id !== el.dataset.id); save({ silent: true }); fcRender(); },

  // quiz
  'quiz-pick': el => { App.quiz.answers[el.dataset.i] = Number(el.dataset.j); quizRender(); },
  'quiz-submit': () => { App.quiz.submitted = true; quizRender(); document.getElementById('modalBody').scrollTop = 0; },
  'quiz-retry': () => { App.quiz.answers = {}; App.quiz.submitted = false; quizRender(); },

  // files
  'files': el => openFilesModal(el.dataset.sid),
  'file-open': async el => {
    const r = await FileStore.get(el.dataset.id); if (!r) return;
    window.open(URL.createObjectURL(r.blob), '_blank');
  },
  'file-dl': async el => {
    const r = await FileStore.get(el.dataset.id); if (!r) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(r.blob); a.download = r.name; a.click();
  },
  'file-del': async el => {
    if (!confirm('ลบไฟล์นี้?')) return;
    await FileStore.del(el.dataset.id, App.filesSid);
    filesRender();
  },
  'link-del': el => {
    const s = subjectById(App.filesSid); if (!s) return;
    s.links = (s.links || []).filter(l => l.id !== el.dataset.id);
    save({ silent: true }); filesRender();
  },

  // AI
  'ai-add-exams': () => openAIExamModal(),
  'apply-ai-exams': () => {
    const items = App._examPreview || [];
    let added = 0, updated = 0;
    items.forEach((x, idx) => {
      const cb = document.querySelector(`input[data-exam-idx="${idx}"]`);
      if (cb && !cb.checked) return;
      const existing = DB.subjects.find(s => s.name.trim().toLowerCase() === x.name.trim().toLowerCase());
      if (existing) {
        if (x.examDate) existing.examDate = x.examDate;
        if (x.examTime) existing.examTime = x.examTime;
        if (x.room) existing.room = x.room;
        (x.chapters || []).forEach(t => { if (t && !existing.chapters.some(c => c.title === t)) existing.chapters.push({ id: uid(), title: t, done: false, note: '' }); });
        updated++;
      } else {
        DB.subjects.push({
          id: uid(), name: x.name, examDate: x.examDate || '', examTime: x.examTime || '', room: x.room || '',
          color: SUBJECT_COLORS[DB.subjects.length % SUBJECT_COLORS.length],
          chapters: (x.chapters || []).map(t => ({ id: uid(), title: String(t), done: false, note: '' })),
        });
        added++;
      }
    });
    App._examPreview = null; closeModal(); save();
    App.toast(`เพิ่ม ${added} วิชา${updated ? `, อัปเดต ${updated} วิชา` : ''} เรียบร้อย ✨`);
    App.go('subjects');
  },
  'quick-ask': el => sendChat(el.dataset.q),
  'clear-chat': () => { if (confirm('ล้างประวัติแชท?')) { LOCAL.chat = []; saveLocal(); App.render(); } },
  'ai-explain': el => { const { s, c } = getSC(el); if (c) sendChat(`ช่วยอธิบายเนื้อหาบท "${c.title}" วิชา ${s.name} ให้เข้าใจง่ายๆ พร้อมยกตัวอย่าง และบอกจุดที่มักออกสอบ`); },
  'ai-summary': async el => {
    const { s, c } = getSC(el); if (!c) return;
    const r = await aiRun('กำลังสรุป', () => AI.summarize(s, c)); if (!r) return;
    noteModal(s, c); showSummaryResult(r);
  },
  'ai-summary-note': async el => {
    const { s, c } = getSC(el); if (!c) return;
    const txt = document.getElementById('noteText')?.value; if (txt != null) c.note = txt;
    const out = document.getElementById('aiOut'); if (out) out.innerHTML = '<p class="muted">✨ กำลังสรุป…</p>';
    const r = await aiRun('กำลังสรุป', () => AI.summarize(s, c));
    if (r) showSummaryResult(r); else if (out) out.innerHTML = '';
  },
  'ai-use-summary': el => {
    const ta = document.getElementById('noteText'); if (!ta) return;
    ta.value = el.dataset.mode === 'replace' ? App._summary : (ta.value ? ta.value + '\n\n--- สรุปโดย AI ---\n' : '') + App._summary;
    App.toast('ใส่ลงโน้ตแล้ว อย่าลืมกดบันทึกนะ');
  },
  'ai-flash': async el => {
    const { s, c } = getSC(el); if (!c) return;
    const r = await aiRun('กำลังสร้างแฟลชการ์ด', () => AI.flashcards(s, c)); if (!Array.isArray(r)) return;
    const cards = r.filter(x => x.q && x.a).map(x => ({ id: uid(), subjectId: s.id, chapterId: c.id, q: String(x.q), a: String(x.a), known: false }));
    DB.flashcards.push(...cards); save({ silent: true });
    App.toast(`เพิ่มแฟลชการ์ด ${cards.length} ใบ 🃏`);
    openFlashcards(s.id);
  },
  'ai-quiz': async el => {
    const { s, c } = getSC(el); if (!c) return;
    const r = await aiRun('กำลังสร้างข้อสอบ', () => AI.quiz(s, c)); if (!Array.isArray(r)) return;
    const items = r.filter(x => x.q && Array.isArray(x.choices)).map(x => ({ q: x.q, choices: x.choices, answer: Number(x.answer), explain: x.explain }));
    if (!items.length) return App.toast('AI สร้างข้อสอบไม่สำเร็จ ลองใหม่นะ');
    openModal(`❓ ข้อสอบ — ${esc(c.title)}`, '', true);
    App.quiz = { items, answers: {}, submitted: false, sid: s.id, cid: c.id };
    quizRender();
  },
  'apply-replan': () => {
    const items = App.replanPreview || [];
    DB.plan = DB.plan.filter(p => p.done || !p.auto);
    items.forEach(p => DB.plan.push({ ...p, id: uid(), done: false, auto: true }));
    App.replanPreview = null; closeModal(); save();
    App.toast(`ใช้ตารางใหม่แล้ว ${items.length} รายการ ✨`); App.go('plan');
  },

  // settings
  'more-menu': () => openModal('⋯ เมนูเพิ่มเติม', `<div class="more-grid">
      <button class="more-item" data-act="go" data-tab="calendar"><span>📅</span><b>ปฏิทิน</b><small class="muted">วันสอบ &amp; การบ้าน</small></button>
      <button class="more-item" data-act="go" data-tab="timer"><span>⏱️</span><b>จับเวลา</b><small class="muted">Pomodoro &amp; บันทึก</small></button>
      <button class="more-item" data-act="go" data-tab="stats"><span>📊</span><b>สถิติ</b><small class="muted">กราฟ 8 สัปดาห์</small></button>
      <button class="more-item" data-act="go" data-tab="settings"><span>⚙️</span><b>ตั้งค่า</b><small class="muted">ธีม, AI, Sync</small></button>
    </div>`),
  'load-demo': () => {
    if (hasDemo()) return App.toast('มีข้อมูลทดลองอยู่แล้ว');
    if (!loadDemoData()) return;
    App.go('home'); App.toast('ใส่ข้อมูลทดลองแล้ว ✨');
  },
  'clear-demo': () => {
    if (!hasDemo()) return;
    if (!confirm('ลบข้อมูลทดลองออกทั้งหมดใช่ไหม? ข้อมูลที่คุณเพิ่มเองจะยังอยู่')) return;
    removeDemoData();
    App.toast('ลบข้อมูลทดลองแล้ว');
    App.render();
  },
  'ask-notify': async () => {
    const ok = await Notifier.ask();
    if (ok) { DB.prefs.notify = true; save(); App.toast('เปิดรับแจ้งเตือนแล้ว 🔔'); }
    else { App.toast('ไม่ได้รับสิทธิ์แจ้งเตือน', 3500); App.render(); }
  },
  'ai-provider': el => { App._customModel = false; aiCfg().provider = el.dataset.p; saveAICfg(); if (!DB.ai?.sync) App.render(); },
  'test-ai': async () => { const r = await aiRun('กำลังทดสอบ', () => AI.chat([{ role: 'user', content: 'ทักทายสั้นๆ 1 ประโยค' }], 'ตอบภาษาไทยสั้นๆ')); if (r) alert('เชื่อมต่อสำเร็จ ✓\n\n' + r); },
  'toggle-notify': async el => {
    if (el.checked) { const ok = await Notifier.ask(); if (!ok) { App.toast('ไม่ได้รับสิทธิ์แจ้งเตือน — เปิดในการตั้งค่าเบราว์เซอร์นะ', 5000); el.checked = false; return; } }
    DB.prefs.notify = el.checked; save();
  },
  'test-notify': async () => { await Notifier.ask(); Notifier.show('ทดสอบแจ้งเตือน 🌸', Notifier.dailyText()); },
  'save-fb': () => {
    const v = document.getElementById('fbConfig').value.trim();
    if (v) { try { parseFirebaseConfig(v); } catch (e) { return App.toast('config ไม่ถูกต้อง: ' + e.message, 5000); } }
    LOCAL.firebaseConfig = v; saveLocal();
    if (typeof firebase !== 'undefined' && firebase.apps?.length) { location.reload(); return; }
    Sync.init().then(() => App.render());
  },
  'clear-fb': () => { if (!confirm('ลบ config และหยุด sync? (ข้อมูลในเครื่องยังอยู่)')) return; LOCAL.firebaseConfig = ''; saveLocal(); location.reload(); },
  'login': () => Sync.login(),
  'logout': () => Sync.logout(),
  'force-push': () => { if (confirm('เอาข้อมูลในเครื่องนี้ขึ้นไปทับข้อมูลบน cloud?')) { DB.updatedAt = Date.now(); save(); Sync.pushNow(); } },
  'export': () => {
    const copy = JSON.parse(JSON.stringify(DB));
    if (copy.ai) { copy.ai.geminiKey = ''; copy.ai.openaiKey = ''; }
    const blob = new Blob([JSON.stringify(copy, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `study-planner-${todayStr()}.json`; a.click();
  },
  'reset': () => openModal('⚠️ ยืนยันการล้างข้อมูลทั้งหมด', `
    <p>ข้อมูลวิชา วันสอบ ตารางอ่าน โน้ต และสถิติทั้งหมดจะถูกลบถาวร (ไม่สามารถกู้คืนได้หากไม่ได้ Export ไว้)</p>
    <form data-form="reset-confirm">
      <label class="field"><span>พิมพ์คำว่า <b>ลบทั้งหมด</b> เพื่อยืนยัน</span>
        <input name="word" required placeholder="ลบทั้งหมด" autocomplete="off">
      </label>
      <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn danger">ยืนยันลบทั้งหมด</button></div>
    </form>`),
};

function showSummaryResult(r) {
  App._summary = r;
  const out = document.getElementById('aiOut'); if (!out) return;
  out.innerHTML = `<div class="ai-result"><div class="card-head"><b>✨ สรุปโดย AI</b></div><div class="md">${md(r)}</div>
    <div class="row wrap"><button type="button" class="btn small" data-act="ai-use-summary" data-mode="append">เพิ่มต่อท้ายโน้ต</button>
    <button type="button" class="btn small ghost" data-act="ai-use-summary" data-mode="replace">แทนที่โน้ต</button></div></div>`;
  out.scrollIntoView({ behavior: 'smooth' });
}
function refreshDayModal() {
  if (!document.getElementById('modal').classList.contains('hidden') && App._dayOpen && document.getElementById('modalTitle').textContent.startsWith('📅')) dayModal(App._dayOpen);
}

/* ===== Forms ===== */
const Forms = {
  name(d) { DB.name = d.name.trim(); save(); App.toast('บันทึกแล้ว 🌸'); },
  'reset-confirm'(d) {
    if (d.word.trim() !== 'ลบทั้งหมด') return App.toast('กรุณาพิมพ์คำว่า "ลบทั้งหมด" ให้ตรงกันนะ');
    closeModal(); replaceDB(defaultData()); App.go('home'); App.toast('ล้างข้อมูลทั้งหมดแล้ว');
  },
  subject(d, f) {
    const color = d.color || d.customColor;
    let s = subjectById(f.dataset.id);
    if (!s) {
      s = { id: uid(), chapters: [] }; DB.subjects.push(s);
      (d.chapters || '').split('\n').map(x => x.trim()).filter(Boolean).forEach(title => s.chapters.push({ id: uid(), title, done: false, note: '' }));
    }
    Object.assign(s, { name: d.name.trim(), examDate: d.examDate, examTime: d.examTime, room: d.room.trim(), color: color || SUBJECT_COLORS[0] });
    closeModal(); save();
  },
  chapters(d, f) {
    const s = subjectById(f.dataset.sid);
    const titles = d.list.split('\n').map(x => x.trim()).filter(Boolean);
    const n = parseInt(d.count) || 0, start = s.chapters.length;
    for (let i = 1; i <= n; i++) titles.push(`${d.prefix}${start + i}`);
    titles.forEach(title => s.chapters.push({ id: uid(), title, done: false, note: '' }));
    closeModal(); save(); App.toast(`เพิ่ม ${titles.length} บทแล้ว`);
  },
  task(d, f) {
    let x = DB.tasks.find(x => x.id === f.dataset.id);
    if (!x) { x = { id: uid(), done: false }; DB.tasks.push(x); }
    Object.assign(x, { title: d.title.trim(), type: d.type, date: d.date, time: d.time, subjectId: d.subjectId });
    closeModal(); save();
  },
  plan(d, f) {
    const s = subjectById(d.subjectId), c = s?.chapters.find(c => c.id === d.chapterId);
    const title = d.title.trim() || c?.title;
    if (!title) return App.toast('เลือกบทหรือพิมพ์รายละเอียดด้วยนะ');
    let p = DB.plan.find(x => x.id === f.dataset.id);
    if (!p) { p = { id: uid(), done: false }; DB.plan.push(p); }
    Object.assign(p, { subjectId: d.subjectId, chapterId: c ? c.id : null, title, date: d.date, kind: c ? 'read' : 'custom', auto: false });
    closeModal(); save();
  },
  note(d, f) {
    const s = subjectById(f.dataset.sid), c = s.chapters.find(c => c.id === f.dataset.id);
    c.note = d.note; save(); App.toast('บันทึกโน้ตแล้ว 📝');
  },
  session(d) { logSession(d.subjectId, Number(d.minutes), d.date); App.toast('บันทึกแล้ว'); },
  chat(d) { sendChat(d.q); },
  'fc-add'(d) { DB.flashcards.push({ id: uid(), subjectId: App.fc.sid, chapterId: null, q: d.q.trim(), a: d.a.trim(), known: false }); save({ silent: true }); fcRender(); },
  'link-add'(d, f) {
    const s = subjectById(App.filesSid); if (!s) return;
    const err = f.querySelector('[data-url-error]');
    if (err) { err.hidden = true; err.textContent = ''; }
    const title = (d.title || '').trim();
    if (!title) { App.toast('ใส่ชื่อเอกสารด้วยนะ'); return; }
    const parsed = normalizeLink(d.url);
    if (parsed.error) { if (err) { err.hidden = false; err.textContent = parsed.error; } else App.toast(parsed.error); return; }
    s.links = s.links || [];
    s.links.unshift({ id: uid(), title, url: parsed.url, addedAt: Date.now() });
    f.reset(); save({ silent: true }); filesRender();
  },
  async 'ai-exams'(d) {
    if (!d.text.trim() && !App._examImg) return App.toast('พิมพ์ข้อความหรือแนบรูปตารางสอบก่อนนะ');
    const r = await aiRun('AI กำลังอ่านตารางสอบ', () => AI.parseExams(d.text, App._examImg));
    if (!Array.isArray(r) || !r.length) return App.toast('ไม่พบข้อมูลวิชา ลองพิมพ์ให้ชัดเจนขึ้นนะ');
    const items = r.filter(x => x && x.name).map(x => {
      let examTime = String(x.examTime || '').trim();
      let room = String(x.room || '').trim();
      if (room && !roomText(room)) { if (!examTime || examTime.length <= 5) examTime = room; room = ''; }
      return {
        name: String(x.name).trim(),
        examDate: /^\d{4}-\d{2}-\d{2}$/.test(x.examDate || '') ? x.examDate : '',
        examTime: examTime.slice(0, 20),
        room,
        chapters: Array.isArray(x.chapters) ? x.chapters.map(c => String(c).trim()).filter(Boolean) : [],
      };
    });
    if (!items.length) return App.toast('ไม่พบข้อมูลวิชา');
    App._examPreview = items;
    setModalBody(`
      <p class="muted small">ตรวจสอบรายการที่ AI ดึงมาได้ (ติ๊กเลือกวิชาที่ต้องการเพิ่ม):</p>
      ${items.map((x, i) => `<label class="item" style="cursor:pointer">
        <input type="checkbox" class="cb" data-exam-idx="${i}" checked>
        <div class="grow"><b>${esc(x.name)}</b><br>
          <small class="muted">${x.examDate ? `🎯 ${fmtDateLong(x.examDate)} (${x.examDate})` : 'ยังไม่ระบุวัน'}${x.examTime ? ' · ' + esc(x.examTime) : ''}${roomText(x.room) ? ' · ห้อง ' + esc(roomText(x.room)) : ''}${x.chapters.length ? ` · ${x.chapters.length} บท` : ''}</small>
        </div>
      </label>`).join('')}
      <div class="row end">
        <button class="btn ghost" data-act="ai-add-exams">ลองใหม่</button>
        <button class="btn" data-act="apply-ai-exams">เพิ่มเข้าตารางสอบ</button>
      </div>`);
  },
  async replan(d) {
    App.aiBusy = true;
    const r = await aiRun('AI กำลังจัดตาราง', () => AI.replan(d.req));
    App.aiBusy = false;
    if (!Array.isArray(r)) return;
    const t = todayStr();
    const items = r.map(x => {
      const s = subjectById(x.subjectId) || DB.subjects.find(s => s.name === x.subjectId);
      if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(x.date || '') || x.date < t) return null;
      const c = s.chapters.find(c => c.id === x.chapterId);
      if (c && c.done) return null;
      return { date: x.date, subjectId: s.id, chapterId: c ? c.id : null, title: c ? c.title : String(x.title || 'ทบทวน'), kind: c ? 'read' : 'review' };
    }).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
    if (!items.length) return App.toast('AI จัดตารางไม่สำเร็จ ลองใหม่อีกครั้งนะ');
    App.replanPreview = items;
    const byDate = {}; items.forEach(p => (byDate[p.date] = byDate[p.date] || []).push(p));
    openModal('🗓️ ตารางที่ AI เสนอ', `
      <p class="muted small">ตรวจดูก่อน ถ้าโอเคกด "ใช้ตารางนี้" (จะแทนที่ตารางอัตโนมัติที่ยังไม่ได้ติ๊ก รายการที่เพิ่มเองจะยังอยู่)</p>
      ${Object.entries(byDate).map(([d, ps]) => `<div class="day-group"><div class="day-head"><b>${fmtDateLong(d)}</b></div>
        ${ps.map(p => `<div class="item">${tag(p.subjectId)}<span class="grow">${p.kind === 'review' ? '🔁 ' : ''}${esc(p.title)}</span></div>`).join('')}</div>`).join('')}
      <div class="row end"><button class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn" data-act="apply-replan">ใช้ตารางนี้</button></div>`, true);
  },
};

/* ===== Change handlers ===== */
const Changes = {
  'timer-subject': el => { Timer.subjectId = el.value; },
  'ai-sub': el => { App.aiSub = el.value; App.aiCh = ''; App.render(); },
  'ai-ch': el => { App.aiCh = el.value; },
  'plan-sub': el => { document.getElementById('planCh').innerHTML = planChapterOptions(el.value); },
  'custom-color': el => { el.form.querySelectorAll('input[name=color]').forEach(r => r.checked = false); },
  'be-hint': el => { const s = el.closest('.field')?.querySelector('small'); if (s && el.value) s.textContent = `(${fmtDateBE(el.value)})`; },
  'ai-model-select': el => {
    const c = aiCfg();
    if (el.value === '__custom__') { App._customModel = true; App.render(); return; }
    App._customModel = false;
    if (c.provider === 'gemini') c.geminiModel = el.value; else c.openaiModel = el.value;
    saveAICfg(); if (!DB.ai?.sync) App.render();
  },
  'file-upload': async el => {
    const files = [...(el.files || [])]; if (!files.length || !App.filesSid) return;
    for (const f of files) await FileStore.add(App.filesSid, f);
    el.value = '';
    App.toast(`บันทึก ${files.length} ไฟล์แล้ว 📎`);
    filesRender();
  },
  'exam-img': el => {
    const file = el.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = String(reader.result).split(',')[1];
      App._examImg = { base64: b64, mimeType: file.type || 'image/png' };
      const lbl = document.getElementById('examImgLabel');
      if (lbl) lbl.textContent = `✅ แนบรูปแล้ว: ${file.name}`;
    };
    reader.readAsDataURL(file);
  },
  'import': el => {
    const file = el.files[0]; if (!file) return;
    file.text().then(txt => {
      const data = JSON.parse(txt);
      if (!Array.isArray(data.subjects)) throw new Error('ไฟล์ไม่ถูกต้อง');
      if (!confirm('นำเข้าข้อมูลนี้แทนข้อมูลปัจจุบัน?')) return;
      data.updatedAt = Date.now(); replaceDB(data); App.toast('นำเข้าข้อมูลเรียบร้อย ✓');
    }).catch(e => App.toast('นำเข้าไม่สำเร็จ: ' + e.message));
  },
};

function setPath(obj, path, val) { const ks = path.split('.'); let o = obj; ks.slice(0, -1).forEach(k => o = o[k]); o[ks[ks.length - 1]] = val; }

function bindEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = Actions[el.dataset.act];
    if (fn) { if (el.tagName === 'BUTTON' || el.tagName === 'A') e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.bind) {
      const v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Math.max(Number(el.min) || 0, Number(el.value) || 0) : el.value;
      setPath(DB, el.dataset.bind, v); save();
      if (el.dataset.bind.startsWith('prefs.pomo') && !Timer.running) Timer.reset();
    }
    if (el.dataset.local) { LOCAL[el.dataset.local] = el.value.trim(); saveLocal(); }
    if (el.dataset.ai) { aiCfg()[el.dataset.ai] = el.value.trim(); saveAICfg(); }
    if (el.dataset.chg && Changes[el.dataset.chg]) Changes[el.dataset.chg](el, e);
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('form[data-form]'); if (!f) return;
    e.preventDefault();
    const fn = Forms[f.dataset.form]; if (fn) fn(Object.fromEntries(new FormData(f)), f);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.matches('.chat-input textarea')) { e.preventDefault(); e.target.form.requestSubmit(); }
    if (e.key === 'Escape') closeModal();
  });
  document.getElementById('modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') closeModal(); });
}

document.addEventListener('DOMContentLoaded', () => App.init());
