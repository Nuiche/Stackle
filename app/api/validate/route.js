// app/api/validate/route.js
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Load your static dictionary once at startup
const dictPath = path.join(process.cwd(), 'public', 'words_all.json');
const ALL_WORDS = new Set(
  JSON.parse(fs.readFileSync(dictPath, 'utf8'))
    .map(w => w.toUpperCase())
);

console.log(`[VALIDATE] Loaded static dictionary with ${ALL_WORDS.size} words`);

export async function POST(req) {
  const { guess, currentSeed } = await req.json();
  const up = guess.trim().toUpperCase();
  console.log(`[VALIDATE] Received guess="${guess}", up="${up}", currentSeed="${currentSeed}"`);

  // 1) Length check
  if (up.length < 4 || up.length > 8) {
    console.log(`[VALIDATE] Rejected "${up}" — invalid length (${up.length})`);
    return NextResponse.json(
      { error: 'Words must be between 4 and 8 letters.' },
      { status: 400 }
    );
  }

  // 2) One‑letter‑diff check
  if (!isOneLetterDifferent(currentSeed.toUpperCase(), up)) {
    console.log(`[VALIDATE] Rejected "${up}" — not one‑letter diff from "${currentSeed.toUpperCase()}"`);
    return NextResponse.json(
      { error: 'Your word must differ by exactly one letter.' },
      { status: 400 }
    );
  }

  // 3) Dictionary check: first static Set
  const inStatic = ALL_WORDS.has(up);
  console.log(`[VALIDATE] ALL_WORDS.has("${up}") -> ${inStatic}`);
  let dictResOk = inStatic;

  if (!inStatic) {
    console.log(`[VALIDATE] "${up}" not in static dict, trying API lookup`);
    // Try exact form
    let dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${up.toLowerCase()}`
    );
    console.log(`[VALIDATE] API lookup exact for "${up}" -> ${dictRes.ok}`);

    // If simple plural, try singular
    if (!dictRes.ok && up.endsWith('S')) {
      const singular = up.slice(0, -1).toLowerCase();
      console.log(`[VALIDATE] Exact lookup failed, trying singular "${singular}"`);
      dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${singular}`
      );
      console.log(`[VALIDATE] API lookup singular -> ${dictRes.ok}`);
    }

    dictResOk = dictRes.ok;
  }

  if (!dictResOk) {
    console.log(`[VALIDATE] Rejected "${up}" — not found in static dict or API`);
    return NextResponse.json(
      { error: `"${guess}" is not a valid English word.` },
      { status: 400 }
    );
  }

  // 4) All checks passed
  console.log(`[VALIDATE] Accepted "${up}"`);
  return NextResponse.json({ valid: true });
}

// Helper: returns true if strings differ by exactly one letter
function isOneLetterDifferent(a, b) {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 1) return false;
  }
  return diffs === 1;
}
