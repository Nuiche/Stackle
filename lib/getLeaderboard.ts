// lib/getLeaderboard.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export type Row = {
  id: string;
  name: string;
  score: number;
  mode: string;
  startSeed?: string;
  endSeed?: string;
  dayKey?: string;
  /** Unix timestamp in milliseconds */
  createdAt: number;
};

/**
 * Helper to map a Firestore document to our Row type,
 * extracting and converting the `createdAt` Timestamp.
 */
function mapDocToRow(doc: QueryDocumentSnapshot): Row {
  const data = doc.data() as any;
  const rawTs = data.createdAt as Timestamp | undefined;
  const createdAt = rawTs instanceof Timestamp ? rawTs.toMillis() : 0;

  return {
    id: doc.id,
    name: data.name,
    score: data.score,
    mode: data.mode,
    startSeed: data.startSeed,
    endSeed: data.endSeed,
    dayKey: data.dayKey,
    createdAt,
  };
}

// Daily (top 15), optionally scoped to a group
export async function getDailyLeaderboard(
  dayKey: string,
  top = 15,
  groupId?: string
): Promise<Row[]> {
  let q;
  if (groupId) {
    q = query(
      collection(db, 'scores'),
      where('mode', '==', 'group'),
      where('groupId', '==', groupId),
      where('dayKey', '==', dayKey),
      orderBy('score', 'desc'),
      orderBy('__name__'),
      limit(top)
    );
  } else {
    q = query(
      collection(db, 'scores'),
      where('mode', '==', 'daily'),
      where('dayKey', '==', dayKey),
      orderBy('score', 'desc'),
      orderBy('__name__'),
      limit(top)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(mapDocToRow);
}

// All-time (top 50)
export async function getAllTime(top = 50): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    orderBy('score', 'desc'),
    orderBy('__name__'),
    limit(top)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapDocToRow);
}

// Most recent (any mode)
export async function getMostRecent(top = 10): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    orderBy('createdAt', 'desc'),
    limit(top)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapDocToRow);
}
