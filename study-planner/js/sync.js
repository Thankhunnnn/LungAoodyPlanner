/* ===== Firebase sync (optional) ===== */
const FB_VER = '10.12.2';
const FB_SCRIPTS = ['app', 'auth', 'firestore'].map(n => `https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${n}-compat.js`);
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBn3XmeakcHhGDVz25-_f0ps17ypaOoBU0",
  authDomain: "buddy-4a1c4.firebaseapp.com",
  projectId: "buddy-4a1c4",
  storageBucket: "buddy-4a1c4.firebasestorage.app",
  messagingSenderId: "150965048225",
  appId: "1:150965048225:web:669c8ab65fc91a7170b1e0",
};

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('โหลด ' + src + ' ไม่ได้'));
    document.head.appendChild(s);
  });
}

function parseFirebaseConfig(str) {
  const m = str.match(/firebaseConfig\s*=\s*(\{[\s\S]*?\})/) || str.match(/(\{[\s\S]*\})/);
  if (!m) throw new Error('ไม่พบ { ... }');
  let j = m[1]
    .replace(/\/\/.*$/gm, '')
    .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
    .replace(/'/g, '"')
    .replace(/,\s*}/g, '}');
  const cfg = JSON.parse(j);
  if (!cfg.apiKey || !cfg.projectId) throw new Error('ต้องมี apiKey และ projectId');
  return cfg;
}

const Sync = {
  auth: null, db: null, user: null, ref: null, unsub: null, timer: null,
  status: 'off', message: '',

  setStatus(status, message = '') {
    this.status = status; this.message = message;
    const el = document.getElementById('syncBadge');
    if (el) el.outerHTML = App.syncBadgeHTML();
  },

  async init() {
    const str = (LOCAL.firebaseConfig || '').trim();
    if (location.protocol === 'file:') return this.setStatus('error', 'ต้องเปิดผ่าน http(s) ถึงจะล็อกอินได้ (ดู README)');
    let cfg = DEFAULT_FIREBASE_CONFIG;
    if (str) {
      try { cfg = parseFirebaseConfig(str); } catch (e) { return this.setStatus('error', 'Firebase config ไม่ถูกต้อง: ' + e.message); }
    }
    try {
      this.setStatus('loading');
      for (const s of FB_SCRIPTS) await loadScript(s);
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      try { this.db.enablePersistence({ synchronizeTabs: true }).catch(() => { }); } catch { }
      this.auth.getRedirectResult().catch(e => App.toast('ล็อกอินไม่สำเร็จ: ' + e.message));
      this.auth.onAuthStateChanged(u => {
        this.user = u;
        if (this.unsub) { this.unsub(); this.unsub = null; }
        if (u) this.listen(); else this.setStatus('signedout');
        App.render();
      });
    } catch (e) { this.setStatus('error', e.message); }
  },

  async login() {
    if (!this.auth) { App.toast('ยังไม่ได้ตั้งค่า Firebase'); return; }
    const p = new firebase.auth.GoogleAuthProvider();
    try { await this.auth.signInWithPopup(p); }
    catch (e) {
      if (/popup/i.test(e.code || '')) return this.auth.signInWithRedirect(p);
      App.toast('ล็อกอินไม่สำเร็จ: ' + e.message);
    }
  },
  logout() { if (this.auth) this.auth.signOut(); },

  listen() {
    this.ref = this.db.collection('users').doc(this.user.uid);
    this.setStatus('syncing');
    this.unsub = this.ref.onSnapshot(snap => {
      if (snap.metadata.hasPendingWrites) return;
      if (!snap.exists) { this.pushNow(); return; }
      const d = snap.data();
      if ((d.updatedAt || 0) > (DB.updatedAt || 0)) {
        try { replaceDB(sanitizeIncoming(JSON.parse(d.data)), true); } catch (e) { console.error(e); }
      } else if ((d.updatedAt || 0) < (DB.updatedAt || 0)) {
        this.pushNow(); return;
      }
      this.setStatus('synced');
    }, err => this.setStatus('error', err.message));
  },

  push() {
    if (!this.user || !this.ref) return;
    clearTimeout(this.timer);
    this.setStatus('syncing');
    this.timer = setTimeout(() => this.pushNow(), 800);
  },
  pushNow() {
    if (!this.ref) return;
    this.ref.set({ data: JSON.stringify(DB), updatedAt: DB.updatedAt || Date.now() })
      .then(() => this.setStatus('synced'))
      .catch(e => this.setStatus('error', e.message));
  },
};
