'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardClient from './LeaderboardClient';

export default function Page() {
  const router = useRouter();

  // read last game result from localStorage
  const [lastResult, setLastResult] = useState<{ endSeed: string; score: number } | null>(null);

  useEffect(() => {
    const endSeed = localStorage.getItem('lexit_lastEndSeed');
    const scoreStr = localStorage.getItem('lexit_lastScore');
    if (endSeed && scoreStr) {
      const score = parseInt(scoreStr, 10);
      if (!isNaN(score)) setLastResult({ endSeed, score });
    }
  }, []);

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
      <h1 className="mt-16 text-3xl font-bold text-center mb-6">Global Rankings</h1>

      {/* Leaderboard content */}
      <LeaderboardClient />
    </div>
  );
}
