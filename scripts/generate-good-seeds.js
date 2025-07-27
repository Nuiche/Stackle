// scripts/generate-good-seeds.js
const fs   = require('fs');
const path = require('path');

// 1) Load your 5‑letter seed candidates
const seeds = JSON.parse(
  fs.readFileSync(path.join(process.cwd(),'public','common-seed-5.json'), 'utf8')
).map(w => w.toUpperCase());

// 2) Load your full dictionary
const allWords = JSON.parse(
  fs.readFileSync(path.join(process.cwd(),'public','words_all.json'), 'utf8')
).map(w => w.toUpperCase());

// 3) Pre‑filter for words that could be one edit away
const candidates = allWords.filter(w => w.length >= 4 && w.length <= 6);

// 4) One‑edit neighbor checker
function isNeighbor(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, diffs = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++; j++;
    } else {
      diffs++;
      if (diffs > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
  }
  diffs += (a.length - i) + (b.length - j);
  return diffs === 1;
}

// 5) Filter seeds by threshold
const THRESHOLD = 7;
const goodSeeds = seeds.filter(seed => {
  const count = candidates.reduce((acc, w) => acc + (isNeighbor(seed, w) ? 1 : 0), 0);
  return count >= THRESHOLD;
});

// 6) Write out
const outPath = path.join(process.cwd(), 'public', 'good-seeds-5.json');
fs.writeFileSync(outPath, JSON.stringify(goodSeeds.sort(), null, 2), 'utf8');
console.log(`✅ Wrote ${goodSeeds.length} seeds with ≥ ${THRESHOLD} neighbors to ${outPath}`);
