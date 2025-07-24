// app/leaderboard/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardClient from './LeaderboardClient';

export default function Page() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Back button in top‑left */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 text-[#334155] underline"
      >
        ← Back
      </button>

      {/* Your existing leaderboard client */}
      <LeaderboardClient />
    </div>
  );
}
