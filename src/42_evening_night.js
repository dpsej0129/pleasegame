
/* =====================================================================
   11. 저녁: 장소 선택 → 사이드 퀘스트 → (조용한 장면) → 밤
   ===================================================================== */
function eveningSteps(loc) {
  const ev = ((DAYS[state.day] || {}).evening || {})[loc.id];
  const story = typeof ev === 'function' ? ev(state) : ev;
  return { story: !!(story && story.length), steps: story && story.length ? story : EVENING_DEFAULT[loc.id](state) };
}
function locBadge(loc) {
  if (eveningSteps(loc).story) return '<span class="badge">★ 이야기</span>';
  if (loc.id === 'clinic' && selfScanReady()) return '<span class="badge key">잠긴 기억</span>';
  return '';
}
function selfScanReady() { return state.day >= 5 && !state.clues.includes('trace') && state.clues.length >= 2; }

function showEvening() {
  const D = DAYS[state.day] || {};
  if (D.finale) { playScene(`DAY ${state.day} · 마지막 저녁`, D.finale.bg, D.finale.steps, showNight, '마지막 밤 ▶'); return; }
  transition(() => {
    state.screen = 'evening';
    app.innerHTML = `
      <section class="screen">
        <div class="scene-head"><span class="t">DAY ${state.day} <b>·</b> 저녁</span><span class="r">오늘 밤 갈 수 있는 곳은 한 군데뿐이다</span></div>
        <div class="monologue" id="eveMono"></div>
        <div class="label">어디로 갈까?</div>
        <div class="loc-grid">
          ${LOCATIONS.map(l => `<button type="button" class="loc-card" data-loc="${l.id}"><canvas width="${BW}" height="${BH}"></canvas>${locBadge(l)}
            <div class="info"><div class="nm">${esc(l.name)}</div><div class="ds">${esc(l.desc)}</div></div></button>`).join('')}
        </div>
        <div class="label">하린 사건 단서 (${state.clues.length}/${Object.keys(CLUES).length}) · 진실 단계 ${truthLevel()}</div>
        ${state.clues.length ? `<ul class="clue-list">${state.clues.map(id => `<li>${fx(CLUES[id].text)}</li>`).join('')}</ul>` : '<p class="c-dim" style="font-size:13px">아직 아무것도 모른다. 하린은 왜 잠들어 있을까.</p>'}
      </section>`;
    typeLines($('#eveMono'), [(D.eveningLine && textOf(D.eveningLine)) || '셔터를 내리자 골목의 네온이 하나둘 켜진다.'], null, { speed: 16 });
    document.querySelectorAll('.loc-card').forEach(btn => {
      const loc = LOCATIONS.find(l => l.id === btn.dataset.loc);
      drawBackground(btn.querySelector('canvas').getContext('2d'), loc.bg, 1.7, {});
      btn.addEventListener('click', () => { Sound.click(); goLocation(loc); });
    });
  });
}
function goLocation(loc) {
  const { steps } = eveningSteps(loc);
  state.visits[loc.id] = (state.visits[loc.id] || 0) + 1;
  state.dayLog.events.push(`저녁: ${loc.name}`);
  state.memo.lastLoc = loc.id;
  playScene(`DAY ${state.day} · 저녁 · ${loc.name}`, loc.bg, steps, afterEvening, '돌아간다 ▶');
}
function afterEvening() {
  const q = (DAYS[state.day] || {}).quiet;
  if (q && (!q.cond || q.cond(state))) playScene(`조용한 장면 · ${q.title}`, q.bg, q.steps, showNight, '▶', q.opts);
  else showNight();
}

function playScene(title, bg, steps, then, label, opts) {
  transition(() => {
    state.screen = 'scene';
    app.innerHTML = `
      <section class="screen">
        <div class="scene-head"><span class="t">${esc(title)}</span></div>
        ${stageHTML(title.split('·').pop().trim())}
        ${vnHTML()}
        <div class="actions hidden" id="sceneActions"><button class="btn solid" id="sceneNext" type="button">${esc(label)}</button></div>
      </section>`;
    startStage(bg, null, opts);
    bindVN();
    runScript(steps, () => {
      $('#sceneActions').classList.remove('hidden');
      $('#choices').innerHTML = '';
      $('#sceneNext').addEventListener('click', () => { Sound.click(); then(); });
    });
  });
}

/* =====================================================================
   12. 밤: 지출 · 기억 판매 · 녹음기
   ===================================================================== */
