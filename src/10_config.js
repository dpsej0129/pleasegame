'use strict';
/* =====================================================================
   LETHE // 기억 삭제 클리닉 — 10일 · 3막
   1. 게임 데이터 (설정 · 규칙 · 기억 · 단서 · 음성 메시지)
   손님 / 장면 / 다이브 / 엔딩은 막별 데이터 파일(ACT1 · ACT2 · ACT3 · ENDINGS)에 있다.
   ===================================================================== */

/* --- 스토리 스크립트 문법 ------------------------------------------------
   N('나레이션')          T('인물id', '대사')       ME('서진의 대사')
   SHOW('인물id'|null)    BG('배경id', {옵션})      DO(s => {...}, '알림')
   IF(s => 조건, [참], [거짓])     MENU([...])  CHOICE([...])
   선택지: { t, if, once, do, note, then:[...], end }  (end 없으면 메뉴로 복귀)
   CLUE('단서id')  TRUST('인물', +1)  DONATE(기억번호, '받는 사람', '설명')  DRAW('그림id')
   텍스트 자리에는 s => '...' 함수도 가능
   ------------------------------------------------------------------------ */
const N = t => ({ n: t });
const T = (who, t) => ({ who, t });
const ME = t => ({ who: 'me', t });
const SHOW = who => ({ show: who });
const BG = (bg, opts) => ({ bg, opts });
const DO = (fn, note) => ({ do: fn, note });
const IF = (cond, yes, no) => ({ if: cond, yes, no: no || [] });
const MENU = opts => ({ menu: opts });
const CHOICE = opts => ({ menu: opts.map(o => Object.assign({ end: true }, o)) });
const CLUE = id => ({ clue: id });
const TRUST = (who, n) => ({ do: s => addTrust(who, n) });
const DRAW = id => ({ do: () => addDrawing(id) });
const PAUSE = ms => ({ pause: ms });
const DONATE = (id, to) => ({ do: () => donate(id, to) });

const CONFIG = {
  totalDays: 10,
  startMoney: 300,
  scanSeconds: 40,
  scanDangerPct: 80,
  penaltyLimit: 5,
  wrongErasePayCut: 0.4,
  reportBounty: 30,
  rentScanBoost: 1.3,
  maintenanceScan: 0.8,
  selfScanShake: 1.1,
  rentPenaltyAfter: 3,
  startRating: 60,
  playerName: '서진',
  license: '아마테크 위탁면허 #0729',
  hollowLost: 4,            // 공허한 생존: 잃은 기억(판매+기증) 수
  trueResonance: 7,         // 진엔딩에 필요한 공명도
  giveAllResonance: 5,      // '대신 잠드는 사람'에 필요한 공명도
};

const ACTS = {
  1: { title: '시술사', days: [1, 3] },
  2: { title: '균열', days: [4, 7] },
  3: { title: '망각의 강', days: [8, 10] },
};
const actOf = day => (day <= 3 ? 1 : day <= 7 ? 2 : 3);

const EXPENSES = [
  { id: 'rent', name: '월세', cost: () => 100, desc: '미납 시 다음 날 경찰 스캔 +30% · 누적 3회 벌점 1' },
  { id: 'life', name: '하린 생명유지 비용', cost: s => (s.memo.lifeFree ? 0 : s.day >= 6 ? 180 : 150), desc: '미납 시 하린 상태 악화 · 위독에서 또 미납하면 끝' },
];

const HARIN_STATES = [
  { label: '안정', cls: 'state-ok', cap: '바이탈 정상. 생명유지 장치 가동 중.' },
  { label: '위험', cls: 'state-warn', cap: '산소 포화도 저하. 장치가 간헐적으로 경고음을 낸다.' },
  { label: '위독', cls: 'state-bad', cap: '연명 중단 대기 목록에 등록됨.' },
  { label: '사망', cls: 'state-bad', cap: '모니터의 선이 평평하다.' },
];

