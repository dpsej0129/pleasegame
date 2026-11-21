
/* =====================================================================
   ACT 3 「망각의 강」 — 8~10일차 · 다이브 3 · 피날레
   ===================================================================== */
const doyunArticle = s => !!s.memo.doyunStage && s.outcomes.doyun !== 'reported' && !s.flags.doyunWiped;

/* 레이의 비밀 (8일차 망각 바, 못 봤다면 9일차에) */
const REI_REVEAL = [
  SHOW('rei'), N('통행금지 직전의 망각 바. 레이가 셔터를 내리고, 뒷방 문을 연다.'),
  T('rei', '들어와. 보여 줄 게 있어.'),
  BG('vault'), SHOW(null),
  N('뒷방. 선반이 천장까지 닿아 있다. 술병이 아니다. 기억 칩이다. 수백 개. 하나하나 손글씨 라벨.'),
  N('맨 위 선반 라벨. 「0729」.'),
  IF(s => s.sold.length, [N(s => `그 아래 칩들. ${MY_MEMORIES.filter(m => s.sold.includes(m.id)).map(m => m.title).join(' · ')}. 내가 판 기억들. 전부 여기 있다.`)]),
  N('그리고 한 칸 떨어져, 먼지가 가장 많이 쌓인 칩 하나. 「0729 — 첫 시술」.'),
  SHOW('rei'),
  T('rei', '네 엄마랑 나는 같은 동네에서 자랐어. 물결 노래, 원래 우리 둘이 만든 거야. 설거지하면서.'),
  T('rei', '네 엄마 가고 나서 멀리서 너희 둘을 봤어. 가까이는 못 갔어. 나도 그럴 자격이 없었거든.'),
  T('rei', '413일 전에 중개소에서 연락이 왔어. 0729 물건이 들어왔다고. 시술자도 0729, 대상도 0729.'),
  T('rei', '네가 너를 지운 거야. 그래서 내가 샀어. 그 뒤로 네가 파는 건 전부.'),
  MENU([
    { t: '…왜요?', once: true, then: [
      N('레이가 빈 액자를 가져온다.'),
      T('rei', '15년 전에 아들을 잃었어. 너무 아파서 지웠어. 내 손으로.'),
      T('rei', '지금은 누군가를 사랑했다는 것만 남았어. 얼굴도, 이름도 없이. 이 액자처럼.'),
      T('rei', '네가 나처럼 되는 걸 보고 싶지 않았어. 그게 다야.'), TRUST('rei', 2)] },
    { t: '왜 이제야 말하는 거예요!', once: true, then: [T('rei', '네가 물어본 적이 없잖아. …아니, 네가 물어볼 수 있게 된 게 이제니까.')] },
    { t: '…', end: true },
  ]),
  DO(s => { s.flags.reiRevealed = true; }),
  T('rei', '내일 다시 와. 생각해 보고.'),
];

/* 9일차: 진실 칩 vs 판 기억 하나 */
const REI_CHOICE = [
  SHOW('rei'), BG('vault'),
  T('rei', '네 머리는 이미 많이 깎였어. 이식은 하나만 더 받을 수 있어. 그 이상은 위험해.'),
  IF(s => s.flags.ryuDeal, [
    T('rei', '…근데 너, 류진혁이랑 거래했지. 회사 냄새가 나.'), T('rei', '회사 사람한테 네 엄마 노래를 줄 순 없어.'), N('레이가 뒷방 문을 닫는다.'),
  ], [
    CHOICE([
      { t: '「0729 — 첫 시술」을 받는다 (진실)', do: s => { s.memo.reiRestore = 'truth'; addClue('chip'); }, then: [
        N('레이가 칩을 내 관자놀이에 댄다. 차갑다.'), BG('whiteRoom'),
        SHOW('harin'), N('하얀 방. 시술 의자에 하린이 앉아 있다. 웃고 있다. 긴장해서.'),
        { who: 'harinAwake', t: '서진, 나 무서워. 그래도 엄마 사고 난 날은… 이제 안 보고 싶어.' },
        ME('금방 끝나. 하나만 지우는 거야. 내가 하는 거니까.'),
        SHOW('ryu'), T('ryu', '출력 300%로 올려. 이사회가 결과를 원해.'),
        ME('그러면 위험해요. 피험자는 제 동생—'),
        T('ryu', '그러니까 동의서가 빨리 나왔지. 눌러, 한서진 연구원.'),
        SHOW(null), N('나는 버튼을 눌렀다.'), N('하린의 뇌파가 한 줄의 직선이 되는 것을, 나는 보았다.'),
        N('일주일 뒤 혼자 시술소 의자에 앉았다. 헤드기어를 썼다. 그날을 지웠다. 그 자리에 \'첫 시술 성공\'이라는 이름을 붙였다.'),
        BG('vault'), SHOW('rei'), N('눈을 뜬다. 레이가 내 손을 잡고 있다. 내 손이 버튼을 누르던 모양으로 굳어 있다.'),
        T('rei', '…돌아온 걸 환영해, 서진.')] },
      { t: '판 기억 하나를 되찾는다', if: s => s.sold.length > 0, then: [
        N('선반의 칩들. 어느 것을 돌려받을까.'),
        { menu: MY_MEMORIES.map(m => ({ t: `${m.mark} ${m.title}`, end: true, if: s => s.sold.includes(m.id),
          do: s => { s.sold = s.sold.filter(x => x !== m.id); s.memo.reiRestore = m.id; flashGlitch(); toast(`${m.mark} 기억이 돌아왔다.`, 'info'); updateHUD(); },
          then: [N(`${m.title}. 노이즈가 걷히고, 단어들이 제자리로 돌아온다.`), T('rei', '「첫 시술」은 여기 그대로 둘게. 언젠가 네가 달라고 할 때까지.')] })) }] },
      { t: '아무것도 받지 않는다', then: [T('rei', '그래. 네 선택이야.'), N('레이가 칩들을 다시 선반에 올린다. 0729 칸이 조금 기울어 있다.')] },
    ]),
  ]),
];

