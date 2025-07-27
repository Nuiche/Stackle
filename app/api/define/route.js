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

  // Lookup against free dictionary API
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${raw}`);
  if (!res.ok) {
    return NextResponse.json(
      { error: `"${searchParams.get('word')}" not found` },
      { status: 404 }
    );
  }

  const entries = await res.json();
  // Flatten first entry's definitions
  const definitions = entries[0]?.meanings
    .flatMap(m => m.definitions.map(d => d.definition))
    .slice(0, 5) || [];

  return NextResponse.json({
    word: raw.toUpperCase(),
    definitions
  });
}
