// app/api/seed/route.js
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Returns the EST-based day key, rolling over at 2 AM EST.
 * If current EST time is before 2 AM, yields yesterday’s date.
 */
function getESTDayKey(date = new Date()) {
  const estDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/New_York' })
  )
  estDate.setHours(estDate.getHours() - 2)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(estDate)
}

// Preload your 4/5‑letter seed pool
const filePath = path.join(process.cwd(), 'public', 'good-seeds.json')
const WORDS    = JSON.parse(fs.readFileSync(filePath, 'utf8'))
                   .map(w => w.toUpperCase())
                   .sort()

function hashToUint(str) {
  return crypto.createHash('sha1').update(str).digest().readUInt32BE(0)
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const nowParam = searchParams.get('now')
  const now      = nowParam ? new Date(nowParam) : new Date()

  console.log(`[SEED] now=${now.toISOString()}`)
  const dayKey = getESTDayKey(now)
  console.log(`[SEED] dayKey=${dayKey}`)

  const idx  = hashToUint(dayKey) % WORDS.length
  const seed = WORDS[idx]

  return NextResponse.json({ seed, dayKey })
}
