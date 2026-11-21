
/* =====================================================================
   10. 화면: 시술 (면담 → 시술 → 결과 → 후속 대화)
   ===================================================================== */
function clientCards(d) { return typeof d.cards === 'function' ? d.cards(state) : (d.cards || []); }

function showClient(data) {
  transition(() => {
    state.screen = 'client';
    state.client = { data, cards: [], selected: new Set(), resolved: false, scan: 0, running: false, lastAlarm: 0, forged: false };
    const name = CHARACTERS[data.who].name;
    app.innerHTML = `
      <section class="screen">
        <div class="gauge-wrap hidden" id="gaugeWrap">
          <div class="gauge-top"><span id="gaugeLabel">🚨 경찰 기억 스캔 ×${scanMultiplier().toFixed(2)}</span><span class="pct" id="gaugePct">0%</span></div>
          <div class="gauge" id="gauge"><div class="fill" id="gaugeFill"></div></div>
        </div>
        <div class="scene-head"><span class="t">DAY ${state.day} <b>·</b> 손님 ${state.clientIdx + 1}/${state.dayClients.length} <b>·</b> ${fx(name)}</span>
          <span class="r">${esc(data.meta || '')}${data.pay ? ` · 보수 <span class="c-yel">${data.pay}₵</span>` : ''}</span></div>
        ${stageHTML(data.type === 'scene' ? '시술소' : data.loc || '시술소 · 면담', data.stageCls)}
        ${vnHTML()}
        <div id="treat" class="hidden"></div>
        <div class="result term hidden" id="result"></div>
        <div class="actions hidden" id="actions"></div>
      </section>`;
    startStage(data.bg || 'clinic', data.who, data.bgOpts);
    bindVN();
    runScript(data.talk || [], () => {
      if (data.type === 'scene') { state.outcomes[data.id] = state.outcomes[data.id] || 'done'; $('#vn').classList.add('hidden'); showNextButton(); }
      else startTreatment();
    });
  });
}

function startTreatment() {
  const c = state.client, data = c.data;
  const rules = activeRules(state.day);
  const isOffer = data.type === 'offer';
  const vipExempt = data.vip && rules.vipProtect;
  c.cards = clientCards(data);
  const tagHtml = t => {
    const cls = data.exempt ? '' : (!vipExempt && rules.forbidTags.includes(t)) ? 'forbid' : rules.reportTags.includes(t) ? 'report' : '';
    return `<span class="tag ${cls}">[${esc(t)}]</span>`;
  };
  setPortrait(data.who);
  $('#vn').classList.add('hidden');
  $('#choices').innerHTML = '';
  if (!data.noGauge) $('#gaugeWrap').classList.remove('hidden');
  const treat = $('#treat');
  treat.classList.remove('hidden');
  treat.innerHTML = `
    <div class="request">${fx(textOf(data.request))}</div>
    <div class="rules-mini">유효 규칙: ${rules.list.filter(r => r.day === state.day || (r.forbidTags || []).concat(r.reportTags || []).some(t => c.cards.some(cd => cd.tags.includes(t)))).map(r => `<span>${r.day}일 ${esc(r.title)}</span>`).join('')}<span class="c-dim">(전체 ${rules.list.length}개)</span>${vipExempt ? '<span class="c-yel">· 임원 VIP</span>' : ''}${rules.registry && !data.exempt ? '<span class="c-mag">· 지운 기억은 보안국에 사본 제출</span>' : ''}</div>
    ${data.tutorial ? `<div class="tutorial">${esc(data.tutorial)}</div>` : ''}
    ${data.noGauge ? '<div class="tutorial" style="border-color:var(--mag);color:var(--mag)">이번 시술은 아무도 지켜보지 않는다. 화면에는 당신의 심박만 남는다.</div>' : ''}
    <div class="label">${esc(data.cardsLabel || '기억 장면 카드')} — ${c.cards.length}개${isOffer ? '' : ' · 지울 장면을 선택'}</div>
    <div class="cards" id="cards">
      ${c.cards.map((cd, i) => `
        <button type="button" class="card ${isOffer || cd.locked ? 'fake locked' : ''}" data-i="${i}">
          <div class="no">SCENE #${String(i + 1).padStart(2, '0')}</div>
          <div class="txt">${fx(textOf(cd.text))}</div>
          <div>${cd.tags.map(tagHtml).join('')}</div>
        </button>`).join('')}
    </div>`;
  const extra = (data.actions || []).filter(a => !a.if || a.if(state));
  const acts = $('#actions');
  acts.classList.remove('hidden');
  acts.innerHTML = isOffer ? `
      <button class="btn mag" id="actMain" type="button">💉 수락 · 이식 실행 (+${data.pay}₵)</button>
      <button class="btn" id="actRefuse" type="button">✋ 거절</button>
      <button class="btn yel" id="actReport" type="button">📡 신고하기</button>` : `
      <button class="btn mag" id="actMain" type="button" disabled>${esc(data.eraseLabel || '⌫ 삭제 실행')} (0)</button>
      ${extra.map((a, i) => `<button class="btn yel" data-extra="${i}" type="button">${esc(a.label)}</button>`).join('')}
      ${rules.registry && !data.exempt ? '<button class="btn" id="actForge" type="button">🗂 빈 사본 제출 (스캔 +25%)</button>' : ''}
      <button class="btn" id="actRefuse" type="button">${esc(textOf(data.refuseLabel) || '✋ 돌려보내기')}</button>
      ${data.noReport ? '' : '<button class="btn yel" id="actReport" type="button">📡 신고하기</button>'}`;

  if (!isOffer) {
    $('#cards').addEventListener('click', e => {
      const card = e.target.closest('.card');
      if (!card || c.resolved || state.modalOpen || card.classList.contains('locked')) return;
      const i = +card.dataset.i;
      if (c.selected.has(i)) c.selected.delete(i); else c.selected.add(i);
      card.classList.toggle('selected', c.selected.has(i));
      Sound.select();
      const btn = $('#actMain');
      btn.disabled = c.selected.size === 0;
      btn.textContent = `${data.eraseLabel || '⌫ 삭제 실행'} (${c.selected.size})`;
    });
  }
  $('#actMain').addEventListener('click', () => { Sound.click(); resolveClient(isOffer ? 'accept' : 'erase'); });
  $('#actRefuse').addEventListener('click', () => { Sound.click(); resolveClient('refuse'); });
  if ($('#actReport')) $('#actReport').addEventListener('click', () => {
    Sound.click();
    showModal('📡 신고하기', `${CHARACTERS[data.who].name}을(를) 신고합니다.\n손님은 연행되며 보수는 받을 수 없습니다.${isOffer || data.vip ? '' : `\n(신고 포상금 ${CONFIG.reportBounty}₵)`}`, [
      { label: '신고한다', cls: 'yel', onClick: () => resolveClient('report') },
      { label: '취소', cls: '' },
    ]);
  });
  if ($('#actForge')) $('#actForge').addEventListener('click', () => {
    if (c.resolved || c.forged) return;
    c.forged = true; c.scan = Math.min(99, c.scan + 25); renderGauge(); Sound.erase();
    $('#actForge').disabled = true; $('#actForge').textContent = '🗂 빈 사본 준비됨';
    toast('이번 시술의 사본은 빈 파일로 제출된다.', 'info');
  });
  document.querySelectorAll('[data-extra]').forEach(b => b.addEventListener('click', () => {
    const a = extra[+b.dataset.extra];
    if (c.resolved) return;
    a.do(state, c);
    if (a.scan) { c.scan = Math.min(99, c.scan + a.scan); renderGauge(); }
    b.disabled = true;
    if (a.doneLabel) b.textContent = a.doneLabel;
    Sound.erase();
    if (a.note) toast(a.note, 'info');
    if (a.finish) resolveClient(a.finish);
  }));
  treat.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!data.noGauge) startScan();
}

