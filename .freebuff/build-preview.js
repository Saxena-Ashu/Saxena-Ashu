// Renders README.md into a standalone preview.html with full dark/light theme
// support (CSS variables + prefers-color-scheme), so the profile can be
// watched live in the Freebuff Preview tab.
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
  const body = esc(buf.join('\n'));
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
  if (/^</.test(t)) { out.push(line); i++; continue; }        // raw HTML passthrough (div/picture/img/table/details/comments)
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

// Dual-theme CSS: variables flip with prefers-color-scheme, and custom asset
// SVGs are inlined twice (dark + light) with .theme-dark/.theme-light classes.
const css = `
  :root {
    --bg: #0D1117; --fg: #F0F6FC; --muted: #8B949E;
    --card: #111827; --border: #30363D; --accent: #00D4FF; --accent2: #0077FF;
  }
  @media (prefers-color-scheme: light) {
    :root {
      --bg: #F8FAFC; --fg: #0F172A; --muted: #475569;
      --card: #FFFFFF; --border: #CBD5E1; --accent: #0369A1; --accent2: #2563EB;
    }
  }
  body { margin: 0; background: var(--bg); color: var(--fg);
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
         -webkit-font-smoothing: antialiased; transition: background .2s, color .2s; }
  main { max-width: 960px; margin: 0 auto; padding: 24px 16px 72px; }
  h2 { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
       color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: .3em; margin-top: 2em; }
  h3 { color: var(--accent2); }
  pre { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; overflow-x: auto; }
  code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
         font-size: 13px; background: rgba(110,118,129,.2); border-radius: 4px; padding: 1px 4px; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  th, td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
  th { background: var(--card); color: var(--accent); }
  a { color: var(--accent); }
  img { max-width: 100%; }
  details { border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; background: var(--card); margin: 10px 0; }
  summary { cursor: pointer; }
  blockquote { border-left: 4px solid var(--border); padding-left: 12px; color: var(--muted); margin: 10px 0; }
  hr { border: 0; border-top: 1px solid var(--border); margin: 24px 0; }
  p { line-height: 1.5; }
  ul { padding-left: 1.6em; }
  li { margin: 4px 0; line-height: 1.5; }
  .theme-dark { display: block; }
  .theme-light { display: none; }
  @media (prefers-color-scheme: light) {
    .theme-dark { display: none; }
    .theme-light { display: block; }
  }
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

// Preview-only swap + asset inlining, processed picture-block by picture-block
// so no regex can swallow content across blocks.
let snakeSvg = null;
try { snakeSvg = fs.readFileSync(path.join(__dirname, 'snake.svg'), 'utf8'); } catch {}

html = html.replace(/<picture>([\s\S]*?)<\/picture>/g, (m, inner) => {
  // 1) Preview-only: the snake picture becomes the local animated snake.
  if (snakeSvg && /github-contribution-grid-snake/.test(inner)) return snakeSvg;
  // 2) Local asset pair -> two inlined SVGs toggled by prefers-color-scheme.
  const darkMatch = inner.match(/srcset="\.\/assets\/([\w-]+-dark\.svg)"/);
  const lightMatch = inner.match(/srcset="\.\/assets\/([\w-]+-light\.svg)"/);
  if (darkMatch || lightMatch) {
    let parts = '';
    if (darkMatch) {
      try { parts += `<div class="theme-dark">${fs.readFileSync(path.join(root, 'assets', darkMatch[1]), 'utf8')}</div>`; }
      catch { return m; }
    }
    if (lightMatch) {
      try { parts += `<div class="theme-light">${fs.readFileSync(path.join(root, 'assets', lightMatch[1]), 'utf8')}</div>`; }
      catch { return m; }
    }
    return parts;
  }
  // 3) External picture (typing svg, activity graph) — keep as-is.
  return m;
});
// Fallback: rewrite any remaining raw snake URL to the local copy.
html = html.replaceAll(
  'https://raw.githubusercontent.com/Saxena-Ashu/Saxena-Ashu/main/snake.svg',
  'snake.svg'
);

fs.writeFileSync(path.join(__dirname, 'preview.html'), html);
console.log('wrote .freebuff/preview.html (' + out.length + ' blocks)');
