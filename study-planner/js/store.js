/* ===== Data store & helpers ===== */
const LS_KEY = 'sp_data_v1';      // synced data
const LS_LOCAL = 'sp_local_v1';   // device-only data (API keys, firebase config)

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);

const defaultData = () => ({
  name: '',
  subjects: [],   // {id,name,color,examDate,examTime,room,chapters:[{id,title,done,doneAt,note}]}
  tasks: [],      // {id,title,date,time,subjectId,type:'homework'|'event',done}
  plan: [],       // {id,date,subjectId,chapterId,title,kind:'read'|'review'|'custom',done,auto}
  sessions: [],   // {id,subjectId,date,minutes,at}
  flashcards: [], // {id,subjectId,chapterId,q,a,known}
  prefs: {
    theme: 'navy', dark: false,
    chaptersPerDay: 3, reviewDayBefore: true,
    pomo: { work: 25, short: 5, long: 15, every: 4 },
    notify: false, notifyTime: '08:00',
  },
  ai: {
    sync: true, provider: 'gemini',
    geminiKey: '', geminiModel: 'gemini-3.8-flash',
    openaiKey: '', openaiModel: 'gpt-4o-mini',
  },
  updatedAt: 0,
});

const defaultLocal = () => ({
  aiProvider: 'gemini',
  geminiKey: '', geminiModel: 'gemini-3.8-flash',
  openaiKey: '', openaiModel: 'gpt-4o-mini',
  firebaseConfig: '',
  lastNotify: {},
  chat: [],
});

function deepMerge(a, b) {
  for (const k in b) {
    const av = a[k], bv = b[k];
    if (bv && typeof bv === 'object' && !Array.isArray(bv) && av && typeof av === 'object' && !Array.isArray(av)) a[k] = deepMerge(av, bv);
    else a[k] = bv;
  }
  return a;
}
function loadLS(key, def) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ? deepMerge(def(), v) : def(); }
  catch { return def(); }
}

let DB = loadLS(LS_KEY, defaultData);
let LOCAL = loadLS(LS_LOCAL, defaultLocal);
if (DB.ai?.sync && !DB.ai.geminiKey && !DB.ai.openaiKey && (LOCAL.geminiKey || LOCAL.openaiKey)) {
  Object.assign(DB.ai, {
    provider: LOCAL.aiProvider || 'gemini',
    geminiKey: LOCAL.geminiKey || '', geminiModel: LOCAL.geminiModel || 'gemini-3.8-flash',
    openaiKey: LOCAL.openaiKey || '', openaiModel: LOCAL.openaiModel || 'gpt-4o-mini',
  });
}
function aiCfg() {
  if (DB.ai?.sync) return DB.ai;
  return {
    get provider() { return LOCAL.aiProvider; }, set provider(v) { LOCAL.aiProvider = v; },
    get geminiKey() { return LOCAL.geminiKey; }, set geminiKey(v) { LOCAL.geminiKey = v; },
    get geminiModel() { return LOCAL.geminiModel; }, set geminiModel(v) { LOCAL.geminiModel = v; },
    get openaiKey() { return LOCAL.openaiKey; }, set openaiKey(v) { LOCAL.openaiKey = v; },
    get openaiModel() { return LOCAL.openaiModel; }, set openaiModel(v) { LOCAL.openaiModel = v; },
  };
}
function saveAICfg() { DB.ai?.sync ? save() : saveLocal(); }
const changeListeners = [];

function save(opts = {}) {
  if (!opts.fromRemote) DB.updatedAt = Date.now();
  localStorage.setItem(LS_KEY, JSON.stringify(DB));
  if (!opts.fromRemote && typeof Sync !== 'undefined') Sync.push();
  if (!opts.silent) changeListeners.forEach(f => f());
}
function saveLocal() { localStorage.setItem(LS_LOCAL, JSON.stringify(LOCAL)); }
function replaceDB(data, fromRemote) {
  DB = deepMerge(defaultData(), data || {});
  save({ fromRemote });
}

