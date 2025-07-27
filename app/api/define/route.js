// app/api/define/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('word')?.trim().toLowerCase();
  if (!raw) {
    return NextResponse.json(
      { error: 'No word provided' },
      { status: 400 }
    );
  }

  // 1) Try exact form
  let res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${raw}`
  );

  // 2) If not found and it's a simple plural, try the singular form
  if (!res.ok && raw.endsWith('s')) {
    const singular = raw.slice(0, -1);
    const alt = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${singular}`
    );
    if (alt.ok) {
      res = alt;
    }
  }

  // 3) If still not ok, return a 404 error
  if (!res.ok) {
    return NextResponse.json(
      { error: `"${searchParams.get('word')}" not found` },
      { status: 404 }
    );
  }

  // 4) Parse and collect up to 5 definitions
  const entries = await res.json();
  const definitions = entries[0]?.meanings
    .flatMap(m => m.definitions.map(d => d.definition))
    .slice(0, 5) || [];

  // 5) Respond with the original word in uppercase and its definitions
  return NextResponse.json({
    word: raw.toUpperCase(),
    definitions
  });
}
