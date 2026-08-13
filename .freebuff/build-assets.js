// Generates all custom SVG assets for the profile README — 9 components x 2
// themes (dark/light), driven by shared palettes. Light is the default/fallback.
// Run: node .freebuff/build-assets.js
//
// All assets are standalone .svg files referenced from README.md via
// <picture><source media="(prefers-color-scheme: ...)">. SMIL animation is
// minimal and only where it adds professional value.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets');

const DARK = {
  key: 'd',
  bg: '#0D1117', card: '#161B22', card2: '#111827', border: '#30363D',
  text: '#F0F6FC', muted: '#8B949E', track: '#21262D',
  primary: '#00D4FF', secondary: '#0077FF', accent: '#8B5CF6', highlight: '#22D3EE',
  tileStroke: '#0D1117', court: '#111827', sweep: '#E6EDF3',
};
const LIGHT = {
  key: 'l',
  bg: '#F8FAFC', card: '#FFFFFF', card2: '#F1F5F9', border: '#CBD5E1',
  text: '#0F172A', muted: '#475569', track: '#E2E8F0',
  primary: '#0369A1', secondary: '#2563EB', accent: '#7C3AED', highlight: '#0891B2',
  tileStroke: '#CBD5E1', court: '#F1F5F9', sweep: '#0F172A',
};

// ---- brand tile colors (same in both themes) ----
const TILES = {
  Re: { fill: '#61DAFB', text: '#0A0F1C' },
  No: { fill: '#339933', text: '#ffffff' },
  Ex: { fill: '#ffffff', text: '#0A0F1C' },
  Fl: { fill: '#02569B', text: '#ffffff' },
  Mo: { fill: '#47A248', text: '#ffffff' },
  Pg: { fill: '#336791', text: '#ffffff' },
  Ts: { fill: '#3178C6', text: '#ffffff' },
  Do: { fill: '#2496ED', text: '#ffffff' },
};

function wrap(body, w, h, vb, label) {
  return `<svg width="${w}" height="${h}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">\n${body}\n</svg>\n`;
}

// ---------------------------------------------------------------- title
function title(p) {
  const grad = `<linearGradient id="tg${p.key}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${p.primary}">
        <animate attributeName="stop-color" values="${p.primary};${p.accent};${p.secondary};${p.primary}" dur="8s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="${p.secondary}">
        <animate attributeName="stop-color" values="${p.secondary};${p.primary};${p.accent};${p.secondary}" dur="8s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="${p.accent}">
        <animate attributeName="stop-color" values="${p.accent};${p.secondary};${p.primary};${p.accent}" dur="8s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>`;
  return wrap(`  <defs>
    ${grad}
  </defs>
  <g font-family="monospace" font-size="54" font-weight="bold" fill="url(#tg${p.key})">
    <text x="20" y="74">A</text>
    <text x="56" y="74">S</text>
    <text x="92" y="74">H</text>
    <text x="128" y="74">U</text>
    <text x="182" y="74">S</text>
    <text x="218" y="74">A</text>
    <text x="254" y="74">X</text>
    <text x="290" y="74">E</text>
    <text x="326" y="74">N</text>
    <text x="362" y="74">A</text>
  </g>
  <text x="10" y="100" font-family="monospace" font-size="15" fill="${p.muted}">Software Development Engineer</text>
  <rect x="404" y="87" width="7" height="12" fill="${p.primary}">
    <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/>
  </rect>`, 640, 110, '0 0 640 110', 'ASHU SAXENA');
}

// ----------------------------------------------------------- open to work
function openToWork(p) {
  return wrap(`  <circle cx="20" cy="18" r="10" fill="${p.primary}" opacity="0.35">
    <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2.2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="20" cy="18" r="6.5" fill="${p.primary}"/>
  <text x="38" y="24" font-size="14" font-family="monospace" fill="${p.text}">Open to Software Engineering Opportunities</text>`, 340, 36, '0 0 340 36', 'Open to work');
}

