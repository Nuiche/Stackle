// scripts/build-seed.js
const fs   = require('fs');
const path = require('path');

// 1. Read the 10k list:
const raw = fs.readFileSync(
  path.join(process.cwd(), 'public', 'google-10000-english.txt'),
  'utf8'
);

// 2. Split, filter exactly 5 letters, uppercase
const fiveLetter = raw
  .split(/\r?\n/)
  .filter(w => w.length === 5)
  .map(w => w.toUpperCase());

// 3. Slice top 2k (or fewer, if under)
const seedList = fiveLetter.slice(0, 2000);

// 4. Write JSON
const out = path.join(process.cwd(), 'public', 'common-seed-5.json');
fs.writeFileSync(out, JSON.stringify(seedList, null, 2), 'utf8');

console.log(`✅ Wrote ${seedList.length} seed words to ${out}`);
