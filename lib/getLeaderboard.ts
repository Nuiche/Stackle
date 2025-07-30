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

/** Daily (top 15), optionally scoped to a group */
export async function getDailyLeaderboard(
  dayKey: string,
  top = 15,
  groupId?: string
): Promise<Row[]> {
  const base = collection(db, 'scores');
  const common = [
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    orderBy('__name__'),
    limit(top),
  ];
  const q = groupId
    ? query(
        base,
        where('mode', '==', 'group'),
        where('groupId', '==', groupId),
        ...common
      )
    : query(
        base,
        where('mode', '==', 'daily'),
        ...common
      );
  const snap = await getDocs(q);
  return snap.docs.map(mapDocToRow);
}

/** Recent games (top N), optionally scoped to a group */
export async function getMostRecent(
  top = 10,
  groupId?: string
): Promise<Row[]> {
  const base = collection(db, 'scores');
  const common = [orderBy('createdAt', 'desc'), limit(top)];
  const q = groupId
    ? query(
        base,
        where('mode', '==', 'group'),
        where('groupId', '==', groupId),
        ...common
      )
    : query(base, ...common);
  const snap = await getDocs(q);
  return snap.docs.map(mapDocToRow);
}

/** All-time top scores (top N), optionally scoped to a group */
export async function getAllTime(
  top = 50,
  groupId?: string
): Promise<Row[]> {
  const base = collection(db, 'scores');
  const common = [orderBy('score', 'desc'), orderBy('__name__'), limit(top)];
  const q = groupId
    ? query(
        base,
        where('mode', '==', 'group'),
        where('groupId', '==', groupId),
        ...common
      )
    : query(base, ...common);
  const snap = await getDocs(q);
  return snap.docs.map(mapDocToRow);
}