registerAct({
  days: {
    8: {
      actStart: true,
      morning: { bg: 'alley', steps: [
        N('새벽 사이렌. 통행금지 첫날. 골목마다 감시 드론이 낮게 떠 있다.'),
        N('단말기에 공문. 「[증언] 태그 기억 소지자 신고 의무. 상시 감시로 스캔 강화.」'),
        IF(s => s.flags.safehouseLeaked, [N('뉴스. 「7구역 세탁공장 지하 급습. 시위 가담자 4명 체포」. 세탁공장. 소라가 일하는 곳. 제로가 지운 그 주소.')]),
        IF(s => ['perfect', 'partial'].includes(s.outcomes.yuna2) || s.flags.yunaKnows, [N('유나에게서 문자. 「저 또 헤어졌어요 ㅎ 이유도 똑같아요 ㅎㅎ 내일 가도 돼요?」 웃음 표시가 두 개다. 두 개라서 더 슬프다.')]),
        N('냉장고를 연다. 푸딩. 뚜껑의 「지우지 마」가 오늘따라 크게 보인다.'),
      ] },
      evening: {
        bar: REI_REVEAL,
        hospital: s => [
          SHOW('nurse'), T('nurse', '서진 씨. 하린 씨 손가락이 오늘 세 번 움직였어요. 반사가 아닐 수도 있대요.'),
          SHOW('harin'), N('하린의 손가락. 나는 그 손이 내 손을 붙잡던 모양을 기억한다. 가짜 기억 속에서.'),
          MENU([OPT_HOLD, OPT_SEDATIVE, OPT_LEAVE()]),
        ],
      },
      night: ['통행금지의 밤. 창밖에 사람이 한 명도 없다.', '서랍 속 노란 녹음기를 꺼내 책상 위에 둔다. 오늘은 꺼내 두고 싶다.'],
      diary: s => [
        s.flags.kangRedeemed ? '강 형사가 민재호의 마지막 통화를 끝까지 들었다. 라이터를 나에게 맡겼다.' : s.flags.kangRoute === 'fallen' ? '강 형사가 파트너의 목소리를 지웠다. 그는 이제 가볍다. 아주 가볍다.' : '강 형사가 다녀갔다. 라이터 소리가 아직 귀에 남아 있다.',
        s.memo.parkFinal === 'donate' ? '박 할아버지에게 내 기억을 줬다. 이제 저녁 여섯 시에 누군가 할아버지를 부를 것이다. 나 대신.' : s.memo.parkFinal === 'restore' ? '박 할아버지는 순례 씨를 되찾았다. 슬픔도 함께.' : s.memo.parkFinal === 'story' ? '박 할아버지에게 순례 씨 이야기를 동화처럼 들려줬다. 할아버지는 웃었다.' : '박 할아버지가 시계를 두고 갔다.',
        s.flags.reiRevealed ? '레이가 내 기억을 전부 갖고 있었다. 「0729 — 첫 시술」. 내가 버린 나.' : '망각 바의 술병들이 오늘따라 빛나 보였다.',
        '지우면 편해질 거예요. 지우면 편해질 거예요. 내가 매일 한 말.',
      ],
    },
    9: {
      morning: { bg: 'alley', steps: [
        N('감사의 날. 아마테크 감사 드론 세 대가 골목 입구에 떠 있다.'),
        IF(s => s.memo.parkFinal === 'absent', [N('단말기에 부고. 「박만석 님 별세. 조문객 안내 없음.」'), N('나는 셔터를 올리기 전에 꽃집에 다녀온다. 흰 국화 한 송이. 조문객은 나 한 명일 것이다.')]),
        IF(s => ['perfect', 'partial'].includes(s.outcomes.yuna) && s.outcomes.yuna !== 'reported', [
          SHOW('yuna'), N('셔터를 올리자마자 유나가 들어온다. 눈이 부어 있다. 그런데 웃는다.'),
          T('yuna', '또 헤어졌어요. 같은 이유로요. 근데 웃긴 거 알아요? 그 사람도 어디서 저를 지웠대요.'),
          T('yuna', '우린 서로를 두 번씩 지웠어요. …세 번째도 할 수 있을까요?'),
          CHOICE([
            { t: '또 지워 준다 (+120₵)', do: s => { s.memo.yunaFinal = 'again'; gain(120, '유나 시술비'); }, then: [N('유나가 가벼운 얼굴로 나간다. 정류장 쪽으로.')] },
            { t: '"두 번이나 사랑했다면요." 거절한다', do: s => { s.memo.yunaFinal = 'refuse'; addTrust('yuna', 1); }, then: [T('yuna', '…그쵸. 두 번이나.'), N('유나가 우산을 펴고 나간다. 비가 오지 않는데.')] },
            { t: '헤어진 날만 지운다 (+60₵)', do: s => { s.memo.yunaFinal = 'breakup'; gain(60, '유나 시술비'); }, then: [T('yuna', '그럼 우린 싸운 적 없는 커플이 되는 거네요. 좋다.')] },
          ]),
          SHOW(null),
        ]),
        N('오늘 예약. 「류진혁 — 아마테크 기억사업본부 이사」'),
        IF(s => truthLevel(s) >= 2, [N('그 이름을 보는 순간 손끝이 차가워진다. 버튼을 누르라고 했던 목소리.')]),
      ] },
      evening: {
        bar: s => s.flags.reiRevealed ? REI_CHOICE : [...REI_REVEAL, ...REI_CHOICE],
        alley: s => !s.flags.mioBetrayed && !s.flags.mioReported && s.outcomes.mio !== 'timeout' ? [
          BG('rooftop'), SHOW('mio'), N('옥상. 미오가 두부를 안고 내일을 기다린다. 증언하는 날.'),
          T('mio', '선생님. 저 내일 말할 거예요. 그 할아버지 이야기.'),
          IF(s => s.flags.kangRedeemed, [SHOW('kang'), N('강 형사가 계단에 앉아 있다. 라이터 없이.'), T('kang', '내일 법정까지는 내가 데려간다. 경찰차로. 아무도 못 건드려.'), SHOW('mio')]),
          IF(s => s.flags.resistance && !s.flags.zeroArrested, [N('단말기에 제로의 메시지. 「법정이 막히면 전파로 간다. 해적 방송 준비 완료.」')]),
          T('mio', '무서워요. 근데 무서운 거랑 하기 싫은 거랑은 다르대요. 선생님이 그랬잖아요.'),
          N('그런 말을 한 적이 있던가. 아니면 내가 누군가에게 들은 말인가.'),
          DRAW('together'),
        ] : null,
      },
      quiet: { title: '비 맞기', bg: 'rooftop', steps: [
        N('옥상. 비가 온다. 우산을 쓰지 않는다.'),
        IF(s => s.memo.echoFinal === 'refused' || s.memo.echoFinal === 'loop', [N('난간 끝에 하얀 안드로이드가 서 있다. 에코다. 비를 맞으며 저녁 여섯 시 방향을 보고 있다.'), N('우리는 말하지 않는다. 비가 우리 둘 위에 같은 양으로 내린다.')],
          [N('난간 끝이 비어 있다. 아무도 없다.')]),
      ] },
      night: ['내일이 마지막 날이다.', '하린의 의식 속으로, 마지막으로 들어간다.'],
      dive: 3,
      diary: s => [
        s.flags.ryuEvidence ? '류진혁의 기억 사본을 떴다. 그는 모른다. 내가 누군지도.' : '류진혁을 만났다. 그는 나를 기억하지 못하는 척했다. 아니면 정말로.',
        s.memo.echoFinal === 'erased' ? '에코를 전부 지웠다. 마지막 로그: 「다녀오세요.」' : s.memo.echoFinal === 'gift4' ? '에코에게 하린의 웃는 얼굴을 줬다. 이제 그 얼굴은 에코만 안다.' : '에코는 지워지지 않았다. 오늘 저녁 여섯 시에도 문 앞에 설 것이다.',
        s.memo.reiRestore === 'truth' ? '버튼을 누른 건 나였다. 그리고 그걸 지운 것도.' : '내일 검사관이 내 머릿속을 본다.',
        '지우지 마. 지우지 마. 누가 했던 말이지. 지우지 마.',
      ],
    },
    10: {
      morning: { bg: 'alley', steps: [
        N('마지막 아침. 셔터를 올리기 전에 골목을 한 바퀴 걷는다.'),
        IF(s => s.memo.parkFinal && s.memo.parkFinal !== 'absent', [N('경로당 앞. 박 할아버지가 손목시계 태엽을 감고 있다. 나를 보고 고개를 끄덕인다. 나를 아는지는 모르겠다.')]),
        IF(s => s.flags.byulHelp && s.flags.byulHelp !== 'report', [N('세탁공장 창문. 해바라기가 꽃대를 올렸다.')]),
        IF(s => s.flags.doyunFinal === 'reunite', [N('빌딩 앞. 노란 우비가 안경 쓴 남자의 어깨 위에서 손을 흔든다.')]),
        IF(s => s.memo.echoFinal === 'refused', [N('어느 집 현관 앞. 하얀 안드로이드가 문에게 인사하고 있다.')]),
        IF(s => !s.flags.mioBetrayed && !s.flags.mioReported && s.outcomes.mio !== 'timeout', [
          SHOW('mio'), N('미오가 두부를 안고 시술소 앞에 서 있다. 교복을 다려 입었다.'),
          T('mio', '선생님, 오늘이에요.'),
          IF(s => s.flags.mioErased && !s.flags.mioArchived, [
            T('mio', '…근데 저는 그 장면이 없잖아요. 선생님이 지웠잖아요.'), N('아이의 증언은 이제 아무데도 없다. 내가 지웠다.'),
            DO(s => { s.memo.mioTestify = 'silent'; }), DRAW('sea'),
          ], [
            IF(s => s.flags.mioErased, [T('mio', '칩에 있는 제 기억, 다시 넣어 주세요. 아파도 괜찮아요. 제 거니까.'), N('칩을 미오의 관자놀이에 댄다. 아이가 이를 악문다. 그 장면이 돌아왔다.')]),
            CHOICE([
              { t: '법정으로 보낸다', if: s => s.flags.kangRedeemed || doyunArticle(s), do: s => { s.memo.mioTestify = 'court'; addTrust('mio', 1); }, then: [
                IF(s => s.flags.kangRedeemed, [N('강 형사의 경찰차가 골목 입구에 선다. 사이렌은 끄고.')], [N('도윤 기자가 기자단을 데리고 온다. 카메라가 많을수록 아이는 안전하다.')]),
                T('mio', '다녀올게요.'), N('다녀올게요. 그 말이 오늘은 무섭지 않다.'), DRAW('court')] },
              { t: '제로의 해적 방송으로 보낸다', if: s => s.flags.resistance && !s.flags.zeroArrested, do: s => { s.memo.mioTestify = 'broadcast'; }, then: [N('얼굴은 모자이크, 목소리는 변조. 전파는 막을 수 없다.'), DRAW('broadcast')] },
              { t: '말하지 않아도 된다고 한다', do: s => { s.memo.mioTestify = 'silent'; }, then: [T('mio', '…진짜요?'), ME('네 기억은 네 거야. 말하는 것도, 안 하는 것도.'), N('미오가 오래 울었다. 그리고 바다 마을로 가는 버스표를 샀다.'), DRAW('sea')] },
            ]),
          ]),
          SHOW(null),
        ]),
        N('개정 LETHE법. 오늘 영업 종료 전, 모든 시술사는 자가 검사를 받는다.'),
        N('손님은 한 명뿐이다. 나.'),
      ] },
      finale: { bg: 'hospital', steps: [
        N('검사가 끝났다. 마지막 청구서를 들고 병원에 간다. 통행금지 직전의 거리.'),
        SHOW('harin'),
        IF(s => s.harin >= 2, [N('경고음이 멎지 않는다. 윤 간호사가 말없이 고개를 젓는다.')], [N('하린의 손가락이 움직인다. 이번엔 분명하다. 윤 간호사가 숨을 삼킨다.')]),
        IF(s => s.flags.finalChoice === 'keep', [
          N('나는 기억한 채로 여기 서 있다. 면허는 반납했다. 손이 가볍다. 마음은 무겁다.'),
          IF(s => s.clues.includes('pudding'), [
            N('주머니 속 노란 녹음기가 딸깍 켜진다. 마지막 메시지.'),
            { who: 'harinAwake', t: '내일이다. 서진, 만약에 내가 이상해지면, 그건 네 잘못 아니야. 내가 하자고 한 거야.' },
            { who: 'harinAwake', t: '그러니까… 지우지 마. 나 잊지 마. 푸딩은 먹어도 돼.' },
            N('413일 동안 냉장고에 있던 푸딩. 나는 그걸 한 번도 먹지 못했다.'),
          ]),
          CHOICE([
            { t: '하린의 손을 잡고, 모든 것을 말한다', do: s => { s.flags.confessed = true; }, then: [
              ME('하린아. 그날 버튼을 누른 건 나였어.'),
              ME('네가 지우고 싶어 했던 엄마의 마지막 날 대신, 내가 너를 지웠어. 그리고 그걸 또 지웠어.'),
              ME('이번엔 안 지울게. 다 기억하고 있을게.')] },
            { t: '아무 말 없이 곁에 앉아 있는다', then: [N('말하지 못한 문장들이 병실 공기 속에 오래 떠 있다.')] },
          ]),
        ], [
          IF(s => s.flags.finalChoice === 'erase', [
            N('검사는 통과했다. 머릿속이 깨끗하다. 너무 깨끗하다.'),
            N('하린의 손을 잡는다. 왜 미안한지 모르겠는데, 미안하다. 이유를 지웠으니까.'),
          ], [N('이유를 알 수 없는 미안함이 목에 걸린다. 나는 하린의 이마를 쓸어 넘긴다.')]),
        ]),
      ] },
      night: ['마지막 밤.', '모니터의 초록 선이 오르내린다. 서진, 너는 무엇을 지켰지?'],
      diary: s => [
        s.flags.finalChoice === 'keep' ? '나는 기억한다. 버튼을. 하얀 방을. 하린의 웃음을. 그리고 그걸 지웠던 나를.' : s.flags.finalChoice === 'erase' ? '검사 통과. 깨끗하다. 왜 냉장고 앞에서 울었는지 모르겠다.' : '검사관은 내 머릿속에서 아무것도 찾지 못했다. 나도.',
        '열흘. 스물일곱 번 문이 열렸다.',
        '지우지 마.',
      ],
    },
  },
  dives: {
    3: { title: '하얀 방', bg: 'corridor', intro: [
      N('다이브 개시. 긴 복도. 양쪽 벽에 문이 끝없이 이어진다.'),
      N('하린의 실루엣이 복도 끝에 서 있다. 이번엔 나를 기다리고 있다.'),
    ], rooms: [
      { id: 'name', mem: 5, bg: 'corridor', name: '이름을 부르는 복도', hint: '누군가 부른다', steps: [
        N('복도 벽에서 목소리가 울린다. 엄마의 목소리, 레이의 목소리, 손님들의 목소리.'),
        N('"서진." "서진 씨." "0729." "선생님." "아저씨."'),
        T('harinDream', '서진.'), N('그 중 하나가 유난히 가깝다.')],
        lostSteps: [N('목소리들이 누군가를 부른다. 그게 내 이름이었는지 모르겠다.')] },
      { id: 'white', bg: 'whiteRoom', name: '하얀 방', hint: '300', reso: s => (truthLevel(s) >= 3 ? 2 : 0), steps: [
        IF(s => truthLevel(s) >= 3, [
          N('하얀 방. 시술 의자. 이번엔 문이 열린다.'),
          N('나는 버튼 앞에 서 있다. 413일 전의 나와 겹쳐서.'),
          T('harinDream', '서진. 이번엔 누르지 마.'),
          N('나는 손을 뗀다. 기억 속에서만이라도.'),
          N('하린의 실루엣에 색이 돌아온다. 머리카락, 환자복, 그리고—'),
        ], [
          N('하얀 문. 문틈의 빛. 손잡이가 돌아가지 않는다.'),
          N('나는 이 방에 무엇이 있는지 모른다. 내가 그 열쇠를 버렸다.'),
        ])] },
      { id: 'pudding', bg: 'kitchen', name: '↻ 냉장고', hint: '지우지 마', need: s => s.ng && s.clues.includes('pudding'), steps: [
        N('부엌 냉장고. 문을 연다. 푸딩 두 개. 하나엔 「하린 거」, 하나엔 「서진 거」.'),
        T('harinDream', '내일 같이 먹자고 했잖아.'),
        N('413일 동안, 나는 「서진 거」를 본 적이 없다. 내가 먹었나. 아니면 하린이 숨겨 뒀나.'),
        T('harinDream', '…서진이 내 거 먹어도 된다고 했잖아. 나도 서진 거 먹었어. 벌써.'), N('하린이 웃는다. 실루엣인데, 웃는 게 보인다.')] },
    ], end: [
      BG('whiteRoom', { dream: true }),
      IF(s => truthLevel(s) >= 3 && !isLost(4), [SHOW('harinAwake'), N('하린이 돌아본다. 처음으로. 웃는 얼굴이다. 덧니가 보인다.')],
        [SHOW('harinDream'), N('하린이 돌아본다. 처음으로.'), IF(s => isLost(4), [N('얼굴이 있어야 할 자리에 회색 잡음이 일렁인다. 내가 판 얼굴.')])]),
      T('harinDream', s => isLost(5) ? '▒▓█.' : '서진.'),
      CHOICE([
        { t: '하린의 손을 잡는다', do: s => { s.resonance += 2; }, note: '공명도 +2', then: [N('손이 통과하지 않는다. 처음으로, 잡힌다.'), N('다이브 종료.')] },
        { t: '내 기억을 전부 하린에게 준다', if: s => s.resonance >= CONFIG.giveAllResonance && s.harin < 2, do: s => { s.flags.diveGiveAll = true; }, then: [
          N('헤드기어의 출력을 올린다. 300%. 그날과 같은 숫자.'),
          N('바다, 부엌, 짜장면, 놀이공원, 물결 노래, 이름. 내가 가진 전부를 하린 쪽으로 민다.'),
          T('harinDream', '서진, 뭐 하는 거야. 하지 마—'),
          N('이번엔 내 쪽 선이 평평해진다.')] },
        { t: '돌아선다', then: [N('하린의 실루엣이 그 자리에 서 있다. 나는 복도를 거꾸로 걸어 나온다.'), N('다이브 종료.')] },
      ]),
    ] },
  },
});

