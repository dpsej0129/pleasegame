
/* =====================================================================
   PIXEL ART ENGINE — 도트 초상(32x36)과 배경(160x90)을 코드로 그린다
   ===================================================================== */
const PW = 32, PH = 36;
const DEFAULT_PAL = {
  k: '#0b0912', s: '#f0c4a4', S: '#c48a70', h: '#2a2236', H: '#17121f', l: '#4a3f62',
  e: '#1a1020', i: '#3b4e78', w: '#ffffff', m: '#9c4652', b: '#e8848a', B: '#1d1726',
  c: '#2c3a56', C: '#1b2438', d: '#d6dcea', x: '#ff2bd6', y: '#00f0ff', g: '#8d97ab',
  r: '#a2303c', v: '#00f0ff', o: '#ff3b4e', t: '#ffe9a8',
};

/* --- 머리 스타일: back(뒷머리, 얼굴보다 먼저) / front(앞머리, 얼굴 위에) --- */
function ell(x, y, cx, cy, rx, ry) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; }
function fillWhere(P, fn, k) { for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (fn(x, y)) P.set(x, y, typeof k === 'function' ? k(x, y) : k); }
const hairShade = P => (x, y) => (x > P.cx + 3 ? 'H' : (x < P.cx - 2 && (x + y) % 5 === 0 && y < P.ey - 2) ? 'l' : 'h');
function cap(P, hairline, grow = 1.3) {
  fillWhere(P, (x, y) => y <= hairline && ell(x, y, P.cx, P.cy - 0.6, P.rx + grow, P.ry + grow), hairShade(P));
}
function sideLocks(P, fromY, toY, w = 2) {
  for (let y = fromY; y <= toY; y++) {
    const half = P.halfAt(y);
    if (half <= 0) continue;
    for (let i = 0; i < w; i++) {
      P.set(Math.floor(P.cx - half) + i, y, 'h');
      P.set(Math.ceil(P.cx + half) - 1 - i, y, 'H');
    }
  }
}
const HAIR = {
  bob: {
    back: P => fillWhere(P, (x, y) => y >= P.cy - P.ry && y <= P.ey + 7 && ell(x, y, P.cx, P.cy + 1, P.rx + 2.4, P.ry + 2.2), hairShade(P)),
    front: P => { cap(P, P.ey - 3); sideLocks(P, P.ey - 3, P.ey + 6, 2);
      [P.cx - 4, P.cx - 1, P.cx + 2].forEach(x => P.set(Math.floor(x), P.ey - 2, 'h')); },
  },
  long: {
    back: P => fillWhere(P, (x, y) => y >= P.cy - P.ry && (ell(x, y, P.cx, P.cy, P.rx + 2.4, P.ry + 2) || (y > P.cy && y < 35 && Math.abs(x + 0.5 - P.cx) < P.rx + 2.2 + (y - P.cy) * 0.12)), hairShade(P)),
    front: P => { cap(P, P.ey - 4); sideLocks(P, P.ey - 4, P.ey + 8, 2);
      for (let y = P.ey - 4; y <= P.ey - 2; y++) { P.set(Math.floor(P.cx) - 2 - (y - P.ey + 4), y, 'h'); P.set(Math.ceil(P.cx) + 1 + (y - P.ey + 4), y, 'H'); }
      P.set(15, P.ey - 4, null); P.set(16, P.ey - 4, null); },
  },
  twin: {
    back: P => {
      fillWhere(P, (x, y) => ell(x, y, 6.5, P.ey + 4, 3.2, 8) || ell(x, y, 25.5, P.ey + 4, 3.2, 8), (x, y) => (x > 20 ? 'H' : 'h'));
    },
    front: P => { cap(P, P.ey - 3); sideLocks(P, P.ey - 3, P.ey + 3, 1);
      [[8, P.ey - 4], [9, P.ey - 4], [8, P.ey - 3], [23, P.ey - 4], [22, P.ey - 4], [23, P.ey - 3]].forEach(([x, y]) => P.set(x, y, 'x'));
      for (let x = 12; x <= 19; x += 3) P.set(x, P.ey - 2, 'h'); },
  },
  short: {
    front: P => { cap(P, P.ey - 4, 0.9); sideLocks(P, P.ey - 4, P.ey, 1);
      [11, 14, 17, 20].forEach(x => P.set(x, Math.floor(P.cy - P.ry) - 1, 'h')); },
  },
  slick: {
    front: P => { cap(P, P.ey - 5, 1.0); sideLocks(P, P.ey - 5, P.ey - 1, 1);
      for (let i = 0; i < 6; i++) P.set(11 + i * 2, Math.floor(P.cy - P.ry) + 1 + (i % 2), 'l'); },
  },
  hood: {
    back: P => fillWhere(P, (x, y) => y <= P.cy + P.ry + 3 && ell(x, y, P.cx, P.cy + 0.5, P.rx + 3.4, P.ry + 3.2), (x, y) => (x > P.cx + 4 ? 'C' : 'c')),
    front: P => { cap(P, P.ey - 3, 0.6);
      for (let x = 10; x <= 15; x++) P.set(x, P.ey - 2 + (x % 2), 'h');
      fillWhere(P, (x, y) => y < P.ey - 2 && ell(x, y, P.cx, P.cy + 0.5, P.rx + 3.4, P.ry + 3.2) && !ell(x, y, P.cx, P.cy + 0.5, P.rx + 1.6, P.ry + 1.6), (x) => (x > P.cx + 4 ? 'C' : 'c')); },
  },
  bald: {
    front: P => { sideLocks(P, P.ey - 3, P.ey + 1, 2);
      for (let x = 13; x <= 18; x += 2) P.set(x, Math.floor(P.cy - P.ry) + 1, 'h');
      for (let x = 13; x <= 18; x++) { if (x % 3) P.set(x, P.ey - 5, 'S'); if ((x + 1) % 3) P.set(x, P.ey - 4, 'S'); } },
  },
  bun: {
    back: P => fillWhere(P, (x, y) => ell(x, y, P.cx, P.cy - P.ry - 1.2, 3.2, 2.6), hairShade(P)),
    front: P => { cap(P, P.ey - 4); sideLocks(P, P.ey - 4, P.ey + 1, 1);
      fillWhere(P, (x, y) => y >= P.cy - P.ry - 1 && y <= P.cy - P.ry + 1 && Math.abs(x + 0.5 - P.cx) < 5, 'd');
      P.set(15, Math.floor(P.cy - P.ry), 'r'); P.set(16, Math.floor(P.cy - P.ry), 'r'); P.set(15, Math.floor(P.cy - P.ry) - 1, 'r'); P.set(15, Math.floor(P.cy - P.ry) + 1, 'r'); },
  },
  undercut: {
    front: P => { cap(P, P.ey - 4, 1.1);
      for (let y = P.ey - 4; y <= P.ey + 3; y++) for (let x = 16 + Math.max(0, y - P.ey + 1); x <= 22; x++) if (P.inHead(x, y) || y < P.ey) P.set(x, y, y >= P.ey + 1 ? 'x' : (x > 19 ? 'H' : 'h'));
      for (let y = P.ey - 5; y <= P.ey - 1; y++) { P.set(9, y, 'B'); P.set(10, y, 'B'); } },
  },
  messy: {
    front: P => { cap(P, P.ey - 3, 1.4); sideLocks(P, P.ey - 3, P.ey + 1, 1);
      const top = Math.floor(P.cy - P.ry) - 1;
      [[10, 1], [12, 2], [15, 1], [17, 2], [20, 1], [21, 0]].forEach(([x, d]) => { for (let i = 0; i < d; i++) P.set(x, top - i, 'h'); });
      [11, 13, 16, 18].forEach(x => P.set(x, P.ey - 2, 'h')); },
  },
  bowl: {
    front: P => { cap(P, P.ey - 3, 1.2); sideLocks(P, P.ey - 3, P.ey + 2, 2); },
  },
  pillow: { // 누워 있는 하린: 베개 위로 퍼진 긴 머리
    back: P => { fillWhere(P, (x, y) => y > P.cy - 5 && y < P.cy + 9 && Math.abs(x + 0.5 - P.cx) < 11.5, (x, y) => ((x + y) % 7 === 0 ? 'g' : 'd'));
      fillWhere(P, (x, y) => y >= P.cy - P.ry && (ell(x, y, P.cx, P.cy + 1, P.rx + 3.2, P.ry + 2.4) || (y > P.cy && y < 30 && Math.abs(x + 0.5 - P.cx) < P.rx + 4)), hairShade(P)); },
    front: P => { cap(P, P.ey - 3); sideLocks(P, P.ey - 3, P.ey + 7, 2); },
  },
};

