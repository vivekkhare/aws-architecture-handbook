/* ===== Exam Centre: overview, domains, practice, mock exam, flashcards, dashboard, study plan, bridge, cues ===== */
const examByRoute = r => Object.values(EXAMS).find(e => e.route === r);
const bankFor = key => QUESTIONS.filter(q => q.exam === key);
function record(q, ok, mode) {
  const h = store.get('history', []);
  h.push({ id: q.id, exam: q.exam, domain: q.domain, task: q.task, ok: !!ok, mode, ts: Date.now() });
  store.set('history', h.slice(-5000));
}
const isRight = (q, order, sel) => { const want = order.filter(i => q.options[i].ok).sort().join(','), got = sel.slice().sort().join(','); return want === got && want !== ''; };

/* Renders one question. order = shuffled option indexes, sel = chosen indexes, reveal = show answers. */
function renderQ(q, order, sel, reveal, name) {
  const multi = !!q.multi, ex = EXAMS[q.exam];
  let h = '<div class="q' + (reveal ? ' done' : '') + '"><p class="small muted">' + ex.code + ', domain ' + q.domain + ', task ' + q.task + (multi ? '. Choose ' + q.options.filter(o => o.ok).length + '.' : '') + '</p><p class="stem">' + esc(q.stem) + '</p>';
  order.forEach(i => {
    const o = q.options[i], on = sel.includes(i);
    const cls = reveal ? (o.ok ? ' right' : (on ? ' wrong' : '')) : '';
    h += '<label class="opt' + cls + '"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + name + '" value="' + i + '"' + (on ? ' checked' : '') + (reveal ? ' disabled' : '') + ' data-change="pick"><span>' + esc(o.t) +
      (reveal ? '<span class="why"><b>' + (o.ok ? 'Correct. ' : 'Not this one. ') + '</b>' + esc(o.why) + '</span>' : '') + '</span></label>';
  });
  if (reveal) h += '<p class="small">' + (q.doc ? 'Read more: <a href="' + q.doc[1] + '" target="_blank" rel="noopener">' + esc(q.doc[0]) + '</a>' : '') + (q.see ? (q.doc ? ' and ' : 'See ') + '<a href="#' + q.see + '">the handbook page</a>' : '') + (q.verify ? ' ' + VERIFY : '') + '</p>';
  return h + '</div>';
}
const readSel = name => $$('input[name="' + name + '"]:checked').map(i => +i.value);

function examNav(ex, cur) {
  const items = [['', 'Overview'], ['practice', 'Practice'], ['mock', 'Mock exam'], ['dashboard', 'Weak areas'], ['plan', 'Study plan']];
  return '<div class="row noprint" role="navigation" aria-label="' + ex.code + ' sections">' + items.map(i => '<a class="btn' + (cur === i[0] ? ' primary' : '') + '" href="#exam/' + ex.route + (i[0] ? '/' + i[0] : '') + '">' + i[1] + '</a>').join('') + '</div>';
}

