// scripts/generate-seeds.js
const fs = require('fs');
const path = require('path');

// Path to your static dictionary
const dictPath = path.join(process.cwd(), 'public', 'words_all.json');
const wordsAll = JSON.parse(fs.readFileSync(dictPath, 'utf8'))
  .map(w => w.toUpperCase());

// Build pattern maps for lengths 4 and 5
function buildPatternMap(words, L) {
  const map = {};
  words.filter(w => w.length === L).forEach(w => {
    for (let i = 0; i < L; i++) {
      const pat = w.slice(0, i) + '_' + w.slice(i + 1);
      if (!map[pat]) map[pat] = [];
      map[pat].push(w);
    }
  });
  return map;
}

const words4 = wordsAll.filter(w => w.length === 4);
const words5 = wordsAll.filter(w => w.length === 5);

const patternMap4 = buildPatternMap(words4, 4);
const patternMap5 = buildPatternMap(words5, 5);

// Thresholds: 4-letter ≥30, 5-letter ≥20 neighbors
const thresholds = { 4: 30, 5: 20 };

// Count unique substitution neighbors
function countNeighbors(word, patternMap) {
  const L = word.length;
  const set = new Set();
  for (let i = 0; i < L; i++) {
    const pat = word.slice(0, i) + '_' + word.slice(i + 1);
    (patternMap[pat] || []).forEach(neigh => {
      if (neigh !== word) set.add(neigh);
    });
  }
  return set.size;
}

// Collect seeds meeting their criteria
let goodSeeds = [];

words4.forEach(w => {
  if (countNeighbors(w, patternMap4) >= thresholds[4]) {
    goodSeeds.push(w);
  }
});

words5.forEach(w => {
  if (countNeighbors(w, patternMap5) >= thresholds[5]) {
    goodSeeds.push(w);
  }
});

// Dedupe & sort
goodSeeds = Array.from(new Set(goodSeeds)).sort();

// Write out
const outPath = path.join(process.cwd(), 'public', 'good-seeds.json');
fs.writeFileSync(outPath, JSON.stringify(goodSeeds, null, 2), 'utf8');
console.log(`✅ Generated ${goodSeeds.length} seeds in ${outPath}`);
