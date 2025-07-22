// lib/getLeaderboard.ts
import { db } from './firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'

export async function getDailyLeaderboard(date: string, top = 10) {
  const q = query(
    collection(db, 'scores'),
    where('date', '==', date),
    where('mode', '==', 'daily'),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(top)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{
    id: string
    uid: string
    score: number
    date: string
    mode: string
  }>
}

export async function getAllTimeLeaderboard(top = 10) {
  const q = query(
    collection(db, 'scores'),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(top)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{
    id: string
    uid: string
    score: number
    date: string
    mode: string
  }>
}
