
/* =====================================================================
   7. 도트 무대 + 대화(VN) 엔진
   ===================================================================== */
const Stage = { bg: 'alley', who: null, opts: {}, talking: false, blinkUntil: 0, nextBlink: 0 };

function stageHTML(loc, cls) {
  return `<div class="stage ${cls || ''}" id="stage">
    <canvas class="bg" id="bgCv" width="${BW}" height="${BH}"></canvas>
    <canvas class="pt off" id="ptCv" width="${PW}" height="${PH}"></canvas>
    ${loc ? `<div class="loc">${esc(loc)}</div>` : ''}</div>`;
}
function vnHTML() {
  return `<div class="vn" id="vn"><div class="vn-name narr" id="vnName"></div><div class="vn-text" id="vnText"></div>
    <span class="hint">탭 · Space 로 넘기기</span><div class="vn-next hidden" id="vnNext">▼</div></div>
    <div class="choices" id="choices"></div>`;
}
function portraitGlitch(id) { return (id === 'harin' || id === 'harinAwake') && isSold(4) ? 0.45 : 0; }

/* 배경·초상 애니메이션 루프 (약 12fps, 도트 느낌 유지) */
function startStage(bg, who, opts) {
  Stage.bg = bg; Stage.opts = opts || {}; Stage.talking = false;
  const bgCv = $('#bgCv'), ptCv = $('#ptCv');
  if (!bgCv) return;
  const bctx = bgCv.getContext('2d'), pctx = ptCv.getContext('2d');
  setPortrait(who);
  const t0 = performance.now();
  let last = 0;
  const loop = now => {
    state.raf = requestAnimationFrame(loop);
    if (!bgCv.isConnected) { cancelAnimationFrame(state.raf); return; }
    if (now - last < 80) return;
    last = now;
    const t = (now - t0) / 1000;
    drawBackground(bctx, Stage.bg, t, Stage.opts);
    const scan = state.screen === 'client' && state.client && state.client.running ? state.client.scan / 100 : 0;
    if (scan > 0.5) { bctx.globalAlpha = (scan - 0.5) * 0.5 * (0.6 + 0.4 * Math.sin(t * 9)); bctx.fillStyle = '#ff3b4e'; bctx.fillRect(0, 0, BW, BH); bctx.globalAlpha = 1; }
    pctx.clearRect(0, 0, PW, PH);
    if (Stage.who) {
      if (now > Stage.nextBlink) { Stage.blinkUntil = now + 140; Stage.nextBlink = now + 2200 + Math.random() * 2800; }
      drawPortrait(pctx, Stage.who, {
        blink: now < Stage.blinkUntil,
        talk: Stage.talking && ((now / 130) | 0) % 2 === 0,
        glitch: portraitGlitch(Stage.who) + (scan > 0.8 ? 0.15 : 0),
        tint: CHARACTERS[Stage.who].tint,
      });
    }
  };
  state.raf = requestAnimationFrame(loop);
}
function setPortrait(who) {
  Stage.who = who && CHARACTERS[who] ? who : null;
  const pt = $('#ptCv');
  if (pt) pt.classList.toggle('off', !Stage.who);
}
function setBg(bg, opts) {
  Stage.bg = bg;
  Stage.opts = opts || {};
  const st = $('#stage');
  if (st) { st.classList.remove('flash'); void st.offsetWidth; st.classList.add('flash'); }
  Sound.glitch();
}

/* VN 입력: 대화창 클릭 / Space / Enter */
function bindVN() {
  const box = $('#vn');
  if (box) box.addEventListener('click', () => { if (state.vnAdvance) state.vnAdvance(); });
}
document.addEventListener('keydown', e => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  if (state.modalOpen || !state.vnAdvance) return;
  if (e.target && e.target.closest && e.target.closest('button')) return;
  e.preventDefault();
  state.vnAdvance();
});

const textOf = v => (typeof v === 'function' ? v(state) : v);

/* 스크립트 실행기: steps를 순서대로 실행한 뒤 done() */
function runScript(steps, done) {
  const sess = state.vnSession;
  let i = 0;
  const next = () => {
    if (sess !== state.vnSession) return;
    if (i >= steps.length) { if (done) done(); return; }
    execStep(steps[i++], next);
  };
  next();
}
function execStep(st, cont) {
  if (!st) return cont();
  if ('n' in st) return showLine(null, textOf(st.n), cont);
  if ('who' in st && 't' in st) { if (st.who !== 'me') setPortrait(st.who); return showLine(st.who, textOf(st.t), cont); }
  if ('show' in st) { setPortrait(st.show); return cont(); }
  if ('bg' in st) { setBg(st.bg, st.opts); return cont(); }
  if ('pause' in st) { later(cont, st.pause); return; }
  if ('clue' in st) { addClue(st.clue); return cont(); }
  if ('do' in st) { st.do(state); if (st.note) toast(st.note, 'info'); updateHUD(); return cont(); }
  if ('if' in st) return runScript(st.if(state) ? st.yes : st.no, cont);
  if ('menu' in st) return showMenu(st.menu, cont);
  cont();
}

function showLine(who, text, cont) {
  const sess = state.vnSession;
  const nameEl = $('#vnName'), textEl = $('#vnText'), nextEl = $('#vnNext');
  if (!textEl) return cont();
  $('#choices').innerHTML = '';
  if (!who) { nameEl.className = 'vn-name narr'; nameEl.textContent = '—'; textEl.className = 'vn-text narr'; }
  else { nameEl.className = 'vn-name' + (who === 'me' ? ' me' : ''); nameEl.innerHTML = who === 'me' ? playerName() : fx(CHARACTERS[who].name); textEl.className = 'vn-text'; }
  textEl.innerHTML = '';
  nextEl.classList.add('hidden');
  Stage.talking = !!who && who !== 'me';
  let typing = true;
  const skip = typeLines(textEl, [text], () => {
    typing = false; Stage.talking = false;
    nextEl.classList.remove('hidden');
  }, { speed: 24, gap: 0, noClick: true });
  state.vnAdvance = () => {
    if (sess !== state.vnSession) return;
    if (typing) { skip(); return; }
    state.vnAdvance = null;
    Sound.click();
    cont();
  };
}

/* 선택지: end가 없는 선택지는 실행 후 메뉴로 돌아온다 */
function showMenu(opts, cont) {
  const sess = state.vnSession;
  state.vnAdvance = null;
  const nextEl = $('#vnNext');
  if (nextEl) nextEl.classList.add('hidden');
  const used = new Set();
  const render = () => {
    if (sess !== state.vnSession) return;
    const box = $('#choices');
    box.innerHTML = '';
    opts.forEach((o, idx) => {
      if ((o.once && used.has(idx)) || (o.if && !o.if(state))) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice' + (o.end ? ' end' : '');
      b.innerHTML = (o.ng ? '<span class="c-yel">↻ </span>' : '') + fx(textOf(o.t));
      b.addEventListener('click', () => {
        if (sess !== state.vnSession) return;
        Sound.click();
        box.innerHTML = '';
        used.add(idx);
        if (o.do) o.do(state);
        if (o.note) toast(o.note, 'info');
        updateHUD();
        runScript(o.then || [], () => (o.end ? cont() : render()));
      });
      box.appendChild(b);
    });
    if (!box.children.length) { cont(); return; }
    const last = box.lastElementChild;
    if (last && last.getBoundingClientRect().bottom > window.innerHeight) last.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };
  render();
}
