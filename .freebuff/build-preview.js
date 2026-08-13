// Renders README.md into a standalone preview.html (GitHub-dark theme) so the
// profile can be watched live in the Freebuff Preview tab.
// Run: node .freebuff/build-preview.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const md = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const lines = md.split(/\r?\n/);

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => `<img src="${url}" alt="${alt}" />`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => `<a href="${url}">${text}</a>`);
  s = s.replace(/`([^`]+)`/g, (m, code) => `<code>${esc(code)}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}

function renderCode(lang, buf) {
  let body = buf.join('\n');
  if (lang === 'diff') {
    body = body.split('\n').map((l) => {
      if (l.startsWith('+')) return `<span style="color:#3fb950">${esc(l)}</span>`;
      if (l.startsWith('-')) return `<span style="color:#f85149">${esc(l)}</span>`;
      return esc(l);
    }).join('\n');
  } else {
    body = esc(body);
  }
  return `<pre><code class="language-${esc(lang) || 'text'}">${body}\n</code></pre>`;
}

function cells(r) {
  return r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
}

const out = [];
let i = 0;
let inCode = false;
let codeLang = '';
let codeBuf = [];

while (i < lines.length) {
  const line = lines[i];
  const t = line.trim();

  if (inCode) {
    if (/^```/.test(t)) {
      out.push(renderCode(codeLang, codeBuf));
      codeBuf = [];
      inCode = false;
    } else {
      codeBuf.push(line);
    }
    i++;
    continue;
  }
  if (/^```/.test(t)) {
    inCode = true;
    codeLang = t.slice(3).trim();
    i++;
    continue;
  }
  if (t === '') { i++; continue; }
  if (/^</.test(t)) { out.push(line); i++; continue; }        // raw HTML passthrough (div/svg/img/table/details/comments)
  if (/^---+$/.test(t)) { out.push('<hr/>'); i++; continue; }

  const h = t.match(/^(#{1,6})\s+(.*)$/);
  if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }

  if (/^>/.test(t)) {
    const q = [];
    while (i < lines.length && /^>/.test(lines[i].trim())) {
      q.push(lines[i].trim().replace(/^>\s?/, ''));
      i++;
    }
    out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`);
    continue;
  }

  if (/^[-*]\s+/.test(t)) {
    const items = [];
    while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, '')); i++; }
    out.push('<ul>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ul>');
    continue;
  }

  if (/^\|/.test(t)) {
    const rows = [];
    while (i < lines.length && /^\|/.test(lines[i].trim())) { rows.push(lines[i].trim()); i++; }
    const header = cells(rows[0]);
    const bodyRows = rows.slice(2);
    let html = '<table><thead><tr>' + header.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
    for (const r of bodyRows) {
      html += '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
    }
    html += '</tbody></table>';
    out.push(html);
    continue;
  }

  const para = [t];
  i++;
  while (i < lines.length) {
    const n = lines[i].trim();
    if (n === '' || /^```/.test(n) || /^</.test(n) || /^#{1,6}\s/.test(n) || /^\|/.test(n) || /^>/.test(n) || /^---+$/.test(n)) break;
    para.push(n);
    i++;
  }
  out.push(`<p>${inline(para.join(' '))}</p>`);
}

const css = `
  body { margin: 0; background: #0d1117; color: #e6edf3;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
         -webkit-font-smoothing: antialiased; }
  main { max-width: 960px; margin: 0 auto; padding: 24px 16px 72px; }
  h2 { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
       color: #00E676; border-bottom: 1px solid #21262d; padding-bottom: .3em; margin-top: 2em; }
  h3 { color: #00B0FF; }
  pre { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px 16px; overflow-x: auto; }
  code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
         font-size: 13px; background: rgba(110,118,129,.2); border-radius: 4px; padding: 1px 4px; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  th, td { border: 1px solid #30363d; padding: 8px 12px; text-align: left; }
  th { background: #161b22; color: #00E676; }
  a { color: #58a6ff; }
  img { max-width: 100%; }
  details { border: 1px solid #30363d; border-radius: 6px; padding: 8px 12px; background: #161b22; margin: 10px 0; }
  summary { cursor: pointer; }
  blockquote { border-left: 4px solid #30363d; padding-left: 12px; color: #8b949e; margin: 10px 0; }
  hr { border: 0; border-top: 1px solid #21262d; margin: 24px 0; }
  p { line-height: 1.5; }
  ul { padding-left: 1.6em; }
  li { margin: 4px 0; line-height: 1.5; }
`;

let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ashu Saxena — GitHub Profile</title>
<style>${css}</style>
</head>
<body>
<main>
${out.join('\n')}
</main>
</body>
</html>
`;

// Preview-only: swap the snake <picture> for the locally generated animated
// SVG so the snake is visible even before the user uploads snake.svg to
// GitHub. Run .freebuff/build-snake.js first to (re)generate it.
try {
  const snakeSvg = fs.readFileSync(path.join(__dirname, 'snake.svg'), 'utf8');
  html = html.replace(/<picture>[\s\S]*?<\/picture>/, snakeSvg);
} catch {}
// Preview-only: replace the README's auto-rally ping pong SVG (GitHub can't
// run JavaScript) with the interactive game from pong-game.html, which is
// playable with mouse/keys, scores to 7, and captures the max score.
try {
  const pong = fs.readFileSync(path.join(__dirname, 'pong-game.html'), 'utf8');
  html = html.replace(
    /<svg width="640"[\s\S]*?<\/svg>\s*<sub><i>auto-rally[^<]*<\/i><\/sub>/,
    pong
  );
} catch {}
// Fallback: if the picture block was already replaced, still rewrite any
// remaining raw snake URL to the local copy for robustness.
html = html.replaceAll(
  'https://raw.githubusercontent.com/Saxena-Ashu/Saxena-Ashu/main/snake.svg',
  'snake.svg'
);

fs.writeFileSync(path.join(__dirname, 'preview.html'), html);
console.log('wrote .freebuff/preview.html (' + out.length + ' blocks)');
