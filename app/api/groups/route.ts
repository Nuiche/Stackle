// app/api/groups/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already
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
 * Create a new group with a unique name, or return 409 + suggestions if taken.
 */
export async function POST(request: Request) {
  try {
    const { name: raw } = await request.json();
    const name = raw?.trim();
    if (!name) {
      return NextResponse.json(
        { ok: false, error: 'invalid-name' },
        { status: 400 }
      );
    }

    const docRef = admin.firestore().collection('groups').doc(name);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      // Name collision → suggest three alternates
      const suggestions = [`${name}1`, `${name}2`, `${name}3`];
      return NextResponse.json(
        { ok: false, error: 'name-taken', suggestions },
        { status: 409 }
      );
    }

    // Create the group
    await docRef.set({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: name });
  } catch (e: any) {
    console.error('groups POST error', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'unknown' },
      { status: 500 }
    );
  }
}
