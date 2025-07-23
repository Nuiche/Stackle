// lib/getLeaderboard.ts
import { db } from './firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  DocumentData
} from 'firebase/firestore'

const scoresCol = collection(db, 'scores')

export type Row = {
  id: string
  name?: string
  score: number
  mode?: 'daily' | 'endless'
  dayKey?: string
  createdAt?: any
}

function docsToRows(snap: Awaited<ReturnType<typeof getDocs>>): Row[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as DocumentData) })) as Row[]
}

/** Daily leaderboard for a specific dayKey (YYYY-MM-DD) */
export async function getDailyLeaderboard(dayKey: string, n = 20): Promise<Row[]> {
  const q = query(
    scoresCol,
    where('mode', '==', 'daily'),
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    limit(n)
  )
  return docsToRows(await getDocs(q))
}

/** Endless – newest submissions (kept if you still want it somewhere) */
export async function getEndlessLatest(n = 20): Promise<Row[]> {
  const q = query(
    scoresCol,
    where('mode', '==', 'endless'),
    orderBy('createdAt', 'desc'),
    limit(n)
  )
  return docsToRows(await getDocs(q))
}

/** Endless – TOP scores (this is the one you’ll display) */
export async function getEndlessTop(n = 20): Promise<Row[]> {
  const q = query(
    scoresCol,
    where('mode', '==', 'endless'),
    orderBy('score', 'desc'),
    limit(n)
  )
  return docsToRows(await getDocs(q))
}

/** All-time top scores across modes */
export async function getAllTime(n = 20): Promise<Row[]> {
  const q = query(scoresCol, orderBy('score', 'desc'), limit(n))
  return docsToRows(await getDocs(q))
}
