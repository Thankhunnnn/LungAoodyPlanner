/* ===== Main app: views, actions, forms ===== */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  layers: '<path d="m12 2 9 4.5-9 4.5-9-4.5Z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 17.5 9 4.5 9-4.5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16v-4"/><path d="M12 16V8"/><path d="M17 16v-6"/>',
  sparkles: '<path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z"/><path d="M5 19v-2"/><path d="M4 18h2"/><path d="M19 5v-2"/><path d="M18 4h2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  skip: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'arrow-up': '<path d="m12 19V5"/><path d="m5 12 7-7 7 7"/>',
  paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
  cards: '<rect x="3" y="5" width="14" height="16" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v14"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="15" cy="14" r="1"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  alert: '<path d="m10.29 3.86-7.5 13A2 2 0 0 0 4.53 20h14.94a2 2 0 0 0 1.74-3l-7.5-13a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};
const ico = (name, size = 16) => `<svg class="svg-ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

const THEMES = [
  ['pink', 'ชมพูพาสเทล', '#ec6a9c'], ['lavender', 'ลาเวนเดอร์', '#9b7ede'], ['mint', 'มิ้นต์', '#3fb68b'],
  ['peach', 'พีช', '#f08a5d'], ['mono', 'มินิมอล', '#555555'],
  ['sky', 'อู๊ด', '#60c5ff'], ['navy', 'Madrid', '#3b82f6'], ['manutd', 'Man U', '#dc2626'],
];
const isMinimalTheme = (th = DB.prefs.theme || 'sky') => ['mono', 'pink', 'lavender', 'mint', 'peach'].includes(th);
const liveTimeStr = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const aiTabLabel = () => {
  const th = DB.prefs.theme || 'sky';
  return isMinimalTheme(th) ? 'Ask AI' : th === 'navy' ? 'Ask Kylian' : th === 'manutd' ? 'Ask Dr.Marcus' : 'อู๊ดเอไอ';
};
const aiBotName = () => {
  const th = DB.prefs.theme || 'sky';
  return isMinimalTheme(th) ? 'AI' : th === 'navy' ? 'Kylian' : th === 'manutd' ? 'Dr.Marcus' : 'อออ';
};
const TABS = [
  ['home', ico('home'), 'หน้าแรก'], ['plan', ico('book'), 'To do list'], ['subjects', ico('layers'), 'วิชา'], ['calendar', ico('calendar'), 'ปฏิทินและตารางเรียน'],
  ['timer', ico('clock'), 'จับเวลา'], ['stats', ico('chart'), 'สถิติ'], ['ai', ico('sparkles'), 'อู๊ดเอไอ'],
];
const ALL_TABS = [...TABS, ['settings', ico('settings'), 'ตั้งค่า']];

function subjectMatchesName(s, title) {
  const a = String(s?.name || '').trim().toLowerCase();
  const b = String(title || '').trim().toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  const codeA = (/^\d{4,10}/.exec(a) || [])[0];
  const codeB = (/^\d{4,10}/.exec(b) || [])[0];
  return !!(codeA && codeB && codeA === codeB);
}
function autoLinkClassesToSubjects() {
  let changed = false;
  (DB.classes || []).forEach(c => {
    if (c.subjectId) return;
    const sub = DB.subjects.find(s => subjectMatchesName(s, c.title));
    if (sub) { c.subjectId = sub.id; c.color = sub.color || c.color; changed = true; }
  });
  if (changed) save({ silent: true });
}

function examCutoffDate() {
  const dates = DB.subjects.map(s => s.examDate).filter(Boolean).sort();
  return dates.length ? weekStart(dates[0]) : '';
}
function lastExamDate() {
  const dates = DB.subjects.map(s => s.examDate).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : '';
}
function classesOnDate(d) {
  if (!d) return [];
  const cut = examCutoffDate();
  if (cut && d >= cut && DB.prefs.hideClassesInExam !== false) return [];
  const dow = parseDate(d).getDay();
  return (DB.classes || []).filter(c => c.day === dow).sort((a, b) => a.start.localeCompare(b.start));
}

function allTermNames() {
  const cur = (DB.term || 'เทอม 1').trim() || 'เทอม 1';
  return [cur, ...Object.keys(DB.terms || {}).filter(k => k && k !== cur)];
}
function switchTerm(targetName) {
  const cur = (DB.term || 'เทอม 1').trim() || 'เทอม 1';
  const nextName = String(targetName || '').trim().slice(0, 40);
  if (!nextName || nextName === cur) return;
  DB.terms = DB.terms || {};
  DB.terms[cur] = {
    subjects: DB.subjects || [],
    classes: DB.classes || [],
    plan: DB.plan || [],
    tasks: DB.tasks || [],
  };
  const next = DB.terms[nextName] || { subjects: [], classes: [], plan: [], tasks: [] };
  DB.subjects = Array.isArray(next.subjects) ? next.subjects : [];
  DB.classes = Array.isArray(next.classes) ? next.classes : [];
  DB.plan = Array.isArray(next.plan) ? next.plan : [];
  DB.tasks = Array.isArray(next.tasks) ? next.tasks : [];
  delete DB.terms[nextName];
  DB.term = nextName;
  App.todoSub = '';
  autoLinkClassesToSubjects();
  save();
  App.toast(`สลับไป ${nextName} แล้ว 🎓`);
}

function toMin(s) {
  const [h, m] = String(s || '08:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function smartActionData() {
  try {
    const t = todayStr();
    if (Timer.running || Timer.remaining != null) {
      const sec = Timer.left(), txt = `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
      const sub = Timer.subjectId ? subjectName(Timer.subjectId) : 'โฟกัสอิสระ';
      if (Timer.running) {
        return {
          badge: Timer.mode === 'work' ? 'กำลังโฟกัส' : 'พักเบรก',
          kind: 'focus',
          text: `${esc(sub)} · <strong id="smartTimerTxt" class="stat-num">${txt}</strong>`,
          btn: `${ico('pause', 13)} พัก`,
          attrs: 'data-act="timer-pause"'
        };
      }
      return {
        badge: 'หยุดชั่วคราว',
        kind: 'paused',
        text: `${esc(sub)} · <strong id="smartTimerTxt" class="stat-num">${txt}</strong>`,
        btn: `${ico('play', 12)} ทำต่อ`,
        attrs: 'data-act="timer-start"',
        extraBtn: `<button type="button" class="btn small ghost smart-reset" data-act="timer-reset" title="รีเซ็ตเวลา">${ico('reset', 13)}</button>`
      };
    }
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nearCls = classesOnDate(t).find(c => {
      if (!c || !c.start) return false;
      const sm = toMin(c.start);
      const em = Math.max(sm + 30, toMin(c.end) || sm + 60);
      return em > nowMin && (sm - nowMin) <= 180;
    });
    if (nearCls) {
      const sm = toMin(nearCls.start);
      const diff = sm - nowMin;
      const roomTxt = nearCls.room ? ` · ห้อง ${esc(nearCls.room)}` : '';
      const whenTxt = diff <= 0 ? `กำลังเรียน (${esc(nearCls.start)}${roomTxt})` : `อีก ${fmtMin(diff)} มีเรียน (${esc(nearCls.start)}${roomTxt})`;
      return {
        badge: diff <= 0 ? 'กำลังเรียน' : 'คาบถัดไป',
        kind: 'class',
        text: `<strong>${esc(className(nearCls))}</strong> · ${whenTxt}`,
        btn: 'ดูตาราง',
        attrs: 'data-act="go-timetable"'
      };
    }
    const nextPlan = planForDate(t).find(p => !p.done);
    if (nextPlan) {
      return {
        badge: 'แนะนำตอนนี้',
        kind: 'study',
        text: `อ่าน <strong>${esc(subjectName(nextPlan.subjectId))}</strong> · ${esc(nextPlan.title)}`,
        btn: `${ico('play', 12)} เริ่มอ่านเลย`,
        attrs: `data-act="smart-focus" data-sid="${esc(nextPlan.subjectId)}"`
      };
    }
    const exams = upcomingExams();
    const targetSub = exams.find(s => (s.chapters || []).some(ch => !ch.done)) || DB.subjects.find(s => (s.chapters || []).some(ch => !ch.done));
    if (targetSub) {
      const nextCh = (targetSub.chapters || []).find(ch => !ch.done);
      return {
        badge: 'แนะนำตอนนี้',
        kind: 'study',
        text: `อ่าน <strong>${esc(targetSub.name)}</strong> · ${esc(nextCh.title)}`,
        btn: `${ico('play', 12)} เริ่มอ่านเลย`,
        attrs: `data-act="smart-focus" data-sid="${esc(targetSub.id)}"`
      };
    }
    const nextTask = (DB.tasks || []).filter(x => !x.done).sort((a, b) => (a.date || '9999-99-99').localeCompare(b.date || '9999-99-99') || (a.time || '').localeCompare(b.time || ''))[0];
    if (nextTask) {
      const subTxt = nextTask.subjectId ? ` (${esc(subjectName(nextTask.subjectId))})` : '';
      return {
        badge: 'งานถัดไป',
        kind: 'task',
        text: `<strong>${esc(nextTask.title)}</strong>${subTxt}`,
        btn: 'ดูงานค้าง',
        attrs: 'data-act="open-pending"'
      };
    }
    if (!DB.subjects.length) {
      return {
        badge: 'เริ่มต้น',
        kind: 'idle',
        text: 'เพิ่มวิชาและวันสอบเพื่อเริ่มวางแผนกันเลย',
        btn: '+ เพิ่มวิชา',
        attrs: 'data-act="add-subject"'
      };
    }
    const ex = exams[0];
    const totCh = DB.subjects.reduce((a, s) => a + (s.chapters?.length || 0), 0);
    if (totCh === 0 && ex) {
      const n = daysBetween(t, ex.examDate);
      return {
        badge: 'เตรียมสอบ',
        kind: 'study',
        text: n === 0 ? `วันนี้สอบ <strong>${esc(ex.name)}</strong> สู้ๆ!` : `โฟกัส <strong>${esc(ex.name)}</strong> · อีก ${n} วันสอบ`,
        btn: `${ico('play', 12)} เริ่มอ่านเลย`,
        attrs: `data-act="smart-focus" data-sid="${esc(ex.id)}"`
      };
    }
    if (totCh === 0) {
      return {
        badge: 'เริ่มต้น',
        kind: 'idle',
        text: 'เพิ่มบทเรียนหรือกำหนดวันสอบเพื่อเริ่มวางแผนกันเลย',
        btn: '+ เพิ่มวิชา',
        attrs: 'data-act="add-subject"'
      };
    }
    return {
      badge: 'ทบทวน',
      kind: 'study',
      text: ex ? `อ่านครบทุกบทแล้ว! ทบทวน <strong>${esc(ex.name)}</strong> กันต่อ` : 'อ่านครบทุกบทแล้ว! พร้อมทบทวนได้เลย',
      btn: `${ico('play', 12)} จับเวลาทบทวน`,
      attrs: `data-act="smart-focus" data-sid="${esc(ex?.id || '')}"`
    };
  } catch (err) {
    console.warn('smartActionData error:', err);
    return { badge: 'พร้อมลุย', kind: 'idle', text: 'วางแผนอ่านหนังสือกันต่อเลย', btn: '', attrs: '' };
  }
}

