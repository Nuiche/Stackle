import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

/**
 * Return YYYY-MM-DD for America/New_York (EST/EDT) zone.
 */
function getESTDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

// Load and cache the word list once
const filePath = path.join(process.cwd(), 'public', 'words_5.json')
const json = fs.readFileSync(filePath, 'utf8')
const WORDS = JSON.parse(json).map(w => w.toUpperCase()).sort()

function hashToUint(str) {
  return crypto.createHash('sha1').update(str).digest().readUInt32BE(0)
}

export function GET() {
  // Add 1 minute so the reset happens at 12:01am EST
  const now = new Date()
  const estPlusOneMinute = new Date(now.getTime() + 60 * 1000)
  const dayKey = getESTDayKey(estPlusOneMinute)

  const idx = hashToUint(dayKey) % WORDS.length
  const seed = WORDS[idx]

  return NextResponse.json({ seed, dayKey })
}