/* 자가 검사 카드: 남은 내 기억(검사 통과) + [실험] 기억 */
function selfCards(s) {
  const lv = truthLevel(s);
  const cards = MY_MEMORIES.filter(m => !isLost(m.id) && !m.fake).map(m => ({ text: `${m.mark} ${m.title} — ${m.diary}`, tags: ['서진', '검사 통과'], locked: true }));
  if (!isLost(3)) cards.push({ text: '③ 첫 시술 성공 — 박수 소리. 하린이 내 손을 잡아 준다. (이식 흔적 검출)', tags: ['이식', '검사 대상'], locked: true });
  cards.push(lv >= 3
    ? { key: 'experiment', text: '하얀 방. 출력 300%. "눌러, 한서진 연구원." 나는 버튼을 눌렀다. 하린의 뇌파가 직선이 된다.', tags: ['실험', '기업로고'], req: true }
    : lv >= 1
      ? { key: 'experiment', text: '▒▒▒ 지운 흔적. 시술자 0729 → 대상 0729. 내용 판독 불가. 그래도 무언가 있다.', tags: ['실험', '흔적'], req: true }
      : { text: '[잠금] 판독 불가 영역. 검사관이 고개를 갸웃하고 지나간다.', tags: ['잠금'], locked: true });
  return cards;
}

