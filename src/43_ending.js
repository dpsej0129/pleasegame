
/* =====================================================================
   15. 엔딩 · 에필로그 슬라이드 · 갤러리 · 그림첩
   ===================================================================== */
function judgeEnding() { return ENDINGS.find(e => e.cond(state)); }

function showEnding(ending) {
  transition(() => {
    state.screen = 'ending';
    state.memo.ending = ending.id;
    saveRecord(ending.id);
    clearSave();
    const rec = loadRecords();
    const extra = ending.extra ? ending.extra(state) : [];
    const lines = [
      { text: '> LETHE://archive --final', cls: 'h' },
      { text: `${ending.tag} // ${ending.title}`, cls: 'big', pause: 700 },
      ...textOf(ending.lines).map(t => ({ text: t, cls: t.startsWith('>') ? 'bad' : 'quote', pause: 700 })),
      ...extra.map(t => ({ text: t, cls: 'quote', pause: 700 })),
      { text: ' ' },
      { text: `   잔액 ${state.money}₵ · 벌점 ${state.penalty}/${CONFIG.penaltyLimit} · 하린 ${HARIN_STATES[state.harin].label} · 단서 ${state.clues.length}/${Object.keys(CLUES).length} · 공명도 ${state.resonance}`, cls: 'dim' },
      { text: `   잃은 기억 ${lostCount()}/${MY_MEMORIES.length} (판매 ${state.sold.length} · 기증 ${state.donated.length}) · 미오의 그림 ${state.drawings.length}장`, cls: 'dim' },
      { text: `   엔딩 수집 ${rec.length}/${ENDINGS.length}`, cls: 'dim' },
    ];
    app.innerHTML = `
      <section class="screen">
        <div class="scene-head"><span class="t">FINAL LOG <b>·</b> ${esc(ending.title)}</span><span class="r">화면을 누르면 건너뜁니다</span></div>
        <div class="end-art">${stageHTML(ending.tag)}</div>
        <div class="term" id="term"></div>
        <div class="actions hidden" id="endActions">
          <button class="btn solid" id="epiBtn" type="button">후일담 ▶</button>
          <button class="btn" id="titleBtn" type="button">타이틀로</button>
        </div>
      </section>`;
    startStage(textOf(ending.bg), textOf(ending.who), textOf(ending.bgOpts) || {});
    if (ending.tag.includes('BAD')) Sound.fail();
    typeLines($('#term'), lines, () => $('#endActions').classList.remove('hidden'), { tag: 'span', speed: 24, gap: 140 });
    $('#epiBtn').addEventListener('click', () => { Sound.click(); showEpilogue(ending, 0); });
    $('#titleBtn').addEventListener('click', () => { Sound.click(); showTitle(); });
  });
}

function showEpilogue(ending, i) {
  const slides = EPILOGUE.filter(sl => !sl.cond || sl.cond(state, ending.id));
  if (i >= slides.length) { showTitle(); return; }
  const sl = slides[i];
  transition(() => {
    state.screen = 'epilogue';
    app.innerHTML = `
      <section class="screen epilogue">
        <div class="scene-head"><span class="t">EPILOGUE <b>·</b> ${i + 1}/${slides.length}</span><span class="r">${esc(textOf(sl.title) || '')}</span></div>
        ${stageHTML(textOf(sl.title))}
        <div class="vn"><div class="vn-text" id="epiText"></div></div>
        <div class="actions"><button class="btn solid" id="epiNext" type="button">${i + 1 < slides.length ? '다음 ▶' : '끝 — 타이틀로'}</button></div>
      </section>`;
    startStage(sl.bg(state, ending.id), sl.who(state, ending.id), (sl.opts && sl.opts(state, ending.id)) || {});
    typeLines($('#epiText'), [].concat(sl.text(state, ending.id)), null, { speed: 22, gap: 300 });
    $('#epiNext').addEventListener('click', () => { Sound.click(); showEpilogue(ending, i + 1); });
  });
}

function miniStage(cv, bg, who, opts) {
  const c = cv.getContext('2d');
  drawBackground(c, bg, 2.2, opts || {});
  if (who) {
    const p = document.createElement('canvas'); p.width = PW; p.height = PH;
    drawPortrait(p.getContext('2d'), who, { tint: CHARACTERS[who].tint });
    c.drawImage(p, (BW - PW * 2.3) / 2, BH - PH * 2.3, PW * 2.3, PH * 2.3);
  }
}
function showGallery() {
  transition(() => {
    state.screen = 'gallery';
    const rec = loadRecords();
    app.innerHTML = `
      <section class="screen">
        <div class="scene-head"><span class="t">엔딩 갤러리 <b>·</b> ${rec.length}/${ENDINGS.length}</span></div>
        <div class="gallery">${ENDINGS.map(e => `<figure class="${rec.includes(e.id) ? '' : 'locked'}"><canvas width="${BW}" height="${BH}" data-end="${e.id}"></canvas>
          <figcaption><b>${rec.includes(e.id) ? esc(e.title) : '???'}</b><span>${rec.includes(e.id) ? esc(e.tag) : noise(8)}</span>${rec.includes(e.id) && e.hint ? `<small>${esc(e.hint)}</small>` : ''}</figcaption></figure>`).join('')}</div>
        <div class="actions"><button class="btn" id="backBtn" type="button">← 타이틀</button></div>
      </section>`;
    document.querySelectorAll('[data-end]').forEach(cv => {
      const e = ENDINGS.find(x => x.id === cv.dataset.end);
      if (rec.includes(e.id)) { const fake = Object.assign({}, state, { flags: {}, sold: [], donated: [] }); miniStage(cv, typeof e.bg === 'function' ? e.bg(fake) : e.bg, typeof e.who === 'function' ? e.who(fake) : e.who, typeof e.bgOpts === 'function' ? {} : e.bgOpts); }
      else miniStage(cv, 'static', null, {});
    });
    $('#backBtn').addEventListener('click', () => { Sound.click(); showTitle(); });
  });
}
function showDrawings() {
  transition(() => {
    state.screen = 'drawings';
    app.innerHTML = `
      <section class="screen">
        <div class="scene-head"><span class="t">미오의 그림첩 <b>·</b> ${META.drawings.length}/${Object.keys(DRAWINGS).length - 1}</span></div>
        <div class="drawings big">${Object.keys(DRAWINGS).filter(id => id !== 'torn').map(id => `<figure><canvas width="32" height="24" data-draw="${META.drawings.includes(id) ? id : ''}"></canvas><figcaption>${META.drawings.includes(id) ? esc(DRAWINGS[id].title) : '???'}</figcaption></figure>`).join('')}</div>
        <div class="actions"><button class="btn" id="backBtn" type="button">← 타이틀</button></div>
      </section>`;
    document.querySelectorAll('[data-draw]').forEach(cv => { if (cv.dataset.draw) renderDrawing(cv, cv.dataset.draw); else { const c = cv.getContext('2d'); c.fillStyle = '#222'; c.fillRect(0, 0, 32, 24); } });
    $('#backBtn').addEventListener('click', () => { Sound.click(); showTitle(); });
  });
}

/* =====================================================================
   16. 초기화
   ===================================================================== */
$('#muteBtn').addEventListener('click', () => { state.muted = !state.muted; Sound.init(); if (!state.muted) Sound.click(); updateHUD(); });
document.addEventListener('pointerdown', () => Sound.init(), { once: true });
window.LETHE = { state, CLIENTS, ENDINGS, DAYS, META };
resetState();
showTitle();
</script>
</body>
</html>