/* 경찰 스캔 게이지 */
function startScan() {
  const c = state.client;
  if (!c || c.running || c.resolved) return;
  c.running = true;
  state.lastTick = performance.now();
  const rate = (100 / CONFIG.scanSeconds) * scanMultiplier();
  every(() => {
    const now = performance.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    if (!c.running || c.resolved || state.modalOpen) return;
    c.scan = Math.min(100, c.scan + rate * dt);
    renderGauge();
    if (c.scan >= CONFIG.scanDangerPct && now - c.lastAlarm > 900) { c.lastAlarm = now; Sound.alarm(); }
    if (c.scan >= 100) resolveClient('timeout');
  }, 100);
}
function stopScan() { if (state.client) state.client.running = false; document.body.classList.remove('danger'); }
function renderGauge() {
  const c = state.client;
  const fill = $('#gaugeFill');
  if (!fill || !c) return;
  const hot = c.scan >= CONFIG.scanDangerPct;
  fill.style.width = c.scan + '%';
  $('#gaugePct').textContent = Math.floor(c.scan) + '%' + (hot ? ' ⚠ 위험' : '');
  $('#gauge').classList.toggle('hot', hot);
  $('#gaugeWrap').classList.toggle('hot', hot);
  document.body.classList.toggle('danger', hot && c.running && !c.resolved);
}

