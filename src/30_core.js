/* =====================================================================
   2. 게임 상태 — 모든 진행 정보는 이 객체 하나에 저장
   ===================================================================== */
const state = {
  screen: 'title',
  day: 1,
  money: 0,
  penalty: 0,
  rating: 0,
  harin: 0,                 // HARIN_STATES 인덱스
  sold: [],                 // 판매한 내 기억 id
  flags: {},                // 스토리 분기 플래그 (corrupt, resistance, mioArchived, truthKnown …)
  clues: [],                // 하린 사건 단서 id
  outcomes: {},             // 손님별 시술 결과 { yuna:'perfect', … }
  visits: {},               // 저녁 장소 방문 횟수
  memo: {},                 // 기타 카운터
  rentMissed: 0,
  scanBoost: false,         // 전날 월세 미납 → 오늘 스캔 가속
  scanMulToday: 1,          // 오늘 경찰 스캔 배율
  dayClients: [],
  clientIdx: 0,
  client: null,             // 현재 시술 중인 손님 { data, selected:Set, resolved, scan, running }
  nightPay: { rent: true, life: true },
  dayLog: null,
  totals: { income: 0, expense: 0, sales: 0, damage: 0, reports: 0 },
  muted: false,
  // 런타임 핸들
  timers: [], raf: 0, typeToken: 0, lastTick: 0, modalOpen: false, vnSession: 0, vnAdvance: null,
};

function resetState() {
  Object.assign(state, {
    day: 1, money: CONFIG.startMoney, penalty: 0, rating: CONFIG.startRating, harin: 0,
    sold: [], donated: [], flags: {}, clues: [], outcomes: {}, memo: {},
    visits: { hospital: 0, bar: 0, alley: 0, clinic: 0 },
    trust: Object.assign({}, TRUST_DEFAULT), drawings: [], registered: [], resonance: 0, diveSeen: [],
    rentMissed: 0, scanBoost: false, dayClients: [], clientIdx: 0, client: null,
    nightPay: { rent: true, life: true }, dayLog: null, ng: !!META.echo,
    totals: { income: 0, expense: 0, sales: 0, damage: 0, reports: 0 },
  });
}

/* =====================================================================
   3. 유틸리티
   ===================================================================== */
const $ = sel => document.querySelector(sel);
const app = $('#app');
const NOISE = '█▓▒░';
const harinAlive = s => s.harin < 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const memById = id => MY_MEMORIES.find(m => m.id === id);
const isLost = id => state.sold.includes(id) || state.donated.includes(id);
const isSold = isLost;
const lostCount = () => state.sold.length + state.donated.length;

function noise(n) { let s = ''; for (let i = 0; i < n; i++) s += NOISE[(Math.random() * 4) | 0]; return s; }

function activeRules(day) {
  const list = RULES.filter(r => r.day <= day);
  const pick = k => [...new Set(list.flatMap(r => r[k] || []))];
  return { list, forbidTags: pick('forbidTags'), reportTags: pick('reportTags'), registry: list.some(r => r.registry), vipProtect: list.some(r => r.vipProtect && r.day === day), selfCheck: list.some(r => r.selfCheck) };
}

function ratingGrade(r) { return r >= 80 ? 'A' : r >= 60 ? 'B' : r >= 40 ? 'C' : r >= 20 ? 'D' : 'F'; }
function changeRating(d) { state.rating = clamp(state.rating + d, 0, 100); }

/* 타이머 관리: 화면이 바뀌면 전부 정리 */
function later(fn, ms) { const id = setTimeout(fn, ms); state.timers.push(id); return id; }
function every(fn, ms) { const id = setInterval(fn, ms); state.timers.push(id); return id; }
function clearRuntime() {
  state.timers.forEach(id => { clearTimeout(id); clearInterval(id); });
  state.timers = [];
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = 0;
  state.typeToken++;
  state.vnSession++;
  state.vnAdvance = null;
  document.body.classList.remove('danger');
}

/* =====================================================================
   4. 판 기억 → 텍스트 노이즈 처리
   ===================================================================== */