function showNight() {
  state.nightPay = { rent: true, life: true };
  transition(() => {
    state.screen = 'night';
    const st = HARIN_STATES[state.harin];
    app.innerHTML = `
      <section class="screen">
        <div class="scene-head"><span class="t" style="color:var(--mag)">NIGHT ${state.day} <b>·</b> 2층 단칸방</span><span class="r">${state.day}/${CONFIG.totalDays}일째 밤</span></div>
        ${stageHTML('2층 단칸방 · 원격 바이탈 모니터', 'short')}
        <div class="monologue" id="nightMono" style="margin:10px 0"></div>
        <div class="night-grid">
          <div class="monitor ${isLost(4) ? 'glitch' : ''}" id="harinBox">
            <canvas id="harinCv" width="${PW}" height="${PH}"></canvas>
            <div class="cap">한하린 · 17세 · 코마 ${412 + state.day}일째</div>
            <div>상태: <b class="${st.cls}">${st.label}</b></div>
            <div class="cap">${esc(st.cap)}</div>
            <div class="cap c-mag" id="harinNote">${isLost(4) ? fx('이 아이의 웃는 얼굴이 떠오르지 않는다.') : ''}</div>
            <button class="btn small" id="recBtn" type="button" style="margin-top:8px">📼 노란 녹음기 (${(state.memo.voices || []).length})</button>
          </div>
          <div class="panel">
            <div class="label" style="margin-top:0">오늘 밤 지출</div>
            <div id="expenseList"></div>
            <div class="balance" id="balance"></div>
            <div class="warnline" id="nightWarn"></div>
          </div>
        </div>
        <div class="label">내 기억 — 판 기억도, 준 기억도 영영 돌아오지 않는다</div>
        <div class="panel" id="memList"></div>
        <div class="actions"><button class="btn solid" id="sleepBtn" type="button">지출 확정 · 밤을 보낸다 ▶</button></div>
      </section>`;
    startStage('room', null, { critical: state.harin >= 2, photoGlitch: isLost(4) });
    const nt = (DAYS[state.day] || {}).night;
    typeLines($('#nightMono'), (nt && textOf(nt)) || ['셔터를 내린다. 모니터에 하린의 바이탈이 흐른다.'], null, { speed: 18 });
    const hctx = $('#harinCv').getContext('2d');
    const drawHarin = () => drawPortrait(hctx, 'harin', { glitch: portraitGlitch('harin') });
    drawHarin();
    every(() => { if (isLost(4)) drawHarin(); }, 140);
    $('#recBtn').addEventListener('click', () => { Sound.click(); openRecorder(state.memo.voices || []); });
    renderNightPanels();
    $('#sleepBtn').addEventListener('click', confirmNight);
  });
}
function nightTotal() { return EXPENSES.reduce((sum, e) => sum + (state.nightPay[e.id] ? e.cost(state) : 0), 0); }

function renderNightPanels() {
  $('#expenseList').innerHTML = EXPENSES.map(e => `
    <div class="row-item">
      <div><div>${esc(e.name)} <span class="price">${e.cost(state)}₵</span></div><div class="desc">${esc(e.desc)}</div></div>
      <button type="button" class="btn small toggle ${state.nightPay[e.id] ? 'on' : 'off'}" data-exp="${e.id}">${state.nightPay[e.id] ? '✔ 지불' : '✖ 미지불'}</button>
    </div>`).join('');
  $('#expenseList').querySelectorAll('[data-exp]').forEach(b => b.addEventListener('click', () => {
    Sound.click(); state.nightPay[b.dataset.exp] = !state.nightPay[b.dataset.exp]; renderNightPanels();
  }));
  const total = nightTotal(), after = state.money - total;
  $('#balance').innerHTML = `<span>잔액 <b class="c-yel">${state.money}₵</b></span><span>지출 <b>-${total}₵</b></span><span>남는 돈 <b class="${after < 0 ? 'neg' : 'c-grn'}">${after}₵</b></span>`;
  $('#nightWarn').textContent = after < 0 ? `잔액이 ${-after}₵ 부족하다. 지불 항목을 줄이거나 내 기억을 팔아야 한다.` : '';
  $('#sleepBtn').disabled = after < 0;
  $('#memList').innerHTML = MY_MEMORIES.map(m => {
    const sold = state.sold.includes(m.id), given = state.donated.includes(m.id);
    return `
      <div class="row-item mem ${sold || given ? 'sold' : ''}">
        <div><span class="c-dim">${m.mark}</span> <span class="mtitle">${sold || given ? `<span class="corrupt">${noise(m.title.length)}</span>` : fx(m.title)}</span>
          <div class="desc">${sold ? '판매됨 — 데이터 없음' : given ? `기증함 — ${esc((state.memo.donatedTo || {})[m.id] || '')}` : '감정가 ' + m.price + '₵'}</div></div>
        ${sold || given ? '<span class="c-dim">░░░</span>' : `<button type="button" class="btn small mag" data-mem="${m.id}">판매 +${m.price}₵</button>`}
      </div>`;
  }).join('');
  $('#memList').querySelectorAll('[data-mem]').forEach(b => b.addEventListener('click', () => {
    Sound.click();
    const m = memById(+b.dataset.mem);
    showModal(`${m.mark} 기억 판매`, `「${m.title}」\n\n${m.price}₵에 판매합니다.\n판 기억은 영원히 사라지며, 관련된 단어는 읽을 수 없게 됩니다.\n하린의 의식 속에서도 그 자리는 비게 됩니다.`, [
      { label: `판다 (+${m.price}₵)`, cls: 'mag', onClick: () => sellMemory(m) },
      { label: '그만둔다', cls: '' },
    ]);
  }));
  updateHUD();
}