/* --- 눈 / 입 --- */
function drawEyes(P, style) {
  const ey = P.ey, L = 12, R = 18;
  const pair = (fn) => { fn(L, 1); fn(R, -1); };
  switch (style) {
    case 'closed':
      pair(x => { P.set(x - 1, ey + 1, 'e'); P.set(x, ey + 1, 'e'); P.set(x + 1, ey + 1, 'e'); P.set(x + 2, ey + 1, 'e'); P.set(x, ey + 2, 'S'); });
      break;
    case 'narrow':
      pair(x => { P.set(x - 1, ey, 'S'); P.set(x, ey, 'S'); P.set(x + 1, ey, 'S'); P.set(x, ey + 1, 'e'); P.set(x + 1, ey + 1, 'e'); });
      break;
    case 'big':
      pair(x => { P.set(x, ey - 1, 'e'); P.set(x + 1, ey - 1, 'e'); P.set(x, ey, 'w'); P.set(x + 1, ey, 'i'); P.set(x, ey + 1, 'i'); P.set(x + 1, ey + 1, 'e'); P.set(x - 1, ey - 1, 'e'); });
      break;
    case 'tired':
      pair(x => { P.set(x - 1, ey, 'e'); P.set(x, ey, 'e'); P.set(x + 1, ey, 'e'); P.set(x, ey + 1, 'w'); P.set(x + 1, ey + 1, 'i'); P.set(x, ey + 2, 'S'); P.set(x + 1, ey + 2, 'S'); });
      break;
    case 'none': break;
    default: // normal
      pair(x => { P.set(x - 1, ey, 'e'); P.set(x, ey, 'e'); P.set(x + 1, ey, 'e'); P.set(x, ey + 1, 'w'); P.set(x + 1, ey + 1, 'i'); });
  }
  P.eyes = [];
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (['e', 'w', 'i'].includes(P.get(x, y)) && Math.abs(y - ey) <= 2) P.eyes.push([x, y]);
}
function drawBrows(P, style) {
  const y = P.ey - 2;
  const L = [11, 12, 13], R = [18, 19, 20];
  if (style === 'none') return;
  L.forEach((x, i) => P.set(x, y + (style === 'angry' ? (i === 2 ? 1 : 0) : style === 'sad' ? (i === 0 ? 1 : 0) : 0), 'B'));
  R.forEach((x, i) => P.set(x, y + (style === 'angry' ? (i === 0 ? 1 : 0) : style === 'sad' ? (i === 2 ? 1 : 0) : 0), 'B'));
}
function drawMouth(P, style) {
  if (style === 'none') { P.mouth = []; return; }
  const my = P.ey + 5;
  const pts = { neutral: [[15, my], [16, my]], smile: [[14, my], [15, my + 1], [16, my + 1], [17, my]],
    frown: [[14, my + 1], [15, my], [16, my], [17, my + 1]], wide: [[14, my], [15, my], [16, my], [17, my]],
    small: [[15, my]], smirk: [[15, my], [16, my], [17, my - 1]] }[style] || [[15, my], [16, my]];
  pts.forEach(([x, y]) => P.set(x, y, 'm'));
  P.mouth = pts;
}

