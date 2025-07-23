// app/api/submit-score/route.ts
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { saveScore } from '@/lib/saveScore'

export async function POST(req: Request) {
  const body = await req.json()
  const res = await saveScore(body)
  if (res.ok) revalidatePath('/leaderboard')
  return NextResponse.json(res)
}
