/* ===== LungAoodyPlanner Extended Features Module ===== */

/* 1. Ambient Sound Mixer (Web Audio API — zero external assets, works offline) */
const AmbientAudio = {
  ctx: null,
  nodes: {},
  masterGain: null,
  muted: false,
  vols: { rain: 0, cafe: 0, ocean: 0, brown: 0 },
  ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  },
  makeNoiseBuffer(ctx, type) {
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const out = buf.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'brown' || type === 'ocean') {
        last = (last + 0.02 * w) / 1.02;
        out[i] = last * 3.2;
      } else if (type === 'cafe' || type === 'rain') {
        b0 = 0.997 * b0 + w * 0.029;
        b1 = 0.985 * b1 + w * 0.032;
        b2 = 0.950 * b2 + w * 0.048;
        out[i] = (b0 + b1 + b2 + w * 0.02) * 1.4;
      } else {
        out[i] = w * 0.3;
      }
    }
    return buf;
  },
  startChannel(ch) {
    if (this.nodes[ch]) return this.nodes[ch];
    const ctx = this.ensureCtx();
    if (!ctx) return null;
    const src = ctx.createBufferSource();
    src.buffer = this.makeNoiseBuffer(ctx, ch);
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    const lp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    lp.type = 'lowpass';
    if (ch === 'rain') {
      hp.frequency.value = 600;
      lp.frequency.value = 3600;
    } else if (ch === 'cafe') {
      // Remove low airplane/engine rumble (< 280Hz) & harsh highs (> 2200Hz) for warm soft murmur
      hp.frequency.value = 300;
      lp.frequency.value = 1800;
    } else if (ch === 'ocean') {
      hp.frequency.value = 120;
      lp.frequency.value = 700;
    } else {
      // brown noise
      hp.frequency.value = 40;
      lp.frequency.value = 320;
    }
    const modGain = ctx.createGain();
    modGain.gain.value = 1;
    const volGain = ctx.createGain();
    volGain.gain.value = 0;
    src.connect(hp);
    hp.connect(lp);
    lp.connect(modGain);
    modGain.connect(volGain);
    volGain.connect(this.masterGain);
    src.start();
    let lfo = null, lfoGain = null;
    if (ch === 'ocean' || ch === 'cafe') {
      lfo = ctx.createOscillator();
      lfoGain = ctx.createGain();
      lfo.frequency.value = ch === 'ocean' ? 0.14 : 0.35;
      lfoGain.gain.value = ch === 'ocean' ? 0.42 : 0.16;
      lfo.connect(lfoGain);
      lfoGain.connect(modGain.gain);
      lfo.start();
    }
    this.nodes[ch] = { src, hp, lp, modGain, gain: volGain, lfo, lfoGain };
    return this.nodes[ch];
  },
  stopChannel(ch) {
    const n = this.nodes[ch];
    if (!n) return;
    try {
      if (this.ctx) n.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
      setTimeout(() => {
        try { n.src.stop(); } catch { }
        try { n.lfo?.stop(); } catch { }
        try { n.src.disconnect(); n.hp.disconnect(); n.lp.disconnect(); n.modGain.disconnect(); n.gain.disconnect(); n.lfo?.disconnect(); n.lfoGain?.disconnect(); } catch { }
      }, 90);
    } catch { }
    delete this.nodes[ch];
  },
  setVolume(ch, pct) {
    const v = Math.max(0, Math.min(100, Number(pct) || 0));
    this.vols[ch] = v;
    if (v <= 0) {
      this.stopChannel(ch);
      return;
    }
    const n = this.startChannel(ch);
    if (n && this.ctx) {
      const scale = ch === 'cafe' ? 0.24 : ch === 'rain' ? 0.28 : 0.32;
      n.gain.gain.setTargetAtTime((v / 100) * scale, this.ctx.currentTime, 0.06);
    }
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  },
  stopAll() {
    Object.keys(this.vols).forEach(k => this.setVolume(k, 0));
    document.querySelectorAll('[data-sound]').forEach(el => { el.value = '0'; });
  },
  anyActive() { return Object.values(this.vols).some(v => v > 0); },
};

/* 2. Custom Chime Sounds */
const ChimeAudio = {
  play(type) {
    const kind = type || DB.prefs.chime || 'bell';
    if (kind === 'silent') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const playTone = (freq, start, dur, wave = 'sine', vol = 0.22) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = wave; o.frequency.value = freq;
        o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(vol, now + start);
        g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        o.start(now + start); o.stop(now + start + dur);
      };
      if (kind === 'piano') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, i * 0.14, 0.55, 'triangle', 0.2));
      } else if (kind === 'digital') {
        [0, 0.18, 0.36].forEach(t => playTone(980, t, 0.12, 'square', 0.1));
      } else {
        // soft bell
        playTone(659.25, 0, 0.7, 'sine', 0.22);
        playTone(880, 0.22, 0.85, 'sine', 0.18);
      }
    } catch { }
  },
};

