// app/api/seed/route.js
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

/**
 * Returns the EST‑based day key (YYYY‑MM‑DD), rolling over at 2 AM EST.
 * If the current EST time is before 2 AM, yields yesterday’s date.
 * Uses Intl.formatToParts for accurate DST handling.
 */
function getESTDayKey(date = new Date()) {
  // Format the date in EST with 24h hour
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  })
  // Extract the individual parts
  const parts = fmt.formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, /** @type Record<string,string> */ ({}))

  // Build a UTC timestamp representing that EST local time
  const year   = parseInt(parts.year,   10)
  const month  = parseInt(parts.month,  10)
  const day    = parseInt(parts.day,    10)
  const hour   = parseInt(parts.hour,   10)
  const minute = parseInt(parts.minute, 10)
  const estDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

  // Shift back 2 hours so "day" flips at 2 AM EST
  estDate.setUTCHours(estDate.getUTCHours() - 2)

  // Format back to YYYY‑MM‑DD
  const y = estDate.getUTCFullYear()
  const m = String(estDate.getUTCMonth() + 1).padStart(2, '0')
  const d = String(estDate.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Preload your filtered seed list
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

  console.log(`[SEED] incoming time: ${now.toISOString()}`)
  const dayKey = getESTDayKey(now)
  console.log(`[SEED] computed dayKey: ${dayKey}`)

  const idx  = hashToUint(dayKey) % WORDS.length
  const seed = WORDS[idx]

  return NextResponse.json({ seed, dayKey })
}
