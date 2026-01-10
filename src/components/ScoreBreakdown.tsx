'use client';

import { useAccount } from 'wagmi';
import { useReputation } from '@/hooks/useReputation';

export function ScoreBreakdown() {
  const { address } = useAccount();
  const { data: reputation, isLoading } = useReputation(address);

  if (!address || isLoading || !reputation) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 animate-pulse">
        <div className="h-6 w-40 bg-zinc-800 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-zinc-800 rounded" />
          <div className="h-16 bg-zinc-800 rounded" />
          <div className="h-16 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  const { breakdown } = reputation;

  return (
    <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wider mb-4">
        Score Breakdown
      </h3>

      <div className="space-y-4">
        {/* Base Tenure */}
        <ScoreItem
          icon="B"
          iconColor="bg-blue-600/20 text-blue-400"
          label="Base Tenure"
          score={breakdown.baseTenure.score}
          detail={`${breakdown.baseTenure.days} days since first tx`}
          percentage={(breakdown.baseTenure.score / reputation.totalScore) * 100}
          barColor="bg-blue-500"
        />

        {/* Zora Mints */}
        <ScoreItem
          icon="Z"
          iconColor="bg-purple-600/20 text-purple-400"
          label="Zora Mints"
          score={breakdown.zoraMints.score}
          detail={`${breakdown.zoraMints.count} NFTs minted`}
          percentage={(breakdown.zoraMints.score / reputation.totalScore) * 100}
          barColor="bg-purple-500"
        />

        {/* Timeliness */}
        <ScoreItem
          icon="⚡"
          iconColor="bg-cyan-600/20 text-cyan-400"
          label="Timeliness Bonus"
          score={breakdown.timeliness.score}
          detail={`${breakdown.timeliness.earlyAdopterCount} early mints (< 24h)`}
          percentage={(breakdown.timeliness.score / reputation.totalScore) * 100}
          barColor="bg-cyan-500"
        />
      </div>

      {/* Formula Info */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">
          Score = Base Tenure + Zora Activity + Timeliness Bonus
        </p>
      </div>
    </div>
  );
}

interface ScoreItemProps {
  icon: string;
  iconColor: string;
  label: string;
  score: number;
  detail: string;
  percentage: number;
  barColor: string;
}

function ScoreItem({ icon, iconColor, label, score, detail, percentage, barColor }: ScoreItemProps) {
  return (
    <div className="p-3 rounded-lg bg-zinc-800/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
            <span className="font-bold text-sm">{icon}</span>
          </div>
          <div>
            <p className="font-semibold text-white">{label}</p>
            <p className="text-xs text-zinc-500">{detail}</p>
          </div>
        </div>
        <span className="text-xl font-bold text-white">+{score}</span>
      </div>
      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
