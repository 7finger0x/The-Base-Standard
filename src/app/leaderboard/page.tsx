'use client';

import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
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
    <div className="min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">
        <div className="px-12 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-black text-gray-900 mb-6">Leaderboard</h1>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-6">Address</div>
                  <div className="col-span-2 text-right">Score</div>
                  <div className="col-span-3 text-right">Tier</div>
                </div>

                {/* Leaderboard Rows */}
                <div className="divide-y divide-gray-200">
                  {data?.leaderboard.map((entry) => (
                    <LeaderboardRow key={entry.rank} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;
  const rankColors: Record<number, string> = {
    1: 'text-yellow-600',
    2: 'text-gray-500',
    3: 'text-amber-600',
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
      <div className={`col-span-1 font-bold ${rankColors[entry.rank] || 'text-gray-700'}`}>
        {isTop3 ? (
          <span className="text-lg">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
        ) : (
          `#${entry.rank}`
        )}
      </div>
      <div className="col-span-6 font-mono text-sm text-gray-900">
        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
      </div>
      <div className="col-span-2 text-right font-bold text-gray-900">
        {entry.score.toLocaleString()}
      </div>
      <div className="col-span-3 flex justify-end">
        <TierBadge tier={entry.tier} size="sm" />
      </div>
    </div>
  );
}