function soldKeywords() {
  return [...state.sold, ...state.donated].flatMap(id => memById(id).keywords).sort((a, b) => b.length - a.length);
}
/* 텍스트를 [{t, c(깨짐여부)}] 조각으로 분해 */
function corruptParts(text) {
  const kws = soldKeywords();
  const parts = [];
  let buf = '', i = 0;
  outer: while (i < text.length) {
    for (const k of kws) {
      if (text.startsWith(k, i)) {
        if (buf) { parts.push({ t: buf }); buf = ''; }
        parts.push({ t: noise(k.length), c: true });
        i += k.length;
        continue outer;
      }
    }
    buf += text[i++];
  }
  if (buf) parts.push({ t: buf });
  return parts;
}
/* 한 번의 노이즈 생성으로 plain/html 두 버전을 함께 만든다 (타이핑 효과용) */
function fxPair(text) {
  const parts = corruptParts(String(text));
  return {
    plain: parts.map(p => p.t).join(''),
    html: parts.map(p => p.c ? `<span class="corrupt">${esc(p.t)}</span>` : esc(p.t)).join(''),
  };
}
const fx = text => fxPair(text).html;   // 즉시 렌더링용 HTML

function playerName() { return isSold(5) ? `<span class="corrupt">${noise(2)}</span>` : esc(CONFIG.playerName); }

/* =====================================================================
   5. 사운드 (Web Audio API)
   ===================================================================== */
const Sound = {
  ctx: null,
  init() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type = 'square', vol = 0.04, slideTo = 0, delay = 0) {
    if (state.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },
  click()  { this.tone(1200, 0.04, 'square', 0.03); },
  select() { this.tone(660, 0.05, 'triangle', 0.05); },
  warn()   { this.tone(220, 0.16, 'sawtooth', 0.05); this.tone(180, 0.16, 'sawtooth', 0.05, 0, 0.18); },
  alarm()  { this.tone(880, 0.09, 'square', 0.035); },
  erase()  { this.tone(1500, 0.5, 'sawtooth', 0.04, 120); this.tone(900, 0.12, 'square', 0.03, 0, 0.5); this.tone(1350, 0.18, 'square', 0.03, 0, 0.62); },
  coin()   { this.tone(988, 0.08, 'square', 0.04); this.tone(1319, 0.2, 'square', 0.04, 0, 0.08); },
  fail()   { this.tone(300, 0.6, 'sawtooth', 0.05, 60); },
  glitch() { for (let i = 0; i < 5; i++) this.tone(200 + Math.random() * 1800, 0.03, 'square', 0.025, 0, i * 0.04); },
};

/* =====================================================================
   6. UI 헬퍼: 타이핑 / 전환 글리치 / 토스트 / 모달 / HUD
   ===================================================================== */
/* lines: [{text, cls}] 를 container 안에 순서대로 타이핑. container 클릭 시 즉시 완료 */
function typeLines(container, lines, done, opts = {}) {
  const token = ++state.typeToken;
  const speed = opts.speed || 16;
  const gap = opts.gap || 220;
  const tag = opts.tag || 'p';
  const items = lines.map(l => (typeof l === 'string' ? { text: l } : l)).map(l => ({ ...l, ...fxPair(l.text) }));
  let li = 0, ci = 0, el = null, finished = false;

  const makeEl = it => { const e = document.createElement(tag); e.className = 'ln ' + (it.cls || ''); container.appendChild(e); return e; };
  const finish = () => {
    if (finished) return;
    finished = true;
    container.removeEventListener('click', skip);
    if (done) done();
  };
  function skip() {
    if (finished || token !== state.typeToken) return;
    state.typeToken++;
    if (el) { el.innerHTML = items[li].html; el.classList.remove('caret'); li++; }
    for (; li < items.length; li++) makeEl(items[li]).innerHTML = items[li].html;
    finish();
  }
  function step() {
    if (token !== state.typeToken) return;
    if (li >= items.length) { finish(); return; }
    const it = items[li];
    if (!el) { el = makeEl(it); el.classList.add('caret'); }
    ci = Math.min(ci + (opts.chunk || 1), it.plain.length);
    el.textContent = it.plain.slice(0, ci);
    if (ci >= it.plain.length) {
      el.innerHTML = it.html; el.classList.remove('caret');
      el = null; li++; ci = 0;
      later(step, it.pause || gap);
    } else later(step, speed);
  }
  if (!opts.noClick) container.addEventListener('click', skip);
  step();
  return skip;
}

