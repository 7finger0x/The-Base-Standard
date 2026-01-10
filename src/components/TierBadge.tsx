'use client';

import { cn } from '@/lib/utils';

type Tier = 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'BASED';

interface TierBadgeProps {
  tier: Tier | string;
  score?: number;
  mini?: boolean;
  className?: string;
}

const tierConfig: Record<Tier, { color: string; bg: string; glow: string; min: number }> = {
  Novice: {
    color: 'text-zinc-400',
    bg: 'bg-zinc-800',
    glow: '',
    min: 0,
  },
  Bronze: {
    color: 'text-amber-600',
    bg: 'bg-amber-900/20',
    glow: 'shadow-amber-500/20',
    min: 100,
  },
  Silver: {
    color: 'text-slate-300',
    bg: 'bg-slate-600/20',
    glow: 'shadow-slate-400/20',
    min: 500,
  },
  Gold: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-600/20',
    glow: 'shadow-yellow-400/30',
    min: 850,
  },
  BASED: {
    color: 'text-cyan-400',
    bg: 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30',
    glow: 'shadow-cyan-500/40',
    min: 1000,
  },
};

export function TierBadge({ tier, score, mini, className }: TierBadgeProps) {
  const config = tierConfig[tier as Tier] ?? tierConfig.Novice;

  if (mini) {
    return (
      <div
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider',
          config.bg,
          config.color,
          className
        )}
      >
        {tier}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-zinc-800 text-center transition-all',
        config.bg,
        config.glow && `shadow-lg ${config.glow}`,
        className
      )}
    >
      <div className={cn('text-2xl font-black', config.color)}>{tier}</div>
      {score !== undefined && (
        <div className="text-sm text-zinc-500 mt-1">{score}+ pts</div>
      )}
      <div className="text-xs text-zinc-600 mt-2">Min: {config.min}</div>
    </div>
  );
}

export function TierCard({ tier, score }: { tier: Tier; score: number }) {
  return <TierBadge tier={tier} score={score} />;
}
