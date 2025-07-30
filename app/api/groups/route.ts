// app/api/groups/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import crypto from 'crypto';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  const { name: raw } = await request.json();
  const displayName = raw?.trim();
  if (!displayName) {
    return NextResponse.json({ ok: false, error: 'invalid-name' }, { status: 400 });
  }

  // generate short random suffix
  const suffix = crypto.randomBytes(4).toString('hex'); // 8 hex chars
  const id = `${displayName}-${suffix}`;

  const doc = admin.firestore().collection('groups').doc(id);
  await doc.set({ displayName, createdAt: admin.firestore.FieldValue.serverTimestamp() });

  return NextResponse.json({ ok: true, id, displayName });
}
