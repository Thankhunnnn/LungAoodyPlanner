/* ===== Auto study scheduler =====
 * - keeps: done items, manual items
 * - removes: undone auto items (they'll be re-planned, incl. missed ones)
 * - each day has N slots (prefs.chaptersPerDay)
 * - day before an exam = review that subject (optional)
 * - picks the subject with the highest "remaining chapters / days left" ratio
 */
function autoSchedule() {
  const today = todayStr();
  const perDay = Math.max(1, parseInt(DB.prefs.chaptersPerDay) || 1);
  const review = !!DB.prefs.reviewDayBefore;

  DB.plan = DB.plan.filter(p => p.done || !p.auto);
  const manualPlanned = new Set(DB.plan.filter(p => p.chapterId && !p.done).map(p => p.chapterId));

  const subs = DB.subjects
    .filter(s => s.examDate && s.examDate > today)
    .map(s => ({
      s,
      queue: s.chapters
        .filter(c => !c.done && !manualPlanned.has(c.id))
        .sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0)),
    }));
  if (!subs.length) return { added: 0, leftover: 0, noExam: true };

  const lastExam = subs.reduce((m, x) => x.s.examDate > m ? x.s.examDate : m, today);
  let added = 0;
  const reviewDay = s => addDays(s.examDate, -1);

  for (let d = today; d < lastExam; d = addDays(d, 1)) {
    if (typeof isBlackoutDate === 'function' && isBlackoutDate(d)) continue;
    let slots = perDay;
    if (review) {
      subs.filter(x => reviewDay(x.s) === d).forEach(x => {
        DB.plan.push({ id: uid(), date: d, subjectId: x.s.id, chapterId: null, title: `ทบทวนทั้งวิชาก่อนสอบ`, kind: 'review', done: false, auto: true });
        slots--; added++;
      });
    }
    while (slots > 0) {
      const cands = subs.filter(x => x.queue.length && x.s.examDate > d && !(review && reviewDay(x.s) === d));
      if (!cands.length) break;
      const score = x => x.queue.length / Math.max(1, daysBetween(d, x.s.examDate) - (review ? 1 : 0));
      cands.sort((a, b) => score(b) - score(a) || a.s.examDate.localeCompare(b.s.examDate));
      const x = cands[0];
      const c = x.queue.shift();
      DB.plan.push({ id: uid(), date: d, subjectId: x.s.id, chapterId: c.id, title: c.title, kind: 'read', done: false, auto: true });
      slots--; added++;
    }
  }
  const leftover = subs.reduce((a, x) => a + x.queue.length, 0);
  return { added, leftover };
}

function planForDate(d) {
  return DB.plan.filter(p => p.date === d).sort((a, b) => (a.done - b.done) || subjectName(a.subjectId).localeCompare(subjectName(b.subjectId)));
}
