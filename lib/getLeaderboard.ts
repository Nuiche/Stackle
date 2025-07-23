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
  seed?: string
  createdAt?: any
}

function docsToRows(snap: Awaited<ReturnType<typeof getDocs>>): Row[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as DocumentData) })) as Row[]
}

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

export async function getEndlessTop(n = 20): Promise<Row[]> {
  const q = query(
    scoresCol,
    where('mode', '==', 'endless'),
    orderBy('score', 'desc'),
    limit(n)
  )
  return docsToRows(await getDocs(q))
}

export async function getAllTime(n = 20): Promise<Row[]> {
  const q = query(scoresCol, orderBy('score', 'desc'), limit(n))
  return docsToRows(await getDocs(q))
}
