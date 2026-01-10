'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TierBadge } from '@/components/TierBadge';

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  tier: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

async function fetchLeaderboard(limit = 100, offset = 0): Promise<LeaderboardData> {
  const res = await fetch(`/api/leaderboard?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => fetchLeaderboard(100, 0),
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm sticky top-0 z-10 bg-black/80">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">BR</span>
            </div>
            <span className="font-bold text-gradient">BaseRank</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-400">Leaderboard</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-zinc-500 uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-6">Address</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-3 text-right">Tier</div>
            </div>

            {/* Leaderboard Rows */}
            {data?.leaderboard.map((entry) => (
              <LeaderboardRow key={entry.rank} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;
  const rankColors: Record<number, string> = {
    1: 'text-yellow-400',
    2: 'text-slate-300',
    3: 'text-amber-600',
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors items-center">
      <div className={`col-span-1 font-bold ${rankColors[entry.rank] || 'text-zinc-400'}`}>
        {isTop3 ? (
          <span className="text-lg">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
        ) : (
          `#${entry.rank}`
        )}
      </div>
      <div className="col-span-6 font-mono text-sm text-zinc-300">
        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
      </div>
      <div className="col-span-2 text-right font-bold text-white">
        {entry.score.toLocaleString()}
      </div>
      <div className="col-span-3 flex justify-end">
        <TierBadge tier={entry.tier} mini />
      </div>
    </div>
  );
}
