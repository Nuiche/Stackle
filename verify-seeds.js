// verify-seeds.js
const fs   = require('fs');
const path = require('path');

// Load dictionary and seed lists
const dictPath  = path.join(__dirname, 'public', 'words_all.json');
const seedsPath = path.join(__dirname, 'public', 'good-seeds.json');

const wordsAll = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
const seeds    = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));

// Build substitution pattern map for 4- and 5-letter words
const patterns = {};
wordsAll.forEach(w => {
  if (w.length === 4 || w.length === 5) {
    for (let i = 0; i < w.length; i++) {
      const pat = w.slice(0, i) + '_' + w.slice(i + 1);
      if (!patterns[pat]) patterns[pat] = [];
      patterns[pat].push(w);
    }
  }
});

// Check each seed against its threshold
const failures = [];
seeds.forEach(w => {
  const L = w.length;
  let count = 0;
  for (let i = 0; i < L; i++) {
    const pat = w.slice(0, i) + '_' + w.slice(i + 1);
    count += (patterns[pat] || []).filter(x => x !== w).length;
  }
  const thresh = L === 5 ? 20 : 30;
  if (count < thresh) {
    failures.push({ word: w, length: L, neighbors: count, threshold: thresh });
  }
});

// Report results
if (failures.length) {
  console.log(`❌ ${failures.length} seeds failed the threshold:`);
  console.table(failures.slice(0, 20));
} else {
  console.log(`✅ All ${seeds.length} seeds meet their thresholds.`);
  const byLen = [4, 5].map(L => ({
    length: L,
    count: seeds.filter(w => w.length === L).length
  }));
  console.table(byLen);
}
