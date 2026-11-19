/* ===== Core: storage, helpers, diagram renderer, reference views, tools, router ===== */
'use strict';
const mem = {};
const store = {
  get(k, d) {
    if (k in mem) return mem[k];
    try { const v = localStorage.getItem('awsh:' + k); if (v != null) { mem[k] = JSON.parse(v); return mem[k]; } } catch (e) {}
    return d;
  },
  set(k, v) { mem[k] = v; try { localStorage.setItem('awsh:' + k, JSON.stringify(v)); } catch (e) {} },
  keys: ['theme', 'size', 'studied', 'checks', 'history', 'cards', 'plan']
};
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const VERIFY = '<span class="verify" title="Not confirmed against current AWS documentation. Check before relying on it.">Verify</span>';
const rich = h => String(h).replace(/\[\[verify\]\]/g, VERIFY);
const strip = h => String(h).replace(/\[\[verify\]\]/g, ' ').replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const byId = (arr, id) => arr.find(x => x.id === id);
const list = a => (a && a.length) ? '<ul>' + a.map(x => '<li>' + rich(x) + '</li>').join('') + '</ul>' : '';
const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => localDate(new Date());
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const MGMT = { aws: 'AWS-managed', self: 'Self-managed on AWS', third: 'Third-party tool' };
const STATUS = { current: 'Current', legacy: 'Legacy', avoid: 'Not recommended for new builds' };

function page(crumbs, html) {
  return '<div class="page">' + (crumbs ? '<nav class="crumbs" aria-label="Breadcrumb">' + crumbs + '</nav>' : '') + html +
    '<footer class="rev">Last reviewed: ' + REVIEWED + '. AWS changes often, so check the official AWS documentation before relying on a detail. Anything marked ' + VERIFY + ' could not be confirmed. This is an unofficial study guide, not affiliated with or endorsed by Amazon Web Services. AWS and its service names are trademarks of Amazon.com, Inc. or its affiliates.</footer></div>';
}
const crumb = (...parts) => parts.map(p => Array.isArray(p) ? '<a href="#' + p[0] + '">' + esc(p[1]) + '</a>' : esc(p)).join(' / ');
const notFound = () => ({ title: 'Not found', html: page('', '<h1>Page not found</h1><p>That page does not exist in this build. It may arrive in a later phase.</p><p><a class="btn" href="#home">Go to the start page</a></p>') });

/* ---------- Exam scope ---------- */
function scopeOf(s, key) {
  const names = s.scopeNames || [s.name];
  if (names.some(n => SCOPE[key].in.includes(n))) return 'in';
  if (names.some(n => SCOPE[key].out.includes(n))) return 'out';
  return 'unlisted';
}
function scopeBadge(s, key) {
  const v = scopeOf(s, key), code = EXAMS[key].code;
  return '<span class="badge ' + (v === 'unlisted' ? '' : v) + '">' + code + ': ' + (v === 'in' ? 'in scope' : v === 'out' ? 'out of scope' : 'not listed') + '</span>';
}
function pagesForTask(key, taskId) {
  const out = [];
  SERVICES.forEach(s => { if (s.exam && (s.exam[key] || []).includes(taskId)) out.push({ k: 'service/' + s.id, t: s.name }); });
  WALKTHROUGHS.forEach(w => { if (((w.tasks || {})[key] || []).includes(taskId)) out.push({ k: 'walkthrough/' + w.id, t: w.title }); });
  COMPARISONS.forEach(c => { if (((c.tasks || {})[key] || []).includes(taskId)) out.push({ k: 'compare/' + c.id, t: c.title }); });
  CONCEPTS.forEach(c => { if (((c.tasks || {})[key] || []).includes(taskId)) out.push({ k: 'concept/' + c.id, t: c.title }); });
  return out;
}
const taskName = (key, id) => { for (const d of EXAMS[key].domains) { const t = d.tasks.find(x => x.id === id); if (t) return t.name; } return ''; };
const isStudied = k => !!store.get('studied', {})[k];
function studiedBtn(k) {
  const on = isStudied(k);
  return '<button class="btn noprint" data-act="studied" data-key="' + k + '" aria-pressed="' + on + '">' + (on ? 'Studied ✓ (click to unmark)' : 'Mark as studied') + '</button>';
}

/* ---------- Diagram renderer (inline SVG from data) ---------- */
let dgSeq = 0;
function diagram(d) {
  if (!d) return '';
  const id = 'dg' + (++dgSeq), nodes = {};
  d.nodes.forEach(n => { nodes[n.id] = n; });
  const edgePt = (n, tx, ty) => {
    const cx = n.x + n.w / 2, cy = n.y + n.h / 2, dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return [cx, cy];
    const s = Math.min(dx ? (n.w / 2) / Math.abs(dx) : Infinity, dy ? (n.h / 2) / Math.abs(dy) : Infinity);
    return [cx + dx * s, cy + dy * s];
  };
  let g = '', gl = '', e = '', el = '', n = '';
  (d.groups || []).forEach(q => {
    g += '<rect class="dg-group ' + (q.cls || '') + '" x="' + q.x + '" y="' + q.y + '" width="' + q.w + '" height="' + q.h + '" rx="8"/>';
    gl += '<text class="dg-glabel ' + (q.cls || '') + '" x="' + (q.x + 9) + '" y="' + (q.y + 17) + '">' + esc(q.label) + '</text>';
  });
  (d.edges || []).forEach(q => {
    const a = nodes[q.from], b = nodes[q.to]; if (!a || !b) return;
    let p1, p2;
    if (q.hz) { const y = a.y + a.h / 2; p1 = [a.x + a.w, y]; p2 = [b.x, y]; }
    else { p1 = edgePt(a, b.x + b.w / 2, b.y + b.h / 2); p2 = edgePt(b, a.x + a.w / 2, a.y + a.h / 2); }
    const lp = q.lp == null ? 0.5 : q.lp;
    e += '<line class="dg-edge' + (q.dashed ? ' dashed' : '') + '" x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" marker-end="url(#' + id + 'a)"/>';
    if (q.label) el += '<text class="dg-elabel" x="' + (p1[0] + (p2[0] - p1[0]) * lp).toFixed(1) + '" y="' + (p1[1] + (p2[1] - p1[1]) * lp + 4).toFixed(1) + '">' + esc(q.label) + '</text>';
  });
  d.nodes.forEach(q => {
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2;
    n += '<rect class="dg-node ' + (q.kind || 'external') + '" x="' + q.x + '" y="' + q.y + '" width="' + q.w + '" height="' + q.h + '" rx="7"/>' +
      '<text class="dg-label" x="' + cx + '" y="' + (cy + (q.sub ? -3 : 4.5)) + '">' + esc(q.label) + '</text>' +
      (q.sub ? '<text class="dg-sub" x="' + cx + '" y="' + (cy + 12) + '">' + esc(q.sub) + '</text>' : '');
  });
  return '<figure class="diagram"><div class="dg-scroll"><svg viewBox="0 0 ' + d.w + ' ' + d.h + '" role="img" aria-label="' + esc(d.caption || 'Architecture diagram') + '">' +
    '<defs><marker id="' + id + 'a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="dg-arrow" d="M0 0L10 5L0 10z"/></marker></defs>' +
    g + e + gl + n + el + '</svg></div>' + (d.caption ? '<figcaption>' + esc(d.caption) + '</figcaption>' : '') + '</figure>';
}

