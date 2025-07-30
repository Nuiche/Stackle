// app/api/submit-score/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import admin from 'firebase-admin';

// Initialize the admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data: any = {
      name: body.name,
      mode: body.mode,
      score: body.score,
      startSeed: body.startSeed,
      endSeed: body.endSeed,
      dayKey: body.dayKey ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (body.groupId) data.groupId = body.groupId;

    const docRef = await admin
      .firestore()
      .collection('scores')
      .add(data);

    // Revalidate the leaderboard page cache
    revalidatePath('/leaderboard');

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (e: any) {
    console.error('submit-score error', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'unknown' },
      { status: 500 }
    );
  }
}
