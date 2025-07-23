import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

function getESTDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const filePath = path.join(process.cwd(), 'public', 'words_5.json')
const json = fs.readFileSync(filePath, 'utf8')
const WORDS = JSON.parse(json).map(w => w.toUpperCase()).sort()

function hashToUint(str) {
  return crypto.createHash('sha1').update(str).digest().readUInt32BE(0)
}

export function GET() {
  const now = new Date()
  const estPlusOneMinute = new Date(now.getTime() + 60 * 1000)
  const dayKey = getESTDayKey(estPlusOneMinute)

  const idx = hashToUint(dayKey) % WORDS.length
  const seed = WORDS[idx]

  return NextResponse.json({ seed, dayKey })
}
