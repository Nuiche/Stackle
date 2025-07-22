import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export function GET() {
  const filePath = path.join(process.cwd(), 'public', 'words_all.json')
  const json = fs.readFileSync(filePath, 'utf8')
  return NextResponse.json(JSON.parse(json), { headers: { 'Cache-Control': 'no-store' } })
}
