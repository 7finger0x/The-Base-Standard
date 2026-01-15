'use client';

import { useAccount } from 'wagmi';
import { useReputation } from '@/hooks/useReputation';
import { TierBadge } from '@/components/TierBadge';

export function RankCard() {
  const { address } = useAccount();
  const { data: reputation, isLoading } = useReputation(address);

  if (!address) {
    return (
      <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 text-center">
        <p className="text-gray-500">Connect wallet to view rank</p>
      </div>
    );
  }

  if (isLoading || !reputation) {
    return (
      <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-24 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Use pillars if available, otherwise fallback to legacy breakdown
  const pillars = reputation.pillars || {
    capital: reputation.breakdown?.economic || 0,
    diversity: reputation.breakdown?.diversity || 0,
    identity: reputation.breakdown?.social || 0,
  };

  const maxPillarScores = {
    capital: 400,
    diversity: 300,
    identity: 300,
  };

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Current Rank
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              #{reputation.rank?.toLocaleString() ?? '---'}
            </span>
            <span className="text-sm text-gray-500">
              of {reputation.totalUsers?.toLocaleString() ?? '---'}
            </span>
          </div>
        </div>
        <TierBadge tier={reputation.tier} />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-gray-500">Total Score</span>
          <span className="text-2xl font-bold text-gray-900">{reputation.totalScore}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (reputation.totalScore / 1000) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0</span>
          <span>1000</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PillarStat 
          label="Capital" 
          score={pillars.capital} 
          max={maxPillarScores.capital}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
          borderColor="border-emerald-400/20"
        />
        <PillarStat 
          label="Diversity" 
          score={pillars.diversity} 
          max={maxPillarScores.diversity}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
          borderColor="border-blue-400/20"
        />
        <PillarStat 
          label="Identity" 
          score={pillars.identity} 
          max={maxPillarScores.identity}
          color="text-purple-400"
          bgColor="bg-purple-400/10"
          borderColor="border-purple-400/20"
        />
      </div>
    </div>
  );
}

function PillarStat({ 
  label, 
  score, 
  max, 
  color, 
  bgColor, 
  borderColor 
}: { 
  label: string; 
  score: number; 
  max: number; 
  color: string; 
  bgColor: string; 
  borderColor: string;
}) {
  return (
    <div className={`p-3 rounded-xl border ${borderColor} ${bgColor} flex flex-col items-center text-center`}>
      <span className={`text-xs font-medium ${color} mb-1`}>{label}</span>
      <span className="text-lg font-bold text-gray-900">{Math.round(score)}</span>
      <span className="text-[10px] text-gray-500">/ {max}</span>
    </div>
  );
}