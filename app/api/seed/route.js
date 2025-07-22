import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export function GET() {
  const filePath = path.join(process.cwd(), 'public', 'words_5.json')
  const json = fs.readFileSync(filePath, 'utf8')
  const words = JSON.parse(json).map(w => w.toUpperCase())
  const daysSinceEpoch = Math.floor(Date.now() / 86400000)
  words.sort()
  const seed = words[daysSinceEpoch % words.length]
  return NextResponse.json({ seed })
}
