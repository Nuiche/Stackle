// scripts/build-dictionary.js
const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');
const pkg = require('word-list');

// Resolve raw list path
const wordListPath =
  typeof pkg === 'string'         ? pkg :
  (pkg && typeof pkg.default==='string') ? pkg.default :
  (() => { throw new Error('Could not resolve word-list path'); })();

console.log('Reading raw dictionary from', wordListPath);

// Read and normalize
const raw = fs.readFileSync(wordListPath, 'utf8');
const all = raw
  .split(/\r?\n/)
  .map(w => w.trim())
  .filter(w => /^[A-Za-z]+$/.test(w))
  .map(w => w.toUpperCase());

// Dedupe & sort
const deduped = Array.from(new Set(all)).sort();

// Inject simple plurals
const withPlurals = deduped.flatMap(w => {
  const p = pluralize(w.toLowerCase()).toUpperCase();
  return p===w ? [w] : [w,p];
});

// Final dedupe & sort
const allWords = Array.from(new Set(withPlurals)).sort();

// FILTER to 4–8 letters only
const filtered = allWords.filter(w => w.length >= 4 && w.length <= 8);

console.log(`Keeping ${filtered.length} of ${allWords.length} total words (length 4–8).`);

// Write out
const outPath = path.join(process.cwd(), 'public', 'words_all.json');
fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf8');

console.log(`✅ Wrote filtered dictionary to ${outPath}`);
