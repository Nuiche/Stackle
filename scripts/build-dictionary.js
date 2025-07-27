// scripts/build-dictionary.js
const fs   = require('fs');
const path = require('path');
const natural = require('natural');

// locate the WordNet database shipped by wordnet-db
const wnDict = path.join(
  process.cwd(),
  'node_modules',
  'wordnet-db',
  'dict'
);
const WordNet = natural.WordNet;
const wordnet = new WordNet(wnDict);

// read your raw word sources (e.g. ENABLE, Scrabble dumps, etc.)
// for demo let’s just start from WordNet’s own index
const indexFile = path.join(wnDict, 'index.noun');
const raw = fs.readFileSync(indexFile, 'utf8');

// parse out headwords (WordNet’s “word” column)
const allWords = raw
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => line.split(' ')[0])
  .map(w => w.toUpperCase());

// dedupe & sort
const unique = Array.from(new Set(allWords)).sort();

// write out
const outPath = path.join(process.cwd(), 'public', 'words_all.json');
fs.writeFileSync(outPath, JSON.stringify(unique, null, 2), 'utf8');

console.log(`✅ Wrote ${unique.length} WordNet words to ${outPath}`);
