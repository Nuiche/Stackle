// scripts/build-dictionary.js
const fs      = require('fs');
const path    = require('path');
const natural = require('natural');

// Locate WordNet data
const wnDict = path.join(
  process.cwd(),
  'node_modules',
  'wordnet-db',
  'dict'
);
const WordNet = natural.WordNet;
const wn      = new WordNet(wnDict);

// Helper to load and parse an index file
function loadIndex(pos) {
  const idx = fs.readFileSync(
    path.join(wnDict, `index.${pos}`),
    'utf8'
  );
  return idx
    .split('\n')
    .filter(Boolean)
    .map(line => line.split(' ')[0].toUpperCase());
}

// 1) Collect headwords from all parts of speech
const nouns  = loadIndex('noun');
const verbs  = loadIndex('verb');
const adjs   = loadIndex('adj');
const advs   = loadIndex('adv');

// 2) Merge, dedupe, filter length 4–8
const merged = Array.from(
  new Set([...nouns, ...verbs, ...adjs, ...advs])
).filter(w => w.length >= 4 && w.length <= 8);

// 3) Write to JSON
const outPath = path.join(process.cwd(), 'public', 'words_all.json');
fs.writeFileSync(outPath, JSON.stringify(merged.sort(), null, 2), 'utf8');
console.log(`✅ Built dictionary with ${merged.length} words (4–8 letters)`);