/* --- 옷 --- */
const OUTFIT = {
  coat: P => { for (let y = 28; y < PH; y++) { const w = Math.max(0, 3 - (y - 28) * 0.5); for (let x = 16 - w; x < 16 + w; x++) P.set(Math.round(x), y, 'd'); P.set(Math.round(15 - w), y, 'C'); P.set(Math.round(16 + w), y, 'C'); }
    for (let y = 25; y <= 28; y++) { P.set(11, y, 'c'); P.set(12, y, 'c'); P.set(19, y, 'C'); P.set(20, y, 'C'); } },
  suit: P => { OUTFIT.coat(P); for (let y = 28; y < PH; y++) { P.set(15, y, 'x'); P.set(16, y, 'x'); } P.set(15, 28, 'r'); P.set(16, 28, 'r'); },
  hoodie: P => { [14, 17].forEach(x => { for (let y = 29; y <= 32; y++) P.set(x, y, 'd'); }); for (let x = 11; x <= 20; x++) P.set(x, 34, 'C'); },
  uniform: P => { for (let y = 27; y <= 31; y++) { const w = 7 - (y - 27); for (let x = 16 - w; x < 16 + w; x++) if (Math.abs(x + 0.5 - 16) > (31 - y) * 0.5 - 1) P.set(x, y, 'd'); }
    [[15, 31], [16, 31], [14, 32], [17, 32], [15, 32], [16, 32]].forEach(([x, y]) => P.set(x, y, 'x')); },
  vest: P => { for (let x = 4; x < 28; x++) if (P.get(x, 32)) P.set(x, 32, 'y'); for (let y = 28; y < 32; y++) { P.set(12, y, 'C'); P.set(19, y, 'C'); } for (let x = 14; x <= 17; x++) P.set(x, 27, 'd'); },
  gown: P => { for (let y = 28; y < PH; y++) for (let x = 0; x < PW; x++) if (P.get(x, y) === 'c' && (x * 3 + y * 5) % 9 === 0) P.set(x, y, 'd'); for (let x = 13; x <= 18; x++) P.set(x, 28, 'd'); },
  nurse: P => { for (let x = 13; x <= 18; x++) P.set(x, 28, 'd'); [[22, 31], [21, 31], [23, 31], [22, 30], [22, 32]].forEach(([x, y]) => P.set(x, y, 'r')); },
  cardigan: P => { for (let y = 28; y < PH; y++) { P.set(15, y, 'C'); } [29, 31, 33].forEach(y => P.set(16, y, 'd')); for (let x = 13; x <= 18; x++) P.set(x, 27, 'd'); },
  bartender: P => { for (let y = 27; y < PH; y++) { for (let x = 0; x < PW; x++) if (P.get(x, y) && Math.abs(x + 0.5 - 16) > 7 + (y - 27) * 0.6) P.set(x, y, 'd'); }
    [[14, 27], [15, 28], [16, 28], [17, 27], [14, 28], [17, 28]].forEach(([x, y]) => P.set(x, y, 'x')); for (let y = 29; y < PH; y++) P.set(15, y, 'C'); },
  parka: P => { for (let y = 26; y <= 28; y++) for (let x = 9; x <= 22; x++) if (P.get(x, y) === 'c' || P.get(x, y) === 'C') P.set(x, y, (x + y) % 2 ? 'd' : 'g');
    [[10, 31], [11, 31], [10, 32], [11, 32]].forEach(([x, y]) => P.set(x, y, 'y')); },
  tshirt: P => { [[16, 30], [15, 31], [16, 31], [17, 31], [16, 32], [14, 31], [18, 31]].forEach(([x, y]) => P.set(x, y, 'y')); for (let x = 13; x <= 18; x++) P.set(x, 27, 'C'); },
  blouse: P => { [[13, 27], [14, 28], [18, 27], [17, 28]].forEach(([x, y]) => P.set(x, y, 'd')); for (let y = 29; y < PH; y += 2) P.set(16, y, 'd'); },
  apron: P => { for (let y = 29; y < PH; y++) for (let x = 11; x <= 20; x++) if (P.get(x, y)) P.set(x, y, (x === 11 || x === 20) ? 'C' : 'd'); for (let x = 13; x <= 18; x++) P.set(x, 28, 'g'); },
  raincoat: P => { for (let y = 29; y < PH; y += 2) P.set(16, y, 'C'); [[14, 31], [17, 31]].forEach(([x, y]) => P.set(x, y, 'd')); },
  agent: P => { OUTFIT.coat(P); for (let y = 28; y < PH; y++) { P.set(15, y, 'k'); P.set(16, y, 'k'); } [[8, 30], [9, 30], [8, 31]].forEach(([x, y]) => P.set(x, y, 'r')); },
};

