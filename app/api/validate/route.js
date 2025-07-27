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

export async function POST(req) {
  const { guess, currentSeed } = await req.json();
  const up = guess.trim().toUpperCase();

  // 1) Length check
  if (up.length < 4 || up.length > 8) {
    return NextResponse.json(
      { error: 'Words must be between 4 and 8 letters.' },
      { status: 400 }
    );
  }

  // 2) One‑letter‑diff check
  if (!isOneLetterDifferent(currentSeed.toUpperCase(), up)) {
    return NextResponse.json(
      { error: 'Your word must differ by exactly one letter.' },
      { status: 400 }
    );
  }

  // 3) Dictionary check: first static Set
  if (!ALL_WORDS.has(up)) {
    // Try the free dictionary API
    let dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${up.toLowerCase()}`
    );

    // If it’s a simple plural (ends in “S”), try singular form
    if (!dictRes.ok && up.endsWith('S')) {
      const singular = up.slice(0, -1).toLowerCase();
      dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${singular}`
      );
    }

    if (!dictRes.ok) {
      return NextResponse.json(
        { error: `"${guess}" is not a valid English word.` },
        { status: 400 }
      );
    }
  }

  // 4) All checks passed
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
