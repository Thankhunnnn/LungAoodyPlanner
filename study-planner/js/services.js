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
    DB.tasks.filter(x => {
      if (x.done || !x.date) return false;
      const dLeft = daysBetween(t, x.date);
      const lead = Math.max(0, Number(x.remindDays ?? 1));
      return dLeft >= 0 && dLeft <= lead;
    }).forEach(x => {
      const dLeft = daysBetween(t, x.date);
      const lbl = dLeft === 0 ? 'วันนี้' : dLeft === 1 ? 'พรุ่งนี้' : `อีก ${dLeft} วัน`;
      parts.push(`📝 ${x.title} (${x.type === 'event' ? lbl : `เดดไลน์${lbl}`}${x.time ? ' ' + x.time : ''})`);
    });
    DB.plan.filter(p => {
      if (p.done || !p.date || p.date === t) return false;
      const dLeft = daysBetween(t, p.date);
      const lead = Math.max(0, Number(p.remindDays ?? 1));
      return dLeft >= 1 && dLeft <= lead;
    }).forEach(p => {
      const dLeft = daysBetween(t, p.date);
      const lbl = dLeft === 1 ? 'พรุ่งนี้' : `อีก ${dLeft} วัน`;
      parts.push(`📖 ${subjectName(p.subjectId)}: ${p.title} (${lbl}${p.time ? ' ' + p.time : ''})`);
    });
    return parts.join('\n');
  },
  check() {
    const t = todayStr(), tm = addDays(t, 1), now = new Date();
    const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (DB.prefs.notify && hm >= (DB.prefs.notifyTime || '08:00') && LOCAL.lastNotify.daily !== t) {
      LOCAL.lastNotify.daily = t; saveLocal();
      this.show('วันนี้ต้องอ่านอะไรบ้าง 📖', this.dailyText());
    }
    // แจ้งเตือนล่วงหน้า: สอบ (1 วัน) + งาน/กิจกรรม/อ่านหนังสือ (ตามจำนวนวันก่อนหน้า)
    DB.subjects.filter(s => s.examDate === tm).forEach(s => {
      const k = 'eve_exam_' + s.id;
      if (LOCAL.lastNotify[k] === t) return;
      LOCAL.lastNotify[k] = t; saveLocal();
      this.show(`⚠️ พรุ่งนี้สอบ ${s.name}!`, `${fmtDateLong(s.examDate)}${s.examTime ? ' เวลา ' + s.examTime : ''}${s.room ? ' · ' + s.room : ''} เตรียมตัวให้พร้อมนะ 💪`);
    });
    DB.tasks.filter(x => !x.done && x.date && x.remind !== false).forEach(x => {
      const dLeft = daysBetween(t, x.date);
      const lead = Math.max(0, Number(x.remindDays ?? 1));
      if (lead <= 0 || dLeft < 1 || dLeft > lead) return;
      const k = `eve_task_${x.id}_${t}`;
      if (LOCAL.lastNotify[k] === t) return;
      LOCAL.lastNotify[k] = t; saveLocal();
      const isEv = x.type === 'event';
      const whenTxt = dLeft === 1 ? 'พรุ่งนี้' : `อีก ${dLeft} วัน`;
      this.show(
        isEv ? `⏰ ${whenTxt}มีกิจกรรม: ${x.title}` : `⏰ ${whenTxt}ถึงเดดไลน์: ${x.title}`,
        `${x.subjectId ? subjectName(x.subjectId) + ' · ' : ''}${isEv ? 'กิจกรรม' : 'เดดไลน์'} ${fmtDateLong(x.date)}${x.time ? ' ' + x.time : ''}`
      );
    });
    DB.plan.filter(p => !p.done && p.date && p.remind !== false).forEach(p => {
      const dLeft = daysBetween(t, p.date);
      const lead = Math.max(0, Number(p.remindDays ?? 1));
      if (lead <= 0 || dLeft < 1 || dLeft > lead) return;
      const k = `eve_plan_${p.id}_${t}`;
      if (LOCAL.lastNotify[k] === t) return;
      LOCAL.lastNotify[k] = t; saveLocal();
      const whenTxt = dLeft === 1 ? 'พรุ่งนี้' : `อีก ${dLeft} วัน`;
      this.show(
        `📖 ${whenTxt}มีแผนอ่าน: ${p.title}`,
        `${subjectName(p.subjectId)} · ${fmtDateLong(p.date)}${p.time ? ' ' + p.time : ''}`
      );
    });
    // แจ้งเตือนตรงเวลาวันนี้: ตารางอ่าน + งาน/กิจกรรม
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
      const isEv = x.type === 'event';
      this.show(`⏰ ${isEv ? 'ถึงเวลากิจกรรม' : 'ถึงเดดไลน์งาน'}: ${x.title}`, `${x.subjectId ? subjectName(x.subjectId) + ' · ' : ''}${isEv ? 'เวลา ' : 'เดดไลน์ '}${x.time}`);
    });
  },
  start() { this.check(); setInterval(() => this.check(), 30000); },
};

