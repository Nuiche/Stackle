// app/api/groups/[name]/route.ts
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
 * GET /api/groups/[name]
 * Validates that a group with this name exists.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const name = parts[parts.length - 1];
    const snapshot = await admin.firestore().collection('groups').doc(name).get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { ok: false, error: 'not-found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, id: name });
  } catch (e: any) {
    console.error('groups GET error', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'unknown' },
      { status: 500 }
    );
  }
}
