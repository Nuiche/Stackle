import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { saveScore } from '@/lib/saveScore'

export const dynamic = 'force-dynamic' // allow revalidatePath in prod

type Body = {
  mode: 'daily' | 'endless'
  score: number
  name: string
  seed: string
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()
    await saveScore(body)
    // Bust leaderboard cache
    revalidatePath('/leaderboard')
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('submit-score error', err)
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'unknown error' },
      { status: 500 }
    )
  }
}