/* --- 액세서리 --- */
const ACC = {
  glasses: P => { const y = P.ey; [11, 17].forEach(x0 => { for (let x = x0; x <= x0 + 3; x++) { P.set(x, y - 1, 'g'); P.set(x, y + 2, 'g'); } P.set(x0, y, 'g'); P.set(x0, y + 1, 'g'); P.set(x0 + 3, y, 'g'); P.set(x0 + 3, y + 1, 'g'); }); P.set(15, y, 'g'); P.set(16, y, 'g'); },
  scar: P => { [[11, P.ey - 3], [12, P.ey - 2], [13, P.ey + 2], [13, P.ey + 3], [14, P.ey + 4]].forEach(([x, y]) => P.set(x, y, 'r')); },
  cig: P => { const y = P.ey + 5; [18, 19, 20].forEach(x => P.set(x, y, 'w')); P.set(21, y, 'o'); P.set(22, y - 2, 'g'); P.set(23, y - 4, 'g'); },
  stubble: P => { for (let x = 12; x <= 19; x++) for (let y = P.ey + 6; y <= P.ey + 7; y++) if ((P.get(x, y) === 's' || P.get(x, y) === 'S') && (x + y) % 2 === 0) P.set(x, y, 'S'); },
  visor: P => { for (let x = 10; x <= 21; x++) { P.set(x, P.ey, 'v'); P.set(x, P.ey + 1, x % 4 === 0 ? 'w' : 'v'); } P.set(9, P.ey, 'g'); P.set(22, P.ey, 'g'); },
  cyberEye: P => { const x = 18, y = P.ey; [[x - 1, y - 1], [x, y - 1], [x + 1, y - 1], [x + 2, y - 1], [x - 1, y + 2], [x + 2, y + 2], [x + 2, y], [x + 2, y + 1]].forEach(([a, b]) => P.set(a, b, 'g')); P.set(x, y, 'o'); P.set(x + 1, y, 'o'); P.set(x, y + 1, 'o'); P.set(x + 1, y + 1, 'w'); },
  earring: P => { const half = P.halfAt(P.ey + 3); P.set(Math.floor(P.cx - half) - 1, P.ey + 4, 'y'); P.set(Math.ceil(P.cx + half), P.ey + 4, 'x'); },
  tube: P => { const y = P.ey + 4; [11, 12, 13, 14, 17, 18, 19, 20].forEach(x => P.set(x, y + (x < 13 || x > 18 ? 1 : 0), 'g')); P.set(15, y - 1, 'g'); P.set(16, y - 1, 'g'); },
  tear: P => { P.set(12, P.ey + 2, 'y'); P.set(12, P.ey + 3, 'y'); },
  bandage: P => { [[19, P.ey + 3], [20, P.ey + 3], [19, P.ey + 4], [20, P.ey + 4]].forEach(([x, y]) => P.set(x, y, 't')); },
  blush: P => { [[11, P.ey + 3], [12, P.ey + 3], [19, P.ey + 3], [20, P.ey + 3]].forEach(([x, y]) => { if (P.get(x, y) === 's' || P.get(x, y) === 'S') P.set(x, y, 'b'); }); },
  wrinkles: P => { [[11, P.ey + 3], [20, P.ey + 3], [12, P.ey + 6], [19, P.ey + 6]].forEach(([x, y]) => P.set(x, y, 'S')); },
  mustache: P => { for (let x = 13; x <= 18; x++) P.set(x, P.ey + 4, x === 13 || x === 18 ? 'H' : 'h'); },
  headphones: P => { const half = P.halfAt(P.ey + 1); const lx = Math.floor(P.cx - half) - 1, rx = Math.ceil(P.cx + half); for (let y = P.ey - 1; y <= P.ey + 3; y++) { P.set(lx, y, 'g'); P.set(rx, y, 'g'); P.set(lx - 1, y, 'k'); P.set(rx + 1, y, 'k'); } P.set(lx, P.ey + 1, 'y'); P.set(rx, P.ey + 1, 'y'); },
  ledEyes: P => { [[11, P.ey + 1], [12, P.ey + 1], [13, P.ey + 1], [18, P.ey + 1], [19, P.ey + 1], [20, P.ey + 1]].forEach(([x, y]) => P.set(x, y, 'v')); P.set(12, P.ey, 'w'); P.set(19, P.ey, 'w'); },
  seams: P => { for (let y = P.ey - 4; y <= P.ey + 7; y++) { if (P.get(10, y) === 's') P.set(10, y, 'g'); if (P.get(21, y) === 'S') P.set(21, y, 'g'); } [[14, P.ey + 7], [15, P.ey + 7], [16, P.ey + 7], [17, P.ey + 7]].forEach(([x, y]) => P.set(x, y, 'g')); },
  freckles: P => { [[11, P.ey + 3], [13, P.ey + 3], [18, P.ey + 3], [20, P.ey + 3]].forEach(([x, y]) => P.set(x, y, 'S')); },
  badge: P => { [[10, 31], [11, 31], [10, 32], [11, 32]].forEach(([x, y]) => P.set(x, y, 'y')); },
};

