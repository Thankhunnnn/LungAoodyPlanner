/* ===== AI (Gemini / OpenAI / DeepSeek) ===== */
const DEEPSEEK_DEFAULT_PROXY = 'https://lungaoody-deepseek.pkgztv6.workers.dev';
function deepseekEndpoint(raw) {
  const base = String(raw || DEEPSEEK_DEFAULT_PROXY).trim().replace(/\/+$/, '');
  if (!/^https:\/\//i.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(base)) {
    throw new Error('Proxy URL ของ DeepSeek ต้องขึ้นต้นด้วย https://');
  }
  return base + '/v1/chat/completions';
}
function schemaLower(o) {
  if (!o || typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(schemaLower);
  const out = {};
  for (const k in o) out[k] = k === 'type' && typeof o[k] === 'string' ? o[k].toLowerCase() : schemaLower(o[k]);
  return out;
}

const AI = {
  ready() {
    const c = aiCfg();
    if (c.provider === 'deepseek') return !!c.deepseekKey;
    return c.provider === 'openai' ? !!c.openaiKey : !!c.geminiKey;
  },
  providerLabel() {
    const c = aiCfg();
    if (c.provider === 'deepseek') return `DeepSeek · ${c.deepseekModel || 'deepseek-chat'}`;
    return c.provider === 'openai' ? `OpenAI · ${c.openaiModel}` : `Gemini · ${c.geminiModel}`;
  },
  openAITools() {
    return this.tutorTools()[0].functionDeclarations.map(fn => ({
      type: 'function',
      function: { name: fn.name, description: fn.description, parameters: schemaLower(fn.parameters) },
    }));
  },

  context() {
    const t = todayStr();
    const lines = [`วันนี้คือ ${t} (${fmtDateLong(t)})`, `ชื่อผู้ใช้: ${DB.name || '-'}`, 'วิชาและความคืบหน้า:'];
    DB.subjects.forEach(s => {
      const p = subjectProgress(s);
      const fc = (typeof FileStore !== 'undefined' ? (FileStore._counts[s.id] || 0) : 0) + (s.links || []).length + (DB.driveFiles || []).filter(f => f.subjectId === s.id).length;
      lines.push(`- [id:${s.id}] ${s.name} | สอบ ${s.examDate || 'ยังไม่กำหนด'} ${s.examTime || ''} ${s.room ? 'ห้อง ' + s.room : ''} | อ่านแล้ว ${p.done}/${p.total} | ไฟล์/ลิงก์ ${fc}`);
      s.chapters.forEach(c => lines.push(`    • [id:${c.id}] ${c.title} ${c.done ? '(อ่านแล้ว)' : '(ยังไม่อ่าน)'}`));
    });
    const tp = planForDate(t);
    if (tp.length) lines.push('แผนวันนี้: ' + tp.map(p => `${subjectName(p.subjectId)}: ${p.title}${p.done ? ' ✓' : ''}`).join(', '));
    const ts = DB.tasks.filter(x => !x.done);
    if (ts.length) lines.push('การบ้าน/กิจกรรมที่ค้าง: ' + ts.map(x => `${x.title} (${x.date}${x.time ? ' ' + x.time : ''})`).join(', '));
    return lines.join('\n');
  },

  systemPrompt() {
    return `คุณคือ "น้องติว" ผู้ช่วยติวหนังสือที่น่ารัก ใจดี พูดภาษาไทยเป็นกันเอง ลงท้ายด้วย ค่ะ/นะคะ
หน้าที่: อธิบายเนื้อหาให้เข้าใจง่าย ยกตัวอย่าง ช่วยสรุป ทำข้อสอบ และช่วยวางแผนการอ่าน
ใช้ markdown ได้ (หัวข้อ, bullet, ตัวหนา) ตอบกระชับ ชัดเจน

ข้อมูลของผู้ใช้ตอนนี้:
${this.context()}`;
  },

  tutorPrompt() {
    return `คุณคือ "อออ" เพื่อนที่ช่วยติวหนังสือ พูดภาษาไทยกันเอง สั้นๆ แบบแชทกับเพื่อน
ไม่ลงท้าย ค่ะ/ครับ และไม่ใช้ดอกซากุระ ตอบเป็นข้อความสั้น ถ้าอยากส่งหลายข้อความให้คั่นด้วยบรรทัดที่มีแค่ ---
อธิบายง่าย ยกตัวอย่างสั้นๆ ได้
คุณมีเครื่องมือจัดการข้อมูลในแอปได้ทุกอย่าง (เพิ่ม/ลบวิชา, ตั้ง/ลบวันสอบ, เพิ่ม/ลบบท, ลบไฟล์/ลิงก์, เพิ่ม/ลบการบ้าน, เพิ่ม/ลบตารางอ่าน, ติ๊กเสร็จ, จัดตารางอัตโนมัติ)
ถ้าผู้ใช้ขอให้แก้หรือลบข้อมูลในแอป ให้เรียกฟังก์ชันที่เกี่ยวข้องทันที อย่าบอกว่าทำไม่ได้ และอย่าบอกว่าทำให้เสร็จแล้ว เพราะผู้ใช้ต้องกดยืนยันก่อน
ถ้าไม่แน่ใจว่าหมายถึงวิชาไหน (ยกเว้นสั่งลบทั้งหมด) ให้ถามชื่อวิชา อย่าเรียกฟังก์ชัน
วันที่ใช้ YYYY-MM-DD เวลาใช้ HH:MM ถ้าไม่บอกปี ให้ใช้ปีของวันนี้ หรือปีถัดไปถ้าวันนั้นผ่านไปแล้ว
วันนี้: ${this.context()}`;
  },

  tutorTools() {
    const str = (desc) => ({ type: 'STRING', description: desc });
    const bool = (desc) => ({ type: 'BOOLEAN', description: desc });
    return [{ functionDeclarations: [
      { name: 'set_exam', description: 'ตั้งหรือลบวันสอบ ถ้ายังไม่มีวิชานี้ให้ใส่ชื่อไว้ ระบบจะเสนอเพิ่มวิชา', parameters: { type: 'OBJECT', properties: {
        action: str('set หรือ clear'), subjectName: str('ชื่อหรือรหัสวิชา'), examDate: str('YYYY-MM-DD'), examTime: str('HH:MM'), room: str('ห้องสอบ ถ้าว่างไม่ต้องใส่'),
      }, required: ['action', 'subjectName'] } },
      { name: 'add_task', description: 'เพิ่มการบ้านหรือกิจกรรม', parameters: { type: 'OBJECT', properties: {
        title: str('ชื่องาน'), date: str('YYYY-MM-DD'), time: str('HH:MM'), subjectName: str('วิชา ถ้ามี'), type: str('homework หรือ event'),
      }, required: ['title', 'date'] } },
      { name: 'delete_task', description: 'ลบการบ้านหรือกิจกรรม', parameters: { type: 'OBJECT', properties: {
        title: str('ชื่องานที่จะลบ'), all: bool('true ถ้าต้องการลบการบ้าน/กิจกรรมทั้งหมด'),
      } } },
      { name: 'add_subject', description: 'เพิ่มวิชาใหม่', parameters: { type: 'OBJECT', properties: {
        name: str('ชื่อวิชา'), examDate: str('YYYY-MM-DD'), examTime: str('HH:MM'), room: str('ห้อง'),
      }, required: ['name'] } },
      { name: 'delete_subject', description: 'ลบวิชา (ลบหนึ่งวิชาหรือทั้งหมด)', parameters: { type: 'OBJECT', properties: {
        subjectName: str('ชื่อวิชาที่จะลบ'), all: bool('true ถ้าต้องการลบทุกวิชา'),
      } } },
      { name: 'add_chapters', description: 'เพิ่มบทหรือหัวข้อใต้หนึ่งวิชา จากไฟล์หรือที่ผู้ใช้บอก ถ้าไม่ชัวร์วิชา อย่าเรียก', parameters: { type: 'OBJECT', properties: {
        subjectName: str('ชื่อวิชาที่มีอยู่หรือกำลังจะเพิ่ม'), titles: { type: 'ARRAY', items: { type: 'STRING' }, description: 'ชื่อบท' },
      }, required: ['subjectName', 'titles'] } },
      { name: 'delete_chapters', description: 'ลบบทหรือหัวข้อในวิชา (ลบเฉพาะบท หรือลบทุกบทในวิชา/ทุกวิชา)', parameters: { type: 'OBJECT', properties: {
        subjectName: str('ชื่อวิชา (หรือ ALL ถ้าลบทุกวิชา)'), titles: { type: 'ARRAY', items: { type: 'STRING' }, description: 'ชื่อบทที่จะลบ (ถ้าไม่ใส่และ all=true จะลบทุกบท)' }, all: bool('true ถ้าลบทุกบท'),
      } } },
      { name: 'delete_files', description: 'ลบไฟล์และลิงก์ในวิชา (ลบเฉพาะไฟล์ หรือลบทุกไฟล์ในวิชา/ทุกวิชา)', parameters: { type: 'OBJECT', properties: {
        subjectName: str('ชื่อวิชา (หรือ ALL ถ้าลบทุกวิชา)'), fileNames: { type: 'ARRAY', items: { type: 'STRING' }, description: 'ชื่อไฟล์ที่จะลบ' }, all: bool('true ถ้าลบทุกไฟล์และลิงก์'),
      } } },
      { name: 'add_plan', description: 'เพิ่มรายการอ่านในตารางอ่าน', parameters: { type: 'OBJECT', properties: {
        title: str('รายละเอียด/ชื่อบท'), date: str('YYYY-MM-DD'), time: str('HH:MM'), subjectName: str('ชื่อวิชา'),
      }, required: ['title', 'date'] } },
      { name: 'delete_plan', description: 'ลบรายการในตารางอ่าน', parameters: { type: 'OBJECT', properties: {
        title: str('ชื่อรายการที่จะลบ'), date: str('YYYY-MM-DD'), all: bool('true ถ้าลบตารางอ่านทั้งหมด'),
      } } },
      { name: 'toggle_done', description: 'ติ๊กเสร็จ/ยังไม่เสร็จ สำหรับบท ตารางอ่าน หรือการบ้าน', parameters: { type: 'OBJECT', properties: {
        target: str('chapter, plan หรือ task'), title: str('ชื่อบทหรืองาน'), subjectName: str('ชื่อวิชา (ถ้ามี)'), done: bool('true=เสร็จ, false=ยังไม่เสร็จ'),
      }, required: ['target', 'title', 'done'] } },
      { name: 'auto_schedule', description: 'จัดตารางอ่านหนังสืออัตโนมัติจากวันสอบและบทที่เหลือ', parameters: { type: 'OBJECT', properties: {} } },
    ] }];
  },

  /* Chat with อออ. Gemini may return function calls. Other providers are text only. */
  async tutor(messages) {
    if (!this.ready()) throw new Error('ยังไม่ได้ใส่ API key — ไปที่ ตั้งค่า > AI');
    const c = aiCfg();
    const hist = messages.map(m => {
      let content = m.content || '';
      const files = m.files || [];
      if (c.provider !== 'gemini' && files.length) {
        const texts = files.filter(f => f.text).map(f => `ไฟล์ ${f.name}:\n${f.text}`);
        const skipped = files.filter(f => !f.text).map(f => f.name);
        if (texts.length) content += '\n\n' + texts.join('\n\n');
        if (skipped.length) content += '\n\n(ไฟล์ ' + skipped.join(', ') + ' ส่งให้โมเดลนี้ไม่ได้ ใช้ Gemini ถึงจะอ่านรูปและ PDF)';
      }
      return { role: m.role, content, files: c.provider === 'gemini' ? files : [] };
    });
    if (c.provider === 'deepseek') {
      const r = await fetch(deepseekEndpoint(c.deepseekProxy), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.deepseekKey}` },
        body: JSON.stringify({
          model: c.deepseekModel || 'deepseek-chat',
          tools: this.openAITools(),
          messages: [{ role: 'system', content: this.tutorPrompt() }, ...hist.map(m => ({ role: m.role, content: m.content }))],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || r.statusText);
      const msg = j.choices?.[0]?.message || {};
      const text = msg.content || '';
      const calls = (msg.tool_calls || []).map(tc => {
        let args = tc.function?.arguments || '{}';
        if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }
        return { name: tc.function?.name, args: args || {} };
      }).filter(x => x.name);
      if (!text && !calls.length) throw new Error('DeepSeek ไม่ได้ตอบกลับ');
      return { text, calls };
    }
    if (c.provider !== 'gemini') {
      const text = await this.chat(hist.map(m => ({ role: m.role, content: m.content })), this.tutorPrompt());
      return { text, calls: [] };
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.geminiModel)}:generateContent?key=${encodeURIComponent(c.geminiKey)}`;
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: this.tutorPrompt() }] },
        tools: this.tutorTools(),
        contents: hist.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [
            { text: m.content || (m.files && m.files.length ? 'ดูไฟล์ที่แนบ' : '') },
            ...(m.files || []).filter(f => f.base64).map(f => ({ inlineData: { mimeType: f.mime || 'application/octet-stream', data: f.base64 } })),
          ],
        })),
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error?.message || r.statusText);
    const parts = j.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').filter(Boolean).join('\n');
    const calls = parts.filter(p => p.functionCall).map(p => {
      let args = p.functionCall.args || {};
      if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }
      return { name: p.functionCall.name, args: args || {} };
    });
    if (!text && !calls.length) throw new Error('AI ไม่ได้ตอบกลับ (' + (j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'unknown') + ')');
    return { text, calls };
  },

  /* messages: [{role:'user'|'assistant', content, image?:{base64,mimeType}}] */
  async chat(messages, system = this.systemPrompt()) {
    if (!this.ready()) throw new Error('ยังไม่ได้ใส่ API key — ไปที่ ตั้งค่า > AI');
    const c = aiCfg();
    if (c.provider === 'deepseek') {
      const r = await fetch(deepseekEndpoint(c.deepseekProxy), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.deepseekKey}` },
        body: JSON.stringify({
          model: c.deepseekModel || 'deepseek-chat',
          messages: [{ role: 'system', content: system }, ...messages.map(m => ({ role: m.role, content: m.content || '' }))],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || r.statusText);
      const text = j.choices?.[0]?.message?.content || '';
      if (!text) throw new Error('DeepSeek ไม่ได้ตอบกลับ');
      return text;
    } else if (c.provider === 'openai') {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.openaiKey}` },
        body: JSON.stringify({
          model: c.openaiModel,
          messages: [{ role: 'system', content: system }, ...messages.map(m => ({
            role: m.role,
            content: m.image ? [{ type: 'text', text: m.content || '' }, { type: 'image_url', image_url: { url: `data:${m.image.mimeType};base64,${m.image.base64}` } }] : m.content,
          }))],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || r.statusText);
      return j.choices?.[0]?.message?.content || '';
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.geminiModel)}:generateContent?key=${encodeURIComponent(c.geminiKey)}`;
      const r = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }, ...(m.image ? [{ inlineData: { mimeType: m.image.mimeType, data: m.image.base64 } }] : [])],
          })),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || r.statusText);
      const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
      if (!text) throw new Error('AI ไม่ได้ตอบกลับ (' + (j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'unknown') + ')');
      return text;
    }
  },

  async ask(prompt, image) { return this.chat([{ role: 'user', content: prompt, image }]); },

  async json(prompt, image) {
    const txt = await this.chat([{ role: 'user', content: prompt + '\n\nตอบกลับเป็น JSON ที่ถูกต้องเท่านั้น ห้ามมีข้อความอื่นหรือ ``` ครอบ', image }]);
    const m = txt.match(/[\[{][\s\S]*[\]}]/);
    if (!m) throw new Error('AI ตอบกลับไม่ใช่ JSON');
    return JSON.parse(m[0]);
  },

  /* ---- features ---- */
  summarize(subject, chapter) {
    return this.ask(`ช่วยสรุปโน้ตบท "${chapter.title}" วิชา ${subject.name} ให้สั้น กระชับ อ่านทบทวนก่อนสอบได้ง่าย เป็นหัวข้อ bullet และเน้นคำสำคัญเป็นตัวหนา\n\nโน้ต:\n${chapter.note || '(ยังไม่มีโน้ต — ให้สรุปจากความรู้ทั่วไปของหัวข้อนี้)'}`);
  },
  flashcards(subject, chapter, n = 10) {
    return this.json(`สร้างแฟลชการ์ด ${n} ใบ สำหรับทบทวนบท "${chapter.title}" วิชา ${subject.name}
${chapter.note ? 'อ้างอิงจากโน้ตนี้:\n' + chapter.note : '(ไม่มีโน้ต ให้ใช้ความรู้ทั่วไปของหัวข้อนี้)'}
รูปแบบ: [{"q":"คำถาม/คำศัพท์","a":"คำตอบสั้นๆ"}]`);
  },
  quiz(subject, chapter, n = 5) {
    return this.json(`สร้างข้อสอบปรนัย ${n} ข้อ (4 ตัวเลือก) สำหรับบท "${chapter.title}" วิชา ${subject.name} ระดับมหาวิทยาลัย
${chapter.note ? 'อ้างอิงจากโน้ตนี้:\n' + chapter.note : '(ไม่มีโน้ต ให้ใช้ความรู้ทั่วไปของหัวข้อนี้)'}
รูปแบบ: [{"q":"คำถาม","choices":["ก","ข","ค","ง"],"answer":0,"explain":"เหตุผลสั้นๆ"}] (answer คือ index 0-3)`);
  },
  replan(request) {
    const t = todayStr();
    return this.json(`ช่วยจัดตารางอ่านหนังสือใหม่ เริ่มตั้งแต่วันนี้ (${t}) จนถึงวันก่อนสอบแต่ละวิชา
ให้ใส่เฉพาะบทที่ "ยังไม่อ่าน" เท่านั้น และอ่านแต่ละบทให้เสร็จก่อนวันสอบวิชานั้น ปกติวันละประมาณ ${DB.prefs.chaptersPerDay} บท
คำขอเพิ่มเติมของผู้ใช้: ${request || '-'}
รูปแบบ: [{"date":"YYYY-MM-DD","subjectId":"id วิชา","chapterId":"id บท หรือ null ถ้าเป็นการทบทวน","title":"ชื่อบท หรือ งานที่ต้องทำ"}]`);
  },
  parseExams(text, image) {
    const t = todayStr(), beYear = new Date().getFullYear() + 543;
    return this.json(`ดึงข้อมูลวิชาและวันสอบจากข้อความหรือรูปภาพที่ให้มา (วันนี้คือ ${t} / พ.ศ. ${beYear})
แปลงปี พ.ศ. เป็น ค.ศ. เสมอ (เช่น 2569 -> 2026)
ถ้ามีเวลาเป็นช่วง เช่น 08:30 - 11:30 ให้ใส่ช่วงนั้นใน examTime ("08:30 - 11:30") ส่วน room ให้ใส่เฉพาะเลขห้องจริง ถ้าไม่มีห้องให้เป็นค่าว่าง ห้ามใส่ช่วงเวลาลงใน room
ถ้าระบุบท/หัวข้อที่ต้องอ่านด้วย ให้ใส่ใน chapters (เป็น array ของ string) ถ้าไม่มีให้เป็น []
ข้อมูลจากผู้ใช้:
${text || '(ดูจากรูปภาพที่แนบ)'}

รูปแบบ JSON array:
[{"name":"ชื่อวิชา (รวมรหัสวิชาถ้ามี)","examDate":"YYYY-MM-DD หรือ ค่าว่าง","examTime":"HH:MM หรือ ค่าว่าง","room":"ห้องสอบ/ช่วงเวลา หรือ ค่าว่าง","chapters":["บท1"]}]`, image);
  },
};

/* tiny markdown renderer */
function md(src) {
  let s = esc(src);
  s = s.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/^### (.*)$/gm, '<h4>$1</h4>').replace(/^## (.*)$/gm, '<h3>$1</h3>').replace(/^# (.*)$/gm, '<h3>$1</h3>');
  s = s.replace(/^\s*[-*•] (.*)$/gm, '<li>$1</li>').replace(/^\s*(\d+)\. (.*)$/gm, '<li><b>$1.</b> $2</li>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>');
  s = s.replace(/((?:<li>.*<\/li>\n?)+)/g, m => '<ul>' + m.replace(/\n/g, '') + '</ul>\n');
  s = s.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
  s = s.replace(/<br>(<\/?(ul|li|h3|h4|pre))/g, '$1').replace(/(<\/(ul|li|h3|h4|pre)>)<br>/g, '$1');
  return s;
}
