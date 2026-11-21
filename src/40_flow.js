
/* =====================================================================
   8. 화면: 타이틀 · 메뉴
   ===================================================================== */
function showTitle() {
  transition(() => {
    state.screen = 'title';
    const rec = loadRecords();
    const days = savedDays();
    app.innerHTML = `
      <section class="screen title-screen" style="min-height:auto;gap:12px;padding-top:8px">
        <div class="logo" data-text="LETHE">LETHE</div>
        <div class="subtitle">// 기억 삭제 클리닉${META.echo ? ' <span class="c-yel">↻</span>' : ''}</div>
        ${stageHTML(META.echo ? '잔향 · 두 번째 강' : '네오서울 7구역 · 2089')}
        <div class="intro" id="intro"></div>
        <div class="menu-col">
          <button class="btn solid" id="startBtn" type="button">▶ 새로 시작${META.echo ? ' (↻ 2회차)' : ''}</button>
          ${days.length ? `<button class="btn" id="contBtn" type="button">↻ 이어하기 — ${days[days.length - 1]}일차 아침</button>` : ''}
          ${days.length > 1 ? `<div class="day-pick">${days.map(d => `<button class="btn small" data-load="${d}" type="button">${d}일차</button>`).join('')}</div>` : ''}
          ${rec.length ? `<div class="day-pick"><button class="btn small mag" data-ch="1" type="button">1막 「시술사」</button><button class="btn small mag" data-ch="4" type="button">2막 「균열」</button><button class="btn small mag" data-ch="8" type="button">3막 「망각의 강」</button></div>` : ''}
          <div class="day-pick">
            <button class="btn small" id="galBtn" type="button">엔딩 갤러리 ${rec.length}/${ENDINGS.length}</button>
            <button class="btn small" id="recBtn" type="button">📼 녹음기 ${META.voices.length}/7</button>
            <button class="btn small" id="drawBtn" type="button">🖍 미오의 그림첩 ${META.drawings.length}</button>
          </div>
        </div>
      </section>`;
    startStage('alley', 'me');
    typeLines($('#intro'), META.echo ? [
      '강을 한 번 건넌 사람은 물소리를 기억한다.',
      '서진은 아무것도 기억하지 못한다. 하지만 이 화면은 기억하고 있다.',
      { text: '↻ 표시가 붙은 선택지는 지난번의 당신이 남긴 것이다.', cls: 'c-yel' },
    ] : [
      '2089년, 네오서울 뒷골목의 기억 삭제 시술소.',
      '당신은 시술사 서진. 손님의 기억을 지워 돈을 번다.',
      '혼수상태의 여동생 하린을 살리려면 매일 밤 돈이 필요하다.',
      '열흘. 열 번의 밤. 그리고 지워진 413일 전의 하루.',
      { text: '돈이 모자라면, 당신의 기억을 팔 수도 있다.', cls: 'c-mag' },
    ], null, { speed: 20 });
    const go = fn => () => { Sound.init(); Sound.click(); fn(); };
    $('#startBtn').addEventListener('click', go(() => { clearSave(); resetState(); state.day = 1; startDay(); }));
    if ($('#contBtn')) $('#contBtn').addEventListener('click', go(() => { if (loadGame()) startDay(); }));
    document.querySelectorAll('[data-load]').forEach(b => b.addEventListener('click', go(() => { if (loadGame(+b.dataset.load)) startDay(); })));
    document.querySelectorAll('[data-ch]').forEach(b => b.addEventListener('click', go(() => startChapter(+b.dataset.ch))));
    $('#galBtn').addEventListener('click', go(showGallery));
    $('#recBtn').addEventListener('click', go(() => openRecorder(META.voices)));
    $('#drawBtn').addEventListener('click', go(showDrawings));
  });
}

function startChapter(day) {
  resetState();
  const cs = CHAPTER_STATES[day];
  if (cs) {
    Object.assign(state, JSON.parse(JSON.stringify({ money: cs.money, penalty: cs.penalty, sold: cs.sold, clues: cs.clues, outcomes: cs.outcomes })));
    Object.assign(state.trust, cs.trust); Object.assign(state.flags, cs.flags);
    state.memo.voices = cs.clues.map(id => CLUES[id].voice).filter(Boolean);
  }
  state.day = day;
  startDay();
}

/* =====================================================================
   9. 하루 시작 · 아침 · 규칙
   ===================================================================== */
function startDay() {
  const D = DAYS[state.day] || {};
  state.dayClients = CLIENTS.filter(c => c.day === state.day && (!c.cond || c.cond(state)));
  state.clientIdx = 0;
  state.dayLog = newDayLog();
  state.memo.maintToday = !!state.flags.maintenance; state.flags.maintenance = false;
  state.memo.shakeToday = !!state.flags.selfScanShake; state.flags.selfScanShake = false;
  state.memo.hotToday = !!state.flags.scanHot; state.flags.scanHot = false;
  state.flags.hotNow = false;
  if (activeRules(state.day).registry && !state.memo.registryStarted) {   // 등록제 소급 적용
    state.memo.registryStarted = true;
    (state.memo.erasures || []).forEach(e => state.registered.push(e));
  }
  saveGame();
  if (D.actStart) showActCard(actOf(state.day), showMorning);
  else showMorning();
}