/* --- 초상 생성 --- */
function buildPortrait(def) {
  const grid = Array.from({ length: PH }, () => Array(PW).fill(null));
  const P = {
    def, cx: 16, cy: def.faceY || 15.5, rx: def.faceW || 6.4, ry: def.faceH || 8.2, ey: def.eyeY || 16,
    set(x, y, k) { if (x >= 0 && y >= 0 && x < PW && y < PH) grid[y][x] = k; },
    get(x, y) { return x >= 0 && y >= 0 && x < PW && y < PH ? grid[y][x] : null; },
  };
  P.inHead = (x, y) => { const dy = (y + 0.5 - P.cy) / P.ry; if (Math.abs(dy) > 1) return false; const r = dy > 0 ? P.rx * (1 - 0.34 * dy * dy) : P.rx; const dx = (x + 0.5 - P.cx) / r; return dx * dx + dy * dy <= 1; };
  P.halfAt = y => { let n = 0; for (let x = 0; x < PW; x++) if (P.inHead(x, y)) n++; return n / 2; };
  const hair = HAIR[def.hair] || {};
  if (hair.back) hair.back(P);
  // 몸통
  const sy = def.bodyY || 27;
  for (let y = sy; y < PH; y++) {
    const half = Math.min(15.5, (def.bodyW || 6.5) + (y - sy) * 1.7);
    for (let x = 0; x < PW; x++) { const d = x + 0.5 - 16; if (Math.abs(d) <= half) P.set(x, y, d > half * 0.35 ? 'C' : 'c'); }
  }
  // 목
  const chin = Math.floor(P.cy + P.ry);
  for (let y = chin - 2; y <= sy + 1; y++) for (let x = 13; x <= 18; x++) P.set(x, y, x >= 17 || y === chin ? 'S' : 's');
  (OUTFIT[def.outfit] || (() => {}))(P);
  // 얼굴
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (P.inHead(x, y)) P.set(x, y, x + 0.5 >= P.cx + P.rx * 0.45 || y >= chin - 1 && x > 16 ? 'S' : 's');
  // 귀
  if (!def.noEars) { const half = P.halfAt(P.ey + 1); for (let y = P.ey; y <= P.ey + 2; y++) { P.set(Math.floor(P.cx - half) - 1, y, 's'); P.set(Math.ceil(P.cx + half), y, 'S'); } }
  drawEyes(P, def.eyes || 'normal');
  drawBrows(P, def.brows || 'flat');
  P.set(16, P.ey + 3, 'S');
  drawMouth(P, def.mouth || 'neutral');
  if (hair.front) hair.front(P);
  // 앞머리 그림자
  for (let y = 1; y < PH; y++) for (let x = 0; x < PW; x++) if (P.get(x, y) === 's' && ['h', 'H', 'l'].includes(P.get(x, y - 1))) P.set(x, y, 'S');
  (def.acc || []).forEach(a => ACC[a] && ACC[a](P));
  // 외곽선
  const out = grid.map(r => r.slice());
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    if (grid[y][x]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const v = P.get(x + dx, y + dy); return v && v !== 'k'; })) out[y][x] = 'k';
  }
  // 림 라이트: 왼쪽 가장자리는 rim(시안), 오른쪽은 rim2(마젠타). 피부는 제외
  const rim = out.map(r => r.slice());
  const skin = k => k === 's' || k === 'S' || k === 'b';
  for (let y = 0; y < PH; y++) for (let x = 1; x < PW - 1; x++) {
    const k = out[y][x];
    if (!k || k === 'k' || skin(k)) continue;
    if (out[y][x - 1] === 'k' || out[y][x - 1] === null) rim[y][x] = 'R';
    else if (out[y][x + 1] === 'k' || out[y][x + 1] === null) rim[y][x] = 'Q';
  }
  return { grid: rim, eyes: P.eyes || [], mouth: P.mouth || [], pal: Object.assign({}, DEFAULT_PAL, { R: def.rim || '#3fd8e8', Q: def.rim2 || '#a8329a' }, def.pal) };
}

