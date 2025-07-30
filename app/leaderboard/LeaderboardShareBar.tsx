// app/leaderboard/LeaderboardShareBar.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export type LastResult = { endSeed: string; score: number } | null;

export default function LeaderboardShareBar({ lastResult }: { lastResult: LastResult }) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  const handleShareRank = () => {
    if (!lastResult) {
      alert('No score to share yet.');
      return;
    }
    const { endSeed, score } = lastResult;
    const text = `My daily Lexit score: ${endSeed} → ${score}`;
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied! Please paste to share.'))
      .catch(() => alert('Could not copy to clipboard.'));
  };

  return (
    <div className="absolute top-4 inset-x-0 flex items-center justify-between px-4">
      <button onClick={handleBack} className="text-[#334155] underline">
        ← Back
      </button>
      <button onClick={handleShareRank} className="px-3 py-1 bg-[#3BB2F6] text-white rounded">
        Share Score
      </button>
    </div>
  );
}
