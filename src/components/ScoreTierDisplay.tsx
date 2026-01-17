'use client';

import { getTierFromScore } from '@/lib/tiers';
import { cn } from '@/lib/utils';

interface ScoreTierDisplayProps {
  score: number;
  className?: string;
  showProgress?: boolean;
}

/**
 * Displays user's score with their tier badge
 */
export function ScoreTierDisplay({ score, className, showProgress = false }: ScoreTierDisplayProps) {
  const tier = getTierFromScore(score);

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Score Display */}
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Reputation Score</div>
        <div className="text-5xl font-black text-gray-900 dark:text-white">{score}</div>
      </div>

      {/* Tier Badge */}
      <div className={cn(
        'px-4 py-2 rounded-lg border-2 flex flex-col items-center justify-center',
        tier.bgColor,
        tier.borderColor
      )}>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          Your Tier
        </div>
        <div className={cn('text-2xl font-black uppercase', tier.color)}>
          {tier.label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {tier.scoreRange}
        </div>
      </div>

      {/* Progress to Next Tier (Optional) */}
      {showProgress && tier.maxScore !== Infinity && (
        <div className="flex-1 max-w-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Progress to Next Tier
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all', tier.bgColor)}
              style={{
                width: `${Math.min(100, ((score - tier.minScore) / (tier.maxScore - tier.minScore + 1)) * 100)}%`
              }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {tier.maxScore - score} points to {tier.maxScore === 950 ? 'Based' : tier.maxScore === 849 ? 'Gold' : tier.maxScore === 499 ? 'Silver' : 'Bronze'}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version - just tier badge
 */
export function TierBadgeCompact({ score, className }: { score: number; className?: string }) {
  const tier = getTierFromScore(score);

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
      tier.bgColor,
      tier.borderColor,
      className
    )}>
      <span className={cn('text-xs font-bold uppercase', tier.color)}>
        {tier.label}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {tier.scoreRange}
      </span>
    </div>
  );
}