/* 3. Milestone Confetti Celebration */
function launchConfetti() {
  try {
    const cv = document.createElement('canvas');
    cv.className = 'confetti-canvas';
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const colors = ['#ec6a9c', '#4ea8ff', '#10b981', '#f59e0b', '#a855f7', '#fb7185'];
    const parts = [...Array(75)].map(() => ({
      x: Math.random() * cv.width,
      y: -15 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 5,
      vy: 2.5 + Math.random() * 4.2,
      sz: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    let frame = 0;
    const step = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz * 0.6);
        ctx.restore();
      });
      if (++frame < 110) requestAnimationFrame(step);
      else cv.remove();
    };
    requestAnimationFrame(step);
  } catch { }
}

/* 4. Multi-Step Undo History (up to 15 snapshots) */
const UndoStack = {
  items: [],
  max: 15,
  push(label = 'การแก้ไขล่าสุด') {
    try {
      const snap = JSON.stringify({
        subjects: DB.subjects,
        classes: DB.classes || [],
        plan: DB.plan,
        tasks: DB.tasks,
        sessions: DB.sessions,
      });
      this.items.push({ label, snap });
      if (this.items.length > this.max) this.items.shift();
    } catch { }
  },
  canUndo() { return this.items.length > 0; },
  lastLabel() { return this.items.length ? this.items[this.items.length - 1].label : ''; },
  undo() {
    if (!this.items.length) { App.toast('ไม่มีประวัติให้ย้อนกลับแล้ว'); return false; }
    const { label, snap } = this.items.pop();
    try {
      const d = JSON.parse(snap);
      DB.subjects = d.subjects || [];
      DB.classes = d.classes || [];
      DB.plan = d.plan || [];
      DB.tasks = d.tasks || [];
      DB.sessions = d.sessions || [];
      save();
      App.toast(`ย้อนกลับ "${label}" แล้ว ↩️`);
      return true;
    } catch { return false; }
  },
};

/* 5. Offline & Pending Sync Status */
const NetStatus = {
  online: navigator.onLine !== false,
  pending: 0,
  init() {
    window.addEventListener('online', () => {
      this.online = true;
      App.render();
      if (this.pending > 0 && typeof Sync !== 'undefined' && Sync.pushNow) {
        Sync.pushNow();
        this.pending = 0;
      }
      App.toast('กลับมาออนไลน์แล้ว ☁️');
    });
    window.addEventListener('offline', () => {
      this.online = false;
      App.render();
      App.toast('ออฟไลน์ — ข้อมูลจะเก็บในเครื่องและซิงก์เมื่อมีเน็ต');
    });
  },
  markPending() { if (!this.online) this.pending++; },
  clearPending() { this.pending = 0; },
};

/* 6. Custom Accent Color Wheel */
function applyCustomAccent() {
  const c = DB.prefs?.customAccent;
  if (c && /^#[0-9a-f]{6}$/i.test(c)) {
    document.documentElement.style.setProperty('--accent', c);
  } else {
    document.documentElement.style.removeProperty('--accent');
  }
}

/* 7. Dynamic Daily Goal (scales up within 7 days of an exam) */
function effectiveDailyGoalMin() {
  const base = Number(DB.prefs?.dailyGoalMin) || 180;
  if (!DB.prefs?.dynamicGoal) return { min: base, boosted: false };
  const t = todayStr();
  const near = (DB.subjects || []).some(s => s.examDate && daysBetween(t, s.examDate) >= 0 && daysBetween(t, s.examDate) <= 7);
  if (!near) return { min: base, boosted: false };
  const boosted = Number(DB.prefs?.examGoalMin) || Math.min(480, base + 90);
  return { min: Math.max(base, boosted), boosted: true };
}

/* 8. Idle / AFK Detection */
const IdleGuard = {
  lastAct: Date.now(),
  alerted: false,
  init() {
    const bump = () => { this.lastAct = Date.now(); this.alerted = false; };
    ['pointerdown', 'keydown', 'scroll'].forEach(ev => window.addEventListener(ev, bump, { passive: true }));
    setInterval(() => {
      if (DB.prefs?.idleAlert === false) return;
      if (typeof Timer === 'undefined' || !Timer.running) return;
      const idleMin = (Date.now() - this.lastAct) / 60000;
      if (idleMin >= 15 && !this.alerted && Timer.mode !== 'work') {
        this.alerted = true;
        ChimeAudio.play();
        App.toast('⏰ พักนานเกิน 15 นาทีแล้ว กลับมาลุยต่อหรือหยุดจับเวลาไหม?', 6000);
      }
    }, 60000);
  },
};

