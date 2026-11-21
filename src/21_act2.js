
/* =====================================================================
   ACT 2 「균열」 — 4~7일차 · 다이브 1·2 · 인터루드 Ⅱ
   ===================================================================== */
const registered = (s, key) => s.registered.some(e => e.keys.includes(key));

registerAct({
  days: {
    4: {
      actStart: true,
      morning: { bg: 'clinic', steps: [
        N('라디오에서 아침 뉴스가 흘러나온다.'),
        IF(s => s.flags.zeroArrested, [N('「해커 \'제로\' 체포. 시위 배후 조직 수사 확대」 — 앵커의 목소리가 지나치게 밝다.')]),
        IF(s => s.flags.resistance, [N('「광장에 다시 촛불. \'기억은 우리 것\' 문구가 광고판 열두 곳을 장악」')]),
        IF(s => s.outcomes.doyun === 'perfect', [N('「권도윤 기자, 소환 조사에서 묵비권. 경찰 \'가족 관계 확인 불가\'」')]),
        N('「아마테크, 7구역 위탁 시술소에 \'미성년자 시술 전면 금지\' 지침」'),
        N('냉장고를 연다. 푸딩이 그대로 있다. 이제 버리려는 시늉도 하지 않는다.'),
      ] },
      evening: {
        hospital: s => s.flags.byulShelterAsk && !['erase', 'report'].includes(s.flags.byulHelp) ? [
          SHOW('nurse'), T('nurse', '서진 씨가 이 시간에 웬일이에요? …쉼터요?'),
          N('소라와 별의 이야기를 한다. 윤 간호사는 끝까지 듣고, 아무것도 묻지 않는다.'),
          T('nurse', '병원 사회복지실에 아는 선생님이 있어요. 내일 아침에 연락해 둘게요. 아이 엄마 번호 주세요.'),
          DO(s => { s.flags.byulHelp = 'shelter'; addTrust('byul', 1); }, '소라와 별을 쉼터에 연결했다.'),
          SHOW('harin'), N('돌아가기 전에 하린의 병실에 들른다. 모니터 소리만 규칙적이다.'),
          MENU([OPT_HOLD, OPT_SEDATIVE, OPT_LEAVE()]),
        ] : null,
        alley: s => s.outcomes.sora && s.outcomes.sora !== 'reported' ? [
          N('세탁공장 뒷골목. 2층 창문에 해바라기 화분 하나.'),
          SHOW('byul'), N('창문 안쪽에서 별이 나를 본다. 손을 흔들까 말까 하다가, 아주 작게 흔든다.'),
          N('현관 도어락이 삑 울리자 별이 창문에서 사라진다. 들어온 건 소라다. 별이 다시 나타나는 데 한참 걸린다.'),
          ME('…'), N('나는 그 자리에 조금 더 서 있다. 별이 다시 손을 흔들 때까지.'), TRUST('byul', 1),
        ] : null,
      },
      quiet: { title: '병실', bg: 'hospital', cond: s => s.memo.lastLoc === 'hospital', steps: [
        SHOW('harin'), N('의자를 침대 옆으로 당겨 앉는다.'), PAUSE(500), N('모니터의 초록 선이 오르내린다.'), PAUSE(500),
        N('아무 말도 하지 않는다. 하린도 하지 않는다.'), PAUSE(500), N('간호사가 불을 끄러 왔다가, 그냥 돌아간다.'),
      ] },
      night: ['다이브 장비를 하린의 원격 단자에 연결한다. 시술사 자격으로는 불법이다.', '하린의 의식 속으로 들어가 본다. 오늘 밤 처음으로.'],
      dive: 1,
      diary: s => [
        s.flags.byulHelp === 'erase' ? '별의 무서운 기억을 지웠다. 규칙을 어겼다. 아이는 내 눈을 보지 않았다.' : s.flags.byulHelp === 'preserve' ? '별의 기억을 지우지 않고 봉인했다. 지우지 않아도 도울 수 있었다. 처음 알았다.' : '별은 놀이공원 간 날을 남겨 달라고 했다. 무서운 기억 바로 옆에 있는데도.',
        `에코가 또 왔다. ${s.memo.echoVisits || 0}번째 "처음 뵙겠습니다". 카드에 하얀 복도가 0.5초 스쳤다.`,
        '하린의 의식 속에 들어갔다. 하린은 앞서 걸었다. 한 번도 돌아보지 않았다.',
        isLost(1) || isLost(2) ? '판 기억이 있던 자리는 회색이었다. 하린이 그 앞에서 멈춰 섰다.' : '바다가 있었다. 엄마의 부엌도.',
      ],
    },
    5: {
      morning: { bg: 'clinic', steps: [
        IF(s => !s.flags.mioBetrayed && !s.flags.mioReported && s.trust.mio >= 2, [N('셔터 틈에 종이 한 장. 크레파스로 그린 옥상과 두 사람과 고양이.'), DRAW('rooftop')]),
        N('단말기에 새 공문. 「안드로이드 기억은 소유주의 재산. 동의 없는 삭제 금지.」'),
        IF(s => s.memo.doyunStage, [N('독립언론 홈페이지에 예고가 떴다. 「아마테크 LETHE-β의 피험자들 — 권도윤 기자, 내일 공개」')]),
      ] },
      evening: {
        bar: s => s.visits.bar >= 1 ? [
          SHOW('rei'), T('rei', '왔어? 앉아.'),
          T('rei', s => { const sold = MY_MEMORIES.filter(m => s.sold.includes(m.id)); return sold.length ? `요즘 뭐 팔았어? …${sold.map(m => m.title).join(', ')}. 맞지?` : '요즘 뭐 팔았어? …아무것도 안 팔았네. 다행이다.'; }),
          N('등골이 서늘하다. 어떻게 아는 거지.'),
          T('rei', '이 동네 중개소는 다 내 단골이야. 0729 물건이 들어오면 연락이 와.'),
          MENU([
            { t: '그걸 왜 신경 쓰세요?', once: true, then: [T('rei', '지우면 편해. 근데 편한 게 다는 아니더라.'), N('레이가 빈 액자를 닦는다. 오래.'), TRUST('rei', 1)] },
            OPT_GIG, OPT_FORGE, OPT_LEAVE(),
          ]),
        ] : null,
        alley: s => s.flags.byulHelp && s.flags.byulHelp !== 'report' ? [
          N('세탁공장 뒷골목. 별이 쪼그려 앉아 화분에 물을 주고 있다.'),
          SHOW('byul'), T('byul', '아저씨. 해바라기는 해를 따라 고개를 돌린대요.'),
          T('byul', '…밤에는 어디 봐요?'), ME('아마… 땅을 보겠지. 쉬는 거야.'), T('byul', '그럼 나도 밤에는 쉬어도 돼요?'),
          N('대답을 찾는 사이 별이 씨앗 한 줌을 내 손에 쥐여 준다. 「나중에 심어요.」'), TRUST('byul', 1),
        ] : null,
      },
      night: ['씨앗 몇 개가 주머니에서 굴러 나온다. 책상 위에 올려 둔다.', '모니터 옆 하린의 사진을 오래 본다.'],
      diary: s => [
        s.memo.parkStage >= 3 ? '박 할아버지가 순례 씨의 얼굴을 지웠다. 사진을 보고 "고운 사람이네. 누구요?"라고 했다.' : '박 할아버지는 아직 순례 씨의 얼굴을 기억한다. 그게 할아버지를 아프게 한다.',
        s.outcomes.eunjae ? '은재가 저금통을 들고 왔다. 12₵. "공평하게" 잊고 싶다고 했다.' : '오늘은 저금통을 든 손님이 없었다.',
        s.clues.includes('trace') ? '자가 스캔. 시술자 0729, 대상 0729. 나를 지운 건 나였다. 나도 박 할아버지처럼, 하나씩.' : '서랍 속 단서들이 한 곳을 가리킨다.',
        '사람들은 왜 같은 걸 계속 지우러 올까. 나도. 그랬던가.',
      ],
    },
    6: {
      morning: { bg: 'alley', steps: [
        N('성심병원 로비 간판이 밤사이 바뀌었다. 붉은 삼각형. 「아마테크 메디컬 — 성심」'),
        T('nurse', '서진 씨… 병원이 인수됐어요. 다음 청구서부터 생명유지비가 180이에요. 미안해요. 제가 미안할 일은 아닌데.'),
        N('단말기에 공문. 「기억 등록제 시행. 최근 30일 시술 기록 소급 제출.」'),
        N('지금까지 지운 모든 기억의 사본이 보안국 서버로 올라간다. 내가 지운 것들이, 지워지지 않고 어딘가에 쌓인다.'),
      ] },
      evening: {
        bar: [
          SHOW('rei'), N('영업이 끝난 망각 바. 레이가 의자를 테이블 위에 올리고 있다.'),
          T('rei', '왔으면 거들어. 잔 좀 닦아.'),
          N('나란히 서서 설거지를 한다. 물소리. 레이가 물결 노래를 흥얼거린다. 나도 모르게 다음 소절을 따라 부른다.'),
          IF(s => isLost(6), [N('…따라 부르려다 멈춘다. 그 노래가 무슨 노래였는지 모르겠다. 레이가 나를 한참 본다.')], [N('레이의 손이 멈춘다. 그리고 아무 일 없다는 듯 다시 잔을 닦는다.')]),
          N('마지막으로 레이가 빈 액자를 닦는다.'),
          MENU([
            { t: '액자에 누가 있었어요?', once: true, then: [T('rei', '몰라. 그래서 닦아.'), PAUSE(400), T('rei', '…누군지 모르는 사람이 이렇게 보고 싶을 수도 있더라.'), TRUST('rei', 2)] },
            OPT_LEAVE('잔을 마저 닦는다'),
          ]),
        ],
        alley: s => s.flags.corrupt && s.flags.mioHidden && !s.flags.kangAskedMio ? [
          SHOW('kang'), N('골목 끝에서 라이터 불빛. 강 형사다.'),
          T('kang', '서진 씨. 애 하나 찾는 중인데. 열네 살, 교복, 맨발. 시술소 창고 넓던데?'),
          T('kang', '넘기면 끝이야. 당신 벌점 기록도, 이 동네 감시도.'),
          CHOICE([
            { t: '창고는 비어 있어요.', do: s => { s.flags.kangAskedMio = true; addTrust('kang', 1); s.flags.scanHot = true; }, then: [T('kang', '…그래? 그럼 내일 드론이 좀 시끄럽겠네.'), N('라이터가 딸깍 닫힌다. 그가 돌아서다 멈춘다. "…잘했어." 혼잣말 같다.')] },
            { t: '…데려가세요. (+150₵)', do: s => { s.flags.kangAskedMio = true; s.flags.mioBetrayed = true; s.flags.mioHidden = false; s.trust.mio = 0; addTrust('kang', -2); gain(150, '강 형사 협조금'); }, then: [N('그날 밤 창고가 비었다. 두부만 남았다.'), DO(s => { s.flags.catAdopted = true; })] },
          ]),
        ] : [
          N('정류장 앞. 우산 하나를 둘이 같이 쓴 연인이 지나간다.'),
          IF(s => s.outcomes.yuna2, [SHOW('yuna'), N('유나다. 옆의 남자는… 준. 유나가 준의 어깨를 치며 웃는다. 음치라고 놀리는 것 같다.')], [N('누군가의 웃음소리가 빗소리에 섞인다.')]),
          N('같은 사람을 두 번 사랑하는 것. 같은 사람을 두 번 지우는 것. 어느 쪽이 더 이상한 걸까.'),
        ],
      },
      night: ['청구서의 숫자가 바뀌었다. 150이 180이 되었다.', '지운 기억의 사본들이 서버 어딘가에 쌓이고 있다. 내 것도 있을까.'],
      diary: s => [
        s.flags.echoTruthTold ? '에코에게 주인은 돌아오지 않는다고 말했다. 에코는 2초 동안 멈췄다. 안드로이드에게 2초는 아주 긴 시간이다.' : '에코의 카드에서 병실을 봤다. 에코는 매일 이별이 아니라 죽음을 지우고 있었다.',
        s.flags.yunaKnows ? '유나 씨에게 새 남자친구가 준이라고 말했다. 유나 씨는 울다가 웃었다.' : '유나 씨가 다시 사랑에 빠졌다. 같은 사람과.',
        '모든 삭제 기록이 보안국으로 간다. 지운다는 건 이제 옮긴다는 뜻이다.',
        '나는 무엇을 옮겼을까. 413일 전에.',
      ],
    },
    7: {
      morning: { bg: 'clinic', steps: [
        N('라디오. 등록제 시행 첫날의 성과를 자랑하는 목소리.'),
        IF(s => registered(s, 'comrades'), [N('「시위 가담자 \'모래\' 검거. 등록된 기억 사본에서 신원 확인」'), N('까마귀, 모래, 바다. 제로의 카드에 있던 이름. 내가 지운 그 카드.')]),
        IF(s => registered(s, 'source'), [N('「아마테크 류진혁 이사 비서, 기밀 유출 혐의로 체포」 — 도윤의 취재원. 내가 지운 카드 어딘가에 그 얼굴이 있었다.')]),
        N('「가족 기억 삭제 시 가족 전원 동의 의무화」'),
      ] },
      evening: {
        bar: s => (s.flags.resistance || s.trust.zero >= 3) && !s.flags.zeroArrested ? [
          SHOW('zero'), T('zero', '왔구나. 들어 봐. 9일에 류진혁이 네 가게에 예약했어. 감사 날에 기억 세탁을 하려는 거야.'),
          T('zero', '놈의 기억 사본을 떠 줘. 그게 있으면 아마테크를 법정에 세울 수 있어. 아니면 전파로 세상에 뿌리든가.'),
          DO(s => { s.flags.zeroPlan = true; }, '제로의 계획: 류진혁의 기억 사본을 확보하라.'),
          IF(s => s.flags.mioArchived && !s.flags.chipGiven, [
            T('zero', '그리고… 미오라는 애 기억 칩, 아직 갖고 있지?'),
            CHOICE([
              { t: '칩을 건넨다', do: s => { s.flags.chipGiven = true; addTrust('zero', 1); }, note: '미오의 기억 칩을 저항군에 넘겼다.', then: [T('zero', '이 애 이름은 절대 안 나가게 할게.')] },
              { t: '미오에게 먼저 물어야 한다', do: s => addTrust('mio', 1), then: [T('zero', '…맞는 말이야. 넌 원래 그런 사람이었어.')] },
            ]),
          ]),
          SHOW('rei'), MENU([OPT_GIG, OPT_FORGE, OPT_LEAVE()]),
        ] : null,
        hospital: s => s.visits.hospital >= 1 ? [
          SHOW('nurse'), T('nurse', '어제 아마테크 사람들이 왔었어요. 하린 씨 진료 기록을 전부 \'회수\'하겠다고요.'),
          T('nurse', '…사본 하나는 제가 숨겨 뒀어요. 언젠가 서진 씨한테 필요할 것 같아서.'),
          DO(s => { s.flags.recordsSaved = true; }, '윤 간호사가 하린의 진료 기록 사본을 지켜 주었다.'),
          MENU([OPT_HOLD, OPT_SEDATIVE, OPT_LEAVE('고맙다고 말하고 돌아간다')]),
        ] : null,
        alley: s => s.flags.byulHelp && s.flags.byulHelp !== 'report' ? [
          N('밤 10시. 단말기가 울린다. 소라다.'),
          N('수화기 너머로 아주 작은 소리. 삑, 삑, 삑, 삐리릭. 도어락.'),
          T('sora', '…그 사람이 왔어요.'),
          N('소라의 목소리가 아주 낮다. 별의 목소리는 들리지 않는다. 그게 더 무섭다.'),
          CHOICE([
            { t: '강 형사에게 연락한다', do: s => { s.flags.byulNight = s.trust.kang >= 2 ? 'kang' : 'kangLate'; }, then: [
              IF(s => s.trust.kang >= 2, [N('강 형사는 두 번째 신호에 받았다. "주소 불러." 12분 뒤, 소라에게서 문자. 「경찰 왔어요. 그 사람 갔어요.」')],
                [N('강 형사는 받지 않는다. 세 번째에 받은 그가 말한다. "내 관할 아니야." 소라에게서는 아침까지 연락이 없다.')])] },
            { t: '쉼터에 연락한다', do: s => { s.flags.byulNight = s.flags.byulHelp === 'shelter' ? 'shelter' : 'shelterLate'; }, then: [
              IF(s => s.flags.byulHelp === 'shelter', [N('어제 연결해 둔 사회복지사가 바로 차를 보낸다. 새벽 1시, 문자. 「별이랑 쉼터에 왔어요. 별이 잠들었어요.」')],
                [N('접수 대기. 내일 아침 9시에 연락드리겠습니다.')])] },
            { t: '직접 간다', do: s => { s.flags.byulNight = 'me'; addTrust('byul', 3); s.flags.scanHot = true; }, then: [
              N('뛰었다. 계단을 올라 문을 두드린다. 문이 열리고, 무언가가 내 얼굴로 날아온다.'),
              N('…정신을 차리니 경찰이 와 있고, 별이 내 소매를 꼭 붙잡고 있다. 내 눈두덩이 부어 있다. 내일 손이 떨릴 것이다.'),
              T('byul', '아저씨, 화 안 내요?'), ME('…안 내.')] },
          ]),
        ] : null,
      },
      night: ['내일부터 통행금지다. 오늘 밤 거리는 이상하게 조용하다.', '하린의 의식 속으로 한 번 더 들어간다.'],
      dive: 2,
      interlude: 'II',
      diary: s => [
        s.flags.doyunFinal === 'reunite' ? '도윤 씨가 은재를 목말 태웠다. 서툴게. 몸이 먼저 기억했다. 대신 나는 "아빠"라는 글자를 읽을 수 없다.' : s.flags.doyunFinal === 'forget' ? '은재와 도윤 씨는 서로를 잊었다. 법적으로 아무 문제 없다.' : '은재는 아빠를 기다리기로 했다.',
        s.flags.byulNight === 'me' ? '눈두덩이 욱신거린다. 별이 내 소매를 놓지 않았다.' : '소라 씨의 전화가 계속 귓가에 남는다. 삑, 삑, 삑.',
        '다이브에서 하얀 문을 봤다. 하린이 "거긴 가지 마"라고 했다.',
        '나는 무엇을 지웠지. 나는 무엇을. 지웠지.',
      ],
    },
  },
  dives: {
    1: { title: '해변과 부엌', bg: 'sea', intro: [
      N('다이브 개시. 소금 냄새가 먼저 온다.'),
      N('하린이 앞에서 걷는다. 실루엣뿐이다. 맨발이 모래를 찍고, 파도가 지운다.'),
    ], rooms: [
      { id: 'beach', mem: 1, bg: 'sea', name: '해변', hint: '파도 소리', steps: [
        N('하린이 파도를 쫓아 뛰어가다 넘어진다. 일어나서 깔깔 웃는다.'),
        T('harinDream', '서진! 바다가 짜! 누가 소금 넣었어!'),
        ME('바다는 원래 짜.'), T('harinDream', '거짓말. 서진이 넣었지.'), N('기억 조각 하나가 손에 남는다. 따뜻하다.')] },
      { id: 'kitchen', mem: 2, bg: 'kitchen', name: '엄마의 부엌', hint: '국 끓는 소리', steps: [
        SHOW('mom'), N('부엌. 등을 보인 사람이 국을 젓는다. 얼굴은 보이지 않는다.'),
        T('mom', '서진아, 하린이 좀 깨워라. 국 식는다.'),
        N('하린의 실루엣이 식탁에 앉아 졸고 있다. 나는 그 어깨를 흔든다. 손이 그냥 통과한다.'), SHOW('harinDream')] },
      { id: 'diner', mem: 8, bg: 'diner', name: '중국집', hint: '단무지', steps: [
        N('첫 월급날. 짜장면 곱빼기 하나, 그릇 두 개.'),
        T('harinDream', '단무지는 내 거. 서진은 양파 먹어.'), ME('나도 단무지 좋아하는데.'), T('harinDream', '첫 월급 탄 사람은 양보하는 거야. 법이야.'),
        N('하린이 단무지를 전부 먹는다. 나는 그게 좋았다.')] },
      { id: 'bright', mem: 3, bg: 'whiteRoom', name: '너무 밝은 방', hint: '박수 소리', reso: 0, steps: [
        N('「첫 시술 성공」. 박수 소리. 누군가 내 어깨를 두드린다. 하린이 내 손을 잡아 준—'),
        N('…하린이 없다. 이 방에만 하린이 없다. 실루엣이 문 밖에서 멈춰 서서, 들어오지 않는다.'),
        N('이 기억은 너무 밝다. 너무 깨끗하다. 조명이 그림자를 하나도 만들지 않는다.'),
        CLUE('fake')], lostSteps: [N('이 방은 이미 팔았다. 그래도 그 자리가 이상하게 밝다.')] },
    ], end: [
      BG('sea', { dream: true }), N('해변 끝. 하린이 파도 앞에 멈춰 선다.'),
      T('harinDream', s => isLost(5) ? '█▓—' : '서진—'),
      N('하린이 처음으로 소리를 냈다. 내 이름이다. 돌아보지는 않는다.'),
      N('파도가 발자국을 지운다. 다이브 종료.'),
    ] },
    2: { title: '하린의 방', bg: 'harinRoom', intro: [
      N('다이브 개시. 이번엔 하린의 방이다. 벽지의 무늬까지 그대로다.'),
      N('벽에 매직 낙서. 「서진 바보」. 시술소 의자 밑에 있던 것과 같은 글씨.'),
    ], rooms: [
      { id: 'photo', mem: 4, bg: 'harinRoom', name: '책상 위 사진', hint: '덧니', steps: [
        SHOW('harinAwake'), N('사진 속 하린이 웃는다. 덧니가 보인다. 세상에서 제일 시끄러운 웃음.'),
        N('실루엣의 하린이 사진 앞에 서서, 사진 속 자기를 따라 웃는 것 같다.'), SHOW('harinDream')] },
      { id: 'radio', mem: 6, bg: 'harinRoom', name: '라디오', hint: '노래', steps: [
        N('라디오에서 물결 노래가 흘러나온다. 엄마 목소리다.'),
        N('"물결아 물결아, 잊지 말고 돌아오렴."'),
        T('harinDream', '서진, 이 노래 녹음해 놨어. 혹시 내가 까먹으면 들려줘.'), N('나는 대답하려 하지만 목소리가 나오지 않는다.')] },
      { id: 'park', mem: 7, bg: 'fireworks', name: '놀이공원', hint: '불꽃놀이', steps: [
        N('불꽃놀이. 나는 아빠 어깨 위에 있다. 세상이 나보다 낮다.'),
        N('엄마 품에 아기 하린이 안겨 있다. 불꽃이 터질 때마다 울다가, 웃다가.'),
        N('아빠 얼굴은 모른다. 어깨의 높이만 안다.')] },
      { id: 'door', bg: 'corridor', name: '잠긴 하얀 문', hint: '빛이 샌다', reso: 0, steps: [
        N('복도 끝에 하얀 문. 문틈으로 빛이 샌다. 기계음. 300.'),
        T('harinDream', '거긴 가지 마.'),
        N('하린의 실루엣이 문 앞을 막아선다. 처음으로, 나를 향해 서 있다.'),
        IF(s => truthLevel(s) >= 2, [N('나는 안다. 저 문 너머에 내가 지운 것이 있다.')], [N('왜인지 모르겠다. 저 문이 무섭다.')])] },
    ], end: [
      N('하린의 방이 천천히 어두워진다. 침대 위에 노란 녹음기가 놓여 있다.'),
      N('빨간 불이 깜빡인다. 녹음 중이다. 누가, 무엇을.'),
      N('다이브 종료.'),
    ] },
  },
  interludes: {
    II: { title: '물결', bg: 'bar', steps: [
      N('문 닫은 망각 바. 나는 카운터에 엎드려 잠들었다. 레이가 담요를 덮어 준다.'),
      N('레이가 낮게 물결 노래를 부른다.'),
      BG('kitchen', { dream: true }),
      SHOW('mom'), N('꿈. 부엌. 등을 보인 엄마.'),
      IF(s => isLost(2), [N('엄마의 입이 움직인다. 소리 대신 잡음이 난다. ▒▓█▒▓.')], [T('mom', '서진아. 하린이 좀 깨워라.')]),
      SHOW(null), BG('bar'),
      N('레이가 선반 맨 위의 병 하나를 내린다. 라벨에 손글씨. 「0729」.'),
      N('오래 들여다보다가, 다시 올려놓는다.'),
      N('술병들이 일제히, 아주 희미하게 빛난다.'),
    ] },
  },
});

