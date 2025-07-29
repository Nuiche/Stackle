// app/api/groups/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * POST /api/groups
 */
export async function POST(request: Request) {
  const { name: raw } = await request.json();
  const name = raw?.trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: 'invalid-name' }, { status: 400 });
  }

  const docRef = admin.firestore().collection('groups').doc(name);
  const snapshot = await docRef.get();
  if (snapshot.exists) {
    return NextResponse.json(
      { ok: false, error: 'name-taken', suggestions: [`${name}1`, `${name}2`, `${name}3`] },
      { status: 409 }
    );
  }

  await docRef.set({ name, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return NextResponse.json({ ok: true, id: name });
}
