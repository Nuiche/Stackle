// app/leaderboard/page.tsx
import React from 'react';
import LeaderboardClient from './LeaderboardClient';
import LeaderboardShareBar, { LastResult } from './LeaderboardShareBar';

export default function Page(props: { searchParams: any }) {
  const { searchParams } = props;
  const endSeed = searchParams.endSeed as string | undefined;
  const scoreStr = searchParams.score as string | undefined;
  const groupId = searchParams.groupId as string | undefined;
  const groupName = searchParams.groupName as string | undefined;

  const lastResult: LastResult =
    endSeed && scoreStr
      ? { endSeed, score: Number(scoreStr) }
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
