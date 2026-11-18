/* ===== Google Drive (user's own Drive, browser only) =====
   OAuth Web client ID from Google Cloud project buddy-4a1c4.
   It is NOT the Firebase apiKey.
   Scope is requested only when the user uploads, moves, or deletes a file. */
const GOOGLE_DRIVE_CLIENT_ID = '150965048225-8jkvs88rr39vqjrigh7v3nr786v38vgp.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_ROOT_NAME = 'LungAoodyPlanner';

function driveClientId() { return String(GOOGLE_DRIVE_CLIENT_ID || '').trim(); }

function driveMime(type) {
  const s = String(type || '').split(';')[0].trim().toLowerCase();
  return /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(s) ? s : 'application/octet-stream';
}
function driveQ(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

const Drive = {
  token: '', expires: 0,

  clear() { this.token = ''; this.expires = 0; },

  err(message, code) { const e = new Error(message); e.code = code; return e; },
  failOffline() { return this.err('ออฟไลน์อยู่ อัปโหลดขึ้น Drive ไม่ได้', 'offline'); },

  preload() {
    if (!driveClientId() || window.google?.accounts?.oauth2) return;
    loadScript('https://accounts.google.com/gsi/client').catch(() => { });
  },

  /* Call from the click/change handler with no await before it, so the
     consent popup still counts as a user gesture. */
  ensureToken() {
    if (this.token && Date.now() < this.expires - 60000) return Promise.resolve(this.token);
    if (!driveClientId()) return Promise.reject(this.err('ยังไม่ได้ตั้งค่า Google Client ID สำหรับ Drive', 'noconfig'));
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.reject(this.failOffline());
    const run = () => this._requestToken();
    if (window.google?.accounts?.oauth2) return run();
    return loadScript('https://accounts.google.com/gsi/client').then(() => {
      if (!window.google?.accounts?.oauth2) throw this.err('โหลด Google Sign-In ไม่ได้ ตรวจเน็ตหรือตัวบล็อกโฆษณาแล้วลองใหม่', 'gis');
      return run();
    });
  },

  _requestToken() {
    return new Promise((resolve, reject) => {
      let settled = false;
      const fail = (message, code) => { if (settled) return; settled = true; reject(this.err(message, code)); };
      let client;
      try {
        client = google.accounts.oauth2.initTokenClient({
          client_id: driveClientId(),
          scope: DRIVE_SCOPE,
          hint: (typeof Sync !== 'undefined' && Sync.user && Sync.user.email) || '',
          callback: resp => {
            if (settled) return;
            if (!resp || resp.error || !resp.access_token) {
              const denied = resp && (resp.error === 'access_denied' || resp.error === 'interaction_required');
              fail(denied ? 'ไม่มีสิทธิ์เข้าถึง Google Drive — คุณยังไม่ได้อนุญาต' : 'ไม่มีสิทธิ์เข้าถึง Google Drive — ลองอนุญาตอีกครั้ง', 'auth');
              return;
            }
            settled = true;
            this.token = resp.access_token;
            this.expires = Date.now() + (Number(resp.expires_in) || 3600) * 1000;
            resolve(this.token);
          },
          error_callback: err => {
            const type = String((err && (err.type || err.message)) || '');
            if (/popup_failed_to_open/i.test(type)) fail('เบราว์เซอร์บล็อกหน้าต่างอนุญาต อนุญาตป๊อปอัปแล้วลองใหม่', 'auth');
            else if (/popup_closed/i.test(type)) fail('ยกเลิกการอนุญาต Google Drive', 'auth');
            else fail('ไม่มีสิทธิ์เข้าถึง Google Drive — ลองอนุญาตอีกครั้ง', 'auth');
          },
        });
      } catch { fail('โหลด Google Sign-In ไม่ได้ ตรวจเน็ตหรือตัวบล็อกโฆษณาแล้วลองใหม่', 'gis'); return; }
      try { client.requestAccessToken({ prompt: '' }); }
      catch { fail('เบราว์เซอร์บล็อกหน้าต่างอนุญาต อนุญาตป๊อปอัปแล้วลองใหม่', 'auth'); }
    });
  },

  parseError(status, text) {
    let reason = '', message = '';
    try {
      const j = JSON.parse(text || '{}');
      reason = String(j.error?.errors?.[0]?.reason || '');
      message = String(j.error?.message || '');
    } catch { /* not JSON */ }
    const blob = reason + ' ' + message;
    if (status === 404 || /notFound/i.test(reason)) return this.err('ไม่พบไฟล์บน Google Drive', 'missing');
    if (!navigator.onLine || status === 0) return this.failOffline();
    if (/storageQuotaExceeded/i.test(blob)) return this.err('พื้นที่ Google Drive เต็ม อัปโหลดไม่ได้', 'quota');
    if (status === 429 || /quotaExceeded|rateLimitExceeded|dailyLimitExceeded|userRateLimitExceeded/i.test(blob))
      return this.err('โควตา Google Drive เต็มชั่วคราว ลองใหม่ภายหลัง', 'quota');
    if (status === 401 || status === 403) return this.err('ไม่มีสิทธิ์เข้าถึง Google Drive — ลองอนุญาตอีกครั้ง', 'auth');
    return this.err('เชื่อมต่อ Google Drive ไม่สำเร็จ', 'other');
  },

  async api(path, opt = {}) {
    if (navigator.onLine === false) throw this.failOffline();
    const method = opt.method || 'GET';
    const url = new URL('https://www.googleapis.com' + path);
    if (opt.query) for (const k in opt.query) url.searchParams.set(k, String(opt.query[k]));
    let res;
    try {
      res = await fetch(url.toString(), {
        method,
        headers: Object.assign(
          { Authorization: 'Bearer ' + this.token },
          opt.body ? { 'Content-Type': 'application/json' } : null
        ),
        body: opt.body ? JSON.stringify(opt.body) : undefined,
      });
    } catch { throw this.failOffline(); }
    if (res.status === 401 && !opt.retried) {
      this.clear();
      await this.ensureToken();
      return this.api(path, Object.assign({}, opt, { retried: true }));
    }
    const text = await res.text();
    if (!res.ok) throw this.parseError(res.status, text);
    if (!text) return null;
    try { return JSON.parse(text); } catch { throw this.err('คำตอบจาก Google Drive ไม่ถูกต้อง', 'other'); }
  },

  async findFolder(q) {
    const r = await this.api('/drive/v3/files', {
      query: { q, spaces: 'drive', pageSize: '10', fields: 'files(id,name,trashed)' },
    });
    return ((r && r.files) || []).find(f => f && !f.trashed && safeDriveId(f.id)) || null;
  },

  async ensureRoot() {
    if (!DB.drive || typeof DB.drive !== 'object' || Array.isArray(DB.drive)) DB.drive = {};
    const known = safeDriveId(DB.drive.rootId);
    if (known) {
      try {
        const f = await this.api('/drive/v3/files/' + encodeURIComponent(known), { query: { fields: 'id,name,trashed' } });
        if (f && !f.trashed && safeDriveId(f.id)) return f.id;
      } catch (e) { if (e.code !== 'missing') throw e; }
    }
    const found = await this.findFolder("appProperties has { key='spKind' and value='root' } and mimeType='application/vnd.google-apps.folder' and trashed=false");
    let id = found && safeDriveId(found.id);
    if (!id) {
      const created = await this.api('/drive/v3/files', {
        method: 'POST',
        query: { fields: 'id' },
        body: {
          name: DRIVE_ROOT_NAME,
          mimeType: 'application/vnd.google-apps.folder',
          appProperties: { spKind: 'root' },
        },
      });
      id = safeDriveId(created && created.id);
      if (!id) throw this.err('สร้างโฟลเดอร์บน Drive ไม่สำเร็จ', 'other');
    }
    DB.drive.rootId = id;
    save({ silent: true });
    return id;
  },

  async ensureSubjectFolder(subject) {
    const live = subjectById(subject.id) || subject;
    const rootId = await this.ensureRoot();
    const name = driveFolderLabel(live.name);
    const known = safeDriveId(live.driveFolderId);
    if (known) {
      try {
        const f = await this.api('/drive/v3/files/' + encodeURIComponent(known), { query: { fields: 'id,name,trashed' } });
        if (f && !f.trashed && safeDriveId(f.id)) {
          if (f.name !== name) await this.api('/drive/v3/files/' + encodeURIComponent(f.id), { method: 'PATCH', body: { name } });
          live.driveFolderId = f.id;
          return f.id;
        }
      } catch (e) { if (e.code !== 'missing') throw e; }
    }
    const q = `appProperties has { key='spSubject' and value='${driveQ(live.id)}' } and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const found = await this.findFolder(q);
    let id = found && safeDriveId(found.id);
    if (id) {
      if (found.name !== name) await this.api('/drive/v3/files/' + encodeURIComponent(id), { method: 'PATCH', body: { name } });
    } else {
      const created = await this.api('/drive/v3/files', {
        method: 'POST',
        query: { fields: 'id' },
        body: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootId],
          appProperties: { spKind: 'subject', spSubject: String(live.id) },
        },
      });
      id = safeDriveId(created && created.id);
      if (!id) throw this.err('สร้างโฟลเดอร์บน Drive ไม่สำเร็จ', 'other');
    }
    const s = subjectById(live.id) || live;
    s.driveFolderId = id;
    save({ silent: true });
    return id;
  },

  uploadMultipart(folderId, file, onProgress, retried) {
    const folder = safeDriveId(folderId);
    if (!folder) return Promise.reject(this.err('สร้างโฟลเดอร์บน Drive ไม่สำเร็จ', 'other'));
    if (navigator.onLine === false) return Promise.reject(this.failOffline());
    const boundary = 'sp' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const meta = JSON.stringify({ name: String(file.name || 'ไฟล์').slice(0, 300) || 'ไฟล์', parents: [folder] });
    const type = driveMime(file.type);
    const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${type}\r\n\r\n`;
    const tail = `\r\n--${boundary}--`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=' + encodeURIComponent('id,name,size,mimeType,modifiedTime'));
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
      xhr.setRequestHeader('Content-Type', 'multipart/related; boundary=' + boundary);
      xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch { reject(this.err('คำตอบจาก Google Drive ไม่ถูกต้อง', 'other')); }
          return;
        }
        if (xhr.status === 401 && !retried) {
          this.clear();
          this.ensureToken().then(() => this.uploadMultipart(folder, file, onProgress, true)).then(resolve, reject);
          return;
        }
        reject(this.parseError(xhr.status, xhr.responseText));
      };
      xhr.onerror = () => reject(this.failOffline());
      xhr.send(new Blob([head, file, tail]));
    });
  },

  async uploadToSubject(subject, file, onProgress) {
    await this.ensureToken();
    const live = subjectById(subject.id) || subject;
    const folderId = await this.ensureSubjectFolder(live);
    const meta = await this.uploadMultipart(folderId, file, onProgress);
    const id = safeDriveId(meta && meta.id);
    if (!id) throw this.err('คำตอบจาก Google Drive ไม่ถูกต้อง', 'other');
    const s = subjectById(live.id) || live;
    s.driveFolderId = folderId;
    if (!Array.isArray(s.driveFiles)) s.driveFiles = [];
    let size = Number(meta.size);
    if (!Number.isFinite(size) || size < 0) size = Number(file.size) || 0;
    const modified = String(meta.modifiedTime || '');
    const rec = {
      id,
      name: String(meta.name || file.name || 'ไฟล์').replace(/[\u0000-\u001f]/g, '').slice(0, 300) || 'ไฟล์',
      size,
      mimeType: driveMime(meta.mimeType || file.type),
      modifiedTime: /^\d{4}-\d{2}-\d{2}T/.test(modified) ? modified.slice(0, 40) : new Date().toISOString(),
    };
    const i = s.driveFiles.findIndex(f => f && f.id === id);
    if (i >= 0) s.driveFiles[i] = rec; else s.driveFiles.unshift(rec);
    save({ silent: true });
    return rec;
  },

  async deleteFile(fileId) {
    const id = safeDriveId(fileId);
    if (!id) throw this.err('ไม่พบไฟล์บน Google Drive', 'missing');
    await this.ensureToken();
    try { await this.api('/drive/v3/files/' + encodeURIComponent(id), { method: 'DELETE' }); }
    catch (e) { if (e.code !== 'missing') throw e; }
  },
};

