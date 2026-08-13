// Quick structural checks after README edits. Run: node .freebuff/verify.js
const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');

console.log('raw <svg> blocks in README:', (text.match(/<svg/g) || []).length);
console.log('SMIL <animate> in README:', (text.match(/<animate/g) || []).length);
console.log('emoji count:', (text.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length);

// Every ./assets/*.svg referenced (dark and light) must exist on disk.
const refs = [...new Set([...text.matchAll(/\.\/assets\/([\w-]+\.svg)/g)].map((m) => m[1]))];
const missing = refs.filter((f) => !fs.existsSync(path.join(__dirname, '..', 'assets', f)));
console.log('asset refs:', refs.join(', '));
console.log('missing assets:', missing.length ? missing.join(',') : 'none');
console.log('picture blocks:', (text.match(/<picture>/g) || []).length);
console.log('theme switches (prefers-color-scheme):', (text.match(/prefers-color-scheme/g) || []).length);

['## About', '## Engineering Impact', '## Tech Stack', '## Engineering Capabilities', '## Technologies', '## Experience',
 '## Projects', '## Education', '## Achievements',
 '## GitHub Activity', '## Ping Pong', '## Contact'].forEach((h) => {
  console.log(h + ':', text.includes(h));
});

// Resume-backed facts that must be present (source of truth).
['10K+', '15+', '40%', '95+', '30%', '800+', '99.9%', '500+', '300+', '60%', '100%', '7.29',
 'Helical Consulting', 'Larsen & Toubro', 'PreBid Tracker', 'TECHVOYM'].forEach((f) => {
  console.log('resume [' + f + ']:', text.includes(f));
});

// No AI/ML content anywhere in the profile.
['YOLO', 'MediaPipe', 'Machine Learning', 'Neural', 'TensorFlow', 'PyTorch',
 'Deep Learning', 'Computer Vision', 'Data Science', 'LLM', 'Generative AI',
 'NLP'].forEach((b) => {
  console.log('ai/ml [' + b + ']:', (text.match(new RegExp(b, 'gi')) || []).length);
});
console.log('ai/ml metric [92% ACCURACY]:', (text.match(/92%\s*ACCURACY|ACCURACY/gi) || []).length);

// No banned constructs for GitHub compatibility.
['<script', '<iframe', '<canvas', 'animateTransform', 'onclick', 'javascript:'].forEach((b) => {
  console.log('banned [' + b + ']:', (text.match(new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length);
});
