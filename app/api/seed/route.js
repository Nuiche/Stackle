// app/api/seed/route.js
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

/**
 * Returns the EST‑based day key, rolling over at 2 AM EST.
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

// Pre‑load your filtered seed list
const filePath = path.join(process.cwd(), 'public', 'good-seeds.json')
const WORDS    = JSON.parse(fs.readFileSync(filePath, 'utf8'))
                   .map(w => w.toUpperCase())
                   .sort()

function hashToUint(str) {
  return crypto.createHash('sha1').update(str).digest().readUInt32BE(0)
}

export function GET(request) {
  // 1) grab optional now= override
  const { searchParams } = new URL(request.url)
  const nowParam = searchParams.get('now')
  const now      = nowParam ? new Date(nowParam) : new Date()

  console.log(`[SEED] incoming time: ${now.toISOString()}`)

  // 2) compute the dayKey with 2 AM EST rollover
  const dayKey = getESTDayKey(now)
  console.log(`[SEED] computed dayKey: ${dayKey}`)

  // 3) pick the seed
  const idx  = hashToUint(dayKey) % WORDS.length
  const seed = WORDS[idx]

  return NextResponse.json({ seed, dayKey })
}