/* 날짜별 규칙 (누적). scanMul: 그날 스캔 배율, vipProtect: 임원 보호, registry: 기억 등록제, selfCheck: 자가 검사 */
const RULES = [
  { day: 1, title: '특별 규칙 없음', text: '손님이 요청한 기억만 정확히 지울 것.' },
  { day: 2, title: '[기업로고] 삭제 금지', text: '[기업로고] 태그 기억은 증거 보존 대상. 삭제 시 벌점.', forbidTags: ['기업로고'] },
  { day: 3, title: '[시위] 신고 의무', text: '[시위] 태그 발견 시 반드시 신고. 미신고는 공범, 벌점.', reportTags: ['시위'] },
  { day: 4, title: '[미성년] 삭제 금지', text: '미성년자의 기억은 어떤 이유로도 삭제 불가. 위반 시 벌점.', forbidTags: ['미성년'] },
  { day: 5, title: '[안드로이드] 소유주 동의', text: '안드로이드의 기억은 재산. 소유주 동의 없는 삭제 시 벌점.', forbidTags: ['안드로이드'] },
  { day: 6, title: '기억 등록제', text: '삭제한 기억의 사본이 보안국에 자동 제출된다(최근 30일 소급). [동료]·[증언] 태그는 추적 대상.', registry: true },
  { day: 7, title: '[가족] 전원 동의', text: '[가족] 태그 기억 삭제 시 가족 전원의 동의 필요. 확인 불가 시 벌점.', forbidTags: ['동의불가'] },
  { day: 8, title: '통행금지 · [증언] 신고', text: '상시 감시로 스캔 ×1.2. [증언] 기억 소지자 신고 의무.', reportTags: ['증언'], scanMul: 1.2 },
  { day: 9, title: '감사의 날', text: '아마테크 임원 요청 거절·신고 시 벌점. 임원 본인 기억은 [기업로고] 예외.', vipProtect: true },
  { day: 10, title: '개정 LETHE법 · 자가 검사', text: '모든 시술사는 영업 종료 전 자가 검사. [실험] 기억 발견 시 면허 반납.', selfCheck: true },
];

/* 내 기억 8개. keywords는 잃은 뒤 모든 대사에서 노이즈가 된다 */
const MY_MEMORIES = [
  { id: 1, mark: '①', title: '하린과 처음 본 바다', price: 120, keywords: ['바다'],
    diary: '짠 바람. 하린이 맨발로 파도를 쫓다 넘어지고도 깔깔 웃었다. 그 애가 처음 본 바다였다.' },
  { id: 2, mark: '②', title: '엄마의 목소리', price: 100, keywords: ['엄마'],
    diary: '부엌에서 엄마의 목소리가 들린다. "서진아, 하린이 좀 깨워라. 국 식는다."' },
  { id: 3, mark: '③', title: '첫 시술 성공', price: 60, keywords: ['첫 시술'], fake: true,
    diary: '첫 시술 성공. 떨리던 내 손을 하린이 두 손으로 꼭 붙잡아 주었다. …그런데 그날 하린은 어디에 있었지?' },
  { id: 4, mark: '④', title: '하린의 웃는 얼굴', price: 150, keywords: ['웃는 얼굴', '웃음'], glitchPortrait: true,
    diary: '하린의 웃는 얼굴. 덧니가 보이는, 세상에서 제일 시끄러운 웃음.' },
  { id: 5, mark: '⑤', title: '내 진짜 이름', price: 200, keywords: ['한서진', '서진'],
    diary: '내 이름은 한서진이다. 그것만은 확실하다.' },
  { id: 6, mark: '⑥', title: '물결 노래', price: 80, keywords: ['물결'],
    diary: '엄마가 설거지하며 부르던 물결 노래. "물결아 물결아, 잊지 말고 돌아오렴."' },
  { id: 7, mark: '⑦', title: '아빠의 어깨', price: 90, keywords: ['아빠'],
    diary: '아빠의 어깨 위에서 본 불꽃놀이. 아빠에 대해 기억나는 건 그 어깨의 높이뿐이다.' },
  { id: 8, mark: '⑧', title: '첫 월급날 짜장면', price: 50, keywords: ['짜장면'],
    diary: '첫 월급날. 짜장면 곱빼기 하나를 하린이랑 나눠 먹었다. 하린이 단무지를 다 먹었다.' },
];

/* 하린 사건 단서 10개. voice: 함께 열리는 음성 메시지 번호 */
const CLUES = {
  scan:    { voice: 1, text: '하린의 뇌 스캔: 외부 추출 과부하 흔적. 사고 기록의 시술자 칸 — "한서█".' },
  diary:   { voice: 2, text: '하린의 일기: "내일 서진이 일하는 연구소에 간다. 엄마 사고 난 날 기억, 서진이 지워준대."' },
  id:      { voice: 3, text: '잠긴 서랍의 사원증: "아마테크 LETHE-β 연구팀 — 한서진 연구원".' },
  zero:    { voice: 4, text: '제로의 증언: "우린 같은 팀이었어. 그날 이후 넌 사라졌지."' },
  doc:     { voice: 5, text: '도윤의 취재 문서: "피험자 H-07, 17세, 의식불명. 책임자 류진혁."' },
  file:    { voice: 6, text: 'H-07 사건 파일: "상부 지시로 종결. 시술자 — 0729."' },
  fake:    { text: '기억 감정: ③ \'첫 시술 성공\'은 이식된 가짜 기억이다.' },
  trace:   { text: '자가 스캔 기록: 시술자 0729 → 대상 0729. 나를 지운 건 나였다.' },
  chip:    { text: '레이의 보관소: 「0729 — 첫 시술」. 413일 전 내가 버린 원본 기억.' },
  pudding: { voice: 7, ng: true, text: '푸딩 뚜껑 뒷면: "서진, 내일 같이 먹자. 지우지 마."' },
};

