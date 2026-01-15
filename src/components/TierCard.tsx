'use client';

import { cn } from '@/lib/utils';

interface TierCardProps {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'BASED';
  score: string;
  descriptor: string;
  className?: string;
}

const TIER_CONFIG = {
  BRONZE: {
    border: 'border-orange-500/50',
    glow: 'shadow-orange-500/20',
    text: 'text-orange-400',
    bg: 'bg-gradient-to-br from-orange-950/50 to-amber-950/50',
    lightning: 'from-orange-500/30 to-yellow-500/30',
  },
  SILVER: {
    border: 'border-gray-400/50',
    glow: 'shadow-gray-400/20',
    text: 'text-gray-300',
    bg: 'bg-gradient-to-br from-gray-900/50 to-slate-900/50',
    lightning: 'from-white/30 to-blue-500/30',
  },
  GOLD: {
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/20',
    text: 'text-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-950/50 to-amber-950/50',
    lightning: 'from-yellow-500/30 to-gold-500/30',
  },
  BASED: {
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/20',
    text: 'text-purple-400',
    bg: 'bg-gradient-to-br from-purple-950/50 to-blue-950/50',
    lightning: 'from-purple-500/30 to-blue-500/30',
  },
};

export function TierCard({ tier, score, descriptor, className }: TierCardProps) {
  const config = TIER_CONFIG[tier];
  const isBased = tier === 'BASED';

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 overflow-hidden',
        config.border,
        config.bg,
        className
      )}
    >
      {/* Circuit board pattern background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`circuit-${tier}`} patternUnits="userSpaceOnUse" width="20" height="20">
              <path
                d="M0 10h20M10 0v20"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                className={config.text}
              />
              <circle cx="10" cy="10" r="1" fill="currentColor" className={config.text} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#circuit-${tier})`} />
        </svg>
      </div>

      {/* Lightning bolt effects */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-30',
          config.lightning
        )}
      />

      {/* Content */}
      <div className="relative p-6 flex flex-col items-center text-center">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
          {isBased ? 'THE BASED STANDARD' : 'THE BASE STANDARD'}
        </div>

        {/* Hexagonal logo */}
        <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex flex-col items-center justify-center relative">
            <div className="text-white font-black text-2xl leading-none flex items-center gap-0.5">
              <span>B</span>
              <span className="relative">
                S
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] leading-none">
                  ↑↑↑
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className={cn('text-lg font-bold mb-1', config.text)}>
          {isBased ? 'STATUS: BASED' : `TIER: ${tier}`}
        </div>
        {!isBased && (
          <div className="text-sm text-zinc-400 mb-4 font-mono">SCORE: {score}</div>
        )}
        <div className={cn('text-sm font-semibold', config.text)}>{descriptor}</div>
      </div>

      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg pointer-events-none',
          config.glow,
          'shadow-[0_0_30px_rgba(0,0,0,0.5)]'
        )}
      />
    </div>
  );
}
