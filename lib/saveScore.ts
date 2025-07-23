import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getESTDayKey } from './dayKey'

type Payload = {
  mode: 'daily' | 'endless'
  score: number
  name: string
  seed: string
}

export async function saveScore({ mode, score, name, seed }: Payload) {
  const scores = collection(db, 'scores')
  const data: any = {
    mode,
    score,
    name: name?.trim() || 'Anon',
    seed,
    createdAt: serverTimestamp()
  }
  if (mode === 'daily') {
    data.dayKey = getESTDayKey()
  }
  await addDoc(scores, data)
}
