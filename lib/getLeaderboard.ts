import { db } from './firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore'

const scoresCol = collection(db, 'scores')

export async function getDailyLeaderboard(dayKey: string, n = 20) {
  const q = query(
    scoresCol,
    where('mode', '==', 'daily'),
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    limit(n)
  )
  return docsToRows(await getDocs(q))
}

export async function getEndlessLatest(n = 20) {
  const q = query(
    scoresCol,
    where('mode', '==', 'endless'),
    orderBy('createdAt', 'desc'),
    limit(n)
  )
  return docsToRows(await getDocs(q))
}

export async function getAllTime(n = 20) {
  const q = query(scoresCol, orderBy('score', 'desc'), limit(n))
  return docsToRows(await getDocs(q))
}

function docsToRows(snap: any) {
  return snap.docs.map((d: any) => ({
    id: d.id,
    ...(d.data() as any)
  }))
}
