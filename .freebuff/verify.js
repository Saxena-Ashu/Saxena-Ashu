// Quick structural checks after README edits. Run: node .freebuff/verify.js
const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');

console.log('raw <svg> blocks in README:', (text.match(/<svg/g) || []).length);
console.log('SMIL <animate> in README:', (text.match(/<animate/g) || []).length);
console.log('emoji count:', (text.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length);

// Every ./assets/*.svg referenced in the README must exist on disk.
const refs = [...new Set([...text.matchAll(/\.\/assets\/([\w-]+\.svg)/g)].map((m) => m[1]))];
const missing = refs.filter((f) => !fs.existsSync(path.join(__dirname, '..', 'assets', f)));
console.log('asset refs:', refs.join(', '));
console.log('missing assets:', missing.length ? missing.join(',') : 'none');

['## About', '## Tech Stack', '## Technologies', '## Experience', '## Projects',
 '## Key Metrics', '## Education', '## Engineering Principles',
 '## GitHub Stats', '## Contribution Activity', '## Ping Pong'].forEach((h) => {
  console.log(h + ':', text.includes(h));
});

// No banned constructs for GitHub compatibility.
['<script', '<iframe', '<canvas', 'animateTransform', 'onclick', 'javascript:'].forEach((b) => {
  console.log('banned [' + b + ']:', (text.match(new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length);
});
