import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export function GET() {
  const filePath = path.join(process.cwd(), 'public', 'words_all.json')
  const json = fs.readFileSync(filePath, 'utf8')
  const words = JSON.parse(json)
  return NextResponse.json(words)
}
