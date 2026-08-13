// Fetches the user's real contribution calendar from GitHub and generates an
// animated "contribution snake" SVG (pure SMIL: grid + serpentine crawling snake).
// Run: node .freebuff/build-snake.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const USER = 'Saxena-Ashu';
const root = path.resolve(__dirname, '..');

const PAD = 16;   // outer margin
const PITCH = 13; // cell pitch (10px cell + 3px gap, GitHub dark grid)
const CS = 10;    // cell size

const LEVEL_COLORS = ['#111827', '#12395e', '#0b5fa8', '#00a8e8', '#00D4FF'];

function fetchContrib() {
  return new Promise((resolve, reject) => {
    https.get(`https://github.com/users/${USER}/contributions`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'Accept': 'text/html' },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseGrid(html) {
  const cells = [];
  const re = /<td[^>]*class="ContributionCalendar-day"[^>]*>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const date = (tag.match(/data-date="([^"]+)"/) || [])[1];
    const level = Number((tag.match(/data-level="(\d)"/) || [])[1] || 0);
    if (date) cells.push({ date, level });
  }
  if (!cells.length) throw new Error('no contribution cells found');
  cells.sort((a, b) => a.date.localeCompare(b.date));
  const first = new Date(cells[0].date); // Sunday 2025-08-10
  const DAY = 86400000;
  const cols = Math.max(...cells.map((c) => Math.floor((new Date(c.date) - first) / DAY / 7))) + 1;
  const grid = [];
  for (const c of cells) {
    const idx = Math.round((new Date(c.date) - first) / DAY);
    const row = idx % 7; // 0 = Sunday (top row)
    const col = Math.floor(idx / 7);
    if (!grid[col]) grid[col] = [];
    grid[col][row] = c.level;
  }
  return { grid, cols };
}

function serpentine(cols) {
  const pts = [];
  for (let r = 0; r < 7; r++) {
    if (r % 2 === 0) for (let c = 0; c < cols; c++) pts.push([c, r]);
    else for (let c = cols - 1; c >= 0; c--) pts.push([c, r]);
  }
  return pts
    .map(([c, r], i) => `${i === 0 ? 'M' : 'L'}${PAD + c * PITCH + 5} ${PAD + r * PITCH + 5}`)
    .join(' ');
}

function buildSvg(grid, cols) {
  const w = PAD * 2 + (cols - 1) * PITCH + CS;
  const h = PAD * 2 + 6 * PITCH + CS;

  let cells = '';
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < 7; r++) {
      const lvl = grid[c] && grid[c][r] !== undefined ? grid[c][r] : 0;
      cells += `<rect x="${PAD + c * PITCH}" y="${PAD + r * PITCH}" width="${CS}" height="${CS}" rx="2" fill="${LEVEL_COLORS[lvl] || '#161b22'}"/>`;
    }
  }

  const d = serpentine(cols);

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub contribution snake for ${USER}">
  <defs>
    <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00D4FF"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0A0F1C"/>
  ${cells}
  <path id="snakeTrack" d="${d}" fill="none" stroke="none" pathLength="1000"/>
  <path d="${d}" fill="none" stroke="#8B5CF6" stroke-opacity="0.45" stroke-width="9" stroke-linecap="round" pathLength="1000" stroke-dasharray="95 905">
    <animate attributeName="stroke-dashoffset" from="0" to="-1000" dur="7s" repeatCount="indefinite"/>
  </path>
  <path d="${d}" fill="none" stroke="url(#snakeGrad)" stroke-width="4.5" stroke-linecap="round" pathLength="1000" stroke-dasharray="80 920">
    <animate attributeName="stroke-dashoffset" from="0" to="-1000" dur="7s" repeatCount="indefinite"/>
  </path>
</svg>
`;
}

async function main() {
  const html = await fetchContrib();
  const { grid, cols } = parseGrid(html);
  const svg = buildSvg(grid, cols);
  const out = path.join(root, 'snake.svg');
  fs.writeFileSync(out, svg);
  // local copy for the HTML preview
  fs.writeFileSync(path.join(__dirname, 'snake.svg'), svg);
  console.log(`wrote ${out} (${cols} weeks x 7 days, ${fs.statSync(out).size} bytes)`);
}

main().catch((e) => {
  console.error('failed:', e.message);
  process.exit(1);
});
