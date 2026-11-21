
/* =====================================================================
   미오의 크레파스 그림 (32x24 도트). 결산 화면에 하루 한 장씩 쌓인다
   ===================================================================== */
function crayon(c, pts, col) { c.fillStyle = col; pts.forEach(([x, y]) => c.fillRect(x + ((Math.random() * 2) | 0) * 0, y, 1, 1)); }
function cLine(c, x0, y0, x1, y1, col) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; c.fillStyle = col; for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1); }
function cCircle(c, cx, cy, r, col, fill) { c.fillStyle = col; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = x * x + y * y; if (fill ? d <= r * r : Math.abs(d - r * r) <= r) c.fillRect(cx + x, cy + y, 1, 1); } }
function stick(c, x, y, col, coat) { cCircle(c, x, y, 2, col); cLine(c, x, y + 3, x, y + 9, coat || col); cLine(c, x, y + 5, x - 3, y + 7, col); cLine(c, x, y + 5, x + 3, y + 7, col); cLine(c, x, y + 9, x - 2, y + 13, col); cLine(c, x, y + 9, x + 2, y + 13, col); }
function cat(c, x, y, col) { cCircle(c, x, y, 2, col, true); c.fillStyle = col; c.fillRect(x - 2, y - 3, 1, 1); c.fillRect(x + 2, y - 3, 1, 1); c.fillRect(x - 3, y + 2, 6, 3); c.fillRect(x + 3, y + 1, 1, 2); }
const PAPER = '#f4efe2';
const DRAWINGS = {
  teacher: { title: '우리 선생님', draw: c => { stick(c, 10, 5, '#222', '#fff'); c.fillStyle = '#ddd'; c.fillRect(8, 8, 5, 6); stick(c, 10, 5, '#222'); cat(c, 22, 18, '#888'); cLine(c, 2, 22, 30, 22, '#3a8a3a'); } },
  dubu: { title: '두부', draw: c => { cat(c, 16, 12, '#777'); cCircle(c, 26, 5, 3, '#f0b020', true); cLine(c, 2, 20, 30, 20, '#3a6a3a'); } },
  rooftop: { title: '옥상에서', draw: c => { for (let i = 0; i < 6; i++) cLine(c, 2 + i * 5, 23, 2 + i * 5, 12 + (i % 3) * 3, '#334'); stick(c, 12, 6, '#222'); stick(c, 18, 9, '#d22'); cat(c, 24, 19, '#777'); for (let i = 0; i < 12; i++) c.fillRect((i * 7) % 30, (i * 5) % 10, 1, 2); } },
  sunflower: { title: '별이랑 해바라기', draw: c => { cCircle(c, 10, 8, 3, '#f0c020', true); c.fillStyle = '#7a4a1a'; c.fillRect(9, 7, 3, 3); cLine(c, 10, 11, 10, 22, '#3a8a3a'); stick(c, 22, 8, '#222', '#2a6ad0'); } },
  shield: { title: '지켜 주는 사람', draw: c => { stick(c, 12, 4, '#222', '#fff'); stick(c, 20, 10, '#d22'); cLine(c, 6, 2, 6, 20, '#00a0c0'); cLine(c, 6, 2, 26, 2, '#00a0c0'); } },
  rain: { title: '비 오는 날', draw: c => { for (let i = 0; i < 25; i++) cLine(c, (i * 7) % 32, (i * 3) % 12, (i * 7) % 32 - 1, (i * 3) % 12 + 3, '#4a7ad0'); cLine(c, 8, 10, 24, 10, '#d22'); cLine(c, 16, 10, 16, 18, '#222'); stick(c, 16, 13, '#222'); } },
  court: { title: '법정', draw: c => { c.fillStyle = '#7a4a2a'; c.fillRect(4, 14, 24, 4); cat(c, 16, 9, '#777'); stick(c, 6, 4, '#222'); for (let x = 2; x < 30; x += 4) cLine(c, x, 20, x, 23, '#7a4a2a'); } },
  broadcast: { title: '텔레비전 속 나', draw: c => { c.fillStyle = '#222'; c.fillRect(4, 3, 24, 16); c.fillStyle = '#6ac'; c.fillRect(6, 5, 20, 12); for (let y = 6; y < 16; y += 2) for (let x = 7; x < 25; x += 2) if ((x + y) % 4 === 0) c.fillRect(x, y, 2, 2); cat(c, 16, 11, '#777'); cLine(c, 12, 19, 10, 23, '#222'); cLine(c, 20, 19, 22, 23, '#222'); } },
  sea: { title: '바다 마을', draw: c => { for (let y = 12; y < 24; y++) cLine(c, 0, y, 31, y, y % 3 ? '#4a8ad0' : '#8ac0f0'); cCircle(c, 25, 5, 3, '#f0b020', true); stick(c, 10, 3, '#222'); cat(c, 15, 9, '#777'); } },
  together: { title: '하린 언니 깨어나면', draw: c => { stick(c, 9, 5, '#222', '#fff'); stick(c, 19, 5, '#a060c0'); cLine(c, 12, 10, 16, 10, '#d22'); cCircle(c, 26, 18, 3, '#f0c020', true); for (let x = 2; x < 30; x += 3) c.fillRect(x, 22, 2, 1); } },
  torn: { title: '(찢겨 나간 자리)', draw: c => { c.clearRect(0, 0, 32, 24); c.fillStyle = '#3a3a40'; for (let y = 0; y < 24; y++) c.fillRect(14 + ((y * 7) % 5), y, 2, 1); } },
};
function renderDrawing(cv, id) {
  const c = cv.getContext('2d');
  c.fillStyle = id === 'torn' ? '#1a1a20' : PAPER; c.fillRect(0, 0, 32, 24);
  const d = DRAWINGS[id];
  if (d) d.draw(c);
}
