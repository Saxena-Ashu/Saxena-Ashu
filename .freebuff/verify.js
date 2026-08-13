// Quick structural checks after README edits. Run: node .freebuff/verify.js
const fs = require('fs');
const text = fs.readFileSync(require('path').join(__dirname, '..', 'README.md'), 'utf8');
const lines = text.split('\n');
const BT = String.fromCharCode(96); // backtick

console.log('terminal headings left:', (text.match(new RegExp('## ' + BT + '>', 'g')) || []).length);
console.log('diff blocks left:', (text.match(/```diff/g) || []).length);
console.log('ashu.js refs:', (text.match(/ashu\.js/g) || []).length);
console.log('About section present:', text.includes('## About'));
console.log('Experience section present:', text.includes('## Experience'));
console.log('Engineering Principles present:', text.includes('## Engineering Principles'));
console.log('GitHub Stats present:', text.includes('## GitHub Stats'));
console.log('Contribution Activity present:', text.includes('## Contribution Activity'));

let inSvg = false, problems = [];
lines.forEach((l, i) => {
  if (/<svg/.test(l)) inSvg = true;
  if (inSvg && l.trim() === '') problems.push(i + 1);
  if (/<\/svg>/.test(l)) inSvg = false;
});
console.log('svg blank-line issues:', problems.length ? problems.join(',') : 'none');
console.log('animates:', (text.match(/<animate/g) || []).length);
console.log('svgs open/close:', (text.match(/<svg/g) || []).length, (text.match(/<\/svg>/g) || []).length);
console.log('emoji count:', (text.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length);

lines.forEach((l) => {
  if (l.includes('Open  :')) console.log('box line len:', l.length, JSON.stringify(l));
});