/* ===== Pomodoro timer ===== */
const Timer = {
  mode: 'work', flowMode: false, endAt: 0, remaining: null, flowElapsed: 0, running: false, round: 0, subjectId: '', startedAt: 0,
  dur(m = this.mode) { const p = DB.prefs.pomo; return (m === 'short' ? p.short : m === 'long' ? p.long : p.work) * 60; },
  left() {
    if (this.flowMode) return this.running ? this.flowElapsed + Math.max(0, Math.round((Date.now() - this.startedAt) / 1000)) : this.flowElapsed;
    return this.running ? Math.max(0, Math.round((this.endAt - Date.now()) / 1000)) : (this.remaining ?? this.dur());
  },
  elapsedMin() {
    if (this.flowMode) return Math.floor(this.left() / 60);
    return Math.floor((this.dur() - this.left()) / 60);
  },
  start() {
    if (this.running) return;
    if (this.flowMode) { this.startedAt = Date.now(); this.running = true; Notifier.ask(); App.renderTimerBits(); return; }
    if (this.remaining == null) this.startedAt = Date.now();
    this.endAt = Date.now() + this.left() * 1000; this.running = true; Notifier.ask(); App.renderTimerBits();
  },
  pause() {
    if (!this.running) return;
    if (this.flowMode) { this.flowElapsed = this.left(); this.running = false; App.renderTimerBits(); return; }
    this.remaining = this.left(); this.running = false; App.renderTimerBits();
  },
  reset() { this.running = false; this.remaining = null; this.flowElapsed = 0; App.renderTimerBits(); },
  setMode(m) { this.flowMode = false; this.mode = m; this.reset(); },
  setFlow(on) { this.flowMode = !!on; this.mode = 'work'; this.reset(); },
  stopAndLog(note = '') {
    const m = (this.flowMode || this.mode === 'work') ? this.elapsedMin() : 0;
    if (m >= 1) {
      logSession(this.subjectId, m, todayStr(), note);
      const brk = this.flowMode ? Math.max(5, Math.round(m / 5)) : 0;
      App.toast(brk ? `บันทึก ${m} นาทีแล้ว 👍 (แนะนำพัก ~${brk} นาที)` : `บันทึก ${m} นาทีแล้ว 👍`);
    }
    else App.toast('ยังไม่ถึง 1 นาที ไม่ได้บันทึกนะ');
    this.reset();
  },
  finish() {
    this.running = false; this.remaining = null;
    if (typeof ChimeAudio !== 'undefined') ChimeAudio.play(); else beep();
    if (this.mode === 'work') {
      logSession(this.subjectId, DB.prefs.pomo.work);
      this.round++;
      this.mode = this.round % (DB.prefs.pomo.every || 4) === 0 ? 'long' : 'short';
      Notifier.show('ครบเวลาโฟกัสแล้ว 🎉', `เก่งมาก! พัก ${this.dur() / 60} นาทีนะ`);
    } else {
      this.mode = 'work';
      Notifier.show('หมดเวลาพักแล้ว ⏰', 'กลับมาอ่านต่อกันเถอะ สู้ๆ');
    }
    if (DB.prefs?.autoStartTimer) {
      this.endAt = Date.now() + this.dur() * 1000;
      this.running = true;
    }
    App.render();
  },
  tick() { if (this.running && !this.flowMode && this.left() <= 0) this.finish(); App.renderTimerBits(); },
};
function logSession(subjectId, minutes, date = todayStr(), note = '') {
  const m = Math.round(Number(minutes));
  if (!(m > 0) || m > 1440) return false;
  DB.sessions.push({ id: uid(), subjectId: subjectId || '', date, minutes: m, note: String(note || '').trim().slice(0, 140), at: Date.now() });
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
