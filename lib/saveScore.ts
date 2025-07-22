import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getUserId } from './user'

export async function saveScore({ mode, score }: { mode: 'daily' | 'endless'; score: number }) {
  try {
    const uid = getUserId()
    const today = new Date().toISOString().slice(0, 10)

    const payload = {
      uid,
      mode,
      score,
      date: today,
      createdAt: serverTimestamp(),
    }

    // Detect undefined (Firestore rejects undefined)
    for (const [k, v] of Object.entries(payload)) {
      if (v === undefined) {
        throw new Error(`Field "${k}" is undefined`)
      }
    }

    console.log('Submitting score payload:', payload)
    await addDoc(collection(db, 'scores'), payload)
  } catch (e: unknown) {
    console.error('saveScore error:', e)
    throw e
  }
}