const App = {
  tab: 'home', calView: 'month', calMonth: todayStr().slice(0, 7), statWeek: weekStart(todayStr()), showPast: false, todoSub: '',
  agendaDay: new Date().getDay(), ttView: '',
  aiSub: '', aiCh: '', aiBusy: false, chatAttach: [], replanPreview: null, fc: null, quiz: null,

  init() {
    this.applyTheme();
    const setHash = h => {
      if (h === 'timetable') { this.tab = 'calendar'; this.calView = 'timetable'; return; }
      if (ALL_TABS.some(t => t[0] === h)) this.tab = h;
    };
    setHash(location.hash.slice(1));
    autoLinkClassesToSubjects();
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
    document.documentElement.dataset.theme = DB.prefs.theme || 'sky';
    document.documentElement.dataset.home = this.tab === 'home' ? '1' : '0';
    document.documentElement.dataset.dark = DB.prefs.dark ? '1' : '0';
    const c = (THEMES.find(t => t[0] === DB.prefs.theme) || THEMES[0])[2];
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', DB.prefs.dark ? '#1d1a1f' : c);
    const tc = DB.prefs.tagColors || {};
    const rs = document.documentElement.style;
    rs.setProperty('--tag-plan', safeColor(tc.plan || '#3b82f6'));
    rs.setProperty('--tag-exam', safeColor(tc.exam || '#a855f7'));
    rs.setProperty('--tag-hw', safeColor(tc.hw || '#f59e0b'));
    rs.setProperty('--tag-ev', safeColor(tc.ev || '#10b981'));
  },

  go(tab) {
    if (tab === 'plan') { this.todoSub = ''; }
    else if (tab === 'calendar' && this.tab !== 'calendar') { this.calView = 'month'; }
    location.hash = tab; this.tab = tab; this.render(); window.scrollTo({ top: 0 });
    const main = document.getElementById('main');
    if (main) { main.classList.remove('view-active'); void main.offsetWidth; main.classList.add('view-active'); }
  },

  render() {
    const hdr = document.getElementById('header');
    hdr.classList.toggle('compact', this.tab !== 'home');
    hdr.innerHTML = this.headerHTML();
    const nextEx = upcomingExams()[0];
    const theme = DB.prefs.theme || 'sky';
    const isFootball = theme === 'navy';
    const isManU = theme === 'manutd';
    const isMono = isMinimalTheme(theme);
    document.getElementById('nav').innerHTML = `
      <div class="side-brand"><span class="side-logo">${isFootball ? '<img src="assets/madrid-crest.png" alt="Real Madrid" class="side-logo-img">' : isManU ? '<img src="assets/manutd-crest.png" alt="Man Utd" class="side-logo-img">' : isMono ? ico('layers', 18) : '🐃'}</span><div><b>LungAoody</b><small>Study Planner</small></div></div>
      <div class="side-term">
        <select class="side-term-sel" data-chg="switch-term" aria-label="เลือก Workflow">
          ${allTermNames().map(t => `<option value="${esc(t)}" ${t === (DB.term || 'เทอม 1') ? 'selected' : ''}>${esc(t)}</option>`).join('')}
        </select>
        <button type="button" class="mini-btn" data-act="new-term" title="สร้าง Workflow ใหม่แยกข้อมูลอิสระ">+ ใหม่</button>
        ${allTermNames().length > 1 ? `<button type="button" class="mini-btn" data-act="del-term" title="ลบ Workflow ปัจจุบัน">${ico('trash', 13)}</button>` : ''}
      </div>
      <div class="side-tabs">${ALL_TABS.map(([id, ic, label]) =>
        `<button class="tab ${this.tab === id ? 'active' : ''}" data-act="go" data-tab="${id}"><span class="ic">${ic}</span><span>${id === 'ai' ? aiTabLabel() : label}</span></button>`).join('')}</div>
      ${isFootball ? '<div class="side-hala" aria-hidden="true">Hala Madrid</div>' : isManU ? '<div class="side-hala" aria-hidden="true">Glory Glory Man United</div>' : ''}`;
    const main = document.getElementById('main');
    main.innerHTML = (Views[this.tab] || Views.home)();
    syncGutters();
    if (this.tab === 'ai') { const box = document.getElementById('chatBox'); if (box) box.scrollTop = box.scrollHeight; }
  },

  renderTimerBits() {
    const sec = Timer.left(), txt = `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
    const d = document.getElementById('timerDisplay'); if (d) d.textContent = txt;
    const sm = document.getElementById('smartTimerTxt'); if (sm) sm.textContent = txt;
    const ring = document.getElementById('timerRing');
    if (ring) ring.style.setProperty('--p', (1 - sec / Timer.dur()) * 100);
    const btn = document.getElementById('timerStartBtn');
    if (btn) {
      btn.innerHTML = btn.dataset.mini ? (Timer.running ? ico('pause', 13) : ico('play', 13)) : (Timer.running ? `${ico('pause')} พัก` : `${ico('play')} เริ่ม`);
      btn.dataset.act = Timer.running ? 'timer-pause' : 'timer-start';
    }
    const clk = document.getElementById('liveClock');
    if (clk) clk.innerHTML = `${ico('clock', 14)} ${liveTimeStr()}`;
    document.title = Timer.running ? `${txt} · ${Timer.mode === 'work' ? 'โฟกัส' : 'พัก'} — LungAoodyPlanner` : 'LungAoodyPlanner 🐃';
  },

  headerHTML() {
    const t = todayStr();
    let left = '';
    if (this.tab === 'home') {
      const sa = smartActionData();
      left = `<div class="hello hello-smart">
        <div class="avatar">${avatarImg()}</div>
        <div class="smart-next">
          <div class="smart-next-top">
            <span class="smart-badge is-${sa.kind}">${sa.badge}</span>
            ${DB.name ? `<span class="smart-who">${esc(DB.name)}</span>` : ''}
          </div>
          <p class="smart-text">${sa.text}</p>
        </div>
        ${sa.btn ? `<div class="smart-cta-wrap"><button type="button" class="btn small smart-cta" ${sa.attrs}>${sa.btn}</button>${sa.extraBtn || ''}</div>` : ''}
      </div>`;
    } else {
      const cur = ALL_TABS.find(x => x[0] === this.tab) || ALL_TABS[0];
      const curTitle = cur[0] === 'ai' ? aiTabLabel() : cur[2];
      left = `<div class="hello compact"><button class="avatar avatar-btn" data-act="go" data-tab="home" title="หน้าแรก">${avatarImg()}</button><h1>${cur[1]} ${curTitle}</h1></div>`;
    }
    const isDark = !!DB.prefs.dark;
    const th = DB.prefs.theme || 'sky';
    const thMeta = THEMES.find(x => x[0] === th) || THEMES[0];
    return `${left}
      <div class="head-actions">
        <span class="mob-term-wrap">
          <select class="side-term-sel" data-chg="switch-term" aria-label="เลือก Workflow">
            ${allTermNames().map(tm => `<option value="${esc(tm)}" ${tm === (DB.term || 'เทอม 1') ? 'selected' : ''}>${esc(tm)}</option>`).join('')}
          </select>
          <button type="button" class="mini-btn" data-act="new-term" title="สร้าง Workflow ใหม่">+ ใหม่</button>
        </span>
        <span class="chip date-pill">${ico('calendar', 14)} ${fmtDateLong(t)}</span>
        <span id="liveClock" class="chip date-pill live-clock" aria-label="เวลาปัจจุบัน">${ico('clock', 14)} ${liveTimeStr()}</span>
        ${this.syncBadgeHTML()}
        <button class="chip theme-pick-btn" data-act="open-themes" style="--th-c:${thMeta[2]}" title="คลิกเพื่อเปลี่ยนธีม"><span class="theme-pick-dot"></span><span>ธีม: ${esc(thMeta[1])}</span><span class="theme-pick-caret">▾</span></button>
        <button class="icon-btn head-settings-btn ${this.tab === 'settings' ? 'active' : ''}" data-act="go" data-tab="settings" title="ตั้งค่า" aria-label="ตั้งค่า">${ico('settings', 17)}</button>
        <button class="icon-btn" data-act="toggle-dark" title="${isDark ? 'โหมดสว่าง' : 'โหมดมืด'}" aria-label="${isDark ? 'โหมดสว่าง' : 'โหมดมืด'}">${isDark ? ico('sun', 17) : ico('moon', 17)}</button>
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
App._modalStack = App._modalStack || [];
function _updateModalBackBtn() {
  const b = document.getElementById('modalBack');
  if (b) b.hidden = !App._modalStack?.length;
}
function openModal(title, html, wide = false, opts = {}) {
  const m = document.getElementById('modal');
  const titleEl = document.getElementById('modalTitle');
  if (opts.push !== false && !m.classList.contains('hidden')) {
    App._modalStack = App._modalStack || [];
    App._modalStack.push({
      title: titleEl.innerHTML,
      html: document.getElementById('modalBody').innerHTML,
      wide: m.querySelector('.modal-box').classList.contains('wide'),
      _dayOpen: App._dayOpen || '',
      _pendingOpen: !!App._pendingOpen,
      filesSid: App.filesSid || null,
      _chFiles: App._chFiles ? { ...App._chFiles } : null,
    });
  }
  if (!opts.keepPending) App._pendingOpen = false;
  titleEl.innerHTML = title;
  titleEl.hidden = !title;
  document.getElementById('modalBody').innerHTML = html;
  m.querySelector('.modal-box').classList.toggle('wide', wide);
  m.classList.remove('hidden');
  _updateModalBackBtn();
  setTimeout(() => m.querySelector('input:not([type=checkbox]):not([type=color]):not([type=file]),textarea')?.focus(), 50);
}
function modalBack() {
  const prev = (App._modalStack || []).pop();
  if (!prev) return closeModal();
  App._dayOpen = prev._dayOpen || '';
  App._pendingOpen = !!prev._pendingOpen;
  App.filesSid = prev.filesSid || null;
  App._chFiles = prev._chFiles || null;
  if (prev._pendingOpen) { openPendingModal({ push: false }); return; }
  if (prev._dayOpen && !prev._chFiles && !prev.filesSid) { dayModal(prev._dayOpen, { push: false }); return; }
  openModal(prev.title, prev.html, prev.wide, { push: false, keepPending: prev._pendingOpen });
  if (prev._chFiles) renderChapterFilesModal();
  else if (prev.filesSid) filesRender();
}
function setModalBody(html) { document.getElementById('modalBody').innerHTML = html; }
function closeModal() {
  const needRender = !!(App.fc || App.filesSid);
  document.getElementById('modal').classList.add('hidden');
  const titleEl = document.getElementById('modalTitle');
  titleEl.innerHTML = '';
  titleEl.hidden = true;
  App._modalStack = [];
  _updateModalBackBtn();
  App.fc = null; App.quiz = null; App.filesSid = null; App._examImg = null; App._dayOpen = ''; App._pendingOpen = false; App._chFiles = null;
  if (needRender) App.render();
}

/* ===== Small UI pieces ===== */
const tag = id => `<span class="tag" style="--c:${subjectColor(id)}">${esc(subjectName(id))}</span>`;
function time24HTML(name, val = '', opts = {}) {
  const m = /^(\d{2}):(\d{2})/.exec(String(val || ''));
  const hh = m ? m[1] : '', mm = m ? m[2] : '';
  const hrs = [...Array(24)].map((_, h) => { const v = pad(h); return `<option value="${v}" ${hh === v ? 'selected' : ''}>${v}</option>`; }).join('');
  const mins = [...Array(60)].map((_, i) => { const v = pad(i); return `<option value="${v}" ${mm === v ? 'selected' : ''}>${v}</option>`; }).join('');
  return `<span class="time24">
    <input type="hidden" name="${esc(name)}" value="${esc(hh && mm ? `${hh}:${mm}` : '')}" ${opts.bind ? `data-bind="${esc(opts.bind)}"` : ''}>
    <select class="t24-h" aria-label="${esc(opts.aria || 'ชั่วโมง')}"><option value="">--</option>${hrs}</select>
    <span class="t24-sep">:</span>
    <select class="t24-m" aria-label="นาที"><option value="">--</option>${mins}</select>
  </span>`;
}
const progressBar = (pct, color) => `<div class="bar-bg"><div class="bar-fill" style="width:${Math.max(0, Math.min(100, Number(pct) || 0))}%;${color ? '--c:' + safeColor(color) : ''}"></div></div>`;
const subjectOptions = (sel, allowNone = true) =>
  (allowNone ? `<option value="">— ทั่วไป —</option>` : '') + DB.subjects.map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
const empty = (icon, text, btn = '', img = '') => `<div class="empty">${img ? `<img src="${img}" alt="" class="empty-mascot">` : `<div class="empty-ic">${icon}</div>`}<p>${text}</p>${btn}</div>`;

function planItemHTML(p, showDate = false, cat = '') {
  const ch = p.chapterId ? (subjectById(p.subjectId)?.chapters || []).find(c => c.id === p.chapterId) : null;
  const files = ch ? (ch.files || []) : (p.files || []);
  const fileBtn = p.chapterId
    ? `<button class="mini-btn ${files.length ? 'has' : ''}" data-act="chapter-files" data-sid="${p.subjectId}" data-id="${p.chapterId}" title="ไฟล์ในบทนี้ (${files.length})" aria-label="ไฟล์ในบท">${ico('paperclip', 14)}${files.length ? `<small class="ch-fc">${files.length}</small>` : ''}</button>`
    : `<button class="mini-btn ${files.length ? 'has' : ''}" data-act="plan-files" data-id="${p.id}" title="แนบ/ดูไฟล์ (${files.length})" aria-label="แนบไฟล์">${ico('paperclip', 14)}${files.length ? `<small class="ch-fc">${files.length}</small>` : ''}</button>`;
  return `<div class="item ${p.done ? 'done' : ''}">
    <label class="task-check-wrap"><input type="checkbox" class="cb" data-act="toggle-plan" data-id="${p.id}" ${p.done ? 'checked' : ''} aria-label="ทำเครื่องหมายว่าเสร็จแล้ว"></label>
    ${cat}
    ${tag(p.subjectId)}
    <span class="grow">${p.kind === 'review' ? `${ico('reset', 13)} ` : ''}${esc(p.title)}${p.time ? ` <small class="muted">${ico('clock', 12)} ${esc(p.time)}${p.endTime ? '–' + esc(p.endTime) : ''}${p.remind !== false ? ` ${ico('bell', 12)}` : ''}</small>` : ''}${showDate ? ` <small class="muted">· ${fmtDate(p.date)}</small>` : ''}</span>
    <span class="item-actions">${fileBtn}<button class="mini-btn" data-act="edit-plan" data-id="${p.id}" title="แก้ไข" aria-label="แก้ไขแผนอ่าน">${ico('edit', 15)}</button>
    <button class="mini-btn" data-act="del-plan" data-id="${p.id}" title="ลบ" aria-label="ลบแผนอ่าน">${ico('close', 15)}</button></span>
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
  const theme = DB.prefs.theme || 'navy';
  if (theme === 'navy') {
    return `<img class="avatar-img madrid-av" src="assets/madrid-crest.png" alt="Real Madrid" width="46" height="46">`;
  }
  if (theme === 'manutd') {
    return `<img class="avatar-img manutd-av" src="assets/manutd-crest.png" alt="Man Utd" width="46" height="46">`;
  }
  if (isMinimalTheme(theme)) {
    return `<span class="avatar-mono">${ico('user', 20)}</span>`;
  }
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
  const collapsed = localStorage.getItem('lp_coach_collapsed') === '1';
  document.documentElement.dataset.coach = collapsed ? 'collapsed' : 'open';
  const right = document.getElementById('gutterRight');
  if (!right) return;
  right.innerHTML = `<button type="button" class="coach-toggle" data-act="toggle-coach" aria-label="${collapsed ? 'แสดงลุงอู๊ด' : 'พับเก็บลุงอู๊ด'}">${collapsed ? `${ico('chevron-left', 14)} อู๊ด` : `${ico('chevron-right', 14)} ซ่อน`}</button>${collapsed ? '' : `${coachBubble('hero')}<img src="assets/coach-hero-real.webp" alt="อู๊ด">`}`;
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
const AI_IMPORT_PROMPT = `ช่วยแปลงข้อมูลวิชาเรียน วันสอบ ตารางเรียน และงาน/กิจกรรมของฉันด้านล่าง เป็นไฟล์ JSON ชื่อ "study-planner.json" ให้ดาวน์โหลดพร้อมอัปโหลดทันที (หากสร้างไฟล์ดาวน์โหลดไม่ได้ ให้ตอบเป็น JSON ล้วนๆ ใน code block เดียว) ตามโครงสร้างนี้:
{
  "name": "ชื่อเล่น",
  "term": "เทอม 1",
  "subjects": [
    {
      "id": "sub1",
      "name": "รหัสวิชา ชื่อวิชา",
      "color": "#4a9be8",
      "examDate": "YYYY-MM-DD",
      "examTime": "09:00",
      "room": "ห้องสอบ (ถ้ามี)",
      "chapters": [
        { "id": "ch1", "title": "ชื่อบท/หัวข้อ", "done": false }
      ]
    }
  ],
  "classes": [
    {
      "id": "cls1",
      "day": 1,
      "start": "09:00",
      "end": "12:00",
      "subjectId": "sub1",
      "title": "ชื่อวิชา",
      "room": "ห้องเรียน",
      "color": "#4a9be8"
    }
  ],
  "tasks": [
    {
      "id": "t1",
      "title": "ชื่องาน/การบ้าน หรือกิจกรรมเฉพาะวัน",
      "date": "YYYY-MM-DD",
      "time": "23:59",
      "subjectId": "sub1",
      "type": "homework",
      "done": false
    }
  ],
  "plan": []
}
กติกาสำคัญ:
- "classes" ใช้เฉพาะคาบเรียนที่วนทุกสัปดาห์ในเทอมนี้เท่านั้น (ระบบจะซ่อนให้อัตโนมัติเมื่อเข้าสัปดาห์สอบ) ถ้าไม่มีคาบประจำหรือเรียนจบแล้ว ให้ใส่ "classes": []
- นัดหมาย คลาสชดเชย หรือติวเฉพาะบางวัน ให้ใส่ใน "tasks" โดยใช้ "type": "event" แทน "classes"
- day ใช้ 0=อาทิตย์, 1=จันทร์, 2=อังคาร, 3=พุธ, 4=พฤหัส, 5=ศุกร์, 6=เสาร์
- วันที่ใช้ปี ค.ศ. รูปแบบ YYYY-MM-DD เท่านั้น

[วางข้อมูล / แนบรูปตารางเรียน-ตารางสอบของคุณตรงนี้]`;

function openAiImportModal() {
  openModal('✨ วิธีให้ AI สร้างไฟล์ .json พร้อมอัปโหลด', `
    <ol class="steps" style="margin-top:0">
      <li>กด <b>คัดลอก Prompt</b> แล้วส่งให้ ChatGPT / Gemini / Claude พร้อมรูปตารางเรียน-วันสอบ</li>
      <li>ดาวน์โหลดไฟล์ <b><code>study-planner.json</code></b> ที่ AI สร้างให้ (หรือบันทึกเป็น <code>.json</code>)</li>
      <li>กดปุ่ม <b>⬆️ Import (.json)</b> ด้านล่างเพื่อนำเข้าข้อมูลทั้งหมดทันที</li>
    </ol>
    <p class="muted small" style="margin:6px 0 0">💡 <b>ตารางเรียนจะไม่ค้างยาวตลอดไป:</b> คาบเรียนใน <code>classes</code> จะถูกซ่อนอัตโนมัติเมื่อเข้าสัปดาห์สอบ และสามารถสร้าง Workflow/เทอมใหม่แยกได้ตลอด</p>
    <div class="row between" style="margin:12px 0 6px">
      <span class="muted small">Prompt สำหรับส่งให้ AI</span>
      <button type="button" class="mini-btn" data-act="copy-ai-prompt">📋 คัดลอก Prompt</button>
    </div>
    <pre class="ai-prompt-box">${esc(AI_IMPORT_PROMPT)}</pre>
    <div class="row end" style="margin-top:14px">
      <label class="btn small" style="cursor:pointer">⬆️ Import (.json)<input type="file" accept=".json" data-chg="import" hidden></label>
      <button type="button" class="btn ghost small" data-act="close-modal">ปิด</button>
    </div>
  `);
}

function openThemeModal() {
  const cur = DB.prefs.theme || 'sky';
  openModal('🎨 เลือกธีมของแอป', `
    <p class="muted small" style="margin-top:0">เลือกสไตล์สีและพื้นหลังที่ชอบ (เปลี่ยนได้ตลอดเวลา)</p>
    <p class="small" style="margin:8px 0 6px"><b>มินิมอล / พาสเทล</b></p>
    <div class="theme-grid">${THEMES.filter(([k]) => isMinimalTheme(k)).map(([k, l, c]) =>
      `<button class="theme-sw ${cur === k ? 'active' : ''}" data-act="theme" data-theme="${k}" style="--c:${c}"><span class="dot"></span>${l}</button>`).join('')}</div>
    <p class="small" style="margin:12px 0 6px"><b>พิเศษ / ฟุตบอล</b></p>
    <div class="theme-grid">${THEMES.filter(([k]) => !isMinimalTheme(k)).map(([k, l, c]) =>
      `<button class="theme-sw ${cur === k ? 'active' : ''}" data-act="theme" data-theme="${k}" style="--c:${c}"><span class="dot"></span>${l}</button>`).join('')}</div>
    <div class="row end" style="margin-top:14px"><button type="button" class="btn small" data-act="close-modal">เสร็จสิ้น</button></div>
  `);
}

function demoButtonHTML() {
  return hasDemo() ? `<button class="btn danger" data-act="clear-demo">ลบข้อมูลทดลอง</button>` : '';
}

/* ===== Views ===== */
const Views = {
  home() {
    const t = todayStr();
    if (!DB.subjects.length) {
      return `<section class="card welcome">
        <h2>ยินดีต้อนรับสู่ LungAoodyPlanner 🐃</h2>
        ${!DB.name ? `<form data-form="name" class="row"><input name="name" placeholder="ให้เรียกคุณว่าอะไรดี?" value=""><button class="btn ghost">บันทึกชื่อ</button></form>` : ''}
        <div class="welcome-auth">
          <h3 style="margin:0;font-size:1.05rem">เริ่มจากศูนย์</h3>
          <p class="welcome-col-steps"><b>1.</b> เพิ่มวิชา → <b>2.</b> ใส่บท → <b>3.</b> ติ๊กจบ</p>
          <div class="row center wrap" style="margin:2px 0 0">
            <button class="btn big" data-act="add-subject">+ เพิ่มวิชาแรก</button>
            ${demoButtonHTML()}
          </div>
        </div>
        <div class="welcome-split">
          <div class="welcome-col">
            <h3>ซิงก์ข้อมูลข้ามเครื่อง</h3>
            <p class="welcome-col-steps">☁️ ซิงก์ข้ามเครื่อง • 📁 สำรองไฟล์ใน Drive อัตโนมัติ</p>
            ${!Sync.user
              ? (Sync.status === 'signedout' ? `<button class="btn" data-act="login">🔑 ล็อกอินด้วย Google (แนะนำ)</button>` : `<span class="chip">${Sync.status === 'loading' ? '⏳ กำลังเชื่อมต่อ…' : '💾 เก็บในเครื่อง'}</span>`)
              : `<span class="chip ok">☁️ ล็อกอินแล้ว (${esc(Sync.user.email || Sync.user.displayName || 'Google')})</span>`}
          </div>
          <div class="welcome-col">
            <h3>นำเข้าด้วย AI</h3>
            <p class="welcome-col-steps">มีตารางเรียน/วันสอบอยู่แล้ว? แปลงแล้วอัปโหลดได้เลย</p>
            <div class="row center wrap">
              <label class="btn" style="cursor:pointer">⬆️ Import (.json)<input type="file" accept=".json" data-chg="import" hidden></label>
            </div>
            <button type="button" class="link ai-guide-btn" data-act="open-ai-import-guide">✨ วิธีให้ AI แปลงตาราง →</button>
          </div>
        </div>
      </section>`;
    }
    const exams = upcomingExams();
    const today = planForDate(t);
    const overdue = DB.plan.filter(p => !p.done && p.date < t);
    const soonTasks = DB.tasks.filter(x => !x.done && x.date >= t && x.date <= addDays(t, 7)).sort((a, b) => a.date.localeCompare(b.date));
    const ws = App.statWeek || weekStart(t);
    const curWs = weekStart(t);
    const week = [...Array(7)].map((_, i) => { const d = addDays(ws, i); return { label: TH_DAYS[parseDate(d).getDay()], value: minutesOn(d), hl: d === t }; });
    const weekTotal = week.reduce((a, d) => a + d.value, 0);
    const dow = new Date().getDay();
    const todayClasses = classesOnDate(t);
    const todayExams = DB.subjects.filter(s => s.examDate === t);
    const todayTasks = DB.tasks.filter(x => x.date === t).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const pendingTasks = DB.tasks.filter(x => !x.done).sort((a, b) => (a.date || '9999-99-99').localeCompare(b.date || '9999-99-99') || (a.time || '').localeCompare(b.time || ''));
    const nextPendingTask = pendingTasks[0];
    const todayListCount = todayExams.length + todayClasses.length + today.length + todayTasks.length;

    const totCh = DB.subjects.reduce((a, s) => a + subjectProgress(s).total, 0);
    const doneCh = DB.subjects.reduce((a, s) => a + subjectProgress(s).done, 0);
    const overallPct = totCh ? Math.round(doneCh / totCh * 100) : 0;
    const nextEx = exams[0];
    const nextDays = nextEx ? daysBetween(t, nextEx.examDate) : null;
    const todayMin = minutesOn(t);
    const todayHrs = (todayMin / 60).toFixed(1).replace(/\.0$/, '');
    const goalHrs = Math.max(1, Math.round((DB.prefs.dailyGoalMin || 180) / 60));
    const todayHrPct = Math.min(100, Math.round((todayMin / (goalHrs * 60)) * 100));
    const pendingCount = DB.tasks.filter(x => !x.done).length;
    const pendingPct = Math.min(100, pendingCount * 15);

    // Mini Calendar for current month
    const nowD = parseDate(t);
    const yr = nowD.getFullYear(), mo = nowD.getMonth();
    const firstDow = new Date(yr, mo, 1).getDay();
    const daysInMo = new Date(yr, mo + 1, 0).getDate();
    const prevDays = new Date(yr, mo, 0).getDate();
    const calCells = [];
    for (let i = firstDow - 1; i >= 0; i--) calCells.push({ day: prevDays - i, muted: true, iso: '' });
    for (let d = 1; d <= daysInMo; d++) {
      const iso = `${yr}-${pad(mo + 1)}-${pad(d)}`;
      const hasPlan = DB.plan.some(p => p.date === iso);
      const hasTask = DB.tasks.some(x => x.date === iso);
      const hasExam = DB.subjects.some(s => s.examDate === iso);
      calCells.push({ day: d, muted: false, iso, isToday: iso === t, hasPlan, hasTask, hasExam });
    }
    while (calCells.length % 7 !== 0) calCells.push({ day: calCells.length % 7 + 1, muted: true, iso: '' });

    // Today's combined todo items (up to 4)
    const todayTodos = [
      ...today.map(p => ({ kind: 'plan', item: p })),
      ...soonTasks.map(x => ({ kind: 'task', item: x }))
    ].slice(0, 4);

    // 7-day forecast strip
    const forecast = [...Array(7)].map((_, i) => {
      const d = addDays(t, i);
      const cnt = planForDate(d).length + DB.tasks.filter(x => x.date === d).length;
      const lbl = i === 0 ? 'วันนี้' : i === 1 ? 'พรุ่งนี้' : TH_DAYS[parseDate(d).getDay()];
      return { d, lbl, cnt, isToday: i === 0 };
    });

    // Sparkline SVG points for 7-day week minutes
    const maxW = Math.max(30, ...week.map(w => w.value));
    const pts = week.map((w, i) => `${Math.round(i * (220 / 6) + 10)},${Math.round(52 - (w.value / maxW) * 38)}`).join(' ');
    const areaPts = `10,56 ${pts} 230,56`;

    // Pomodoro live state
    const sec = Timer.left(), timerTxt = `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
    const timerPct = Math.round((1 - sec / Timer.dur()) * 100);
    const pomoCfg = DB.prefs.pomo || { work: 25, short: 5, long: 15 };

    const theme = DB.prefs.theme || 'sky';
    const isFootball = theme === 'navy';
    const isManU = theme === 'manutd';
    const isMono = isMinimalTheme(theme);
    return `
    <div class="ref-row1">
      <section class="card ref-banner ${isFootball ? 'is-football' : isManU ? 'is-manutd' : ''}" data-act="all-exams" style="cursor:pointer" title="กดเพื่อดูนับถอยหลังสอบทั้งหมด">
        ${isFootball ? `<img class="banner-crest" src="assets/madrid-crest.png" alt="" aria-hidden="true">` : isManU ? `<img class="banner-crest" src="assets/manutd-crest.png" alt="" aria-hidden="true">` : ''}
        <div class="banner-ic" aria-hidden="true">${ico('target', 24)}</div>
        <div class="ref-banner-body">
          <div class="ref-banner-title"><span>เป้าหมายหลักของคุณ</span></div>
          <h2>${nextEx ? `${esc(nextEx.name)} · อีก ${nextDays} วันสอบ` : 'อ่านหนังสือให้ครบตามเป้า'}</h2>
          <p class="banner-sub">${DB.subjects.length} วิชา · อ่านจบแล้ว ${doneCh}/${totCh} บท (${overallPct}%)</p>
          <button class="btn small ref-cta" data-act="go" data-tab="plan">ดูแผนทั้งหมด →</button>
        </div>
        ${isMono ? '' : `<img class="${isFootball || isManU ? 'bento-mascot ronaldo-hero' : 'bento-mascot'}" src="${isFootball ? 'assets/ronaldo-cutout.png' : isManU ? 'assets/bruno-cutout.png' : 'assets/coach-hero-real.webp'}" alt="${isFootball ? 'Cristiano Ronaldo' : isManU ? 'Bruno Fernandes' : 'อู๊ด'}">`}
      </section>

      <section class="card ref-todos ref-pending-top">
        <div class="card-head" style="margin-bottom:6px">
          <h2 style="cursor:pointer" data-act="open-pending" title="กดเพื่อขยายดูทั้งหมด">${ico('book', 17)} งานที่ค้าง</h2>
          <button class="mini-btn" data-act="add-task" data-date="${t}" title="เพิ่มงาน">+ เพิ่มงาน</button>
          <span class="chip accent">${pendingTasks.length} รายการ</span>
        </div>
        <div class="ref-todo-list">
          ${pendingTasks.length ? pendingTasks.map(x => taskItemHTML(x, x.type === 'event' ? '<span class="todo-cat cat-ev">กิจกรรม</span>' : '<span class="todo-cat cat-hw">งาน</span>')).join('')
            : empty(ico('check', 22), 'ไม่มีงานค้างแล้ว!')}
        </div>
      </section>

      <section class="card ref-kpi">
        <div class="kpi-ic kpi-indigo">${ico('calendar', 17)}</div>
        <div class="kpi-lbl">สอบวิชาถัดไป</div>
        <div class="kpi-val stat-num">${nextEx ? esc(fmtDate(nextEx.examDate)) : '—'}</div>
        <div class="muted small">${nextEx ? esc(nextEx.name) : 'ยังไม่มีวันสอบ'}</div>
      </section>

      <section class="card ref-kpi">
        <div class="kpi-ic kpi-green">${ico('clock', 17)}</div>
        <div class="kpi-lbl">เวลาอ่านวันนี้</div>
        <div class="kpi-val stat-num">${todayHrs} <small>/ ${goalHrs} ชม.</small></div>
        <div class="bar-bg"><div class="bar-fill kpi-bar-green" style="width:${todayHrPct}%"></div></div>
      </section>
    </div>

    <div class="ref-row2">
      <section class="card ref-cal">
        <div class="card-head">
          <h2>${ico('calendar', 17)} ปฏิทินการเรียน</h2>
          <button class="mini-btn" data-act="go" data-tab="calendar">${TH_MONTHS[mo]} ${yr + 543} ›</button>
        </div>
        <div class="mini-cal-grid">
          ${['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => `<span class="mc-hd">${d}</span>`).join('')}
          ${calCells.map(c => `<button type="button" class="mc-day ${c.muted ? 'muted' : ''} ${c.isToday ? 'today' : ''}" ${c.iso ? `data-date="${c.iso}" data-act="cal-day"` : 'data-act="go" data-tab="calendar"'}>
            <span>${c.day}</span>
            <span class="mc-dots">${c.hasPlan ? '<i class="d-blue"></i>' : ''}${c.hasTask ? '<i class="d-amber"></i>' : ''}${c.hasExam ? '<i class="d-purple"></i>' : ''}</span>
          </button>`).join('')}
        </div>
        <div class="mc-legend">
          <button type="button" class="mc-legend-btn" data-act="tag-colors" title="คลิกเพื่อเปลี่ยนสีแท็ก"><i class="d-blue"></i> อ่านหนังสือ</button>
          <button type="button" class="mc-legend-btn" data-act="tag-colors" title="คลิกเพื่อเปลี่ยนสีแท็ก"><i class="d-purple"></i> วันสอบ</button>
          <button type="button" class="mc-legend-btn" data-act="tag-colors" title="คลิกเพื่อเปลี่ยนสีแท็ก"><i class="d-amber"></i> งาน</button>
        </div>
      </section>

      <section class="card ref-todos">
        <div class="card-head">
          <h2>${ico('check', 17)} Today list</h2>
          <button class="mini-btn" data-act="add-todo" data-date="${t}" title="เพิ่มสิ่งที่ต้องทำ">+ สิ่งที่ต้องทำ</button>
          <span class="chip accent">${todayListCount} รายการ</span>
        </div>
        <form class="quick-add-row" data-form="quick-todo">
          <input name="title" type="text" placeholder="+ พิมพ์ชื่องานวันนี้แล้วกด Enter..." maxlength="200" aria-label="เพิ่มงานวันนี้แบบด่วน">
          <button type="submit" class="mini-btn quick-add-btn" aria-label="เพิ่ม">${ico('plus', 16)}</button>
        </form>
        <div class="ref-todo-list">
          ${todayListCount ? [
            ...todayExams.map(s => `<div class="item" style="cursor:pointer" data-act="open-subject" data-id="${s.id}">
              <span class="todo-cat cht-exam">สอบ</span>
              ${tag(s.id)}
              <span class="grow">${s.examTime ? `<b>${esc(s.examTime)}</b> ` : ''}${roomText(s.room) ? `ห้อง ${esc(roomText(s.room))}` : 'วันสอบ'}</span>
            </div>`),
            ...todayClasses.map(c => `<div class="item" style="cursor:pointer" data-act="go-timetable">
              <span class="todo-cat cht-cls" style="--c:${classColor(c)}">เรียน</span>
              <span class="tag" style="--c:${classColor(c)}">${esc(className(c))}</span>
              <span class="grow"><b>${esc(c.start)}${c.end ? '–' + esc(c.end) : ''}</b>${c.room ? ` <small class="muted">· ${esc(c.room)}</small>` : ''}</span>
            </div>`),
            ...today.map(p => planItemHTML(p, false, '<span class="todo-cat cat-plan">อ่านหนังสือ</span>')),
            ...todayTasks.map(x => taskItemHTML(x, x.type === 'event' ? '<span class="todo-cat cat-ev">กิจกรรม</span>' : '<span class="todo-cat cat-hw">งาน</span>'))
          ].join('') : empty(isFootball || isManU || isMono ? ico('check', 30) : '', 'วันนี้ยังไม่มีรายการ', '', isFootball || isManU || isMono ? '' : 'assets/coach-action.webp')}
        </div>
        <div class="ref-todo-foot">
          <button class="btn ghost full" data-act="go" data-tab="plan">ดูทั้งหมด →</button>
        </div>
      </section>

      <section class="card ref-stats" data-act="go" data-tab="stats" style="cursor:pointer" title="กดเพื่อดูสถิติทั้งหมด">
        <div class="card-head">
          <h2>${ico('chart', 17)} สถิติการเรียน</h2>
          <select class="mini-sel" data-chg="home-stat-week" aria-label="เลือกสัปดาห์">
            ${[[0, 'สัปดาห์นี้'], [-7, 'สัปดาห์ที่แล้ว'], [-14, '2 สัปดาห์ก่อน'], [-21, '3 สัปดาห์ก่อน']].map(([off, lbl]) => {
              const val = addDays(curWs, off);
              return `<option value="${val}" ${ws === val ? 'selected' : ''}>${lbl}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="ref-stats-top">
          <div class="donut-ring" style="--p:${overallPct}">
            <div class="donut-inner"><b class="stat-num">${overallPct}%</b><small class="muted">ความพร้อม</small></div>
          </div>
          <div class="ref-stats-leg">
            <div><span class="leg-dot d-blue"></span>อ่านจบแล้ว <b>${doneCh} บท</b></div>
            <div><span class="leg-dot d-purple"></span>เหลืออ่าน <b>${Math.max(0, totCh - doneCh)} บท</b></div>
            <div><span class="leg-dot d-amber"></span>${ws === curWs ? 'สัปดาห์นี้' : 'สัปดาห์ที่เลือก'} <b>${fmtMin(weekTotal)}</b></div>
          </div>
        </div>
        <svg class="sparkline" viewBox="0 0 240 60" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ea8ff" stop-opacity=".45"/><stop offset="100%" stop-color="#4ea8ff" stop-opacity="0"/></linearGradient></defs>
          <polygon points="${areaPts}" fill="url(#spGrad)"/>
          <polyline points="${pts}" fill="none" stroke="#4ea8ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="spark-days">${week.map(w => `<span>${w.label}</span>`).join('')}</div>
      </section>
    </div>

    <div class="ref-row3">
      <section class="card ref-sched">
        <div class="card-head">
          <h2>${ico('book', 17)} สิ่งที่ต้องทำ 7 วันข้างหน้า</h2>
          <button class="mini-btn" data-act="go" data-tab="plan">ดูทั้งหมด →</button>
        </div>
        <div class="forecast-grid">
          ${forecast.map(f => `<button type="button" class="fc-pill ${f.isToday ? 'active' : ''}" data-act="cal-day" data-date="${f.d}">
            <small>${f.lbl}</small>
            <b>${f.cnt ? `${f.cnt} รายการ` : 'ว่าง'}</b>
          </button>`).join('')}
        </div>
      </section>

      <section class="card ref-pomo">
        <div class="card-head">
          <h2>${ico('clock', 17)} Pomodoro</h2>
          <button class="mini-btn" data-act="go" data-tab="timer" aria-label="ตั้งค่าจับเวลา">${ico('settings', 16)}</button>
        </div>
        <div class="pomo-mini-body">
          <div class="pomo-ring" id="timerRing" style="--p:${timerPct}">
            <div class="pomo-inner">
              <b id="timerDisplay" class="stat-num">${timerTxt}</b>
              <button type="button" id="timerStartBtn" class="pomo-play" data-mini="1" data-act="${Timer.running ? 'timer-pause' : 'timer-start'}" aria-label="เริ่มหรือหยุด">${Timer.running ? ico('pause', 13) : ico('play', 13)}</button>
            </div>
          </div>
          <div class="pomo-modes">
            <button type="button" class="pomo-m ${Timer.mode === 'work' ? 'active' : ''}" data-act="timer-mode" data-mode="work">โฟกัส ${pomoCfg.work || 25} นาที</button>
            <button type="button" class="pomo-m ${Timer.mode === 'short' ? 'active' : ''}" data-act="timer-mode" data-mode="short">พัก ${pomoCfg.short || 5} นาที</button>
            <button type="button" class="pomo-m ${Timer.mode === 'long' ? 'active' : ''}" data-act="timer-mode" data-mode="long">พักยาว ${pomoCfg.long || 15} นาที</button>
          </div>
        </div>
      </section>

      <section class="card ref-ai">
        <div class="card-head">
          <h2>${ico('sparkles', 17)} AI Assistant</h2>
          <span class="chip accent">${aiTabLabel()}</span>
        </div>
        <div class="ref-ai-body">
          ${isFootball ? `<img class="ref-ai-kylian" src="assets/kylian-chat.png" alt="Kylian">` : isManU ? `<img class="ref-ai-kylian manutd" src="assets/marcus-chat.png" alt="Dr.Marcus">` : isMono ? `<div class="ai-crest-badge">${ico('sparkles', 28)}</div>` : `<img src="assets/ooo-chat.webp" alt="อู๊ดเอไอ">`}
          <div class="ref-ai-txt">
            <p>พร้อมลุยต่อไหมครับ? วันนี้มี <b>${today.length + soonTasks.length}</b> งานรอคุณอยู่!</p>
            <button class="btn small full" data-act="go" data-tab="ai">คุยกับ AI →</button>
          </div>
        </div>
      </section>
    </div>`;
  },

  plan(embedded = false) {
    const t = todayStr();
    const subF = App.todoSub || '';
    const bySub = item => !subF || item.subjectId === subF;
    const overduePlans = DB.plan.filter(p => !p.done && p.date < t && bySub(p)).map(p => ({ kind: 'plan', item: p }));
    const overdueTasks = DB.tasks.filter(x => !x.done && x.date < t && bySub(x)).map(x => ({ kind: 'task', item: x }));
    const overdue = [...overduePlans, ...overdueTasks].sort((a, b) => a.item.date.localeCompare(b.item.date));
    const futurePlans = DB.plan.filter(p => p.date >= t && bySub(p));
    const futureTasks = DB.tasks.filter(x => x.date >= t && bySub(x));
    const pastPlans = DB.plan.filter(p => p.date < t && p.done && bySub(p)).map(p => ({ kind: 'plan', item: p }));
    const pastTasks = DB.tasks.filter(x => x.date < t && x.done && bySub(x)).map(x => ({ kind: 'task', item: x }));
    const past = [...pastPlans, ...pastTasks].sort((a, b) => b.item.date.localeCompare(a.item.date));
    const dates = [...new Set([...futurePlans.map(p => p.date), ...futureTasks.map(x => x.date)])];
    DB.subjects.forEach(s => { if (s.examDate && s.examDate >= t && (!subF || s.id === subF) && !dates.includes(s.examDate)) dates.push(s.examDate); });
    dates.sort();
    const filterBar = DB.subjects.length ? `<div class="folder-bar" style="margin-bottom:12px">
      <button type="button" class="chip ${!subF ? 'accent' : ''}" data-act="todo-filter" data-sid="">ทั้งหมด</button>
      ${DB.subjects.map(s => `<button type="button" class="chip ${subF === s.id ? 'accent' : ''}" data-act="todo-filter" data-sid="${s.id}" style="--c:${safeColor(s.color)}">${esc(s.name)}</button>`).join('')}
    </div>` : '';
    const splitCode = name => {
      const m = /^(\d{4,10})\s+(.+)$/.exec(String(name || '').trim());
      return m ? { code: m[1], title: m[2] } : { code: '', title: String(name || '') };
    };
    const renderTodoEntry = entry => entry.kind === 'plan'
      ? planItemHTML(entry.item, true, '<span class="todo-cat cat-plan">อ่านหนังสือ</span>')
      : taskItemHTML(entry.item, entry.item.type === 'event' ? '<span class="todo-cat cat-ev">กิจกรรม</span>' : '<span class="todo-cat cat-hw">งาน</span>');
    const day = d => {
      const items = planForDate(d).filter(bySub);
      const exams = DB.subjects.filter(s => s.examDate === d && (!subF || s.id === subF));
      const dayTasks = DB.tasks.filter(x => x.date === d && bySub(x)).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      const n = daysBetween(t, d);
      return `<div class="day-group ${d === t ? 'is-today' : ''}">
        <div class="day-head">
          <b class="${exams.length ? 'exam-day-lbl' : ''}">${fmtDateLong(d)}</b>
          ${n === 0 ? '<span class="chip accent">วันนี้</span>' : n === 1 ? '<span class="chip">พรุ่งนี้</span>' : ''}
          ${exams.length ? '<span class="chip exam-day-chip">วันสอบ</span>' : ''}
          <button class="mini-btn right" data-act="add-todo" data-date="${d}" aria-label="เพิ่มสิ่งที่ต้องทำ">${ico('plus', 15)}</button>
        </div>
        ${exams.map(s => {
          const sp = splitCode(s.name);
          return `<div class="exam-row" style="--c:${safeColor(s.color)}" data-act="open-subject" data-id="${s.id}">
            ${s.examTime ? `<b class="exam-time">${esc(s.examTime)}</b>` : ''}
            <span class="grow"><b>สอบ ${esc(sp.title)}</b>${sp.code ? ` <small class="muted">(${esc(sp.code)})</small>` : ''}${roomText(s.room) ? ` <small class="muted">· ห้อง ${esc(roomText(s.room))}</small>` : ''}</span>
          </div>`;
        }).join('')}
        ${items.map(p => planItemHTML(p, false, '<span class="todo-cat cat-plan">อ่านหนังสือ</span>')).join('')}
        ${dayTasks.map(x => taskItemHTML(x, x.type === 'event' ? '<span class="todo-cat cat-ev">กิจกรรม</span>' : '<span class="todo-cat cat-hw">งาน</span>')).join('')}
      </div>`;
    };

    return `
    ${embedded ? '' : `<section class="card">
      <div class="toolbar">
        <h2 class="grow">${ico('book', 18)} To do list</h2>
        <button class="btn" data-act="add-todo" data-date="${t}">${ico('plus', 15)} สิ่งที่ต้องทำ</button>
      </div>
    </section>`}
    ${overdue.length ? `<section class="card warn-card"><div class="card-head"><h2>⚠️ ค้างอยู่ (${overdue.length})</h2></div>${overdue.map(renderTodoEntry).join('')}</section>` : ''}
    <section class="card">
      ${filterBar}
      ${dates.length ? dates.map(day).join('') : empty('🗓️', DB.subjects.length ? 'ยังไม่มีรายการ — กด "+ สิ่งที่ต้องทำ" ด้านบนได้เลย' : 'เพิ่มวิชาก่อนนะ', DB.subjects.length ? '' : `<button class="btn" data-act="add-subject">+ เพิ่มวิชา</button>`)}
    </section>
    ${past.length ? `<section class="card"><button class="link" data-act="toggle-past">${App.showPast ? '▾ ซ่อน' : '▸ แสดง'}รายการที่ทำเสร็จแล้ว (${past.length})</button>
      ${App.showPast ? past.map(renderTodoEntry).join('') : ''}</section>` : ''}`;
  },

  subjects() {
    return `
    <section class="card">
      <div class="toolbar subjects-bar">
        <h2 class="grow">${ico('layers', 18)} วิชาทั้งหมด (${DB.subjects.length})</h2>
        <button class="btn" data-act="add-subject">${ico('plus', 15)} เพิ่มวิชา</button>
      </div>
    </section>
    ${DB.subjects.length ? '' : `<section class="card">${empty(ico('layers', 32), 'ยังไม่มีวิชา เพิ่มวิชาแรกกันเลย')}</section>`}
    <div class="subj-list">${DB.subjects.map(s => {
      const p = subjectProgress(s), n = s.examDate ? daysBetween(todayStr(), s.examDate) : null;
      const fileN = FileStore.count(s.id);
      const cls = (DB.classes || []).filter(c => c.subjectId === s.id).sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
      return `<section class="card subj" id="subj-${s.id}" style="--c:${safeColor(s.color)}">
        <div class="subj-head">
          <div class="grow"><h3>${esc(s.name)}</h3>
            <div class="muted small">${s.examDate ? `${ico('target', 13)} สอบ ${fmtDateLong(s.examDate)}${s.examTime ? ' · ' + esc(s.examTime) : ''}${roomText(s.room) ? ' · ห้อง ' + esc(roomText(s.room)) : ''} ${n >= 0 ? `<b class="accent-text">(อีก ${n} วัน)</b>` : '<i>(สอบแล้ว)</i>'}` : 'ยังไม่กำหนดวันสอบ'}</div>
            ${cls.length ? `<div class="muted small" style="margin-top:2px;cursor:pointer" data-act="go-timetable" title="ดูในตารางเรียน">${ico('calendar', 13)} เรียน ${cls.map(c => `${TH_DAYS[c.day]} ${esc(c.start)}${c.end ? '–' + esc(c.end) : ''}${c.room ? ` (${esc(c.room)})` : ''}`).join(' · ')}</div>` : ''}</div>
          <button class="mini-btn" data-act="edit-subject" data-id="${s.id}" aria-label="แก้ไขวิชา ${esc(s.name)}">${ico('edit', 15)} แก้ไข</button>
          <button class="mini-btn" data-act="del-subject" data-id="${s.id}" aria-label="ลบวิชา ${esc(s.name)}">${ico('trash', 15)}</button>
        </div>
        <div class="prog-top"><span>ความคืบหน้า</span><span>${p.done}/${p.total} บท (${p.pct}%)</span></div>
        ${progressBar(p.pct, s.color)}
        <div class="chapters">${s.chapters.map(c => {
          const cf = Array.isArray(c.files) ? c.files : [];
          return `<div class="item ch-row ${c.done ? 'done' : ''}" data-sid="${s.id}" data-cid="${c.id}">
            <span class="ch-drag" title="ลากขึ้น-ลงเพื่อเรียงลำดับ" aria-label="ลากเพื่อเรียงลำดับ">⋮⋮</span>
            <input type="checkbox" class="cb" data-act="toggle-chapter" data-sid="${s.id}" data-id="${c.id}" ${c.done ? 'checked' : ''} aria-label="ติ๊กจบบท ${esc(c.title)}">
            <span class="grow">
              <span>${esc(c.title)}</span>
            </span>
            <span class="item-actions">
            <button type="button" class="round-chip ${cf.length ? 'has' : ''}" data-act="chapter-files" data-sid="${s.id}" data-id="${c.id}" title="ดู/เลือกไฟล์ในบทนี้" aria-label="ไฟล์ในบท ${esc(c.title)}">${ico('paperclip', 12)} <span>${cf.length ? `${cf.length} ไฟล์` : 'แนบไฟล์'}</span></button>
            <button class="mini-btn" data-act="rename-chapter" data-sid="${s.id}" data-id="${c.id}" aria-label="เปลี่ยนชื่อบท ${esc(c.title)}">${ico('edit', 14)}</button>
            <button class="mini-btn" data-act="del-chapter" data-sid="${s.id}" data-id="${c.id}" aria-label="ลบบท ${esc(c.title)}">${ico('close', 14)}</button>
            </span>
          </div>`;
        }).join('') || '<p class="muted small">ยังไม่มีบท</p>'}</div>
        <div class="row wrap">
          <button class="btn small" data-act="add-chapters" data-sid="${s.id}">${ico('plus', 14)} เพิ่มบท</button>
          <button class="btn small ghost" data-act="files" data-sid="${s.id}">${ico('paperclip', 14)} ไฟล์ (${fileN})</button>
        </div>
      </section>`;
    }).join('')}</div>`;
  },

  calendar() {
    const view = App.calView === 'exams' ? 'timetable' : App.calView === 'todo' ? 'month' : (App.calView || 'month');
    const switcher = `<section class="card"><div class="toolbar">
      <h2 class="grow">${view === 'timetable' ? `${ico('calendar', 18)} ตารางเรียน &amp; ตารางสอบ` : `${ico('calendar', 18)} ปฏิทิน`}</h2>
      <div class="pills" style="margin:0">
        <button class="pill ${view === 'month' ? 'active' : ''}" data-act="cal-view" data-v="month">ปฏิทิน</button>
        <button class="pill ${view === 'timetable' ? 'active' : ''}" data-act="cal-view" data-v="timetable">ตารางเรียน &amp; สอบ</button>
      </div>
      <button class="btn ghost small" data-act="gcal-sync" title="ซิงก์วันสอบ ตารางเรียน และสิ่งที่ต้องทำขึ้น Google Calendar">📅 ซิงก์ Google Cal</button>
      <button class="btn" data-act="add-todo">${ico('plus', 15)} สิ่งที่ต้องทำ</button>
    </div></section>`;

    if (view === 'timetable') {
      const t = todayStr();
      const lastEx = lastExamDate();
      const cut = examCutoffDate();
      const autoHiddenAfterExam = !!(lastEx && t > lastEx && DB.prefs.hideClassesInExam !== false);
      const classes = autoHiddenAfterExam ? [] : (DB.classes || []);
      const inExamPeriod = !!(cut && t >= cut && !autoHiddenAfterExam && DB.prefs.hideClassesInExam !== false);
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
      const ttMode = App.ttView || (window.innerWidth <= 720 ? 'agenda' : 'grid');
      const agDay = App.agendaDay ?? dow;
      const agDays = [1, 2, 3, 4, 5, 6, 0];
      const agClasses = classes.filter(c => c.day === agDay).sort((a, b) => (a.start || '').localeCompare(b.start || ''));

      return `
      <section class="card">
        ${switcher}
        ${autoHiddenAfterExam ? empty('🎉', 'สอบครบทุกวิชาแล้ว — ตารางเรียนเทอมนี้ถูกซ่อนอัตโนมัติ', `<button class="btn small ghost" data-act="toggle-exam-classes">แสดงตารางเรียนเดิม</button>`) : `${inExamPeriod ? `<div class="muted small" style="margin-bottom:8px">📚 เข้าสู่สัปดาห์สอบแล้ว — ซ่อนคาบเรียนบนปฏิทินและ Today list อัตโนมัติ</div>` : ''}<div class="row wrap" style="margin-bottom:10px;justify-content:space-between;align-items:center">
          <div class="pills" style="margin:0">
            <button type="button" class="pill ${ttMode === 'agenda' ? 'active' : ''}" data-act="tt-mode" data-m="agenda">มุมมองรายวัน</button>
            <button type="button" class="pill ${ttMode === 'grid' ? 'active' : ''}" data-act="tt-mode" data-m="grid">ตารางทั้งสัปดาห์</button>
          </div>
          <span class="muted small">รวม: <b>${classes.length} คาบ</b> · ${uniqueSubs} วิชา</span>
        </div>
        ${ttMode === 'agenda' ? `
          <div class="tt-agenda-days">
            ${agDays.map(d => `<button type="button" class="pill ${d === agDay ? 'active' : ''}" data-act="agenda-day" data-d="${d}">${TH_DAYS[d]}${d === dow ? ' •' : ''}</button>`).join('')}
          </div>
          <div class="tt-agenda-list">
            ${agClasses.length ? agClasses.map(c => {
              const col = classColor(c), nm = className(c);
              return `<button type="button" class="tt-agenda-card" data-act="edit-class" data-id="${c.id}" style="--c:${col}">
                <span class="tt-agenda-time">${esc(c.start || '—')}${c.end ? ` – ${esc(c.end)}` : ''}</span>
                <span class="tt-agenda-info"><b>${esc(nm)}</b>${c.room ? `<small class="muted">ห้อง ${esc(c.room)}</small>` : ''}</span>
              </button>`;
            }).join('') : empty(ico('calendar', 26), `ไม่มีคาบเรียนวัน${TH_DAYS_FULL[agDay]}`, `<button type="button" class="btn small" data-act="add-class" data-day="${agDay}">+ เพิ่มคาบวัน${TH_DAYS[agDay]}</button>`)}
          </div>
        ` : `<div class="tt-wrap">
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
        </div>`}
        <div class="toolbar" style="margin-top:12px;margin-bottom:0">
          <button class="btn ghost small" data-act="tt-png">⬇️ PNG</button>
          <button class="btn small" data-act="add-class">+ เพิ่มคาบเรียน</button>
          <span class="grow"></span>
        </div>`}
      </section>
      <section class="card">
        <div class="card-head"><h2>${ico('target', 18)} ตารางสอบ</h2></div>
        ${(() => {
          const t = todayStr();
          const withExam = DB.subjects.filter(s => s.examDate).sort((a, b) => (a.examDate + (a.examTime || '')).localeCompare(b.examDate + (b.examTime || '')));
          return withExam.length ? withExam.map(s => {
            const n = daysBetween(t, s.examDate);
            const p = subjectProgress(s);
            return `<div class="item">
              <span class="tag" style="--c:${safeColor(s.color)};cursor:pointer" data-act="open-subject" data-id="${s.id}">${n === 0 ? 'วันนี้!' : n > 0 ? `อีก ${n} วัน` : 'สอบแล้ว'}</span>
              <span class="grow" style="cursor:pointer" data-act="open-subject" data-id="${s.id}" title="กดเพื่อไปที่วิชานี้">
                <b>${esc(s.name)}</b>
                <br><small class="muted">🎯 ${fmtDateLong(s.examDate)}${s.examTime ? ' · ' + esc(s.examTime) : ''}${roomText(s.room) ? ' · ห้อง ' + esc(roomText(s.room)) : ''} · ความพร้อม <b>${p.done}/${p.total} บท (${p.pct}%)</b></small>
                ${progressBar(p.pct, s.color)}
              </span>
              <button class="mini-btn" data-act="edit-subject" data-id="${s.id}" aria-label="แก้ไขวันสอบ ${esc(s.name)}">✎</button>
            </div>`;
          }).join('') : empty('🎯', 'ยังไม่มีวิชาที่กำหนดวันสอบ', `<button class="btn small" data-act="go" data-tab="subjects">${DB.subjects.length ? 'กำหนดวันสอบ' : 'ไปเพิ่มวิชา'}</button>`);
        })()}
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
      const dayClasses = classesOnDate(d);
      html += `<div class="cal-cell ${inMonth ? '' : 'out'} ${d === t ? 'today' : ''}" data-act="cal-day" data-date="${d}">
        <div class="cal-num">${parseDate(d).getDate()}</div>
        ${exams.map(s => `<div class="cal-chip exam" style="--c:${safeColor(s.color)}">🎯 ${esc(s.name)}</div>`).join('')}
        ${dayClasses.map(c => `<div class="cal-chip exam" style="--c:${classColor(c)}">${esc(c.start)} ${esc(className(c))}</div>`).join('')}
        ${tasks.map(x => `<div class="cal-chip task ${x.done ? 'done' : ''}">${x.type === 'event' ? '📌' : '📝'} ${esc(x.title)}</div>`).join('')}
        ${plan.length ? `<div class="cal-chip plan">📖 ${plan.filter(p => p.done).length}/${plan.length}</div>` : ''}
      </div>`;
    }
    return `
    <section class="card">
      ${switcher}
      <div class="toolbar">
        <button class="icon-btn" data-act="cal-nav" data-dir="-1" aria-label="เดือนก่อน">‹</button>
        <h2 class="cal-title">${TH_MONTHS_FULL[m - 1]} ${y + 543}</h2>
        <button class="icon-btn" data-act="cal-nav" data-dir="1" aria-label="เดือนถัดไป">›</button>
        <button class="btn ghost small" data-act="cal-today">วันนี้</button>
      </div>
      <div class="cal-grid">${TH_DAYS.map(d => `<div class="cal-dow">${d}</div>`).join('')}${html}</div>
      <p class="muted small">🎯 วันสอบ · 🗓️ ตารางเรียน · 📝 งาน · 📌 กิจกรรม · 📖 แผนอ่าน — แตะวันเพื่อดูรายละเอียด</p>
    </section>`;
  },

  timer() {
    const p = DB.prefs.pomo, t = todayStr();
    const sessions = DB.sessions.filter(x => x.date === t).sort((a, b) => b.at - a.at);
    const total = sessions.reduce((a, x) => a + x.minutes, 0);
    const modes = [['work', `${ico('target', 14)} โฟกัส`], ['short', `${ico('clock', 14)} พักสั้น`], ['long', `${ico('moon', 14)} พักยาว`]];
    setTimeout(() => App.renderTimerBits(), 0);

    return `
    <div class="grid2">
      <section class="card timer-card">
        <div class="pills">${modes.map(([k, l]) => `<button class="pill ${Timer.mode === k ? 'active' : ''}" data-act="timer-mode" data-mode="${k}">${l}</button>`).join('')}</div>
        <div id="timerRing" class="ring ${Timer.mode}"><div class="ring-inner"><div id="timerDisplay" class="time">--:--</div>
          <div class="muted small">รอบที่ ${Timer.round + 1} · ${Timer.mode === 'work' ? 'ตั้งใจอ่านนะ' : 'พักสายตาหน่อย'}</div></div></div>
        <label class="field">อ่านวิชา<select data-chg="timer-subject">${subjectOptions(Timer.subjectId)}</select></label>
        <div class="row center wrap">
          <button id="timerStartBtn" class="btn big" data-act="timer-start">${ico('play')} เริ่ม</button>
          <button class="btn ghost" data-act="timer-reset">${ico('reset')} รีเซ็ต</button>
          ${Timer.mode === 'work' ? `<button class="btn ghost" data-act="timer-stoplog">${ico('square')} หยุด+บันทึก</button>` : ''}
          <button class="btn ghost" data-act="timer-skip">${ico('skip')} ข้าม</button>
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
        <div class="card-head"><h2>${ico('book', 18)} บันทึกการอ่านวันนี้</h2><span class="chip accent">${fmtMin(total)}</span></div>
        ${sessions.length ? sessions.map(x => `<div class="item">${tag(x.subjectId)}<span class="grow">${fmtMin(x.minutes)}</span>
          <small class="muted">${new Date(x.at).toTimeString().slice(0, 5)}</small>
          <button class="mini-btn" data-act="del-session" data-id="${x.id}" aria-label="ลบบันทึก">${ico('close', 14)}</button></div>`).join('') : empty(ico('clock', 30), 'ยังไม่มีบันทึกวันนี้')}
        <h3>${ico('plus', 15)} บันทึกเวลาเอง</h3>
        <form data-form="session" class="session-form" novalidate>
          <label class="field">วิชา<select name="subjectId">${subjectOptions('')}</select></label>
          <div class="grid2-sm">
            <label class="field"><span>นาที</span><input name="minutes" type="number" min="1" max="1440" placeholder="เช่น 45" required></label>
            <label class="field"><span>วันที่ <small class="muted">(${fmtDateBE(t)})</small></span><input name="date" type="date" value="${t}" min="${new Date().getFullYear() - 1}-01-01" max="${new Date().getFullYear() + 5}-12-31" data-chg="be-hint"></label>
          </div>
          <button class="btn small full">${ico('save', 15)} บันทึกเวลา</button>
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


    const weekSessions = DB.sessions.filter(x => x.date >= ws && x.date <= days[6]).sort((a, b) => b.date.localeCompare(a.date) || (b.at || 0) - (a.at || 0));
    return `
    
    <section class="card">
      <div class="toolbar">
        <button class="icon-btn" data-act="week-nav" data-dir="-1" aria-label="สัปดาห์ก่อน">${ico('chevron-left', 17)}</button>
        <h2>สัปดาห์ ${fmtDateBE(ws)} – ${fmtDateBE(days[6])}</h2>
        <button class="icon-btn" data-act="week-nav" data-dir="1" aria-label="สัปดาห์ถัดไป">${ico('chevron-right', 17)}</button>
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
    <section class="card" style="margin-top:16px">
      <div class="card-head">
        <h2>${ico('clock', 18)} ประวัติบันทึกเวลาอ่าน (${weekSessions.length})</h2>
        <button class="btn small ghost" data-act="add-session">${ico('plus', 14)} เพิ่มบันทึก</button>
      </div>
      ${weekSessions.length ? weekSessions.map(x => `<div class="item">
        ${tag(x.subjectId)}
        <span class="grow"><b>${fmtMin(x.minutes)}</b> <small class="muted">· ${fmtDateBE(x.date)}${x.at ? ' ' + new Date(x.at).toTimeString().slice(0, 5) : ''}</small></span>
        <span class="item-actions">
          <button class="mini-btn" data-act="edit-session" data-id="${x.id}" aria-label="แก้ไขบันทึก">${ico('edit', 15)}</button>
          <button class="mini-btn" data-act="del-session" data-id="${x.id}" aria-label="ลบบันทึก">${ico('close', 15)}</button>
        </span>
      </div>`).join('') : empty(ico('clock', 28), 'ยังไม่มีบันทึกเวลาในสัปดาห์นี้')}
    </section>
    ${coachActionHTML()}`;
  },

  ai() {
    if (!AI.ready()) {
      const th = DB.prefs.theme || 'sky';
      return `<section class="card welcome"><h2>${th === 'sky' ? '🐃' : ico('sparkles', 20)} ${aiTabLabel()}</h2>
        <p>ต้องใส่ API key ก่อนนะ เลือกได้ทั้ง <b>Google Gemini</b> (มีโควตาฟรี), <b>DeepSeek</b> หรือ <b>OpenAI</b></p>
        <button class="btn" data-act="go" data-tab="settings">ไปที่ตั้งค่า AI →</button></section>`;
    }
    const chat = LOCAL.chat || [];
    const quick = ['วันนี้ควรอ่านอะไรก่อนดี?', 'ช่วยจัดตารางอ่านให้หน่อย', 'ช่วยให้กำลังใจหน่อย 🥺', 'ประเมินหน่อยว่าอ่านทันไหม'];

    return `
      <section class="card chat-card">
        <div class="card-head"><h2>💬 คุยกับ${aiBotName()}</h2><span class="chip">${esc(AI.providerLabel())}</span>
          <button class="mini-btn" data-act="clear-chat">ล้างแชท</button></div>
        <div id="chatBox" class="chat-box">
          ${chat.length ? chat.map(chatRowHTML).join('') : chatRowHTML({ role: 'assistant', content: 'ว่าไง\n---\nถามเนื้อหา บอกวันสอบ หรือแนบรูปตารางผ่านปุ่ม 📎 มาให้ช่วยจัดการได้เลย' })}
          ${App.aiBusy ? `<div class="msg-row ai">${chatAvatarHTML()}<div class="msg-col"><div class="ooo-name">${aiBotName()}</div><div class="msg assistant typing"><span></span><span></span><span></span></div></div></div>` : ''}
        </div>
        <div class="quick">${quick.map(q => `<button class="chip" data-act="quick-ask" data-q="${esc(q)}">${q}</button>`).join('')}</div>
        <p class="muted small" style="margin:0 0 6px">💡 อยากให้ช่วยจัดตาราง เพิ่มวิชา หรือสรุปบทเรียน แนบรูป/ไฟล์ผ่านปุ่ม <b>📎</b> แล้วพิมพ์บอก${aiBotName()}ได้เลย</p>
        <form data-form="chat" class="chat-form">
          <div id="chatChips" class="chat-chips">${chatChipsHTML()}</div>
          <div class="chat-input">
            <button type="button" class="icon-btn" data-act="chat-attach" title="แนบไฟล์" aria-label="แนบไฟล์" ${App.aiBusy ? 'disabled' : ''}>📎</button>
            <button type="button" class="icon-btn chat-cam" data-act="chat-cam" title="ถ่ายรูป" aria-label="ถ่ายรูป" ${App.aiBusy ? 'disabled' : ''}>📷</button>
            <textarea name="q" rows="2" placeholder="พิมพ์หา${aiBotName()}… (Enter ส่ง, Shift+Enter ขึ้นบรรทัด)" ${App.aiBusy ? 'disabled' : ''}></textarea>
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
    const dsPresets = [
      ['deepseek-chat', 'deepseek-chat (แนะนำ · รองรับคำสั่งจัดตาราง)'],
      ['deepseek-reasoner', 'deepseek-reasoner (คิดวิเคราะห์ลึก)'],
    ];
    const presets = C.provider === 'gemini' ? gemPresets : C.provider === 'deepseek' ? dsPresets : oaPresets;
    const curModel = C.provider === 'gemini' ? C.geminiModel : C.provider === 'deepseek' ? (C.deepseekModel || 'deepseek-chat') : C.openaiModel;
    const modelField = C.provider === 'gemini' ? 'geminiModel' : C.provider === 'deepseek' ? 'deepseekModel' : 'openaiModel';
    const isCustom = App._customModel || !presets.some(([v]) => v === curModel);


    return `
    
    <section class="card"><h2>👤 ทั่วไป</h2>
      <form data-form="name" class="row" novalidate><input name="name" required aria-label="ชื่อเล่น" placeholder="ชื่อเล่น" value="${esc(DB.name)}"><button class="btn small">บันทึก</button></form>
    </section>

    <section class="card"><h2>🎨 ธีม</h2>
      <div class="theme-group-lbl muted small">ธีมสีพื้น</div>
      <div class="theme-grid">${THEMES.filter(([k]) => isMinimalTheme(k)).map(([k, l, c]) => `<button class="theme-sw ${DB.prefs.theme === k ? 'active' : ''}" data-act="theme" data-theme="${k}" style="--c:${c}"><span class="dot"></span>${l}</button>`).join('')}</div>
      <div class="theme-group-lbl muted small" style="margin-top:10px">ธีมพิเศษ</div>
      <div class="theme-grid">${THEMES.filter(([k]) => !isMinimalTheme(k)).map(([k, l, c]) => `<button class="theme-sw ${DB.prefs.theme === k ? 'active' : ''}" data-act="theme" data-theme="${k}" style="--c:${c}"><span class="dot"></span>${l}</button>`).join('')}</div>
      <label class="switch"><input type="checkbox" data-bind="prefs.dark" ${DB.prefs.dark ? 'checked' : ''}><span></span> โหมดมืด 🌙</label>
      <div style="margin-top:8px"><button type="button" class="btn small ghost" data-act="tag-colors">🎨 เลือกสีแท็ก (อ่านหนังสือ / วันสอบ / งาน / กิจกรรม)</button></div>
    </section>

    <section class="card"><h2>🔔 การแจ้งเตือน</h2>
      <label class="switch"><input type="checkbox" data-act="toggle-notify" ${DB.prefs.notify ? 'checked' : ''}><span></span> เปิดการแจ้งเตือน</label>
      <div class="row wrap">
        <label class="inline">เวลา ${time24HTML('notifyTime', DB.prefs.notifyTime, { bind: 'prefs.notifyTime', aria: 'เวลาแจ้งเตือน' })}</label>
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
        <button class="pill ${C.provider === 'deepseek' ? 'active' : ''}" data-act="ai-provider" data-p="deepseek">DeepSeek</button>
        <button class="pill ${C.provider === 'openai' ? 'active' : ''}" data-act="ai-provider" data-p="openai">OpenAI</button>
      </div>
      ${C.provider === 'gemini' ? `
        <label class="field">Gemini API key <input type="password" data-ai="geminiKey" value="${esc(C.geminiKey)}" placeholder="AIza..."></label>
        <p class="muted small" style="margin-top:-6px">ขอ key ฟรีได้ที่ <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a></p>` : C.provider === 'deepseek' ? `
        <label class="field">DeepSeek API key <input type="password" data-ai="deepseekKey" value="${esc(C.deepseekKey || '')}" placeholder="sk-..."></label>
        <p class="muted small" style="margin-top:-6px">สร้าง key ได้ที่ <a href="https://platform.deepseek.com/api_keys" target="_blank">platform.deepseek.com/api_keys</a> (คิดเงินตามการใช้งาน)</p>
        <details style="margin:6px 0 10px"><summary>ตั้งค่า CORS Proxy URL (ไม่บังคับ)</summary>
          <label class="field" style="margin-top:6px">CORS Proxy URL (Cloudflare Worker)<input type="url" data-ai="deepseekProxy" value="${esc(C.deepseekProxy || 'https://lungaoody-deepseek.lungaoody.workers.dev')}" placeholder="https://...workers.dev"></label>
        </details>` : `
        <label class="field">OpenAI API key <input type="password" data-ai="openaiKey" value="${esc(C.openaiKey)}" placeholder="sk-..."></label>
        <p class="muted small" style="margin-top:-6px">สร้าง key ที่ <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a> (คิดเงินตามการใช้งาน)</p>`}
      <label class="field">รุ่นโมเดล
        <select data-chg="ai-model-select">
          ${presets.map(([v, lbl]) => `<option value="${v}" ${!isCustom && curModel === v ? 'selected' : ''}>${lbl}</option>`).join('')}
          <option value="__custom__" ${isCustom ? 'selected' : ''}>✏️ พิมพ์ชื่อรุ่นเอง (Custom)…</option>
        </select>
      </label>
      ${isCustom ? `<label class="field">ระบุชื่อรุ่นโมเดลเอง<input data-ai="${modelField}" value="${esc(curModel)}" placeholder="เช่น gemini-3.8-flash"></label>` : ''}
      <button class="btn ghost small" data-act="test-ai">ทดสอบการเชื่อมต่อ</button>
      <label class="switch"><input type="checkbox" data-bind="ai.sync" ${DB.ai?.sync ? 'checked' : ''}><span></span> Sync API key ข้ามเครื่อง (เฉพาะในบัญชี Google ของคุณ)</label>
      <p class="muted small">🔐 <b>ความปลอดภัย:</b> API key ถูกเก็บไว้ในเบราว์เซอร์ของคุณเอง (และเฉพาะในบัญชี Google ส่วนตัวหากเปิด Sync) และไม่ติดไปในไฟล์ Export</p>
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

function taskItemHTML(x, cat = '') {
  const n = x.date ? daysBetween(todayStr(), x.date) : null;
  const tf = Array.isArray(x.files) ? x.files : [];
  const cd = !x.done && n !== null ? (n < 0 ? `<small class="warn-text">เลย ${Math.abs(n)} วัน</small>` : n === 0 ? '<b class="accent-text">วันนี้</b>' : n === 1 ? '<b class="accent-text">พรุ่งนี้</b>' : `<small class="muted">อีก ${n} วัน</small>`) : '';
  return `<div class="item ${x.done ? 'done' : ''}">
    <label class="task-check-wrap"><input type="checkbox" class="cb" data-act="toggle-task" data-id="${x.id}" ${x.done ? 'checked' : ''} aria-label="ทำเครื่องหมายว่าเสร็จแล้ว"></label>
    ${cat || `<span>${x.type === 'event' ? ico('calendar', 14) : ico('note', 14)}</span>`}
    ${x.subjectId ? tag(x.subjectId) : ''}
    <span class="grow">${esc(x.title)} <small class="muted">· ${fmtDate(x.date)}${x.time ? ' ' + esc(x.time) : ''}</small>${cd ? ` · ${cd}` : ''}</span>
    <span class="item-actions"><button class="mini-btn ${tf.length ? 'has' : ''}" data-act="task-files" data-id="${x.id}" title="แนบ/ดูไฟล์ (${tf.length})" aria-label="แนบไฟล์ ${esc(x.title)}">${ico('paperclip', 14)}${tf.length ? `<small class="ch-fc">${tf.length}</small>` : ''}</button>
    <button class="mini-btn" data-act="edit-task" data-id="${x.id}" aria-label="แก้ไขงาน ${esc(x.title)}">${ico('edit', 15)}</button>
    <button class="mini-btn" data-act="del-task" data-id="${x.id}" aria-label="ลบงาน ${esc(x.title)}">${ico('close', 15)}</button></span>
  </div>`;
}

/* ===== Modal contents ===== */
function subjectClassRowHTML(c = {}, blank = false) {
  const dayOpts = [[1, 'จันทร์'], [2, 'อังคาร'], [3, 'พุธ'], [4, 'พฤหัส'], [5, 'ศุกร์'], [6, 'เสาร์'], [0, 'อาทิตย์']]
    .map(([v, lbl]) => `<option value="${v}" ${Number(c.day ?? 1) === v ? 'selected' : ''}>${lbl}</option>`).join('');
  const st = blank ? (c.start || '') : (c.start || '09:00');
  const en = blank ? (c.end || '') : (c.end || '12:00');
  return `<div class="subj-class-row" data-cid="${esc(c.id || '')}">
    <select name="clsDay" aria-label="วันเรียน">${dayOpts}</select>
    ${time24HTML('clsStart', st, { aria: 'เวลาเริ่ม' })}
    ${time24HTML('clsEnd', en, { aria: 'เวลาเลิก' })}
    <input name="clsRoom" value="${esc(c.room || '')}" placeholder="ห้องเรียน" maxlength="60" aria-label="ห้องเรียน">
    <button type="button" class="mini-btn" data-act="subj-cls-del" aria-label="ลบคาบเรียน">${ico('close', 14)}</button>
  </div>`;
}
function subjectForm(s = {}) {
  const color = s.color || SUBJECT_COLORS[DB.subjects.length % SUBJECT_COLORS.length];
  const classes = s.id ? (DB.classes || []).filter(c => c.subjectId === s.id) : [];
  const hasExam = !!(s.examDate || s.examTime || s.room);
  return `<form data-form="subject" data-id="${s.id || ''}" novalidate>
    <label class="field">ชื่อวิชา<input name="name" required maxlength="120" value="${esc(s.name || '')}" placeholder="เช่น Managerial Accounting"></label>
    <div class="field">
      <div class="row" style="margin:0 0 6px;justify-content:space-between">
        <span>ตารางเรียนประจำสัปดาห์ (ซิงก์กับปฏิทินและหน้าแรกอัตโนมัติ)</span>
        <button type="button" class="btn small ghost" data-act="subj-cls-add">${ico('plus', 13)} เพิ่มคาบเรียน</button>
      </div>
      <div id="subjClasses" class="subj-classes">${classes.length ? classes.map(c => subjectClassRowHTML(c)).join('') : subjectClassRowHTML({}, true)}</div>
    </div>
    <div class="field">
      <div class="row" style="margin:0 0 6px;justify-content:space-between">
        <span>วันสอบ (ไม่บังคับ)</span>
        <button type="button" class="btn small ghost" data-act="subj-exam-toggle" id="subjExamToggle">${hasExam ? 'ซ่อนวันสอบ' : `${ico('plus', 13)} เพิ่มวันสอบ`}</button>
      </div>
      <div id="subjExamFields" class="row wrap" ${hasExam ? '' : 'hidden'}>
        ${dateField('วันสอบ', 'examDate', s.examDate || '')}
        <label class="field">เวลาสอบ${time24HTML('examTime', s.examTime || '', { aria: 'เวลาสอบ' })}</label>
        <label class="field">ห้องสอบ / หมายเหตุ<input name="room" value="${esc(s.room || '')}" placeholder="เช่น ห้อง 301"></label>
      </div>
    </div>
    <div class="field">สี<div class="colors">${SUBJECT_COLORS.map((c, i) => `<label class="color-dot" style="--c:${c}" aria-label="เลือกสีที่ ${i + 1}"><input type="radio" name="color" value="${c}" ${c === color ? 'checked' : ''} aria-label="เลือกสีที่ ${i + 1}"><span></span></label>`).join('')}
      <label class="color-dot color-rgb ${!SUBJECT_COLORS.includes(color) ? 'is-custom' : ''}" style="--c:${color}" title="เลือกสี RGB เอง" aria-label="เลือกสี RGB เอง"><input type="color" name="customColor" value="${color}" data-chg="custom-color"><span></span></label></div></div>
    ${s.id ? '' : `<label class="field">บท/หัวข้อ (บรรทัดละ 1 บท, ใส่ทีหลังก็ได้)<textarea name="chapters" rows="4" placeholder="Ch1 Introduction&#10;Ch2 Cost behavior&#10;..."></textarea></label>`}
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function sessionForm(x = {}) {
  return `<form data-form="session" data-id="${x.id || ''}" novalidate>
    <label class="field">วิชา<select name="subjectId">${subjectOptions(x.subjectId || '')}</select></label>
    <div class="grid2-sm">
      <label class="field"><span>นาที</span><input name="minutes" type="number" min="1" max="1440" value="${x.minutes || ''}" placeholder="เช่น 45" required></label>
      ${dateField('วันที่', 'date', x.date || todayStr(), true)}
    </div>
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function todoForm(opts = {}) {
  const kind = opts.kind || 'homework';
  const sid = opts.subjectId || DB.subjects[0]?.id || '';
  const isPlan = kind === 'plan';
  return `<form data-form="todo">
    <input type="hidden" name="todoKind" id="todoKindInput" value="${kind}">
    <div class="pills" style="margin-bottom:12px">
      <button type="button" class="pill ${kind === 'homework' ? 'active' : ''}" data-act="todo-kind" data-k="homework">📝 งาน</button>
      <button type="button" class="pill ${kind === 'event' ? 'active' : ''}" data-act="todo-kind" data-k="event">📌 กิจกรรม</button>
      <button type="button" class="pill ${isPlan ? 'active' : ''}" data-act="todo-kind" data-k="plan">📖 อ่านหนังสือ</button>
    </div>
    <label class="field">วิชา<select name="subjectId" data-chg="plan-sub">${subjectOptions(sid)}</select></label>
    <div id="todoTaskFields" ${isPlan ? 'hidden' : ''}>
      <label class="field">ชื่องาน / กิจกรรม<input name="taskTitle" maxlength="200" placeholder="เช่น ส่งรายงานกลุ่ม หรือ ประชุมโปรเจกต์"></label>
    </div>
    <div id="todoPlanFields" ${isPlan ? '' : 'hidden'}>
      <label class="field">บท (เลือก หรือพิมพ์เองด้านล่าง)<select name="chapterId" id="planCh">${planChapterOptions(sid, '')}</select></label>
      <label class="field">รายละเอียด<input name="planTitle" placeholder="เช่น ทำแบบฝึกหัดบท 3"></label>
    </div>
    <div class="row wrap">
      ${dateField('วันที่', 'date', opts.date || todayStr(), true)}
      <label class="field">เวลาเริ่ม <small class="muted">(ไม่บังคับ)</small>${time24HTML('time', '', { aria: 'เวลาเริ่ม' })}</label>
      <label class="field" id="todoEndWrap" ${isPlan ? '' : 'hidden'}>เวลาสิ้นสุด <small class="muted">(ไม่บังคับ)</small>${time24HTML('endTime', '', { aria: 'เวลาสิ้นสุด' })}</label>
    </div>
    <label class="inline" style="margin:6px 0"><input type="checkbox" name="remind" checked> 🔔 แจ้งเตือนเมื่อถึงเวลา</label>
    <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">บันทึก</button></div>
  </form>`;
}
function taskForm(x = {}) {
  return `<form data-form="task" data-id="${x.id || ''}">
    <input type="hidden" name="type" value="${esc(x.type || 'homework')}">
    <label class="field">ชื่องาน<input name="title" required maxlength="200" value="${esc(x.title || '')}" placeholder="เช่น ส่งรายงานกลุ่ม"></label>
    <div class="row wrap">
      ${dateField('วันที่', 'date', x.date || todayStr(), true)}
      <label class="field">เวลา${time24HTML('time', x.time || '', { aria: 'เวลา' })}</label>
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
      <label class="field">เวลาเริ่ม <small class="muted">(ไม่บังคับ)</small>${time24HTML('time', p.time || '', { aria: 'เวลาเริ่ม' })}</label>
      <label class="field">เวลาสิ้นสุด <small class="muted">(ไม่บังคับ)</small>${time24HTML('endTime', p.endTime || '', { aria: 'เวลาสิ้นสุด' })}</label>
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
      <label class="field">เวลาเริ่ม${time24HTML('start', start, { aria: 'เวลาเริ่ม' })}</label>
      <label class="field">เวลาจบ${time24HTML('end', end, { aria: 'เวลาจบ' })}</label>
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
        <button type="button" class="btn ghost" data-act="ai-quiz" data-sid="${s.id}" data-id="${c.id}">❓ ข้อสอบ</button>
      </div>
      <div id="aiOut"></div>
    </form>`, true);
}
function dayModal(d, opts = {}) {
  const exams = DB.subjects.filter(s => s.examDate === d), tasks = DB.tasks.filter(x => x.date === d), plan = planForDate(d);
  const cls = classesOnDate(d);
  openModal(`📅 ${fmtDateLong(d)}`, `
    ${exams.map(s => `<div class="exam-badge big" style="--c:${safeColor(s.color)}">🎯 สอบ ${esc(s.name)} ${esc(s.examTime || '')} ${roomText(s.room) ? '· ห้อง ' + esc(roomText(s.room)) : ''}</div>`).join('')}
    ${cls.length ? `<h3>🗓️ ตารางเรียน</h3>${cls.map(c => `<div class="item"><span class="tag" style="--c:${classColor(c)}">${esc(c.start)}${c.end ? '–' + esc(c.end) : ''}</span><span class="grow">${esc(className(c))}${c.room ? ` <small class="muted">· ${esc(c.room)}</small>` : ''}</span></div>`).join('')}` : ''}
    <h3>📖 แผนอ่าน</h3>${plan.length ? plan.map(p => planItemHTML(p)).join('') : '<p class="muted small">ไม่มี</p>'}
    <h3>📝 งาน / กิจกรรม</h3>${tasks.length ? tasks.map(taskItemHTML).join('') : '<p class="muted small">ไม่มี</p>'}
    <div class="row wrap"><button class="btn small" data-act="add-todo" data-date="${d}">+ สิ่งที่ต้องทำ</button></div>`, false, opts);
}
function openNewTermModal() {
  openModal('สร้าง Workflow ใหม่', `
    <p class="muted small" style="margin-top:0">แยกชุดวิชา ตารางเรียน วันสอบ ไฟล์แนบ และงานเป็นคนละพื้นที่ทำงาน (ตั้งชื่อเองได้อิสระ) โดยสถิติเวลาอ่านรวมทั้งหมดยังคงอยู่</p>
    <form data-form="new-term">
      <label class="field">ชื่อ Workflow / พื้นที่ทำงาน<input id="newTermName" name="termName" required maxlength="40" placeholder="เช่น เทอม 2/2569, เตรียมสอบ, โปรเจกต์"></label>
      <div class="row end"><button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button><button class="btn">สร้าง &amp; สลับใช้งาน</button></div>
    </form>
  `);
}
function openDeleteTermModal() {
  const names = allTermNames();
  if (names.length <= 1) return App.toast('ต้องมีอย่างน้อย 1 Workflow');
  const cur = (DB.term || 'เทอม 1').trim() || 'เทอม 1';
  openModal('ยืนยันการลบ Workflow', `
    <p style="margin-top:0">ต้องการลบ Workflow <b>"${esc(cur)}"</b> และวิชา ตารางเรียน วันสอบ งานทั้งหมดใน Workflow นี้ใช่ไหม?</p>
    <p class="muted small">สถิติเวลาอ่านรวมและ Workflow อื่นๆ จะยังคงอยู่ครบ</p>
    <div class="row end">
      <button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button>
      <button type="button" class="btn danger" data-act="del-term-confirm">ลบ Workflow นี้</button>
    </div>
  `);
}
function openTagColorsModal(opts = {}) {
  const defs = [
    ['plan', '📖 อ่านหนังสือ', '#3b82f6'],
    ['exam', '🎯 วันสอบ', '#a855f7'],
    ['hw', '📝 งาน', '#f59e0b'],
    ['ev', '📌 กิจกรรม', '#10b981'],
  ];
  const tc = DB.prefs.tagColors || {};
  openModal('🎨 เลือกสีแท็ก', `
    <p class="muted small" style="margin-top:0">เลือกสีที่ใช้แสดงบนปฏิทิน แท็กโฮเวอร์ และรายการสิ่งที่ต้องทำ</p>
    ${defs.map(([k, lbl, def]) => {
      const cur = safeColor(tc[k] || def);
      return `<div class="field" style="margin-bottom:12px">
        <div class="row" style="margin:0 0 6px;justify-content:space-between">
          <b>${lbl}</b>
          <span class="cht-tag" style="background:color-mix(in srgb, ${cur} 22%, transparent);color:${cur}">${lbl.replace(/^\S+\s+/, '')}</span>
        </div>
        <div class="colors">
          ${SUBJECT_COLORS.map(c => `<button type="button" class="color-dot ${cur.toLowerCase() === c.toLowerCase() ? 'sel' : ''}" style="--c:${c}" data-act="tag-color-pick" data-k="${k}" data-c="${c}" aria-label="เลือกสี ${c}"><span></span></button>`).join('')}
          <input type="color" value="${esc(cur)}" data-chg="tag-color-custom" data-k="${k}" title="เลือกสีเอง">
        </div>
      </div>`;
    }).join('')}
    <div class="row" style="justify-content:space-between;margin-top:14px">
      <button type="button" class="btn ghost small" data-act="tag-color-reset">รีเซ็ตสีเริ่มต้น</button>
      <button type="button" class="btn small" data-act="close-modal">เสร็จสิ้น</button>
    </div>
  `, false, opts);
}
function openPendingModal(opts = {}) {
  const t = todayStr();
  App._pendingOpen = true;
  const tasks = DB.tasks.filter(x => !x.done).map(x => ({ date: x.date || '9999-99-99', time: x.time || '', item: x }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  openModal(`📋 งานที่ค้างทั้งหมด (${tasks.length} รายการ)`, `
    <div class="row" style="justify-content:space-between;margin:0 0 10px">
      <span class="muted small">เรียงตามใกล้เดดไลน์ที่สุดไว้ด้านบน</span>
      <button class="btn small" data-act="add-task" data-date="${t}">${ico('plus', 14)} เพิ่มงาน</button>
    </div>
    ${tasks.length ? tasks.map(e => taskItemHTML(e.item, e.item.type === 'event' ? '<span class="todo-cat cat-ev">กิจกรรม</span>' : '<span class="todo-cat cat-hw">งาน</span>')).join('')
    : empty('✅', 'ไม่มีงานค้างแล้ว เยี่ยมเลย!')}`, true, { ...opts, keepPending: true });
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
        <button class="mini-btn" data-act="fc-del" data-id="${x.id}">✕</button></div>`).join('') || `<p class="muted">ยังไม่มีการ์ด — เพิ่มเอง หรือให้ AI สร้างจากโน้ต (แท็บ ${aiTabLabel()} / ปุ่มในโน้ต)</p>`}`);
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
  if (!Sync.user || !fileGoesToDrive() || !driveClientId()) return 'เก็บในเครื่องอัตโนมัติ · ล็อกอินเพื่อซิงก์ขึ้น Drive';
  return `อัปโหลดลง Google Drive ของ ${s.name} อัตโนมัติ`;
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
  const fileMenuBtn = (kind, id, cur) => `<button type="button" class="mini-btn file-menu-btn" data-act="file-menu" data-kind="${kind}" data-id="${esc(id)}" data-folder="${esc(cur || '')}" aria-label="จัดการไฟล์">⋮</button>`;
  const signed = !!Sync.user;
  const driveRow = f => `<div class="item file-item">
      <span class="file-ic">${fileIcon(f.mimeType, f.name)}</span>
      <span class="grow">
        <button type="button" class="file-name-btn" data-act="file-drive-open" data-id="${esc(f.id)}"><b>${esc(f.name)}</b></button>
        <small class="muted file-meta"><span class="file-loc">☁️ Drive</span>${!curFolder && f.folder ? ` · 📁 ${esc(f.folder)}` : ''} · ${fmtSize(Number(f.size) || 0)} · ${esc(fmtStamp(f.modifiedTime))}</small>
      </span>
      ${fileMenuBtn('drive', f.id, f.folder)}
    </div>`;
  const localRow = f => `<div class="item file-item">
      <span class="file-ic">${fileIcon(f.type, f.name)}</span>
      <span class="grow">
        <button type="button" class="file-name-btn" data-act="file-open" data-id="${esc(f.id)}"><b>${esc(f.name)}</b></button>
        <small class="muted file-meta"><span class="file-loc">💻 ในเครื่อง</span>${!curFolder && f.folder ? ` · 📁 ${esc(f.folder)}` : ''} · ${fmtSize(Number(f.size) || 0)} · ${esc(fmtStamp(f.addedAt))}</small>
      </span>
      ${fileMenuBtn('local', f.id, f.folder)}
    </div>`;
  const linkRow = l => {
    let host = ''; try { host = new URL(l.url).hostname.replace(/^www\./, ''); } catch { }
    return `<div class="item file-item">
      <span class="file-ic">${ico('link', 17)}</span>
      <span class="grow">
        <a href="${esc(l.url)}" target="_blank" rel="noopener" class="file-name-link"><b>${esc(l.title)}</b></a>
        <small class="muted file-meta"><span class="file-loc">🔗 ลิงก์</span>${!curFolder && l.folder ? ` · 📁 ${esc(l.folder)}` : ''}${host ? ` · ${esc(host)}` : ''}</small>
      </span>
      ${fileMenuBtn('link', l.id, l.folder)}
    </div>`;
  };
  const dest = fileGoesToDrive() ? 'drive' : 'local';
  const totalN = countIn(() => true);
  const ftab = totalN === 0 ? 'upload' : (App.fileTab || 'list');

  if (ftab === 'upload') {
    const upFolder = App.fileFolder && App.fileFolder !== '__none__' ? App.fileFolder : '';
    setModalBody(`
      <div class="row wrap between" style="margin-bottom:10px;gap:8px">
        ${totalN > 0 ? `<button type="button" class="btn small ghost" data-act="file-tab" data-t="list">← กลับไปรายการไฟล์ (${totalN})</button>` : ''}
        ${signed ? `<div class="pills file-dest" style="margin:0">
          <button type="button" class="pill ${dest === 'local' ? 'active' : ''}" data-act="file-dest" data-dest="local">เก็บในเครื่อง</button>
          <button type="button" class="pill ${dest === 'drive' ? 'active' : ''}" data-act="file-dest" data-dest="drive">ขึ้น Drive</button>
        </div>` : '<button type="button" class="btn small ghost" data-act="login">🔑 ล็อกอิน Google เพื่อซิงก์ข้ามเครื่อง</button>'}
        <label class="inline" style="margin-left:auto">โฟลเดอร์:
          <select class="folder-sel" data-chg="upload-folder" aria-label="เลือกโฟลเดอร์ที่จะใส่">
            <option value="" ${!upFolder ? 'selected' : ''}>ไม่มีโฟลเดอร์</option>
            ${folders.map(fn => `<option value="${esc(fn)}" ${upFolder === fn ? 'selected' : ''}>📁 ${esc(fn)}</option>`).join('')}
          </select>
        </label>
        <button type="button" class="chip" data-act="file-folder-add">+ โฟลเดอร์</button>
      </div>
      <label class="upload-box" id="fileDropzone">
        <input type="file" multiple data-chg="file-upload" hidden>
        <div>📤 <b>คลิกเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</b>${upFolder ? ` → โฟลเดอร์ <b>${esc(upFolder)}</b>` : ''}</div>
        <div class="muted small">${esc(driveNote(s))}</div>
      </label>
      <div id="upProg" class="up-prog" role="status" hidden></div>
      <div class="or-divider"><span>หรือวางลิงก์</span></div>
      <form data-form="link-add" class="link-form-row" novalidate>
        <div class="link-inline">
          <input name="url" type="text" inputmode="url" maxlength="500" placeholder="🔗 วางลิงก์ Google Drive, Notion, YouTube..." autocomplete="url" required>
          <button class="btn small">+ เพิ่ม</button>
        </div>
        <small class="field-error" data-url-error hidden></small>
      </form>`);
    return;
  }

  const folderBarHTML = `<div class="folder-bar">
    <button type="button" class="chip ${!curFolder ? 'accent' : ''}" data-act="file-folder" data-f="">📂 ทั้งหมด (${totalN})</button>
    ${folders.map(fn => `<span class="folder-chip ${curFolder === fn ? 'active' : ''}"><button type="button" class="folder-chip-btn" data-act="file-folder" data-f="${esc(fn)}">📁 ${esc(fn)} (${countIn(x => x.folder === fn)})</button><button type="button" class="folder-chip-del" data-act="file-folder-del" data-f="${esc(fn)}" aria-label="ลบโฟลเดอร์ ${esc(fn)}">✕</button></span>`).join('')}
    ${folders.length && countIn(x => !x.folder) ? `<button type="button" class="chip ${curFolder === '__none__' ? 'accent' : ''}" data-act="file-folder" data-f="__none__">📄 ยังไม่จัดหมวด (${countIn(x => !x.folder)})</button>` : ''}
    <button type="button" class="chip" data-act="file-folder-add">+ โฟลเดอร์</button>
    <span class="folder-bar-actions">
      <button type="button" class="btn small ${App.fileSelectMode ? '' : 'ghost'}" data-act="file-select-toggle">${App.fileSelectMode ? '✓ เสร็จสิ้น' : '☑ เลือกหลายไฟล์'}</button>
      <button type="button" class="btn small" data-act="file-tab" data-t="upload">+ เพิ่มไฟล์ / ลิงก์</button>
    </span>
  </div>`;

  if (App.fileSelectMode) {
    const sel = App._dlSel || (App._dlSel = new Set());
    const allItems = [
      ...driveFiles.map(f => ({ kind: 'drive', id: f.id, name: f.name, sub: `☁️ Drive${!curFolder && f.folder ? ` · 📁 ${f.folder}` : ''}` })),
      ...local.map(f => ({ kind: 'local', id: f.id, name: f.name, sub: `💻 ในเครื่อง${!curFolder && f.folder ? ` · 📁 ${f.folder}` : ''}` })),
      ...links.map(l => ({ kind: 'link', id: l.id, name: l.title, sub: `🔗 ลิงก์${!curFolder && l.folder ? ` · 📁 ${l.folder}` : ''}` })),
    ];
    const dlCount = [...sel].filter(k => k.startsWith('drive:') || k.startsWith('local:')).length;
    setModalBody(`${folderBarHTML}
      <div class="row wrap" style="margin:0 0 10px;justify-content:space-between;gap:6px">
        <div class="row" style="margin:0;gap:6px">
          <button type="button" class="btn small ghost" data-act="file-dl-all" data-v="1">เลือกทั้งหมด (${allItems.length})</button>
          <button type="button" class="btn small ghost" data-act="file-dl-all" data-v="0">ล้างเลือก</button>
        </div>
        <button type="button" class="btn small ghost" data-act="file-select-toggle">ยกเลิก</button>
      </div>
      <div class="ch-file-scroll">
        ${allItems.length ? allItems.map(r => {
          const key = `${r.kind}:${r.id}`;
          return `<label class="item file-item" style="cursor:pointer">
            <input type="checkbox" class="cb" data-chg="dl-pick" data-key="${esc(key)}" ${sel.has(key) ? 'checked' : ''}>
            <span class="file-ic">${r.kind === 'link' ? ico('link', 16) : ico('folder', 16)}</span>
            <span class="grow"><b>${esc(r.name)}</b><br><small class="muted">${esc(r.sub)}</small></span>
          </label>`;
        }).join('') : empty('📁', 'ไม่มีรายการในหมวดนี้')}
      </div>
      <div class="batch-bar">
        <select class="folder-sel" data-chg="batch-move-folder" ${sel.size ? '' : 'disabled'} aria-label="ย้ายเข้าโฟลเดอร์">
          <option value="__pick__">📁 ย้ายเข้าโฟลเดอร์…</option>
          <option value="">ไม่มีโฟลเดอร์</option>
          ${folders.map(fn => `<option value="${esc(fn)}">📁 ${esc(fn)}</option>`).join('')}
        </select>
        <button type="button" class="btn small ghost" data-act="file-dl-run" ${dlCount ? '' : 'disabled'}>⬇ ดาวน์โหลด (${dlCount})</button>
        <button type="button" class="btn small danger" data-act="file-batch-del" ${sel.size ? '' : 'disabled'}>🗑️ ลบ (${sel.size})</button>
      </div>`);
    return;
  }

  const unifiedRows = [
    ...driveFiles.map(driveRow),
    ...local.map(localRow),
    ...links.map(linkRow),
  ];
  setModalBody(`${folderBarHTML}
    ${!unifiedRows.length ? empty('📁', 'ยังไม่มีไฟล์หรือลิงก์ในหมวดนี้', `<button class="btn small" data-act="file-tab" data-t="upload">+ เพิ่มไฟล์ / ลิงก์</button>`) : unifiedRows.join('')}`);
}
function openAllExamsModal() {
  const exams = upcomingExams();
  const past = DB.subjects.filter(s => s.examDate && daysBetween(todayStr(), s.examDate) < 0);
  openModal(`${ico('target', 17)} นับถอยหลังวันสอบทั้งหมด`, `
    ${exams.length ? `<div class="cd-grid">${exams.map(countdownCard).join('')}</div>` : empty(ico('calendar', 30), 'ยังไม่มีวันสอบที่กำลังจะมาถึง', `<button class="btn small" data-act="go" data-tab="subjects">ไปตั้งวันสอบ</button>`)}
    ${past.length ? `<div style="margin-top:16px"><h3>สอบผ่านไปแล้ว (${past.length})</h3><div class="cd-grid" style="opacity:.65">${past.map(countdownCard).join('')}</div></div>` : ''}
  `, true);
}
async function collectSubjectRows(sid) {
  const subs = sid ? [subjectById(sid)].filter(Boolean) : DB.subjects;
  const rows = [];
  for (const s of subs) {
    const local = await FileStore.list(s.id).catch(() => []);
    const drive = (s.driveFiles || []).filter(f => f && safeDriveId(f.id));
    const links = s.links || [];
    const prefix = sid ? '' : `${s.name} · `;
    drive.forEach(f => rows.push({ kind: 'drive', id: f.id, name: f.name, folder: f.folder || '', sub: `${prefix}${f.folder ? `Drive · 📁 ${f.folder}` : 'Google Drive'}` }));
    local.filter(f => f && !f.driveId).forEach(f => rows.push({ kind: 'local', id: f.id, name: f.name, folder: f.folder || '', sub: `${prefix}${f.folder ? `ในเครื่อง · 📁 ${f.folder}` : 'ในเครื่อง'}` }));
    links.forEach(l => rows.push({ kind: 'link', id: l.id, name: l.title, url: l.url, folder: l.folder || '', sub: `${prefix}${l.folder ? `ลิงก์ · 📁 ${l.folder}` : 'ลิงก์เอกสาร'}` }));
  }
  return rows;
}
async function openChapterFilesModal(sid, cid) {
  const s = subjectById(sid); if (!s) return;
  const c = (s.chapters || []).find(x => x.id === cid); if (!c) return;
  openModal(`${ico('paperclip', 17)} บท: ${esc(c.title)}`, '<p class="muted">กำลังโหลดรายการไฟล์…</p>', true);
  const rows = await collectSubjectRows(sid);
  const hasLinked = Array.isArray(c.files) && c.files.length > 0;
  App._chFiles = { mode: 'chapter', sid, cid, rows, folder: hasLinked ? '__checked__' : '', q: '', editing: false };
  renderChapterFilesModal();
}
async function openItemFilesModal(mode, id) {
  const item = mode === 'task' ? DB.tasks.find(x => x.id === id) : DB.plan.find(x => x.id === id);
  if (!item) return;
  openModal(`${ico('paperclip', 17)} ไฟล์แนบ: ${esc(item.title)}`, '<p class="muted">กำลังโหลดรายการไฟล์…</p>', true);
  const rows = await collectSubjectRows(item.subjectId || '');
  const hasLinked = Array.isArray(item.files) && item.files.length > 0;
  App._chFiles = { mode, itemId: id, sid: item.subjectId || '', rows, folder: hasLinked ? '__checked__' : '', q: '', editing: false };
  renderChapterFilesModal();
}
function _chFilesTarget() {
  const st = App._chFiles; if (!st) return null;
  if (st.mode === 'task') return DB.tasks.find(x => x.id === st.itemId) || null;
  if (st.mode === 'plan') return DB.plan.find(x => x.id === st.itemId) || null;
  const s = subjectById(st.sid);
  return (s?.chapters || []).find(x => x.id === st.cid) || null;
}
function renderChapterFilesModal() {
  const st = App._chFiles; if (!st) return;
  const target = _chFilesTarget(); if (!target) return;
  const s = st.sid ? subjectById(st.sid) : null;
  const linked = Array.isArray(target.files) ? target.files : [];
  const isLinked = (kind, id) => linked.some(x => x.kind === kind && x.id === id);
  const rowHTML = (r, withCheck) => `<div class="item file-item">
    ${withCheck ? `<input type="checkbox" class="cb" data-chg="toggle-chapter-file" data-kind="${r.kind}" data-id="${esc(r.id)}" data-name="${esc(r.name)}" ${isLinked(r.kind, r.id) ? 'checked' : ''} aria-label="เลือก ${esc(r.name)}">` : ''}
    <span class="file-ic">${r.kind === 'link' ? ico('link', 16) : ico('folder', 16)}</span>
    <span class="grow"><b>${esc(r.name)}</b><br><small class="muted">${esc(r.sub)}</small></span>
    <button type="button" class="mini-btn pill-btn" data-act="ch-file-open" data-kind="${r.kind}" data-id="${esc(r.id)}" data-url="${esc(r.url || '')}">เปิดดู</button>
  </div>`;

  if (!st.editing) {
    const linkedRows = linked.map(f => st.rows.find(r => r.kind === f.kind && r.id === f.id) || { kind: f.kind, id: f.id, name: f.name || 'ไฟล์', url: '', sub: f.kind === 'drive' ? 'Google Drive' : f.kind === 'link' ? 'ลิงก์เอกสาร' : 'ในเครื่อง' });
    setModalBody(`
      <div class="card-head">
        <h3>ไฟล์ที่แนบ (${linkedRows.length})</h3>
        <button type="button" class="btn small ghost" data-act="ch-files-edit">${ico('edit', 14)} แก้ไขไฟล์แนบ</button>
      </div>
      ${linkedRows.length
        ? `<div class="ch-file-scroll">${linkedRows.map(r => rowHTML(r, false)).join('')}</div>`
        : empty(ico('paperclip', 28), 'ยังไม่ได้แนบไฟล์', `<button type="button" class="btn small" data-act="ch-files-edit">${ico('edit', 14)} แก้ไขไฟล์แนบ</button>`)}
    `);
    return;
  }

  const folders = s ? (s.folders || []) : [...new Set(st.rows.map(r => r.folder).filter(Boolean))];
  const q = st.q.trim().toLowerCase();
  const filtered = st.rows.filter(r => {
    if (st.folder === '__checked__' && !isLinked(r.kind, r.id)) return false;
    else if (st.folder === '__none__' && r.folder) return false;
    else if (st.folder && st.folder !== '__checked__' && st.folder !== '__none__' && r.folder !== st.folder) return false;
    if (q && !r.name.toLowerCase().includes(q) && !r.folder.toLowerCase().includes(q)) return false;
    return true;
  });
  setModalBody(`
    <div class="card-head">
      <h3>เลือกไฟล์/ลิงก์ (${linked.length}/${st.rows.length})</h3>
      <div class="row" style="margin:0;gap:6px">
        ${s ? `<button type="button" class="btn small ghost" data-act="files" data-sid="${s.id}">${ico('upload', 14)} จัดการไฟล์วิชา</button>` : ''}
        <button type="button" class="btn small" data-act="ch-files-edit">เสร็จสิ้น</button>
      </div>
    </div>
    ${st.rows.length ? `
      <div class="row wrap" style="margin:6px 0 8px">
        <input id="chFileSearch" type="search" value="${esc(st.q)}" placeholder="🔍 ค้นหาชื่อไฟล์ หรือโฟลเดอร์..." style="flex:1;min-width:180px">
        <button type="button" class="btn small ghost" data-act="ch-files-bulk" data-v="1">เลือกทั้งหมด (${filtered.length})</button>
        <button type="button" class="btn small ghost" data-act="ch-files-bulk" data-v="0">เอาออกทั้งหมด</button>
      </div>
      <div class="folder-bar" style="margin-bottom:8px">
        <button type="button" class="chip ${!st.folder ? 'accent' : ''}" data-act="ch-file-folder" data-f="">ทั้งหมด (${st.rows.length})</button>
        <button type="button" class="chip ${st.folder === '__checked__' ? 'accent' : ''}" data-act="ch-file-folder" data-f="__checked__">✓ เลือกแล้ว (${linked.length})</button>
        ${folders.map(fn => `<button type="button" class="chip ${st.folder === fn ? 'accent' : ''}" data-act="ch-file-folder" data-f="${esc(fn)}">📁 ${esc(fn)}</button>`).join('')}
        ${st.rows.some(r => !r.folder) ? `<button type="button" class="chip ${st.folder === '__none__' ? 'accent' : ''}" data-act="ch-file-folder" data-f="__none__">ยังไม่จัดหมวด</button>` : ''}
      </div>
      <div class="ch-file-scroll">
        ${filtered.length ? filtered.map(r => rowHTML(r, true)).join('') : '<p class="muted center" style="padding:16px">ไม่พบไฟล์ที่ค้นหา</p>'}
      </div>
    ` : empty(ico('folder', 28), 'ยังไม่มีไฟล์หรือลิงก์', s ? `<button type="button" class="btn small" data-act="files" data-sid="${s.id}">${ico('upload', 14)} อัปโหลดไฟล์ / เพิ่มลิงก์</button>` : '')}
  `);
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
function chatAvatarHTML() {
  const theme = DB.prefs.theme || 'navy';
  if (theme === 'navy') return `<img class="ooo-av ooo-av-ronaldo" src="assets/kylian-chat.png" alt="Kylian" width="36" height="36">`;
  if (theme === 'manutd') return `<img class="ooo-av ooo-av-ronaldo manutd" src="assets/marcus-chat.png" alt="Dr.Marcus" width="36" height="36">`;
  if (isMinimalTheme(theme)) return `<span class="ooo-av ooo-av-mono" aria-hidden="true">${ico('sparkles', 17)}</span>`;
  return `<img class="ooo-av" src="assets/ooo-chat.webp" alt="" width="36" height="36">`;
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
  return `<div class="msg-row ai">${chatAvatarHTML()}<div class="msg-col"><div class="ooo-name">${aiBotName()}</div>${bubbles}${card}</div></div>`;
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
  'toggle-dark': () => { DB.prefs.dark = !DB.prefs.dark; save(); },
  'open-ai-import-guide': () => openAiImportModal(),
  'open-themes': () => openThemeModal(),
  'theme': el => {
    DB.prefs.theme = el.dataset.theme; DB.prefs.themeChosen = true;
    if (el.dataset.theme === 'navy' || el.dataset.theme === 'manutd') DB.prefs.dark = true;
    save();
    document.querySelectorAll('.modal-body .theme-sw').forEach(b => b.classList.toggle('active', b.dataset.theme === el.dataset.theme));
  },
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
  'go-timetable': () => { App.tab = 'calendar'; App.calView = 'timetable'; location.hash = 'calendar'; App.render(); window.scrollTo({ top: 0 }); },
  'cal-view': el => { App.calView = el.dataset.v; App.render(); },
  'add-class': el => openModal('+ เพิ่มคาบเรียน', classForm({ day: el.dataset.day != null ? Number(el.dataset.day) : 1, start: el.dataset.start || '08:30' })),
  'toggle-exam-classes': () => { DB.prefs.hideClassesInExam = DB.prefs.hideClassesInExam === false; save(); },
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
  'add-subject': () => openModal(`${ico('plus', 17)} เพิ่มวิชา`, subjectForm(), true),
  'edit-subject': el => openModal(`${ico('edit', 17)} แก้ไขวิชา`, subjectForm(subjectById(el.dataset.id)), true),
  'subj-cls-add': () => {
    const wrap = document.getElementById('subjClasses');
    if (wrap) wrap.insertAdjacentHTML('beforeend', subjectClassRowHTML());
  },
  'subj-cls-del': el => el.closest('.subj-class-row')?.remove(),
  'subj-exam-toggle': el => {
    const box = document.getElementById('subjExamFields'); if (!box) return;
    box.hidden = !box.hidden;
    el.innerHTML = box.hidden ? `${ico('plus', 13)} เพิ่มวันสอบ` : 'ซ่อนวันสอบ';
  },
  'toggle-coach': () => {
    const next = localStorage.getItem('lp_coach_collapsed') === '1' ? '0' : '1';
    localStorage.setItem('lp_coach_collapsed', next);
    syncGutters();
  },
  'del-subject': el => {
    const s = subjectById(el.dataset.id);
    if (!confirm(`ลบวิชา "${s.name}" และแผน/แฟลชการ์ด/ไฟล์ที่เกี่ยวข้อง?`)) return;
    DB.subjects = DB.subjects.filter(x => x.id !== s.id);
    DB.plan = DB.plan.filter(x => x.subjectId !== s.id);
    DB.flashcards = DB.flashcards.filter(x => x.subjectId !== s.id);
    FileStore.delSubject(s.id).catch(() => { });
    save();
  },
  'open-subject': el => { closeModal(); App.go('subjects'); setTimeout(() => document.getElementById('subj-' + el.dataset.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); },
  'all-exams': () => openAllExamsModal(),
  'chapter-round': el => {
    const { c } = getSC(el); if (!c) return;
    c.rounds = (Number(c.rounds) || 0) + 1;
    save(); App.toast(`บันทึกบท "${c.title}" เรียนรอบที่ ${c.rounds} แล้ว`);
  },
  'chapter-round-adj': el => {
    const { c } = getSC(el); if (!c) return;
    c.rounds = Math.max(0, (Number(c.rounds) || 0) + Number(el.dataset.d || 0));
    const v = document.getElementById('chRoundVal'); if (v) v.textContent = `${c.rounds} รอบ`;
    save();
  },
  'chapter-files': el => openChapterFilesModal(el.dataset.sid, el.dataset.id),
  'task-files': el => openItemFilesModal('task', el.dataset.id),
  'plan-files': el => openItemFilesModal('plan', el.dataset.id),
  'ch-file-open': async el => {
    const { kind, id, url } = el.dataset;
    if (kind === 'drive') {
      const did = safeDriveId(id || ''); if (!did) return;
      window.open('https://drive.google.com/file/d/' + did + '/view', '_blank', 'noopener');
    } else if (kind === 'link') {
      if (url) window.open(url, '_blank', 'noopener');
    } else if (kind === 'local') {
      const r = await FileStore.get(id); if (r) window.open(URL.createObjectURL(r.blob), '_blank');
    }
  },
  'ch-files-edit': () => { if (App._chFiles) { App._chFiles.editing = !App._chFiles.editing; renderChapterFilesModal(); } },
  'modal-back': () => modalBack(),
  'ch-file-folder': el => { if (App._chFiles) { App._chFiles.folder = el.dataset.f || ''; renderChapterFilesModal(); } },
  'ch-files-bulk': el => {
    const st = App._chFiles; if (!st) return;
    const target = _chFilesTarget(); if (!target) return;
    target.files = Array.isArray(target.files) ? target.files : [];
    const q = st.q.trim().toLowerCase();
    const isLinked = (kind, id) => target.files.some(x => x.kind === kind && x.id === id);
    const filtered = st.rows.filter(r => {
      if (st.folder === '__checked__' && !isLinked(r.kind, r.id)) return false;
      else if (st.folder === '__none__' && r.folder) return false;
      else if (st.folder && st.folder !== '__checked__' && st.folder !== '__none__' && r.folder !== st.folder) return false;
      if (q && !r.name.toLowerCase().includes(q) && !r.folder.toLowerCase().includes(q)) return false;
      return true;
    });
    if (el.dataset.v === '1') {
      filtered.forEach(r => { if (!isLinked(r.kind, r.id)) target.files.push({ kind: r.kind, id: r.id, name: r.name || 'ไฟล์' }); });
    } else {
      const rm = new Set(filtered.map(r => `${r.kind}:${r.id}`));
      target.files = target.files.filter(x => !rm.has(`${x.kind}:${x.id}`));
    }
    save(); renderChapterFilesModal();
  },
  'toggle-chapter': el => { setChapterDone(el.dataset.sid, el.dataset.id, el.checked); save(); },
  'add-chapters': el => openModal('+ เพิ่มบท/หัวข้อ', `<form data-form="chapters" data-sid="${el.dataset.sid}">
      <label class="field">บรรทัดละ 1 บท<textarea name="list" rows="6" placeholder="Ch1 ...&#10;Ch2 ..."></textarea></label>
      <p class="muted small">หรือสร้างอัตโนมัติ:</p>
      <div class="row wrap"><input name="prefix" value="บทที่ " class="num-lg"><label class="inline">จำนวน <input name="count" type="number" min="0" max="100" class="num"> บท</label></div>
      <div class="row end"><button class="btn">เพิ่ม</button></div></form>`),
  'rename-chapter': el => {
    const s = subjectById(el.dataset.sid), c = s?.chapters.find(c => c.id === el.dataset.id);
    if (!c) return;
    const row = el.closest('.ch-row'), box = row?.querySelector('.grow');
    if (!box || box.querySelector('.ch-rename-inp')) return;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'ch-rename-inp';
    inp.maxLength = 200;
    inp.value = c.title;
    box.innerHTML = '';
    box.appendChild(inp);
    inp.focus();
    inp.select();
    let done = false;
    const finish = ok => {
      if (done) return;
      done = true;
      const v = inp.value.trim();
      if (ok && v && v !== c.title) {
        c.title = v;
        DB.plan.forEach(p => { if (p.chapterId === c.id) p.title = c.title; });
        save();
      } else {
        App.render();
      }
    };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    inp.addEventListener('blur', () => finish(true));
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

  // tasks & unified todo
  'open-pending': () => openPendingModal(),
  'new-term': () => openNewTermModal(),
  'del-term': () => openDeleteTermModal(),
  'del-term-confirm': () => {
    const names = allTermNames();
    const cur = (DB.term || 'เทอม 1').trim() || 'เทอม 1';
    const nextName = names.find(n => n !== cur);
    if (!nextName) return closeModal();
    const next = DB.terms?.[nextName] || { subjects: [], classes: [], plan: [], tasks: [] };
    DB.subjects = Array.isArray(next.subjects) ? next.subjects : [];
    DB.classes = Array.isArray(next.classes) ? next.classes : [];
    DB.plan = Array.isArray(next.plan) ? next.plan : [];
    DB.tasks = Array.isArray(next.tasks) ? next.tasks : [];
    if (DB.terms) { delete DB.terms[cur]; delete DB.terms[nextName]; }
    DB.term = nextName;
    App.todoSub = '';
    closeModal();
    save();
    App.toast(`ลบ "${cur}" แล้ว`);
  },
  'pick-term-preset': el => { const inp = document.getElementById('newTermName'); if (inp) { inp.value = el.dataset.v || ''; inp.focus(); } },
  'tag-colors': () => openTagColorsModal(),
  'tag-color-pick': el => {
    DB.prefs.tagColors = DB.prefs.tagColors || {};
    DB.prefs.tagColors[el.dataset.k] = safeColor(el.dataset.c);
    save(); openTagColorsModal({ push: false });
  },
  'tag-color-reset': () => {
    DB.prefs.tagColors = {};
    save(); openTagColorsModal({ push: false });
    App.toast('รีเซ็ตสีแท็กแล้ว');
  },
  'todo-filter': el => { App.todoSub = el.dataset.sid || ''; App.render(); },
  'gcal-sync': async () => {
    if (typeof GCal === 'undefined') return App.toast('ไม่พบโมดูล Google Calendar');
    try {
      App.toast('กำลังซิงก์กับ Google Calendar…', 10000);
      const r = await GCal.syncAll();
      App.render();
      App.toast(`ซิงก์ Google Calendar แล้ว (ส่งขึ้น ${r.pushed} · ดึงเข้า ${r.pulled} รายการ) ✓`, 4500);
    } catch (e) {
      App.toast(e.message || 'ซิงก์ Google Calendar ไม่สำเร็จ', 6000);
    }
  },
  'add-todo': el => openModal('+ สิ่งที่ต้องทำ', todoForm({ date: el.dataset.date, kind: el.dataset.kind })),
  'tt-mode': el => { App.ttView = el.dataset.m || ''; App.render(); },
  'agenda-day': el => { App.agendaDay = Number(el.dataset.d); App.render(); },
  'toggle-fab': () => {
    const m = document.getElementById('fabMenu'), b = document.getElementById('fabBtn');
    if (!m || !b) return;
    const open = m.hidden; m.hidden = !open;
    b.setAttribute('aria-expanded', String(open)); b.classList.toggle('open', open);
  },
  'fab-pick': el => {
    const m = document.getElementById('fabMenu'), b = document.getElementById('fabBtn');
    if (m) m.hidden = true;
    if (b) { b.setAttribute('aria-expanded', 'false'); b.classList.remove('open'); }
    const g = el.dataset.go;
    if (g === 'todo') openModal('+ สิ่งที่ต้องทำ', todoForm({ date: todayStr() }));
    else if (g === 'subject') openModal(`${ico('plus', 17)} เพิ่มวิชา`, subjectForm(), true);
    else if (g === 'timer') App.go('timer');
  },
  'todo-kind': el => {
    const k = el.dataset.k || 'homework';
    const inp = document.getElementById('todoKindInput'); if (inp) inp.value = k;
    el.closest('.pills')?.querySelectorAll('.pill').forEach(b => b.classList.toggle('active', b === el));
    const isPlan = k === 'plan';
    const tf = document.getElementById('todoTaskFields'); if (tf) tf.hidden = isPlan;
    const pf = document.getElementById('todoPlanFields'); if (pf) pf.hidden = !isPlan;
    const ew = document.getElementById('todoEndWrap'); if (ew) ew.hidden = !isPlan;
  },
  'add-task': el => openModal('+ งาน / กิจกรรม', taskForm({ date: el.dataset.date })),
  'edit-task': el => openModal('✎ แก้ไข', taskForm(DB.tasks.find(x => x.id === el.dataset.id))),
  'del-task': el => { DB.tasks = DB.tasks.filter(x => x.id !== el.dataset.id); save(); refreshDayModal(); },
  'toggle-task': el => { const x = DB.tasks.find(x => x.id === el.dataset.id); if (x) { x.done = el.checked; save(); refreshDayModal(); } },

  // calendar
  'cal-nav': el => { const [y, m] = App.calMonth.split('-').map(Number); const d = new Date(y, m - 1 + Number(el.dataset.dir), 1); App.calMonth = toDateStr(d).slice(0, 7); App.render(); },
  'cal-today': () => { App.calMonth = todayStr().slice(0, 7); App.render(); },
  'cal-day': (el, e) => { if (el.dataset.date && (!el.classList.contains('cal-cell') || e.target.closest('.cal-cell') === el)) { App._dayOpen = el.dataset.date; dayModal(el.dataset.date); } },

  // timer
  'timer-start': () => { Timer.start(); if (App.tab === 'home') document.getElementById('header').innerHTML = App.headerHTML(); },
  'timer-pause': () => { Timer.pause(); if (App.tab === 'home') document.getElementById('header').innerHTML = App.headerHTML(); },
  'timer-reset': () => { Timer.reset(); if (App.tab === 'home') document.getElementById('header').innerHTML = App.headerHTML(); },
  'smart-focus': el => {
    const sid = el.dataset.sid || '';
    if (sid) Timer.subjectId = sid;
    Timer.mode = 'work';
    Timer.remaining = null;
    Timer.start();
    App.render();
    App.toast(`เริ่มโฟกัส${sid ? ' ' + subjectName(sid) : ''} แล้ว 🔥`);
  },
  'go-timetable': () => { App.calView = 'timetable'; App.go('calendar'); },
  'timer-stoplog': () => Timer.stopAndLog(),
  'timer-skip': () => { Timer.mode = Timer.mode === 'work' ? 'short' : 'work'; Timer.reset(); App.render(); },
  'timer-mode': el => { Timer.setMode(el.dataset.mode || el.dataset.m || 'work'); App.render(); },
  'del-session': el => { DB.sessions = DB.sessions.filter(x => x.id !== el.dataset.id); save(); App.toast('ลบบันทึกเวลาแล้ว'); },
  'add-session': () => openModal(`${ico('plus', 17)} เพิ่มบันทึกเวลาอ่าน`, sessionForm()),
  'edit-session': el => {
    const x = DB.sessions.find(s => s.id === el.dataset.id);
    if (x) openModal(`${ico('edit', 17)} แก้ไขบันทึกเวลา`, sessionForm(x));
  },

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
  'file-tab': el => { App.fileTab = el.dataset.t || 'list'; App.filePickMode = false; App.fileDlMode = false; filesRender(); },
  'file-menu': el => {
    const pop = document.getElementById('fileMenuPop');
    const s = subjectById(App.filesSid);
    if (!pop || !s) return;
    const { kind, id, folder } = el.dataset;
    if (!pop.hidden && pop.dataset.for === `${kind}:${id}`) { pop.hidden = true; return; }
    const folders = s.folders || [];
    const folderSel = `<select class="folder-sel" data-chg="move-file-folder" data-kind="${kind}" data-id="${esc(id)}" aria-label="เลือกโฟลเดอร์">
      <option value="" ${!folder ? 'selected' : ''}>ไม่มีโฟลเดอร์</option>
      ${folders.map(fn => `<option value="${esc(fn)}" ${folder === fn ? 'selected' : ''}>📁 ${esc(fn)}</option>`).join('')}
    </select>`;
    let items = '';
    if (kind === 'local') {
      items = `<button type="button" class="file-menu-item" data-act="file-dl" data-id="${esc(id)}">⬇️ ดาวน์โหลด</button>
        ${Sync.user ? `<button type="button" class="file-menu-item" data-act="file-migrate" data-id="${esc(id)}">☁️ ย้ายขึ้น Drive</button>` : ''}
        <button type="button" class="file-menu-item danger" data-act="file-del" data-id="${esc(id)}">🗑️ ลบไฟล์</button>`;
    } else if (kind === 'drive') {
      items = `<button type="button" class="file-menu-item danger" data-act="file-drive-del" data-id="${esc(id)}">🗑️ ลบไฟล์</button>`;
    } else {
      items = `<button type="button" class="file-menu-item danger" data-act="link-del" data-id="${esc(id)}">🗑️ ลบลิงก์</button>`;
    }
    pop.dataset.for = `${kind}:${id}`;
    pop.innerHTML = `<label class="file-menu-folder"><span>📁 โฟลเดอร์</span>${folderSel}</label>${items}`;
    pop.hidden = false;
    const r = el.getBoundingClientRect();
    pop.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
    const popH = pop.offsetHeight || 150;
    if (window.innerHeight - r.bottom < popH + 12 && r.top > popH + 12) {
      pop.style.top = 'auto';
      pop.style.bottom = `${window.innerHeight - r.top + 4}px`;
    } else {
      pop.style.bottom = 'auto';
      pop.style.top = `${Math.max(8, Math.min(r.bottom + 4, window.innerHeight - popH - 8))}px`;
    }
  },
  'file-folder': el => { App.fileFolder = el.dataset.f || ''; App.fileSelectMode = false; App._dlSel = new Set(); filesRender(); },
  'file-select-toggle': () => { App.fileSelectMode = !App.fileSelectMode; if (!App.fileSelectMode) App._dlSel = new Set(); filesRender(); },
  'file-dl-all': async el => {
    const s = subjectById(App.filesSid); if (!s) return;
    const sel = App._dlSel || (App._dlSel = new Set());
    if (el.dataset.v === '0') { sel.clear(); return filesRender(); }
    const local = await FileStore.list(s.id).catch(() => []);
    const cur = App.fileFolder || '';
    const matchF = x => !cur ? true : cur === '__none__' ? !x.folder : x.folder === cur;
    (s.driveFiles || []).filter(f => f && safeDriveId(f.id) && matchF(f)).forEach(f => sel.add(`drive:${f.id}`));
    local.filter(f => f && !f.driveId && matchF(f)).forEach(f => sel.add(`local:${f.id}`));
    (s.links || []).filter(l => matchF(l)).forEach(l => sel.add(`link:${l.id}`));
    filesRender();
  },
  'file-batch-del': async () => {
    const s = subjectById(App.filesSid); if (!s) return;
    const keys = [...(App._dlSel || [])];
    if (!keys.length || !confirm(`ลบที่เลือก ${keys.length} รายการ?`)) return;
    for (const key of keys) {
      const [kind, id] = key.split(':');
      if (kind === 'local') await FileStore.del(id, s.id).catch(() => { });
      else if (kind === 'link') s.links = (s.links || []).filter(l => l.id !== id);
      else if (kind === 'drive') {
        try { if (Sync.user && typeof Drive !== 'undefined') await Drive.delete(id); } catch { }
        s.driveFiles = (s.driveFiles || []).filter(f => f.id !== id);
      }
    }
    App._dlSel = new Set(); App.fileSelectMode = false;
    save({ silent: true }); filesRender();
    App.toast(`ลบ ${keys.length} รายการแล้ว`);
  },
  'file-dl-run': async () => {
    const s = subjectById(App.filesSid); if (!s) return;
    const keys = [...(App._dlSel || [])].filter(k => k.startsWith('drive:') || k.startsWith('local:'));
    if (!keys.length) return;
    App.toast(`กำลังดาวน์โหลด ${keys.length} ไฟล์…`, 4000);
    const triggerA = (href, name) => {
      const a = document.createElement('a');
      a.href = href; a.download = name || 'file'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    };
    let driveToken = '';
    if (keys.some(k => k.startsWith('drive:')) && typeof Drive !== 'undefined') {
      try { driveToken = await Drive.ensureToken(); } catch { }
    }
    for (const key of keys) {
      const [kind, id] = key.split(':');
      if (kind === 'local') {
        const r = await FileStore.get(id);
        if (r) {
          const u = URL.createObjectURL(r.blob);
          triggerA(u, r.name);
          setTimeout(() => URL.revokeObjectURL(u), 5000);
        }
      } else if (kind === 'drive') {
        const df = (s.driveFiles || []).find(x => x.id === id);
        let ok = false;
        if (driveToken) {
          try {
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`, { headers: { Authorization: 'Bearer ' + driveToken } });
            if (res.ok) {
              const blob = await res.blob();
              const u = URL.createObjectURL(blob);
              triggerA(u, df?.name || 'file');
              setTimeout(() => URL.revokeObjectURL(u), 5000);
              ok = true;
            }
          } catch { }
        }
        if (!ok) window.open(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`, '_blank', 'noopener');
      }
      await new Promise(r => setTimeout(r, 300));
    }
    App.fileDlMode = false; App._dlSel = new Set(); filesRender();
  },
  'file-folder-add': el => {
    const s = subjectById(App.filesSid); if (!s) return;
    const chip = document.createElement('span');
    chip.className = 'folder-chip active';
    chip.innerHTML = '📁 <input type="text" class="folder-inline-inp" maxlength="40" placeholder="ชื่อโฟลเดอร์...">';
    el.replaceWith(chip);
    const inp = chip.querySelector('input');
    inp.focus();
    let done = false;
    const finish = ok => {
      if (done) return;
      done = true;
      const clean = inp.value.trim().slice(0, 40);
      if (ok && clean) {
        s.folders = s.folders || [];
        if (!s.folders.includes(clean)) s.folders.push(clean);
        App.fileFolder = clean;
        save({ silent: true });
      }
      filesRender();
    };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    inp.addEventListener('blur', () => finish(true));
  },
  'file-folder-del': async el => {
    const s = subjectById(App.filesSid); if (!s) return;
    const f = el.dataset.f;
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
      <button class="more-item" data-act="go" data-tab="calendar"><span>📅</span><b>ปฏิทิน</b><small class="muted">วันสอบ &amp; งาน</small></button>
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
  'copy-ai-prompt': () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(AI_IMPORT_PROMPT).then(() => App.toast('คัดลอก Prompt แล้ว 📋')).catch(() => App.toast('คัดลอกไม่สำเร็จ'));
    } else {
      App.toast('เบราว์เซอร์ไม่รองรับการคัดลอกอัตโนมัติ');
    }
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
    const rows = [...f.querySelectorAll('.subj-class-row')];
    const parsedSlots = [];
    for (const row of rows) {
      const day = Number(row.querySelector('[name=clsDay]')?.value ?? 1);
      const start = row.querySelector('[name=clsStart]')?.value || '';
      const end = row.querySelector('[name=clsEnd]')?.value || '';
      const room = (row.querySelector('[name=clsRoom]')?.value || '').trim().slice(0, 60);
      if (!start) continue;
      if (end && end <= start) return App.toast('เวลาเลิกเรียนต้องหลังเวลาเริ่มนะ');
      parsedSlots.push({ cid: row.dataset.cid || uid(), day, start, end, room });
    }
    let s = subjectById(f.dataset.id);
    if (!s) {
      s = { id: uid(), chapters: [] }; DB.subjects.push(s);
      (d.chapters || '').split('\n').map(x => x.trim()).filter(Boolean).forEach(title => s.chapters.push({ id: uid(), title: title.slice(0, 200), done: false, note: '' }));
    }
    Object.assign(s, { name: name.slice(0, 120), examDate: d.examDate || '', examTime: d.examTime || '', room: (d.room || '').trim().slice(0, 80), color });
    const newSlots = parsedSlots.map(sl => ({ id: sl.cid, subjectId: s.id, title: s.name, day: sl.day, start: sl.start, end: sl.end, room: sl.room, color }));
    const existingMatched = (DB.classes || []).filter(c => !c.subjectId && subjectMatchesName(s, c.title)).map(c => ({ ...c, subjectId: s.id, title: s.name, color }));
    DB.classes = (DB.classes || []).filter(c => c.subjectId !== s.id && !(!c.subjectId && subjectMatchesName(s, c.title))).concat(newSlots, existingMatched);
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
  'new-term'(d) {
    const nm = (d.termName || '').trim().slice(0, 40);
    if (!nm) return App.toast('ใส่ชื่อเทอมก่อนนะ');
    closeModal();
    switchTerm(nm);
  },
  todo(d, f) {
    const kind = d.todoKind || 'homework';
    if (kind === 'plan') {
      return Forms.plan({ subjectId: d.subjectId, chapterId: d.chapterId, title: d.planTitle || '', date: d.date, time: d.time, endTime: d.endTime, remind: d.remind }, f);
    }
    return Forms.task({ title: d.taskTitle || '', type: kind === 'event' ? 'event' : 'homework', date: d.date, time: d.time, subjectId: d.subjectId, remind: d.remind }, f);
  },
  'quick-todo'(d) {
    const title = (d.title || '').trim();
    if (!title) return App.toast('พิมพ์ชื่องานก่อนนะ');
    DB.tasks.push({ id: uid(), title: title.slice(0, 200), type: 'homework', date: todayStr(), time: '', subjectId: '', remind: false, done: false });
    save();
    App.toast('เพิ่มใน Today list แล้ว ✓');
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
    if (d.time && d.endTime && d.endTime <= d.time) return App.toast('เวลาสิ้นสุดต้องหลังเวลาเริ่มนะ');
    let p = DB.plan.find(x => x.id === f.dataset.id);
    if (!p) { p = { id: uid(), done: false }; DB.plan.push(p); }
    Object.assign(p, { subjectId: d.subjectId, chapterId: c ? c.id : null, title, date: d.date, time: d.time || '', endTime: d.endTime || '', remind: !!d.remind, kind: c ? 'read' : 'custom', auto: false });
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
    let sid = d.subjectId || '';
    if (!sid && title) {
      let sub = DB.subjects.find(s => subjectMatchesName(s, title));
      if (!sub) {
        sub = { id: uid(), name: title.slice(0, 120), examDate: '', examTime: '', room: '', color: pickedColor, chapters: [] };
        DB.subjects.push(sub);
      }
      sid = sub.id;
    }
    if (sid) {
      const sub = subjectById(sid);
      if (sub) sub.color = pickedColor;
      DB.classes.forEach(x => { if (x.subjectId === sid) x.color = pickedColor; });
    }
    Object.assign(c, {
      day: Number(d.day), start: d.start || '08:30', end: d.end || '',
      subjectId: sid, title: title.slice(0, 120), room: (d.room || '').trim().slice(0, 80),
      color: pickedColor,
    });
    closeModal(); save();
  },
  note(d, f) {
    const s = subjectById(f.dataset.sid), c = s.chapters.find(c => c.id === f.dataset.id);
    c.note = d.note; save(); App.toast('บันทึกโน้ตแล้ว 📝');
  },
  session(d, f) {
    const m = Math.round(Number(d.minutes));
    if (!(m > 0) || m > 1440) return App.toast('ใส่เวลา 1–1440 นาทีนะ');
    if (d.date && !examYearOk(d.date)) return App.toast('วันที่ควรอยู่ระหว่างปีที่แล้วถึงอีก 5 ปีนะ');
    const existing = f?.dataset?.id ? DB.sessions.find(x => x.id === f.dataset.id) : null;
    if (existing) {
      Object.assign(existing, { subjectId: d.subjectId || '', minutes: m, date: d.date || todayStr() });
      closeModal(); save(); App.toast('แก้ไขบันทึกแล้ว');
      return;
    }
    if (!logSession(d.subjectId, m, d.date)) return App.toast('ใส่เวลา 1–1440 นาทีนะ');
    if (f?.dataset?.id !== undefined) closeModal();
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
    const parsed = normalizeLink(d.url);
    if (parsed.error) { if (err) { err.hidden = false; err.textContent = parsed.error; } else App.toast(parsed.error); return; }
    let autoTitle = (d.title || '').trim();
    if (!autoTitle) {
      try {
        const u = new URL(parsed.url);
        const host = u.hostname.replace(/^www\./, '');
        const seg = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || '');
        autoTitle = seg && seg.length <= 40 && !/^(view|edit|open|file|d)$/i.test(seg) ? `${host} · ${seg}` : host;
      } catch { autoTitle = 'ลิงก์เอกสาร'; }
    }
    s.links = s.links || [];
    const folder = App.fileFolder && App.fileFolder !== '__none__' ? App.fileFolder : '';
    s.links.unshift({ id: uid(), title: autoTitle, url: parsed.url, folder, addedAt: Date.now() });
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
  'home-stat-week': el => { App.statWeek = el.value; App.render(); },
  'switch-term': el => { switchTerm(el.value); },
  'tag-color-custom': el => {
    DB.prefs.tagColors = DB.prefs.tagColors || {};
    DB.prefs.tagColors[el.dataset.k] = safeColor(el.value);
    save(); openTagColorsModal({ push: false });
  },
  'timer-subject': el => { Timer.subjectId = el.value; },
  'ai-sub': el => { App.aiSub = el.value; App.aiCh = ''; App.render(); },
  'ai-ch': el => { App.aiCh = el.value; },
  'plan-sub': el => { document.getElementById('planCh').innerHTML = planChapterOptions(el.value); },
  'custom-color': el => {
    el.form.querySelectorAll('input[name=color]').forEach(r => r.checked = false);
    const wrap = el.closest('.color-rgb');
    if (wrap) { wrap.style.setProperty('--c', el.value); wrap.classList.add('is-custom'); }
  },
  'be-hint': el => { const s = el.closest('.field')?.querySelector('small'); if (s && el.value) s.textContent = `(${fmtDateBE(el.value)})`; },
  'ai-model-select': el => {
    const c = aiCfg();
    if (el.value === '__custom__') { App._customModel = true; App.render(); return; }
    App._customModel = false;
    if (c.provider === 'gemini') c.geminiModel = el.value; else if (c.provider === 'deepseek') c.deepseekModel = el.value; else c.openaiModel = el.value;
    saveAICfg(); if (!DB.ai?.sync) App.render();
  },
  'chat-file': el => {
    const files = [...(el.files || [])];
    el.value = '';
    if (files.length) addChatFiles(files);
  },
  'upload-folder': el => { App.fileFolder = el.value || ''; filesRender(); },
  'toggle-chapter-file': el => {
    const target = _chFilesTarget(); if (!target) return;
    target.files = Array.isArray(target.files) ? target.files : [];
    const { kind, id, name } = el.dataset;
    if (el.checked) {
      if (!target.files.some(x => x.kind === kind && x.id === id)) target.files.push({ kind, id, name: name || 'ไฟล์' });
    } else {
      target.files = target.files.filter(x => !(x.kind === kind && x.id === id));
    }
    save();
  },
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
  'toggle-folder-file': async el => {
    const s = subjectById(App.filesSid); if (!s) return;
    const { kind, id } = el.dataset, folder = el.checked ? (App.fileFolder || '') : '';
    if (kind === 'drive') {
      const f = (s.driveFiles || []).find(x => x.id === id);
      if (f) { f.folder = folder; save({ silent: true }); }
    } else if (kind === 'link') {
      const l = (s.links || []).find(x => x.id === id);
      if (l) { l.folder = folder; save({ silent: true }); }
    } else if (kind === 'local') {
      await FileStore.setFolder(id, folder);
    }
    filesRender();
  },
  'dl-pick': el => {
    const sel = App._dlSel || (App._dlSel = new Set());
    if (el.checked) sel.add(el.dataset.key); else sel.delete(el.dataset.key);
    filesRender();
  },
  'batch-move-folder': async el => {
    const folder = el.value;
    if (folder === '__pick__') return;
    const s = subjectById(App.filesSid); if (!s) return;
    const keys = [...(App._dlSel || [])];
    for (const key of keys) {
      const [kind, id] = key.split(':');
      if (kind === 'drive') {
        const f = (s.driveFiles || []).find(x => x.id === id);
        if (f) f.folder = folder;
      } else if (kind === 'link') {
        const l = (s.links || []).find(x => x.id === id);
        if (l) l.folder = folder;
      } else if (kind === 'local') {
        await FileStore.setFolder(id, folder);
      }
    }
    App._dlSel = new Set(); App.fileSelectMode = false;
    save({ silent: true }); filesRender();
    App.toast(folder ? `ย้าย ${keys.length} รายการเข้า "${folder}" แล้ว` : `นำ ${keys.length} รายการออกจากโฟลเดอร์แล้ว`);
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
      const isEmpty = !DB.subjects.length && !DB.tasks.length && !DB.classes.length;
      if (!isEmpty && !confirm('นำเข้าข้อมูลนี้แทนข้อมูลปัจจุบัน?')) return;
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

function calHoverHTML(iso) {
  const exams = DB.subjects.filter(s => s.examDate === iso);
  const tasks = DB.tasks.filter(x => x.date === iso);
  const plan = planForDate(iso);
  const cls = classesOnDate(iso);
  const rows = [];
  exams.forEach(s => rows.push(`<div class="cht-row"><span class="cht-tag cht-exam">สอบ</span><span><b>${esc(s.name)}</b>${s.examTime ? ` · ${esc(s.examTime)}` : ''}</span></div>`));
  cls.forEach(c => rows.push(`<div class="cht-row"><span class="cht-tag cht-cls" style="--c:${classColor(c)}">เรียน</span><span>${esc(c.start)} ${esc(className(c))}</span></div>`));
  plan.forEach(p => rows.push(`<div class="cht-row ${p.done ? 'done' : ''}"><span class="cht-tag cht-plan">อ่าน</span><span>${p.time ? `${esc(p.time)} ` : ''}${esc(p.title)}${p.subjectId ? ` <small class="muted">· ${esc(subjectName(p.subjectId))}</small>` : ''}</span></div>`));
  tasks.forEach(x => rows.push(`<div class="cht-row ${x.done ? 'done' : ''}"><span class="cht-tag ${x.type === 'event' ? 'cht-ev' : 'cht-hw'}">${x.type === 'event' ? 'กิจกรรม' : 'งาน'}</span><span>${x.time ? `${esc(x.time)} ` : ''}${esc(x.title)}</span></div>`));
  return `<div class="cht-hd">${fmtDateLong(iso)}</div>${rows.length ? rows.join('') : '<div class="muted small">ไม่มีกิจกรรมในวันนี้</div>'}`;
}

function bindEvents() {
  const modalBody = document.getElementById('modalBody');
  const fileMenuPop = document.createElement('div');
  fileMenuPop.id = 'fileMenuPop';
  fileMenuPop.className = 'file-menu-pop';
  fileMenuPop.hidden = true;
  document.body.appendChild(fileMenuPop);
  document.addEventListener('click', e => {
    if (!fileMenuPop.hidden && !e.target.closest('#fileMenuPop') && !e.target.closest('[data-act="file-menu"]')) {
      fileMenuPop.hidden = true;
    }
    if (!fileMenuPop.hidden && e.target.closest('#fileMenuPop .file-menu-item')) {
      setTimeout(() => { fileMenuPop.hidden = true; }, 0);
    }
  });
  modalBody?.addEventListener('scroll', () => { fileMenuPop.hidden = true; }, { passive: true });
  const tip = document.createElement('div');
  tip.id = 'calHoverTip';
  tip.className = 'cal-hover-tip';
  tip.hidden = true;
  document.body.appendChild(tip);
  let tipTarget = null;
  const hideTip = () => { tipTarget = null; tip.hidden = true; };
  document.addEventListener('mouseover', e => {
    const cell = e.target.closest('.mc-day[data-date], .cal-cell[data-date], .fc-pill[data-date]');
    if (!cell) return;
    if (tipTarget === cell && !tip.hidden) return;
    const iso = cell.dataset.date;
    if (!iso) return;
    tipTarget = cell;
    tip.innerHTML = calHoverHTML(iso);
    tip.hidden = false;
    const r = cell.getBoundingClientRect();
    const tw = tip.offsetWidth || 220, th = tip.offsetHeight || 80;
    const left = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2));
    const top = r.top - th - 8 >= 8 ? r.top - th - 8 : Math.min(window.innerHeight - th - 8, r.bottom + 8);
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  });
  document.addEventListener('mouseout', e => {
    if (!tipTarget) return;
    if (!e.relatedTarget || !tipTarget.contains(e.relatedTarget)) hideTip();
  });
  window.addEventListener('scroll', hideTip, { passive: true });
  document.addEventListener('click', hideTip);
  let dragCh = null;
  const clearChMarks = () => document.querySelectorAll('.ch-row.drag-over-top, .ch-row.drag-over-bot, .ch-row.dragging').forEach(el => el.classList.remove('drag-over-top', 'drag-over-bot', 'dragging'));
  document.addEventListener('pointerdown', e => {
    const h = e.target.closest('.ch-drag');
    const row = h?.closest('.ch-row');
    if (row) row.draggable = true;
  });
  document.addEventListener('dragstart', e => {
    const row = e.target.closest('.ch-row[draggable="true"]');
    if (!row) return;
    dragCh = { sid: row.dataset.sid, cid: row.dataset.cid };
    row.classList.add('dragging');
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragCh.cid); } catch { }
  });
  document.addEventListener('dragover', e => {
    if (!dragCh) return;
    const row = e.target.closest('.ch-row');
    if (!row || row.dataset.sid !== dragCh.sid || row.dataset.cid === dragCh.cid) return;
    e.preventDefault();
    const r = row.getBoundingClientRect();
    const before = e.clientY < r.top + r.height / 2;
    row.classList.toggle('drag-over-top', before);
    row.classList.toggle('drag-over-bot', !before);
  });
  document.addEventListener('dragleave', e => {
    const row = e.target.closest('.ch-row');
    if (row && (!e.relatedTarget || !row.contains(e.relatedTarget))) row.classList.remove('drag-over-top', 'drag-over-bot');
  });
  document.addEventListener('drop', e => {
    if (!dragCh) return;
    const row = e.target.closest('.ch-row');
    if (!row || row.dataset.sid !== dragCh.sid || row.dataset.cid === dragCh.cid) { clearChMarks(); dragCh = null; return; }
    e.preventDefault();
    const s = subjectById(dragCh.sid);
    if (s) {
      const from = s.chapters.findIndex(c => c.id === dragCh.cid);
      let to = s.chapters.findIndex(c => c.id === row.dataset.cid);
      const r = row.getBoundingClientRect();
      const after = e.clientY >= r.top + r.height / 2;
      if (from !== -1 && to !== -1) {
        const [moved] = s.chapters.splice(from, 1);
        if (from < to) to--;
        s.chapters.splice(after ? to + 1 : to, 0, moved);
        save();
      }
    }
    clearChMarks(); dragCh = null;
  });
  document.addEventListener('dragend', () => {
    document.querySelectorAll('.ch-row[draggable="true"]').forEach(r => { r.draggable = false; });
    clearChMarks(); dragCh = null;
  });
  modalBody.addEventListener('input', e => {
    if (e.target.id === 'chFileSearch' && App._chFiles) {
      const pos = e.target.selectionStart;
      App._chFiles.q = e.target.value;
      renderChapterFilesModal();
      const inp = document.getElementById('chFileSearch');
      if (inp) { inp.focus(); try { inp.setSelectionRange(pos, pos); } catch { } }
    }
  });
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
    hideTip();
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    if (el.tagName === 'SECTION' && e.target.closest('select, button, a, input, label')) return;
    const fn = Actions[el.dataset.act];
    if (fn) { if (el.tagName === 'BUTTON' || el.tagName === 'A') e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    const t24 = el.closest?.('.time24');
    if (t24) {
      const hs = t24.querySelector('.t24-h'), ms = t24.querySelector('.t24-m'), hid = t24.querySelector('input[type=hidden]');
      if (hs && ms && hid) {
        if (!hs.value) ms.value = '';
        else if (!ms.value) ms.value = '00';
        hid.value = hs.value && ms.value ? `${hs.value}:${ms.value}` : '';
        if (hid.dataset.bind) { setPath(DB, hid.dataset.bind, hid.value); save(); }
      }
    }
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
