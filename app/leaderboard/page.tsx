// app/leaderboard/page.tsx
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 120;

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 text-[#334155]">
      <LeaderboardClient />
    </div>
  );
}
