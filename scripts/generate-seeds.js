// scripts/generate-seeds.js
const fs   = require('fs');
const path = require('path');

// Load your full dictionary
const allWords = JSON.parse(
  fs.readFileSync(path.join(process.cwd(),'public','words_all.json'),'utf8')
).map(w => w.toUpperCase());

// Helper: count substitution‐only neighbors
function countNeighbors(word, pool) {
  const L = word.length;
  let cnt = 0;
  // Precompute patterns once per word
  for (let i = 0; i < L; i++) {
    const pat = word.slice(0,i) + '_' + word.slice(i+1);
    // Count all matches in pool (we’ll build a map for speed)
    cnt += (pool[pat] || []).filter(w => w !== word).length;
  }
  return cnt;
}

// Build pattern map for all 4/5‑letter words
const patternMap = {};
allWords.forEach(w => {
  if (w.length === 4 || w.length === 5) {
    for (let i = 0; i < w.length; i++) {
      const pat = w.slice(0,i) + '_' + w.slice(i+1);
      (patternMap[pat] ||= []).push(w);
    }
  }
});

// Define your thresholds
const thresholds = { 5: 20, 4: 30 };

// Collect good seeds
const goodSeeds = new Set();
Object.entries(thresholds).forEach(([lenStr, thresh]) => {
  const L = parseInt(lenStr,10);
  // Filter candidates of length L
  const cands = allWords.filter(w => w.length === L);
  cands.forEach(w => {
    // Count neighbors via the pattern map
    let cnt = 0;
    for (let i = 0; i < L; i++) {
      const pat = w.slice(0,i) + '_' + w.slice(i+1);
      cnt += (patternMap[pat] || []).length - 1; // minus itself
    }
    if (cnt >= thresh) {
      goodSeeds.add(w);
    }
  });
});

// Write out
const out = Array.from(goodSeeds).sort();
const outPath = path.join(process.cwd(),'public','good-seeds.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2),'utf8');
console.log(`✅ Generated ${out.length} seeds (4‑ & 5‑letter) in ${outPath}`);
