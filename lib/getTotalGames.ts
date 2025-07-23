// lib/getTotalGames.ts
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from './firebase'

export async function getTotalGames() {
  const coll = collection(db, 'scores')
  const snap = await getCountFromServer(coll)
  return snap.data().count
}