/* ---------- Home ---------- */
function viewHome() {
  const studied = Object.keys(store.get('studied', {})).filter(k => store.get('studied', {})[k]).length;
  const hist = store.get('history', []), right = hist.filter(h => h.ok).length;
  const totalPages = SERVICES.length + WALKTHROUGHS.length + COMPARISONS.length + CONCEPTS.length;
  const html = '<h1>AWS Architecture Handbook and Exam Centre</h1>' +
    '<p class="lede">A working reference for designing on AWS, with preparation for the Solutions Architect Associate (SAA-C03) and Professional (SAP-C03) exams. Everything runs from this one file, offline.</p>' +
    '<div class="grid">' +
    '<a class="card" href="#exam/saa-c03"><h3>Associate exam (SAA-C03)</h3><p>Domains, tasks, practice questions and a timed mock exam.</p></a>' +
    '<a class="card" href="#exam/sap-c03"><h3>Professional exam (SAP-C03)</h3><p>The new five-domain exam, with everything added in C03.</p></a>' +
    '<a class="card" href="#catalogue"><h3>Service reference</h3><p>Every service on the same template: how it works, when not to use it, cost, mistakes.</p></a>' +
    '<a class="card" href="#concepts"><h3>Concepts</h3><p>The ideas behind the services: DR, policy evaluation, multi-account, resilience, generative AI.</p></a>' +
    '<a class="card" href="#walkthroughs"><h3>Architecture walkthroughs</h3><p>' + WALKTHROUGHS.length + ' complete designs with diagrams, request flow and failure handling.</p></a>' +
    '<a class="card" href="#compares"><h3>Comparisons</h3><p>' + COMPARISONS.length + ' decision tables for services that are easy to confuse.</p></a>' +
    '<a class="card" href="#payments"><h3>NZ payments platform</h3><p>One worked example from git push to production, with a threat model.</p></a>' +
    '<a class="card" href="#roadmap"><h3>Learning roadmap</h3><p>Foundations, Associate, Professional, interviews: what to read in what order.</p></a>' +
    '<a class="card" href="#tools/cidr"><h3>CIDR calculator</h3><p>Plan a VPC range and split it into public, private and isolated subnets.</p></a>' +
    '<a class="card" href="#exam/flashcards"><h3>Flashcards</h3><p>Short daily review with spaced repetition.</p></a></div>' +
    '<h2>Your progress</h2><div class="tablewrap"><table><tbody>' +
    '<tr><th>Pages marked as studied</th><td class="num">' + studied + ' of ' + totalPages + '</td></tr>' +
    '<tr><th>Practice questions answered</th><td class="num">' + hist.length + '</td></tr>' +
    '<tr><th>Answered correctly</th><td class="num">' + (hist.length ? Math.round(100 * right / hist.length) + '%' : 'No attempts yet') + '</td></tr></tbody></table></div>' +
    '<h2>What this build contains</h2><p>' + SERVICES.length + ' service entries, ' + CONCEPTS.length + ' concept pages, ' + WALKTHROUGHS.length + ' walkthroughs, ' + COMPARISONS.length + ' comparisons, ' + QUESTIONS.length + ' practice questions, ' + FLASHCARDS.length + ' flashcards and ' + CUES.length + ' decision cues.</p>' +
    '<div class="tablewrap"><table><thead><tr><th>Phase</th><th>Contents</th><th>Status</th></tr></thead><tbody>' +
    BUILD.map(b => '<tr><td>' + esc(b.phase) + '</td><td>' + esc(b.what) + '</td><td>' + (b.done ? '<span class="badge in">In this file</span>' : '<span class="badge">Not built yet</span>') + '</td></tr>').join('') +
    '</tbody></table></div>' +
    '<div class="note"><p><b>Unofficial.</b> This is an independent study guide. It is not produced, endorsed or reviewed by Amazon Web Services.</p></div>' +
    '<div class="note warn"><p><b>How far to trust this.</b> The exam facts, domains, task statements and in-scope service lists were copied from AWS\'s exam guides on ' + REVIEWED + '. The explanations were written from general AWS knowledge, not checked line by line against the documentation, and AWS changes services often. Quotas, newer features and anything marked ' + VERIFY + ' should be checked against the linked documentation. Practice questions are original, not real exam questions.</p></div>';
  return { title: 'Start', html: page('', html) };
}

