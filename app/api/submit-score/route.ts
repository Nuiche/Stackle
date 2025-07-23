// app/api/submit-score/route.ts
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { saveScore, SaveScorePayload } from '@/lib/saveScore';

type Body = SaveScorePayload;

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    await saveScore(body);
    // bust leaderboard cache
    revalidatePath('/leaderboard');
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || 'fail' }, { status: 500 });
  }
}