// ----------------------------------------------------------------- divider
function divider(p) {
  return wrap(`  <defs>
    <linearGradient id="dg${p.key}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${p.primary}"/>
      <stop offset="50%" stop-color="${p.secondary}"/>
      <stop offset="100%" stop-color="${p.accent}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="4" fill="url(#dg${p.key})"/>
  <rect width="18" height="4" fill="${p.sweep}" opacity="0.5">
    <animate attributeName="x" values="-18;100" dur="3.5s" repeatCount="indefinite"/>
  </rect>`, '100%', 4, '0 0 100 4', 'divider');
}

// ------------------------------------------------------------- capabilities
function competencies(p) {
  const caps = [
    'Backend Engineering',
    'REST API Design',
    'System Design',
    'Database Design',
    'Performance Optimization',
    'Full-Stack Development',
    'Mobile Development',
    'Cloud & DevOps',
  ];
  const cols = [16, 288];
  const rows = [16, 72, 128, 184];
  let body = '';
  caps.forEach((name, i) => {
    const x = cols[i % 2];
    const y = rows[Math.floor(i / 2)];
    body += `  <g>
    <rect x="${x}" y="${y}" width="256" height="42" rx="9" fill="${p.card}" stroke="${p.border}"/>
    <rect x="${x + 14}" y="${y + 14}" width="3" height="14" rx="1.5" fill="${[p.primary, p.secondary, p.accent, p.highlight][i % 4]}"/>
    <text x="${x + 28}" y="${y + 27}" font-size="13" font-family="monospace" font-weight="bold" fill="${p.text}">${name}</text>
  </g>
`;
  });
  return wrap(body, 560, 240, '0 0 560 240', 'Engineering capabilities');
}

// ------------------------------------------------------------- technologies
function tile(x, y, key, begin) {
  const t = TILES[key];
  const ring = key === 'No' || key === 'Ex' || key === 'Mo' || key === 'Ts' ? 12 : 18;
  return `    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="-360 ${x} ${y}" dur="${ring}s" repeatCount="indefinite"/>
      <rect x="${x - 18}" y="${y - 18}" width="36" height="36" rx="9" fill="${t.fill}" stroke="${DARK.tileStroke}" stroke-width="1.5"/>
      <text x="${x}" y="${y + 6}" font-size="15" font-family="sans-serif" font-weight="bold" fill="${t.text}" text-anchor="middle">${key}</text>
      <animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="${begin}s" fill="freeze"/>
    </g>`;
}

function technologies(p) {
  const outer = [
    [200, 20, 'Do', 0.9],
    [60, 160, 'Re', 0.6],
    [340, 160, 'Fl', 0.75],
    [200, 300, 'Pg', 1.05],
  ];
  const inner = [
    [133, 93, 'Ts', 1.65],
    [267, 93, 'Ex', 1.35],
    [133, 227, 'Mo', 1.5],
    [267, 227, 'No', 1.2],
  ];
  return wrap(`  <rect x="4" y="4" width="392" height="312" rx="16" fill="${p.card}" stroke="${p.border}"/>
  <circle cx="200" cy="160" r="140" fill="none" stroke="${p.primary}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="6 6">
    <animateTransform attributeName="transform" type="rotate" from="0 200 160" to="360 200 160" dur="40s" repeatCount="indefinite"/>
  </circle>
  <circle cx="200" cy="160" r="95" fill="none" stroke="${p.accent}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4 4">
    <animateTransform attributeName="transform" type="rotate" from="360 200 160" to="0 200 160" dur="26s" repeatCount="indefinite"/>
  </circle>
  <circle cx="200" cy="160" r="46" fill="${p.bg}" stroke="${p.primary}" stroke-width="2"/>
  <circle cx="200" cy="160" r="46" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round" stroke-dasharray="12 277">
    <animateTransform attributeName="transform" type="rotate" from="0 200 160" to="360 200 160" dur="4s" repeatCount="indefinite"/>
  </circle>
  <text x="200" y="167" font-size="22" font-family="monospace" font-weight="bold" fill="${p.primary}" text-anchor="middle">AS</text>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 200 160" to="360 200 160" dur="18s" repeatCount="indefinite"/>
${outer.map(([x, y, k, b]) => tile(x, y, k, b)).join('\n')}
  </g>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="360 200 160" to="0 200 160" dur="12s" repeatCount="indefinite"/>
${inner.map(([x, y, k, b]) => tile(x, y, k, b)).join('\n')}
  </g>`, 420, 320, '0 0 400 320', 'Technology orbit');
}

