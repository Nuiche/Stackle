'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LeaderboardClient from './LeaderboardClient';

// Subcomponent wrapped in Suspense for useSearchParams
function LeaderboardShareBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const endSeed = searchParams.get('endSeed');
  const score = searchParams.get('score');
  const lastResult = endSeed && score ? { endSeed, score: parseInt(score, 10) } : null;

  const handleShareRank = () => {
    if (!lastResult) {
      alert('No score to share yet.');
      return;
    }
    const { endSeed, score } = lastResult;
    const text = `My daily Lexit score: ${endSeed} -> ${score}`;
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied! Please paste to share.'))
      .catch(() => alert('Could not copy to clipboard.'));
  };

  return (
    <div className="absolute top-4 inset-x-0 flex items-center justify-between px-4">
      <button
        onClick={() => router.push('/')}
        className="text-[#334155] underline"
      >
        ← Back
      </button>
      <button
        onClick={handleShareRank}
        className="px-3 py-1 bg-[#3BB2F6] text-white rounded"
      >
        Share Score
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Back & Share buttons in Suspense boundary */}
      <Suspense>
        <LeaderboardShareBar />
      </Suspense>

      {/* Title pushed down */}
      <h1 className="mt-16 text-3xl font-bold text-center mb-6">Global Rankings</h1>

      {/* Leaderboard content */}
      <LeaderboardClient />
    </div>
  );
}
