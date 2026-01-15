'use client';

interface TierConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  range: string;
}

const TIER_CONFIG: Record<string, TierConfig> = {
  LEGEND: {
    label: 'LEGEND',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/50',
    description: 'Top 1% Ecosystem Leaders',
    range: '951-1000'
  },
  BASED: {
    label: 'BASED',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/50',
    description: 'Top 5% Elite (Hard Gate)',
    range: '851-950'
  },
  BUILDER: {
    label: 'BUILDER',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/50',
    description: 'Power Users with Diversity',
    range: '651-850'
  },
  RESIDENT: {
    label: 'RESIDENT',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/50',
    description: 'Average Active Users',
    range: '351-650'
  },
  TOURIST: {
    label: 'TOURIST',
    color: 'text-zinc-400',
    bg: 'bg-zinc-400/10',
    border: 'border-zinc-400/50',
    description: 'Low Retention / One-time',
    range: '0-350'
  }
};

export function TierBadge({ tier, size = 'md' }: { tier: string; size?: 'sm' | 'md' | 'lg' }) {
  const normalizedTier = tier?.toUpperCase() || 'TOURIST';
  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG['TOURIST'];
  
  const isLegend = normalizedTier === 'LEGEND';
  const isBased = normalizedTier === 'BASED';

  return (
    <div className="flex flex-col items-end">
      <div className={`
        inline-flex items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300
        ${config.color} ${config.bg} ${config.border}
        ${size === 'lg' ? 'px-4 py-1.5 text-sm font-bold' : 'px-3 py-1 text-xs font-bold'}
        ${isLegend ? 'animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.3)]' : ''}
        ${isBased ? 'shadow-[0_0_10px_rgba(34,211,238,0.2)]' : ''}
      `}>
        {config.label}
      </div>
      {size !== 'sm' && (
        <div className="text-right mt-1">
          <div className="text-[10px] text-zinc-400">{config.description}</div>
          <div className="text-[9px] text-zinc-600 font-mono">{config.range} pts</div>
        </div>
      )}
    </div>
  );
}