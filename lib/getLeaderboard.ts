// lib/getLeaderboard.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

export async function getDailyLeaderboard(dayKey: string) {
  const ref = collection(db, 'scores');
  const q = query(
    ref,
    where('mode', '==', 'daily'),
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(15)               // <-- cap at 15
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