/* ---------- Overview and domains ---------- */
function coverage(ex) {
  const keys = new Set();
  ex.domains.forEach(d => d.tasks.forEach(t => pagesForTask(ex.key, t.id).forEach(p => keys.add(p.k))));
  const all = [...keys], done = all.filter(isStudied).length;
  return { total: all.length, done };
}
function taskRows(ex, d) {
  return d.tasks.map(t => {
    const pages = pagesForTask(ex.key, t.id), nq = bankFor(ex.key).filter(q => q.task === t.id).length;
    return '<tr><td><b>' + t.id + '</b></td><td>' + esc(t.name) + '</td><td>' + (pages.length ? pages.map(p => '<a href="#' + p.k + '">' + esc(p.t) + '</a>' + (isStudied(p.k) ? ' ✓' : '')).join('<br>') : '<span class="muted">No pages yet</span>') + '</td><td class="num">' + nq + '</td></tr>';
  }).join('');
}
function viewExamOverview(ex) {
  const cov = coverage(ex), v = ex.factsVerify ? ' ' + VERIFY : '';
  const row = (a, b) => '<tr><th>' + a + '</th><td>' + b + '</td></tr>';
  let html = '<h1>' + esc(ex.name) + ' (' + ex.code + ')</h1><p class="lede">' + esc(ex.guide) + '</p>' + examNav(ex, '') +
    '<h2>Exam facts</h2><div class="tablewrap"><table><tbody>' +
    row('Questions', ex.total + ' (' + ex.scored + ' scored, ' + ex.unscored + ' unscored trial questions you cannot identify)') +
    row('Time', ex.minutes + ' minutes' + v) + row('Pass mark', ex.pass + ' out of 1,000 (scaled score)') + row('Fee', ex.fee + v) +
    row('Question types', 'Multiple choice (one answer) and multiple response (two or more; all must be right). No penalty for guessing.') +
    row('Scoring', 'Compensatory: only the total has to pass, not each domain.') +
    row('Who it is for', esc(ex.candidate)) +
    (ex.notTested ? row('Not tested', ex.notTested.map(esc).join('; ')) : '') +
    row('Official pages', '<a href="' + ex.guideUrl + '" target="_blank" rel="noopener">Exam guide</a> and <a href="' + ex.certUrl + '" target="_blank" rel="noopener">certification page</a>') +
    '</tbody></table></div><p class="small muted">Facts copied from the AWS exam guide on ' + REVIEWED + '. Check the certification page before you book.</p>' +
    '<h2>Domains</h2><div class="tablewrap"><table><thead><tr><th>Domain</th><th class="num">Weight</th><th>Share of exam</th><th class="num">Tasks</th></tr></thead><tbody>' +
    ex.domains.map(d => '<tr><td><a href="#exam/' + ex.route + '/domain/' + d.n + '">' + d.n + '. ' + esc(d.name) + '</a></td><td class="num">' + d.weight + '%</td><td><div class="bar"><i style="width:' + (d.weight * 3) + '%"></i></div></td><td class="num">' + d.tasks.length + '</td></tr>').join('') + '</tbody></table></div>' +
    '<h2>Your coverage</h2><p>' + (cov.total ? 'You have marked <b>' + cov.done + ' of ' + cov.total + '</b> handbook pages mapped to this exam as studied.' : 'No pages are mapped to this exam yet.') + ' The handbook currently holds <b>' + bankFor(ex.key).length + '</b> practice questions for ' + ex.code + '; more arrive with each phase.</p>';
  ex.domains.forEach(d => {
    html += '<h3>Domain ' + d.n + ': ' + esc(d.name) + '</h3><div class="tablewrap"><table><thead><tr><th>Task</th><th>Statement</th><th>Handbook pages</th><th class="num">Questions</th></tr></thead><tbody>' + taskRows(ex, d) + '</tbody></table></div>';
  });
  if (ex.key === 'sap') html += '<div class="note"><p>New to this version of the exam? See <a href="#exam/bridge">everything added in SAP-C03</a>.</p></div>';
  return { title: ex.code, html: page(crumb(['home', 'Start'], ex.code), html) };
}
function taskNotes(ex, t) {
  const n = (TASK_NOTES[ex.key] || {})[t.id]; if (!n) return '';
  return '<details class="sec" open><summary>Task ' + t.id + ': ' + esc(t.name) + '</summary><div class="sec">' +
    '<h3>What to know</h3>' + list(n.know) +
    '<h3>Requirement to answer</h3><div class="tablewrap"><table><thead><tr><th>When the question says</th><th>Think of</th></tr></thead><tbody>' + n.pick.map(p => '<tr><td>' + esc(p[0]) + '</td><td>' + esc(p[1]) + '</td></tr>').join('') + '</tbody></table></div>' +
    '<h3>Traps</h3>' + list(n.traps) + '</div></details>';
}
function viewDomain(ex, n) {
  const d = ex.domains.find(x => x.n === +n); if (!d) return notFound();
  const cues = CUES.filter(c => c.exams.includes(ex.key));
  const fresh = ex.key === 'sap' ? C03_NEW.filter(x => +x.task.split('.')[0] === d.n) : [];
  const html = '<h1>Domain ' + d.n + ': ' + esc(d.name) + '</h1><p class="lede">' + d.weight + '% of scored questions, roughly ' + Math.round(ex.scored * d.weight / 100) + ' of ' + ex.scored + '. ' + esc(d.focus) + '</p>' + examNav(ex, 'x') +
    '<h2>Tasks</h2><div class="tablewrap"><table><thead><tr><th>Task</th><th>Statement</th><th>Handbook pages</th><th class="num">Questions</th></tr></thead><tbody>' + taskRows(ex, d) + '</tbody></table></div>' +
    (fresh.length ? '<h2>Added in SAP-C03 for this domain</h2><ul>' + fresh.map(x => '<li><b>Task ' + x.task + ':</b> ' + esc(x.text) + (x.page ? ' (<a href="#' + x.page + '">handbook page</a>)' : '') + '</li>').join('') + '</ul>' : '') +
    '<div class="row"><a class="btn primary" href="#exam/' + ex.route + '/practice/' + d.n + '">Practise this domain</a><a class="btn" href="#exam/cues">Decision cues (' + cues.length + ')</a></div>' +
    '<h2>Study notes by task</h2>' + d.tasks.map(t => taskNotes(ex, t)).join('');
  return { title: ex.code + ' domain ' + d.n, html: page(crumb(['home', 'Start'], ['exam/' + ex.route, ex.code], 'Domain ' + d.n), html) };
}