/* ---------- Catalogue and categories ---------- */
const catFilter = { cat: '', tier: '', scope: '', status: '' };
function catalogueRows() {
  const rows = SERVICES.filter(s => {
    if (catFilter.cat && s.category !== catFilter.cat) return false;
    if (catFilter.tier && String(s.tier) !== catFilter.tier) return false;
    if (catFilter.status && s.status !== catFilter.status) return false;
    const a = scopeOf(s, 'saa') === 'in', p = scopeOf(s, 'sap') === 'in';
    if (catFilter.scope === 'saa' && !a) return false;
    if (catFilter.scope === 'sap' && !p) return false;
    if (catFilter.scope === 'both' && !(a && p)) return false;
    if (catFilter.scope === 'neither' && (a || p)) return false;
    return true;
  });
  if (!rows.length) return '<tr><td colspan="6">No services match these filters in this build. Clear a filter, or check the phase list on the start page.</td></tr>';
  return rows.map(s => '<tr><td><a href="#service/' + s.id + '">' + esc(s.name) + '</a>' + (isStudied('service/' + s.id) ? ' ✓' : '') + '<br><span class="muted small">' + esc(s.summary) + '</span></td>' +
    '<td>' + esc(byId(CATEGORIES, s.category).name) + '</td><td>Tier ' + s.tier + '</td><td>' + scopeBadge(s, 'saa') + '</td><td>' + scopeBadge(s, 'sap') + '</td><td>' + STATUS[s.status] + '</td></tr>').join('');
}
function viewCatalogue() {
  const opt = (v, t, cur) => '<option value="' + v + '"' + (cur === v ? ' selected' : '') + '>' + esc(t) + '</option>';
  const html = '<h1>Service reference</h1><p class="lede">Every service uses the same template so you can compare like with like. Tier 1 services get the full treatment, Tier 2 a shorter version, Tier 3 a catalogue card.</p>' +
    '<div class="row noprint">' +
    '<div class="field"><label for="fCat">Category</label><select id="fCat" data-change="catfilter" data-f="cat">' + opt('', 'All categories', catFilter.cat) + CATEGORIES.map(c => opt(c.id, c.name, catFilter.cat)).join('') + '</select></div>' +
    '<div class="field"><label for="fTier">Tier</label><select id="fTier" data-change="catfilter" data-f="tier">' + opt('', 'All tiers', catFilter.tier) + opt('1', 'Tier 1: core', catFilter.tier) + opt('2', 'Tier 2: supporting', catFilter.tier) + opt('3', 'Tier 3: catalogue', catFilter.tier) + '</select></div>' +
    '<div class="field"><label for="fScope">Exam scope</label><select id="fScope" data-change="catfilter" data-f="scope">' + opt('', 'Any', catFilter.scope) + opt('saa', 'In scope for SAA-C03', catFilter.scope) + opt('sap', 'In scope for SAP-C03', catFilter.scope) + opt('both', 'In scope for both', catFilter.scope) + opt('neither', 'Listed for neither', catFilter.scope) + '</select></div>' +
    '<div class="field"><label for="fStatus">Status</label><select id="fStatus" data-change="catfilter" data-f="status">' + opt('', 'Any', catFilter.status) + opt('current', 'Current', catFilter.status) + opt('legacy', 'Legacy', catFilter.status) + opt('avoid', 'Not recommended', catFilter.status) + '</select></div></div>' +
    '<div class="tablewrap"><table><thead><tr><th>Service</th><th>Category</th><th>Tier</th><th>Associate</th><th>Professional</th><th>Status</th></tr></thead><tbody id="catRows">' + catalogueRows() + '</tbody></table></div>' +
    '<p class="muted small">' + SERVICES.length + ' entries: ' + SERVICES.filter(s => s.tier === 1).length + ' core, ' + SERVICES.filter(s => s.tier === 2).length + ' supporting, ' + SERVICES.filter(s => s.tier === 3).length + ' catalogue cards. Exam scope comes from the official in-scope and out-of-scope lists; "not listed" means the service appears on neither list (AWS calls both lists non-exhaustive).</p>';
  return { title: 'Service reference', html: page(crumb(['home', 'Start'], 'Service reference'), html) };
}
function viewCategory(id) {
  const c = byId(CATEGORIES, id); if (!c) return notFound();
  const items = SERVICES.filter(s => s.category === id);
  const card = s => '<a class="card" href="#service/' + s.id + '"><h3>' + esc(s.name) + (isStudied('service/' + s.id) ? ' ✓' : '') + '</h3><p>' + esc(s.summary) + '</p>' + (s.status !== 'current' ? '<p class="small muted">' + STATUS[s.status] + '</p>' : '') + '</a>';
  const TIERNAME = { 1: 'Core services (full write-up)', 2: 'Supporting services (shorter write-up)', 3: 'Catalogue (what it is and when to reach for it)' };
  let body = '';
  [1, 2, 3].forEach(t => { const g = items.filter(s => s.tier === t); if (g.length) body += '<h2>' + TIERNAME[t] + '</h2><div class="grid">' + g.map(card).join('') + '</div>'; });
  const html = '<h1>' + esc(c.name) + '</h1>' + (items.length ? '<p class="muted">' + items.length + ' entries.</p>' + body : '<p>No services in this category yet.</p>');
  return { title: c.name, html: page(crumb(['home', 'Start'], ['catalogue', 'Service reference'], c.name), html) };
}

/* ---------- Service page ---------- */
function examBlock(s) {
  let h = '';
  ['saa', 'sap'].forEach(key => {
    const ex = EXAMS[key], tasks = (s.exam && s.exam[key]) || [];
    h += '<h3>' + ex.code + ' ' + scopeBadge(s, key) + '</h3>';
    h += tasks.length ? '<ul>' + tasks.map(t => '<li><a href="#exam/' + ex.route + '/domain/' + t.split('.')[0] + '">Task ' + t + '</a>: ' + esc(taskName(key, t)) + '</li>').join('') + '</ul>' : '<p class="muted">' + (scopeOf(s, key) === 'in' ? 'In scope, but not tied to one task statement.' : 'Not mapped to a task for this exam.') + '</p>';
  });
  if (s.exam && s.exam.scopeNote) h += '<p class="note">' + rich(s.exam.scopeNote) + '</p>';
  if (s.exam && s.exam.trap) h += '<h3>Typical exam traps</h3>' + s.exam.trap;
  if (s.exam && s.exam.proAdds) h += '<h3>What Professional expects beyond Associate</h3>' + s.exam.proAdds;
  return h;
}
function viewService(id) {
  const s = byId(SERVICES, id); if (!s) return notFound();
  const cat = byId(CATEGORIES, s.category);
  const sec = (title, body, open) => body ? '<details class="sec"' + (open === false ? '' : ' open') + '><summary>' + title + '</summary><div class="sec">' + rich(body) + '</div></details>' : '';
  const ex = s.example ? '<div class="codehead"><span>' + esc(s.example.title) + '</span><button class="btn noprint" data-act="copy">Copy</button></div><pre><code>' + esc(s.example.code) + '</code></pre>' + (s.example.notes || '') : '';
  const docs = (s.docs || []).map(d => '<li><a href="' + d.url + '" target="_blank" rel="noopener">' + esc(d.label) + '</a></li>').join('') + (s.pricingLink ? '<li><a href="' + s.pricingLink + '" target="_blank" rel="noopener">Official pricing or product page</a></li>' : '');
  const html = '<h1>' + esc(s.name) + '</h1><p class="lede">' + esc(s.summary) + '</p>' +
    '<div class="meta"><span class="badge t1">Tier ' + s.tier + '</span><span class="badge">' + MGMT[s.mgmt] + '</span><span class="badge">' + STATUS[s.status] + (s.statusNote ? ': ' + rich(esc(s.statusNote)) : '') + '</span>' + scopeBadge(s, 'saa') + scopeBadge(s, 'sap') + '</div>' +
    '<div class="row noprint">' + studiedBtn('service/' + s.id) + '<button class="btn" data-act="toggle-all">Collapse all sections</button></div>' +
    diagram(s.diagram) +
    sec('What it is', s.what) + sec('Problem it solves', s.problem) + sec('How it works', s.how) +
    sec('Key features that change a design', list(s.features)) + sec('When to use it', list(s.when)) + sec('When not to use it', list(s.whenNot)) +
    sec('How it works with other services', list(s.interactions)) + sec('Practical example', ex) + sec('Real-world use cases', list(s.useCases)) +
    sec('Pricing model and cost drivers', s.pricing) + sec('Alternatives and comparisons', list(s.alternatives)) + sec('Common mistakes and security', list(s.mistakes)) +
    sec('Exam relevance', examBlock(s)) + sec('Official documentation', docs ? '<ul>' + docs + '</ul>' : '');
  return { title: s.name, html: page(crumb(['home', 'Start'], ['catalogue', 'Service reference'], ['category/' + cat.id, cat.name], s.name), html) };
}

