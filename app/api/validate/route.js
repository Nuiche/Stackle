// app/api/validate/route.js
import fs   from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const ALL_WORDS = new Set(
  JSON.parse(
    fs.readFileSync(path.join(process.cwd(),'public','words_all.json'),'utf8')
  ).map(w=>w.toUpperCase())
);

export async function POST(req) {
  const { guess, currentSeed } = await req.json();
  const up = guess.toUpperCase();

  if (up.length<4||up.length>8||!isOneLetterDifferent(currentSeed,up))
    return NextResponse.json({error:'Invalid move'}, {status:400});
  if (!ALL_WORDS.has(up))
    return NextResponse.json({error:`"${guess}" is not a valid English word.`},{status:400});

  return NextResponse.json({valid:true});
}

function isOneLetterDifferent(a,b){ /* your existing logic */ }
