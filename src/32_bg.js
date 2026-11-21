
/* --- 배경 (160x90 도트, 정적 레이어는 캐시 + 애니메이션 레이어) --- */
const BW = 160, BH = 90;
const FONT3 = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', G: '011100101101011',
  H: '101101111101101', I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', Y: '101101010010010',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 4: '101101111001001', 7: '111001010010010', 3: '110001010001110', 5: '111100110001110', 6: '011100110101010', 8: '010101010101010', 9: '010101011001110', ' ': '000000000000000', '-': '000000111000000' };
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function ptext(c, str, x, y, col, vertical) {
  c.fillStyle = col;
  [...str].forEach((ch, n) => { const g = FONT3[ch] || FONT3[' ']; for (let i = 0; i < 15; i++) if (g[i] === '1') c.fillRect(vertical ? x + (i % 3) : x + n * 4 + (i % 3), vertical ? y + n * 6 + ((i / 3) | 0) : y + ((i / 3) | 0), 1, 1); });
}
function seeded(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function skyBands(c, top, bottom, y0, y1) {
  const steps = 6;
  for (let i = 0; i < steps; i++) { const t = i / (steps - 1); R(c, 0, y0 + (y1 - y0) * i / steps, BW, (y1 - y0) / steps + 1, mix(top, bottom, t)); }
}
function mix(a, b, t) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t); return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join(''); }
function skyline(c, rnd, y, color, lightCol, density) {
  let x = 0;
  while (x < BW) { const w = 6 + rnd() * 14 | 0, h = 10 + rnd() * 30 | 0; R(c, x, y - h, w, h + 40, color);
    for (let wy = y - h + 2; wy < y + 30; wy += 3) for (let wx = x + 1; wx < x + w - 1; wx += 2) if (rnd() < density) R(c, wx, wy, 1, 1, lightCol[(rnd() * lightCol.length) | 0]);
    x += w + (rnd() * 3 | 0); }
}
function neonBox(c, x, y, w, h, col) { c.globalAlpha = 0.18; R(c, x - 2, y - 2, w + 4, h + 4, col); c.globalAlpha = 1; R(c, x, y, w, 1, col); R(c, x, y + h - 1, w, 1, col); R(c, x, y, 1, h, col); R(c, x + w - 1, y, 1, h, col); }
function rain(c, t, rnd, count, col, area) {
  c.fillStyle = col;
  const [ax, ay, aw, ah] = area || [0, 0, BW, BH];
  for (let i = 0; i < count; i++) { const sx = (i * 37.7 + i * i * 0.13) % aw, sp = 1.6 + (i % 5) * 0.35; const y = (i * 13.3 + t * sp * 18) % (ah + 6) - 4; const x = (sx - y * 0.25 + aw) % aw; c.fillRect(ax + x | 0, ay + y | 0, 1, 2 + (i % 2)); }
}
function eeg(c, x, y, w, h, t, col, speed = 1) {
  c.fillStyle = col;
  for (let i = 0; i < w; i++) { const p = (i + t * 20 * speed) * 0.35; let v = Math.sin(p) * h * 0.25; if (((i + (t * 20 * speed | 0)) % 28) < 2) v -= h * 0.4; c.fillRect(x + i, y + h / 2 + v | 0, 1, 1); }
}