// --------------------------------------------------------------- techvoym
// Vertical architecture dashboard: Users -> Interface -> API -> Validation
// -> MongoDB -> Monitoring, with the resume's metrics beside each stage.
function techvoym(p) {
  const stages = [
    ['USERS', '800+ concurrent users', p.primary],
    ['REGISTRATION INTERFACE', 'HTML5 · CSS3 · JS', p.secondary],
    ['API', 'Node.js · Express.js', p.accent],
    ['VALIDATION', 'real-time checks', p.highlight],
    ['DATABASE', 'MongoDB', p.secondary],
    ['MONITORING', 'alerts · integrity', p.primary],
  ];
  const nodeX = 28;
  const nodeW = 210;
  const nodeH = 58;
  const rowGap = 22;
  const startY = 70;
  const metricX = 266;
  const metricW = 266;
  const metrics = [
    ['800+', 'Concurrent users'],
    ['500+', 'Individual registrations'],
    ['300+', 'Team registrations'],
    ['60%', 'Fewer failures'],
    ['99.9%', 'Uptime'],
    ['100%', 'Data integrity'],
  ];
  const cardH = startY + 6 * (nodeH + rowGap) + 16 - 6; // card top is y=6
  let body = `  <rect x="6" y="6" width="548" height="${cardH}" rx="14" fill="${p.card}" stroke="${p.border}"/>
  <text x="28" y="40" font-size="14" font-family="monospace" font-weight="bold" fill="${p.primary}">TECHVOYM · ARCHITECTURE & SCALE</text>
`;
  stages.forEach(([label, sub, color], i) => {
    const y = startY + i * (nodeH + rowGap);
    body += `  <g>
    <rect x="${nodeX}" y="${y}" width="${nodeW}" height="${nodeH}" rx="9" fill="${p.card2}" stroke="${p.border}"/>
    <rect x="${nodeX + 12}" y="${y + 16}" width="3" height="26" rx="1.5" fill="${color}"/>
    <text x="${nodeX + 26}" y="${y + 25}" font-size="11" font-family="monospace" font-weight="bold" fill="${p.text}">${label}</text>
    <text x="${nodeX + 26}" y="${y + 41}" font-size="9" font-family="monospace" fill="${p.muted}">${sub}</text>
  </g>
`;
    // right-hand metric card
    const [val, mlabel] = metrics[i];
    body += `  <g>
    <rect x="${metricX}" y="${y}" width="${metricW}" height="${nodeH}" rx="9" fill="${p.card2}" stroke="${p.border}"/>
    <text x="${metricX + 14}" y="${y + 30}" font-size="16" font-family="monospace" font-weight="bold" fill="${color}">${val}</text>
    <text x="${metricX + 14}" y="${y + 46}" font-size="10" font-family="monospace" fill="${p.muted}">${mlabel}</text>
  </g>
`;
    if (i < stages.length - 1) {
      const ay = y + nodeH + rowGap / 2;
      body += `  <path d="M${nodeX + nodeW / 2} ${ay - 4} L${nodeX + nodeW / 2} ${ay + 4}" stroke="${p.border}" stroke-width="2" stroke-linecap="round"/>
  <path d="M${nodeX + nodeW / 2 - 4} ${ay} L${nodeX + nodeW / 2 + 4} ${ay}" fill="none" stroke="${p.border}" stroke-width="2" stroke-linecap="round"/>
`;
    }
  });
  body += `  <text x="280" y="${startY + 6 * (nodeH + rowGap) + 12}" font-size="10" font-family="monospace" fill="${p.muted}" text-anchor="middle">Node.js · Express.js · MongoDB · HTML5 · CSS3 · JavaScript · Docker</text>`;
  const H = cardH + 6 + 16;
  return wrap(body, 560, H, `0 0 560 ${H}`, 'TECHVOYM architecture and scale');
}

