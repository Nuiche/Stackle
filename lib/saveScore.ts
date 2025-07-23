// lib/saveScore.ts
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

type Mode = 'daily' | 'endless'

const dayKeyUTC = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'UTC' }) // "2025-07-22"

export async function saveScore(opts: {
  score: number
  mode: Mode
  name: string
}) {
  const { score, mode, name } = opts
  try {
    const docRef = await addDoc(collection(db, 'scores'), {
      score,
      mode,
      name: name?.trim() || 'Anon',
      dayKey: dayKeyUTC(),
      createdAt: serverTimestamp()
    })
    return { ok: true, id: docRef.id }
  } catch (e) {
    console.error('saveScore error:', e)
    return { ok: false, error: (e as Error).message }
  }
}
