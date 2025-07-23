// lib/getLeaderboard.ts
import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

export type Row = {
  id: string;
  name: string;
  score: number;
  mode: 'daily' | 'endless';
  seed: string;
  startSeed?: string;
  dayKey?: string;
  createdAt?: Timestamp;
};

const scoresRef = collection(db, 'scores');

export async function getDailyLeaderboard(dayKey: string): Promise<Row[]> {
  const q = query(
    scoresRef,
    where('mode', '==', 'daily'),
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(50)
  );
  return docsToRows(await getDocs(q));
}

export async function getEndlessLatest(): Promise<Row[]> {
  const q = query(
    scoresRef,
    where('mode', '==', 'endless'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return docsToRows(await getDocs(q));
}

export async function getAllTime(): Promise<Row[]> {
  const q = query(
    scoresRef,
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(50)
  );
  return docsToRows(await getDocs(q));
}

function docsToRows(snapshot: Awaited<ReturnType<typeof getDocs>>): Row[] {
  return snapshot.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      name: data.name || 'Anon',
      score: data.score || 0,
      mode: data.mode,
      seed: data.seed,
      startSeed: data.startSeed,
      dayKey: data.dayKey,
      createdAt: data.createdAt,
    };
  });
}