/* 9. Rest-Day / Holiday Blackout helpers */
function isBlackoutDate(iso) {
  return Array.isArray(DB.prefs?.blackoutDays) && DB.prefs.blackoutDays.includes(iso);
}
function toggleBlackoutDate(iso) {
  DB.prefs.blackoutDays = Array.isArray(DB.prefs.blackoutDays) ? DB.prefs.blackoutDays : [];
  const i = DB.prefs.blackoutDays.indexOf(iso);
  if (i >= 0) {
    DB.prefs.blackoutDays.splice(i, 1);
    save();
    App.toast(`ยกเลิกวันพัก ${fmtDateBE(iso)} แล้ว`);
    return false;
  }
  DB.prefs.blackoutDays.push(iso);
  save();
  App.toast(`ตั้งวันที่ ${fmtDateBE(iso)} เป็นวันพัก (Auto-Schedule จะข้ามวันนี้) 🌴`);
  return true;
}

/* 10. Spaced Repetition (1 / 3 / 7 days skipping blackout & capping before exam) */
function chapterReviews(subjectId, chapterId) {
  const t = todayStr();
  return DB.plan
    .filter(p => p.subjectId === subjectId && p.chapterId === chapterId && p.kind === 'review' && !p.done && p.date >= t)
    .sort((a, b) => a.date.localeCompare(b.date));
}
function scheduleSpacedReview(subjectId, chapterId, refreshModal = false) {
  const s = subjectById(subjectId);
  const c = s?.chapters.find(x => x.id === chapterId);
  if (!s || !c) return;
  const t = todayStr();
  const existing = chapterReviews(s.id, c.id);
  const intervals = [1, 3, 7];
  const addedDates = [];
  UndoStack.push(`นัดทวนบท ${c.title}`);
  intervals.forEach((off, idx) => {
    let d = addDays(t, off);
    let guard = 0;
    while (isBlackoutDate(d) && guard++ < 7) d = addDays(d, 1);
    if (s.examDate && d > s.examDate) return;
    const dup = DB.plan.some(p => p.subjectId === s.id && p.chapterId === c.id && p.date === d && !p.done);
    if (!dup) {
      DB.plan.push({
        id: uid(), date: d, subjectId: s.id, chapterId: c.id,
        title: `ทวนรอบที่ ${idx + 1}: ${c.title}`, kind: 'review', done: false, auto: false,
      });
      addedDates.push(fmtDate(d));
    }
  });
  save();
  if (addedDates.length) {
    App.toast(`นัดทวน "${c.title}" เพิ่ม ${addedDates.length} รอบ (${addedDates.join(', ')}) 🔁`, 4200);
  } else if (existing.length) {
    App.toast(`บทนี้มีนัดทวนครบแล้ว: ${existing.map(p => fmtDate(p.date)).join(', ')}`, 4000);
  } else if (s.examDate && s.examDate <= t) {
    App.toast('เลยวันสอบของวิชานี้แล้ว จึงไม่ได้นัดทวนเพิ่ม');
  } else {
    App.toast('ไม่สามารถเพิ่มรอบทวนได้ (วันสอบใกล้เกินไปหรือตรงวันพักทั้งหมด)');
  }
  if (refreshModal) refreshChapterSrBox(subjectId, chapterId);
}
function clearSpacedReview(subjectId, chapterId, refreshModal = false) {
  const s = subjectById(subjectId);
  const c = s?.chapters.find(x => x.id === chapterId);
  if (!s || !c) return;
  const before = DB.plan.length;
  UndoStack.push(`ยกเลิกนัดทวน ${c.title}`);
  DB.plan = DB.plan.filter(p => !(p.subjectId === s.id && p.chapterId === c.id && p.kind === 'review' && !p.done));
  const removed = before - DB.plan.length;
  save();
  App.toast(removed ? `ยกเลิกนัดทวน ${removed} รอบแล้ว` : 'ไม่มีนัดทวนที่ค้างอยู่');
  if (refreshModal) refreshChapterSrBox(subjectId, chapterId);
}
function chapterSrBoxHTML(subjectId, chapterId) {
  const revs = chapterReviews(subjectId, chapterId);
  return `
    <div class="row wrap" style="margin:0 0 6px;justify-content:space-between;align-items:center">
      <b>🔁 Spaced Repetition (นัดทบทวนซ้ำ)</b>
      <span class="chip ${revs.length ? 'ok' : ''}">${revs.length ? `กำลังทวน ${revs.length} รอบ` : 'ยังไม่ได้นัด'}</span>
    </div>
    ${revs.length
      ? `<div class="sr-dates">${revs.map((p, i) => `<span class="chip">รอบ ${i + 1}: ${fmtDateBE(p.date)}</span>`).join('')}</div>`
      : `<p class="muted small" style="margin:4px 0 8px">กดปุ่มด้านล่างเพื่อลงปฏิทินทบทวนอัตโนมัติในอีก +1, +3 และ +7 วัน (ไม่เกินวันสอบ)</p>`}
    <div class="row wrap" style="margin:8px 0 0;gap:6px">
      <button type="button" class="btn small ghost" data-act="spaced-review-modal" data-sid="${subjectId}" data-cid="${chapterId}">🔁 นัดทวน (+1/+3/+7 วัน)</button>
      ${revs.length ? `<button type="button" class="btn small danger" data-act="spaced-clear-modal" data-sid="${subjectId}" data-cid="${chapterId}">✕ ยกเลิกนัดทวน</button>` : ''}
    </div>`;
}
function refreshChapterSrBox(subjectId, chapterId) {
  const box = document.getElementById('chSrBox');
  if (box) box.innerHTML = chapterSrBoxHTML(subjectId, chapterId);
}
function openChapterEditModal(subjectId, chapterId, opts = {}) {
  const s = subjectById(subjectId);
  const c = s?.chapters.find(x => x.id === chapterId);
  if (!s || !c) return;
  const wt = Number(c.weight) || 0;
  const cf = Number(c.confidence) || 0;
  openModal(`✎ แก้ไขบท — ${esc(s.name)}`, `
    <form data-form="edit-chapter" data-sid="${s.id}" data-cid="${c.id}">
      <label class="field">ชื่อบท
        <input name="title" required maxlength="200" value="${esc(c.title)}">
      </label>
      <div class="grid2-sm">
        <label class="field">น้ำหนักออกสอบ
          <select name="weight">
            <option value="0" ${wt === 0 ? 'selected' : ''}>— ไม่ระบุ —</option>
            <option value="3" ${wt === 3 ? 'selected' : ''}>🔥 ออกเยอะ</option>
            <option value="2" ${wt === 2 ? 'selected' : ''}>⚡ ปานกลาง</option>
            <option value="1" ${wt === 1 ? 'selected' : ''}>• ออกน้อย</option>
          </select>
        </label>
        <label class="field">ระดับความมั่นใจ (1–5)
          <select name="confidence">
            ${CONF_LEVELS.map(([v, lbl]) => `<option value="${v}" ${cf === v ? 'selected' : ''}>${lbl}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="field">
        <span>โน้ตปักหมุด 1 บรรทัด (📌)</span>
        <div class="row" style="margin:0;gap:6px">
          <input id="editChPinInp" name="pin" maxlength="100" value="${esc(c.pin || '')}" placeholder="เช่น เน้นสูตรบท 3 หน้า 14">
          <button type="button" class="btn small danger" data-act="clear-pin-inp" title="ลบโน้ตปักหมุด">🗑️ ลบโน้ต</button>
        </div>
      </div>
      <div id="chSrBox" class="sr-box">${chapterSrBoxHTML(s.id, c.id)}</div>
      <div class="row end" style="margin-top:14px">
        <button type="button" class="btn ghost" data-act="close-modal">ยกเลิก</button>
        <button class="btn">💾 บันทึก</button>
      </div>
    </form>
  `, false, opts);
}

/* 11. Free-Slot Finder (gaps >= 45m between 08:00 and 22:00) */
function computeFreeSlots(iso) {
  const toM = hm => { const [h, m] = String(hm || '00:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const fromM = mins => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
  const busy = [];
  classesOnDate(iso).forEach(c => {
    if (c.start) busy.push([toM(c.start), toM(c.end) || toM(c.start) + 90]);
  });
  planForDate(iso).filter(p => !p.done && p.time).forEach(p => {
    busy.push([toM(p.time), toM(p.endTime) || toM(p.time) + 60]);
  });
  DB.tasks.filter(x => !x.done && x.date === iso && x.time).forEach(x => {
    busy.push([toM(x.time), toM(x.time) + 45]);
  });
  busy.sort((a, b) => a[0] - b[0]);
  const merged = [];
  busy.forEach(([s, e]) => {
    if (!merged.length || s > merged[merged.length - 1][1]) merged.push([s, e]);
    else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
  });
  const slots = [];
  let cur = 8 * 60;
  const endDay = 22 * 60;
  merged.forEach(([s, e]) => {
    if (s > cur && s - cur >= 45) slots.push({ start: fromM(cur), end: fromM(Math.min(s, endDay)), mins: Math.min(s, endDay) - cur });
    cur = Math.max(cur, e);
  });
  if (endDay - cur >= 45) slots.push({ start: fromM(cur), end: fromM(endDay), mins: endDay - cur });
  return slots.slice(0, 5);
}

/* 12. Daily Time-Blocking Timeline (06:00-24:00) */
function timelineHTML(iso) {
  const cls = classesOnDate(iso);
  const plans = planForDate(iso);
  const tasks = DB.tasks.filter(x => x.date === iso);
  const exams = DB.subjects.filter(s => s.examDate === iso);
  const slots = computeFreeSlots(iso);
  const events = [];
  exams.forEach(s => events.push({ time: s.examTime?.slice(0, 5) || '08:30', end: '', kind: 'exam', title: `🎯 สอบ ${s.name}`, sub: roomText(s.room) ? `ห้อง ${roomText(s.room)}` : '', col: safeColor(s.color), act: `data-act="open-subject" data-id="${s.id}"` }));
  cls.forEach(c => events.push({ time: c.start || '08:00', end: c.end || '', kind: 'class', title: `🏫 ${className(c)}`, sub: c.room || '', col: classColor(c), act: `data-act="edit-class" data-id="${c.id}"` }));
  plans.forEach(p => events.push({ time: p.time || '', end: p.endTime || '', kind: 'plan', title: `📖 ${p.title}`, sub: subjectName(p.subjectId), col: subjectColor(p.subjectId), done: p.done, act: `data-act="edit-plan" data-id="${p.id}"` }));
  tasks.forEach(x => events.push({ time: x.time || '', end: '', kind: 'task', title: `${x.type === 'event' ? '📌' : '📝'} ${x.title}`, sub: x.subjectId ? subjectName(x.subjectId) : '', col: x.subjectId ? subjectColor(x.subjectId) : '#6366f1', done: x.done, act: `data-act="edit-task" data-id="${x.id}"` }));
  const timed = events.filter(e => e.time).sort((a, b) => a.time.localeCompare(b.time));
  const untimed = events.filter(e => !e.time);
  const hours = [...Array(19)].map((_, i) => i + 6); // 06..24

  return `
    <div class="tl-head row wrap" style="justify-content:space-between;margin-bottom:10px">
      <div class="row" style="margin:0;gap:6px">
        <button type="button" class="icon-btn" data-act="tl-nav" data-dir="-1" aria-label="วันก่อนหน้า">‹</button>
        <b>${fmtDateLong(iso)}${isBlackoutDate(iso) ? ' 🌴 (วันพัก)' : ''}</b>
        <button type="button" class="icon-btn" data-act="tl-nav" data-dir="1" aria-label="วันถัดไป">›</button>
      </div>
      <div class="row wrap" style="margin:0;gap:6px">
        <button type="button" class="btn ghost small" data-act="toggle-blackout" data-date="${iso}">${isBlackoutDate(iso) ? 'ยกเลิกวันพัก' : '🌴 ตั้งเป็นวันพัก'}</button>
        <button type="button" class="btn small" data-act="add-todo" data-date="${iso}">+ ลงเวลา</button>
      </div>
    </div>
    ${slots.length ? `<div class="free-slots-bar">
      <small class="muted">✨ ช่วงว่างแนะนำ:</small>
      ${slots.map(sl => `<button type="button" class="chip" data-act="book-slot" data-date="${iso}" data-start="${sl.start}" data-end="${sl.end}">+ ${sl.start}–${sl.end} (${fmtMin(sl.mins)})</button>`).join('')}
    </div>` : ''}
    ${untimed.length ? `<div class="tl-untimed"><small class="muted">ยังไม่ระบุเวลา:</small> ${untimed.map(e => `<button type="button" class="chip" ${e.act} style="border-left:3px solid ${e.col}">${e.title}</button>`).join('')}</div>` : ''}
    <div class="tl-grid">
      ${hours.map(h => {
        const hh = pad(h);
        const hEvents = timed.filter(e => e.time.startsWith(hh + ':'));
        return `<div class="tl-row">
          <div class="tl-hr">${hh}:00</div>
          <div class="tl-slot">
            ${hEvents.length ? hEvents.map(e => `<button type="button" class="tl-ev ${e.done ? 'done' : ''}" style="--c:${e.col}" ${e.act}>
              <span class="tl-ev-time">${esc(e.time)}${e.end ? `–${esc(e.end)}` : ''}</span>
              <b>${e.title}</b>${e.sub ? `<small class="muted"> · ${esc(e.sub)}</small>` : ''}
            </button>`).join('') : `<button type="button" class="tl-empty-hit" data-act="book-slot" data-date="${iso}" data-start="${hh}:00" data-end="${pad(Math.min(23, h + 1))}:00" aria-label="เพิ่มรายการเวลา ${hh}:00"></button>`}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

/* 13. Command Palette (Ctrl+K unified search) */
function openCmdPalette() {
  openModal('🔎 ค้นหาด่วน (Command Palette)', `
    <input id="cmdSearchInput" type="search" placeholder="พิมพ์ชื่อวิชา, บทเรียน, งาน, โน้ต, หรือไฟล์..." autocomplete="off">
    <div id="cmdResults" class="cmd-results"></div>
  `);
  const renderRes = q => {
    const box = document.getElementById('cmdResults');
    if (!box) return;
    const kw = (q || '').trim().toLowerCase();
    const hits = [];
    DB.subjects.forEach(s => {
      if (!kw || s.name.toLowerCase().includes(kw)) {
        hits.push({ ic: '📚', title: s.name, sub: s.examDate ? `สอบ ${fmtDateBE(s.examDate)}` : 'วิชา', act: `data-act="open-subject" data-id="${s.id}"` });
      }
      (s.chapters || []).forEach(c => {
        if (!kw || c.title.toLowerCase().includes(kw) || (c.note || '').toLowerCase().includes(kw) || (c.pin || '').toLowerCase().includes(kw)) {
          hits.push({ ic: c.done ? '✅' : '📖', title: c.title, sub: `${s.name}${c.pin ? ' · 📌 ' + c.pin : ''}`, act: `data-act="open-subject" data-id="${s.id}"` });
        }
      });
      (s.links || []).forEach(l => {
        if (kw && ((l.name || '').toLowerCase().includes(kw) || (l.url || '').toLowerCase().includes(kw))) {
          hits.push({ ic: '🔗', title: l.name || l.url, sub: `ลิงก์ใน ${s.name}`, act: `data-act="open-subject" data-id="${s.id}"` });
        }
      });
    });
    DB.tasks.forEach(x => {
      if (!kw || x.title.toLowerCase().includes(kw)) {
        hits.push({ ic: x.done ? '☑️' : '📝', title: x.title, sub: `${x.date ? fmtDateBE(x.date) : 'งาน'}`, act: `data-act="edit-task" data-id="${x.id}"` });
      }
    });
    DB.plan.forEach(p => {
      if (kw && (p.title || '').toLowerCase().includes(kw)) {
        hits.push({ ic: '🗓️', title: p.title, sub: `แผนอ่าน ${fmtDateBE(p.date)}`, act: `data-act="edit-plan" data-id="${p.id}"` });
      }
    });
    box.innerHTML = hits.slice(0, 18).map(h => `<button type="button" class="cmd-item" ${h.act}>
      <span>${h.ic}</span><span class="grow"><b>${esc(h.title)}</b><br><small class="muted">${esc(h.sub)}</small></span>
    </button>`).join('') || '<p class="muted small center" style="padding:18px">ไม่พบรายการที่ค้นหา</p>';
  };
  renderRes('');
  const inp = document.getElementById('cmdSearchInput');
  if (inp) {
    inp.focus();
    inp.addEventListener('input', () => renderRes(inp.value));
  }
}

/* 14. In-App Quick File Preview */
async function previewFileModal(kind, id, name, url) {
  let src = '';
  let isImg = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(name || url || '');
  let isPdf = /\.pdf(\?|$)/i.test(name || url || '');
  let openHref = url || '';
  if (kind === 'drive') {
    const did = safeDriveId(id || '');
    if (!did) return;
    src = `https://drive.google.com/file/d/${did}/preview`;
    openHref = `https://drive.google.com/file/d/${did}/view`;
    isPdf = true;
  } else if (kind === 'local') {
    const r = await FileStore.get(id);
    if (!r) return App.toast('ไม่พบไฟล์ในเครื่อง');
    src = URL.createObjectURL(r.blob);
    openHref = src;
    isImg = (r.type || '').startsWith('image/') || isImg;
    isPdf = (r.type || '').includes('pdf') || isPdf;
  } else if (kind === 'link') {
    src = url || '';
    openHref = url || '';
  }
  const body = isImg && src
    ? `<div class="preview-box"><img src="${esc(src)}" alt="${esc(name || 'preview')}"></div>`
    : (isPdf && src)
      ? `<div class="preview-box"><iframe src="${esc(src)}" title="${esc(name || 'preview')}"></iframe></div>`
      : `<p class="muted">ลิงก์นี้ไม่รองรับการแสดงตัวอย่างในกรอบ กดปุ่มด้านล่างเพื่อเปิดในแท็บใหม่ได้เลย</p>`;
  openModal(`👁️ ${esc(name || 'ดูไฟล์')}`, `
    ${body}
    <div class="row end" style="margin-top:12px">
      ${openHref ? `<a class="btn small ghost" href="${esc(openHref)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a>` : ''}
      <button type="button" class="btn small" data-act="close-modal">ปิด</button>
    </div>
  `, true);
}

/* 15. Term Wrap-up Summary Modal */
function openTermWrapModal() {
  const totalMin = DB.sessions.reduce((a, x) => a + (Number(x.minutes) || 0), 0);
  const totalHrs = (totalMin / 60).toFixed(1);
  const allCh = DB.subjects.reduce((a, s) => a + (s.chapters?.length || 0), 0);
  const doneCh = DB.subjects.reduce((a, s) => a + (s.chapters || []).filter(c => c.done).length, 0);
  const doneTasks = DB.tasks.filter(x => x.done).length;
  const bySub = {};
  DB.sessions.forEach(x => { const k = x.subjectId || '_'; bySub[k] = (bySub[k] || 0) + (x.minutes || 0); });
  const topEntry = Object.entries(bySub).sort((a, b) => b[1] - a[1])[0];
  const topName = topEntry ? (topEntry[0] === '_' ? 'ทั่วไป' : subjectName(topEntry[0])) : '—';
  const topHrs = topEntry ? (topEntry[1] / 60).toFixed(1) : '0';
  const pct = allCh ? Math.round((doneCh / allCh) * 100) : 0;

  openModal(`🎓 สรุปผล "${esc(DB.term || 'เทอม 1')}"`, `
    <div class="wrapup-hero">
      <div class="wrapup-big">${totalHrs} <small>ชม.</small></div>
      <p class="muted">เวลาอ่านหนังสือสะสมทั้งหมด (${DB.sessions.length} รอบ)</p>
    </div>
    <div class="tiles wrapup-tiles" style="margin:12px 0">
      <div class="tile"><div class="tile-v">${doneCh}/${allCh}</div><div class="muted small">บทที่อ่านจบ (${pct}%)</div></div>
      <div class="tile"><div class="tile-v">${doneTasks}</div><div class="muted small">งานที่ทำเสร็จ</div></div>
      <div class="tile"><div class="tile-v">${DB.subjects.length}</div><div class="muted small">วิชาทั้งหมด</div></div>
      <div class="tile"><div class="tile-v">${topHrs} ชม.</div><div class="muted small">ทุ่มเทสุด: ${esc(topName)}</div></div>
    </div>
    <div class="row end">
      <button type="button" class="btn ghost small" data-act="export">⬇️ สำรองข้อมูลเทอมนี้ (.json)</button>
      <button type="button" class="btn small" data-act="close-modal">ยอดเยี่ยม!</button>
    </div>
  `);
  launchConfetti();
}

/* 16. Customizable Keyboard Shortcuts */
const DEFAULT_SHORTCUTS = {
  search: 'k',
  newTodo: 'n',
  focusMode: 'f',
  toggleTimer: ' ',
  undo: 'z',
  tabHome: '1',
  tabPlan: '2',
  tabSubjects: '3',
  tabCalendar: '4',
  tabTimer: '5',
  tabStats: '6',
  tabAi: '7',
};
const SHORTCUT_LABELS = {
  search: 'เปิดค้นหาด่วน (Command Palette)',
  newTodo: 'เพิ่มสิ่งที่ต้องทำใหม่',
  focusMode: 'เปิด/ปิดโหมดโฟกัส',
  toggleTimer: 'เริ่ม/พักจับเวลา Pomodoro',
  undo: 'ย้อนกลับคำสั่งล่าสุด (Undo)',
  tabHome: 'ไปหน้าแรก',
  tabPlan: 'ไปหน้า To do list',
  tabSubjects: 'ไปหน้า วิชา',
  tabCalendar: 'ไปหน้า ปฏิทิน',
  tabTimer: 'ไปหน้า จับเวลา',
  tabStats: 'ไปหน้า สถิติ',
  tabAi: 'ไปหน้า AI',
};
const Keymap = {
  capturing: null,
  get() { return { ...DEFAULT_SHORTCUTS, ...(DB.prefs?.shortcuts || {}) }; },
  fmtKey(k) { return k === ' ' ? 'Space' : String(k || '').toUpperCase(); },
  init() {
    document.addEventListener('keydown', e => {
      if (this.capturing) {
        e.preventDefault();
        if (e.key === 'Escape') { this.capturing = null; App.render(); return; }
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        DB.prefs.shortcuts = { ...this.get(), [this.capturing]: key };
        const name = SHORTCUT_LABELS[this.capturing] || this.capturing;
        this.capturing = null;
        save();
        App.toast(`ตั้งคีย์ลัด "${name}" เป็น [${this.fmtKey(key)}] แล้ว ⌨️`);
        return;
      }
      const map = this.get();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === (map.search || 'k')) {
        e.preventDefault(); openCmdPalette(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === (map.undo || 'z')) {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
          e.preventDefault(); UndoStack.undo(); return;
        }
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      const modalOpen = !document.getElementById('modal')?.classList.contains('hidden');
      if (modalOpen) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === map.search) { e.preventDefault(); openCmdPalette(); }
      else if (k === map.newTodo) { e.preventDefault(); openModal('+ สิ่งที่ต้องทำ', todoForm({ date: todayStr() })); }
      else if (k === map.focusMode) {
        e.preventDefault();
        const ov = document.getElementById('focusOverlay');
        if (ov && !ov.hidden) ACT['focus-close'](); else ACT['focus-open']();
      }
      else if (k === map.toggleTimer) { e.preventDefault(); Timer.running ? ACT['timer-pause']() : ACT['timer-start'](); }
      else if (k === map.tabHome) App.go('home');
      else if (k === map.tabPlan) App.go('plan');
      else if (k === map.tabSubjects) App.go('subjects');
      else if (k === map.tabCalendar) App.go('calendar');
      else if (k === map.tabTimer) App.go('timer');
      else if (k === map.tabStats) App.go('stats');
      else if (k === map.tabAi) App.go('ai');
    });
  },
};

/* 17. Interactive First-Time Tour */
const AppTour = {
  step: 0,
  steps: [
    { title: '1/4 · ยินดีต้อนรับสู่ LungAoodyPlanner! 🎉', body: 'หน้าแรกสรุปทุกอย่างที่สำคัญไว้ครบ: เป้าหมายสอบถัดไป, Today list พร้อม Quick-Add, ความพร้อมแยกวิชา และบทที่ควรทบทวนด่วน' },
    { title: '2/4 · ปฏิทิน & ไทม์ไลน์รายวัน 🗓️', body: 'ดูได้ทั้งปฏิทินเดือน (ลากย้ายวันได้), ไทม์ไลน์รายวัน 06:00–24:00 พร้อมหาช่วงว่างอัตโนมัติ และตารางเรียนทั้งสัปดาห์' },
    { title: '3/4 · โหมดโฟกัส + เสียงบรรยากาศ + ลิ้นชักสูตร ⏱️', body: 'จับเวลาได้ทั้ง Pomodoro และ Flowtime เดินหน้า เปิดเต็มจอพร้อมเสียงฝน/คาเฟ่ และเปิดดูสูตรสรุปด่วนได้โดยไม่ต้องออกจากโหมดโฟกัส' },
    { title: '4/4 · ค้นหาด่วน & คีย์ลัด ⌨️', body: 'กด Ctrl+K (หรือปุ่ม 🔎 ด้านบน) เพื่อค้นหาวิชา บท งาน โน้ต และไฟล์ได้ทันที และปรับคีย์ลัดหรือสีธีมเองได้ในหน้า ตั้งค่า!' },
  ],
  open(idx = 0) {
    this.step = Math.max(0, Math.min(this.steps.length - 1, idx));
    const s = this.steps[this.step];
    const isLast = this.step === this.steps.length - 1;
    openModal(s.title, `
      <p style="line-height:1.6;margin:4px 0 16px">${s.body}</p>
      <div class="row" style="justify-content:space-between;align-items:center">
        <button type="button" class="btn ghost small" data-act="tour-done">ข้าม</button>
        <div class="row" style="margin:0;gap:6px">
          ${this.step > 0 ? `<button type="button" class="btn ghost small" data-act="tour-step" data-i="${this.step - 1}">← ย้อนกลับ</button>` : ''}
          <button type="button" class="btn small" data-act="${isLast ? 'tour-done' : 'tour-step'}" data-i="${this.step + 1}">${isLast ? 'เริ่มใช้งานเลย! 🚀' : 'ถัดไป →'}</button>
        </div>
      </div>
    `);
  },
  done() {
    DB.prefs.tourDone = true;
    save({ silent: true });
    closeModal();
  },
};

/* 18. Formula & Cheat-Sheet Drawer inside Focus Mode */
function renderFormulaDrawer() {
  const box = document.getElementById('focusFormulaBody');
  if (!box) return;
  const s = subjectById(Timer.subjectId) || DB.subjects[0];
  if (!s) {
    box.innerHTML = '<p class="muted small">ยังไม่มีวิชา — เพิ่มวิชาก่อนเพื่อจดสูตรหรือสรุปด่วน</p>';
    return;
  }
  box.innerHTML = `
    <div class="row wrap" style="margin-bottom:8px;justify-content:space-between">
      <b>${esc(s.name)}</b>
      <select class="mini-sel" data-chg="formula-sub" aria-label="เลือกวิชา">${DB.subjects.map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
    </div>
    <textarea id="formulaText" rows="10" placeholder="จดสูตรสำคัญ คำศัพท์ หรือจุดที่ต้องจำของวิชานี้...">${esc(s.formulas || '')}</textarea>
    <div class="row end" style="margin-top:8px">
      <button type="button" class="btn small" data-act="save-formula" data-sid="${s.id}">💾 บันทึกสูตร</button>
    </div>
  `;
}
