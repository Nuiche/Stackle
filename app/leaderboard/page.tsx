'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardClient from './LeaderboardClient';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const endSeed = searchParams.get('endSeed');
  const scoreParam = searchParams.get('score');
  const lastResult = endSeed && scoreParam
    ? { endSeed, score: parseInt(scoreParam, 10) }
    : null;

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
    <div className="relative min-h-screen flex flex-col">
      {/* Back & Share buttons */}
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

      {/* Title pushed down */}
      <h1 className="mt-16 text-3xl font-bold text-center mb-6">
        Global Rankings
      </h1>

      {/* Leaderboard content */}
      <LeaderboardClient />
    </div>
  );
}
