/**
 * Tier utility functions for The Base Standard
 */

export type TierName = 'TOURIST' | 'BRONZE' | 'SILVER' | 'GOLD' | 'BASED';

export interface TierInfo {
  name: TierName;
  label: string;
  scoreRange: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const TIER_CONFIG: Record<TierName, TierInfo> = {
  TOURIST: {
    name: 'TOURIST',
    label: 'Tourist',
    scoreRange: '0-99',
    minScore: 0,
    maxScore: 99,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
  },
  BRONZE: {
    name: 'BRONZE',
    label: 'Bronze',
    scoreRange: '100-499',
    minScore: 100,
    maxScore: 499,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-600',
  },
  SILVER: {
    name: 'SILVER',
    label: 'Silver',
    scoreRange: '500-849',
    minScore: 500,
    maxScore: 849,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-200 dark:bg-gray-700',
    borderColor: 'border-gray-400 dark:border-gray-500',
  },
  GOLD: {
    name: 'GOLD',
    label: 'Gold',
    scoreRange: '850-950',
    minScore: 850,
    maxScore: 950,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
  },
  BASED: {
    name: 'BASED',
    label: 'Based',
    scoreRange: '951+',
    minScore: 951,
    maxScore: Infinity,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-400 dark:border-blue-600',
  },
};

/**
 * Determines the tier based on a reputation score
 */
export function getTierFromScore(score: number): TierInfo {
  if (score >= 951) return TIER_CONFIG.BASED;
  if (score >= 850) return TIER_CONFIG.GOLD;
  if (score >= 500) return TIER_CONFIG.SILVER;
  if (score >= 100) return TIER_CONFIG.BRONZE;
  return TIER_CONFIG.TOURIST;
}

/**
 * Gets tier configuration by name
 */
export function getTierConfig(tierName: TierName): TierInfo {
  return TIER_CONFIG[tierName];
}

/**
 * Calculates progress within current tier (0-100)
 */
export function getTierProgress(score: number): number {
  const tier = getTierFromScore(score);

  if (tier.maxScore === Infinity) {
    return 100; // Max tier
  }

  const range = tier.maxScore - tier.minScore + 1;
  const progress = score - tier.minScore;

  return Math.min(100, Math.max(0, (progress / range) * 100));
}
