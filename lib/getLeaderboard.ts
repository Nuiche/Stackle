import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'

type Row = {
  id: string
  uid: string
  score: number
  date: string
  mode: string
}

const mapDocs = (snap: any) =>
  snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as Omit<Row, 'id'>) }))

export async function getDailyLeaderboard(date: string, top = 10): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    where('date', '==', date),
    where('mode', '==', 'daily'),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(top)
  )
  const snap = await getDocs(q)
  return mapDocs(snap)
}

export async function getEndlessLeaderboard(top = 10): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    where('mode', '==', 'endless'),
    orderBy('createdAt', 'desc'),
    limit(top)
  )
  const snap = await getDocs(q)
  return mapDocs(snap)
}

export async function getAllTimeLeaderboard(top = 10): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(top)
  )
  const snap = await getDocs(q)
  return mapDocs(snap)
}
