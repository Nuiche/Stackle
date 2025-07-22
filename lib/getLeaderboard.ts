// lib/getLeaderboard.ts
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore'

export type Row = {
  id: string
  uid: string
  name?: string
  score: number
  date: string
  mode: string
  createdAt?: unknown
}

const mapDocs = (snap: QuerySnapshot<DocumentData>) =>
  snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Row, 'id'>) }))

export async function getDailyLeaderboard(date: string, top = 20): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    where('date', '==', date),
    where('mode', '==', 'daily'),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(top)
  )
  return mapDocs(await getDocs(q))
}

export async function getEndlessLeaderboard(top = 20): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    where('mode', '==', 'endless'),
    orderBy('createdAt', 'desc'),
    limit(top)
  )
  return mapDocs(await getDocs(q))
}

export async function getAllTimeLeaderboard(top = 20): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(top)
  )
  return mapDocs(await getDocs(q))
}

/* Wrappers so your new page code compiles */
export async function getEndlessLatest(top = 20) {
  return getEndlessLeaderboard(top)
}
export async function getAllTime(top = 20) {
  return getAllTimeLeaderboard(top)
}