/* 하린의 음성 메시지 (사고 전 녹음) */
const VOICE = {
  1: '아 아, 녹음 되나? 서진, 냉장고 푸딩 내 거야. 이름 썼어. 지우지 마라? …농담.',
  2: '오늘 엄마 기일. 서진은 또 아무렇지 않은 척했다. 나만 우는 거 바보 같아서 녹음기한테 운다. …이거 들으면 모른 척해.',
  3: '서진 사원증 사진 완전 범죄자 같아. 연구원님~ 내가 첫 손님 해 줄게. 공짜로.',
  4: '정우 오빠가 그러는데 서진이 팀에서 제일 손 빠르대. 근데 왜 집에선 라면 하나 못 끓여?',
  5: '동의서 썼어. 엄마 사고 난 날만 지우는 거래. 무섭냐고? 아니. …조금.',
  6: '서진, 물결 노래 기억나? 엄마가 부르던 거. 녹음해 놨어. 혹시 내가 까먹으면 들려줘. …물결아 물결아, 잊지 말고 돌아오렴.',
  7: '내일이다. 서진, 만약에 내가 이상해지면, 그건 네 잘못 아니야. 내가 하자고 한 거야. 그러니까… 지우지 마. 나 잊지 마. 푸딩은 먹어도 돼.',
};

const TRUST_DEFAULT = { mio: 1, park: 1, echo: 1, doyun: 1, eunjae: 1, kang: 0, rei: 1, byul: 1, zero: 1, yuna: 1 };

const LOCATIONS = [
  { id: 'hospital', name: '성심 병원', bg: 'hospital', desc: '하린 면회 · 윤 간호사' },
  { id: 'bar', name: '망각 바', bg: 'bar', desc: '레이의 술집 · 소문과 뒷일' },
  { id: 'alley', name: '7구역 골목', bg: 'alley', desc: '오늘 만난 사람들의 그 후' },
  { id: 'clinic', name: '시술소에 남는다', bg: 'clinic', desc: '장비 정비 · 잠긴 서랍' },
];

/* 막별 데이터가 여기에 등록된다 */
const DAYS = {};        // DAYS[n] = { morning, evening:{loc: steps|fn}, quiet, dive, interlude, diary }
const CLIENTS = [];
const DIVES = {};
const INTERLUDES = {};
function registerAct(act) {
  Object.assign(DAYS, act.days || {});
  (act.clients || []).forEach(c => CLIENTS.push(c));
  Object.assign(DIVES, act.dives || {});
  Object.assign(INTERLUDES, act.interludes || {});
}

/* 챕터 선택 시작 상태 (해당 막 시작 시점의 표준 진행) */
const CHAPTER_STATES = {
  4: { money: 150, penalty: 1, sold: [3], clues: ['scan', 'id', 'zero', 'fake'], trust: { mio: 2, park: 2, echo: 2, zero: 2 },
       flags: { mioArchived: true, mioShelter: true }, outcomes: { yuna: 'perfect', park: 'perfect', mio: 'partial', kang: 'refused', zero: 'reported', doyun: 'perfect', park2: 'perfect', echo1: 'perfect', echo2: 'perfect' } },
  8: { money: 120, penalty: 2, sold: [3, 8], clues: ['scan', 'diary', 'id', 'zero', 'doc', 'fake', 'trace'], trust: { mio: 3, park: 2, echo: 3, zero: 2, rei: 3, byul: 2, doyun: 2, eunjae: 2 },
       flags: { mioArchived: true, mioShelter: true, echoTruthTold: true, byulHelp: 'shelter' }, outcomes: { yuna: 'perfect', park: 'perfect', mio: 'partial', kang: 'refused', zero: 'reported', doyun: 'perfect', park2: 'perfect', park3: 'partial', echo1: 'perfect', echo2: 'perfect', sora: 'refused' } },
};