function sellMemory(m) {
  if (isLost(m.id)) return;
  state.sold.push(m.id);
  state.money += m.price;
  state.totals.sales += m.price;
  state.dayLog.sales.push({ label: m.title, amount: m.price });
  Sound.erase(); later(() => Sound.glitch(), 450); flashGlitch();
  if (m.glitchPortrait) { $('#harinBox').classList.add('glitch'); $('#harinNote').innerHTML = fx('이 아이의 웃는 얼굴이 떠오르지 않는다.'); Stage.opts.photoGlitch = true; }
  const mono = $('#nightMono');
  if (mono) mono.innerHTML = [].concat(textOf((DAYS[state.day] || {}).night) || []).map(t => `<p class="ln">${fx(t)}</p>`).join('');
  renderNightPanels();
  if (m.fake) {
    addClue('fake');
    showModal('기억 감정 결과', '중개인이 추출한 기억을 들여다보다 혀를 찬다.\n\n"이거 이식된 기억이네. 가짜야. 접합 흔적이… 이상하네, 시술자 번호가 본인이야."\n\n내 첫 시술은… 가짜였다.', [{ label: '…', cls: 'mag' }]);
  } else toast(`${m.mark} 기억이 추출되었다. 무언가가 빠져나갔다.`, 'info');
}

function openRecorder(list) {
  const ids = [...list].sort((a, b) => a - b);
  const body = Object.keys(VOICE).map(n => ids.includes(+n) ? `▶ ${n}. "${VOICE[n]}"` : `▷ ${n}. ${noise(18)}`).join('\n\n');
  showModal('📼 노란 녹음기', ids.length ? body : '재생할 메시지가 없다. 고장 난 줄 알았던 녹음기다.', [{ label: '닫는다', cls: '' }]);
  if (ids.length) { for (let i = 0; i < 6; i++) Sound.tone(300 + Math.random() * 300, 0.05, 'triangle', 0.02, 0, i * 0.09); }
}

function confirmNight() {
  const total = nightTotal();
  if (state.money < total) return;
  Sound.click();
  state.money -= total;
  state.totals.expense += total;
  EXPENSES.forEach(e => state.dayLog.expense.push({ label: e.name, amount: e.cost(state), paid: !!state.nightPay[e.id] }));
  if (!state.nightPay.life) {
    state.harin = Math.min(3, state.harin + 1);
    state.dayLog.events.push(`생명유지 비용 미납 — 하린 상태: ${HARIN_STATES[state.harin].label}`);
  }
  state.scanBoost = !state.nightPay.rent;
  if (!state.nightPay.rent) {
    state.rentMissed++;
    changeRating(-10);
    state.dayLog.events.push(`월세 미납 (누적 ${state.rentMissed}회) — 내일 경찰 스캔 가속`);
    if (state.rentMissed === CONFIG.rentPenaltyAfter) addPenalty('월세 누적 체납 — 건물주의 신고');
  }
  const dv = (DAYS[state.day] || {}).dive;
  if (dv && state.harin < 3) showDive(dv, showSettlement);
  else showSettlement();
}

/* =====================================================================
   13. 하린 다이브: 판 기억은 회색 노이즈 공간이 된다
   ===================================================================== */
