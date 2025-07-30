// app/leaderboard/page.tsx
import React from 'react';
import LeaderboardClient from './LeaderboardClient';
import LeaderboardShareBar, { LastResult } from './LeaderboardShareBar';

export default function Page({
  searchParams,
}: {
  searchParams: {
    endSeed?: string;
    score?: string;
    groupId?: string;
    groupName?: string;
  };
}) {
  const { endSeed, score, groupId, groupName } = searchParams;
  const lastResult: LastResult =
    endSeed && score
      ? { endSeed, score: Number(score) }
      : null;

  return (
    <div className="relative min-h-screen flex flex-col">
      <LeaderboardShareBar lastResult={lastResult} />

      <h1 className="mt-16 text-3xl font-bold text-center mb-6">
        {groupId ? `Group: ${groupName}` : 'Global Rankings'}
      </h1>

      <LeaderboardClient groupId={groupId} />
    </div>
  );
}