/* ---------- Practice mode ---------- */
const P = { key: null, domain: '', wrongOnly: false, pool: [], i: 0, sel: [], shown: false };
function buildPool() {
  let qs = bankFor(P.key);
  if (P.domain) qs = qs.filter(q => q.domain === +P.domain);
  if (P.wrongOnly) { const last = {}; store.get('history', []).forEach(h => { last[h.id] = h.ok; }); qs = qs.filter(q => last[q.id] === false); }
  P.pool = shuffle(qs).map(q => ({ q, order: shuffle(q.options.map((_, i) => i)) }));
  P.i = 0; P.sel = []; P.shown = false;
}
function practiceBody() {
  if (!P.pool.length) return '<div class="note"><p>No questions match. ' + (P.wrongOnly ? 'You have no wrong answers recorded for this filter, so there is nothing to retry.' : 'Questions for this domain have not been written yet.') + '</p></div>';
  if (P.i >= P.pool.length) return '<div class="note"><p><b>You have been through all ' + P.pool.length + ' questions in this set.</b></p></div><div class="row"><button class="btn primary" data-act="p-restart">Go again in a new order</button><a class="btn" href="#exam/' + EXAMS[P.key].route + '/dashboard">See weak areas</a></div>';
  const it = P.pool[P.i];
  return '<p class="muted small">Question ' + (P.i + 1) + ' of ' + P.pool.length + '</p>' + renderQ(it.q, it.order, P.sel, P.shown, 'pq') +
    '<div class="row">' + (P.shown ? '<button class="btn primary" data-act="p-next">Next question</button>' : '<button class="btn primary" data-act="p-check">Check answer</button>') + '</div>';
}
function viewPractice(ex, dom) {
  if (P.key !== ex.key || (dom != null && String(dom) !== P.domain) || !P.pool.length) { P.key = ex.key; P.domain = dom != null ? String(dom) : ''; P.wrongOnly = false; buildPool(); }
  const html = '<h1>' + ex.code + ' practice</h1><p class="lede">One question at a time, with the reason each option is right or wrong. Original questions written for this handbook, not real exam questions.</p>' + examNav(ex, 'practice') +
    '<div class="row noprint"><div class="field"><label for="pDom">Domain</label><select id="pDom" data-change="p-filter"><option value="">All domains</option>' + ex.domains.map(d => '<option value="' + d.n + '"' + (P.domain === String(d.n) ? ' selected' : '') + '>' + d.n + '. ' + esc(d.name) + '</option>').join('') + '</select></div>' +
    '<label class="check" style="align-self:flex-end"><input type="checkbox" id="pWrong" data-change="p-filter"' + (P.wrongOnly ? ' checked' : '') + '><span>Only questions I last got wrong</span></label></div><div id="pBody">' + practiceBody() + '</div>';
  return { title: ex.code + ' practice', html: page(crumb(['home', 'Start'], ['exam/' + ex.route, ex.code], 'Practice'), html) };
}