const PORTRAIT_CACHE = {};
function portraitData(id) {
  if (!PORTRAIT_CACHE[id]) PORTRAIT_CACHE[id] = buildPortrait(CHARACTERS[id].look);
  return PORTRAIT_CACHE[id];
}
/* opts: { blink, talk, glitch(0~1), tint } */
function drawPortrait(ctx, id, opts = {}) {
  const pd = portraitData(id);
  ctx.clearRect(0, 0, PW, PH);
  const eyeSet = opts.blink ? new Set(pd.eyes.map(([x, y]) => x + ',' + y)) : null;
  for (let y = 0; y < PH; y++) {
    let shift = 0;
    if (opts.glitch && Math.random() < opts.glitch * 0.25) shift = ((Math.random() * 5) | 0) - 2;
    for (let x = 0; x < PW; x++) {
      let k = pd.grid[y][x];
      if (!k) continue;
      let col = pd.pal[k] || '#ff00ff';
      if (eyeSet && eyeSet.has(x + ',' + y)) col = pd.pal.S;
      if (opts.glitch && Math.random() < opts.glitch * 0.18) col = ['#ff2bd6', '#00f0ff', '#0b0912', '#ffffff'][(Math.random() * 4) | 0];
      ctx.fillStyle = col;
      ctx.fillRect(x + shift, y, 1, 1);
    }
  }
  if (opts.talk && pd.mouth.length) {
    ctx.fillStyle = '#2a0c14';
    pd.mouth.forEach(([x, y]) => ctx.fillRect(x, y, 1, 2));
  }
  if (opts.tint) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = opts.tint; ctx.fillRect(0, 0, PW, PH); ctx.globalCompositeOperation = 'source-over'; }
}
