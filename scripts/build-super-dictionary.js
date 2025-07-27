// scripts/build-super-dictionary.js
const fs        = require('fs');
const path      = require('path');
const pluralize = require('pluralize');
const pkg       = require('word-list');
const natural   = require('natural');

// Helper to load a newline‑delimited text file of words
function loadTxt(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(w => w.trim())
    .filter(w => /^[A-Za-z]+$/.test(w))
    .map(w => w.toUpperCase());
}

// 1) Load 'word-list' npm package
const wordListPath = typeof pkg === 'string'
  ? pkg
  : (pkg && typeof pkg.default === 'string'
      ? pkg.default
      : (() => { throw new Error('Cannot resolve word-list path'); })());
console.log('Reading word-list from', wordListPath);
const baseWords = loadTxt(wordListPath);

// 2) Load WordNet head‑words (noun, verb, adj, adv)
const wnDict = path.join(process.cwd(), 'node_modules', 'wordnet-db', 'dict');
const loadIndex = pos => {
  const idx = fs.readFileSync(path.join(wnDict, `index.${pos}`), 'utf8');
  return idx
    .split('\n')
    .filter(Boolean)
    .map(line => line.split(' ')[0].toUpperCase());
};
console.log('Reading WordNet indices');
const wnWords = [
  ...loadIndex('noun'),
  ...loadIndex('verb'),
  ...loadIndex('adj'),
  ...loadIndex('adv'),
];

// 3) Load additional word sets (ENABLE, SOWPODS, SCOWL if present, custom overrides)
const dataDir = path.join(process.cwd(), 'data');
const enable  = loadTxt(path.join(dataDir, 'enable.txt'));
const sowpods = loadTxt(path.join(dataDir, 'sowpods.txt'));

let scowl = [];
try {
  scowl = loadTxt(path.join(dataDir, 'scowl-72.txt'));
  console.log(`Loaded SCOWL (${scowl.length} words)`);
} catch {
  console.warn('SCOWL not found, skipping');
}

let custom = [];
try {
  custom = loadTxt(path.join(dataDir, 'custom.txt'));
  console.log(`Loaded custom overrides (${custom.length} words)`);
} catch {
  console.warn('Custom overrides not found, skipping');
}

// 3a) Load DWYL words_alpha (370k+ entries)
let wordsAlpha = [];
try {
  wordsAlpha = loadTxt(path.join(dataDir, 'words_alpha.txt'));
  console.log(`Loaded words_alpha.txt (${wordsAlpha.length} entries)`);
} catch {
  console.warn('words_alpha.txt missing; run curl to fetch it');
}

// 4) Merge all sources
let merged = [
  ...baseWords,
  ...wnWords,
  ...enable,
  ...sowpods,
  ...scowl,
  ...custom,
  ...wordsAlpha,
];

// 5) Dedupe & sort
merged = Array.from(new Set(merged)).sort();

// 6) Inject simple plurals
merged = merged.flatMap(w => {
  const p = pluralize(w.toLowerCase()).toUpperCase();
  return p === w ? [w] : [w, p];
});

// 7) Final dedupe & sort again
merged = Array.from(new Set(merged)).sort();

// 8) Filter to 4–8 letters *and* no digits
const filtered = merged
  .filter(w => w.length >= 4 && w.length <= 8)
  .filter(w => !/\d/.test(w));
console.log(`Filtered to ${filtered.length} words (4–8 letters, no digits) out of ${merged.length} total merged entries.`);

// 9) Write out to public/words_all.json
const outPath = path.join(process.cwd(), 'public', 'words_all.json');
fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf8');
console.log(`✅ Wrote super‑dictionary to ${outPath}`);