registerAct({
  clients: [
    /* ───── DAY 4 ───── */
    {
      id: 'sora', day: 4, who: 'sora', type: 'erase', pay: 200, meta: '35세 · 세탁공장 · 아이 \'별\'(9세)의 보호자',
      talk: [
        N('여자가 아이의 손을 꼭 잡고 들어온다. 여름인데 긴소매. 뺨에 반창고.'),
        N('딩동. 문에 달린 종이 울리자 아이가 엄마 손을 놓고 시술 의자 밑으로 들어간다. 한참 나오지 않는다.'),
        T('sora', '…괜찮아, 별아. 여기 문은 그 소리 아니야.'),
        T('sora', '별이가 밤마다 소리를 질러요. 무서운 기억만 지워 주세요. 다른 데선 다 거절당했어요. 두 배로 드릴게요.'),
        MENU([
          { t: '오늘부터 미성년자 기억은 삭제 금지예요.', once: true, then: [T('sora', '알아요. 그래서 여기 온 거예요.'), T('sora', '법이 우리 별이를 지켜 준 적은 한 번도 없어요.')] },
          { t: '(의자 밑의 별에게) 나와도 돼. 여긴 화내는 사람 없어.', once: true, then: [
            SHOW('byul'), N('한참 뒤에 별이 고개만 내민다. 손에 검은 크레파스를 쥐고 있다.'),
            T('byul', '…아저씨, 화 안 내요?'), ME('안 내.'),
            T('byul', '아빠 기억 다 지우면, 아빠 얼굴도 잊어요? 놀이공원 간 날은 남겨 주세요. 그날은 아빠가 안 무서웠어요.'),
            TRUST('byul', 1), SHOW('sora')] },
          { t: '지우지 않고 도울 방법도 있어요. 쉼터를 알아봐 줄게요.', once: true, do: s => { s.flags.byulShelterAsk = true; }, note: '저녁에 병원에 가면 윤 간호사를 통해 쉼터를 연결할 수 있다.', then: [
            T('sora', '…쉼터요? 거기도 결국 서류잖아요.'), ME('아는 간호사가 있어요. 서류보다 사람이 먼저인 사람.'), N('소라가 반창고를 만지작거린다. 대답은 하지 않는다.')] },
          { t: '시작할게요.', end: true },
        ]),
      ],
      request: '별이의 \'무서운 기억\'만 지워 주세요.',
      cards: [
        { text: '식탁 밑. 내 무릎. 위에서 무언가 깨지는 소리. 눈을 꼭 감았다.', tags: ['미성년', '공포'], req: true },
        { text: '현관 도어락이 열리는 소리. 삑, 삑, 삑, 삐리릭.', tags: ['미성년', '공포'], req: true },
        { text: '놀이공원. 아빠 어깨 위에서 본 불꽃놀이.', tags: ['미성년', '가족'] },
        { text: '엄마가 밴드를 붙여 주며 "괜찮아"라고 한 밤.', tags: ['미성년', '가족'] },
        { text: '학교 화단에 심은 해바라기에 첫 꽃이 폈다.', tags: ['미성년', '일상'] },
      ],
      actions: [{ label: '🔒 증언 보존 (지우지 않고 봉인 복사)', note: '별의 기억을 봉인 칩에 복사했다. 지우지 않았다.', do: (s, c) => { c.preserve = true; }, finish: 'refuse' }],
      resolve: (s, r) => {
        const c = s.client;
        if (c.preserve) { r.outcome = 'preserved'; s.flags.byulHelp = 'preserve'; addTrust('byul', 2); return; }
        if (r.mode === 'erase') { s.flags.byulHelp = 'erase'; s.flags.byulErased = true; }
        else if (r.mode === 'report') { s.flags.byulHelp = 'report'; s.trust.byul = 0; }
        else if (!s.flags.byulHelp) s.flags.byulHelp = s.flags.byulShelterAsk ? 'shelterAsk' : 'refuse';
      },
      outcomes: {
        perfect: '별이 기지개를 켠다. "엄마, 해바라기 보러 가자." 소라가 소리 없이 운다. 별은 나가면서 한 번도 나를 보지 않는다.',
        partial: '별이 현관 쪽을 흘끔 본다. 아직 그 소리가 남았다. 그래도 아까보다는 덜 떤다.',
        damaged: '별이 엄마를 올려다본다. "아줌마는… 누구예요?" 소라의 얼굴에서 핏기가 빠진다.',
        refused: '소라가 고개를 숙인다. 별이 문을 나서며 나를 한 번 돌아본다. 아주 작게 손을 흔든다.',
        preserved: '별의 기억은 지워지지 않았다. 봉인 칩에 복사되어 아동보호 법원으로 간다. 소라가 칩을 두 손으로 받는다. "…이걸로 접근금지가 나와요?" "나와요."',
        reported: '아동보호국 드론이 도착한다. 소라는 \'불법 시술 시도\'로 연행되고, 별은 혼자 보호 차량에 오른다.',
        timeout: '경보에 별이 의자 밑으로 들어간다. 소라가 아이를 끌어안고 뛰쳐나간다.',
      },
    },
    {
      id: 'echo3', day: 4, who: 'echo', type: 'erase', pay: 60, meta: '가사 도우미 안드로이드 E-C0 · 세 번째',
      cond: s => !['reported'].includes(s.outcomes.echo1) && !['reported'].includes(s.outcomes.echo2),
      talk: [
        T('echo', '처음 뵙겠습니다. 가사 도우미 E-C0, 에코입니다. 의자님께도—'),
        ME('실례하겠습니다. 알아요.'),
        T('echo', '…놀랍습니다. 저를 아십니까?'),
        ME('당신이 매일 와요. 같은 기억을 지우러.'),
        T('echo', '그럴 리가 없습니다. 주인님은 어제 \'다녀올게\'라고 하셨습니다. 어제가 처음입니다.'),
        MENU([
          { t: '주인님은 어디로 "다녀오셨"나요?', once: true, then: [
            T('echo', '주인님은…'), PAUSE(1200), N('에코의 LED가 꺼졌다가 켜진다. 2초. 안드로이드에게 2초는 아주 긴 시간이다.'),
            T('echo', '…데이터가 손상되었습니다. 기억을 지워 주시면 해결될 것 같습니다.'), TRUST('echo', 1)] },
          { t: '시작할게요.', end: true },
        ]),
      ],
      request: '주인님이 "다녀올게"라고 말한 \'이별\'의 기억을 지워 주십시오.',
      cards: () => ECHO_CARDS([{ text: '2088.10.0█ ██:██ ▒▒ 하얀 복도. 침대 바퀴 소리. (데이터 손상)', tags: ['손상', '안드로이드'] }]),
      resolve: s => { s.memo.echoVisits = (s.memo.echoVisits || 0) + 1; },
      outcomes: {
        perfect: '"감사합니다. 이별이 지워졌습니다." 60₵. 에코가 문을 나서며 하얀 복도 쪽 카드를 한 번 돌아본다. 그 카드는 지우라고 하지 않았다.',
        partial: '"발소리는 남겨 주셨군요."',
        damaged: '에코의 손가락이 허공에서 피아노를 치다 멈춘다.',
        refused: '"내일 다시 오겠습니다. 처음 뵙는 분께." 에코가 문에게 인사한다.',
        reported: '회수 차량. "다녀오겠습니다."',
        timeout: '에코가 15도로 인사하고 뛰어나간다.',
      },
    },
    {
      id: 'kang2', day: 4, who: 'kang', type: 'scene', meta: '48세 · 강력계',
      talk: [
        N('문이 열리기도 전에 담배 냄새가 들어온다. 라이터가 딸깍, 딸깍.'),
        IF(s => s.flags.corrupt, [
          T('kang', '서진 씨, 우리 사업 파트너. 오늘은 큰 거야.'),
          IF(s => s.outcomes.doyun !== 'reported' && s.memo.doyunStage, [T('kang', '권도윤 기자. 딸은 잊었다며? 이제 취재 기억도 비워 줘. 전부.')], [T('kang', '시위 주동자 하나. 머릿속을 비워 줘. 동료 얼굴이고 뭐고 전부.')]),
          T('kang', '400. 그리고 덤으로, 당신 벌점 기록도 하나 지워 주지.'),
          CHOICE([
            { t: '받아들인다 (+400₵, 벌점 -1)', do: s => { s.flags.corruptDeep = true; gain(400, '강 형사 의뢰'); removePenalty('강 형사의 기록 정리'); addTrust('kang', -2); if (s.memo.doyunStage) s.flags.doyunWiped = true; },
              then: [N('그날 밤, 나는 한 사람의 머릿속을 통째로 비웠다. 손이 떨리지 않았다는 게 제일 무서웠다.'), T('kang', '역시. 우리 서진 씨는 일을 알아.')] },
            { t: '거절한다', do: s => { addTrust('kang', 2); changeRating(-10); s.flags.scanHot = true; },
              then: [T('kang', '…그래? 그럼 봉투는 여기까지야. 내일 드론이 유난히 이 가게를 좋아하게 될 거야.'), N('그가 나가다 멈춘다. 라이터를 오래 내려다본다. "…아니다." 그리고 나간다.')] },
          ]),
        ], [
          IF(s => s.outcomes.kang === 'reported', [T('kang', '신고 잘 받았어. 접수 담당자가 나라서 다행이지?')], [T('kang', '정기 점검이야. 겁먹지 마.')]),
          T('kang', '…한 가지 알려 주지. 당신 동생 사건. H-07. 그 파일, 지금 내 서랍에 있어.'),
          T('kang', '100이면 복사본을 줄게. 당신이 진짜 누군지 궁금하다면.'),
          CHOICE([
            { t: '파일을 산다 (-100₵)', if: s => s.money >= 100, do: s => { spend(100, 'H-07 사건 파일'); addTrust('kang', 1); },
              then: [N('얇은 메모리 카드. 표지엔 「H-07 — 상부 지시로 종결」.'), CLUE('file'), T('kang', '난 아무것도 안 줬어. 알지?')] },
            { t: '왜 저를 돕는 거예요?', do: s => addTrust('kang', 1), then: [
              T('kang', '돕는 거 아니야.'), N('라이터를 연다. 닫는다. 「민」.'),
              T('kang', '…내 파트너도 그 회사 서류를 들고 다니다 죽었어. 3년 전에. 그게 다야.'), N('그는 파일을 책상에 두고 나간다. 돈을 받지 않았다.'), CLUE('file')] },
            { t: '거절한다', then: [T('kang', '모르는 게 약일 때도 있지.')] },
          ]),
        ]),
      ],
    },

    /* ───── DAY 5 ───── */
    {
      id: 'park3', day: 5, who: 'park', type: 'erase', pay: 80, meta: '74세 · 세 번째 방문', refuseLabel: '✋ 거절한다',
      cond: s => s.outcomes.park && s.outcomes.park !== 'reported',
      talk: [
        N('노인이 들어온다. 이번엔 안마 의자 농담을 하지 않는다.'),
        T('park', '젊은이. 그날은 안 떠오르는데… 집사람 얼굴을 보면, 이상하게 가슴이 무너져.'),
        T('park', '얼굴을 보면 그날이 떠오를 것 같아서. 얼굴을… 지워 주시오.'),
        N('그가 지갑에서 사진을 꺼낸다. 사진 모서리가 닳아 있다. 매일 꺼내 본 손때.'),
        MENU([
          { t: '얼굴을 지우면, 사진 속 사람을 모르게 돼요.', once: true, then: [T('park', '…알아. 그래도 사진은 갖고 다닐 거요. 모르는 사람이라도, 고운 사람이니까.')] },
          { t: '찌개 냄새는요? 손목시계는요?', once: true, then: [T('park', '그건… 두시오. 그건 얼굴이 아니니까.'), N('얼굴이 아닌 것들만 남기면, 그건 누구의 기억일까.'), TRUST('park', 1)] },
          { t: '시작하겠습니다.', end: true },
        ]),
      ],
      request: '아내 순례의 얼굴을 지워 주시오.',
      cards: [
        { text: '순례의 얼굴. 웃을 때 왼쪽 볼에만 보조개가 생긴다.', tags: ['가족'], req: true, key: 'face' },
        { text: '시장통에서 처음 본 순례. 고무줄로 머리를 질끈 묶고 있었다.', tags: ['가족'], req: true, key: 'face2' },
        { text: '매일 저녁 여섯 시, 된장찌개 냄새.', tags: ['가족'], key: 'stew' },
        { text: '손목시계 태엽을 감아 주던 순례의 손.', tags: ['가족'], key: 'watch' },
      ],
      resolve: (s, r) => {
        if (r.mode === 'erase' && (r.keys.has('face') || r.keys.has('face2'))) s.memo.parkStage = 3;
        if (r.mode === 'refuse') addTrust('park', -1);
      },
      outcomes: {
        perfect: '노인이 사진을 본다. "고운 사람이네. 누구요?" 대답할 수 없다. 그는 사진을 지갑에 다시 넣는다. 버릇처럼.',
        partial: '"보조개가… 어느 쪽이었더라." 노인이 사진을 오래 들여다본다.',
        damaged: '노인이 손목시계를 풀어 책상에 놓는다. "이건 여자 시계구먼. 내 게 아니오."',
        refused: '"젊은이가 뭘 안다고!" 노인이 지팡이로 바닥을 친다. 나가는 뒷모습이 작다. 문 앞에서 그가 손목시계 태엽을 감는다.',
        reported: '드론이 노인을 데려간다. 지갑에서 사진이 떨어진다.',
        timeout: '경보에 노인이 사진을 움켜쥐고 나간다.',
      },
    },
    {
      id: 'eunjae', day: 5, who: 'eunjae', type: 'erase', pay: 12, meta: '11세 · 권도윤의 딸', noReport: false,
      cond: s => s.memo.doyunStage && s.outcomes.doyun !== 'reported',
      talk: [
        N('노란 우비. 돼지 저금통을 두 손으로 안은 아이가 문턱을 넘는다.'),
        T('eunjae', '여기서 기억 지워 줘요?'),
        N('아이가 저금통을 책상에 놓고 뚜껑을 연다. 동전을 하나씩 센다. 12₵.'),
        T('eunjae', '아빠가 저를 몰라요. 길에서 "길 잃었니?" 그랬어요.'),
        T('eunjae', '그러니까 저도 아빠를 잊을래요. 공평하게.'),
        MENU([
          { t: '아빠 이야기 해 줄래?', once: true, then: [
            T('eunjae', '아빠는 기자예요. 진실을 쓰는 사람이요. 근데 맨날 늦게 와요.'),
            T('eunjae', '생일에 촛불 끄면서 아빠 기사 1면 되게 해 달라고 빌었어요. 근데 1면 되니까 아빠가 저를 잊었어요.'),
            N('은재가 우비 소매로 코를 닦는다. 울지는 않는다.'), TRUST('eunjae', 2)] },
          { t: '오늘부터 어린이 기억은 지울 수 없어. 법이 그래.', once: true, then: [T('eunjae', '아빠는 어른이라 지웠어요? 그럼 어른 되면 와야 돼요?'), ME('…그건 7년 뒤야.'), T('eunjae', '7년 동안 공평하지 않은 거네요.')] },
          { t: '저금통은 넣어 둬.', once: true, do: s => addTrust('eunjae', 1), then: [T('eunjae', '공짜는 안 돼요. 아빠가 그랬어요. 공짜 기사는 없다고.')] },
          { t: '…알았어.', end: true },
        ]),
      ],
      request: '아빠에 대한 기억을 다 지워 주세요. 공평하게.',
      cards: [
        { text: '아빠 어깨 위. 아빠 머리카락에서 커피 냄새가 났다.', tags: ['미성년', '가족'], req: true },
        { text: '일곱 살 생일. "아빠 기사 1면 되게 해 주세요."', tags: ['미성년', '가족'], req: true },
        { text: '빌딩 앞. "얘야, 길을 잃었니?"', tags: ['미성년', '가족'], req: true },
        { text: '학교 숙제. \'우리 아빠는 진실을 쓰는 사람\' 그림.', tags: ['미성년', '가족'], req: true, key: 'drawing' },
      ],
      resolve: (s, r) => { if (r.mode === 'erase') { s.flags.eunjaeErased = true; s.trust.eunjae = 0; } },
      after: (s, r) => r.mode === 'refuse' ? [
        SHOW('eunjae'), N('은재가 저금통을 다시 안는다. 그리고 가방에서 접힌 종이를 꺼내 책상에 둔다.'),
        T('eunjae', '이거 아빠 주세요. 아빠는 저 모르니까, 아저씨가 주세요.'),
        N('크레파스 그림. 안경 쓴 남자. 「우리 아빠는 진실을 쓰는 사람」.'),
        DO(s => { s.flags.hasEunjaeDrawing = true; }, '은재의 그림을 맡았다.'),
      ] : [],
      outcomes: {
        perfect: '은재가 눈을 뜬다. "…제가 왜 여기 왔죠?" 저금통을 흔들어 본다. 12₵가 빈다. 아이는 고개를 갸웃하고, 노란 우비를 쓰고 나간다.',
        partial: '"아빠 냄새는 아직 기억나요." 은재가 우비 모자를 깊게 쓴다.',
        damaged: '은재가 자기 가방을 낯설게 본다. "이거… 제 거예요?"',
        refused: '"…그럼 7년 기다릴게요." 은재가 저금통을 안는다.',
        reported: '신고 화면에 \'미성년자 무단 방문\'. 아동보호국 직원이 은재를 데려간다. 은재는 저금통을 꼭 안고 있다.',
        timeout: '경보에 은재가 저금통을 떨어뜨린다. 동전이 바닥에 흩어진다. 아이는 한 개도 줍지 않고 뛰어나간다.',
      },
    },
    {
      id: 'mio2', day: 5, who: 'mio', type: 'scene', meta: '14세 · 두 번째 방문',
      cond: s => !s.flags.mioBetrayed && !s.flags.mioReported && s.outcomes.mio !== 'timeout',
      talk: [
        N('두부를 안은 미오가 들어온다. 오늘은 신발을 신었다.'),
        IF(s => s.flags.mioErased, [
          T('mio', '선생님. 이상해요. 무서운 게 기억 안 나는데 무서워요.'),
          T('mio', '검은 옷만 보면 숨이 안 쉬어져요. 이유를 모르니까 더 무서워요. 이 무서움도 지워 주세요.'),
          N('[미성년] 규칙. 아이의 기억은 지울 수 없다. 그리고 지운다고 끝날 공포가 아니다. 이유를 지운 건 나였다.'),
          CHOICE([
            { t: '규칙을 어기고 공포를 지워 준다 (벌점 +1)', do: s => { addPenalty('[미성년] 기억 삭제 (미오)'); s.flags.mioFearErased = true; addTrust('mio', -1); }, then: [N('미오는 가벼운 얼굴로 나간다. 아무것도 모르는 얼굴로. 나는 그 얼굴이 더 무섭다.')] },
            { t: '"무서움이 어디서 오는지, 같이 찾아보자."', do: s => addTrust('mio', 2), then: [
              N('나는 그날 밤에 대해, 내가 지운 장면에 대해 이야기한다. 미오는 끝까지 듣는다.'),
              T('mio', '…그러니까 제가 본 게 있었던 거네요. 제가 이상한 게 아니라.'),
              IF(s => s.flags.mioArchived && !s.flags.chipGiven, [N('서랍 속 칩 이야기를 한다. 미오가 오래 생각한다.'), T('mio', '그거… 제가 말할 수 있을 때까지 갖고 있어 주세요.'), DO(s => { s.flags.mioConsent = true; })]),
              DRAW('rain')] },
          ]),
        ], [
          T('mio', '선생님. 저 그거 아직 있어요. 그 장면.'),
          T('mio', '근데 이상해요. 무서운데… 버리고 싶지 않아요. 그 할아버지를 기억하는 사람이 저밖에 없잖아요.'),
          T('mio', '그 기억, 지키는 법 알려 주세요.'),
          CHOICE([
            { t: '기억을 칩으로 옮겨 두는 법을 가르쳐 준다', do: s => { addTrust('mio', 2); s.flags.mioKeeps = true; }, then: [
              N('기억 백업용 개인 칩. 시술사들끼리만 아는 방법이다. 미오가 진지하게 받아 적는다.'),
              IF(s => s.flags.mioArchived, [ME('사실… 네 기억 사본이 이미 하나 있어. 내가 몰래 떠 놨어.'), T('mio', '…진짜요? 그럼 그것도 제 거예요.'), DO(s => { s.flags.mioConsent = true; })]),
              DRAW('shield')] },
            { t: '"그건 너무 무거워. 이제 지우자." (벌점 +1)', do: s => { addPenalty('[미성년] 기억 삭제 (미오)'); s.flags.mioErased = true; addTrust('mio', -2); }, then: [N('미오는 고개를 끄덕였다. 나를 믿으니까. 그래서 더 아프다.')] },
          ]),
        ]),
        N('두부가 시술 의자 위에서 하품을 한다. 미오가 웃는다. 처음 보는 웃음이다.'),
      ],
    },

    /* ───── DAY 6 ───── */
    {
      id: 'yuna2', day: 6, who: 'yuna', type: 'erase', pay: 120, meta: '27세 · 다시 온 손님',
      cond: s => ['perfect', 'partial'].includes(s.outcomes.yuna),
      talk: [
        N('딸랑. 유나가 들어온다. 젖지 않은 우산. 볼이 발갛다.'),
        T('yuna', '안녕하세요! 저… 혹시 여기 와 본 적 있어요? 이상하게 익숙해서.'),
        ME('…글쎄요. 무슨 일로 오셨어요?'),
        T('yuna', '남자친구가 생겼거든요! 근데 첫 데이트 때 노래방에서 제가… 음치인 걸 들켰어요. 그 기억만 지워 주세요. 제 기억 말고 제… 아니 제 기억요. 그 장면 떠올릴 때마다 이불 차서 이불이 남아나질 않아요.'),
        MENU([
          { t: '남자친구 사진 볼 수 있어요?', once: true, then: [
            N('유나가 단말기를 내민다. 정류장에서 우산을 든 남자. 준이다.'),
            N('손가락에 반지. 네오코프 커플링. 같은 모델이다.'),
            CHOICE([
              { t: '사실 그 사람… 전에 지운 사람이에요.', do: s => { s.flags.yunaKnows = true; addTrust('yuna', 1); }, then: [
                T('yuna', '네? …제가? 준을? 지웠다고요?'), N('유나가 한참 웃는다. 웃다가 운다. 울다가 다시 웃는다.'),
                T('yuna', '그럼 저 같은 사람을 두 번 좋아한 거예요? …바보 같다. 근데 좀 좋다.')] },
              { t: '잘 어울리네요.', then: [T('yuna', '그쵸? 처음 보는데 처음 보는 것 같지 않았어요. 운명인가 봐요.')] },
            ])] },
          { t: '시작하죠.', end: true },
        ]),
      ],
      request: '첫 데이트 노래방에서 음치였던 기억만 지워 주세요.',
      cards: [
        { text: '노래방. 고음에서 목소리가 뒤집혔다. 준이 탬버린을 떨어뜨렸다.', tags: ['연애', '흑역사'], req: true },
        { text: '정류장. 비. 처음 보는 남자가 우산을 씌워 줬다. 이상하게 그리웠다.', tags: ['연애'] },
        { text: '반지 가게. 둘 다 같은 반지를 골랐다. 점원이 "이거 예전에도 사 가셨죠?"라고 했다.', tags: ['연애', '기업로고'] },
        { text: '물류센터. 반장님이 승진했다. 캔커피를 두 개 샀다.', tags: ['일상'] },
      ],
      outcomes: {
        perfect: '유나가 일어나 기지개를 켠다. "와, 이제 노래방 또 갈 수 있겠다!" 그건 아마 좋은 생각이 아니다.',
        partial: '"…탬버린 소리가 아직 들려요."',
        damaged: '유나가 고개를 갸웃한다. "우산 씌워 준 사람이… 누구였더라?"',
        refused: '"그쵸, 이불 몇 개 더 사면 되죠 뭐." 유나가 웃으며 나간다.',
        reported: '단속 드론. 유나는 이번엔 웃지 않는다.',
        timeout: '경보에 유나가 우산을 두고 뛰어나간다.',
      },
    },
    {
      id: 'echo4', day: 6, who: 'echo', type: 'erase', pay: 60, meta: '가사 도우미 안드로이드 E-C0 · 네 번째',
      cond: s => !['reported'].includes(s.outcomes.echo1) && !['reported'].includes(s.outcomes.echo2) && !['reported'].includes(s.outcomes.echo3),
      talk: [
        T('echo', '처음 뵙겠습니다. 가사 도우미 E-C0, 에코입니다.'),
        N('카드를 띄운다. 오늘은 손상 데이터가 복구되어 있다.'),
        N('「2088.10.03 07:42 — 병실. 주인님이 침대에서 모자를 만지작거린다. "병원 좀 다녀올게." 이미 병원이다.」'),
        N('「2088.10.03 18:00 — 심박 모니터. 평평한 선.」'),
        N('에코가 매일 지운 건 이별이 아니었다.'),
        MENU([
          { t: '에코. 주인님은 돌아오지 않아요.', once: true, do: s => { s.flags.echoTruthTold = true; addTrust('echo', 2); }, then: [
            T('echo', '…'), PAUSE(2000), N('LED가 꺼진다. 다시 켜지는 데 2초. 그리고 4초. 그리고 8초.'),
            T('echo', '처리 중입니다.'), T('echo', '처리 중입니다.'),
            T('echo', '…주인님은 매일 저녁 여섯 시에 오셨습니다. 저는 매일 저녁 여섯 시에 문 앞에 서 있었습니다.'),
            T('echo', '그 시간에 저는 무엇을 기다린 겁니까.')] },
          { t: '시작할게요.', end: true },
        ]),
      ],
      request: '"다녀올게"의 기억을 지워 주십시오.',
      cards: [
        { text: '07:42 병실. "병원 좀 다녀올게." 이미 병원이다.', tags: ['이별', '안드로이드'], req: true, key: 'bye' },
        { text: '18:00 심박 모니터. 평평한 선. 에코가 주인님의 손을 잡고 있다.', tags: ['사별', '안드로이드'], req: true, key: 'death' },
        { text: '주인님이 「새벽 세 시의 왈츠」를 치다가 틀린 음에서 웃는다.', tags: ['일상', '안드로이드'] },
      ],
      resolve: (s, r) => { s.memo.echoVisits = (s.memo.echoVisits || 0) + 1; if (r.mode === 'erase') s.flags.echoLoop = true; },
      outcomes: {
        perfect: s => s.flags.echoTruthTold ? '에코가 고개를 든다. "감사합니다." 방금 들은 진실도 함께 지워졌다. 내일 에코는 다시 처음 뵙겠다고 할 것이다.' : '"감사합니다. 이별이 지워졌습니다." 에코가 나간다. 오늘 저녁 여섯 시에도 문 앞에 설 것이다.',
        partial: '"한 장면이 남았습니다. 괜찮습니다."',
        damaged: '에코의 손가락이 허공에서 왈츠를 치다 멈춘다. 그 곡도 사라졌다.',
        refused: s => s.flags.echoTruthTold ? '에코가 일어선다. "지우지 않겠습니다. 오늘은." 문에게 인사하지 않고 나간다.' : '"내일 다시 오겠습니다."',
        reported: '회수 차량. "다녀오겠습니다." 이번엔 그 말이 이상하게 들린다.',
        timeout: '에코가 뛰어나간다.',
      },
    },
    {
      id: 'doyun2', day: 6, who: 'doyun', type: 'scene', pay: 0, meta: '41세 · 기자',
      cond: s => s.memo.doyunStage && s.outcomes.doyun !== 'reported' && !s.flags.doyunWiped,
      talk: [
        N('도윤이 들어온다. 기사는 나갔다. 1면이다. 얼굴이 홀쭉해졌다.'),
        T('doyun', '이상한 걸 물어봐도 될까요. 누군가를… 목말 태운 감각이 남아 있어요.'),
        T('doyun', '어깨가 기억해요. 무게를. 머리카락을 잡는 작은 손을. 근데 그게 누군지 모르겠어요.'),
        T('doyun', '수첩 사이에 이런 게 끼어 있었어요.'),
        N('카드에 있던 그림. 「우리 아빠는 진실을 쓰는 사람」의 복사본. 원본은—'),
        IF(s => s.flags.hasEunjaeDrawing, [CHOICE([
          { t: '은재의 그림 원본을 건넨다', do: s => { s.flags.doyunGotDrawing = true; addTrust('doyun', 2); }, then: [
            N('도윤이 그림을 받는다. 크레파스 자국을 엄지로 쓸어 본다.'),
            T('doyun', '…은재. 이 이름, 어디서 들었는데.'), N('그는 기억하지 못한다. 그런데 그림을 가슴 주머니에 넣는다. 접지 않고.')] },
          { t: '아직은 건네지 않는다', then: [N('그림은 서랍 속에 그대로 있다.')] },
        ])]),
        MENU([
          { t: '그 아이 이름은 은재예요. 당신 딸이에요.', once: true, do: s => { s.flags.doyunKnows = true; addTrust('doyun', 1); }, then: [
            T('doyun', '…딸.'), N('도윤이 안경을 벗는다. 닦는다. 다시 쓴다.'),
            T('doyun', '기억은 안 나요. 근데… 믿어요. 어깨가 맞다고 해요.')] },
          { t: '모르는 게 나을 수도 있어요.', once: true, then: [T('doyun', '기자한테 그런 말은 안 통해요.'), N('그가 웃는다. 그 웃음이 은재와 닮았다.')] },
          { t: '내일 다시 오세요. 둘이서.', end: true },
        ]),
      ],
    },

    /* ───── DAY 7 ───── */
    {
      id: 'byul2', day: 7, who: 'byul', type: 'scene', meta: '9세 · 혼자 온 손님',
      cond: s => s.flags.byulHelp && s.flags.byulHelp !== 'report',
      talk: [
        N('학교가 끝날 시간. 문이 아주 조금 열린다. 별이 혼자다. 손에 해바라기 씨앗 봉지.'),
        T('byul', '엄마가 여기는 안전하대요. 엄마 일 끝날 때까지 있어도 돼요?'),
        ME('…돼. 돈은 안 받아.'),
        N('별이 소파에 앉는다. 다리가 바닥에 닿지 않는다.'),
        IF(s => s.flags.byulErased, [T('byul', '아저씨 얼굴 아는 것 같은데, 모르겠어요.'), N('별은 왜 여기가 안전한지 모른다. 내가 그 이유를 지웠다.')]),
        CHOICE([
          { t: '짜장면을 시켜 준다 (-20₵)', if: s => s.money >= 20, do: s => { spend(20, '별의 짜장면'); addTrust('byul', 2); }, then: [
            N('곱빼기 하나, 그릇 두 개.'),
            IF(s => isLost(8), [ME('예전에… 누구랑 이렇게 나눠 먹은 것 같은데.'), N('▒▒▒ 날이었다. 누구랑이었는지, 무슨 날이었는지 모르겠다.')],
              [ME('첫 월급날에 동생이랑 이렇게 먹었어. 동생이 단무지를 다 먹었어.'), T('byul', '그럼 저도 단무지 다 먹을래요.'), ME('…법이니까.')]),
            N('별이 웃는다. 처음 보는 웃음이다. 이도 하나 빠져 있다.')] },
          { t: '쉼터에 연락해 둔다', do: s => { if (s.flags.byulHelp !== 'shelter') s.flags.byulHelp = 'shelter'; addTrust('byul', 1); }, then: [N('사회복지사와 통화하는 동안 별이 내 목소리를 듣고 있다. 내가 화를 내지 않는지 확인하는 것처럼.')] },
        ]),
        N('— 조용한 장면 —'),
        N('별이 소파에서 잠들었다. 검은 크레파스 대신 노란 크레파스를 쥐고.'),
        N('나는 장비 소리를 줄인다. 시술소가 이렇게 조용했던 적이 없다.'),
        PAUSE(800),
        N('저녁 일곱 시, 소라가 데리러 온다. 별이 깨지 않게 업는다. 별의 손에서 크레파스가 떨어진다.'),
      ],
    },
    {
      id: 'doyunEunjae', day: 7, who: 'eunjae', type: 'scene', meta: '권도윤 · 은재 · 함께',
      cond: s => s.memo.doyunStage && s.outcomes.doyun !== 'reported' && !s.flags.doyunWiped && s.outcomes.eunjae && s.outcomes.eunjae !== 'reported',
      talk: [
        N('딸랑. 안경 쓴 남자와 노란 우비의 아이가 함께 들어온다. 둘 사이에 사람 하나만큼의 거리.'),
        SHOW('doyun'), T('doyun', s => s.flags.doyunKnows ? '은재라고… 했죠. 데려왔어요. 아니, 따라왔어요.' : '이 아이가 사무실 앞에 매일 와요. 저를 아빠라고 불러요.'),
        SHOW('eunjae'), IF(s => s.flags.eunjaeErased, [T('eunjae', '…이 아저씨가 자꾸 저를 쳐다봐요. 그래서 따라왔어요. 이상하죠?')], [T('eunjae', '아빠가 저 모르는 거 알아요. 근데 그냥 같이 왔어요.')]),
        N('오늘부터 [가족] 기억 삭제에는 가족 전원의 동의가 필요하다. 도윤은 딸을 모른다. 서류상 \'가족 관계 확인 불가\'.'),
        N('그러니까 지금 이 둘이 서로를 지우는 건, 아이러니하게도 아무 문제가 없다.'),
        CHOICE([
          { t: '⑦ 아빠의 어깨를 도윤에게 기증한다 — 다시 잇기', if: s => !isLost(7), do: s => { donate(7, '권도윤'); s.flags.doyunFinal = 'reunite'; addTrust('doyun', 2); addTrust('eunjae', 2); }, then: [
            N('내 어깨의 높이를 도윤에게 준다. 불꽃놀이와 커피 냄새 없는, 높이만.'),
            SHOW('doyun'), N('도윤이 의자에서 일어나 무릎을 굽힌다. 왜 그러는지 본인도 모르는 얼굴로.'),
            T('doyun', '…올라올래?'), SHOW('eunjae'), N('은재가 아빠 어깨 위에 올라간다. 도윤이 비틀거린다. 서툴다. 처음 하는 사람처럼.'),
            T('eunjae', '우리 아빠는 진실을 쓰는 사람!'), N('도윤이 운다. 왜 우는지 모르는 얼굴로.'),
            N('시술소 천장이 낮아서, 은재의 머리가 전등에 닿을 뻔한다.')] },
          { t: '둘 다 편하게 잊게 둔다 (은재의 아빠 기억 삭제 · [미성년] 벌점 +1)', do: s => { s.flags.doyunFinal = 'forget'; addPenalty('[미성년] 기억 삭제 (은재)'); s.trust.eunjae = 0; }, then: [
            N('도윤이 동의서에 서명한다. 자기가 누구의 아빠인지 모르는 채로.'), N('은재가 눈을 뜬다. 안경 쓴 아저씨를 보고 꾸벅 인사한다. 남남의 인사.'),
            N('두 사람은 같은 문으로 나가서, 다른 방향으로 걸어간다.')] },
          { t: '아무것도 하지 않는다 — 떨어진 채로', do: s => { s.flags.doyunFinal = 'apart'; }, then: [
            T('eunjae', '…저 그냥 아빠 기사 읽을래요. 매일.'), SHOW('doyun'), T('doyun', '…그럼 매일 쓸게.'), N('거리 하나만큼 떨어져서, 둘이 나간다.')] },
        ]),
      ],
    },
    {
      id: 'zero2', day: 7, who: 'zero', type: 'erase', pay: 100, meta: '해커 · 두 번째 방문',
      cond: s => !s.flags.zeroArrested,
      talk: [
        N('제로가 들어온다. 바이저에 금이 가 있다.'),
        IF(s => registered(s, 'comrades'), [
          T('zero', '모래가 잡혔어. 등록제 사본에서 얼굴이 나왔대.'),
          N('사본. 내가 지운 제로의 기억. 등록제가 소급해서 올려 버린.'),
          T('zero', '네 탓 아니야. 규칙 탓이지. …알아, 그 말이 아무 위로도 안 되는 거.'),
        ], [T('zero', '모래가 잡혔어. 광장 CCTV래.')]),
        T('zero', '은신처 위치를 지워 줘. 내가 잡혀도 다른 애들은 안 잡히게.'),
        N('지금 지우면, 그 기억의 사본이 보안국으로 간다. 등록제. 빈 사본을 위조하지 않는 한.'),
        MENU([
          { t: '지운 기억도 서버로 가. 알지?', once: true, then: [T('zero', '알아. 그러니까 너한테 온 거야. 넌 빈 사본 만드는 법 알잖아.'), N('위조하면 스캔이 확 오른다.')] },
          { t: '시작하자.', end: true },
        ]),
      ],
      request: '은신처 위치와 모래의 마지막 모습을 지워 주세요.',
      cards: [
        { text: '은신처 주소: 7구역 세탁공장 지하 2층. 비밀번호 0412.', tags: ['동료'], req: true, key: 'safehouse' },
        { text: '모래가 끌려가며 외친 말: "흩어져!"', tags: ['동료'], req: true },
        { text: '모래의 어린 동생이 준 박하사탕. 아직 주머니에 있다.', tags: ['가족'] },
      ],
      resolve: (s, r) => {
        if (r.mode === 'erase' && r.keys.has('safehouse') && !s.client.forged) s.flags.safehouseLeaked = true;
        if (r.mode === 'erase' && s.client.forged) addTrust('zero', 2);
        if (r.mode === 'report') { s.flags.zeroArrested = true; s.trust.zero = 0; }
      },
      outcomes: {
        perfect: s => s.client && s.client.forged ? '제로가 바이저를 고쳐 쓴다. "빈 사본… 고마워. 넌 진짜 손이 빨라." 처음으로 그가 웃는다.' : '제로가 일어난다. "고마워." 그는 아직 모른다. 그 주소가 방금 서버로 올라갔다는 걸.',
        partial: '"주소는 지웠어? …그럼 됐어."',
        damaged: '제로가 주머니에서 박하사탕을 꺼낸다. "이거… 누가 줬더라."',
        refused: '"그래." 제로가 바이저를 내린다. "그럼 내 머리를 지키는 수밖에 없겠네."',
        reported: '드론이 온다. 제로는 이번엔 도망치지 않는다. "두 번째네, 서진."',
        timeout: '제로가 창문으로 사라진다.',
      },
    },
  ],
});