// ----------------------------------------------------------------- metrics
function metrics(p) {
  const cards = [
    ['10K+', 'MONTHLY ACTIVE', 'USERS', p.primary],
    ['15+', 'REST', 'APIs', p.secondary],
    ['40%', 'RESPONSE TIME', 'IMPROVEMENT', p.accent],
    ['95+', 'LIGHTHOUSE', 'SCORE', p.highlight],
    ['30%', 'USER', 'ENGAGEMENT', p.primary],
    ['800+', 'CONCURRENT', 'USERS', p.secondary],
    ['99.9%', 'UPTIME', '', p.accent],
    ['500+', 'INDIVIDUAL', 'REGISTRATIONS', p.highlight],
    ['300+', 'TEAM', 'REGISTRATIONS', p.primary],
    ['60%', 'FEWER', 'FAILURES', p.secondary],
    ['100%', 'DATA', 'INTEGRITY', p.accent],
  ];
  const xs = [16, 196, 376];
  const ys = [16, 134, 252, 370];
  let body = '';
  cards.forEach(([val, l1, l2, color], i) => {
    const x = xs[i % 3];
    const y = ys[Math.floor(i / 3)];
    body += `  <g>
    <rect x="${x}" y="${y}" width="168" height="104" rx="12" fill="${p.card}" stroke="${p.border}"/>
    <text x="${x + 84}" y="${y + 48}" font-size="24" font-family="monospace" font-weight="bold" fill="${color}" text-anchor="middle"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${(0.2 + i * 0.11).toFixed(2)}s" fill="freeze"/>${val}</text>
    <text x="${x + 84}" y="${y + 70}" font-size="10" font-family="monospace" fill="${p.muted}" text-anchor="middle">${l1}</text>
    ${l2 ? `<text x="${x + 84}" y="${y + 84}" font-size="10" font-family="monospace" fill="${p.muted}" text-anchor="middle">${l2}</text>` : ''}
    <rect x="${x + 54}" y="${y + 92}" width="60" height="3" rx="1.5" fill="${p.track}"/>
    <rect x="${x + 54}" y="${y + 92}" width="0" height="3" rx="1.5" fill="${color}">
      <animate attributeName="width" from="0" to="60" dur="0.8s" fill="freeze" begin="${(0.3 + i * 0.11).toFixed(2)}s"/>
    </rect>
  </g>
`;
  });
  body += `  <g>
    <rect x="376" y="370" width="168" height="104" rx="12" fill="${p.card}" stroke="${p.border}"/>
    <text x="460" y="416" font-size="13" font-family="monospace" font-weight="bold" fill="${p.primary}" text-anchor="middle">BUILD.</text>
    <text x="460" y="434" font-size="13" font-family="monospace" font-weight="bold" fill="${p.secondary}" text-anchor="middle">OPTIMIZE.</text>
    <text x="460" y="452" font-size="13" font-family="monospace" font-weight="bold" fill="${p.accent}" text-anchor="middle">SCALE.</text>
  </g>
`;
  return wrap(body, 560, 488, '0 0 560 488', 'Engineering impact');
}