/* ===== Date helpers (local YYYY-MM-DD) ===== */
const pad = n => String(n).padStart(2, '0');
const toDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const todayStr = () => toDateStr(new Date());
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return toDateStr(d); };
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const TH_MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const TH_DAYS_FULL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const fmtDate = s => { if (!s) return '-'; const d = parseDate(s); return `${d.getDate()} ${TH_MONTHS[d.getMonth()]}`; };
const fmtDateBE = s => { if (!s) return '-'; const d = parseDate(s); return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`; };
const fmtDateLong = s => { const d = parseDate(s); return `${TH_DAYS_FULL[d.getDay()]} ${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`; };
const weekStart = s => { const d = parseDate(s); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return toDateStr(d); }; // Monday

/* ===== Misc helpers ===== */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const subjectById = id => DB.subjects.find(s => s.id === id);
const subjectColor = id => (subjectById(id) || {}).color || '#bbb';
const subjectName = id => (subjectById(id) || {}).name || 'ทั่วไป';
const SUBJECT_COLORS = ['#ec6a9c', '#9b7ede', '#4a9be8', '#3fb68b', '#f0a04b', '#e85d5d', '#5cc5c5', '#c77dd1', '#8a9a5b', '#f27fb2'];

function subjectProgress(s) {
  const total = s.chapters.length, done = s.chapters.filter(c => c.done).length;
  return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
}
function upcomingExams() {
  const t = todayStr();
  return DB.subjects.filter(s => s.examDate && s.examDate >= t).sort((a, b) => (a.examDate + (a.examTime || '')).localeCompare(b.examDate + (b.examTime || '')));
}
function minutesOn(date, subjectId) {
  return DB.sessions.filter(x => x.date === date && (!subjectId || x.subjectId === subjectId)).reduce((a, x) => a + x.minutes, 0);
}
function fmtMin(m) { const h = Math.floor(m / 60), mm = m % 60; return h ? `${h} ชม. ${mm ? mm + ' น.' : ''}` : `${mm} นาที`; }

/* set chapter done & keep plan in sync */
function setChapterDone(subjectId, chapterId, done) {
  const s = subjectById(subjectId); if (!s) return;
  const c = s.chapters.find(c => c.id === chapterId); if (!c) return;
  c.done = done; c.doneAt = done ? todayStr() : null;
  DB.plan.forEach(p => { if (p.chapterId === chapterId && p.kind === 'read') p.done = done; });
}

/* ===== IndexedDB file store per subject ===== */
const fmtSize = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

const FileStore = {
  _db: null,
  _counts: {},
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const req = indexedDB.open('sp_files_v1', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' }).createIndex('subjectId', 'subjectId');
        }
      };
      req.onsuccess = () => { this._db = req.result; res(this._db); };
      req.onerror = () => rej(req.error);
    });
  },
  async _tx(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction('files', mode);
      const out = fn(tx.objectStore('files'));
      tx.oncomplete = () => res(out.result);
      tx.onerror = () => rej(tx.error);
    });
  },
  async refreshCounts() {
    const all = await this._tx('readonly', s => s.getAll());
    const c = {};
    (all || []).forEach(f => { c[f.subjectId] = (c[f.subjectId] || 0) + 1; });
    this._counts = c;
    return c;
  },
  count(sid) {
    const sub = subjectById(sid);
    return (this._counts[sid] || 0) + ((sub?.links || []).length);
  },
  async list(sid) {
    const list = await this._tx('readonly', s => s.index('subjectId').getAll(sid));
    return (list || []).sort((a, b) => b.addedAt - a.addedAt);
  },
  async add(sid, file) {
    const rec = { id: uid(), subjectId: sid, name: file.name, type: file.type || '', size: file.size || 0, blob: file, addedAt: Date.now() };
    await this._tx('readwrite', s => s.put(rec));
    this._counts[sid] = (this._counts[sid] || 0) + 1;
    return rec;
  },
  async get(id) { return this._tx('readonly', s => s.get(id)); },
  async del(id, sid) {
    await this._tx('readwrite', s => s.delete(id));
    if (sid && this._counts[sid]) this._counts[sid]--;
  },
  async delSubject(sid) {
    const list = await this.list(sid);
    if (!list.length) return;
    await this._tx('readwrite', s => { list.forEach(f => s.delete(f.id)); return {}; });
    delete this._counts[sid];
  },
};

function loadDemoData() {
  const t = todayStr();
  const s1 = { id: uid(), name: '5500111 EXP ENG I', color: '#9b7ede', examDate: addDays(t, 6), examTime: '08:30', room: '301', chapters: ['Essay Structure & Thesis', 'Academic Vocabulary', 'Reading Comprehension', 'Grammar Review', 'Mock Test'].map((c, i) => ({ id: uid(), title: c, done: i < 2, doneAt: i < 2 ? addDays(t, -2 + i) : null, note: i === 0 ? 'Topic sentence ต้องชัด + มี supporting details 2-3 ข้อ' : '' })) };
  const s2 = { id: uid(), name: '2301119 CAL BUS', color: '#3fb68b', examDate: addDays(t, 8), examTime: '08:30', room: '204', chapters: ['Limits & Continuity', 'Derivatives & Rules', 'Optimization Problems', 'Marginal Analysis', 'Integrals'].map((c, i) => ({ id: uid(), title: c, done: i === 0, doneAt: i === 0 ? addDays(t, -1) : null, note: '' })) };
  const s3 = { id: uid(), name: '2900112 ECONOMICS II', color: '#f0a04b', examDate: addDays(t, 10), examTime: '08:30', room: '110', chapters: ['GDP & National Income', 'Inflation & Unemployment', 'Fiscal Policy', 'Monetary Policy', 'International Trade'].map(c => ({ id: uid(), title: c, done: false, doneAt: null, note: '' })) };
  const s4 = { id: uid(), name: '2601113 PRIN ACCTG', color: '#4a9be8', examDate: addDays(t, 14), examTime: '08:30', room: '', chapters: ['Accounting Equation', 'Journal & Ledger', 'Adjusting Entries', 'Financial Statements', 'Cash Flow'].map(c => ({ id: uid(), title: c, done: false, doneAt: null, note: '' })) };
  DB.subjects = [s1, s2, s3, s4];
  DB.tasks = [
    { id: uid(), title: 'ส่งแบบฝึกหัด Cal บท 2', date: addDays(t, 1), time: '16:00', subjectId: s2.id, type: 'homework', done: false },
    { id: uid(), title: 'ติวกลุ่ม Economics II', date: addDays(t, 3), time: '14:00', subjectId: s3.id, type: 'event', done: false },
  ];
  DB.sessions = [
    { id: uid(), subjectId: s1.id, date: addDays(t, -10), minutes: 50, at: Date.now() - 864000000 },
    { id: uid(), subjectId: s2.id, date: addDays(t, -8), minutes: 75, at: Date.now() - 691200000 },
    { id: uid(), subjectId: s3.id, date: addDays(t, -5), minutes: 60, at: Date.now() - 432000000 },
    { id: uid(), subjectId: s1.id, date: addDays(t, -2), minutes: 90, at: Date.now() - 172800000 },
    { id: uid(), subjectId: s2.id, date: addDays(t, -1), minutes: 60, at: Date.now() - 86400000 },
    { id: uid(), subjectId: s4.id, date: t, minutes: 45, at: Date.now() - 3600000 },
  ];
  DB.flashcards = [
    { id: uid(), subjectId: s3.id, chapterId: s3.chapters[0].id, q: 'GDP คืออะไร?', a: 'มูลค่าตลาดของสินค้าและบริการขั้นสุดท้ายทั้งหมดที่ผลิตในประเทศในช่วงเวลาหนึ่ง', known: false },
    { id: uid(), subjectId: s4.id, chapterId: s4.chapters[0].id, q: 'สมการบัญชีพื้นฐาน', a: 'สินทรัพย์ = หนี้สิน + ส่วนของเจ้าของ (A = L + E)', known: true },
  ];
  autoSchedule();
  save();
}
