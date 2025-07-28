// app/api/seed/route.js

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

/**
 * Returns the EST‑based day key, rolling over at 2 AM EST.
 * If current EST time is before 2 AM, yields yesterday’s date.
 */
function getESTDayKey(date = new Date()) {
  // map to EST
  const estDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/New_York' })
  )
  // subtract 2h so the "day" flips at 2 AM EST
  estDate.setHours(estDate.getHours() - 2)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(estDate)
}

// preload the filtered seed list (4‑ & 5‑letter words)
const filePath = path.join(process.cwd(), 'public', 'good-seeds.json')
const WORDS    = JSON.parse(fs.readFileSync(filePath, 'utf8'))
                   .map(w => w.toUpperCase())
                   .sort()

function hashToUint(str) {
  return crypto.createHash('sha1').update(str).digest().readUInt32BE(0)
}

export function GET(request) {
  // allow ?now= override for testing rollover
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
