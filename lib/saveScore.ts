// lib/saveScore.ts
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type SaveScorePayload = {
  name: string;
  mode: 'daily' | 'endless';
  score: number;
  seed: string;
  dayKey?: string;
};

export type SaveScoreResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function saveScore(
  payload: SaveScorePayload
): Promise<SaveScoreResult> {
  try {
    const ref = await addDoc(collection(db, 'scores'), {
      ...payload,
      createdAt: serverTimestamp(),
      _name_: payload.name.toLowerCase(),
    });
    return { ok: true, id: ref.id };
  } catch (e: any) {
    console.error('saveScore error:', e);
    return { ok: false, error: e?.message || 'unknown' };
  }
}