const BACKGROUNDS = {
  alley: {
    base(c) {
      const rnd = seeded(7);
      skyBands(c, '#07061a', '#2b1040', 0, 50);
      skyline(c, rnd, 44, '#110d22', ['#3a2a60', '#ffd23f', '#00f0ff'], 0.18);
      R(c, 64, 18, 32, 11, '#2a0a30'); neonBox(c, 64, 18, 32, 11, '#ff2bd6'); ptext(c, 'AMATECH', 66, 21, '#ff9ae8');
      // 왼쪽 벽
      R(c, 0, 0, 44, 90, '#171221');
      for (let y = 2; y < 80; y += 4) for (let x = (y / 4) % 2 ? 0 : 4; x < 44; x += 8) R(c, x, y, 7, 1, '#1f1830');
      R(c, 30, 14, 9, 36, '#081016'); neonBox(c, 30, 14, 9, 36, '#00f0ff'); ptext(c, 'LETHE', 33, 18, '#00f0ff', true);
      R(c, 4, 52, 22, 28, '#0d0a16'); R(c, 6, 54, 18, 24, '#1a2a30'); R(c, 6, 54, 18, 2, '#00f0ff');
      R(c, 12, 20, 12, 8, '#2a2a3a'); R(c, 13, 21, 10, 6, '#3a3a4e'); for (let i = 0; i < 4; i++) R(c, 14 + i * 2, 22, 1, 4, '#22222e');
      // 오른쪽 벽
      R(c, 118, 0, 42, 90, '#1a1222');
      for (let y = 2; y < 80; y += 4) for (let x = (y / 4) % 2 ? 118 : 122; x < 160; x += 8) R(c, x, y, 7, 1, '#22182e');
      R(c, 124, 10, 22, 10, '#200818'); neonBox(c, 124, 10, 22, 10, '#ff2bd6'); ptext(c, 'BAR', 129, 13, '#ff2bd6');
      R(c, 130, 40, 20, 40, '#0c0810'); R(c, 132, 42, 16, 36, '#2a1a10'); R(c, 132, 42, 16, 1, '#ffb35c');
      for (let y = 0; y < 90; y += 1) R(c, 120, y, 2, 1, y % 6 ? '#2e2a38' : '#3e3a4a');
      // 전선
      for (let x = 44; x < 118; x++) { R(c, x, 4 + Math.sin((x - 44) / 74 * Math.PI) * 8, 1, 1, '#05040a'); R(c, x, 10 + Math.sin((x - 44) / 74 * Math.PI) * 6, 1, 1, '#05040a'); }
      // 바닥 + 물웅덩이
      R(c, 0, 76, 160, 14, '#0b0a14');
      for (let y = 77; y < 90; y += 2) for (let x = 0; x < 160; x += 1) if (rnd() < 0.06) R(c, x, y, 3, 1, ['#00f0ff', '#ff2bd6', '#2a2440'][(rnd() * 3) | 0]);
    },
    anim(c, t) {
      if (Math.sin(t * 7) > 0.92) { R(c, 30, 14, 9, 36, '#081016'); ptext(c, 'LETHE', 33, 18, '#0a4a50', true); }
      rain(c, t, null, 90, 'rgba(160,210,255,.45)');
    },
  },
  clinic: {
    base(c) {
      R(c, 0, 0, 160, 90, '#0d1620');
      for (let x = 0; x < 160; x += 12) R(c, x, 0, 1, 72, '#122230');
      // 창문
      R(c, 112, 10, 40, 44, '#05070e'); const rnd = seeded(3); skyline(c, rnd, 50, '#0a1020', ['#00f0ff', '#ff2bd6', '#ffd23f'], 0.25);
      R(c, 0, 0, 112, 72, '#0d1620'); for (let x = 0; x < 112; x += 12) R(c, x, 0, 1, 72, '#122230');
      R(c, 152, 0, 8, 72, '#0d1620'); R(c, 112, 54, 40, 18, '#0d1620');
      neonBox(c, 111, 9, 42, 46, '#2a4050'); R(c, 131, 10, 1, 44, '#2a4050');
      ptext(c, '24H', 116, 14, '#ff2bd6');
      R(c, 0, 72, 160, 18, '#090f15');
      for (let x = 0; x < 160; x += 10) for (let y = 74; y < 90; y += 5) R(c, x + ((y / 5) % 2) * 5, y, 5, 1, '#101c26');
      // 모니터
      [[8, 14], [36, 14]].forEach(([x, y]) => { R(c, x, y, 24, 18, '#05090c'); neonBox(c, x, y, 24, 18, '#1d5560'); R(c, x + 10, y + 18, 4, 6, '#1a2630'); });
      // 선반 + 칩
      R(c, 6, 48, 50, 2, '#1d2a36'); for (let i = 0; i < 12; i++) R(c, 8 + i * 4, 44, 2, 4, ['#00f0ff', '#ff2bd6', '#ffd23f', '#39ff9f'][i % 4]);
      // 시술 의자 + 헤드기어
      R(c, 62, 50, 36, 22, '#1a2a38'); R(c, 66, 30, 28, 24, '#16242f'); R(c, 60, 66, 40, 6, '#122030');
      R(c, 70, 18, 20, 4, '#2a3a4a'); R(c, 68, 20, 24, 2, '#00f0ff');
      for (let i = 0; i < 6; i++) R(c, 64 + i * 6, 0, 1, 18 + (i % 3) * 3, '#0a0f14');
      // 천장 조명
      R(c, 20, 0, 40, 2, '#2a4050');
    },
    anim(c, t) {
      eeg(c, 9, 16, 22, 14, t, '#00f0ff'); eeg(c, 37, 16, 22, 14, t * 0.7, '#ff2bd6', 1.4);
      rain(c, t, null, 30, 'rgba(160,210,255,.5)', [112, 10, 40, 44]);
      if ((t * 2 | 0) % 2) R(c, 96, 60, 2, 2, '#39ff9f'); else R(c, 96, 60, 2, 2, '#0b3a20');
      if (Math.sin(t * 11) > 0.95) { c.globalAlpha = 0.12; R(c, 0, 0, 160, 90, '#00f0ff'); c.globalAlpha = 1; }
    },
  },
  hospital: {
    base(c) {
      R(c, 0, 0, 160, 90, '#16232e');
      for (let y = 0; y < 60; y += 6) R(c, 0, y, 160, 1, '#1a2a36');
      R(c, 98, 8, 40, 36, '#06080f'); const rnd = seeded(11); skyline(c, rnd, 40, '#0c1220', ['#ffd23f', '#00f0ff'], 0.2);
            R(c, 22, 0, 76, 60, '#16232e'); for (let y = 0; y < 60; y += 6) R(c, 22, y, 76, 1, '#1a2a36'); R(c, 138, 0, 22, 60, '#16232e');
      R(c, 98, 44, 40, 16, '#16232e'); neonBox(c, 97, 7, 42, 38, '#3a5a6a');
      R(c, 0, 0, 22, 90, '#223a48'); for (let x = 2; x < 22; x += 4) R(c, x, 0, 1, 90, '#1a2e3a');
      // 침대
      R(c, 0, 64, 160, 26, '#0e171e'); R(c, 18, 60, 124, 14, '#c8d8e0'); R(c, 18, 70, 124, 4, '#9fb4c0'); R(c, 18, 74, 124, 16, '#3a5060');
      // 생명유지 장치
      R(c, 140, 26, 18, 44, '#22303a'); R(c, 142, 28, 14, 10, '#03100a'); R(c, 143, 44, 3, 3, '#ffd23f'); R(c, 148, 44, 3, 3, '#00f0ff');
      for (let y = 26; y > 0; y -= 2) R(c, 149, y, 1, 1, '#5a7080');
      // 수액
      R(c, 28, 10, 1, 52, '#7a8a9a'); R(c, 24, 10, 8, 1, '#7a8a9a'); R(c, 25, 12, 6, 10, '#b8e0ff'); R(c, 26, 18, 4, 4, '#8ac0e8');
    },
    anim(c, t, opts) {
      eeg(c, 142, 28, 14, 10, t, opts && opts.critical ? '#ff3b4e' : '#39ff9f', 0.8);
      rain(c, t, null, 24, 'rgba(160,210,255,.45)', [98, 8, 40, 36]);
      if ((t * 1.5 | 0) % 2) R(c, 143, 50, 2, 2, opts && opts.critical ? '#ff3b4e' : '#39ff9f');
    },
  },
  bar: {
    base(c) {
      R(c, 0, 0, 160, 90, '#140b1c');
      for (let s = 0; s < 3; s++) { const y = 18 + s * 14; R(c, 8, y, 144, 2, '#2a1830');
        for (let x = 10; x < 150; x += 5) { const h = 6 + ((x * 7 + s * 13) % 5); R(c, x, y - h, 3, h, ['#5a1a50', '#1a4a5a', '#5a4a1a', '#2a5a2a'][(x + s) % 4]); R(c, x, y - h, 1, h, 'rgba(255,255,255,.18)'); } }
      neonBox(c, 4, 2, 152, 58, '#ff2bd6');
      R(c, 58, 4, 44, 9, '#1a0618'); ptext(c, 'BAR LETHE', 61, 6, '#ff9ae8');
      R(c, 118, 64, 30, 0, '#000');
      // 홀로 TV
      R(c, 122, 22, 30, 18, '#061418'); neonBox(c, 122, 22, 30, 18, '#00f0ff');
      // 카운터
      R(c, 0, 66, 160, 24, '#2a1620'); R(c, 0, 66, 160, 2, '#ff2bd6'); R(c, 0, 68, 160, 1, '#5a2a40');
      for (let x = 6; x < 160; x += 22) { R(c, x, 60, 4, 6, '#c8e8ff'); R(c, x + 1, 62, 2, 3, '#ffb35c'); }
      // 조명
      [30, 80, 130].forEach(x => { R(c, x, 0, 1, 8, '#000'); R(c, x - 3, 8, 7, 3, '#3a2a10'); });
    },
    anim(c, t) {
      [30, 80, 130].forEach((x, i) => { const on = Math.sin(t * 3 + i * 2) > -0.85; c.globalAlpha = on ? 0.13 : 0.05; c.fillStyle = '#ffb35c'; c.beginPath(); c.moveTo(x - 3, 11); c.lineTo(x + 4, 11); c.lineTo(x + 16, 66); c.lineTo(x - 15, 66); c.fill(); c.globalAlpha = 1; R(c, x - 2, 11, 5, 1, on ? '#ffd28a' : '#5a4a20'); });
      const off = (t * 8) % 60; for (let i = 0; i < 6; i++) R(c, 124 + ((i * 10 - off + 60) % 26), 36, 4, 1, '#00f0ff');
      R(c, 125, 25, 10, 6, (t | 0) % 2 ? '#ff2bd6' : '#7a1a6a'); R(c, 137, 25, 12, 2, '#3a8a9a'); R(c, 137, 29, 9, 2, '#3a8a9a');
    },
  },
  room: {
    base(c) {
      R(c, 0, 0, 160, 90, '#120e1c');
      for (let y = 2; y < 64; y += 6) for (let x = (y / 6) % 2 ? 0 : 3; x < 160; x += 6) R(c, x, y, 1, 1, '#1c1628');
      R(c, 10, 10, 50, 40, '#05040c'); const rnd = seeded(23); skyline(c, rnd, 48, '#0c0a18', ['#ff2bd6', '#00f0ff', '#ffd23f'], 0.22);
      R(c, 60, 0, 100, 64, '#120e1c'); for (let y = 2; y < 64; y += 6) for (let x = 60 + ((y / 6) % 2 ? 0 : 3); x < 160; x += 6) R(c, x, y, 1, 1, '#1c1628');
      R(c, 0, 0, 10, 64, '#120e1c'); R(c, 10, 50, 50, 14, '#120e1c'); neonBox(c, 9, 9, 52, 42, '#3a2a50'); R(c, 34, 10, 1, 40, '#3a2a50');
      R(c, 0, 64, 160, 26, '#0c0a12'); R(c, 6, 70, 70, 14, '#2a2438'); R(c, 6, 70, 70, 3, '#3a3450');
      // 책상 + 바이탈 모니터
      R(c, 100, 52, 56, 4, '#2a1e18'); R(c, 104, 56, 3, 30, '#1a1210'); R(c, 150, 56, 3, 30, '#1a1210');
      R(c, 114, 30, 32, 20, '#020806'); neonBox(c, 114, 30, 32, 20, '#1d5a40'); R(c, 128, 50, 4, 2, '#222');
      // 액자
      R(c, 78, 14, 14, 12, '#3a2a20'); R(c, 79, 15, 12, 10, '#8ab0c8'); R(c, 82, 18, 3, 5, '#f0c4a4'); R(c, 86, 19, 3, 4, '#f0c4a4'); R(c, 81, 17, 5, 2, '#2a2236'); R(c, 85, 18, 5, 2, '#3a2a3e');
      // 스탠드
      R(c, 102, 40, 6, 3, '#ffd28a'); R(c, 104, 43, 1, 9, '#5a4a3a');
    },
    anim(c, t, opts) {
      rain(c, t, null, 40, 'rgba(160,210,255,.45)', [10, 10, 50, 40]);
      const ax = ((t * 4) % 90) - 30; R(c, 10 + ax, 16, 22, 6, '#2a1430'); R(c, 12 + ax, 17, 18, 4, (t * 2 | 0) % 2 ? '#ff2bd6' : '#00f0ff'); R(c, 0, 0, 10, 64, '#120e1c'); R(c, 60, 10, 4, 40, '#120e1c'); neonBox(c, 9, 9, 52, 42, '#3a2a50');
      eeg(c, 115, 34, 30, 12, t, opts && opts.critical ? '#ff3b4e' : '#39ff9f', 0.8);
      if (opts && opts.photoGlitch) { for (let i = 0; i < 10; i++) R(c, 79 + Math.random() * 12, 15 + Math.random() * 10, 2, 1, ['#ff2bd6', '#00f0ff', '#000'][(Math.random() * 3) | 0]); }
      c.globalAlpha = 0.08; R(c, 90, 30, 30, 34, '#ffd28a'); c.globalAlpha = 1;
    },
  },
  rooftop: {
    base(c) {
      skyBands(c, '#090418', '#3a1238', 0, 64);
      R(c, 120, 10, 10, 10, '#5a4a70'); R(c, 121, 9, 8, 12, '#5a4a70'); R(c, 119, 11, 12, 8, '#5a4a70');
      const rnd = seeded(5); skyline(c, rnd, 60, '#100a20', ['#ffd23f', '#00f0ff', '#ff2bd6'], 0.2);
      R(c, 70, 6, 14, 58, '#0a0614'); R(c, 74, 0, 6, 8, '#0a0614');
      for (let i = 0; i < 5; i++) R(c, 74 + i, 14 - i, 6 - i * 2 + 0, 1, '#ff3b4e');
      R(c, 73, 14, 9, 1, '#ff3b4e'); R(c, 74, 13, 7, 1, '#ff3b4e'); R(c, 75, 12, 5, 1, '#ff3b4e'); R(c, 76, 11, 3, 1, '#ff3b4e'); R(c, 77, 10, 1, 1, '#ff3b4e');
      R(c, 0, 66, 160, 24, '#140e1c'); R(c, 0, 66, 160, 1, '#2a2238');
      for (let x = 0; x < 160; x += 8) R(c, x, 60, 1, 6, '#2a2238'); R(c, 0, 60, 160, 1, '#2a2238');
      R(c, 8, 40, 24, 26, '#1e1a26'); R(c, 6, 38, 28, 4, '#2a2434'); R(c, 12, 66, 3, 6, '#1e1a26'); R(c, 26, 66, 3, 6, '#1e1a26');
      R(c, 142, 20, 1, 46, '#3a3448'); R(c, 138, 30, 9, 1, '#3a3448'); R(c, 139, 40, 7, 1, '#3a3448');
    },
    anim(c, t, opts) {
      if ((t * 1.2 | 0) % 2) R(c, 141, 18, 3, 3, '#ff3b4e');
      const ax = 170 - ((t * 5) % 220); R(c, ax, 22, 34, 9, '#22122a'); R(c, ax + 3, 24, 28, 5, '#3a1a40'); ptext(c, 'LETHE', ax + 5, 24, (t * 2 | 0) % 2 ? '#ff2bd6' : '#00f0ff');
      if (opts && opts.dark) { c.globalAlpha = 0.55; R(c, 0, 20, 160, 46, '#05030a'); c.globalAlpha = 1; }
      if (opts && opts.fire) for (let i = 0; i < 18; i++) { const x = (i * 23 + t * 3) % 160, y = 62 - ((t * 12 + i * 7) % 30); R(c, x, y, 1, 1, ['#ffd23f', '#ff8a3a', '#ff3b4e'][i % 3]); }
      rain(c, t, null, 70, 'rgba(160,210,255,.4)');
    },
  },
};
BACKGROUNDS.street = BACKGROUNDS.alley;