/* ===== Google Calendar Sync (browser only, reuses OAuth client ID) ===== */
const GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

const GCal = {
  token: '', expires: 0,

  ensureToken() {
    if (this.token && Date.now() < this.expires - 60000) return Promise.resolve(this.token);
    if (!driveClientId()) return Promise.reject(Drive.err('ยังไม่ได้ตั้งค่า Google Client ID', 'noconfig'));
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.reject(Drive.err('ออฟไลน์อยู่ ซิงก์ Google Calendar ไม่ได้', 'offline'));
    const run = () => new Promise((resolve, reject) => {
      let settled = false;
      const fail = (msg, code) => { if (settled) return; settled = true; reject(Drive.err(msg, code)); };
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: driveClientId(),
          scope: GCAL_SCOPE,
          hint: (typeof Sync !== 'undefined' && Sync.user && Sync.user.email) || '',
          callback: resp => {
            if (settled) return;
            if (!resp || resp.error || !resp.access_token) {
              fail('ไม่ได้รับสิทธิ์เข้าถึง Google Calendar — ลองอนุญาตอีกครั้ง', 'auth');
              return;
            }
            settled = true;
            this.token = resp.access_token;
            this.expires = Date.now() + (Number(resp.expires_in) || 3600) * 1000;
            resolve(this.token);
          },
          error_callback: () => fail('ยกเลิกการเชื่อมต่อ Google Calendar', 'auth'),
        });
        client.requestAccessToken({ prompt: '' });
      } catch {
        fail('เปิดหน้าต่างอนุญาต Google Calendar ไม่ได้', 'auth');
      }
    });
    if (window.google?.accounts?.oauth2) return run();
    return loadScript('https://accounts.google.com/gsi/client').then(() => {
      if (!window.google?.accounts?.oauth2) throw Drive.err('โหลด Google Sign-In ไม่ได้', 'gis');
      return run();
    });
  },

  async req(path, opts = {}) {
    const token = await this.ensureToken();
    const res = await fetch('https://www.googleapis.com/calendar/v3' + path, {
      ...opts,
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
    if (res.status === 401) { this.token = ''; this.expires = 0; throw Drive.err('สิทธิ์ Google Calendar หมดอายุ กดซิงก์ใหม่อีกครั้ง', 'auth'); }
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      if (res.status === 403 && /Calendar API|accessNotConfigured/i.test(txt)) {
        throw Drive.err('ยังไม่ได้เปิด Google Calendar API ใน Google Cloud Console (buddy-4a1c4)', 'disabled');
      }
      throw Drive.err(`Google Calendar ผิดพลาด (${res.status})`, 'api');
    }
    return res.status === 204 ? null : res.json();
  },

  _timeRange(date, startTime, endTime) {
    if (!startTime) {
      const d = parseDate(date); d.setDate(d.getDate() + 1);
      return { start: { date }, end: { date: toDateStr(d) } };
    }
    const [sh, sm] = startTime.split(':').map(Number);
    let end = endTime;
    if (!end) {
      const total = (sh || 0) * 60 + (sm || 0) + 60;
      end = `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
    }
    return {
      start: { dateTime: `${date}T${startTime}:00+07:00`, timeZone: 'Asia/Bangkok' },
      end: { dateTime: `${date}T${end}:00+07:00`, timeZone: 'Asia/Bangkok' },
    };
  },

  async syncAll() {
    await this.ensureToken();
    const existingRes = await this.req('/calendars/primary/events?maxResults=250&privateExtendedProperty=studyPlannerApp%3D1');
    const byKey = {};
    (existingRes.items || []).forEach(ev => {
      const k = ev.extendedProperties?.private?.studyPlannerKey;
      if (k) byKey[k] = ev.id;
    });

    const events = [];
    // 1. Exams
    const gf = DB.prefs?.gcalFilter || {};
    const allowSub = sid => !Array.isArray(gf.subjectIds) || !gf.subjectIds.length || !sid || gf.subjectIds.includes(sid);
    if (gf.exams !== false) DB.subjects.filter(s => s.examDate && allowSub(s.id)).forEach(s => {
      events.push({
        key: `exam_${s.id}`,
        body: {
          summary: `🎯 สอบ ${s.name}`,
          location: roomText(s.room) || undefined,
          description: 'ซิงก์จาก LungAoody Study Planner',
          ...this._timeRange(s.examDate, s.examTime || '', ''),
          reminders: { useDefault: true },
          extendedProperties: { private: { studyPlannerApp: '1', studyPlannerKey: `exam_${s.id}` } },
        },
      });
    });

    // 2. Weekly classes
    const today = todayStr();
    const todayDow = parseDate(today).getDay();
    if (gf.classes !== false) (DB.classes || []).filter(c => allowSub(c.subjectId)).forEach(c => {
      const diff = (Number(c.day) - todayDow + 7) % 7;
      const startDate = addDays(today, diff);
      events.push({
        key: `cls_${c.id}`,
        body: {
          summary: `🗓️ ${className(c)}`,
          location: c.room || undefined,
          description: 'คาบเรียนประจำสัปดาห์ · LungAoody Study Planner',
          ...this._timeRange(startDate, c.start || '09:00', c.end || ''),
          recurrence: ['RRULE:FREQ=WEEKLY'],
          reminders: { useDefault: true },
          extendedProperties: { private: { studyPlannerApp: '1', studyPlannerKey: `cls_${c.id}` } },
        },
      });
    });

    // 3. Undone plans & tasks
    if (gf.plans !== false) DB.plan.filter(p => !p.done && p.date && allowSub(p.subjectId)).forEach(p => {
      const sub = p.subjectId ? subjectName(p.subjectId) : '';
      events.push({
        key: `plan_${p.id}`,
        body: {
          summary: `📖 ${p.title}${sub ? ` (${sub})` : ''}`,
          description: 'แผนอ่านหนังสือ · LungAoody Study Planner',
          ...this._timeRange(p.date, p.time || '', p.endTime || ''),
          reminders: { useDefault: true },
          extendedProperties: { private: { studyPlannerApp: '1', studyPlannerKey: `plan_${p.id}` } },
        },
      });
    });
    if (gf.tasks !== false) DB.tasks.filter(x => !x.done && x.date && !x.gcalId && allowSub(x.subjectId)).forEach(x => {
      const sub = x.subjectId ? subjectName(x.subjectId) : '';
      events.push({
        key: `task_${x.id}`,
        body: {
          summary: `${x.type === 'event' ? '📌' : '📝'} ${x.title}${sub ? ` (${sub})` : ''}`,
          description: 'สิ่งที่ต้องทำ · LungAoody Study Planner',
          ...this._timeRange(x.date, x.time || '', ''),
          reminders: { useDefault: true },
          extendedProperties: { private: { studyPlannerApp: '1', studyPlannerKey: `task_${x.id}` } },
        },
      });
    });

    let pushed = 0;
    for (const ev of events) {
      const eid = byKey[ev.key];
      if (eid) {
        await this.req(`/calendars/primary/events/${encodeURIComponent(eid)}`, { method: 'PATCH', body: JSON.stringify(ev.body) });
      } else {
        await this.req('/calendars/primary/events', { method: 'POST', body: JSON.stringify(ev.body) });
      }
      pushed++;
    }

    // 4. Pull external events from Google Calendar -> Web (To do list / Calendar)
    const fromD = addDays(today, -7);
    const toD = addDays(today, 120);
    const pullUrl = `/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=250&timeMin=${encodeURIComponent(fromD + 'T00:00:00+07:00')}&timeMax=${encodeURIComponent(toD + 'T23:59:59+07:00')}`;
    const pullRes = await this.req(pullUrl);
    let pulled = 0;
    (pullRes.items || []).forEach(ev => {
      if (!ev || ev.status === 'cancelled') return;
      if (ev.extendedProperties?.private?.studyPlannerApp === '1') return;
      const rawStart = ev.start?.dateTime || ev.start?.date || '';
      const date = rawStart.slice(0, 10);
      if (!date) return;
      const time = ev.start?.dateTime ? rawStart.slice(11, 16) : '';
      const title = String(ev.summary || '(ไม่มีชื่อ)').trim().slice(0, 200);
      const existing = DB.tasks.find(x => x.gcalId === ev.id);
      if (existing) {
        existing.title = title;
        existing.date = date;
        existing.time = time;
      } else {
        DB.tasks.push({ id: uid(), gcalId: ev.id, title, type: 'event', date, time, subjectId: '', remind: !!time, done: false });
      }
      pulled++;
    });
    if (pulled) save({ silent: true });

    return { pushed, pulled };
  },
};
