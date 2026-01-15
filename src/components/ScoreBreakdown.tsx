'use client';

import { useAccount } from 'wagmi';
import { useReputation } from '@/hooks/useReputation';

export function ScoreBreakdown() {
  const { address } = useAccount();
  const { data: reputation, isLoading } = useReputation(address);

  if (!address) return null;

  if (isLoading || !reputation) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/3" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Fallback for legacy data structure if pillars aren't present
  const pillars = reputation.pillars || {
    capital: reputation.breakdown?.economic || 0,
    diversity: reputation.breakdown?.diversity || 0,
    identity: reputation.breakdown?.social || 0,
  };

  const decay = reputation.decayInfo;
  const showDecayWarning = decay?.willDecay || (decay?.daysSinceLastActivity || 0) > 30;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Score Breakdown</h3>
        {reputation.multiplier && reputation.multiplier > 1 && (
          <span className="px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full border border-emerald-400/20">
            {reputation.multiplier}x Multiplier
          </span>
        )}
      </div>

      {showDecayWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
          <div className="font-semibold mb-1">Score Decay Active</div>
          <div>
            {decay?.daysSinceLastActivity} days inactive. Perform a transaction to restore your score multiplier.
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <PillarCard
          title="Capital Efficiency"
          score={pillars.capital}
          max={400}
          icon="💰"
          color="bg-emerald-500"
          description="Liquidity duration, volume, gas usage"
        />
        <PillarCard
          title="Ecosystem Diversity"
          score={pillars.diversity}
          max={300}
          icon="🌐"
          color="bg-blue-500"
          description="Unique protocols, vintage contracts"
        />
        <PillarCard
          title="Identity & Social"
          score={pillars.identity}
          max={300}
          icon="🆔"
          color="bg-purple-500"
          description="Farcaster, Coinbase, wallet tenure"
        />
      </div>
    </div>
  );
}

function PillarCard({ title, score, max, icon, color, description }: any) {
  const percentage = Math.min(100, (score / max) * 100);
  
  return (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="font-medium text-white">{title}</div>
            <div className="text-xs text-zinc-500">{description}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-white">{Math.round(score)} / {max}</div>
          <div className="text-xs text-zinc-500">{Math.round(percentage)}%</div>
        </div>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}