function showDive(n, then) {
  const dv = DIVES[n];
  if (!dv) { then(); return; }
  transition(() => {
    state.screen = 'dive';
    app.innerHTML = `
      <section class="screen dive">
        <div class="scene-head"><span class="t" style="color:#b48aff">DIVE ${n} <b>·</b> ${esc(dv.title)}</span><span class="r">공명도 <b id="resoVal">${state.resonance}</b></span></div>
        ${stageHTML('하린의 의식 속')}
        ${vnHTML()}
        <div class="room-list hidden" id="rooms"></div>
        <div class="actions hidden" id="diveActions"><button class="btn solid" id="diveNext" type="button">떠오른다 ▶</button></div>
      </section>`;
    startStage(dv.bg, 'harinDream', { dream: true });
    bindVN();
    const critical = state.harin >= 2;
    const rooms = dv.rooms.filter(r => !r.need || r.need(state)).slice(0, critical ? 1 : 99);
    const visited = new Set();
    const finish = () => runScript(dv.end || [], () => { $('#diveActions').classList.remove('hidden'); $('#diveNext').addEventListener('click', () => { Sound.click(); then(); }); });
    const renderRooms = () => {
      $('#vn').classList.add('hidden');
      const box = $('#rooms');
      box.classList.remove('hidden');
      box.innerHTML = rooms.map((r, i) => {
        const lost = r.mem && isLost(r.mem);
        return `<button type="button" class="room ${visited.has(i) ? 'done' : ''} ${lost ? 'lost' : ''}" data-room="${i}" ${visited.has(i) ? 'disabled' : ''}>
          <span class="rn">${lost ? noise(r.name.length + 2) : esc(r.name)}</span><span class="rd">${visited.has(i) ? '…' : lost ? '여기, 뭔가 있었다' : esc(r.hint || '')}</span></button>`;
      }).join('') + (visited.size === rooms.length ? '' : '<div class="c-dim" style="font-size:12px;margin-top:6px">하린의 실루엣이 앞서 걷는다. 기억의 방을 하나씩 지나간다.</div>');
      box.querySelectorAll('[data-room]').forEach(b => b.addEventListener('click', () => enterRoom(+b.dataset.room)));
      if (visited.size === rooms.length) { box.classList.add('hidden'); $('#vn').classList.remove('hidden'); finish(); }
    };
    const enterRoom = i => {
      const r = rooms[i];
      visited.add(i);
      $('#rooms').classList.add('hidden');
      $('#vn').classList.remove('hidden');
      const lost = r.mem && isLost(r.mem);
      setBg(r.bg, lost ? { static: 0.85, dream: true } : { dream: true });
      setPortrait('harinDream');
      const key = `${n}-${r.id}`;
      const steps = lost ? [N(`${r.name}. …였던 곳. 회색 잡음만 가득하다.`), N('하린의 실루엣이 그 앞에서 멈춰 선다. 돌아보지 않는다.'), T('harinDream', '여기… 뭐가 있었는데.'),
        ...(r.lostSteps || [])] : r.steps;
      runScript(steps, () => {
        if (!lost && !state.diveSeen.includes(key)) { state.diveSeen.push(key); state.resonance += r.reso || 1; $('#resoVal').textContent = state.resonance; Sound.coin(); }
        setBg(dv.bg, { dream: true });
        renderRooms();
      });
    };
    runScript(critical ? [N('하린의 의식이 어둡다. 경고음이 다이브 장비를 타고 들려온다. 오래 머물 수 없다.'), ...(dv.intro || [])] : (dv.intro || []), renderRooms);
  });
}

/* =====================================================================
   14. 결산: 터미널 로그 + 1인칭 일기 + 미오의 그림
   ===================================================================== */
