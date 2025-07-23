// app/api/submit-score/route.ts
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { saveScore, SaveScorePayload } from '@/lib/saveScore';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SaveScorePayload;
    await saveScore(body);
    revalidatePath('/leaderboard');
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'unknown' },
      { status: 500 }
    );
  }
}
