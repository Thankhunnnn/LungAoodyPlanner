/* ===== Notifications ===== */
const Notifier = {
  supported() { return 'Notification' in window; },
  async ask() {
    if (!this.supported()) return false;
    if (Notification.permission === 'default') { try { await Notification.requestPermission(); } catch { } }
    return Notification.permission === 'granted';
  },
  async show(title, body) {
    if (!this.supported() || Notification.permission !== 'granted') { App.toast(`${title} — ${body}`, 6000); return; }
    try {
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg) { await reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: title }); return; }
    } catch { }
    try { new Notification(title, { body, icon: 'icon-192.png' }); } catch { App.toast(`${title} — ${body}`, 6000); }
  },
  dailyText() {
    const t = todayStr(), tm = addDays(t, 1);
    const parts = [];
    const items = planForDate(t).filter(p => !p.done);
    parts.push(items.length ? items.map(p => `• ${subjectName(p.subjectId)}: ${p.title}`).join('\n') : 'วันนี้ไม่มีแผนอ่าน 🎉');
    DB.subjects.filter(s => s.examDate === t).forEach(s => parts.push(`🎯 วันนี้สอบ ${s.name} ${s.examTime || ''} สู้ๆ!`));
    DB.subjects.filter(s => s.examDate === tm).forEach(s => parts.push(`⚠️ พรุ่งนี้สอบ ${s.name}`));
    DB.tasks.filter(x => !x.done && (x.date === t || x.date === tm)).forEach(x => parts.push(`📝 ${x.title} (${x.date === t ? 'วันนี้' : 'พรุ่งนี้'})`));
    return parts.join('\n');
  },
  check() {
    const t = todayStr(), now = new Date();
    const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (DB.prefs.notify && hm >= (DB.prefs.notifyTime || '08:00') && LOCAL.lastNotify.daily !== t) {
      LOCAL.lastNotify.daily = t; saveLocal();
      this.show('วันนี้ต้องอ่านอะไรบ้าง 📖', this.dailyText());
    }
    DB.plan.filter(p => !p.done && p.date === t && p.time && p.remind !== false && hm >= p.time).forEach(p => {
      const k = 'plan_' + p.id;
      if (LOCAL.lastNotify[k] === t) return;
      LOCAL.lastNotify[k] = t; saveLocal();
      this.show(`⏰ ถึงเวลาอ่าน ${subjectName(p.subjectId)}`, `${p.title} (${p.time})`);
    });
    DB.tasks.filter(x => !x.done && x.date === t && x.time && x.remind !== false && hm >= x.time).forEach(x => {
      const k = 'task_' + x.id;
      if (LOCAL.lastNotify[k] === t) return;
      LOCAL.lastNotify[k] = t; saveLocal();
      this.show(`⏰ ถึงเวลางาน: ${x.title}`, `${x.subjectId ? subjectName(x.subjectId) + ' · ' : ''}${x.time}`);
    });
  },
  start() { this.check(); setInterval(() => this.check(), 30000); },
};

/* ===== Pomodoro timer ===== */
const Timer = {
  mode: 'work', endAt: 0, remaining: null, running: false, round: 0, subjectId: '', startedAt: 0,
  dur(m = this.mode) { const p = DB.prefs.pomo; return (m === 'work' ? p.work : m === 'short' ? p.short : p.long) * 60; },
  left() { return this.running ? Math.max(0, Math.round((this.endAt - Date.now()) / 1000)) : (this.remaining ?? this.dur()); },
  elapsedMin() { return Math.floor((this.dur() - this.left()) / 60); },
  start() {
    if (this.running) return;
    if (this.remaining == null) this.startedAt = Date.now();
    this.endAt = Date.now() + this.left() * 1000; this.running = true; Notifier.ask(); App.renderTimerBits();
  },
  pause() { if (!this.running) return; this.remaining = this.left(); this.running = false; App.renderTimerBits(); },
  reset() { this.running = false; this.remaining = null; App.renderTimerBits(); },
  setMode(m) { this.mode = m; this.reset(); },
  stopAndLog() {
    const m = this.mode === 'work' ? this.elapsedMin() : 0;
    if (m >= 1) { logSession(this.subjectId, m); App.toast(`บันทึก ${m} นาทีแล้ว 👍`); }
    else App.toast('ยังไม่ถึง 1 นาที ไม่ได้บันทึกนะ');
    this.reset();
  },
  finish() {
    this.running = false; this.remaining = null; beep();
    if (this.mode === 'work') {
      logSession(this.subjectId, DB.prefs.pomo.work);
      this.round++;
      this.mode = this.round % (DB.prefs.pomo.every || 4) === 0 ? 'long' : 'short';
      Notifier.show('ครบเวลาโฟกัสแล้ว 🎉', `เก่งมาก! พัก ${this.dur() / 60} นาทีนะ`);
    } else {
      this.mode = 'work';
      Notifier.show('หมดเวลาพักแล้ว ⏰', 'กลับมาอ่านต่อกันเถอะ สู้ๆ');
    }
    App.render();
  },
  tick() { if (this.running && this.left() <= 0) this.finish(); App.renderTimerBits(); },
};
function logSession(subjectId, minutes, date = todayStr()) {
  const m = Math.round(Number(minutes));
  if (!(m > 0) || m > 1440) return false;
  DB.sessions.push({ id: uid(), subjectId: subjectId || '', date, minutes: m, at: Date.now() });
  save();
  return true;
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.2, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
  } catch { }
}