// --------------------------------------------------------------- ping pong
// Subtle automatic rally: ball glides between two paddles. Professional, not
// arcade. SMIL runs when the SVG is loaded as an image (same as the snake).
function pingPong(p) {
  return wrap(`  <rect x="10" y="10" width="620" height="280" rx="14" fill="${p.card}" stroke="${p.border}"/>
  <text x="30" y="44" font-size="14" font-family="monospace" font-weight="bold" fill="${p.primary}">PING PONG</text>
  <text x="610" y="44" font-size="10" font-family="monospace" fill="${p.muted}" text-anchor="end">auto rally</text>
  <rect x="30" y="60" width="580" height="200" rx="8" fill="${p.court}" stroke="${p.border}"/>
  <line x1="320" y1="60" x2="320" y2="260" stroke="${p.border}" stroke-width="1.5" stroke-dasharray="5 5"/>
  <text x="44" y="84" font-size="11" font-family="monospace" fill="${p.muted}">Player 1</text>
  <text x="596" y="84" font-size="11" font-family="monospace" fill="${p.muted}" text-anchor="end">CPU</text>
  <text x="320" y="96" font-size="13" font-family="monospace" font-weight="bold" fill="${p.text}" text-anchor="middle">0 — 0</text>
  <rect x="50" y="120" width="10" height="56" rx="5" fill="${p.primary}">
    <animate attributeName="y" values="120;170;120" dur="4.5s" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" repeatCount="indefinite"/>
  </rect>
  <rect x="580" y="120" width="10" height="56" rx="5" fill="${p.accent}">
    <animate attributeName="y" values="170;120;170" dur="4.5s" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" repeatCount="indefinite"/>
  </rect>
  <g>
    <animateTransform attributeName="transform" type="translate" values="56 148;564 148;56 148" dur="4.5s" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" repeatCount="indefinite"/>
    <circle cx="0" cy="0" r="9" fill="${p.highlight}" opacity="0.22"/>
    <circle cx="0" cy="0" r="5.5" fill="${p.highlight}"/>
  </g>`, 640, 300, '0 0 640 300', 'Ping pong — auto rally');
}

// ------------------------------------------------------------------- footer
function footer(p) {
  return wrap(`  <rect x="10" y="10" width="540" height="190" rx="14" fill="${p.card}" stroke="${p.border}"/>
  <text x="280" y="44" font-size="17" font-family="monospace" font-weight="bold" fill="${p.primary}" text-anchor="middle">ASHU SAXENA</text>
  <text x="280" y="64" font-size="11" font-family="monospace" fill="${p.muted}" text-anchor="middle">Software Development Engineer</text>
  <line x1="200" y1="80" x2="360" y2="80" stroke="${p.border}" stroke-width="1"/>
  <text x="280" y="102" font-size="11" font-family="monospace" fill="${p.muted}" text-anchor="middle">Bareilly, UP, India</text>
  <text x="280" y="126" font-size="11" font-family="monospace" fill="${p.text}" text-anchor="middle">ashusaxena4767@gmail.com</text>
  <text x="280" y="146" font-size="11" font-family="monospace" fill="${p.text}" text-anchor="middle">github.com/Saxena-Ashu</text>
  <text x="280" y="166" font-size="11" font-family="monospace" fill="${p.text}" text-anchor="middle">linkedin.com/in/saxenaashu</text>
  <text x="280" y="188" font-size="11" font-family="monospace" font-weight="bold" fill="${p.accent}" text-anchor="middle">Build. Optimize. Scale.</text>`, 560, 210, '0 0 560 210', 'Contact footer');
}

const GENERATORS = {
  'title': title,
  'open-to-work': openToWork,
  'divider': divider,
  'competencies': competencies,
  'technologies': technologies,
  'techvoym': techvoym,
  'metrics': metrics,
  'ping-pong': pingPong,
  'footer': footer,
};

fs.mkdirSync(OUT, { recursive: true });
let count = 0;
for (const [name, gen] of Object.entries(GENERATORS)) {
  fs.writeFileSync(path.join(OUT, `${name}-dark.svg`), gen(DARK));
  fs.writeFileSync(path.join(OUT, `${name}-light.svg`), gen(LIGHT));
  count += 2;
}
console.log(`wrote ${count} assets into assets/`);