/* ---------- Mock exam ---------- */
const M = { key: null, items: [], i: 0, endsAt: 0, done: false, timer: null, secs: 0 };
function mockPick(ex) {
  const bank = bankFor(ex.key);
  if (bank.length <= ex.total) return shuffle(bank);
  let out = [];
  ex.domains.forEach(d => { out = out.concat(shuffle(bank.filter(q => q.domain === d.n)).slice(0, Math.round(ex.total * d.weight / 100))); });
  const rest = shuffle(bank.filter(q => !out.includes(q)));
  while (out.length < ex.total && rest.length) out.push(rest.pop());
  return shuffle(out.slice(0, ex.total));
}
const fmt = s => { s = Math.max(0, s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(x).padStart(2, '0'); };
function mockStart(ex) {
  const qs = mockPick(ex);
  M.key = ex.key; M.i = 0; M.done = false;
  M.items = qs.map(q => ({ q, order: shuffle(q.options.map((_, i) => i)), sel: [], flag: false }));
  M.secs = Math.round(ex.minutes * 60 * qs.length / ex.total);
  M.endsAt = Date.now() + M.secs * 1000;
}
function mockFinish() {
  if (M.done) return;
  M.done = true; clearInterval(M.timer);
  M.items.forEach(it => { it.ok = isRight(it.q, it.order, it.sel); record(it.q, it.ok, 'mock'); });
}
function mockRunning(ex) {
  const it = M.items[M.i];
  return '<div class="row"><span>Time left: <span class="timer" id="mTimer">' + fmt(Math.round((M.endsAt - Date.now()) / 1000)) + '</span></span><span class="muted">Question ' + (M.i + 1) + ' of ' + M.items.length + '</span></div>' +
    '<div class="qnav" aria-label="Question navigator">' + M.items.map((x, i) => '<button data-act="m-go" data-i="' + i + '" class="' + (x.sel.length ? 'done' : '') + (x.flag ? ' flag' : '') + (i === M.i ? ' cur' : '') + '" aria-label="Question ' + (i + 1) + (x.sel.length ? ', answered' : ', not answered') + (x.flag ? ', flagged' : '') + '">' + (i + 1) + '</button>').join('') + '</div>' +
    renderQ(it.q, it.order, it.sel, false, 'mq') +
    '<div class="row"><button class="btn" data-act="m-prev"' + (M.i === 0 ? ' disabled' : '') + '>Previous</button><button class="btn" data-act="m-flag">' + (it.flag ? 'Remove flag' : 'Flag for review') + '</button>' +
    (M.i < M.items.length - 1 ? '<button class="btn primary" data-act="m-next">Next</button>' : '') + '<button class="btn" data-act="m-finish">Finish and mark the exam</button></div>';
}
function mockResults(ex) {
  const n = M.items.length, right = M.items.filter(x => x.ok).length, pct = Math.round(100 * right / n);
  const doms = ex.domains.map(d => { const its = M.items.filter(x => x.q.domain === d.n); return { d, n: its.length, r: its.filter(x => x.ok).length }; }).filter(x => x.n);
  return '<h2>Result: ' + right + ' of ' + n + ' correct (' + pct + '%)</h2>' +
    '<div class="note"><p>AWS reports a scaled score with a pass mark of ' + ex.pass + ' out of 1,000, which is not a simple percentage. As a working rule, aim for 80% or more on full-length practice exams before booking.</p></div>' +
    '<div class="tablewrap"><table><thead><tr><th>Domain</th><th class="num">Correct</th><th>Accuracy</th></tr></thead><tbody>' +
    doms.map(x => { const p = Math.round(100 * x.r / x.n); return '<tr><td><a href="#exam/' + ex.route + '/domain/' + x.d.n + '">' + x.d.n + '. ' + esc(x.d.name) + '</a></td><td class="num">' + x.r + ' of ' + x.n + '</td><td><div class="bar ' + (p >= 80 ? 'good' : p < 60 ? 'poor' : '') + '"><i style="width:' + p + '%"></i></div></td></tr>'; }).join('') + '</tbody></table></div>' +
    '<div class="row"><button class="btn primary" data-act="m-new">Start another mock exam</button><a class="btn" href="#exam/' + ex.route + '/dashboard">See weak areas</a></div>' +
    '<h2>Review every question</h2>' + M.items.map((it, i) => '<details class="sec"' + (it.ok ? '' : ' open') + '><summary>Question ' + (i + 1) + ': ' + (it.ok ? 'correct' : 'incorrect') + '</summary><div class="sec">' + renderQ(it.q, it.order, it.sel, true, 'r' + i) + '</div></details>').join('');
}
function mockBody(ex) {
  const bank = bankFor(ex.key).length;
  if (M.key !== ex.key || !M.items.length) {
    const n = Math.min(bank, ex.total), mins = Math.round(ex.minutes * n / ex.total);
    return '<p>The real exam is <b>' + ex.total + ' questions in ' + ex.minutes + ' minutes</b>. Answers and explanations stay hidden until you finish.</p>' +
      (bank < ex.total ? '<div class="note warn"><p>The question bank currently holds <b>' + bank + '</b> ' + ex.code + ' questions, so this mock exam uses all ' + n + ' with the time scaled to <b>' + mins + ' minutes</b> (the same pace as the real exam). Full-length mock exams become available as question batches are added.</p></div>'
        : '<p>Questions are drawn from each domain in proportion to its weight.</p>') +
      (bank ? '<div class="row"><button class="btn primary" data-act="m-start">Start mock exam</button></div>' : '');
  }
  return M.done ? mockResults(ex) : mockRunning(ex);
}
function viewMock(ex) {
  const html = '<h1>' + ex.code + ' mock exam</h1>' + examNav(ex, 'mock') + '<div id="mBody">' + mockBody(ex) + '</div>';
  return { title: ex.code + ' mock exam', html: page(crumb(['home', 'Start'], ['exam/' + ex.route, ex.code], 'Mock exam'), html),
    after() { mockTick(ex); }, cleanup() { clearInterval(M.timer); } };
}
function mockTick(ex) {
  clearInterval(M.timer);
  if (M.key !== ex.key || !M.items.length || M.done) return;
  M.timer = setInterval(() => {
    const left = Math.round((M.endsAt - Date.now()) / 1000), el = $('#mTimer');
    if (left <= 0) { mockSave(); mockFinish(); $('#mBody').innerHTML = mockBody(ex); return; }
    if (el) el.textContent = fmt(left);
  }, 1000);
}
const mockSave = () => { if (M.items.length && !M.done && $('input[name="mq"]')) M.items[M.i].sel = readSel('mq'); };
const mockRedraw = () => { const ex = EXAMS[M.key]; $('#mBody').innerHTML = mockBody(ex); };

/* ---------- Dashboard ---------- */
function viewDashboard(ex) {
  const h = store.get('history', []).filter(x => x.exam === ex.key);
  let html = '<h1>' + ex.code + ' weak areas</h1>' + examNav(ex, 'dashboard');
  if (!h.length) html += '<div class="note"><p>No answers recorded yet. Answer some <a href="#exam/' + ex.route + '/practice">practice questions</a> or sit a <a href="#exam/' + ex.route + '/mock">mock exam</a>, and this page will show where to focus.</p></div>';
  else {
    const stat = f => { const a = h.filter(f); return { n: a.length, p: a.length ? Math.round(100 * a.filter(x => x.ok).length / a.length) : null }; };
    const all = stat(() => true);
    html += '<p class="lede">' + all.n + ' answers recorded, ' + all.p + '% correct overall.</p><h2>By domain</h2><div class="tablewrap"><table><thead><tr><th>Domain</th><th class="num">Weight</th><th class="num">Answers</th><th class="num">Correct</th><th>Accuracy</th></tr></thead><tbody>' +
      ex.domains.map(d => { const s = stat(x => x.domain === d.n); return '<tr><td><a href="#exam/' + ex.route + '/domain/' + d.n + '">' + d.n + '. ' + esc(d.name) + '</a></td><td class="num">' + d.weight + '%</td><td class="num">' + s.n + '</td><td class="num">' + (s.p == null ? 'none yet' : s.p + '%') + '</td><td>' + (s.p == null ? '' : '<div class="bar ' + (s.p >= 80 ? 'good' : s.p < 60 ? 'poor' : '') + '"><i style="width:' + s.p + '%"></i></div>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    const weak = [];
    ex.domains.forEach(d => d.tasks.forEach(t => { const s = stat(x => x.task === t.id); if (s.n && s.p < 80) weak.push({ d, t, s }); }));
    weak.sort((a, b) => a.s.p - b.s.p);
    html += '<h2>Tasks to revisit</h2>' + (weak.length ? '<div class="tablewrap"><table><thead><tr><th>Task</th><th class="num">Correct</th><th>Re-read</th></tr></thead><tbody>' + weak.map(w => { const pg = pagesForTask(ex.key, w.t.id); return '<tr><td><b>' + w.t.id + '</b> ' + esc(w.t.name) + '</td><td class="num">' + w.s.p + '% of ' + w.s.n + '</td><td>' + (pg.length ? pg.map(p => '<a href="#' + p.k + '">' + esc(p.t) + '</a>').join('<br>') : '<span class="muted">No pages yet</span>') + '</td></tr>'; }).join('') + '</tbody></table></div><div class="row"><a class="btn primary" href="#exam/' + ex.route + '/practice">Practise</a></div>'
      : '<p>Every task you have attempted is at 80% or above.</p>');
  }
  return { title: ex.code + ' weak areas', html: page(crumb(['home', 'Start'], ['exam/' + ex.route, ex.code], 'Weak areas'), html) };
}

/* ---------- Study plan ---------- */
function planTable(ex, date, hours) {
  const days = Math.floor((new Date(date + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000);
  if (!date || isNaN(days)) return '<p class="err">Choose your exam date.</p>';
  if (days < 7) return '<p class="err">Pick a date at least one week away.</p>';
  if (!(hours >= 1)) return '<p class="err">Enter the hours you can study each week.</p>';
  const weeks = Math.floor(days / 7), mock = weeks >= 6 ? 2 : 1, study = weeks - mock;
  if (study < 1) return '<p class="err">With ' + weeks + ' week' + (weeks === 1 ? '' : 's') + ' left there is only time for mock exams and review. Do one timed mock exam, then revise your weakest domain.</p>';
  let left = ex.domains.map(d => ({ d, h: study * hours * d.weight / 100 })), rows = '';
  for (let w = 1; w <= study; w++) {
    let cap = hours; const parts = [];
    while (cap > 0.01 && left.length) { const cur = left[0], take = Math.min(cap, cur.h); parts.push('Domain ' + cur.d.n + ' (' + esc(cur.d.name) + '): ' + (Math.round(take * 10) / 10) + ' h'); cur.h -= take; cap -= take; if (cur.h <= 0.01) left.shift(); }
    rows += '<tr><td>Week ' + w + '</td><td>' + parts.join('<br>') + '</td></tr>';
  }
  for (let w = 1; w <= mock; w++) rows += '<tr><td>Week ' + (study + w) + '</td><td>Timed mock exams, then review every wrong answer and re-read those pages' + (w === mock ? '. Rest the day before the exam.' : '.') + '</td></tr>';
  return '<p><b>' + weeks + ' full weeks</b> until ' + esc(date) + ', about <b>' + Math.round(weeks * hours) + ' hours</b> in total. Domains get time in proportion to their exam weight.</p><div class="tablewrap"><table><thead><tr><th>Week</th><th>Focus</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}
function viewPlan(ex) {
  const saved = (store.get('plan', {}) || {})[ex.key] || {};
  const html = '<h1>' + ex.code + ' study plan</h1>' + examNav(ex, 'plan') + '<p class="lede">Enter your exam date and weekly hours. The plan splits your time by domain weight and keeps the final weeks for mock exams.</p>' +
    '<div class="row"><div class="field"><label for="plDate">Exam date</label><input type="date" id="plDate" value="' + esc(saved.date || '') + '" min="' + today() + '"></div><div class="field"><label for="plHours">Hours per week</label><input type="number" id="plHours" min="1" max="60" step="1" value="' + esc(saved.hours || 10) + '" style="width:6rem"></div><button class="btn primary" data-act="plan" data-key="' + ex.key + '" style="align-self:flex-end">Build plan</button></div>' +
    '<div id="plOut">' + (saved.date ? planTable(ex, saved.date, +saved.hours) : '') + '</div>';
  return { title: ex.code + ' study plan', html: page(crumb(['home', 'Start'], ['exam/' + ex.route, ex.code], 'Study plan'), html) };
}

/* ---------- Flashcards (Leitner boxes) ---------- */
const BOX_DAYS = [0, 1, 3, 7, 14, 30];
const F = { filter: '', queue: null, show: false };
function flashQueue() {
  const st = store.get('cards', {}), t = today();
  return shuffle(FLASHCARDS.filter(c => (!F.filter || c.exams.includes(F.filter)) && (!st[c.id] || st[c.id].due <= t)).map(c => c.id));
}
function flashBody() {
  if (!F.queue) F.queue = flashQueue();
  if (!F.queue.length) return '<div class="note"><p><b>Nothing due today.</b> Cards you know come back after 1, 3, 7, 14 and then 30 days. Cards you miss come back the same day.</p></div>';
  const c = byId(FLASHCARDS, F.queue[0]);
  return '<p class="muted small">' + F.queue.length + ' card' + (F.queue.length === 1 ? '' : 's') + ' due</p><div class="flash"><p><b>' + esc(c.q) + '</b></p>' + (F.show ? '<p class="a">' + esc(c.a) + '</p>' : '') + '</div>' +
    '<div class="row">' + (F.show ? '<button class="btn primary" data-act="f-yes">I knew it</button><button class="btn" data-act="f-no">Not yet</button>' : '<button class="btn primary" data-act="f-show">Show answer</button>') + '</div>';
}
function viewFlash() {
  F.queue = null; F.show = false;
  const html = '<h1>Flashcards</h1><p class="lede">A few minutes a day. Say the answer to yourself before you reveal it.</p><div class="row noprint"><div class="field"><label for="fEx">Exam</label><select id="fEx" data-change="f-filter"><option value="">Both exams</option><option value="saa"' + (F.filter === 'saa' ? ' selected' : '') + '>SAA-C03</option><option value="sap"' + (F.filter === 'sap' ? ' selected' : '') + '>SAP-C03</option></select></div></div><div id="fBody">' + flashBody() + '</div>' +
    '<p class="muted small">' + FLASHCARDS.length + ' cards in total.</p>';
  return { title: 'Flashcards', html: page(crumb(['home', 'Start'], 'Flashcards'), html) };
}
function flashGrade(knew) {
  const st = store.get('cards', {}), id = F.queue.shift(), cur = st[id] || { box: 0 };
  const box = knew ? Math.min(5, cur.box + 1) : 1, d = new Date(); d.setDate(d.getDate() + (knew ? BOX_DAYS[box] : 0));
  st[id] = { box, due: localDate(d) }; store.set('cards', st);
  if (!knew) F.queue.push(id);
  F.show = false; $('#fBody').innerHTML = flashBody();
}

/* ---------- Bridge and cues ---------- */
function viewBridge() {
  const sap = EXAMS.sap;
  const html = '<h1>From Associate to Professional</h1><p class="lede">The Professional exam assumes everything in the Associate exam and asks about scale: many accounts, hybrid networks, migration, cost across an organisation, and AI. This page shows the step up for each topic.</p>' +
    '<div class="tablewrap"><table><thead><tr><th>Topic</th><th>Associate expects</th><th>Professional adds</th><th>Pages</th></tr></thead><tbody>' +
    BRIDGE.map(b => '<tr><th>' + esc(b.topic) + '</th><td>' + esc(b.assoc) + '</td><td>' + esc(b.pro) + '</td><td>' + (b.pages.length ? b.pages.map(p => { const t = p.split('/'); const o = t[0] === 'service' ? byId(SERVICES, t[1]) : t[0] === 'walkthrough' ? byId(WALKTHROUGHS, t[1]) : byId(COMPARISONS, t[1]); return '<a href="#' + p + '">' + esc(o ? (o.name || o.title) : p) + '</a>'; }).join('<br>') : '<span class="muted">Later phase</span>') + '</td></tr>').join('') + '</tbody></table></div>' +
    '<h2>Everything added in SAP-C03</h2><p>SAP-C03 replaced SAP-C02 on 17 November 2026. Courses and practice tests written for C02 do not cover the items below. Source: the comparison page in the official exam guide.</p>' +
    sap.domains.map(d => { const its = C03_NEW.filter(x => +x.task.split('.')[0] === d.n); return '<h3>Domain ' + d.n + ': ' + esc(d.name) + ' (' + d.weight + '%)</h3><ul>' + its.map(x => '<li><b>Task ' + x.task + ':</b> ' + esc(x.text) + (x.page ? ' (<a href="#' + x.page + '">handbook page</a>)' : '') + '</li>').join('') + '</ul>'; }).join('') +
    '<h2>Services added to the in-scope list</h2><p>' + C03_SCOPE_ADDED.map(esc).join(', ') + '.</p>' +
    '<h2>Removed from the in-scope list</h2><p>' + C03_SCOPE_REMOVED.map(esc).join('; ') + '.</p>' +
    '<div class="note"><p>AWS notes that removed items "might still be implicit" in other skills, so do not treat removal as a guarantee they never appear.</p></div>';
  return { title: 'Associate to Professional', html: page(crumb(['home', 'Start'], 'Associate to Professional'), html) };
}
function viewCues() {
  const tag = c => c.exams.map(e => '<span class="badge">' + EXAMS[e].code + '</span>').join(' ');
  const html = '<h1>Decision cues</h1><p class="lede">Exam questions describe a need in particular words. These are the phrases worth recognising and what they usually point to. They are a starting point for reasoning, not a substitute for reading the whole question.</p>' +
    '<div class="tablewrap"><table><thead><tr><th>When the question says</th><th>It usually points to</th><th>Exam</th></tr></thead><tbody>' + CUES.map(c => '<tr><th>' + esc(c.phrase) + '</th><td>' + esc(c.signal) + '</td><td>' + tag(c) + '</td></tr>').join('') + '</tbody></table></div>' +
    '<p class="muted small">' + CUES.length + ' cues: ' + CUES.filter(c => c.exams.includes('saa')).length + ' apply to SAA-C03 and ' + CUES.filter(c => c.exams.includes('sap')).length + ' to SAP-C03.</p>';
  return { title: 'Decision cues', html: page(crumb(['home', 'Start'], 'Decision cues'), html) };
}

/* ---------- Routing and actions ---------- */
function viewExamRoute(p) {
  if (p[0] === 'bridge') return viewBridge();
  if (p[0] === 'cues') return viewCues();
  if (p[0] === 'flashcards') return viewFlash();
  const ex = examByRoute(p[0]); if (!ex) return notFound();
  switch (p[1]) {
    case undefined: case '': return viewExamOverview(ex);
    case 'domain': return viewDomain(ex, p[2]);
    case 'practice': return viewPractice(ex, p[2]);
    case 'mock': return viewMock(ex);
    case 'dashboard': return viewDashboard(ex);
    case 'plan': return viewPlan(ex);
    default: return notFound();
  }
}
Object.assign(ACTIONS, {
  'p-check'() { const it = P.pool[P.i]; P.sel = readSel('pq'); if (!P.sel.length) return; P.shown = true; record(it.q, isRight(it.q, it.order, P.sel), 'practice'); $('#pBody').innerHTML = practiceBody(); },
  'p-next'() { P.i++; P.sel = []; P.shown = false; $('#pBody').innerHTML = practiceBody(); window.scrollTo(0, 0); },
  'p-restart'() { buildPool(); $('#pBody').innerHTML = practiceBody(); },
  'm-start'() { const ex = examByRoute(location.hash.split('/')[1]); mockStart(ex); mockRedraw(); mockTick(ex); },
  'm-new'() { M.items = []; M.done = false; mockRedraw(); window.scrollTo(0, 0); },
  'm-go'(el) { mockSave(); M.i = +el.dataset.i; mockRedraw(); },
  'm-prev'() { mockSave(); M.i = Math.max(0, M.i - 1); mockRedraw(); },
  'm-next'() { mockSave(); M.i = Math.min(M.items.length - 1, M.i + 1); mockRedraw(); },
  'm-flag'() { mockSave(); M.items[M.i].flag = !M.items[M.i].flag; mockRedraw(); },
  'm-finish'(el) {
    mockSave();
    const blank = M.items.filter(x => !x.sel.length).length;
    if (blank && !el.dataset.armed) { el.dataset.armed = '1'; el.textContent = blank + ' unanswered. Click again to finish anyway'; return; }
    mockFinish(); mockRedraw(); window.scrollTo(0, 0);
  },
  plan(el) { const ex = EXAMS[el.dataset.key], date = $('#plDate').value, hours = +$('#plHours').value; const pl = store.get('plan', {}) || {}; pl[ex.key] = { date, hours }; store.set('plan', pl); $('#plOut').innerHTML = planTable(ex, date, hours); },
  'f-show'() { F.show = true; $('#fBody').innerHTML = flashBody(); },
  'f-yes'() { flashGrade(true); },
  'f-no'() { flashGrade(false); }
});
Object.assign(CHANGES, {
  pick() { /* selections are read when the answer is checked or the question changes */ },
  'p-filter'() { P.domain = $('#pDom').value; P.wrongOnly = $('#pWrong').checked; buildPool(); $('#pBody').innerHTML = practiceBody(); },
  'f-filter'(el) { F.filter = el.value; F.queue = null; F.show = false; $('#fBody').innerHTML = flashBody(); }
});
init();