/* 화면 전환: 런타임 정리 → 글리치 → 렌더 */
function transition(render) {
  clearRuntime();
  closeModal();
  Sound.glitch();
  const g = $('#glitch');
  g.classList.remove('on'); void g.offsetWidth; g.classList.add('on');
  document.body.classList.add('glitching');
  setTimeout(() => document.body.classList.remove('glitching'), 400);
  render();
  window.scrollTo(0, 0);
  updateHUD();
}

let toastTimer = 0;
function toast(msg, kind = 'bad') {
  const t = $('#toast');
  t.innerHTML = fx(msg);
  t.className = 'on' + (kind === 'info' ? ' info' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = kind === 'info' ? 'info' : ''; }, Math.min(5200, 2200 + msg.length * 30));
}

/* buttons: [{label, cls, onClick}] */
function showModal(title, text, buttons) {
  state.modalOpen = true;
  $('#modalTitle').innerHTML = fx(title);
  $('#modalText').innerHTML = fx(text);
  const row = $('#modalBtns');
  row.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn ' + (b.cls || '');
    btn.innerHTML = fx(b.label);
    btn.addEventListener('click', () => { Sound.click(); closeModal(); if (b.onClick) b.onClick(); });
    row.appendChild(btn);
  });
  $('#modal').classList.add('on');
}
function closeModal() { state.modalOpen = false; $('#modal').classList.remove('on'); }

function updateHUD() {
  const hud = $('#hud');
  hud.classList.toggle('minimal', ['title', 'gallery', 'drawings'].includes(state.screen));
  $('#hudDay').textContent = `${state.day}/${CONFIG.totalDays}`;
  $('#hudMoney').textContent = state.money;
  $('#hudPen').textContent = '●'.repeat(Math.min(state.penalty, CONFIG.penaltyLimit)) + '○'.repeat(Math.max(0, CONFIG.penaltyLimit - state.penalty));
  $('#hudName').innerHTML = playerName();
  $('#hudClue').textContent = `${state.clues.length}/${Object.keys(CLUES).length}`;
  $('#hudAct').textContent = ['title', 'gallery', 'drawings'].includes(state.screen) ? '' : `${actOf(state.day)}막 · ${ACTS[actOf(state.day)].title}`;
  $('#hudLicense').textContent = state.screen === 'title' ? '' : ' // ' + CONFIG.license;
  $('#muteBtn').textContent = state.muted ? '🔇 음소거' : '🔊 소리';
  syncHudHeight();
}
function syncHudHeight() { document.documentElement.style.setProperty('--hud-h', $('#hud').offsetHeight + 'px'); }
window.addEventListener('resize', syncHudHeight);

