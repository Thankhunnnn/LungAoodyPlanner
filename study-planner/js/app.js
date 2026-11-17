/* ===== Main app: views, actions, forms ===== */
const THEMES = [
  ['pink', 'ชมพูพาสเทล', '#ec6a9c'], ['lavender', 'ลาเวนเดอร์', '#9b7ede'], ['mint', 'มิ้นต์', '#3fb68b'],
  ['sky', 'ฟ้าใส', '#4a9be8'], ['peach', 'พีช', '#f08a5d'], ['navy', 'น้ำเงินเข้ม', '#3b82f6'], ['mono', 'มินิมอล', '#555555'],
];
const TABS = [
  ['home', '🏠', 'หน้าแรก'], ['plan', '📖', 'ตารางอ่าน'], ['subjects', '📚', 'วิชา'], ['calendar', '📅', 'ปฏิทิน'],
  ['timer', '⏱️', 'จับเวลา'], ['stats', '📊', 'สถิติ'], ['ai', '🐃', 'อู๊ดเอไอ'],
];
const ALL_TABS = [...TABS, ['settings', '⚙️', 'ตั้งค่า']];

const App = {
  tab: 'home', calView: 'timetable', calMonth: todayStr().slice(0, 7), statWeek: weekStart(todayStr()), showPast: false,
  aiSub: '', aiCh: '', aiBusy: false, chatAttach: [], replanPreview: null, fc: null, quiz: null,

  init() {
    this.applyTheme();
    const setHash = h => {
      if (h === 'timetable') { this.tab = 'calendar'; this.calView = 'timetable'; return; }
      if (ALL_TABS.some(t => t[0] === h)) this.tab = h;
    };
    setHash(location.hash.slice(1));
    window.addEventListener('hashchange', () => { setHash(location.hash.slice(1)); this.render(); });
    changeListeners.push(() => { this.applyTheme(); this.render(); refreshFilesIfOpen(); });
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

  go(tab) {
    location.hash = tab; this.tab = tab; this.render(); window.scrollTo({ top: 0 });
    const main = document.getElementById('main');
    if (main) { main.classList.remove('view-active'); void main.offsetWidth; main.classList.add('view-active'); }
  },

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
    if (mini) { mini.textContent = `⏱ ${txt}`; mini.hidden = !Timer.running; }
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
      const greet = 'หวัดดีค้าบ';
      left = `<div class="hello">
        <div class="avatar">${avatarImg()}</div>
        <div><h1>${greet}${DB.name ? ' ' + esc(DB.name) : ''}</h1><p>${sub}</p></div>
      </div>`;
    } else {
      const cur = ALL_TABS.find(x => x[0] === this.tab) || ALL_TABS[0];
      left = `<div class="hello compact"><button class="avatar avatar-btn" data-act="go" data-tab="home" title="หน้าแรก">${avatarImg()}</button><h1>${cur[1]} ${cur[2]}</h1></div>`;
    }
    const isDark = DB.prefs.dark || DB.prefs.theme === 'navy';
    return `${left}
      <div class="head-actions">
        <button id="timerMini" class="chip accent" data-act="go" data-tab="timer" aria-label="ตัวจับเวลา" ${Timer.running ? '' : 'hidden'}>⏱</button>
        ${this.syncBadgeHTML()}
        <button class="icon-btn ${this.tab === 'settings' ? 'active' : ''}" data-act="go" data-tab="settings" title="ตั้งค่า" aria-label="ตั้งค่า">⚙️</button>
        <button class="icon-btn" data-act="toggle-dark" title="${isDark ? 'โหมดสว่าง' : 'โหมดมืด'}" aria-label="${isDark ? 'โหมดสว่าง' : 'โหมดมืด'}">${isDark ? '☀️' : '🌙'}</button>
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

  toast(msg, ms = 2800, onUndo) {
    const el = document.getElementById('toast');
    el.replaceChildren(document.createTextNode(msg));
    el.classList.toggle('has-undo', !!onUndo);
    if (onUndo) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'toast-undo'; b.textContent = 'เลิกทำ';
      b.addEventListener('click', () => { el.classList.remove('show'); onUndo(); });
      el.append(document.createTextNode(' '), b);
    }
    el.classList.add('show');
    clearTimeout(this._tt); this._tt = setTimeout(() => el.classList.remove('show'), ms);
  },
};

/* ===== Modal ===== */
function openModal(title, html, wide = false) {
  const m = document.getElementById('modal');
  const titleEl = document.getElementById('modalTitle');
  titleEl.innerHTML = title;
  titleEl.hidden = !title;
  document.getElementById('modalBody').innerHTML = html;
  m.querySelector('.modal-box').classList.toggle('wide', wide);
  m.classList.remove('hidden');
  setTimeout(() => m.querySelector('input:not([type=checkbox]):not([type=color]):not([type=file]),textarea')?.focus(), 50);
}
function setModalBody(html) { document.getElementById('modalBody').innerHTML = html; }
function closeModal() {
  const needRender = !!(App.fc || App.filesSid);
  document.getElementById('modal').classList.add('hidden');
  const titleEl = document.getElementById('modalTitle');
  titleEl.innerHTML = '';
  titleEl.hidden = true;
  App.fc = null; App.quiz = null; App.filesSid = null; App._examImg = null;
  if (needRender) App.render();
}

/* ===== Small UI pieces ===== */
const tag = id => `<span class="tag" style="--c:${subjectColor(id)}">${esc(subjectName(id))}</span>`;
const progressBar = (pct, color) => `<div class="bar-bg"><div class="bar-fill" style="width:${Math.max(0, Math.min(100, Number(pct) || 0))}%;${color ? '--c:' + safeColor(color) : ''}"></div></div>`;
const subjectOptions = (sel, allowNone = true) =>
  (allowNone ? `<option value="">— ทั่วไป —</option>` : '') + DB.subjects.map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
const empty = (icon, text, btn = '', img = '') => `<div class="empty">${img ? `<img src="${img}" alt="" class="empty-mascot">` : `<div class="empty-ic">${icon}</div>`}<p>${text}</p>${btn}</div>`;

function planItemHTML(p, showDate = false) {
  return `<div class="item ${p.done ? 'done' : ''}">
    <label class="task-check-wrap"><input type="checkbox" class="cb" data-act="toggle-plan" data-id="${p.id}" ${p.done ? 'checked' : ''} aria-label="ทำเครื่องหมายว่าเสร็จแล้ว"></label>
    ${tag(p.subjectId)}
    <span class="grow">${p.kind === 'review' ? '🔁 ' : ''}${esc(p.title)}${p.time ? ` <small class="muted">⏰ ${esc(p.time)}${p.remind !== false ? ' 🔔' : ''}</small>` : ''}${showDate ? ` <small class="muted">· ${fmtDate(p.date)}</small>` : ''}</span>
    <span class="item-actions"><button class="mini-btn" data-act="edit-plan" data-id="${p.id}" title="แก้ไข" aria-label="แก้ไขแผนอ่าน">✎</button>
    <button class="mini-btn" data-act="del-plan" data-id="${p.id}" title="ลบ" aria-label="ลบแผนอ่าน">✕</button></span>
  </div>`;
}
function countdownCard(s) {
  const n = daysBetween(todayStr(), s.examDate);
  return `<div class="cd-card ${n <= 3 ? 'urgent' : ''}" style="--c:${safeColor(s.color)}" data-act="open-subject" data-id="${s.id}">
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


const classColor = c => safeColor(c.color || (c.subjectId ? subjectColor(c.subjectId) : '#4a9be8'));
const className = c => c.title || subjectName(c.subjectId);
function roomText(room) {
  const r = String(room || '').trim();
  if (!r || /^\d{1,2}:\d{2}(\s*[-–]\s*\d{1,2}:\d{2})?$/.test(r)) return '';
  return r;
}
function dateField(label, name, value, required) {
  const v = value || '';
  const now = new Date().getFullYear();
  return `<label class="field"><span>${label} <small class="muted">${v ? '(' + fmtDateBE(v) + ')' : ''}</small></span><input type="date" name="${name}" value="${esc(v)}" min="${now - 1}-01-01" max="${now + 5}-12-31" ${required ? 'required' : ''} data-chg="be-hint"></label>`;
}
function avatarImg() {
  return `<img class="avatar-img" src="assets/avatar-profile.webp" alt="อู๊ด" width="46" height="46" loading="eager" fetchpriority="high" decoding="sync" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/avatar-profile.png'}">`;
}
function examYearOk(s) {
  if (!s) return true;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const now = new Date().getFullYear();
  if (y < now - 1 || y > now + 5) return false;
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}
function coachBubble(kind) {
  const name = esc(DB.name || 'เพื่อน');
  const lines = {
    home: `<b>อู๊ด:</b> เฮ้ ${name}! วันนี้เราลุยวิชาไหนกันดี?<br><span>อย่าลืมเก็บเช็คลิสต์นะ สู้ๆ 💪</span>`,
    plan: `<b>อู๊ด:</b> จัดตารางอ่านให้เป๊ะ จะได้ไม่ลนคืนก่อนสอบ!<br><span>อ่านจบแล้วอย่าลืมติ๊กด้วยล่ะ 📖</span>`,
    subjects: `<b>อู๊ด:</b> เช็กบทเรียน โน้ต และไฟล์แต่ละวิชาให้ครบ<br><span>บทไหนยังไม่คล่อง กดติวได้เลย 📚</span>`,
    calendar: `<b>อู๊ด:</b> ไหนดูซิ มีเรียนไรมั่ง มีสอบวันไหน ส่งการบ้านวันไหน?<br><span>วางแผนดีมีชัยไปกว่าครึ่ง 🗓️</span>`,
    timer: `<b>อู๊ด:</b> โฟกัสทีละรอบ พักสายตาบ้างนะเพื่อน<br><span>เปิดจับเวลาแล้วลุยเลย ⏱️</span>`,
    stats: `<b>อู๊ด:</b> ดูสถิติแล้วภูมิใจในตัวเองหน่อย!<br><span>สะสมชั่วโมงอ่านไปเรื่อยๆ นะ 🔥</span>`,
    ai: `<b>อู๊ด:</b> ติดตรงไหนถามอออได้เลย ไม่ต้องเกรงใจ!<br><span>ส่งรูปหรือโน้ตมาให้ช่วยสรุปก็ได้ 🐃</span>`,
    settings: `<b>อู๊ด:</b> ปรับธีม ตั้งแจ้งเตือน และเชื่อม Google Sync<br><span>ข้อมูลจะได้ตามไปทุกเครื่อง ⚙️</span>`,
  };
  return `<div class="coach-bubble">${lines[App.tab] || lines.home}</div>`;
}
function coachHeroHTML() {
  return `<section class="coach-hero">${coachBubble('hero')}<img src="assets/coach-hero-real.webp" alt="อู๊ด" class="coach-hero-img" width="117" height="210" onload="this.dataset.ready='1'"></section>`;
}
function coachActionHTML() { return ''; }
function syncGutters() {
  document.documentElement.dataset.home = '1';
  const right = document.getElementById('gutterRight');
  if (!right) return;
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
  return hasDemo() ? `<button class="btn danger" data-act="clear-demo">ลบข้อมูลทดลอง</button>` : '';
}

/* ===== Views ===== */
const Views = {
  home() {
    const t = todayStr();
    if (!DB.subjects.length) {
      return `${coachHeroHTML()}<section class="card welcome">
        <h2>ยินดีต้อนรับสู่ LungAoodyPlanner 🐃</h2>
        <p class="muted">เริ่มจาก 3 ขั้นง่ายๆ</p>
        <ol class="steps"><li>เพิ่มวิชา + วันสอบ</li><li>ใส่บท/หัวข้อที่ต้องอ่าน</li><li>จัดตารางอ่านและติ๊กความคืบหน้าได้เลย</li></ol>
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
    const dow = new Date().getDay();
    const todayClasses = (DB.classes || []).filter(c => c.day === dow).sort((a, b) => a.start.localeCompare(b.start));

    return `
    ${coachHeroHTML()}
    ${todayClasses.length ? `<section class="card">
      <div class="card-head"><h2>🗓️ ตารางเรียนวันนี้ <small class="muted">(${TH_DAYS_FULL[dow]})</small></h2><button class="mini-btn" data-act="go-timetable">ดูทั้งหมด</button></div>
      <div class="tt-strip">${todayClasses.map(c => {
        const col = classColor(c), nm = className(c);
        return `<div class="tt-pill" style="--c:${col}"><b>${esc(c.start)}${c.end ? '–' + esc(c.end) : ''}</b> ${esc(nm)}${c.room ? ` <small class="muted">· ${esc(c.room)}</small>` : ''}</div>`;
      }).join('')}</div>
    </section>` : ''}
    <section class="card">
      <h2>⏰ นับถอยหลังสอบ</h2>
      ${exams.length ? `<div class="cd-grid">${exams.map(countdownCard).join('')}</div>` : empty('🎉', 'ไม่มีสอบที่กำลังจะมาถึง')}
    </section>

    <div class="grid2 home-split">
      <section class="card today">
        <div class="card-head"><h2>📌 ตารางวันนี้ <small class="muted">(${fmtDateLong(t)})</small></h2>
          <span class="chip">${doneToday}/${today.length}</span></div>
        ${today.length ? today.map(p => planItemHTML(p)).join('') : empty('📖', 'วันนี้ยังไม่มีแผนอ่าน — เพิ่มแผนหรือคุยกับอู๊ดได้เลย', `<button class="btn" data-act="add-plan" data-date="${t}">+ เพิ่มแผนอ่านวันนี้</button>`, 'assets/coach-moto.webp')}
        ${overdue.length ? `<div class="warn-box">มีรายการค้าง ${overdue.length} อย่าง <button class="link" data-act="go" data-tab="plan">ดูในตารางอ่าน</button></div>` : ''}
      </section>
      <section class="card">
        <div class="card-head"><h2>📝 การบ้าน / งานใกล้ถึง</h2><button class="mini-btn" data-act="add-task">+ เพิ่ม</button></div>
        ${soonTasks.length ? soonTasks.map(taskItemHTML).join('') : empty('☕', 'ไม่มีงานใน 7 วันนี้ พักผ่อนได้สบายเลย!', '', 'assets/coach-action.webp')}
      </section>
    </div>

    <div class="grid2">
      <section class="card">
        <h2>📊 ความคืบหน้าแต่ละวิชา</h2>
        ${DB.subjects.map(s => { const p = subjectProgress(s); return `<div class="prog-row" data-act="open-subject" data-id="${s.id}">
          <div class="prog-top"><span style="color:${safeColor(s.color)}">${esc(s.name)}</span><span class="muted">${p.done}/${p.total}</span></div>
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
          ${exams.map(s => `<span class="exam-badge" style="--c:${safeColor(s.color)}">🎯 สอบ ${esc(s.name)} ${esc(s.examTime || '')}</span>`).join('')}
          <button class="mini-btn right" data-act="add-plan" data-date="${d}">+</button></div>
        ${items.map(p => planItemHTML(p)).join('')}
      </div>`;
    };


    return `
    
    <section class="card">
      <div class="toolbar">
        <h2 class="grow">📖 ตารางอ่านหนังสือ</h2>
        <button class="btn" data-act="add-plan" data-date="${t}">+ เพิ่มแผนอ่าน</button>
      </div>
    </section>
    ${overdue.length ? `<section class="card warn-card"><div class="card-head"><h2>⚠️ ค้างอยู่ (${overdue.length})</h2></div>${overdue.map(p => planItemHTML(p, true)).join('')}</section>` : ''}
    <section class="card">
      ${dates.length ? dates.map(day).join('') : empty('🗓️', DB.subjects.length ? 'ยังไม่มีตาราง — กด "+ เพิ่มแผนอ่าน" ได้เลย' : 'เพิ่มวิชาก่อนนะ', DB.subjects.length ? '' : `<button class="btn" data-act="add-subject">+ เพิ่มวิชา</button>`)}
    </section>
    ${past.length ? `<section class="card"><button class="link" data-act="toggle-past">${App.showPast ? '▾ ซ่อน' : '▸ แสดง'}รายการที่อ่านเสร็จแล้ว (${past.length})</button>
      ${App.showPast ? past.sort((a, b) => b.date.localeCompare(a.date)).map(p => planItemHTML(p, true)).join('') : ''}</section>` : ''}`;
  },

  subjects() {
    return `
    <div class="toolbar subjects-bar"><h2>📚 วิชาทั้งหมด (${DB.subjects.length})</h2>
      <button class="btn" data-act="add-subject">+ เพิ่มวิชา</button></div>
    ${DB.subjects.length ? '' : empty('📚', 'ยังไม่มีวิชา เพิ่มวิชาแรกกันเลย')}
    <div class="subj-list">${DB.subjects.map(s => {
      const p = subjectProgress(s), n = s.examDate ? daysBetween(todayStr(), s.examDate) : null;
      const fcN = DB.flashcards.filter(f => f.subjectId === s.id).length;
      const fileN = FileStore.count(s.id);
      return `<section class="card subj" id="subj-${s.id}" style="--c:${safeColor(s.color)}">
        <div class="subj-head">
          <div class="grow"><h3>${esc(s.name)}</h3>
            <div class="muted small">${s.examDate ? `🎯 สอบ ${fmtDateLong(s.examDate)}${s.examTime ? ' · ' + esc(s.examTime) : ''}${roomText(s.room) ? ' · ห้อง ' + esc(roomText(s.room)) : ''} ${n >= 0 ? `<b class="accent-text">(อีก ${n} วัน)</b>` : '<i>(สอบแล้ว)</i>'}` : 'ยังไม่กำหนดวันสอบ'}</div></div>
          <button class="mini-btn" data-act="edit-subject" data-id="${s.id}" aria-label="แก้ไขวิชา ${esc(s.name)}">✎ แก้ไข</button>
          <button class="mini-btn" data-act="del-subject" data-id="${s.id}" aria-label="ลบวิชา ${esc(s.name)}">🗑</button>
        </div>
        <div class="prog-top"><span>ความคืบหน้า</span><span>${p.done}/${p.total} บท (${p.pct}%)</span></div>
        ${progressBar(p.pct, s.color)}
        <div class="chapters">${s.chapters.map((c, i) => `<div class="item ${c.done ? 'done' : ''}">
            <input type="checkbox" class="cb" data-act="toggle-chapter" data-sid="${s.id}" data-id="${c.id}" ${c.done ? 'checked' : ''} aria-label="ติ๊กจบบท ${esc(c.title)}">
            <span class="grow">${esc(c.title)}</span>
            <span class="item-actions">
            <button class="mini-btn ${c.note ? 'has' : ''}" data-act="note" data-sid="${s.id}" data-id="${c.id}" title="โน้ต" aria-label="โน้ตบท ${esc(c.title)}">📝${c.note ? '' : '+'}</button>
            <button class="mini-btn" data-act="move-chapter" data-sid="${s.id}" data-id="${c.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="เลื่อนขึ้น">↑</button>
            <button class="mini-btn" data-act="rename-chapter" data-sid="${s.id}" data-id="${c.id}" aria-label="เปลี่ยนชื่อบท ${esc(c.title)}">✎</button>
            <button class="mini-btn" data-act="del-chapter" data-sid="${s.id}" data-id="${c.id}" aria-label="ลบบท ${esc(c.title)}">✕</button>
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
    const view = App.calView || 'timetable';
    const switcher = `<div class="toolbar">
      <h2 class="grow">${view === 'timetable' ? '🗓️ จัดตารางเรียน' : view === 'exams' ? '🎯 ตารางสอบ' : '📅 ปฏิทิน'}</h2>
      <div class="pills" style="margin:0">
        <button class="pill ${view === 'timetable' ? 'active' : ''}" data-act="cal-view" data-v="timetable">ตารางเรียน</button>
        <button class="pill ${view === 'month' ? 'active' : ''}" data-act="cal-view" data-v="month">ปฏิทิน</button>
        <button class="pill ${view === 'exams' ? 'active' : ''}" data-act="cal-view" data-v="exams">ตารางสอบ</button>
      </div>
    </div>`;

    if (view === 'timetable') {
      const classes = DB.classes || [];
      const toMin = s => { const [h, m] = (s || '08:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
      let minH = 8, maxH = 25;
      classes.forEach(c => {
        const s = Math.floor(toMin(c.start) / 60);
        if (s < minH) minH = s;
      });
      const hours = []; for (let h = minH; h < maxH; h++) hours.push(h);
      const totalMin = hours.length * 60;
      const daysOrder = [1, 2, 3, 4, 5, ...(classes.some(c => c.day === 6) ? [6] : []), ...(classes.some(c => c.day === 0) ? [0] : [])];
      const EN_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dow = new Date().getDay();
      const uniqueSubs = new Set(classes.map(c => c.subjectId || c.title)).size;

      return `
      <section class="card">
        ${switcher}
        <div class="tt-wrap">
          <div class="tt-table" style="--cols:${hours.length}">
            <div class="tt-hdr">
              <div class="tt-corner">Day/Time</div>
              ${hours.map(h => `<div class="tt-hr">${h}</div>`).join('')}
            </div>
            ${daysOrder.map(d => {
              const list = classes.filter(c => c.day === d).sort((a, b) => a.start.localeCompare(b.start));
              return `<div class="tt-row ${d === dow ? 'today' : ''}">
                <div class="tt-day-lbl">${EN_DAYS[d]}</div>
                <div class="tt-lane">
                  <div class="tt-cells">${hours.map(h => `<button type="button" class="tt-cell" data-act="add-class" data-day="${d}" data-start="${pad(h)}:00" aria-label="เพิ่มคาบวัน${TH_DAYS_FULL[d]} เวลา ${h}:00"></button>`).join('')}</div>
                  ${list.map(c => {
                    const sm = Math.max(minH * 60, toMin(c.start));
                    const em = Math.min(maxH * 60, Math.max(sm + 30, toMin(c.end) || sm + 60));
                    const left = ((sm - minH * 60) / totalMin * 100).toFixed(3);
                    const width = ((em - sm) / totalMin * 100).toFixed(3);
                    const col = classColor(c), nm = className(c);
                    return `<button type="button" class="tt-block" data-act="edit-class" data-id="${c.id}" style="left:${left}%;width:${width}%;--c:${col}" title="${esc(nm)} (${esc(c.start)}–${esc(c.end || '')})">
                      <span class="tt-bname">${esc(nm)}</span>
                      <span class="tt-broom">${esc(c.room || `${c.start}${c.end ? '–' + c.end : ''}`)}</span>
                    </button>`;
                  }).join('')}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="toolbar" style="margin-top:12px;margin-bottom:0">
          <button class="btn ghost small" data-act="tt-png">⬇️ PNG</button>
          <button class="btn small" data-act="add-class">+ เพิ่มคาบเรียน</button>
          <span class="grow"></span>
          <span class="muted small">รวมในตาราง: <b>${classes.length} คาบ</b> · ${uniqueSubs} วิชา</span>
        </div>
      </section>`;
    }

    if (view === 'exams') {
      const t = todayStr();
      const withExam = DB.subjects.filter(s => s.examDate).sort((a, b) => (a.examDate + (a.examTime || '')).localeCompare(b.examDate + (b.examTime || '')));
      return `
      <section class="card">
        ${switcher}
        ${withExam.length ? withExam.map(s => {
          const n = daysBetween(t, s.examDate);
          return `<div class="item">
            <span class="tag" style="--c:${safeColor(s.color)}">${n === 0 ? 'วันนี้!' : n > 0 ? `อีก ${n} วัน` : 'สอบแล้ว'}</span>
            <span class="grow"><b>${esc(s.name)}</b><br><small class="muted">🎯 ${fmtDateLong(s.examDate)}${s.examTime ? ' · ' + esc(s.examTime) : ''}${roomText(s.room) ? ' · ห้อง ' + esc(roomText(s.room)) : ''}</small></span>
            <button class="mini-btn" data-act="edit-subject" data-id="${s.id}" aria-label="แก้ไขวันสอบ ${esc(s.name)}">✎</button>
          </div>`;
        }).join('') : empty('🎯', 'ยังไม่มีวิชาที่กำหนดวันสอบ', `<button class="btn small" data-act="go" data-tab="subjects">ไปเพิ่มวิชา</button>`)}
      </section>`;
    }

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
      const dayClasses = (DB.classes || []).filter(c => c.day === parseDate(d).getDay()).sort((a, b) => a.start.localeCompare(b.start));
      html += `<div class="cal-cell ${inMonth ? '' : 'out'} ${d === t ? 'today' : ''}" data-act="cal-day" data-date="${d}">
        <div class="cal-num">${parseDate(d).getDate()}</div>
        ${exams.map(s => `<div class="cal-chip exam" style="--c:${safeColor(s.color)}">🎯 ${esc(s.name)}</div>`).join('')}
        ${dayClasses.map(c => `<div class="cal-chip exam" style="--c:${classColor(c)}">${esc(c.start)} ${esc(className(c))}</div>`).join('')}
        ${tasks.map(x => `<div class="cal-chip task ${x.done ? 'done' : ''}">${x.type === 'event' ? '📌' : '📝'} ${esc(x.title)}</div>`).join('')}
        ${plan.length ? `<div class="cal-chip plan">📖 ${plan.filter(p => p.done).length}/${plan.length}</div>` : ''}
      </div>`;
    }
    const upcoming = DB.tasks.filter(x => !x.done && x.date >= t).sort((a, b) => a.date.localeCompare(b.date));

    return `
    <section class="card">
      ${switcher}
      <div class="toolbar">
        <button class="icon-btn" data-act="cal-nav" data-dir="-1" aria-label="เดือนก่อน">‹</button>
        <h2 class="cal-title">${TH_MONTHS_FULL[m - 1]} ${y + 543}</h2>
        <button class="icon-btn" data-act="cal-nav" data-dir="1" aria-label="เดือนถัดไป">›</button>
        <button class="btn ghost small" data-act="cal-today">วันนี้</button>
        <span class="grow"></span>
        <button class="btn" data-act="add-task">+ การบ้าน/กิจกรรม</button>
      </div>
      <div class="cal-grid">${TH_DAYS.map(d => `<div class="cal-dow">${d}</div>`).join('')}${html}</div>
      <p class="muted small">🎯 วันสอบ · 🗓️ ตารางเรียน · 📝 การบ้าน · 📌 กิจกรรม · 📖 แผนอ่าน — แตะวันเพื่อดูรายละเอียด</p>
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
        <form data-form="session" class="session-form" novalidate>
          <label class="field">วิชา<select name="subjectId">${subjectOptions('')}</select></label>
          <div class="grid2-sm">
            <label class="field"><span>นาที</span><input name="minutes" type="number" min="1" max="1440" placeholder="เช่น 45" required></label>
            <label class="field"><span>วันที่ <small class="muted">(${fmtDateBE(t)})</small></span><input name="date" type="date" value="${t}" min="${new Date().getFullYear() - 1}-01-01" max="${new Date().getFullYear() + 5}-12-31" data-chg="be-hint"></label>
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
        ${perSub.map(({ s, m }) => `<div class="prog-row"><div class="prog-top"><span style="color:${safeColor(s.color)}">${esc(s.name)}</span><span class="muted">${fmtMin(m)}</span></div>${progressBar(m / maxSub * 100, s.color)}</div>`).join('')}
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
      return `<section class="card welcome"><h2>🐃 อู๊ดเอไอ</h2>
        <p>ต้องใส่ API key ก่อนนะ เลือกได้ทั้ง <b>Google Gemini</b> (มีโควตาฟรี) หรือ <b>OpenAI</b></p>
        <button class="btn" data-act="go" data-tab="settings">ไปที่ตั้งค่า AI →</button></section>`;
    }
    const chat = LOCAL.chat || [];
    const quick = ['วันนี้ควรอ่านอะไรก่อนดี?', 'ช่วยจัดตารางอ่านให้หน่อย', 'ช่วยให้กำลังใจหน่อย 🥺', 'ประเมินหน่อยว่าอ่านทันไหม'];

    return `
      <section class="card chat-card">
        <div class="card-head"><h2>💬 คุยกับอออ</h2><span class="chip">${esc(AI.providerLabel())}</span>
          <button class="mini-btn" data-act="clear-chat">ล้างแชท</button></div>
        <div id="chatBox" class="chat-box">
          ${chat.length ? chat.map(chatRowHTML).join('') : chatRowHTML({ role: 'assistant', content: 'ว่าไง\n---\nถามเนื้อหา บอกวันสอบ หรือแนบรูปตารางผ่านปุ่ม 📎 มาให้ช่วยจัดการได้เลย' })}
          ${App.aiBusy ? `<div class="msg-row ai"><img class="ooo-av" src="assets/ooo-chat.webp" alt="" width="36" height="36"><div class="msg-col"><div class="ooo-name">อออ</div><div class="msg assistant typing"><span></span><span></span><span></span></div></div></div>` : ''}
        </div>
        <div class="quick">${quick.map(q => `<button class="chip" data-act="quick-ask" data-q="${esc(q)}">${q}</button>`).join('')}</div>
        <p class="muted small" style="margin:0 0 6px">💡 อยากให้ช่วยจัดตาราง เพิ่มวิชา หรือสรุปบทเรียน แนบรูป/ไฟล์ผ่านปุ่ม <b>📎</b> แล้วพิมพ์บอกอออได้เลย</p>
        <form data-form="chat" class="chat-form">
          <div id="chatChips" class="chat-chips">${chatChipsHTML()}</div>
          <div class="chat-input">
            <button type="button" class="icon-btn" data-act="chat-attach" title="แนบไฟล์" aria-label="แนบไฟล์" ${App.aiBusy ? 'disabled' : ''}>📎</button>
            <button type="button" class="icon-btn chat-cam" data-act="chat-cam" title="ถ่ายรูป" aria-label="ถ่ายรูป" ${App.aiBusy ? 'disabled' : ''}>📷</button>
            <textarea name="q" rows="2" placeholder="พิมพ์หาอออ… (Enter ส่ง, Shift+Enter ขึ้นบรรทัด)" ${App.aiBusy ? 'disabled' : ''}></textarea>
            <button class="btn" ${App.aiBusy ? 'disabled' : ''}>ส่ง</button>
          </div>
          <input id="chatFile" type="file" hidden multiple accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,.txt,.pdf,.jpg,.jpeg,.png,.webp" data-chg="chat-file">
          <input id="chatCam" type="file" hidden accept="image/*" capture="environment" data-chg="chat-file">
        </form>
      </section>`;
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
      <form data-form="name" class="row" novalidate><input name="name" required aria-label="ชื่อเล่น" placeholder="ชื่อเล่น" value="${esc(DB.name)}"><button class="btn small">บันทึก</button></form>
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
      <p class="muted small">ไฟล์ใน "ไฟล์และเอกสาร" ของแต่ละวิชา อัปโหลดขึ้น Google Drive ของบัญชีนี้ (โฟลเดอร์ LungAoodyPlanner) รายชื่อไฟล์ sync มากับข้อมูลวิชา ตัวไฟล์อยู่บน Drive ของคุณ</p>
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
    <label class="task-check-wrap"><input type="checkbox" class="cb" data-act="toggle-task" data-id="${x.id}" ${x.done ? 'checked' : ''} aria-label="ทำเครื่องหมายว่าเสร็จแล้ว"></label>
    <span>${x.type === 'event' ? '📌' : '📝'}</span>
    ${x.subjectId ? tag(x.subjectId) : ''}
    <span class="grow">${esc(x.title)} <small class="muted">· ${fmtDate(x.date)}${x.time ? ' ' + esc(x.time) : ''}${!x.done && n >= 0 && n <= 1 ? (n === 0 ? ' · <b class="accent-text">วันนี้</b>' : ' · <b class="accent-text">พรุ่งนี้</b>') : ''}</small></span>
    <span class="item-actions"><button class="mini-btn" data-act="edit-task" data-id="${x.id}" aria-label="แก้ไขงาน ${esc(x.title)}">✎</button>
    <button class="mini-btn" data-act="del-task" data-id="${x.id}" aria-label="ลบงาน ${esc(x.title)}">✕</button></span>
  </div>`;
}

/* ===== Modal contents ===== */
function subjectForm(s = {}) {
  const color = s.color || SUBJECT_COLORS[DB.subjects.length % SUBJECT_COLORS.length];
  return `<form data-form="subject" data-id="${s.id || ''}" novalidate>
    <label class="field">ชื่อวิชา<input name="name" required maxlength="120" value="${esc(s.name || '')}" placeholder="เช่น Managerial Accounting"></label>
    <div class="row wrap">
      ${dateField('วันสอบ', 'examDate', s.examDate || '')}
      <label class="field">เวลา<input type="time" name="examTime" value="${esc(s.examTime || '')}"></label>
      <label class="field">ห้องสอบ / หมายเหตุ<input name="room" value="${esc(s.room || '')}" placeholder="เช่น ห้อง 301"></label>
    </div>
    <div class="field">สี<div class="colors">${SUBJECT_COLORS.map((c, i) => `<label class="color-dot" style="--c:${c}" aria-label="เลือกสีที่ ${i + 1}"><input type="radio" name="color" value="${c}" ${c === color ? 'checked' : ''} aria-label="เลือกสีที่ ${i + 1}"><span></span></label>`).join('')}
      <input type="color" name="customColor" value="${color}" title="สีอื่น" data-chg="custom-color"></div></div>
    ${s.id ? '' : `<label class="field">บท/หัวข้อ (บรรทัดละ 1 บท, ใส่ทีหลังก็ได้)<textarea name="chapters" rows="4" placeholder="Ch1 Introduction&#10;Ch2 Cost behavior&#10;..."></textarea></label>`}
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function taskForm(x = {}) {
  return `<form data-form="task" data-id="${x.id || ''}">
    <label class="field">ชื่องาน<input name="title" required maxlength="200" value="${esc(x.title || '')}" placeholder="เช่น ส่งรายงานกลุ่ม"></label>
    <div class="row wrap">
      <label class="field">ประเภท<select name="type"><option value="homework" ${x.type !== 'event' ? 'selected' : ''}>📝 การบ้าน</option><option value="event" ${x.type === 'event' ? 'selected' : ''}>📌 กิจกรรม</option></select></label>
      ${dateField('วันที่', 'date', x.date || todayStr(), true)}
      <label class="field">เวลา<input type="time" name="time" value="${esc(x.time || '')}"></label>
    </div>
    <label class="field">วิชา<select name="subjectId">${subjectOptions(x.subjectId || '')}</select></label>
    <label class="inline" style="margin:6px 0"><input type="checkbox" name="remind" ${x.remind !== false ? 'checked' : ''}> 🔔 แจ้งเตือนเมื่อถึงเวลา</label>
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function planForm(p = {}) {
  const sid = p.subjectId || DB.subjects[0]?.id || '';
  return `<form data-form="plan" data-id="${p.id || ''}">
    <label class="field">วิชา<select name="subjectId" data-chg="plan-sub">${subjectOptions(sid)}</select></label>
    <label class="field">บท (เลือก หรือพิมพ์เองด้านล่าง)<select name="chapterId" id="planCh">${planChapterOptions(sid, p.chapterId)}</select></label>
    <label class="field">รายละเอียด<input name="title" value="${esc(p.chapterId ? '' : (p.title || ''))}" placeholder="เช่น ทำแบบฝึกหัดบท 3"></label>
    <div class="row wrap">
      ${dateField('วันที่', 'date', p.date || todayStr(), true)}
      <label class="field">เวลา <small class="muted">(ไม่บังคับ)</small><input type="time" name="time" value="${esc(p.time || '')}"></label>
    </div>
    <label class="inline" style="margin:6px 0"><input type="checkbox" name="remind" ${p.remind !== false ? 'checked' : ''}> 🔔 แจ้งเตือนเมื่อถึงเวลา</label>
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function planChapterOptions(sid, sel) {
  const s = subjectById(sid);
  return `<option value="">— ไม่ระบุบท —</option>` + (s ? s.chapters.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.title)}${c.done ? ' ✓' : ''}</option>`).join('') : '');
}
function classForm(c = {}) {
  const day = c.day != null ? Number(c.day) : 1;
  const start = c.start || '08:30';
  const end = c.end || (start.slice(0, 2) ? `${pad(Math.min(23, Number(start.slice(0, 2)) + 2))}:${start.slice(3, 5) || '00'}` : '');
  const color = c.color || (c.subjectId ? subjectColor(c.subjectId) : SUBJECT_COLORS[(DB.classes || []).length % SUBJECT_COLORS.length]);
  return `<form data-form="class" data-id="${c.id || ''}">
    <div class="row wrap">
      <label class="field">วัน<select name="day">${[1, 2, 3, 4, 5, 6, 0].map(d => `<option value="${d}" ${d === day ? 'selected' : ''}>วัน${TH_DAYS_FULL[d]}</option>`).join('')}</select></label>
      <label class="field">เวลาเริ่ม<input type="time" name="start" required value="${esc(start)}"></label>
      <label class="field">เวลาจบ<input type="time" name="end" value="${esc(end)}"></label>
    </div>
    <label class="field">วิชา (เลือกจากรายการ หรือพิมพ์ชื่อเองด้านล่าง)<select name="subjectId">${subjectOptions(c.subjectId || '')}</select></label>
    <label class="field">ชื่อวิชา / หมายเหตุ (ถ้าไม่ได้เลือกด้านบน)<input name="title" value="${esc(c.title || '')}" placeholder="เช่น Gen Ed / สัมมนา"></label>
    <label class="field">ห้องเรียน / Sec<input name="room" value="${esc(c.room || '')}" placeholder="เช่น MAHIT 401 | Sec 1"></label>
    <div class="field">สี<div class="colors">${SUBJECT_COLORS.map((col, i) => `<label class="color-dot" style="--c:${col}" aria-label="เลือกสีที่ ${i + 1}"><input type="radio" name="color" value="${col}" ${col === color ? 'checked' : ''} aria-label="เลือกสีที่ ${i + 1}"><span></span></label>`).join('')}
      <input type="color" name="customColor" value="${esc(color)}" title="สีอื่น" data-chg="custom-color"></div></div>
    <div class="row end">${c.id ? `<button type="button" class="btn danger" data-act="del-class" data-id="${c.id}" style="margin-right:auto">🗑 ลบ</button>` : ''}<button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
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
  const dow = parseDate(d).getDay();
  const cls = (DB.classes || []).filter(c => c.day === dow).sort((a, b) => a.start.localeCompare(b.start));
  openModal(`📅 ${fmtDateLong(d)}`, `
    ${exams.map(s => `<div class="exam-badge big" style="--c:${safeColor(s.color)}">🎯 สอบ ${esc(s.name)} ${esc(s.examTime || '')} ${roomText(s.room) ? '· ห้อง ' + esc(roomText(s.room)) : ''}</div>`).join('')}
    ${cls.length ? `<h3>🗓️ ตารางเรียน</h3>${cls.map(c => `<div class="item"><span class="tag" style="--c:${classColor(c)}">${esc(c.start)}${c.end ? '–' + esc(c.end) : ''}</span><span class="grow">${esc(className(c))}${c.room ? ` <small class="muted">· ${esc(c.room)}</small>` : ''}</span></div>`).join('')}` : ''}
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
      <form data-form="fc-add" class="fc-add"><input name="q" maxlength="300" placeholder="คำถาม / คำศัพท์" required><input name="a" maxlength="300" placeholder="คำตอบ" required><button class="btn small">+ เพิ่ม</button></form>
      ${cards.map(x => `<div class="item ${x.known ? 'done' : ''}"><span class="grow"><b>${esc(x.q)}</b><br><small class="muted">${esc(x.a)}</small></span>
        <button class="mini-btn" data-act="fc-del" data-id="${x.id}">✕</button></div>`).join('') || '<p class="muted">ยังไม่มีการ์ด — เพิ่มเอง หรือให้ AI สร้างจากโน้ต (แท็บ อู๊ดเอไอ / ปุ่มในโน้ต)</p>'}`);
    return;
  }
  if (!cards.length) { f.mode = 'list'; return fcRender(); }
  f.idx = Math.min(f.idx, cards.length - 1);
  const c = cards[f.idx];
  setModalBody(`
    <div class="row"><span class="muted grow">${f.idx + 1} / ${cards.length}</span><button class="link" data-act="fc-mode" data-m="list">ดูรายการ</button></div>
    <div class="flash ${f.flipped ? 'flipped' : ''}" data-act="fc-flip" style="--c:${safeColor(s?.color)}">
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
function fmtStamp(v) {
  const d = new Date(v);
  if (!v || Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH');
}
function fileGoesToDrive() { return !!Sync.user && LOCAL.fileDest !== 'local'; }
function driveNote(s) {
  if (!Sync.user) return 'ยังไม่ล็อกอิน — ไฟล์จะเก็บในเครื่องนี้ กด "ล็อกอินเพื่อ sync" แล้วกด "ย้ายขึ้น Drive" เพื่อให้เห็นบนเครื่องอื่น';
  if (!fileGoesToDrive()) return 'ไฟล์ใหม่จะเก็บในเครื่องนี้ เลือก "ขึ้น Drive" ถ้าอยากอัปโหลดขึ้น Google Drive';
  if (!driveClientId()) return 'ยังไม่ได้ตั้งค่า Google Client ID — ไฟล์จะเก็บในเครื่องนี้ก่อน (วิธีตั้งอยู่ใน README)';
  const who = Sync.user.email || Sync.user.displayName || 'บัญชีนี้';
  return `อัปโหลดขึ้น Google Drive ของ ${who} ในโฟลเดอร์ ${DRIVE_ROOT_NAME} / ${driveFolderLabel(s.name)}`;
}
function driveFailToast(e, savedLocal) {
  const code = e && e.code;
  let msg = code === 'noconfig' ? 'ยังไม่ได้ตั้งค่า Google Client ID สำหรับ Drive' : ((e && e.message) || 'อัปโหลดขึ้น Drive ไม่สำเร็จ');
  if (!savedLocal) return msg;
  if (code === 'offline') return 'ออฟไลน์อยู่ อัปโหลดขึ้น Drive ไม่ได้ เก็บไฟล์ไว้ในเครื่องนี้แล้ว';
  return msg + ' เก็บไฟล์ไว้ในเครื่องนี้แล้ว';
}
function showUploadProgress(done, total, name, ratio, label) {
  let el = document.getElementById('upProg');
  if (!el) {
    const box = document.querySelector('#modalBody .upload-box');
    if (!box) return;
    el = document.createElement('div');
    el.id = 'upProg';
    el.className = 'up-prog';
    el.setAttribute('role', 'status');
    box.insertAdjacentElement('afterend', el);
  }
  el.hidden = false;
  const pct = total ? Math.max(0, Math.min(100, Math.round(((done + Math.max(0, Math.min(1, Number(ratio) || 0))) / total) * 100))) : 0;
  const text = label || `กำลังอัปโหลด ${Math.min(total, done + 1)}/${total} — ${name}`;
  el.innerHTML = `<div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div><small class="muted">${esc(text)} (${pct}%)</small>`;
}
async function saveLocalFiles(sid, files) {
  let n = 0;
  const folder = App.fileFolder && App.fileFolder !== '__none__' ? App.fileFolder : '';
  for (const f of files) { try { await FileStore.add(sid, f, { folder }); n++; } catch { /* device storage full */ } }
  return n;
}
async function runDriveUploads(sid, files, localIds, tokenPromise) {
  let ok = 0;
  const folder = App.fileFolder && App.fileFolder !== '__none__' ? App.fileFolder : '';
  try {
    showUploadProgress(0, files.length, files[0].name, 0, 'กำลังขอสิทธิ์ Google Drive…');
    await tokenPromise;
    const subject = subjectById(sid);
    if (!subject) throw Drive.err('ไม่พบวิชานี้แล้ว', 'other');
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      showUploadProgress(i, files.length, f.name, 0);
      const meta = await Drive.uploadToSubject(subject, f, ratio => showUploadProgress(i, files.length, f.name, ratio));
      if (folder && meta && meta.id) {
        const df = (subject.driveFiles || []).find(x => x.id === meta.id);
        if (df) { df.folder = folder; save({ silent: true }); }
      }
      ok++;
      try {
        if (localIds && localIds[i]) await FileStore.markDrive(localIds[i], sid, meta.id);
        else await FileStore.add(sid, f, { driveId: meta.id, folder });
      } catch { /* Drive copy is enough if this device cannot cache the blob */ }
    }
    App.toast(`อัปโหลด ${ok} ไฟล์ขึ้น Drive แล้ว`);
  } catch (e) {
    const rest = files.slice(ok);
    const savedLocal = !localIds && rest.length ? (await saveLocalFiles(sid, rest)) > 0 : false;
    const extra = ok ? `อัปโหลดได้ ${ok} ไฟล์ แล้วหยุด: ` : '';
    App.toast(extra + driveFailToast(e, savedLocal), 7000);
  }
  return ok;
}
let _filesGen = 0;
function refreshFilesIfOpen() {
  if (!App.filesSid || App._uploading) return;
  if (document.querySelector('#modalBody :focus')) return;
  filesRender();
}
async function filesRender() {
  const gen = ++_filesGen;
  const sid = App.filesSid; if (!sid) return;
  const s = subjectById(sid); if (!s) return;
  const all = await FileStore.list(sid).catch(() => []);
  if (gen !== _filesGen || App.filesSid !== sid) return;
  const folders = s.folders || [];
  const curFolder = App.fileFolder || '';
  const matchF = f => !curFolder ? true : curFolder === '__none__' ? !f.folder : f.folder === curFolder;
  const allLocal = (all || []).filter(f => f && !f.driveId);
  const allDrive = (s.driveFiles || []).filter(f => f && safeDriveId(f.id))
    .slice().sort((a, b) => String(b.modifiedTime || '').localeCompare(String(a.modifiedTime || '')));
  const allLinks = s.links || [];
  const local = allLocal.filter(matchF);
  const driveFiles = allDrive.filter(matchF);
  const links = allLinks.filter(matchF);
  const countIn = fn => allDrive.filter(fn).length + allLocal.filter(fn).length + allLinks.filter(fn).length;
  const folderSelect = (kind, id, cur) => `<select class="folder-sel" data-chg="move-file-folder" data-kind="${kind}" data-id="${esc(id)}" aria-label="เลือกโฟลเดอร์">
    <option value="" ${!cur ? 'selected' : ''}>ไม่มีโฟลเดอร์</option>
    ${folders.map(fn => `<option value="${esc(fn)}" ${cur === fn ? 'selected' : ''}>📁 ${esc(fn)}</option>`).join('')}
  </select>`;
  const signed = !!Sync.user;
  const driveRow = f => `<div class="item file-item">
      <span class="file-ic">${fileIcon(f.mimeType, f.name)}</span>
      <span class="grow"><b>${esc(f.name)}</b><br><small class="muted">${fmtSize(Number(f.size) || 0)} · ${esc(fmtStamp(f.modifiedTime))}</small></span>
      <span class="item-actions">
        ${folderSelect('drive', f.id, f.folder)}
        <button class="mini-btn pill-btn" data-act="file-drive-open" data-id="${esc(f.id)}">เปิดใน Drive</button>
        <button class="mini-btn" data-act="file-drive-del" data-id="${esc(f.id)}" aria-label="ลบไฟล์">✕</button>
      </span>
    </div>`;
  const localRow = f => `<div class="item file-item">
      <span class="file-ic">${fileIcon(f.type, f.name)}</span>
      <span class="grow"><b>${esc(f.name)}</b><br><small class="muted">${fmtSize(Number(f.size) || 0)} · ${esc(fmtStamp(f.addedAt))}</small></span>
      <span class="item-actions">
        ${folderSelect('local', f.id, f.folder)}
        <button class="mini-btn pill-btn" data-act="file-open" data-id="${esc(f.id)}">เปิดดู</button>
        <button class="mini-btn" data-act="file-dl" data-id="${esc(f.id)}" aria-label="ดาวน์โหลด">⬇️</button>
        <button class="mini-btn pill-btn" data-act="file-migrate" data-id="${esc(f.id)}">ย้ายขึ้น Drive</button>
        <button class="mini-btn" data-act="file-del" data-id="${esc(f.id)}" aria-label="ลบไฟล์">✕</button>
      </span>
    </div>`;
  const linkRow = l => {
    let host = ''; try { host = new URL(l.url).hostname.replace(/^www\./, ''); } catch { }
    return `<div class="item file-item">
      <span class="file-ic">🔗</span>
      <span class="grow"><a href="${esc(l.url)}" target="_blank" rel="noopener"><b>${esc(l.title)}</b></a>${host ? `<br><small class="muted">${esc(host)}</small>` : ''}</span>
      <span class="item-actions">
        ${folderSelect('link', l.id, l.folder)}
        <button class="mini-btn" data-act="link-del" data-id="${esc(l.id)}" aria-label="ลบลิงก์">✕</button>
      </span>
    </div>`;
  };
  const dest = fileGoesToDrive() ? 'drive' : 'local';
  const ftab = App.fileTab || 'list';
  const totalN = countIn(() => true);
  const topTabs = `<div class="pills" style="margin-bottom:12px">
    <button type="button" class="pill ${ftab === 'list' ? 'active' : ''}" data-act="file-tab" data-t="list">📂 ไฟล์และโฟลเดอร์ (${totalN})</button>
    <button type="button" class="pill ${ftab === 'upload' ? 'active' : ''}" data-act="file-tab" data-t="upload">📤 อัปโหลด / เพิ่มลิงก์</button>
  </div>`;

  if (ftab === 'upload') {
    const upFolder = App.fileFolder && App.fileFolder !== '__none__' ? App.fileFolder : '';
    setModalBody(`${topTabs}
      <div class="row wrap" style="margin-bottom:10px">
        ${signed ? `<div class="pills file-dest" style="margin:0">
          <button type="button" class="pill ${dest === 'local' ? 'active' : ''}" data-act="file-dest" data-dest="local">เก็บในเครื่อง</button>
          <button type="button" class="pill ${dest === 'drive' ? 'active' : ''}" data-act="file-dest" data-dest="drive">ขึ้น Drive</button>
        </div>` : '<button class="btn small" data-act="login">ล็อกอินเพื่อ sync / ขึ้น Drive</button>'}
        <label class="inline" style="margin-left:auto">เก็บเข้าโฟลเดอร์:
          <select class="folder-sel" data-chg="upload-folder" aria-label="เลือกโฟลเดอร์ที่จะใส่">
            <option value="" ${!upFolder ? 'selected' : ''}>ไม่มีโฟลเดอร์</option>
            ${folders.map(fn => `<option value="${esc(fn)}" ${upFolder === fn ? 'selected' : ''}>📁 ${esc(fn)}</option>`).join('')}
          </select>
        </label>
        <button type="button" class="chip" data-act="file-folder-add">+ โฟลเดอร์</button>
      </div>
      <label class="upload-box" id="fileDropzone">
        <input type="file" multiple data-chg="file-upload" hidden>
        <div>📤 <b>คลิกเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</b>${upFolder ? ` → เก็บเข้าโฟลเดอร์ <b>${esc(upFolder)}</b>` : ''}</div>
        <div class="muted small">${esc(driveNote(s))}</div>
      </label>
      <div id="upProg" class="up-prog" role="status" hidden></div>
      <div class="or-divider"><span>หรือเพิ่มลิงก์</span></div>
      <h3>🔗 เพิ่มลิงก์เอกสาร (Google Drive, Notion, YouTube ฯลฯ)</h3>
      <form data-form="link-add" class="link-form" novalidate>
        <div class="grid2-sm">
          <label class="field"><span>ชื่อเอกสาร</span><input name="title" maxlength="200" placeholder="เช่น สไลด์บท 1" required></label>
          <label class="field"><span>ลิงก์ URL</span><input name="url" type="text" inputmode="url" maxlength="500" placeholder="https://..." autocomplete="url" required><small class="field-error" data-url-error hidden></small></label>
        </div>
        <button class="btn small">+ เพิ่มลิงก์${upFolder ? `ลง "${esc(upFolder)}"` : ''}</button>
      </form>`);
    return;
  }

  const hasAny = driveFiles.length || local.length || links.length;
  setModalBody(`${topTabs}
    <div class="folder-bar">
      <button type="button" class="chip ${!curFolder ? 'accent' : ''}" data-act="file-folder" data-f="">📂 ทั้งหมด (${totalN})</button>
      ${folders.map(fn => `<span class="folder-chip ${curFolder === fn ? 'active' : ''}"><button type="button" class="folder-chip-btn" data-act="file-folder" data-f="${esc(fn)}">📁 ${esc(fn)} (${countIn(x => x.folder === fn)})</button><button type="button" class="folder-chip-del" data-act="file-folder-del" data-f="${esc(fn)}" aria-label="ลบโฟลเดอร์ ${esc(fn)}">✕</button></span>`).join('')}
      ${countIn(x => !x.folder) ? `<button type="button" class="chip ${curFolder === '__none__' ? 'accent' : ''}" data-act="file-folder" data-f="__none__">📄 ยังไม่จัดหมวด (${countIn(x => !x.folder)})</button>` : ''}
      <button type="button" class="chip" data-act="file-folder-add">+ โฟลเดอร์</button>
    </div>
    ${!hasAny ? empty('📁', 'ยังไม่มีไฟล์หรือลิงก์ในหมวดนี้', `<button class="btn small" data-act="file-tab" data-t="upload">📤 อัปโหลด / เพิ่มลิงก์</button>`) : `
      ${driveFiles.length ? `<h3>☁️ ไฟล์บน Drive (${driveFiles.length})</h3>${driveFiles.map(driveRow).join('')}` : ''}
      ${local.length ? `<div class="card-head"><h3>📁 ไฟล์ในเครื่อง (${local.length})</h3>
        <button class="btn small ghost" data-act="file-migrate-all">ย้ายทั้งหมดขึ้น Drive</button></div>
        ${local.map(localRow).join('')}` : ''}
      ${links.length ? `<h3>🔗 ลิงก์เอกสาร (${links.length})</h3>${links.map(linkRow).join('')}` : ''}
    `}`);
}
function openFilesModal(sid) {
  App.filesSid = sid; App.fileFolder = ''; App.fileTab = 'list';
  openModal(`📎 ไฟล์และเอกสาร — ${esc(subjectName(sid))}`, '<p class="muted">กำลังโหลด…</p>', true);
  if (typeof Drive !== 'undefined') Drive.preload();
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
function chatBubbles(content) {
  return String(content || '').split(/^\s*---\s*$/m).map(s => s.trim()).filter(Boolean);
}
function chatChipsHTML() {
  return (App.chatAttach || []).map((f, i) => `<span class="chat-chip">${f.thumb ? `<img src="${f.thumb}" alt="">` : '<span>📄</span>'}<span>${esc(f.name)}</span><button type="button" class="mini-btn" data-act="chat-unchip" data-i="${i}">✕</button></span>`).join('');
}
function chatSavedChips(files) {
  return (files || []).map(f => `<span class="chat-chip">${f.thumb ? `<img src="${f.thumb}" alt="">` : '<span>📄</span>'}<span>${esc(f.name)}</span></span>`).join('');
}
function chatRowHTML(m) {
  if (m.role === 'user') {
    const bits = chatBubbles(m.content);
    const body = bits.map(b => `<div class="msg user">${esc(b).replace(/\n/g, '<br>')}</div>`).join('');
    return `<div class="msg-row me"><div class="msg-col">${chatSavedChips(m.files)}${body}</div></div>`;
  }
  const bits = chatBubbles(m.content);
  const bubbles = bits.map(b => `<div class="msg assistant">${md(b)}</div>`).join('');
  const card = m.proposal ? proposalCardHTML(m.proposal) : '';
  return `<div class="msg-row ai"><img class="ooo-av" src="assets/ooo-chat.webp" alt="" width="36" height="36"><div class="msg-col"><div class="ooo-name">อออ</div>${bubbles}${card}</div></div>`;
}
function proposalCardHTML(p) {
  const lines = (p.lines || []).map(l => `<li>${esc(l)}</li>`).join('');
  if (p.status === 'applied') return `<div class="confirm-card"><b>ทำแล้ว</b><ul>${lines}</ul></div>`;
  if (p.status === 'cancelled') return `<div class="confirm-card"><b>ยกเลิกแล้ว</b><ul>${lines}</ul></div>`;
  return `<div class="confirm-card"><b>ยืนยันการเปลี่ยนแปลง</b><ul>${lines}</ul><div class="row"><button type="button" class="btn small" data-act="chat-apply" data-id="${esc(p.id)}">ยืนยัน</button><button type="button" class="btn small ghost" data-act="chat-cancel" data-id="${esc(p.id)}">ยกเลิก</button></div></div>`;
}
function blobToB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] || '');
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}
function imageThumb(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 96; c.height = 96;
      const s = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 96, 96);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('อ่านรูปไม่ได้')); };
    img.src = url;
  });
}
function chatFileKind(file) {
  const name = file.name || '', type = String(file.type || '').toLowerCase();
  if (/\.(docx?|pptx?)$/i.test(name) || /wordprocessingml|presentationml|msword|powerpoint/.test(type)) return 'office';
  if (/^image\/(jpeg|png|webp)$/.test(type) || /\.(jpe?g|png|webp)$/i.test(name)) return 'image';
  if (type === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
  if (type === 'text/plain' || /\.txt$/i.test(name)) return 'text';
  return '';
}
async function addChatFiles(list) {
  App.chatAttach = App.chatAttach || [];
  for (const file of list) {
    if (App.chatAttach.length >= 4) { App.toast('แนบได้ครั้งละไม่เกิน 4 ไฟล์'); break; }
    const kind = chatFileKind(file);
    if (kind === 'office') { App.toast('ยังอ่านไฟล์ Word/PowerPoint ไม่ได้ เซฟเป็น PDF หรือวางข้อความมาได้เลย', 5500); continue; }
    if (!kind) { App.toast('รองรับ jpg, png, webp, pdf และ txt', 4000); continue; }
    if (file.size > 7 * 1024 * 1024) { App.toast('ไฟล์ใหญ่เกิน 7 MB', 4000); continue; }
    let base64 = '';
    try { base64 = await blobToB64(file); } catch { App.toast('อ่านไฟล์ไม่สำเร็จ'); continue; }
    let text = '';
    if (kind === 'text') { try { text = (await file.text()).slice(0, 20000); } catch { text = ''; } }
    let thumb = '';
    if (kind === 'image') { try { thumb = await imageThumb(file); } catch { thumb = ''; } }
    const mime = kind === 'pdf' ? 'application/pdf' : kind === 'text' ? 'text/plain' : (file.type || 'image/jpeg');
    App.chatAttach.push({ name: file.name || 'ไฟล์', mime, base64, text, thumb, kind });
  }
  const box = document.getElementById('chatChips');
  if (box) box.innerHTML = chatChipsHTML();
}
function normClock(t) {
  const m = String(t || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return '';
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return '';
  return pad(h) + ':' + pad(min);
}
function matchSubjects(name) {
  const q = String(name || '').trim().toLowerCase();
  if (!q) return [];
  const exact = DB.subjects.filter(s => s.name.trim().toLowerCase() === q);
  if (exact.length) return exact;
  return DB.subjects.filter(s => { const n = s.name.toLowerCase(); return n.includes(q) || q.includes(n); });
}
function interpretCalls(calls) {
  const items = [], lines = [], asks = [];
  const planned = [];
  (calls || []).forEach(call => {
    const a = call.args || {};
    const name = String(a.subjectName || a.name || '').trim().slice(0, 120);
    if (call.name === 'set_exam') {
      const clear = /clear|delete|ลบ/i.test(String(a.action || ''));
      if (!name) { asks.push('จะตั้งสอบวิชาไหน'); return; }
      if (clear) {
        const real = matchSubjects(name);
        if (real.length !== 1) { asks.push(real.length ? `มีหลายวิชาที่คล้าย "${name}" หมายถึงอันไหน: ${real.map(s => s.name).join(', ')}` : `ไม่เจอวิชา "${name}"`); return; }
        items.push({ kind: 'clear-exam', subjectId: real[0].id });
        lines.push(`ลบวันสอบของ ${real[0].name}`);
        return;
      }
      const date = /^\d{4}-\d{2}-\d{2}$/.test(a.examDate || '') && examYearOk(a.examDate) ? a.examDate : '';
      if (!date) { asks.push('วันสอบยังไม่ชัด บอกเป็นวันที่อีกทีได้ไหม'); return; }
      const time = normClock(a.examTime);
      const room = String(a.room || '').trim().slice(0, 80);
      const real = matchSubjects(name);
      if (real.length > 1) { asks.push(`มีหลายวิชาที่คล้าย "${name}" หมายถึงอันไหน: ${real.map(s => s.name).join(', ')}`); return; }
      if (real.length === 1) {
        items.push({ kind: 'exam', subjectId: real[0].id, examDate: date, examTime: time, room });
        lines.push(`ตั้งสอบ ${real[0].name} เป็น ${fmtDateLong(date)}${time ? ' เวลา ' + time : ''}${roomText(room) ? ' ห้อง ' + roomText(room) : ''}`);
      } else {
        items.push({ kind: 'subject', name, examDate: date, examTime: time, room });
        planned.push(name);
        lines.push(`เพิ่มวิชา ${name} สอบ ${fmtDateLong(date)}${time ? ' เวลา ' + time : ''}`);
      }
      return;
    }
    if (call.name === 'add_subject') {
      if (!name) { asks.push('จะเพิ่มวิชาชื่ออะไร'); return; }
      if (matchSubjects(name).some(s => s.name.trim().toLowerCase() === name.toLowerCase())) { asks.push(`มีวิชา ${name} อยู่แล้ว`); return; }
      const date = /^\d{4}-\d{2}-\d{2}$/.test(a.examDate || '') && examYearOk(a.examDate) ? a.examDate : '';
      const time = normClock(a.examTime);
      const room = String(a.room || '').trim().slice(0, 80);
      items.push({ kind: 'subject', name, examDate: date, examTime: time, room });
      planned.push(name);
      lines.push(`เพิ่มวิชา ${name}${date ? ' สอบ ' + fmtDateLong(date) : ''}${time ? ' เวลา ' + time : ''}`);
      return;
    }
    if (call.name === 'add_task') {
      const title = String(a.title || '').trim().slice(0, 200);
      const date = /^\d{4}-\d{2}-\d{2}$/.test(a.date || '') && examYearOk(a.date) ? a.date : '';
      if (!title || !date) { asks.push('การบ้านยังขาดชื่อหรืองวดวันที่'); return; }
      const subName = String(a.subjectName || '').trim();
      const hits = subName ? matchSubjects(subName) : [];
      if (subName && hits.length !== 1) { asks.push(hits.length ? `การบ้านนี้ของวิชาไหน: ${hits.map(s => s.name).join(', ')}` : `ไม่เจอวิชา "${subName}" สำหรับการบ้าน`); return; }
      const time = normClock(a.time);
      const type = /event|กิจกรรม/i.test(String(a.type || '')) ? 'event' : 'homework';
      items.push({ kind: 'task', title, date, time, subjectId: hits[0] ? hits[0].id : '', type });
      lines.push(`เพิ่ม${type === 'event' ? 'กิจกรรม' : 'การบ้าน'} "${title}" วันที่ ${fmtDateLong(date)}${time ? ' เวลา ' + time : ''}${hits[0] ? ' · ' + hits[0].name : ''}`);
      return;
    }
    if (call.name === 'add_chapters') {
      let titles = a.titles;
      if (typeof titles === 'string') titles = titles.split(/\n|,|、/).map(s => s.trim());
      titles = (Array.isArray(titles) ? titles : []).map(t => String(t || '').trim().slice(0, 120)).filter(Boolean).slice(0, 30);
      const real = matchSubjects(name);
      const willCreate = planned.some(p => p.toLowerCase() === name.toLowerCase());
      if (!name || (real.length !== 1 && !willCreate)) {
        asks.push(real.length > 1 ? `เพิ่มบทในวิชาไหน: ${real.map(s => s.name).join(', ')}` : `จะเพิ่มบทในวิชาไหน${name ? ' ไม่เจอ "' + name + '"' : ''}`);
        return;
      }
      if (!titles.length) { asks.push('ยังไม่เห็นหัวข้อที่จะเพิ่ม'); return; }
      const s = real[0];
      const fresh = s ? titles.filter(t => !s.chapters.some(c => c.title === t)) : titles;
      if (s && !fresh.length) { asks.push('บทพวกนี้อยู่ในวิชานี้แล้ว'); return; }
      items.push({ kind: 'chapters', subjectId: s ? s.id : '', subjectName: s ? s.name : name, titles: fresh.length ? fresh : titles });
      lines.push(`เพิ่ม ${(fresh.length ? fresh : titles).length} บทใน ${s ? s.name : name}: ${(fresh.length ? fresh : titles).join(', ')}`);
      return;
    }
    if (call.name === 'delete_subject') {
      if (a.all) {
        if (!DB.subjects.length) { asks.push('ยังไม่มีวิชาให้ลบ'); return; }
        items.push({ kind: 'del-subject', all: true });
        lines.push(`ลบวิชาทั้งหมด (${DB.subjects.length} วิชา)`);
        return;
      }
      const real = matchSubjects(name);
      if (real.length !== 1) { asks.push(real.length ? `ลบวิชาไหน: ${real.map(s => s.name).join(', ')}` : `ไม่เจอวิชา "${name}"`); return; }
      items.push({ kind: 'del-subject', subjectId: real[0].id });
      lines.push(`ลบวิชา ${real[0].name}`);
      return;
    }
    if (call.name === 'delete_chapters') {
      const isAllSub = a.all && (!name || /^all|ทั้งหมด|ทุกวิชา$/i.test(name));
      const targets = isAllSub ? DB.subjects : matchSubjects(name);
      if (!isAllSub && targets.length !== 1) { asks.push(targets.length ? `ลบบทในวิชาไหน: ${targets.map(s => s.name).join(', ')}` : `ไม่เจอวิชา "${name}"`); return; }
      const titles = Array.isArray(a.titles) ? a.titles.map(t => String(t).trim()).filter(Boolean) : [];
      if (!a.all && !titles.length) { asks.push('ระบุชื่อบทที่จะลบ หรือบอกว่าลบทั้งหมด'); return; }
      items.push({ kind: 'del-chapters', subjectIds: targets.map(s => s.id), titles, all: !!a.all });
      lines.push(a.all ? `ลบทุกบทใน ${isAllSub ? 'ทุกวิชา' : targets[0].name}` : `ลบ ${titles.length} บทใน ${targets[0].name}`);
      return;
    }
    if (call.name === 'delete_files') {
      const isAllSub = a.all && (!name || /^all|ทั้งหมด|ทุกวิชา$/i.test(name));
      const targets = isAllSub ? DB.subjects : matchSubjects(name);
      if (!isAllSub && targets.length !== 1) { asks.push(targets.length ? `ลบไฟล์ในวิชาไหน: ${targets.map(s => s.name).join(', ')}` : `ไม่เจอวิชา "${name}"`); return; }
      const fileNames = Array.isArray(a.fileNames) ? a.fileNames.map(t => String(t).trim()).filter(Boolean) : [];
      items.push({ kind: 'del-files', subjectIds: targets.map(s => s.id), fileNames, all: !!a.all || !fileNames.length });
      lines.push(fileNames.length ? `ลบไฟล์ ${fileNames.join(', ')} ใน ${isAllSub ? 'ทุกวิชา' : targets[0].name}` : `ลบทุกไฟล์และลิงก์ใน ${isAllSub ? 'ทุกวิชา' : targets[0].name}`);
      return;
    }
    if (call.name === 'delete_task') {
      const title = String(a.title || '').trim();
      items.push({ kind: 'del-task', title, all: !!a.all });
      lines.push(a.all ? 'ลบการบ้าน/กิจกรรมทั้งหมด' : `ลบงาน "${title}"`);
      return;
    }
    if (call.name === 'add_plan') {
      const title = String(a.title || '').trim().slice(0, 200);
      const date = /^\d{4}-\d{2}-\d{2}$/.test(a.date || '') && examYearOk(a.date) ? a.date : '';
      if (!title || !date) { asks.push('แผนอ่านยังขาดชื่อหรือวันที่'); return; }
      const hits = name ? matchSubjects(name) : [];
      items.push({ kind: 'plan', title, date, time: normClock(a.time), subjectId: hits[0] ? hits[0].id : (DB.subjects[0]?.id || '') });
      lines.push(`เพิ่มตารางอ่าน "${title}" วันที่ ${fmtDateLong(date)}${a.time ? ' เวลา ' + normClock(a.time) : ''}`);
      return;
    }
    if (call.name === 'delete_plan') {
      items.push({ kind: 'del-plan', title: String(a.title || '').trim(), date: a.date || '', all: !!a.all });
      lines.push(a.all ? 'ลบตารางอ่านทั้งหมด' : `ลบรายการในตารางอ่าน`);
      return;
    }
    if (call.name === 'toggle_done') {
      const title = String(a.title || '').trim();
      if (!title) return;
      const hits = name ? matchSubjects(name) : [];
      items.push({ kind: 'toggle', target: a.target || 'chapter', title, subjectId: hits[0]?.id || '', done: !!a.done });
      lines.push(`${a.done ? 'ติ๊กเสร็จ' : 'เอาติ๊กออก'}: ${title}`);
      return;
    }
    if (call.name === 'auto_schedule') {
      items.push({ kind: 'auto-schedule' });
      lines.push('จัดตารางอ่านอัตโนมัติ');
    }
  });
  return { items, lines, asks };
}
function applyChatProposal(p) {
  const undo = [];
  const order = { subject: 0, exam: 1, 'clear-exam': 1, task: 1, plan: 1, chapters: 2, 'del-chapters': 2, 'del-files': 2, 'del-task': 2, 'del-plan': 2, 'del-subject': 3, toggle: 3, 'auto-schedule': 4 };
  p.items.slice().sort((a, b) => (order[a.kind] || 1) - (order[b.kind] || 1)).forEach(it => {
    if (it.kind === 'subject') {
      const id = uid();
      DB.subjects.push({
        id, name: it.name, examDate: it.examDate || '', examTime: it.examTime || '', room: it.room || '',
        color: SUBJECT_COLORS[DB.subjects.length % SUBJECT_COLORS.length], chapters: [],
      });
      undo.push(() => { DB.subjects = DB.subjects.filter(s => s.id !== id); });
    } else if (it.kind === 'del-subject') {
      const prevSub = JSON.parse(JSON.stringify(DB.subjects)), prevPlan = JSON.parse(JSON.stringify(DB.plan)), prevFc = JSON.parse(JSON.stringify(DB.flashcards));
      const ids = it.all ? DB.subjects.map(s => s.id) : [it.subjectId];
      ids.forEach(sid => { FileStore.delSubject(sid).catch(() => { }); });
      DB.subjects = DB.subjects.filter(s => !ids.includes(s.id));
      DB.plan = DB.plan.filter(x => !ids.includes(x.subjectId));
      DB.flashcards = DB.flashcards.filter(x => !ids.includes(x.subjectId));
      undo.push(() => { DB.subjects = prevSub; DB.plan = prevPlan; DB.flashcards = prevFc; });
    } else if (it.kind === 'del-chapters') {
      const prevSub = JSON.parse(JSON.stringify(DB.subjects)), prevPlan = JSON.parse(JSON.stringify(DB.plan));
      it.subjectIds.forEach(sid => {
        const s = subjectById(sid); if (!s) return;
        const rmIds = new Set(s.chapters.filter(c => it.all || it.titles.some(t => c.title.toLowerCase().includes(t.toLowerCase()))).map(c => c.id));
        s.chapters = s.chapters.filter(c => !rmIds.has(c.id));
        DB.plan = DB.plan.filter(x => !rmIds.has(x.chapterId));
      });
      undo.push(() => { DB.subjects = prevSub; DB.plan = prevPlan; });
    } else if (it.kind === 'del-files') {
      const prevSub = JSON.parse(JSON.stringify(DB.subjects)), prevDrv = JSON.parse(JSON.stringify(DB.driveFiles || []));
      it.subjectIds.forEach(sid => {
        const s = subjectById(sid); if (!s) return;
        if (it.all) {
          s.links = [];
          DB.driveFiles = (DB.driveFiles || []).filter(f => f.subjectId !== sid);
          FileStore.delSubject(sid).then(() => App.render()).catch(() => { });
        } else {
          const match = n => it.fileNames.some(q => String(n || '').toLowerCase().includes(q.toLowerCase()));
          s.links = (s.links || []).filter(l => !match(l.title) && !match(l.url));
          DB.driveFiles = (DB.driveFiles || []).filter(f => f.subjectId !== sid || !match(f.name));
          FileStore.list(sid).then(async list => {
            for (const f of list) if (match(f.name)) await FileStore.del(f.id, sid);
            App.render();
          }).catch(() => { });
        }
      });
      undo.push(() => { DB.subjects = prevSub; DB.driveFiles = prevDrv; });
    } else if (it.kind === 'del-task') {
      const prev = JSON.parse(JSON.stringify(DB.tasks));
      DB.tasks = it.all ? [] : DB.tasks.filter(t => !t.title.toLowerCase().includes(it.title.toLowerCase()));
      undo.push(() => { DB.tasks = prev; });
    } else if (it.kind === 'plan') {
      const id = uid();
      DB.plan.push({ id, subjectId: it.subjectId, chapterId: null, title: it.title, date: it.date, time: it.time || '', remind: true, kind: 'custom', done: false, auto: false });
      undo.push(() => { DB.plan = DB.plan.filter(x => x.id !== id); });
    } else if (it.kind === 'del-plan') {
      const prev = JSON.parse(JSON.stringify(DB.plan));
      DB.plan = it.all ? [] : DB.plan.filter(x => !( (!it.date || x.date === it.date) && (!it.title || x.title.toLowerCase().includes(it.title.toLowerCase())) ));
      undo.push(() => { DB.plan = prev; });
    } else if (it.kind === 'toggle') {
      const q = it.title.toLowerCase();
      if (it.target === 'task') DB.tasks.forEach(x => { if (x.title.toLowerCase().includes(q)) x.done = it.done; });
      else if (it.target === 'plan') DB.plan.forEach(x => { if (x.title.toLowerCase().includes(q)) x.done = it.done; });
      else DB.subjects.forEach(s => { if (!it.subjectId || s.id === it.subjectId) s.chapters.forEach(c => { if (c.title.toLowerCase().includes(q)) setChapterDone(s.id, c.id, it.done); }); });
    } else if (it.kind === 'auto-schedule') {
      const prev = JSON.parse(JSON.stringify(DB.plan));
      autoSchedule();
      undo.push(() => { DB.plan = prev; });
    } else if (it.kind === 'exam') {
      const s = subjectById(it.subjectId); if (!s) return;
      const prev = { examDate: s.examDate || '', examTime: s.examTime || '', room: s.room || '' };
      s.examDate = it.examDate || ''; s.examTime = it.examTime || ''; if (it.room) s.room = it.room;
      undo.push(() => { const x = subjectById(it.subjectId); if (x) Object.assign(x, prev); });
    } else if (it.kind === 'clear-exam') {
      const s = subjectById(it.subjectId); if (!s) return;
      const prev = { examDate: s.examDate || '', examTime: s.examTime || '', room: s.room || '' };
      s.examDate = ''; s.examTime = ''; s.room = '';
      undo.push(() => { const x = subjectById(it.subjectId); if (x) Object.assign(x, prev); });
    } else if (it.kind === 'task') {
      const id = uid();
      DB.tasks.push({ id, title: it.title, date: it.date, time: it.time || '', subjectId: it.subjectId || '', type: it.type === 'event' ? 'event' : 'homework', done: false });
      undo.push(() => { DB.tasks = DB.tasks.filter(t => t.id !== id); });
    } else if (it.kind === 'chapters') {
      const s = subjectById(it.subjectId) || DB.subjects.find(x => x.name.trim().toLowerCase() === String(it.subjectName || '').trim().toLowerCase());
      if (!s) return;
      const ids = [];
      it.titles.forEach(t => {
        if (s.chapters.some(c => c.title === t)) return;
        const id = uid();
        s.chapters.push({ id, title: t, done: false, note: '' });
        ids.push(id);
      });
      const sid = s.id;
      undo.push(() => { const x = subjectById(sid); if (x) x.chapters = x.chapters.filter(c => !ids.includes(c.id)); });
    }
  });
  p.status = 'applied';
  saveLocal();
  save();
  App.toast('อัปเดตตามที่อออบอกแล้ว', 7000, () => {
    for (let i = undo.length - 1; i >= 0; i--) undo[i]();
    save();
    App.toast('เลิกทำแล้ว');
  });
}
function findProposal(id) {
  return (LOCAL.chat || []).map(m => m.proposal).find(p => p && p.id === id);
}
async function sendChat(q) {
  q = (q || '').trim();
  const files = (App.chatAttach || []).slice();
  if (App.aiBusy) return;
  if (!q && !files.length) { App.toast('พิมพ์ข้อความหรือแนบไฟล์ก่อนส่งนะ'); return; }
  if (!AI.ready()) { App.toast('ใส่ API key ในตั้งค่าก่อนนะ'); App.go('settings'); return; }
  LOCAL.chat = LOCAL.chat || [];
  LOCAL.chat.push({ role: 'user', content: q, files: files.map(f => ({ name: f.name, thumb: f.thumb || '' })) });
  App.chatAttach = [];
  saveLocal();
  App.aiBusy = true; App.render();
  try {
    const hist = LOCAL.chat.slice(-16).map(m => ({ role: m.role, content: m.content || '' }));
    hist[hist.length - 1].files = files;
    const res = await AI.tutor(hist);
    const plan = interpretCalls(res.calls);
    let text = res.text || '';
    if (plan.asks.length) text = [text, ...plan.asks].filter(Boolean).join('\n---\n');
    if (!text && plan.items.length) text = 'เช็คให้หน่อย\n---\nกดยืนยันถ้าโอเค';
    const proposal = plan.items.length ? { id: uid(), status: 'pending', items: plan.items, lines: plan.lines } : null;
    LOCAL.chat.push({ role: 'assistant', content: text, proposal });
  } catch (e) { LOCAL.chat.push({ role: 'assistant', content: '⚠️ ' + e.message }); }
  App.aiBusy = false; saveLocal(); if (App.tab === 'ai') App.render();
}

/* ===== Actions ===== */
const Actions = {
  'go': el => { closeModal(); App.go(el.dataset.tab); },
  'close-modal': () => closeModal(),
  'toggle-dark': () => {
    if (DB.prefs.theme === 'navy') {
      App._fromNavy = true; DB.prefs.theme = 'sky'; DB.prefs.dark = false; save();
      App.toast('สลับเป็นโหมดสว่าง (ฟ้าใส) ☀️'); return;
    }
    if (App._fromNavy && !DB.prefs.dark) {
      App._fromNavy = false; DB.prefs.theme = 'navy'; DB.prefs.dark = true; save();
      App.toast('กลับเป็นธีมน้ำเงินเข้ม 🌙'); return;
    }
    App._fromNavy = false; DB.prefs.dark = !DB.prefs.dark; save();
  },
  'theme': el => { App._fromNavy = false; DB.prefs.theme = el.dataset.theme; DB.prefs.themeChosen = true; save(); },
  'toggle-past': () => { App.showPast = !App.showPast; App.render(); },

  // plan
  'auto-plan': () => {
    const before = new Set(DB.plan.map(p => p.id));
    const r = autoSchedule(); save();
    if (r.noExam) { App.toast('ต้องมีวิชาที่กำหนดวันสอบ (หลังวันนี้) ก่อนนะ'); return; }
    const dates = [...new Set(DB.plan.filter(p => !before.has(p.id)).map(p => fmtDate(p.date)))];
    const hint = dates.length ? ` (${dates.slice(0, 4).join(', ')}${dates.length > 4 ? '…' : ''})` : '';
    App.toast(r.leftover ? `จัดแล้ว ${r.added} รายการ${hint} แต่ยังเหลือ ${r.leftover} บท 😥` : `จัดตารางเรียบร้อย ${r.added} รายการ${hint} ✨`, 4500);
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

  // timetable
  'go-timetable': () => { App.calView = 'timetable'; App.go('calendar'); },
  'cal-view': el => { App.calView = el.dataset.v; App.render(); },
  'add-class': el => openModal('+ เพิ่มคาบเรียน', classForm({ day: el.dataset.day != null ? Number(el.dataset.day) : 1, start: el.dataset.start || '08:30' })),
  'edit-class': el => { const c = (DB.classes || []).find(x => x.id === el.dataset.id); if (c) openModal('✎ แก้ไขคาบเรียน', classForm(c)); },
  'del-class': el => { DB.classes = (DB.classes || []).filter(x => x.id !== el.dataset.id); closeModal(); save(); },
  'tt-png': () => {
    const classes = DB.classes || [];
    const toMin = s => { const [h, m] = (s || '08:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
    let minH = 8, maxH = 25;
    classes.forEach(c => { const s = Math.floor(toMin(c.start) / 60); if (s < minH) minH = s; });
    const cols = maxH - minH, daysOrder = [1, 2, 3, 4, 5, ...(classes.some(c => c.day === 6) ? [6] : []), ...(classes.some(c => c.day === 0) ? [0] : [])];
    const EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayW = 86, colW = 64, hdrH = 44, rowH = 74, padX = 24, padY = 24;
    const W = padX * 2 + dayW + cols * colW, H = padY * 2 + hdrH + daysOrder.length * rowH;
    const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2;
    const ctx = cv.getContext('2d'); ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    ctx.strokeRect(padX, padY, dayW + cols * colW, hdrH + daysOrder.length * rowH);
    ctx.fillStyle = '#1f2937'; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Day/Time', padX + dayW / 2, padY + hdrH / 2);
    for (let i = 0; i < cols; i++) {
      const x = padX + dayW + i * colW;
      ctx.beginPath(); ctx.moveTo(x, padY); ctx.lineTo(x, H - padY); ctx.stroke();
      ctx.fillStyle = '#374151'; ctx.fillText(String(minH + i), x + 14, padY + hdrH / 2);
    }
    daysOrder.forEach((d, r) => {
      const y = padY + hdrH + r * rowH;
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke();
      ctx.fillStyle = '#374151'; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(EN[d], padX + dayW / 2, y + rowH / 2);
      classes.filter(c => c.day === d).forEach(c => {
        const sm = Math.max(minH * 60, toMin(c.start)), em = Math.min(maxH * 60, Math.max(sm + 30, toMin(c.end) || sm + 60));
        const bx = padX + dayW + ((sm - minH * 60) / 60) * colW + 2, bw = ((em - sm) / 60) * colW - 4;
        const col = classColor(c);
        ctx.fillStyle = col + '26'; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(bx, y + 4, bw, rowH - 8, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col; ctx.font = '600 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText((c.title || subjectName(c.subjectId)).slice(0, 22), bx + bw / 2, y + rowH / 2 - 8, bw - 8);
        ctx.font = '400 11px sans-serif';
        ctx.fillText((c.room || `${c.start}–${c.end || ''}`).slice(0, 24), bx + bw / 2, y + rowH / 2 + 10, bw - 8);
      });
    });
    const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'timetable.png'; a.click();
    App.toast('บันทึกตารางเรียนเป็น PNG แล้ว 📸');
  },

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
  'file-dest': el => {
    LOCAL.fileDest = el.dataset.dest === 'local' ? 'local' : 'drive';
    saveLocal();
    filesRender();
  },
  'file-tab': el => { App.fileTab = el.dataset.t || 'list'; filesRender(); },
  'file-folder': el => { App.fileFolder = el.dataset.f || ''; filesRender(); },
  'file-folder-add': () => {
    const s = subjectById(App.filesSid); if (!s) return;
    const name = prompt('ชื่อโฟลเดอร์ใหม่ (เช่น ชีทสรุป, ข้อสอบเก่า)');
    if (!name || !name.trim()) return;
    const clean = name.trim().slice(0, 40);
    s.folders = s.folders || [];
    if (!s.folders.includes(clean)) s.folders.push(clean);
    App.fileFolder = clean; save({ silent: true }); filesRender();
  },
  'file-folder-del': async el => {
    const s = subjectById(App.filesSid); if (!s) return;
    const f = el.dataset.f;
    if (!confirm(`ลบโฟลเดอร์ "${f}"? (ไฟล์ข้างในจะยังอยู่ แค่ย้ายออกเป็นยังไม่จัดหมวด)`)) return;
    s.folders = (s.folders || []).filter(x => x !== f);
    (s.driveFiles || []).forEach(x => { if (x.folder === f) x.folder = ''; });
    (s.links || []).forEach(x => { if (x.folder === f) x.folder = ''; });
    const all = await FileStore.list(s.id).catch(() => []);
    for (const r of all) if (r.folder === f) await FileStore.setFolder(r.id, '');
    if (App.fileFolder === f) App.fileFolder = '';
    save({ silent: true }); filesRender();
  },
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
  'file-drive-open': el => {
    const id = safeDriveId(el.dataset.id || '');
    if (!id) return;
    const w = window.open('https://drive.google.com/file/d/' + id + '/view', '_blank', 'noopener');
    if (!w) App.toast('เปิดหน้าต่างไม่สำเร็จ อนุญาตป๊อปอัปแล้วลองใหม่');
  },
  'file-drive-del': async el => {
    if (App._uploading) return App.toast('กำลังอัปโหลดอยู่ รอสักครู่');
    const id = safeDriveId(el.dataset.id || '');
    if (!id) return;
    if (!Sync.user) return App.toast('ล็อกอินก่อน เพื่อลบไฟล์บน Drive');
    try {
      if (!(Drive.token && Date.now() < Drive.expires - 60000)) await Drive.ensureToken();
      if (!confirm('ลบไฟล์นี้จาก Google Drive?')) return;
      await Drive.deleteFile(id);
      const s = subjectById(App.filesSid);
      if (s) { s.driveFiles = (s.driveFiles || []).filter(f => f && f.id !== id); save({ silent: true }); }
      await FileStore.delDriveCache(App.filesSid, id);
      App.toast('ลบออกจาก Drive แล้ว');
    } catch (e) { App.toast((e && e.message) || 'ลบไฟล์บน Drive ไม่สำเร็จ', 6000); }
    filesRender();
  },
  'file-migrate': async el => {
    if (App._uploading) return App.toast('กำลังอัปโหลดอยู่ รอสักครู่');
    if (!Sync.user) return App.toast('ล็อกอินก่อน เพื่อย้ายไฟล์ขึ้น Google Drive');
    const pending = Drive.ensureToken();
    App._uploading = true;
    try {
      const rec = await FileStore.get(el.dataset.id);
      if (!rec || !rec.blob || rec.driveId) { pending.catch(() => { }); return; }
      await runDriveUploads(App.filesSid, [new File([rec.blob], rec.name || 'ไฟล์', { type: rec.type || '' })], [rec.id], pending);
    } catch (e) { pending.catch(() => { }); App.toast((e && e.message) || 'ย้ายขึ้น Drive ไม่สำเร็จ', 6000); }
    finally { App._uploading = false; filesRender(); }
  },
  'file-migrate-all': async () => {
    if (App._uploading) return App.toast('กำลังอัปโหลดอยู่ รอสักครู่');
    if (!Sync.user) return App.toast('ล็อกอินก่อน เพื่อย้ายไฟล์ขึ้น Google Drive');
    const pending = Drive.ensureToken();
    const sid = App.filesSid;
    App._uploading = true;
    try {
      const all = await FileStore.list(sid);
      const local = (all || []).filter(f => f && !f.driveId && f.blob);
      if (!local.length) { pending.catch(() => { }); App.toast('ไม่มีไฟล์ในเครื่องให้ย้าย'); return; }
      const files = local.map(r => new File([r.blob], r.name || 'ไฟล์', { type: r.type || '' }));
      await runDriveUploads(sid, files, local.map(r => r.id), pending);
    } catch (e) { pending.catch(() => { }); App.toast((e && e.message) || 'ย้ายขึ้น Drive ไม่สำเร็จ', 6000); }
    finally { App._uploading = false; filesRender(); }
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
  'clear-chat': () => { if (confirm('ล้างประวัติแชท?')) { LOCAL.chat = []; App.chatAttach = []; saveLocal(); App.render(); } },
  'chat-attach': () => document.getElementById('chatFile')?.click(),
  'chat-cam': () => document.getElementById('chatCam')?.click(),
  'chat-unchip': el => {
    const i = Number(el.dataset.i);
    if (App.chatAttach) App.chatAttach.splice(i, 1);
    const box = document.getElementById('chatChips');
    if (box) box.innerHTML = chatChipsHTML();
  },
  'chat-apply': el => {
    const p = findProposal(el.dataset.id);
    if (!p || p.status !== 'pending') return;
    applyChatProposal(p);
  },
  'chat-cancel': el => {
    const p = findProposal(el.dataset.id);
    if (!p || p.status !== 'pending') return;
    p.status = 'cancelled';
    saveLocal();
    App.render();
  },
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
  name(d) {
    const v = (d.name || '').trim();
    if (!v) return App.toast('กรุณาใส่ชื่อเล่นก่อนนะ');
    DB.name = v.slice(0, 60); save(); App.toast('บันทึกแล้ว 🌸');
  },
  async 'reset-confirm'(d) {
    if (d.word.trim() !== 'ลบทั้งหมด') return App.toast('กรุณาพิมพ์คำว่า "ลบทั้งหมด" ให้ตรงกันนะ');
    closeModal();
    replaceDB(defaultData());
    try { await FileStore.clearAll(); } catch { /* study data is already gone; files are best-effort */ }
    App.go('home');
    App.toast('ล้างข้อมูลทั้งหมดแล้ว');
  },
  subject(d, f) {
    const name = (d.name || '').trim();
    if (!name) return App.toast('ใส่ชื่อวิชาก่อนนะ');
    if (d.examDate && !examYearOk(d.examDate)) return App.toast('วันสอบควรอยู่ระหว่างปีที่แล้วถึงอีก 5 ปีนะ');
    const color = safeColor(d.color || d.customColor || SUBJECT_COLORS[0]);
    let s = subjectById(f.dataset.id);
    if (!s) {
      s = { id: uid(), chapters: [] }; DB.subjects.push(s);
      (d.chapters || '').split('\n').map(x => x.trim()).filter(Boolean).forEach(title => s.chapters.push({ id: uid(), title: title.slice(0, 200), done: false, note: '' }));
    }
    Object.assign(s, { name: name.slice(0, 120), examDate: d.examDate || '', examTime: d.examTime || '', room: (d.room || '').trim().slice(0, 80), color });
    (DB.classes || []).forEach(c => { if (c.subjectId === s.id) c.color = color; });
    if (d.examDate) Notifier.ask();
    closeModal(); save();
  },
  chapters(d, f) {
    const s = subjectById(f.dataset.sid);
    const titles = (d.list || '').split('\n').map(x => x.trim()).filter(Boolean).map(t => t.slice(0, 200));
    const raw = parseInt(d.count, 10);
    const n = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 100) : 0;
    if (!titles.length && !n) return App.toast('ใส่ชื่อบทอย่างน้อย 1 บทนะ');
    const start = s.chapters.length;
    for (let i = 1; i <= n; i++) titles.push(`${(d.prefix || '').trim() || 'บทที่ '}${start + i}`);
    titles.forEach(title => s.chapters.push({ id: uid(), title, done: false, note: '' }));
    closeModal(); save(); App.toast(`เพิ่ม ${titles.length} บทแล้ว`);
  },
  task(d, f) {
    const title = (d.title || '').trim();
    if (!title) return App.toast('ใส่ชื่องานก่อนนะ');
    if (d.date && !examYearOk(d.date)) return App.toast('วันที่ควรอยู่ระหว่างปีที่แล้วถึงอีก 5 ปีนะ');
    let x = DB.tasks.find(x => x.id === f.dataset.id);
    if (!x) { x = { id: uid(), done: false }; DB.tasks.push(x); }
    Object.assign(x, { title: title.slice(0, 200), type: d.type, date: d.date, time: d.time, subjectId: d.subjectId, remind: !!d.remind });
    if (d.remind) Notifier.ask();
    closeModal(); save();
  },
  plan(d, f) {
    const s = subjectById(d.subjectId), c = s?.chapters.find(c => c.id === d.chapterId);
    const title = d.title.trim() || c?.title;
    if (!title) return App.toast('เลือกบทหรือพิมพ์รายละเอียดด้วยนะ');
    if (d.date && !examYearOk(d.date)) return App.toast('วันที่ควรอยู่ระหว่างปีที่แล้วถึงอีก 5 ปีนะ');
    let p = DB.plan.find(x => x.id === f.dataset.id);
    if (!p) { p = { id: uid(), done: false }; DB.plan.push(p); }
    Object.assign(p, { subjectId: d.subjectId, chapterId: c ? c.id : null, title, date: d.date, time: d.time || '', remind: !!d.remind, kind: c ? 'read' : 'custom', auto: false });
    if (d.remind && d.time) Notifier.ask();
    closeModal(); save();
  },
  'class'(d, f) {
    const title = (d.title || '').trim();
    if (!d.subjectId && !title) return App.toast('เลือกวิชาหรือพิมพ์ชื่อวิชาก่อนนะ');
    DB.classes = DB.classes || [];
    let c = DB.classes.find(x => x.id === f.dataset.id);
    if (!c) { c = { id: uid() }; DB.classes.push(c); }
    const pickedColor = safeColor(d.color || d.customColor || SUBJECT_COLORS[0]);
    if (d.subjectId) {
      const sub = subjectById(d.subjectId);
      if (sub) sub.color = pickedColor;
      DB.classes.forEach(x => { if (x.subjectId === d.subjectId) x.color = pickedColor; });
    }
    Object.assign(c, {
      day: Number(d.day), start: d.start || '08:30', end: d.end || '',
      subjectId: d.subjectId || '', title: title.slice(0, 120), room: (d.room || '').trim().slice(0, 80),
      color: pickedColor,
    });
    closeModal(); save();
  },
  note(d, f) {
    const s = subjectById(f.dataset.sid), c = s.chapters.find(c => c.id === f.dataset.id);
    c.note = d.note; save(); App.toast('บันทึกโน้ตแล้ว 📝');
  },
  session(d) {
    const m = Math.round(Number(d.minutes));
    if (!(m > 0) || m > 1440) return App.toast('ใส่เวลา 1–1440 นาทีนะ');
    if (d.date && !examYearOk(d.date)) return App.toast('วันที่ควรอยู่ระหว่างปีที่แล้วถึงอีก 5 ปีนะ');
    if (!logSession(d.subjectId, m, d.date)) return App.toast('ใส่เวลา 1–1440 นาทีนะ');
    App.toast('บันทึกแล้ว');
  },
  chat(d) { sendChat(d.q); },
  'fc-add'(d) {
    const q = (d.q || '').trim(), a = (d.a || '').trim();
    if (!q || !a) return App.toast('ใส่ทั้งคำถามและคำตอบนะ');
    DB.flashcards.push({ id: uid(), subjectId: App.fc.sid, chapterId: null, q: q.slice(0, 300), a: a.slice(0, 300), known: false });
    save({ silent: true }); fcRender();
  },
  'link-add'(d, f) {
    const s = subjectById(App.filesSid); if (!s) return;
    const err = f.querySelector('[data-url-error]');
    if (err) { err.hidden = true; err.textContent = ''; }
    const title = (d.title || '').trim();
    if (!title) { App.toast('ใส่ชื่อเอกสารด้วยนะ'); return; }
    const parsed = normalizeLink(d.url);
    if (parsed.error) { if (err) { err.hidden = false; err.textContent = parsed.error; } else App.toast(parsed.error); return; }
    s.links = s.links || [];
    const folder = App.fileFolder && App.fileFolder !== '__none__' ? App.fileFolder : '';
    s.links.unshift({ id: uid(), title, url: parsed.url, folder, addedAt: Date.now() });
    f.reset(); App.fileTab = 'list'; save({ silent: true }); filesRender();
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
  'chat-file': el => {
    const files = [...(el.files || [])];
    el.value = '';
    if (files.length) addChatFiles(files);
  },
  'upload-folder': el => { App.fileFolder = el.value || ''; filesRender(); },
  'move-file-folder': async el => {
    const s = subjectById(App.filesSid); if (!s) return;
    const { kind, id } = el.dataset, folder = el.value || '';
    if (kind === 'drive') {
      const f = (s.driveFiles || []).find(x => x.id === id);
      if (f) { f.folder = folder; save({ silent: true }); }
    } else if (kind === 'link') {
      const l = (s.links || []).find(x => x.id === id);
      if (l) { l.folder = folder; save({ silent: true }); }
    } else if (kind === 'local') {
      await FileStore.setFolder(id, folder);
    }
    App.toast(folder ? `ย้ายไปโฟลเดอร์ "${folder}" แล้ว` : 'นำออกจากโฟลเดอร์แล้ว');
    filesRender();
  },
  'file-upload': async el => {
    const files = [...(el.files || [])];
    el.value = '';
    await uploadSubjectFiles(App.filesSid, files);
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
      data.updatedAt = Date.now(); replaceDB(sanitizeIncoming(data)); App.toast('นำเข้าข้อมูลเรียบร้อย ✓');
    }).catch(e => App.toast('นำเข้าไม่สำเร็จ: ' + e.message));
  },
};

async function uploadSubjectFiles(sid, files) {
  if (!files.length || !sid || App._uploading) return;
  if (!fileGoesToDrive()) {
    const n = await saveLocalFiles(sid, files);
    const tail = Sync.user ? `บันทึก ${n} ไฟล์ในเครื่องนี้แล้ว` : `บันทึก ${n} ไฟล์ในเครื่องนี้แล้ว — ล็อกอินเพื่ออัปโหลดขึ้น Drive`;
    App.toast(n ? tail : 'บันทึกไฟล์ในเครื่องไม่สำเร็จ');
    App.fileTab = 'list'; filesRender();
    return;
  }
  const pending = Drive.ensureToken();
  App._uploading = true;
  try { await runDriveUploads(sid, files, null, pending); }
  finally { App._uploading = false; App.fileTab = 'list'; filesRender(); }
}

function setPath(obj, path, val) { const ks = path.split('.'); let o = obj; ks.slice(0, -1).forEach(k => o = o[k]); o[ks[ks.length - 1]] = val; }

function bindEvents() {
  const modalBody = document.getElementById('modalBody');
  modalBody.addEventListener('dragover', e => {
    const box = e.target.closest('#fileDropzone');
    if (!box) return;
    e.preventDefault();
    box.classList.add('dragover');
  });
  modalBody.addEventListener('dragleave', e => {
    const box = e.target.closest('#fileDropzone');
    if (!box || box.contains(e.relatedTarget)) return;
    box.classList.remove('dragover');
  });
  modalBody.addEventListener('drop', e => {
    const box = e.target.closest('#fileDropzone');
    if (!box) return;
    e.preventDefault();
    box.classList.remove('dragover');
    const files = [...(e.dataTransfer?.files || [])];
    if (files.length) uploadSubjectFiles(App.filesSid, files);
  });
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