function showActCard(act, then) {
  transition(() => {
    state.screen = 'actcard';
    app.innerHTML = `<section class="screen act-card"><div class="act-no">${act}막</div><div class="act-title" data-text="${ACTS[act].title}">「${ACTS[act].title}」</div>
      <div class="act-days">${ACTS[act].days[0]}일차 — ${ACTS[act].days[1]}일차</div></section>`;
    later(() => { if (state.screen === 'actcard') then(); }, 2600);
    app.querySelector('.act-card').addEventListener('click', () => { if (state.screen === 'actcard') then(); });
  });
}

function scanMultiplier() {
  let m = RULES.some(r => r.day <= state.day && r.scanMul) ? 1.2 : 1;
  if (state.scanBoost) m *= CONFIG.rentScanBoost;
  if (state.memo.maintToday) m *= CONFIG.maintenanceScan;
  if (state.memo.shakeToday) m *= CONFIG.selfScanShake;
  if (state.memo.hotToday) m *= 1.2;
  if (state.flags.hotNow) m *= 1.2;
  return m;
}

function showMorning() {
  const sc = (DAYS[state.day] || {}).morning || { bg: 'clinic', steps: [] };
  transition(() => {
    state.screen = 'morning';
    app.innerHTML = `
      <section class="screen">
        <div class="scene-head"><span class="t">DAY ${state.day} <b>·</b> 아침</span><span class="r">2089.11.${String(16 + state.day).padStart(2, '0')}</span></div>
        ${stageHTML('7구역 · 시술소')}
        ${vnHTML()}
        <div id="ruleBox" class="hidden"></div>
      </section>`;
    startStage(sc.bg, null, sc.opts);
    bindVN();
    runScript(sc.steps, showRules);
  });
}

function showRules() {
  const rules = activeRules(state.day);
  const mul = scanMultiplier();
  const box = $('#ruleBox');
  $('#vn').classList.add('hidden');
  $('#choices').innerHTML = '';
  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="label">아마테크 보안국 공지 — 오늘의 시술 규칙</div>
    <ul class="rule-list">
      ${rules.list.map(r => `<li class="${r.day === state.day ? 'new' : 'old'}"><div class="tagline">${r.day === state.day ? '● 신규 규칙' : '○ ' + r.day + '일차부터'}</div><b>${esc(r.title)}</b>${r.day === state.day || rules.list.length < 5 ? `<br><span class="c-dim">${esc(r.text)}</span>` : ''}</li>`).join('')}
      ${Math.abs(mul - 1) > 0.01 ? `<li class="new"><div class="tagline">⚠ 오늘의 경찰 스캔</div>속도 ×${mul.toFixed(2)}${state.scanBoost ? ' · 월세 미납' : ''}${state.memo.maintToday ? ' · 장비 정비' : ''}${state.memo.shakeToday ? ' · 손 떨림' : ''}${state.memo.hotToday || state.flags.hotNow ? ' · 감시 강화' : ''}</li>` : ''}
    </ul>
    <div class="label">예약 손님</div>
    <p class="client-preview">${state.dayClients.map(c => esc(CHARACTERS[c.who].name)).join('  ·  ') || '없음'} — 벌점 ${CONFIG.penaltyLimit}점이면 즉시 면허 박탈</p>
    <div class="actions"><button class="btn solid" id="openBtn" type="button">셔터를 올린다 ▶</button></div>`;
  $('#openBtn').addEventListener('click', () => { Sound.click(); nextClient(); });
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextClient() {
  if (state.penalty >= CONFIG.penaltyLimit) { showEnding(ENDINGS.find(e => e.id === 'revoked')); return; }
  if (state.clientIdx < state.dayClients.length) showClient(state.dayClients[state.clientIdx]);
  else showEvening();
}

/* 인터루드: 선택지 없는 장면 */
function showInterlude(id, then) {
  const il = INTERLUDES[id];
  if (!il) { then(); return; }
  transition(() => {
    state.screen = 'interlude';
    app.innerHTML = `
      <section class="screen interlude">
        <div class="scene-head"><span class="t">INTERLUDE <b>·</b> ${esc(il.title)}</span></div>
        ${stageHTML(il.title)}
        ${vnHTML()}
        <div class="actions hidden" id="ilActions"><button class="btn solid" id="ilNext" type="button">▶</button></div>
      </section>`;
    startStage(il.bg, null, il.opts);
    bindVN();
    runScript(il.steps, () => { $('#ilActions').classList.remove('hidden'); $('#ilNext').addEventListener('click', () => { Sound.click(); then(); }); });
  });
}