/* ---------- Walkthroughs and comparisons ---------- */
function taskChips(tasks) {
  let h = '';
  ['saa', 'sap'].forEach(key => { ((tasks || {})[key] || []).forEach(t => { h += '<a class="badge" href="#exam/' + EXAMS[key].route + '/domain/' + t.split('.')[0] + '" title="' + esc(taskName(key, t)) + '">' + EXAMS[key].code + ' task ' + t + '</a>'; }); });
  return h ? '<div class="meta">' + h + '</div>' : '';
}
function viewWalkthroughs() {
  const html = '<h1>Architecture walkthroughs</h1><p class="lede">Complete designs with a diagram, the path a request takes, what each part is responsible for, and what happens when something fails.</p><div class="grid">' +
    WALKTHROUGHS.map(w => '<a class="card" href="#walkthrough/' + w.id + '"><h3>' + esc(w.title) + (isStudied('walkthrough/' + w.id) ? ' ✓' : '') + '</h3><p>' + esc(w.summary) + '</p></a>').join('') + '</div>' +
    '';
  return { title: 'Walkthroughs', html: page(crumb(['home', 'Start'], 'Walkthroughs'), html) };
}
function viewWalkthrough(id) {
  const w = byId(WALKTHROUGHS, id); if (!w) return notFound();
  const tbl = (rows, a, b) => '<div class="tablewrap"><table><thead><tr><th>' + a + '</th><th>' + b + '</th></tr></thead><tbody>' + rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + rich(r[1]) + '</td></tr>').join('') + '</tbody></table></div>';
  const html = '<h1>' + esc(w.title) + '</h1><p class="lede">' + esc(w.summary) + '</p>' + taskChips(w.tasks) +
    '<div class="row noprint">' + studiedBtn('walkthrough/' + w.id) + '</div>' + (w.intro || '') + diagram(w.diagram) +
    '<h2>Request flow</h2><ol>' + w.flow.map(f => '<li>' + rich(f) + '</li>').join('') + '</ol>' +
    '<h2>What each component is responsible for</h2>' + tbl(w.components, 'Component', 'Responsibility') +
    '<h2>Security boundaries</h2>' + list(w.security) + '<h2>Cost notes</h2>' + list(w.cost) +
    '<h2>What happens when things fail</h2>' + tbl(w.failures, 'Failure', 'What happens') +
    '<h2>Related pages</h2><ul>' + w.related.map(r => '<li><a href="#' + r[0] + '">' + esc(r[1]) + '</a></li>').join('') + '</ul>';
  return { title: w.title, html: page(crumb(['home', 'Start'], ['walkthroughs', 'Walkthroughs'], w.title), html) };
}
function viewCompares() {
  const html = '<h1>Comparisons</h1><p class="lede">Services that are easy to confuse, with a decision table, rules for choosing, and a worked scenario.</p><div class="grid">' +
    COMPARISONS.map(c => '<a class="card" href="#compare/' + c.id + '"><h3>' + esc(c.title) + (isStudied('compare/' + c.id) ? ' ✓' : '') + '</h3><p>' + esc(c.summary) + '</p></a>').join('') + '</div>' +
    '';
  return { title: 'Comparisons', html: page(crumb(['home', 'Start'], 'Comparisons'), html) };
}
function viewCompare(id) {
  const c = byId(COMPARISONS, id); if (!c) return notFound();
  const html = '<h1>' + esc(c.title) + '</h1><p class="lede">' + esc(c.summary) + '</p>' + taskChips(c.tasks) +
    '<div class="row noprint">' + studiedBtn('compare/' + c.id) + '</div>' +
    '<div class="tablewrap"><table><thead><tr><th></th>' + c.columns.map(x => '<th>' + esc(x) + '</th>').join('') + '</tr></thead><tbody>' +
    c.rows.map(r => '<tr><th>' + esc(r[0]) + '</th>' + r.slice(1).map(x => '<td>' + rich(x) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' +
    '<h2>How to choose</h2>' + list(c.rules) + '<h2>Worked scenario</h2>' + c.scenario + '<h2>Exam trap</h2>' + c.trap;
  return { title: c.title, html: page(crumb(['home', 'Start'], ['compares', 'Comparisons'], c.title), html) };
}

/* ---------- Concepts, payments example, interview questions, roadmap ---------- */
function viewConcepts() {
  const html = '<h1>Concepts</h1><p class="lede">The ideas that sit behind the services. Exam questions at Professional level are mostly about these.</p><div class="grid">' +
    CONCEPTS.map(c => '<a class="card" href="#concept/' + c.id + '"><h3>' + esc(c.title) + (isStudied('concept/' + c.id) ? ' ✓' : '') + '</h3><p>' + esc(c.summary) + '</p></a>').join('') + '</div>';
  return { title: 'Concepts', html: page(crumb(['home', 'Start'], 'Concepts'), html) };
}
function viewConcept(id) {
  const c = byId(CONCEPTS, id); if (!c) return notFound();
  const html = '<h1>' + esc(c.title) + '</h1><p class="lede">' + esc(c.summary) + '</p>' + taskChips(c.tasks) +
    '<div class="row noprint">' + studiedBtn('concept/' + c.id) + '</div>' + rich(c.body) +
    (c.related && c.related.length ? '<h2>Related pages</h2><ul>' + c.related.map(r => '<li><a href="#' + r[0] + '">' + esc(r[1]) + '</a></li>').join('') + '</ul>' : '');
  return { title: c.title, html: page(crumb(['home', 'Start'], ['concepts', 'Concepts'], c.title), html) };
}
function viewPayments() {
  const P = PAYMENTS;
  const html = '<h1>' + esc(P.title) + '</h1><p class="lede">' + esc(P.summary) + '</p>' + diagram(P.diagram) +
    P.sections.map((s, i) => '<details class="sec" open><summary>' + (i + 1) + '. ' + esc(s[0]) + '</summary><div class="sec">' + rich(s[1]) + '</div></details>').join('');
  return { title: 'NZ payments platform', html: page(crumb(['home', 'Start'], 'NZ payments platform'), html) };
}
function viewInterview() {
  const areas = []; INTERVIEW.forEach(q => { if (!areas.includes(q[0])) areas.push(q[0]); });
  const html = '<h1>Interview questions</h1><p class="lede">Architecture and engineering questions with model answers. Say your answer aloud first, then open the model answer and compare.</p>' +
    areas.map(ar => '<h2>' + esc(ar) + '</h2>' + INTERVIEW.filter(q => q[0] === ar).map(q => '<details class="sec"><summary>' + esc(q[1]) + '</summary><div class="sec"><p>' + esc(q[2]) + '</p></div></details>').join('')).join('');
  return { title: 'Interview questions', html: page(crumb(['home', 'Start'], 'Interview questions'), html) };
}
function viewRoadmap() {
  const html = '<h1>Learning roadmap</h1><p class="lede">An order to work through the handbook, from foundations to the Professional exam. A tick shows pages you have marked as studied.</p>' +
    ROADMAP.map(s => { const can = s[2].filter(i => /^(service|concept|walkthrough|compare)\//.test(i[0])), done = can.filter(i => isStudied(i[0])).length;
      return '<h2>' + esc(s[0]) + '</h2><p>' + esc(s[1]) + '</p><p class="muted small">' + done + ' of ' + can.length + ' study pages marked as studied.</p><ul>' + s[2].map(i => '<li><a href="#' + i[0] + '">' + esc(i[1]) + '</a>' + (isStudied(i[0]) ? ' ✓' : '') + '</li>').join('') + '</ul>'; }).join('');
  return { title: 'Learning roadmap', html: page(crumb(['home', 'Start'], 'Learning roadmap'), html) };
}

/* ---------- Search ---------- */
let searchIndex = null;
function flat(o, skip) {
  if (o == null) return '';
  if (typeof o === 'string') return o + ' ';
  if (typeof o !== 'object') return '';
  if (Array.isArray(o)) return o.map(x => flat(x, skip)).join(' ');
  return Object.keys(o).filter(k => !skip.includes(k)).map(k => flat(o[k], skip)).join(' ');
}
function buildIndex() {
  const ix = [], add = (type, title, href, obj) => ix.push({ type, title, href, text: strip(flat(obj, ['diagram', 'id', 'url', 'docs', 'pricingLink', 'category', 'mgmt', 'status'])) });
  SERVICES.forEach(s => add('Service', s.name, '#service/' + s.id, s));
  WALKTHROUGHS.forEach(w => add('Walkthrough', w.title, '#walkthrough/' + w.id, w));
  COMPARISONS.forEach(c => add('Comparison', c.title, '#compare/' + c.id, c));
  CONCEPTS.forEach(c => add('Concept', c.title, '#concept/' + c.id, c));
  add('Worked example', PAYMENTS.title, '#payments', { s: PAYMENTS.summary, x: PAYMENTS.sections });
  INTERVIEW.forEach(q => add('Interview question', q[1], '#interview', q));
  Object.keys(TASK_NOTES).forEach(k => Object.keys(TASK_NOTES[k]).forEach(id => add('Study notes', EXAMS[k].code + ' task ' + id + ': ' + taskName(k, id), '#exam/' + EXAMS[k].route + '/domain/' + id.split('.')[0], TASK_NOTES[k][id])));
  Object.values(EXAMS).forEach(e => e.domains.forEach(d => add('Exam domain', e.code + ' domain ' + d.n + ': ' + d.name, '#exam/' + e.route + '/domain/' + d.n, d)));
  GLOSSARY.forEach(g => add('Glossary', g[0], '#tools/glossary', g));
  TROUBLE.forEach(t => add('Troubleshooting', t.symptom, '#tools/troubleshooting', t));
  CUES.forEach(c => add('Decision cue', c.phrase, '#exam/cues', c));
  QUESTIONS.forEach(q => add('Practice question', EXAMS[q.exam].code + ' task ' + q.task, '#exam/' + EXAMS[q.exam].route + '/practice', { s: q.stem }));
  return ix;
}
function viewSearch(q) {
  q = (q || '').trim();
  if (!searchIndex) searchIndex = buildIndex();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  let html = '<h1>Search</h1>';
  if (!terms.length) html += '<p>Type in the search box above. Search looks through the full text of every page, not just titles.</p>';
  else {
    const hits = [];
    searchIndex.forEach(it => {
      const hay = (it.title + ' ' + it.text).toLowerCase();
      if (!terms.every(t => hay.includes(t))) return;
      const inTitle = terms.filter(t => it.title.toLowerCase().includes(t)).length;
      const pos = it.text.toLowerCase().indexOf(terms[0]);
      let snip = it.text.slice(Math.max(0, pos - 70), Math.max(0, pos - 70) + 220);
      snip = esc((pos > 70 ? '…' : '') + snip + '…');
      terms.forEach(t => { snip = snip.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
      hits.push({ it, score: inTitle * 10 + (it.type === 'Service' ? 3 : 0), snip });
    });
    hits.sort((a, b) => b.score - a.score);
    html += '<p class="muted">' + hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for "' + esc(q) + '"</p>';
    html += hits.length ? hits.slice(0, 60).map(h => '<p><a href="' + h.it.href + '"><b>' + esc(h.it.title) + '</b></a> <span class="badge">' + h.it.type + '</span><br><span class="small">' + h.snip + '</span></p>').join('')
      : '<p>Nothing matched. Try a shorter term, or check the phase list on the <a href="#home">start page</a> to see whether that topic has been written yet.</p>';
  }
  return { title: 'Search', html: page('', html), keepFocus: true };
}

/* ---------- Tools: CIDR ---------- */
function parseCidr(s) {
  const m = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*\/\s*(\d{1,2})\s*$/.exec(s || '');
  if (!m) return null;
  const o = m.slice(1, 5).map(Number), p = +m[5];
  if (o.some(x => x > 255) || p > 32) return null;
  const ip = ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
  const mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
  const net = (ip & mask) >>> 0, size = Math.pow(2, 32 - p);
  return { ip, p, mask, net, size, last: (net + size - 1) >>> 0, aligned: ip === net };
}
const ipStr = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
const cidrStr = (net, p) => ipStr(net >>> 0) + '/' + p;
const awsUsable = p => (p >= 16 && p <= 28) ? Math.pow(2, 32 - p) - 5 : null;
function cidrCalc(input) {
  const c = parseCidr(input);
  if (!c) return '<p class="err">Enter an IPv4 range like 10.20.0.0/16.</p>';
  const u = awsUsable(c.p), row = (a, b) => '<tr><th>' + a + '</th><td>' + b + '</td></tr>';
  return (c.aligned ? '' : '<p class="note warn">' + esc(input.trim()) + ' is not a network address. Using ' + cidrStr(c.net, c.p) + '.</p>') +
    '<div class="tablewrap"><table><tbody>' + row('Network', cidrStr(c.net, c.p)) + row('Netmask', ipStr(c.mask)) + row('Address range', ipStr(c.net) + ' to ' + ipStr(c.last)) +
    row('Total addresses', c.size.toLocaleString()) + row('Usable in an AWS subnet', u == null ? 'AWS VPCs and subnets must be between /16 and /28' : u.toLocaleString() + ' (total minus 5)') +
    (u == null ? '' : row('Reserved by AWS', ipStr(c.net) + ' network, ' + ipStr(c.net + 1) + ' VPC router, ' + ipStr(c.net + 2) + ' DNS, ' + ipStr(c.net + 3) + ' future use, ' + ipStr(c.last) + ' last address')) +
    '</tbody></table></div>';
}
function cidrSplit(input, az) {
  const c = parseCidr(input);
  if (!c) return '<p class="err">Enter the VPC range first, for example 10.20.0.0/16.</p>';
  if (c.p < 16 || c.p > 28) return '<p class="err">A VPC range must be between /16 and /28.</p>';
  const rows = [], L = 'abcdef';
  let note;
  if (c.p <= 20) {
    const big = c.p + 4, small = c.p + 8, bs = Math.pow(2, 32 - big), ss = Math.pow(2, 32 - small);
    for (let i = 0; i < az; i++) rows.push(['Public', L[i], cidrStr(c.net + i * ss, small), small]);
    for (let i = 0; i < az; i++) rows.push(['Private (application)', L[i], cidrStr(c.net + (i + 1) * bs, big), big]);
    for (let i = 0; i < az; i++) rows.push(['Isolated (database)', L[i], cidrStr(c.net + (8 + i) * ss, small), small]);
    note = 'Private subnets are large because containers and load balancers use one address each. Public and isolated subnets are small and share the first /' + big + ' block. Blocks ' + (az + 1) + ' to 15 of the /' + big + ' grid stay free for growth.';
  } else {
    const need = az * 3, bits = Math.ceil(Math.log2(need)), np = c.p + bits;
    if (np > 28) return '<p class="err">' + cidrStr(c.net, c.p) + ' is too small for ' + need + ' subnets (the smallest AWS subnet is /28). Use a larger VPC range or fewer Availability Zones.</p>';
    const ss = Math.pow(2, 32 - np);
    ['Public', 'Private (application)', 'Isolated (database)'].forEach((t, k) => { for (let i = 0; i < az; i++) rows.push([t, L[i], cidrStr(c.net + (k * az + i) * ss, np), np]); });
    note = 'This range is small, so it is split into equal /' + np + ' subnets.';
  }
  return '<div class="tablewrap"><table><thead><tr><th>Tier</th><th>AZ</th><th>Subnet</th><th class="num">Usable addresses</th></tr></thead><tbody>' +
    rows.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td><code>' + r[2] + '</code></td><td class="num">' + awsUsable(r[3]).toLocaleString() + '</td></tr>').join('') + '</tbody></table></div><p class="small muted">' + note + '</p>';
}
function cidrOverlap(text) {
  const items = (text || '').split(/[\n,;]+/).map(s => s.trim()).filter(Boolean).map(s => ({ s, c: parseCidr(s) }));
  if (items.length < 2) return '<p class="err">Enter at least two ranges, one per line.</p>';
  const bad = items.filter(i => !i.c);
  if (bad.length) return '<p class="err">Not valid ranges: ' + bad.map(b => esc(b.s)).join(', ') + '</p>';
  const hits = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i].c, b = items[j].c;
    if (a.net <= b.last && b.net <= a.last) hits.push(cidrStr(a.net, a.p) + ' overlaps ' + cidrStr(b.net, b.p));
  }
  return hits.length ? '<div class="note warn"><p><b>' + hits.length + ' overlap' + (hits.length === 1 ? '' : 's') + ' found.</b> Overlapping ranges cannot be peered or routed to each other.</p><ul>' + hits.map(h => '<li>' + h + '</li>').join('') + '</ul></div>'
    : '<p class="note">No overlaps. These ' + items.length + ' ranges can be connected to each other.</p>';
}
function viewCidr() {
  const html = '<h1>CIDR calculator</h1><p class="lede">Work out what a range contains, split a VPC into subnets across Availability Zones, and check ranges for overlaps before you connect networks.</p>' +
    '<h2>Inspect a range</h2><div class="row"><div class="field"><label for="c1">IPv4 range</label><input type="text" id="c1" value="10.20.0.0/16" inputmode="decimal" autocomplete="off"></div><button class="btn primary" data-act="cidr-calc" style="align-self:flex-end">Calculate</button></div><div id="c1out">' + cidrCalc('10.20.0.0/16') + '</div>' +
    '<h2>Split a VPC into subnets</h2><p>Proposes public, private and isolated subnets in each Availability Zone, the layout used throughout this handbook.</p>' +
    '<div class="row"><div class="field"><label for="c2">VPC range</label><input type="text" id="c2" value="10.20.0.0/16" autocomplete="off"></div><div class="field"><label for="c2az">Availability Zones</label><select id="c2az"><option>2</option><option selected>3</option><option>4</option><option>6</option></select></div><button class="btn primary" data-act="cidr-split" style="align-self:flex-end">Propose layout</button></div><div id="c2out">' + cidrSplit('10.20.0.0/16', 3) + '</div>' +
    '<h2>Check for overlaps</h2><p>Paste the ranges of every VPC and office network you plan to connect, one per line.</p><textarea id="c3" rows="4" aria-label="Ranges to check">10.20.0.0/16\n10.21.0.0/16\n10.20.128.0/20</textarea><div class="row"><button class="btn primary" data-act="cidr-overlap">Check overlaps</button></div><div id="c3out"></div>' +
    '<div class="note"><p>Related: <a href="#service/vpc">Amazon VPC</a> explains why AWS reserves five addresses per subnet and why ranges cannot be changed later.</p></div>';
  return { title: 'CIDR calculator', html: page(crumb(['home', 'Start'], 'CIDR calculator'), html) };
}

/* ---------- Tools: glossary, checklists, troubleshooting, progress ---------- */
function glossaryRows(f) {
  f = (f || '').toLowerCase();
  const rows = GLOSSARY.filter(g => !f || (g[0] + ' ' + g[1]).toLowerCase().includes(f)).sort((a, b) => a[0].localeCompare(b[0]));
  return rows.length ? rows.map(g => '<tr><th>' + esc(g[0]) + '</th><td>' + esc(g[1]) + '</td></tr>').join('') : '<tr><td colspan="2">No term matches. Try the main search box for full-text search.</td></tr>';
}
function viewGlossary() {
  return { title: 'Glossary', html: page(crumb(['home', 'Start'], 'Glossary'), '<h1>Glossary</h1><div class="row noprint"><div class="field"><label for="gf">Filter terms</label><input type="text" id="gf" data-input="glossary" autocomplete="off"></div></div><div class="tablewrap"><table><tbody id="gRows">' + glossaryRows('') + '</tbody></table></div>') };
}
function viewChecklists() {
  const st = store.get('checks', {});
  const html = '<h1>Checklists</h1><p class="lede">Tick items as you confirm them. Your ticks are saved in this browser.</p>' + CHECKLISTS.map(c => {
    const done = c.items.filter((_, i) => st[c.id + ':' + i]).length;
    return '<h2>' + esc(c.title) + ' <span class="muted small" id="cnt-' + c.id + '">' + done + ' of ' + c.items.length + '</span></h2>' +
      c.items.map((t, i) => '<label class="check"><input type="checkbox" data-change="check" data-key="' + c.id + ':' + i + '" data-list="' + c.id + '"' + (st[c.id + ':' + i] ? ' checked' : '') + '><span>' + esc(t) + '</span></label>').join('');
  }).join('');
  return { title: 'Checklists', html: page(crumb(['home', 'Start'], 'Checklists'), html) };
}
function viewTrouble() {
  const html = '<h1>Troubleshooting</h1><p class="lede">Start from the symptom. Each entry lists the likely causes and what to check, in the order that finds the problem fastest.</p>' +
    TROUBLE.map(t => '<details class="sec"><summary>' + esc(t.symptom) + '</summary><div class="sec"><h3>Likely causes</h3>' + list(t.causes.map(esc)) + '<h3>What to check</h3><ol>' + t.checks.map(c => '<li>' + esc(c) + '</li>').join('') + '</ol></div></details>').join('') +
    '<p class="muted small">' + TROUBLE.length + ' entries.</p>';
  return { title: 'Troubleshooting', html: page(crumb(['home', 'Start'], 'Troubleshooting'), html) };
}
function viewProgress() {
  const html = '<h1>Progress and backup</h1><p class="lede">Your studied marks, checklist ticks, quiz history and flashcard schedule are stored in this browser only. Export them to move to another device or to keep a backup.</p>' +
    '<div class="row"><button class="btn primary" data-act="export">Export progress to a file</button><label class="btn" for="imp">Import progress from a file</label><input type="file" id="imp" accept="application/json,.json" data-change="import" hidden></div><p id="progMsg" class="muted" role="status"></p>' +
    '<h2>Erase</h2><p>Removes all saved progress from this browser. Export first if you might want it back.</p><button class="btn" data-act="reset">Erase all progress</button>';
  return { title: 'Progress and backup', html: page(crumb(['home', 'Start'], 'Progress and backup'), html) };
}

/* ---------- Sidebar ---------- */
function renderSidebar() {
  const a = (href, text, count) => '<a href="#' + href + '">' + esc(text) + (count != null ? '<span class="count">' + count + '</span>' : '') + '</a>';
  const cats = CATEGORIES.map(c => ({ c, n: SERVICES.filter(s => s.category === c.id).length })).filter(x => x.n);
  $('#sidebar').innerHTML = a('home', 'Start') +
    '<h2>Exam Centre</h2>' + a('exam/saa-c03', 'Associate (SAA-C03)') + a('exam/sap-c03', 'Professional (SAP-C03)') + a('exam/bridge', 'Associate to Professional') + a('exam/cues', 'Decision cues') + a('exam/flashcards', 'Flashcards') +
    '<h2>Learn</h2>' + a('roadmap', 'Learning roadmap') + a('concepts', 'Concepts', CONCEPTS.length) + a('walkthroughs', 'Walkthroughs', WALKTHROUGHS.length) + a('compares', 'Comparisons', COMPARISONS.length) + a('payments', 'NZ payments platform') + a('interview', 'Interview questions') +
    '<h2>Reference</h2>' + a('catalogue', 'All services', SERVICES.length) + cats.map(x => a('category/' + x.c.id, x.c.name, x.n)).join('') +
    '<h2>Tools</h2>' + a('tools/cidr', 'CIDR calculator') + a('tools/glossary', 'Glossary') + a('tools/checklists', 'Checklists') + a('tools/troubleshooting', 'Troubleshooting') + a('tools/progress', 'Progress and backup');
}
function markNav(raw) {
  let best = null, bestLen = -1;
  $$('#sidebar a').forEach(l => {
    l.removeAttribute('aria-current');
    const h = l.getAttribute('href').slice(1);
    if ((raw === h || raw.indexOf(h + '/') === 0) && h.length > bestLen) { best = l; bestLen = h.length; }
  });
  const alias = { service: 'catalogue', category: 'catalogue', walkthrough: 'walkthroughs', compare: 'compares', concept: 'concepts' }[raw.split('/')[0]];
  if (!best && alias) best = $('#sidebar a[href="#' + alias + '"]');
  if (best) best.setAttribute('aria-current', 'page');
}

/* ---------- Router ---------- */
let routeCleanup = null;
function route() {
  if (routeCleanup) { routeCleanup(); routeCleanup = null; }
  let raw; try { raw = decodeURIComponent(location.hash.replace(/^#/, '')); } catch (e) { raw = ''; }
  raw = raw || 'home';
  const p = raw.split('/');
  let v;
  switch (p[0]) {
    case 'home': v = viewHome(); break;
    case 'catalogue': v = viewCatalogue(); break;
    case 'category': v = viewCategory(p[1]); break;
    case 'service': v = viewService(p[1]); break;
    case 'walkthroughs': v = viewWalkthroughs(); break;
    case 'walkthrough': v = viewWalkthrough(p[1]); break;
    case 'compares': v = viewCompares(); break;
    case 'compare': v = viewCompare(p[1]); break;
    case 'concepts': v = viewConcepts(); break;
    case 'concept': v = viewConcept(p[1]); break;
    case 'payments': v = viewPayments(); break;
    case 'interview': v = viewInterview(); break;
    case 'roadmap': v = viewRoadmap(); break;
    case 'search': v = viewSearch(p.slice(1).join('/')); break;
    case 'exam': v = viewExamRoute(p.slice(1)); break;
    case 'tools': v = ({ cidr: viewCidr, glossary: viewGlossary, checklists: viewChecklists, troubleshooting: viewTrouble, progress: viewProgress }[p[1]] || notFound)(); break;
    default: v = notFound();
  }
  const main = $('#main');
  main.innerHTML = v.html;
  document.title = (v.title ? v.title + ' – ' : '') + 'AWS Handbook';
  if (v.after) v.after();
  if (v.cleanup) routeCleanup = v.cleanup;
  markNav(raw);
  document.body.classList.remove('nav-open');
  if (!v.keepFocus) { window.scrollTo(0, 0); }
  if (p[0] !== 'search') $('#q').value = '';
}

/* ---------- Actions ---------- */
const ACTIONS = {
  studied(el) { const s = store.get('studied', {}); s[el.dataset.key] = !s[el.dataset.key]; store.set('studied', s); el.outerHTML = studiedBtn(el.dataset.key); },
  'toggle-all'(el) { const all = $$('details.sec', $('#main')), open = all.some(d => d.open); all.forEach(d => { d.open = !open; }); el.textContent = open ? 'Expand all sections' : 'Collapse all sections'; },
  copy(el) {
    const code = el.closest('.codehead').nextElementSibling.textContent;
    const done = ok => { el.textContent = ok ? 'Copied' : 'Select and copy manually'; setTimeout(() => { el.textContent = 'Copy'; }, 1800); };
    try { navigator.clipboard.writeText(code).then(() => done(true), () => done(false)); } catch (e) { done(false); }
  },
  'cidr-calc'() { $('#c1out').innerHTML = cidrCalc($('#c1').value); },
  'cidr-split'() { $('#c2out').innerHTML = cidrSplit($('#c2').value, +$('#c2az').value); },
  'cidr-overlap'() { $('#c3out').innerHTML = cidrOverlap($('#c3').value); },
  export() {
    const data = { app: 'aws-handbook', exported: new Date().toISOString() };
    store.keys.forEach(k => { const v = store.get(k, null); if (v != null) data[k] = v; });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'aws-handbook-progress-' + today() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    $('#progMsg').textContent = 'Exported. Keep the file somewhere safe.';
  },
  reset(el) {
    if (el.dataset.armed) { store.keys.filter(k => k !== 'theme' && k !== 'size').forEach(k => { delete mem[k]; try { localStorage.removeItem('awsh:' + k); } catch (e) {} }); el.textContent = 'Erased'; el.disabled = true; }
    else { el.dataset.armed = '1'; el.textContent = 'Click again to erase everything'; }
  },
  theme() { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('theme', t); $('#themeBtn').textContent = t === 'dark' ? 'Light mode' : 'Dark mode'; },
  size(el) {
    const order = ['s', 'm', 'l', 'xl'], cur = document.documentElement.dataset.size || 'm';
    const i = Math.max(0, Math.min(order.length - 1, order.indexOf(cur) + (+el.dataset.d)));
    document.documentElement.dataset.size = order[i]; store.set('size', order[i]);
  },
  menu() { document.body.classList.toggle('nav-open'); }
};
const CHANGES = {
  catfilter(el) { catFilter[el.dataset.f] = el.value; $('#catRows').innerHTML = catalogueRows(); },
  check(el) { const s = store.get('checks', {}); s[el.dataset.key] = el.checked; store.set('checks', s); const c = byId(CHECKLISTS, el.dataset.list); $('#cnt-' + c.id).textContent = c.items.filter((_, i) => s[c.id + ':' + i]).length + ' of ' + c.items.length; },
  import(el) {
    const f = el.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); if (d.app !== 'aws-handbook') throw 0; store.keys.forEach(k => { if (k in d) store.set(k, d[k]); }); $('#progMsg').textContent = 'Imported. Your progress has been restored.'; applyPrefs(); } catch (e) { $('#progMsg').textContent = 'That file is not a handbook progress export. Nothing was changed.'; } };
    r.readAsText(f);
  }
};
const INPUTS = { glossary(el) { $('#gRows').innerHTML = glossaryRows(el.value); } };

function applyPrefs() {
  const t = store.get('theme', null) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = t;
  document.documentElement.dataset.size = store.get('size', 'm');
  const b = $('#themeBtn'); if (b) b.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
}
function init() {
  applyPrefs(); renderSidebar();
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (el && ACTIONS[el.dataset.act]) { ACTIONS[el.dataset.act](el, e); return; }
    if (document.body.classList.contains('nav-open') && !e.target.closest('#sidebar')) document.body.classList.remove('nav-open');
  });
  document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el, e); });
  document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (el && INPUTS[el.dataset.input]) INPUTS[el.dataset.input](el, e); });
  let st;
  $('#q').addEventListener('input', e => { clearTimeout(st); const q = e.target.value; st = setTimeout(() => { history.replaceState(null, '', '#search/' + encodeURIComponent(q)); route(); $('#q').value = q; }, 160); });
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); } if (e.key === 'Escape') document.body.classList.remove('nav-open'); });
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeprint', () => $$('details').forEach(d => { d.open = true; }));
  route();
}
