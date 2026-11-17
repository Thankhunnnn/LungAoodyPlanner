/* ===== AI (Gemini / OpenAI) ===== */
const AI = {
  ready() {
    const c = aiCfg();
    return c.provider === 'openai' ? !!c.openaiKey : !!c.geminiKey;
  },
  providerLabel() { const c = aiCfg(); return c.provider === 'openai' ? `OpenAI · ${c.openaiModel}` : `Gemini · ${c.geminiModel}`; },

  context() {
    const t = todayStr();
    const lines = [`วันนี้คือ ${t} (${fmtDateLong(t)})`, `ชื่อผู้ใช้: ${DB.name || '-'}`, 'วิชาและความคืบหน้า:'];
    DB.subjects.forEach(s => {
      const p = subjectProgress(s);
      lines.push(`- [id:${s.id}] ${s.name} | สอบ ${s.examDate || 'ยังไม่กำหนด'} ${s.examTime || ''} ${s.room ? 'ห้อง ' + s.room : ''} | อ่านแล้ว ${p.done}/${p.total}`);
      s.chapters.forEach(c => lines.push(`    • [id:${c.id}] ${c.title} ${c.done ? '(อ่านแล้ว)' : '(ยังไม่อ่าน)'}`));
    });
    const tp = planForDate(t);
    if (tp.length) lines.push('แผนวันนี้: ' + tp.map(p => `${subjectName(p.subjectId)}: ${p.title}${p.done ? ' ✓' : ''}`).join(', '));
    return lines.join('\n');
  },

  systemPrompt() {
    return `คุณคือ "น้องติว" ผู้ช่วยติวหนังสือที่น่ารัก ใจดี พูดภาษาไทยเป็นกันเอง ลงท้ายด้วย ค่ะ/นะคะ
หน้าที่: อธิบายเนื้อหาให้เข้าใจง่าย ยกตัวอย่าง ช่วยสรุป ทำข้อสอบ และช่วยวางแผนการอ่าน
ใช้ markdown ได้ (หัวข้อ, bullet, ตัวหนา) ตอบกระชับ ชัดเจน

ข้อมูลของผู้ใช้ตอนนี้:
${this.context()}`;
  },

  /* messages: [{role:'user'|'assistant', content, image?:{base64,mimeType}}] */
  async chat(messages, system = this.systemPrompt()) {
    if (!this.ready()) throw new Error('ยังไม่ได้ใส่ API key — ไปที่ ตั้งค่า > AI');
    const c = aiCfg();
    if (c.provider === 'openai') {
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
ถ้ามีเวลาเป็นช่วง เช่น 08:30 - 11:30 ให้ใส่ examTime เป็นเวลาเริ่ม ("08:30") และใส่ช่วงเวลาเต็มหรือห้องสอบใน room (ถ้าไม่มีห้องสอบให้ใส่ช่วงเวลาหรือค่าว่าง)
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