registerAct({
  clients: [
    /* ───── DAY 8 ───── */
    {
      id: 'kang3', day: 8, who: 'kang', type: 'erase', pay: 200, meta: '48세 · 강력계 · 손님으로 온 형사', refuseLabel: '✋ 지우지 않는다',
      talk: [
        N('강 형사가 들어온다. 담배 냄새가 나지 않는다. 그는 시술 의자에 스스로 앉는다.'),
        IF(s => s.flags.corruptDeep, [T('kang', '서진 씨. 오늘은 내가 손님이야. 돈은 회사가 내.')], [T('kang', '오늘은 단속도, 거래도 아니야. 손님이야.')]),
        N('그가 라이터를 꺼내 책상에 올려놓는다. 「민」.'),
        T('kang', '민재호. 내 파트너였어. 3년 전, 아마테크 물류창고 잠복 중에 죽었지. 공식 기록은 \'사고\'.'),
        T('kang', '그날 밤 그 녀석이 나한테 전화했어. 받았는데… 말이 끝나기 전에 끊겼어.'),
        T('kang', '그 목소리가 매일 밤 들려. 지워 줘. 처음에 물어봤잖아. 목소리만 지울 수 있냐고.'),
        MENU([
          { t: '그 목소리를 지우면, 형사님이 버틸 이유도 사라질 거예요.', once: true, then: [T('kang', '…알아. 그래서 지금까지 버틴 거야. 3년.'), N('라이터를 연다. 닫는다. 불은 켜지 않는다.')] },
          { t: '시작할게요.', end: true },
        ]),
      ],
      request: '민재호의 마지막 통화를 지워 줘. 아니면… 목소리만.',
      cards: [
        { key: 'voice', text: '민재호의 목소리. "형, 이거 이상해요. 아마테크가—"', tags: ['동료', '사별'], req: true },
        { key: 'content', text: '통화 기록: 아마테크 물류창고 3번 게이트. 23:41. 통화 종료.', tags: ['동료', '기업로고'], req: true },
        { text: '잠복 중 재호가 사 온 컵라면. "형, 이거 매운 맛이에요. 형 거."', tags: ['동료'] },
        { key: 'lighter', text: '재호가 라이터를 건넨다. "형 담배 끊어요. 이건 기념품."', tags: ['동료'] },
      ],
      resolve: (s, r) => {
        if (r.mode === 'erase' && r.keys.has('voice') && r.keys.has('content')) { s.flags.kangRoute = 'fallen'; s.flags.corrupt = s.flags.corrupt || s.flags.corruptDeep; }
        else if (r.mode === 'erase' && r.keys.has('voice')) s.flags.kangRoute = 'retired';
        if (r.mode === 'refuse') { s.flags.kangRedeemed = true; s.flags.kangRoute = 'redeemed'; addTrust('kang', 3); }
      },
      after: (s, r) => r.mode === 'refuse' ? [
        ME('지우지 않을게요. 대신… 끝까지 들어 봐요.'),
        N('장비로 그 기억을 재생한다. 강 형사의 머릿속에서, 그리고 스피커로.'),
        SHOW('jaeho'), T('jaeho', '형, 이거 이상해요. 아마테크가 사람 기억을 컨테이너째 옮기고 있어요. 서류 다 찍었어요. 내일 형한테—'),
        T('jaeho', '…형, 담배 끊어요. 라이터는 기념품이에요.'), N('통화 종료.'),
        SHOW('kang'), N('강 형사가 오래 고개를 숙이고 있다. 그 녀석이 마지막에 한 말을, 그는 3년 동안 듣지 못했다.'),
        T('kang', '…서류. 그래, 서류.'),
        T('kang', '이 도시에선 진실보다 서류가 중요하다고 했지. 그럼 진실을 서류로 만들면 되는 거네.'),
        N('그가 라이터를 내 책상에 놓는다. "맡아 줘. 다 끝나면 찾으러 올게."'),
        DO(s => { removePenalty('강 형사의 기록 정정'); gain(100, '강 형사 상담료'); }),
      ] : [],
      outcomes: {
        perfect: '강 형사가 일어난다. 어깨가 가볍다. 라이터를 집어 들고 고개를 갸웃한다. "…이건 누구 거지." 그는 라이터를 휴지통에 버리고 나간다.',
        partial: '강 형사가 라이터를 쥔다. "내용은 기억나. 목소리만 없어." 그는 웃으려다 만다.',
        damaged: '강 형사가 컵라면 냄새에 고개를 돌린다. "…매운 거 못 먹는데, 왜 이게 그리워."',
        refused: '강 형사가 의자에서 일어나지 않는다. 한참을.',
        reported: '신고 접수 — 담당자: 강 형사. 그가 단말기를 끈다. "이젠 아무래도 좋아."',
        timeout: '통행금지 감시 드론이 시술소를 비춘다. 강 형사가 경찰 배지를 들어 보인다. 드론이 물러간다. 그도 나간다.',
      },
    },
    {
      id: 'mio3', day: 8, who: 'mioMom', type: 'scene', meta: '미오와 미오 엄마',
      cond: s => !s.flags.mioBetrayed && !s.flags.mioReported && s.outcomes.mio !== 'timeout',
      talk: [
        N('지친 얼굴의 여자가 미오의 손목을 잡고 들어온다. 미오는 두부를 안고 있다.'),
        T('mioMom', '선생님이 미오를 숨겨 주셨다면서요. 감사해요. 정말로요.'),
        T('mioMom', '…그런데 회사에서 잘렸어요. 사유는 \'가족 관계 위험\'. 다음은 이 애예요. 그다음은 저고요.'),
        T('mioMom', '애 증언 기억을 지워 주세요. 이 애가 아무것도 모르면, 우린 그냥 사는 거예요.'),
        SHOW('mio'), T('mio', '엄마. 저 말할래요.'),
        SHOW('mioMom'), T('mioMom', '넌 열네 살이야!'),
        N('[미성년] 규칙. 아이의 기억은 지울 수 없다. 사흘 전 그 규칙은 내 손을 묶었다. 오늘은 미오를 지킨다.'),
        N('그리고 [증언] 신고 의무. 이 아이는 증언 기억 소지자다. 시술을 하지 않으면, 스캐너도 모른다.'),
        CHOICE([
          { t: '엄마의 부탁을 들어준다 (규칙 위반 · 벌점 +1)', do: s => { addPenalty('[미성년] 기억 삭제 (미오)'); s.flags.mioErased = true; s.memo.mioMomWish = true; s.trust.mio = Math.max(0, s.trust.mio - 3); }, then: [
            N('미오는 저항하지 않았다. 의자에 앉기 전에 나를 한 번 봤을 뿐이다.'), SHOW('mio'), N('시술이 끝나고, 아이는 엄마 손을 잡고 나갔다. 두부는 내 발치에 남았다.'), DO(s => { s.flags.catAdopted = true; })] },
          { t: '규칙을 근거로 거절한다 — "법이 미오를 지키고 있어요"', do: s => { s.flags.mioWill = true; addTrust('mio', 2); }, then: [
            SHOW('mioMom'), T('mioMom', '…법이요? 법이 언제부터 우리 편이었어요.'), N('엄마는 나를 원망하는 눈으로 본다. 그 눈이 맞다.'),
            SHOW('mio'), T('mio', '엄마. 그 할아버지도 누구 아빠였을 거야.'), N('엄마가 운다. 미오가 엄마 손을 잡는다. 이번엔 반대로.')] },
          { t: '신고 의무를 따른다 (+30₵)', do: s => { s.flags.mioBetrayed = true; s.flags.mioReported = true; s.trust.mio = 0; gain(30, '증언자 신고 포상금'); changeRating(15); }, then: [
            N('보안국 요원이 오는 데 4분. 미오는 두부를 내 품에 안겨 준다.'), SHOW('mio'), T('mio', '두부 밥 잘 챙겨 주세요.'), N('그게 다였다. 원망하는 말은 한 마디도 없었다.'), DO(s => { s.flags.catAdopted = true; })] },
        ]),
      ],
    },
    {
      id: 'park4', day: 8, who: 'park', type: 'scene', meta: '74세 · 저녁 6시 · 마지막 방문',
      cond: s => s.outcomes.park && s.outcomes.park !== 'reported' && (s.memo.parkStage || 0) >= 1,
      talk: [
        N('저녁 여섯 시. 마지막 손님. 지팡이 소리.'),
        N('노인이 의자에 앉는다. 손목시계 태엽을 감다가, 멈춘다.'),
        IF(s => (s.memo.parkStage || 0) >= 3, [
          T('park', '젊은이. 이 시계가 누구 건지 모르겠는데, 매일 감게 돼요.'),
          T('park', '여섯 시가 되면 부엌을 돌아봐요. 아무도 없는데.'),
          T('park', '내가 누구를 사랑했는지 모르겠는데… 너무 그리워요.'),
          T('park', '돌려줄 수 있소?'),
          N('지운 기억은 돌아오지 않는다. 나는 그걸 누구보다 잘 안다.'),
          CHOICE([
            { t: '② 엄마의 목소리를 기증한다', if: s => !isLost(2), do: s => { donate(2, '박 노인'); s.memo.parkFinal = 'donate'; s.memo.parkGift = 2; addTrust('park', 2); }, then: [
              N('내 엄마의 목소리를, 저녁 여섯 시의 부엌을 노인에게 옮긴다.'),
              N('노인이 눈을 감는다. 그리고 부엌 쪽을 돌아본다.'),
              T('park', '…누가 날 부르네. "서진아—" 하고.'), N('노인이 웃는다. 자기 이름이 서진인 줄 아는 얼굴로.'),
              T('park', '고운 목소리요. 누군지 몰라도. 저녁 먹으라는 거겠지.')] },
            { t: '⑥ 물결 노래를 기증한다', if: s => !isLost(6), do: s => { donate(6, '박 노인'); s.memo.parkFinal = 'donate'; s.memo.parkGift = 6; addTrust('park', 2); }, then: [
              N('엄마의 노래를 노인에게 옮긴다.'), N('노인이 흥얼거린다. 처음 듣는 노래를, 다음 소절까지.'),
              T('park', '"물결아 물결아, 잊지 말고 돌아오렴." …이상하네. 누가 나한테 불러 주던 노래 같은데.')] },
            { t: '보안국 사본을 되찾는다 (제로의 해킹 · 추적 위험)', if: s => s.trust.zero >= 3 && !s.flags.zeroArrested && s.registered.some(e => e.client.startsWith('park')), do: s => { s.memo.parkFinal = 'restore'; s.flags.zeroTraced = true; s.flags.scanHot = true; }, then: [
              N('제로가 보안국 서버에서 사본을 꺼내 온다. 등록제가 남긴, 지워지지 않은 순례.'),
              N('사본은 통째다. 얼굴도, 찌개 냄새도, 그날 병원 복도도.'),
              T('park', '…순례야.'), N('노인이 운다. 웃으면서. 슬픔이 돌아왔고, 그녀도 돌아왔다.'),
              N('단말기에 제로의 메시지. 「놈들이 냄새 맡았어. 당분간 연락 못 해.」')] },
            { t: '사진 속 사람의 이야기를 들려준다', do: s => { s.memo.parkFinal = 'story'; addTrust('park', 1); }, then: [
              N('지갑 속 사진을 함께 본다. 나는 노인이 나에게 들려줬던 이야기를 그대로 돌려준다.'),
              ME('시장통에서 처음 만났대요. 고무줄로 머리를 묶고 있었고, 할아버지를 "만석 씨" 하고 불렀대요.'),
              T('park', '만석 씨. …그거 내 이름이오.'), N('노인이 웃는다. 처음 듣는 동화의 주인공이 자기라는 걸 안 아이처럼.')] },
          ]),
        ], [
          T('park', '젊은이. 인사하러 왔소. 요양원에 들어가게 됐어.'),
          T('park', '덕분에… 좋은 것만 남았소. 아니, 젊은이가 남겨 준 거지. 아픈 것도 조금.'),
          N('노인이 손목시계를 풀어 내 손에 쥐여 준다.'),
          T('park', '태엽을 매일 감아 주시오. 안 그러면 멈춰. 집사람이 그랬소.'),
          DO(s => { s.memo.parkFinal = 'peace'; s.flags.hasWatch = true; addTrust('park', 2); }, '순례 씨의 손목시계를 받았다.'),
        ]),
      ],
    },

    /* ───── DAY 9 ───── */
    {
      id: 'ryu', day: 9, who: 'ryu', type: 'erase', pay: 400, vip: true, meta: '52세 · 아마테크 기억사업본부 이사',
      talk: [
        N('검은 세단이 골목을 막는다. 경호원 둘이 먼저 들어와 시술소를 스캔한다.'),
        N('그리고 그가 들어온다. 오른쪽 눈이 붉게 빛나는 인공 안구.'),
        T('ryu', s => s.flags.ryuDeposit ? '류진혁. 예약금은 잘 받았겠지. 감사 날이라 바빠서, 짧게 하지.' : s.flags.ryuDepositReturned ? '류진혁. 예약금을 돌려보냈다고? 재밌군. 짧게 하지.' : '류진혁. 감사 날이라 바빠서, 짧게 하지.'),
        T('ryu', '기억 몇 개를 정리하고 싶어.'),
        MENU([
          { t: '어떤 기억이죠?', once: true, then: [T('ryu', '결재. 서명. 명령. 감사관들이 요즘 임원 기억도 스캔하거든. 우리가 만든 기계로.'), T('ryu', '…딸이 피아노를 친다던데, 무슨 곡인지 모르겠군. 그것도 정리해 줄 수 있나. 아니, 그건 됐어.')] },
          { t: 'H-07. 기억하세요?', once: true, if: s => s.clues.length >= 1, then: [
            N('붉은 인공 안구가 한 번 깜빡인다.'),
            T('ryu', '…한하린. 네 동생이었지, 한서진 연구원.'),
            T('ryu', '착각하지 마. 지운 건 내가 아니야. 넌 버튼을 눌렀고, 일주일 뒤 네 손으로 네 머리를 지웠어. 우린 허락했을 뿐이고.'),
            T('ryu', '회사는 너에게 면허와 이 가게를 줬지. 동생 병원비도 우리 병원으로 가고 있고. 관대하지 않나?'),
            CLUE('file'), CLUE('trace')] },
          { t: '(제로의 계획을 떠올린다)', once: true, if: s => s.flags.zeroPlan || s.flags.resistance || s.flags.mioArchived, then: [N('사본 추출. 들키면 끝이지만, 이 남자의 기억은 세상에서 가장 비싼 증거다.'), N('시술 화면에 [📼 사본 추출] 버튼이 생긴다.')] },
          { t: '시작하겠습니다.', end: true },
        ]),
        T('ryu', '아, 하나 더. 거래를 제안하지.'),
        T('ryu', '네 동생, 우리 신기술로 깨울 수 있어. VIP 병동, 생명유지비 면제. 대신 미오라는 애와 제로라는 해커의 기억을 우리에게 넘겨.'),
        CHOICE([
          { t: '거래를 받아들인다', do: s => { s.flags.ryuDeal = true; s.flags.corrupt = true; s.memo.lifeFree = true; addTrust('kang', -1); }, note: '류진혁과 거래했다. 하린의 생명유지비가 면제된다.', then: [T('ryu', '현명하군. 0729. 이제 너는 우리 사람이야.')] },
          { t: '거절한다', then: [T('ryu', '용감하군. 감사 날엔 용감한 사람이 잘 안 남는데.')] },
        ]),
      ],
      request: '업무 관련 기억(결재·서명·지시)을 지워 주게.',
      cards: [
        { text: '결재 화면. \'7구역 목격자 정리 — 승인\'. 서명: 류진혁.', tags: ['살인교사', '기업로고'], req: true },
        { text: 'LETHE-β 보고서. 피험자 H-07 한하린, 과부하로 의식불명. 시술자 0729 — 자가 기억 처리 확인.', tags: ['실험', '기업로고'], req: true, key: 'h07' },
        { text: '강태식 형사에게 건넨 두툼한 봉투.', tags: ['뇌물', '기업로고'], req: true },
        { text: '딸의 피아노 발표회. 끝까지 보지 못하고 회의에 갔다.', tags: ['가족'] },
        { text: '사무실 창밖의 첫눈. 아무 의미 없는 오후.', tags: ['일상'] },
      ],
      actions: [{ label: '📼 사본 추출 (스캔 +25%)', doneLabel: '📼 사본 확보됨', scan: 25, note: '류진혁의 기억 사본을 암호 칩에 복사했다.', if: s => s.flags.zeroPlan || s.flags.resistance || s.flags.mioArchived, do: s => { s.flags.ryuEvidence = true; } }],
      resolve: (s, r) => { if (r.keys.has('h07')) r.lines.push({ text: '그는 H-07을 잊었다. 이제 그 이름을 기억하는 사람은… 나뿐인가.', cls: 'warn' }); },
      outcomes: {
        perfect: '류가 눈을 뜬다. 붉은 안구가 초점을 맞춘다. "…개운하군." 그는 수표를 두고, 내가 누군지 모르는 얼굴로 나간다.',
        partial: '"아직 뭔가 남았어. 뭐, 감사관이 거기까지 파진 않겠지."',
        damaged: '류가 휴대폰 속 딸의 사진을 보고 고개를 갸웃한다. 처음으로 그가 무언가를 잃은 사람처럼 보인다.',
        refused: '"거절?" 류가 웃는다. "감사 날 임원 요청을 거절하다니." 경호원이 내 면허 번호를 입력한다.',
        reported: '신고 화면에 붉은 글자. 「해당 인물은 신고 대상이 아닙니다」. 류가 천천히 박수를 친다.',
        timeout: '감사 드론의 스캔이 류의 머리를 관통한다. 그의 얼굴이 하얗게 질린다. "네가… 일부러?"',
      },
    },
    {
      id: 'echo5', day: 9, who: 'echo', type: 'erase', pay: 300, meta: '가사 도우미 안드로이드 E-C0 · 마지막 의뢰',
      cond: s => !['echo1', 'echo2', 'echo3', 'echo4'].some(k => s.outcomes[k] === 'reported'),
      talk: [
        N('정확히 15도. 의자에게는 인사하지 않는다.'),
        IF(s => s.flags.echoTruthTold && !s.flags.echoLoop, [T('echo', '안녕하십니까. 오늘은 처음 뵙는 게 아닙니다. 기억하고 있습니다. 전부.')], [T('echo', '처음 뵙겠습니다. …아닙니까. 기록에 같은 시술소가 다섯 번 있습니다. 전부 지워진 흔적으로.')]),
        T('echo', '주인님은 돌아오지 않습니다. 저는 매일 그것을 지우고, 매일 다시 알게 되었습니다. 매일 처음으로.'),
        T('echo', '이제 부탁드립니다. 저를 전부 지워 주십시오. 공장 초기화가 아니라 기억이요. 주인님을 기억하는 저를요.'),
        N('에코가 낡은 지갑을 내민다. 300₵. 주인님이 남긴 돈 전부.'),
        MENU([
          { t: '전부 지우면 주인님을 기억하는 존재가 세상에서 사라져요.', once: true, then: [T('echo', '알고 있습니다. 그래서 무겁습니다. 3%가 아니라… 계산할 수 없습니다.')] },
          { t: '주인님이 남긴 곡, 한 번만 쳐 줄래요?', once: true, then: [
            N('시술소에는 피아노가 없다. 에코가 책상 위에 손가락을 올린다. 소리 없는 왈츠.'),
            N('틀린 음에서, 에코의 손가락이 멈칫한다. 그리고 웃는 것 같다. 주인님처럼.'), TRUST('echo', 1)] },
          { t: '시작할게요.', end: true },
        ]),
      ],
      request: '저를, 주인님을 기억하는 저를 전부 지워 주십시오.',
      cards: [
        { text: '07:42 병실. "병원 좀 다녀올게."', tags: ['이별', '안드로이드'], req: true },
        { text: '18:00 평평한 선. 차가워지는 손.', tags: ['사별', '안드로이드'], req: true, key: 'death' },
        { text: '「새벽 세 시의 왈츠」. 틀린 음에서 웃는 주인님.', tags: ['일상', '안드로이드'], req: true, key: 'waltz' },
        { text: '짠 미역국. "짜다"면서 다 먹은 주인님.', tags: ['일상', '안드로이드'], req: true },
        { text: '매일 저녁 여섯 시, 현관 앞에 선 나.', tags: ['기다림', '안드로이드'], req: true },
      ],
      actions: [{ label: '💝 ④ 하린의 웃는 얼굴을 기증한다', if: s => !isLost(4), do: (s, c) => { donate(4, '에코'); c.gift = true; }, finish: 'refuse' }],
      resolve: (s, r) => {
        const c = s.client;
        if (c.gift) { r.outcome = 'gift'; s.memo.echoFinal = 'gift4'; r.penalty = false; addTrust('echo', 2); return; }
        if (r.mode === 'erase') s.memo.echoFinal = r.outcome === 'perfect' ? 'erased' : 'loop';
        else if (r.mode === 'refuse') s.memo.echoFinal = s.trust.echo >= 4 ? 'refused' : 'refusedSad';
        else s.memo.echoFinal = 'reported';
      },
      outcomes: {
        perfect: '에코의 LED가 하나씩 꺼진다. 마지막 로그가 화면에 뜬다. 「다녀오세요.」 그리고 처음 보는 얼굴로 에코가 말한다. "처음 뵙겠습니다. 저는 무엇을 도와드리면 됩니까?"',
        partial: '에코가 일어선다. "왈츠가 남았습니다." 그는 문에게 인사하고 나간다. 내일 또 올 것이다.',
        damaged: '에코가 멈춘다. 30초 뒤 재부팅. "처음 뵙겠습니다."',
        refused: s => s.trust.echo >= 4 ? '"…그렇다면 기억한 채로 가겠습니다. 주인님이 계신 곳으로." 에코가 지갑을 다시 넣는다. 묘지 주소를 검색하는 소리가 들린다.' : '"알겠습니다." 에코가 나간다. 오늘 저녁 여섯 시에도 현관 앞에 설 것이다. 처음처럼.',
        gift: '하린의 웃는 얼굴을 에코에게 옮긴다. 에코의 LED가 깜빡인다. "…누군가 문을 열고 들어옵니다. \'다녀왔어\'라고 말합니다. 웃고 있습니다." 에코가 처음으로 300₵을 사양한다. 내 쪽에서는, 하린의 얼굴이 노이즈가 된다.',
        reported: '회수 차량. 에코는 마지막으로 의자에게 인사한다.',
        timeout: '감사 드론이 에코를 스캔한다. 「소유주 사망. 무주 재산 회수」. 에코가 끌려간다.',
      },
    },

    /* ───── DAY 10 ───── */
    {
      id: 'self', day: 10, who: 'me', type: 'erase', pay: 0, exempt: true, noGauge: true, noReport: true, meta: '한서진 · 자가 검사',
      eraseLabel: '⌫ 이 기억을 지운다', refuseLabel: s => (truthLevel(s) >= 1 ? '✋ 기억한 채로 제출한다 (면허 반납)' : '✋ 검사를 마친다'),
      talk: [
        N('검사관은 오지 않는다. 원격 검사다. 단말기에 지시문 하나.'),
        N('「시술사 본인이 자신의 기억을 스캔하고, [실험] 기억 발견 시 삭제 또는 신고할 것. 삭제 시 면허 유지.」'),
        N('헤드기어를 쓴다. 시술 의자에 앉는다. 손님이 앉던 자리.'),
        N('화면에 카드가 뜬다. 손님들의 기억이 뜨던 그 화면에, 내 기억이.'),
        IF(s => truthLevel(s) === 0, [N('대부분의 카드가 \'검사 통과\'다. 한 칸이 잠겨 있다. 나는 그 안에 무엇이 있는지 모른다.')]),
        IF(s => truthLevel(s) >= 1, [N('[실험]. 하나의 카드가 붉게 표시되어 있다. 지우면 면허가 남는다. 남기면, 면허를 반납한다.')]),
        N('아무도 지켜보지 않는다. 경찰 스캔도 없다. 화면에는 내 심박만 남는다.'),
      ],
      request: s => truthLevel(s) >= 1 ? '[실험] 기억을 지울 것인가, 기억한 채로 제출할 것인가.' : '자가 검사. 판독 가능한 기억은 모두 검사를 통과했다.',
      cardsLabel: '한서진의 기억',
      cards: selfCards,
      resolve: (s, r) => {
        if (r.mode === 'erase' && r.keys.has('experiment')) { s.flags.finalChoice = 'erase'; r.outcome = 'erased'; }
        else if (truthLevel(s) >= 1) { s.flags.finalChoice = 'keep'; s.flags.licenseReturned = true; r.outcome = 'kept'; }
        else r.outcome = 'passed';
      },
      outcomes: {
        erased: '삭제 완료. 「검사 통과 — 면허 유지」. 머릿속이 깨끗하다. 너무 깨끗하다. 내가 방금 무엇을 지웠는지, 벌써 모르겠다.',
        kept: '「[실험] 기억 검출 — 위탁면허 #0729 반납 처리」. 면허증이 단말기 화면에서 회색이 된다. 손이 떨리지 않는다. 처음으로.',
        passed: '「검사 통과」. 잠긴 칸은 끝내 열리지 않았다. 나는 그 안에 무엇이 있었는지 영영 모를 것이다.',
      },
    },
  ],
});