function addPenalty(reason) {
  state.penalty++;
  if (state.dayLog) state.dayLog.penalties.push(reason);
  Sound.warn();
  toast(`⚠ 벌점 +1 — ${reason}`);
  updateHUD();
}
function addIncome(label, amount) {
  if (amount <= 0) return;
  state.money += amount;
  state.totals.income += amount;
  state.dayLog.income.push({ label, amount });
  Sound.coin();
  updateHUD();
}
function newDayLog() { return { income: [], expense: [], sales: [], penalties: [], damage: [], events: [], spend: [] }; }
const gain = (amount, label) => addIncome(label, amount);
function spend(amount, label) {
  state.money -= amount;
  state.totals.expense += amount;
  state.dayLog.spend.push({ label, amount });
  updateHUD();
}
function removePenalty(reason) {
  if (state.penalty <= 0) return;
  state.penalty--;
  state.dayLog.events.push(`벌점 -1 (${reason})`);
  toast(`벌점 -1 — ${reason}`, 'info');
  updateHUD();
}
function addClue(id) {
  const c = CLUES[id];
  if (state.clues.includes(id) || !c) return;
  state.clues.push(id);
  if (state.dayLog) state.dayLog.events.push('단서 획득: ' + c.text);
  Sound.coin();
  toast(`🔎 단서 (${state.clues.length}/${Object.keys(CLUES).length}) — ${c.text}`, 'info');
  if (c.voice) unlockVoice(c.voice);
  updateHUD();
}
function unlockVoice(n) {
  if (!state.memo.voices) state.memo.voices = [];
  if (!state.memo.voices.includes(n)) { state.memo.voices.push(n); setTimeout(() => toast(`📼 녹음기에 새 메시지가 생겼다 (${n}/7)`, 'info'), 1600); }
  if (!META.voices.includes(n)) { META.voices.push(n); saveMeta(); }
}
function truthLevel(s = state) { return s.clues.includes('chip') ? 3 : s.clues.includes('trace') ? 2 : s.clues.length >= 3 ? 1 : 0; }
function addTrust(who, n) { state.trust[who] = clamp((state.trust[who] || 0) + n, who === 'kang' ? -3 : 0, who === 'kang' ? 3 : 5); }
function addDrawing(id) {
  if (state.drawings.includes(id) || !DRAWINGS[id]) return;
  state.drawings.push(id);
  if (!META.drawings.includes(id)) { META.drawings.push(id); saveMeta(); }
  toast(`🖍 미오의 그림이 생겼다 — 「${DRAWINGS[id].title}」`, 'info');
}
/* 기억 기증: 판매처럼 영영 사라지지만 돈은 받지 않는다 */
function donate(id, to) {
  if (isLost(id)) return false;
  state.donated.push(id);
  state.memo.donatedTo = state.memo.donatedTo || {};
  state.memo.donatedTo[id] = to;
  if (state.dayLog) state.dayLog.events.push(`기억 기증: ${memById(id).mark} → ${to}`);
  Sound.erase();
  flashGlitch();
  toast(`${memById(id).mark} 기억을 ${to}에게 주었다. 팔지 않았다. 주었다.`, 'info');
  updateHUD();
  return true;
}
function flashGlitch() {
  const g = $('#glitch');
  g.classList.remove('on'); void g.offsetWidth; g.classList.add('on');
  document.body.classList.add('glitching');
  setTimeout(() => document.body.classList.remove('glitching'), 400);
}

/* 저장: 날짜별 슬롯(매일 아침) + 메타(회차를 넘어 유지) */
const SAVE_KEYS = ['day', 'money', 'penalty', 'rating', 'harin', 'sold', 'donated', 'flags', 'clues', 'outcomes', 'visits', 'memo',
  'trust', 'drawings', 'registered', 'resonance', 'diveSeen', 'rentMissed', 'scanBoost', 'totals', 'ng'];
function snapshot() { const o = {}; SAVE_KEYS.forEach(k => { o[k] = JSON.parse(JSON.stringify(state[k])); }); return o; }
function saveGame() { try { localStorage.setItem('lethe_save_d' + state.day, JSON.stringify(snapshot())); localStorage.setItem('lethe_save_last', String(state.day)); } catch (e) { /* 무시 */ } }
function loadGame(day) {
  try {
    const d = day || +localStorage.getItem('lethe_save_last');
    const o = JSON.parse(localStorage.getItem('lethe_save_d' + d) || 'null');
    if (!o) return false;
    resetState(); SAVE_KEYS.forEach(k => { if (k in o) state[k] = o[k]; });
    return true;
  } catch (e) { return false; }
}
function savedDays() { const out = []; try { for (let d = 1; d <= CONFIG.totalDays; d++) if (localStorage.getItem('lethe_save_d' + d)) out.push(d); } catch (e) { /* 무시 */ } return out; }
function hasSave() { return savedDays().length > 0; }
function clearSave() { try { for (let d = 1; d <= CONFIG.totalDays; d++) localStorage.removeItem('lethe_save_d' + d); localStorage.removeItem('lethe_save_last'); } catch (e) { /* 무시 */ } }

const META = { echo: false, endings: [], voices: [], drawings: [] };
function loadMeta() { try { Object.assign(META, JSON.parse(localStorage.getItem('lethe_meta') || '{}')); } catch (e) { /* 무시 */ } }
function saveMeta() { try { localStorage.setItem('lethe_meta', JSON.stringify(META)); } catch (e) { /* 무시 */ } }
loadMeta();

/* 엔딩 기록 (브라우저 저장소, 실패해도 무시) */
function loadRecords() { return META.endings; }
function saveRecord(id) { if (!META.endings.includes(id)) META.endings.push(id); META.echo = true; saveMeta(); }

