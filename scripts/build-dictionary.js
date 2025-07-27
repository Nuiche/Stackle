// scripts/build-dictionary.js
const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');
const pkg = require('word-list');

// Resolve the path to the raw word list
const wordListPath =
  typeof pkg === 'string'
    ? pkg
    : (pkg && typeof pkg.default === 'string')
    ? pkg.default
    : (() => { throw new Error('Could not resolve word-list path'); })();

console.log('Reading raw dictionary from', wordListPath);

// Read and normalize the raw list
const raw = fs.readFileSync(wordListPath, 'utf8');
const all = raw
  .split(/\r?\n/)
  .map((w) => w.trim())
  .filter((w) => /^[A-Za-z]+$/.test(w))
  .map((w) => w.toUpperCase());

// Deduplicate and sort
const deduped = Array.from(new Set(all)).sort();

// Inject simple plurals
const withPlurals = deduped.flatMap((w) => {
  const p = pluralize(w.toLowerCase()).toUpperCase();
  return p === w ? [w] : [w, p];
});

// Final dedupe and sort
const finalList = Array.from(new Set(withPlurals)).sort();

// Write out to your public folder
const outPath = path.join(process.cwd(), 'public', 'words_all.json');
fs.writeFileSync(outPath, JSON.stringify(finalList, null, 2), 'utf8');

console.log(`✅ Wrote ${finalList.length} words (including plurals) to ${outPath}`);
