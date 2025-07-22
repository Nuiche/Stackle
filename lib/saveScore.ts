import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getUserId } from '@/lib/user'

export async function saveScore({
  mode,
  score,
  name,
}: {
  mode: 'daily' | 'endless'
  score: number
  name: string
}) {
  const uid = getUserId()
  const today = new Date().toISOString().slice(0, 10)

  const payload = {
    uid,
    name: name.trim().slice(0, 16) || 'Anon',
    mode,
    score,
    date: today,
    createdAt: serverTimestamp(),
  }

  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined) throw new Error(`Field "${k}" is undefined`)
  }

  await addDoc(collection(db, 'scores'), payload)
}