/* 결과 판정. mode: 'erase' | 'accept' | 'refuse' | 'report' | 'timeout' */
function resolveClient(mode) {
  const c = state.client;
  if (!c || c.resolved) return;
  if (mode === 'erase' && c.selected.size === 0) return;
  c.resolved = true;
  stopScan();
  const d = c.data;
  const name = CHARACTERS[d.who].name;
  const rules = activeRules(state.day);
  const isOffer = d.type === 'offer';
  const vipProtect = d.vip && rules.vipProtect;
  const sel = [...c.selected].map(i => c.cards[i]);
  const r = { mode, outcome: mode, sel, keys: new Set(sel.map(x => x.key).filter(Boolean)), pay: 0, lines: [], penalty: true };
  let wrong = 0;

  document.querySelectorAll('#cards .card').forEach(el => {
    el.classList.add('locked');
    if (mode === 'erase' && c.selected.has(+el.dataset.i)) { el.classList.remove('selected'); el.classList.add('erased'); }
  });

  if (mode === 'report') {
    r.outcome = 'reported';
    if (!vipProtect) { state.totals.reports++; if (!isOffer && !d.noBounty) { r.pay = CONFIG.reportBounty; changeRating(+15); } setPortrait(d.reportWho || 'agent'); }
  } else if (mode === 'timeout') {
    r.outcome = 'timeout'; Sound.fail(); changeRating(-10); setPortrait(null);
  } else if (isOffer) {
    if (mode === 'accept') { r.outcome = 'accepted'; r.pay = d.pay; } else r.outcome = 'refused';
  } else if (mode === 'refuse') {
    r.outcome = 'refused';
  } else {
    Sound.erase();
    const reqTotal = c.cards.filter(x => x.req).length;
    const reqHit = sel.filter(x => x.req).length;
    wrong = sel.filter(x => !x.req).length;
    r.pay = Math.round((d.pay || 0) * (reqTotal ? reqHit / reqTotal : 1) * Math.max(0, 1 - CONFIG.wrongErasePayCut * wrong));
    r.outcome = wrong > 0 ? 'damaged' : reqHit === reqTotal ? 'perfect' : 'partial';
    if (wrong > 0 && !d.exempt) { state.dayLog.damage.push({ name, n: wrong }); state.totals.damage += wrong; changeRating(-5 * wrong); }
    const rec = { client: d.id, day: state.day, tags: [...new Set(sel.flatMap(x => x.tags))], keys: [...r.keys] };
    (state.memo.erasures = state.memo.erasures || []).push(rec);
    if (rules.registry && !c.forged && !d.exempt) state.registered.push(rec);
  }
  if (d.resolve) d.resolve(state, r);
  state.outcomes[d.id] = r.outcome;
  r.lines.unshift({ text: textOf((d.outcomes || {})[r.outcome]) || '', cls: 'quote' });

  // 규칙 판정
  if (!d.exempt && r.penalty) {
    if (mode === 'erase' && !vipProtect) {
      const hit = [...new Set(sel.flatMap(x => x.tags).filter(t => rules.forbidTags.includes(t)))];
      if (hit.length) { addPenalty(`[${hit.join('][')}] 기억 삭제 (${name})`); changeRating(-20); r.lines.push({ text: `⚠ 규칙 위반: [${hit.join('][')}] — 벌점 +1`, cls: 'bad' }); }
    }
    const hasReportTag = c.cards.some(card => card.tags.some(t => rules.reportTags.includes(t)));
    if (hasReportTag && (mode === 'erase' || mode === 'refuse')) { addPenalty(`[${rules.reportTags.join('][')}] 미신고 (${name})`); changeRating(-20); r.lines.push({ text: '⚠ 규칙 위반: 신고 의무 대상 미신고 — 벌점 +1', cls: 'bad' }); }
    if (vipProtect && (mode === 'refuse' || mode === 'report')) { addPenalty(`임원 요청 ${mode === 'refuse' ? '거절' : '신고 시도'}`); changeRating(-20); r.lines.push({ text: '⚠ 감사 규칙 위반 — 벌점 +1', cls: 'bad' }); }
  }
  if (mode === 'timeout') { addPenalty(`경찰 스캔 적발 (${name})`); r.lines.push({ text: '⚠ 경찰 스캔 적발. 시술 실패 — 벌점 +1', cls: 'bad' }); }
  if (wrong > 0 && !d.exempt) r.lines.push({ text: `인격 손상 ${wrong}건 — 보수 ${Math.round(CONFIG.wrongErasePayCut * 100 * wrong)}% 삭감`, cls: 'warn' });
  if (r.pay > 0) {
    const label = mode === 'report' ? `${name} 신고 포상금` : `${name} 시술비`;
    addIncome(label, r.pay);
    r.lines.push({ text: `+${r.pay}₵ 입금 (${label})`, cls: 'ok' });
  } else if (!d.exempt) r.lines.push({ text: '수입 없음.', cls: 'dim' });
  updateHUD();

  $('#actions').innerHTML = '';
  const box = $('#result');
  box.classList.remove('hidden');
  box.innerHTML = '';
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  typeLines(box, r.lines, () => {
    const steps = d.after ? d.after(state, r) : null;
    if (steps && steps.length) {
      const vn = $('#vn');
      vn.classList.remove('hidden');
      box.after(vn); vn.after($('#choices'));
      vn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      runScript(steps, () => { vn.classList.add('hidden'); showNextButton(); });
    } else showNextButton();
  }, { speed: 14, gap: 240 });
}

function showNextButton() {
  const last = state.penalty >= CONFIG.penaltyLimit;
  const isLastClient = state.clientIdx >= state.dayClients.length - 1;
  const acts = $('#actions');
  acts.classList.remove('hidden');
  acts.innerHTML = `<button class="btn ${last ? 'red' : 'solid'}" id="nextBtn" type="button">${last ? '⚠ 면허 관리국 통보 수신' : isLastClient ? '셔터를 내린다 (저녁) ▶' : '다음 손님 ▶'}</button>`;
  $('#nextBtn').addEventListener('click', () => { Sound.click(); state.clientIdx++; nextClient(); });
}