const BG_CACHE = {};
function bgBase(name) {
  if (!BG_CACHE[name]) {
    const cv = document.createElement('canvas'); cv.width = BW; cv.height = BH;
    const c = cv.getContext('2d');
    (BACKGROUNDS[name] || BACKGROUNDS.alley).base(c);
    BG_CACHE[name] = cv;
  }
  return BG_CACHE[name];
}
function drawBackground(ctx, name, t, opts) {
  ctx.drawImage(bgBase(name), 0, 0);
  const b = BACKGROUNDS[name] || BACKGROUNDS.alley;
  if (b.anim) b.anim(ctx, t, opts);
}

/* --- 2막·3막 · 다이브 · 엔딩용 배경 --- */
Object.assign(BACKGROUNDS, {
  sea: {
    base(c) {
      skyBands(c, '#1a2448', '#e8a8b0', 0, 46);
      R(c, 96, 30, 14, 14, '#ffd8b0'); R(c, 94, 34, 18, 6, '#ffd8b0');
      for (let y = 46; y < 70; y++) R(c, 0, y, 160, 1, mix('#3a5a8a', '#6a9ac0', (y - 46) / 24));
      R(c, 0, 70, 160, 20, '#d8c098'); for (let x = 0; x < 160; x += 3) R(c, x, 72 + (x % 7), 1, 1, '#b8a078');
    },
    anim(c, t) {
      for (let i = 0; i < 6; i++) { const y = 50 + i * 3.4, off = (t * (6 + i) + i * 20) % 40; for (let x = -40; x < 160; x += 40) R(c, x + off, y, 18 - i, 1, 'rgba(255,240,230,.55)'); }
      const w = 66 + Math.sin(t * 1.3) * 3; R(c, 0, w, 160, 2, 'rgba(255,255,255,.65)');
      R(c, 102, 48, 4, 22, 'rgba(255,216,176,.25)');
    },
  },
  kitchen: {
    base(c) {
      R(c, 0, 0, 160, 90, '#2a2018'); for (let x = 0; x < 160; x += 8) for (let y = 0; y < 50; y += 8) R(c, x, y, 7, 7, '#33281e');
      R(c, 0, 50, 160, 4, '#5a4632'); R(c, 0, 54, 160, 36, '#3a2c20');
      R(c, 20, 14, 30, 22, '#0c1220'); neonBox(c, 19, 13, 32, 24, '#5a4632'); R(c, 34, 14, 1, 22, '#5a4632');
      R(c, 110, 30, 30, 20, '#4a3a2a'); R(c, 116, 26, 18, 6, '#7a6a5a'); R(c, 118, 22, 14, 4, '#8a7a6a');
      R(c, 70, 4, 1, 14, '#111'); R(c, 66, 18, 9, 4, '#ffd28a');
    },
    anim(c, t) { for (let i = 0; i < 5; i++) { const y = 20 - ((t * 6 + i * 4) % 18); R(c, 122 + Math.sin(t * 2 + i) * 3, y, 2, 2, 'rgba(255,255,255,.25)'); } c.globalAlpha = 0.07; R(c, 40, 22, 60, 68, '#ffd28a'); c.globalAlpha = 1; },
  },
  diner: {
    base(c) {
      R(c, 0, 0, 160, 90, '#3a1414'); for (let x = 0; x < 160; x += 20) R(c, x, 0, 10, 60, '#421818');
      R(c, 40, 8, 80, 14, '#2a0a0a'); neonBox(c, 40, 8, 80, 14, '#ff8a3a');
      R(c, 0, 60, 160, 30, '#2a1a12'); R(c, 30, 62, 100, 6, '#c8b090'); R(c, 60, 56, 40, 8, '#f0f0f0'); R(c, 66, 54, 28, 4, '#1a1208');
      R(c, 76, 52, 8, 2, '#ffe14a');
    },
    anim(c, t) { for (let i = 0; i < 4; i++) R(c, 70 + i * 6, 50 - ((t * 5 + i * 3) % 10), 1, 2, 'rgba(255,255,255,.35)'); },
  },
  harinRoom: {
    base(c) {
      R(c, 0, 0, 160, 90, '#2a2240'); for (let y = 3; y < 64; y += 7) for (let x = (y % 2) * 4; x < 160; x += 8) R(c, x, y, 2, 2, '#332a4c');
      R(c, 110, 10, 34, 30, '#0c0a1a'); neonBox(c, 109, 9, 36, 32, '#5a4a7a');
      R(c, 0, 64, 160, 26, '#1c1630'); R(c, 8, 58, 60, 16, '#d8c8e8'); R(c, 8, 56, 18, 6, '#f0e8f8');
      R(c, 82, 20, 16, 12, '#4a3a2a'); R(c, 83, 21, 14, 10, '#9ac0d8'); R(c, 86, 24, 3, 6, '#f0c4a4'); R(c, 91, 25, 3, 5, '#f0c4a4');
      ptext(c, 'HARIN', 40, 20, '#ff9ae8'); R(c, 118, 52, 14, 10, '#ffd23f'); R(c, 120, 54, 10, 6, '#c4961a');
    },
    anim(c, t) { R(c, 124, 50, 2, 2, (t * 2 | 0) % 2 ? '#ff3b4e' : '#5a1a20'); },
  },
  fireworks: {
    base(c) {
      skyBands(c, '#05061a', '#1a1440', 0, 70);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; R(c, 30 + Math.cos(a) * 18, 46 + Math.sin(a) * 18, 1, 1, '#ffd23f'); }
      R(c, 29, 46, 2, 30, '#3a3a5a'); R(c, 0, 76, 160, 14, '#0c0a18');
      for (let x = 60; x < 160; x += 12) R(c, x, 70, 6, 6, '#141030');
    },
    anim(c, t) {
      [[90, 24, '#ff2bd6'], [120, 34, '#00f0ff'], [70, 30, '#ffd23f']].forEach(([x, y, col], i) => {
        const p = ((t * 0.7 + i * 0.33) % 1); const r = p * 18;
        c.globalAlpha = 1 - p; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; R(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 1, 1, col); } c.globalAlpha = 1;
      });
    },
  },
  whiteRoom: {
    base(c) {
      R(c, 0, 0, 160, 90, '#e8eef4'); for (let x = 0; x < 160; x += 16) R(c, x, 0, 1, 70, '#d4dce6');
      R(c, 0, 70, 160, 20, '#c8d2de'); R(c, 60, 44, 40, 26, '#b8c4d2'); R(c, 66, 26, 28, 4, '#8a96a8'); R(c, 64, 28, 32, 2, '#00b4c8');
      R(c, 118, 30, 30, 22, '#1a2230'); R(c, 124, 40, 18, 6, '#ff3b4e'); ptext(c, '300', 125, 34, '#ff3b4e');
    },
    anim(c, t) { if ((t * 3 | 0) % 2) R(c, 128, 42, 10, 2, '#ffffff'); c.globalAlpha = 0.12 + Math.sin(t * 2) * 0.05; R(c, 0, 0, 160, 90, '#ffffff'); c.globalAlpha = 1; },
  },
  corridor: {
    base(c) {
      R(c, 0, 0, 160, 90, '#0a0a14');
      for (let i = 0; i < 8; i++) { const w = 160 - i * 18, h = 90 - i * 10; neonBox(c, (160 - w) / 2, (90 - h) / 2, w, h, i % 2 ? '#2a2a48' : '#3a2a50'); }
      R(c, 74, 38, 12, 16, '#e8eef4');
    },
    anim(c, t) { c.globalAlpha = 0.3 + Math.sin(t * 2) * 0.2; R(c, 74, 38, 12, 16, '#ffffff'); c.globalAlpha = 1; },
  },
  vault: {
    base(c) {
      R(c, 0, 0, 160, 90, '#0e0814');
      for (let s = 0; s < 6; s++) { const y = 10 + s * 12; R(c, 4, y + 8, 152, 1, '#2a1a30'); for (let x = 6; x < 154; x += 4) R(c, x, y + 3, 2, 5, ['#ff2bd6', '#00f0ff', '#ffd23f', '#39ff9f', '#5a4a7a'][(x * 3 + s * 7) % 5]); }
      R(c, 60, 6, 40, 9, '#1a0a1a'); neonBox(c, 60, 6, 40, 9, '#ffd23f'); ptext(c, '0729', 72, 8, '#ffd23f');
      R(c, 0, 80, 160, 10, '#08050c');
    },
    anim(c, t) { for (let i = 0; i < 10; i++) { const x = 6 + ((i * 37 + (t * 4 | 0) * 13) % 148) & ~3; R(c, x, 13 + (i % 6) * 12, 2, 5, '#ffffff'); } },
  },
  cemetery: {
    base(c) {
      skyBands(c, '#0a0a1a', '#3a3050', 0, 60); const rnd = seeded(41); skyline(c, rnd, 56, '#0e0c1a', ['#3a3060'], 0.05);
      R(c, 0, 60, 160, 30, '#141a18'); for (let i = 0; i < 9; i++) { const x = 8 + i * 18, h = 10 + (i % 3) * 3; R(c, x, 66 - h, 10, h, '#4a5058'); R(c, x + 2, 66 - h - 2, 6, 2, '#4a5058'); }
    },
    anim(c, t) { rain(c, t, null, 50, 'rgba(160,210,255,.35)'); },
  },
  visit: {
    base(c) {
      R(c, 0, 0, 160, 90, '#1c2228'); R(c, 0, 52, 160, 38, '#2a3238'); R(c, 0, 50, 160, 3, '#4a5660');
      R(c, 10, 6, 140, 44, 'rgba(160,200,220,.12)'); neonBox(c, 10, 6, 140, 44, '#5a6a78'); for (let x = 40; x < 150; x += 30) R(c, x, 6, 1, 44, '#5a6a78');
      R(c, 70, 24, 6, 12, '#2a2a30'); R(c, 100, 30, 10, 4, '#3a3a40');
    },
    anim(c, t) { c.globalAlpha = 0.06; R(c, 10, 6 + ((t * 10) % 44), 140, 2, '#ffffff'); c.globalAlpha = 1; },
  },
  static: { base(c) { R(c, 0, 0, 160, 90, '#202024'); }, anim() {} },
});

/* 공통 오버레이: static(노이즈 0~1), dream(몽환), tint */
const _drawBackground = drawBackground;
drawBackground = function (ctx, name, t, opts) {
  _drawBackground(ctx, name, t, opts);
  if (!opts) return;
  if (opts.dream) { ctx.globalAlpha = 0.18 + Math.sin(t) * 0.04; ctx.fillStyle = '#b48aff'; ctx.fillRect(0, 0, BW, BH); ctx.globalAlpha = 1; }
  if (opts.static || name === 'static') {
    const amt = name === 'static' ? 1 : opts.static;
    for (let i = 0; i < 1400 * amt; i++) { const v = (Math.random() * 120 + 60) | 0; ctx.fillStyle = `rgb(${v},${v},${v + 8})`; ctx.fillRect((Math.random() * BW) | 0, (Math.random() * BH) | 0, 2, 1); }
    if (Math.random() < 0.3) { ctx.fillStyle = 'rgba(255,43,214,.25)'; ctx.fillRect(0, (Math.random() * BH) | 0, BW, 2); }
  }
  if (opts.tint) { ctx.globalAlpha = 0.25; ctx.fillStyle = opts.tint; ctx.fillRect(0, 0, BW, BH); ctx.globalAlpha = 1; }
};
