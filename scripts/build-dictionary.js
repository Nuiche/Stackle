// scripts/build-dictionary.js
const fs = require('fs');
const path = require('path');

// Require the 'word-list' package and resolve its file path
const pkg = require('word-list');
const wordListPath =
  typeof pkg === 'string'                ? pkg :
  (pkg && typeof pkg.default === 'string') ? pkg.default :
  (() => { throw new Error('Could not resolve word-list path'); })();

console.log('Reading raw dictionary from', wordListPath);

// Read the raw word list
const raw = fs.readFileSync(wordListPath, 'utf8');

// Split into lines, trim, filter to alphabetic words, uppercase
const all = raw
  .split(/\r?\n/)
  .map(w => w.trim())
  .filter(w => /^[A-Za-z]+$/.test(w))
  .map(w => w.toUpperCase());

// Dedupe and sort
const deduped = Array.from(new Set(all)).sort();

// Write out to public/words_all.json
const outPath = path.join(process.cwd(), 'public', 'words_all.json');
fs.writeFileSync(outPath, JSON.stringify(deduped, null, 2), 'utf8');

console.log(`✅ Wrote ${deduped.length} words to ${outPath}`);
