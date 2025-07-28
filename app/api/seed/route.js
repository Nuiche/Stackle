// app/api/seed/route.js
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

/**
 * Returns the EST-based day key, rolling over at 2 AM EST.
 * If current EST time is before 2 AM, yields yesterday’s date.
 */
function getESTDayKey(date = new Date()) {
  // Convert to EST
  const estDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/New_York' })
  )
  // Subtract 2 hours so the “day” flips at 2 AM EST
  estDate.setHours(estDate.getHours() - 2)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(estDate)
}

// Load your filtered seed list (4‑ & 5‑letter words)
const filePath = path.join(process.cwd(), 'public', 'good-seeds.json')
const json     = fs.readFileSync(filePath, 'utf8')
const WORDS    = JSON.parse(json).map(w => w.toUpperCase()).sort()

function hashToUint(str) {
  return crypto.createHash('sha1').update(str).digest().readUInt32BE(0)
}

export function GET(req) {
  // Optional `now` override for testing, e.g. ?now=2025-07-28T05:30:00Z
  const { searchParams } = new URL(req.url)
  const nowParam = searchParams.get('now')
  const now = nowParam ? new Date(nowParam) : new Date()

  // Compute the dayKey using 2 AM EST rollover
  const dayKey = getESTDayKey(now)

  // Pick seed deterministically from the list
  const idx  = hashToUint(dayKey) % WORDS.length
  const seed = WORDS[idx]

  return NextResponse.json({ seed, dayKey })
}
