import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export function GET() {
  const filePath = path.join(process.cwd(), 'public', 'words_5.json')
  const json = fs.readFileSync(filePath, 'utf8')
  const words = JSON.parse(json).map(w => w.toUpperCase())
  return NextResponse.json(words)
}
