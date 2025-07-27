// app/api/seed/route.js
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

/**
 * Returns the EST-based day key, rolling over at 2 AM EST.
 * If current EST time is before 2 AM, yields yesterday’s date.
 */
function getESTDayKey(date = new Date()) {
  // Convert to EST timezone
  const estDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/New_York' })
  )
  // Subtract 2 hours so the day changes at 2 AM EST
  estDate.setHours(estDate.getHours() - 2)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(estDate)
}

// Load filtered seeds (4- & 5-letter words)
const filePath = path.join(process.cwd(), 'public', 'good-seeds.json')
const json = fs.readFileSync(filePath, 'utf8')
const WORDS = JSON.parse(json).map(w => w.toUpperCase()).sort()

function hashToUint(str) {
  return crypto.createHash('sha1').update(str).digest().readUInt32BE(0)
}

export function GET() {
  const now = new Date()
  // Compute the key for today's seed, switching at 2 AM EST
  const dayKey = getESTDayKey(now)

  // Derive a pseudo-random index from the dayKey
  const idx = hashToUint(dayKey) % WORDS.length
  const seed = WORDS[idx]

  return NextResponse.json({ seed, dayKey })
}
