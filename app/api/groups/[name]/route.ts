// app/api/groups/[name]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ /* same init as above */ });
}

export async function GET(request: Request, { params }: { params: { name: string } }) {
  const { name } = params;
  const snap = await admin.firestore().collection('groups').doc(name).get();
  if (!snap.exists) {
    return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: name });
}