function diaryStyle(lines, lv) {
  return lines.map((t, i) => {
    if (lv >= 2 && i % 2 === 1) t = t.replace(/[.!?]?$/, '—');
    if (lv >= 3 && i === lines.length - 1) t = t + ' ' + t + ' ' + t.slice(0, 8) + '…';
    return t;
  });
}
function showSettlement() {
  transition(() => {
    state.screen = 'settle';
    const L = state.dayLog;
    const sum = arr => arr.reduce((s, x) => s + x.amount, 0);
    const paid = L.expense.filter(e => e.paid);
    const diary = diaryStyle([].concat(((DAYS[state.day] || {}).diary || (() => []))(state)), truthLevel());
    const remain = MY_MEMORIES.filter(m => !isLost(m.id));
    const recall = remain.length ? remain[(Math.random() * remain.length) | 0] : null;
    const lines = [
      { text: `> LETHE://ledger --day ${state.day}`, cls: 'h' },
      { text: ' ' },
      { text: `[수입]  +${sum(L.income)}₵`, cls: 'ok' },
      ...L.income.map(x => ({ text: `   · ${x.label} +${x.amount}₵`, cls: 'dim' })),
      ...(L.sales.length ? [{ text: `[기억 판매]  +${sum(L.sales)}₵`, cls: 'mg' }, ...L.sales.map(x => ({ text: `   · ${noise(x.label.length)} +${x.amount}₵`, cls: 'mg' }))] : []),
      { text: `[지출]  -${sum(paid) + sum(L.spend)}₵`, cls: 'warn' },
      ...L.expense.map(x => ({ text: `   · ${x.label} ${x.paid ? '-' + x.amount + '₵' : '미지불'}`, cls: x.paid ? 'dim' : 'bad' })),
      ...L.spend.map(x => ({ text: `   · ${x.label} -${x.amount}₵`, cls: 'dim' })),
      { text: `[잔액]  ${state.money}₵   [벌점]  ${state.penalty}/${CONFIG.penaltyLimit}   [기업 평가]  ${ratingGrade(state.rating)}`, cls: 'h' },
      ...L.penalties.map(p => ({ text: `   · 벌점: ${p}`, cls: 'bad' })),
      ...(L.damage.length ? [{ text: `[인격 손상]  ${L.damage.map(x => `${x.name} ${x.n}건`).join(', ')}`, cls: 'warn' }] : []),
      { text: `[하린]  ${HARIN_STATES[state.harin].label}   [단서]  ${state.clues.length}/${Object.keys(CLUES).length}   [잃은 기억]  ${lostCount()}/${MY_MEMORIES.length}`, cls: ['ok', 'warn', 'bad', 'bad'][state.harin] },
      ...L.events.map(e => ({ text: `   · ${e}`, cls: 'warn' })),
      { text: ' ' },
      { text: `[서진의 일기 — ${state.day}일째 밤]`, cls: 'h' },
      ...diary.map(t => ({ text: t, cls: 'quote' })),
      ...(recall ? [{ text: `(${recall.mark} ${recall.diary})`, cls: 'dim' }] : [{ text: noise(30), cls: 'mg' }]),
      { text: ' ' },
      { text: '> EOF', cls: 'dim' },
    ];
    const isLast = state.day >= CONFIG.totalDays;
    const dead = state.harin >= 3;
    const revoked = state.penalty >= CONFIG.penaltyLimit;
    const drawings = [...state.drawings, ...(state.flags.mioBetrayed ? ['torn'] : [])];
    app.innerHTML = `
      <section class="screen">
        <div class="label">DAY ${state.day} 결산 — 화면을 누르면 로그를 건너뜁니다</div>
        <div class="term" id="term"></div>
        ${drawings.length ? `<div class="label">미오의 그림 (${state.drawings.length})</div><div class="drawings">${drawings.map(id => `<figure><canvas width="32" height="24" data-draw="${id}"></canvas><figcaption>${esc(DRAWINGS[id].title)}</figcaption></figure>`).join('')}</div>` : ''}
        <div class="actions hidden" id="settleActions">
          <button class="btn ${revoked || dead ? 'red' : 'solid'}" id="goBtn" type="button">${revoked ? '⚠ 면허 관리국 통보 수신' : dead ? '…' : isLast ? '마지막 기록 열람 ▶' : `DAY ${state.day + 1} ▶`}</button>
        </div>
      </section>`;
    document.querySelectorAll('[data-draw]').forEach(cv => renderDrawing(cv, cv.dataset.draw));
    typeLines($('#term'), lines, () => $('#settleActions').classList.remove('hidden'), { tag: 'span', speed: 6, chunk: 2, gap: 50 });
    $('#goBtn').addEventListener('click', () => {
      Sound.click();
      if (revoked) { showEnding(ENDINGS.find(e => e.id === 'revoked')); return; }
      if (dead) { showEnding(ENDINGS.find(e => e.id === 'loss')); return; }
      if (isLast) { showEnding(judgeEnding()); return; }
      const il = (DAYS[state.day] || {}).interlude;
      const next = () => { state.day++; startDay(); };
      if (il) showInterlude(il, next); else next();
    });
  });
}
