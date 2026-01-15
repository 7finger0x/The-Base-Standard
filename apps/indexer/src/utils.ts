// ============================================
// CONSTANTS
// ============================================

export const EARLY_MINT_WINDOW = 24 * 60 * 60; // 24 hours in seconds
export const EARLY_MINT_BONUS = 100; // Points per early mint

// Tier thresholds
export const TIER_THRESHOLDS = {
  LEGEND: 951,
  BASED: 851,
  BUILDER: 651,
  RESIDENT: 351,
  TOURIST: 0,
} as const;

// ============================================
// TIER CALCULATION
// ============================================

export function getTierFromScore(score: number): string {
  if (score >= TIER_THRESHOLDS.LEGEND) return "LEGEND";
  if (score >= TIER_THRESHOLDS.BASED) return "BASED";
  if (score >= TIER_THRESHOLDS.BUILDER) return "BUILDER";
  if (score >= TIER_THRESHOLDS.RESIDENT) return "RESIDENT";
  return "TOURIST";
}

// ============================================
// TIMELINESS CALCULATION
// ============================================

/**
 * Check if a mint occurred within 24 hours of collection deployment
 */
export function isEarlyMint(mintTimestamp: number, deployTimestamp: number): boolean {
  return (mintTimestamp - deployTimestamp) < EARLY_MINT_WINDOW;
}

// ============================================
// SCORE CALCULATION
// ============================================

export interface ScoreComponents {
  baseScore: number;    // Days on Base
  zoraScore: number;    // Zora mint count * 10
  timelyScore: number;  // Early mints * EARLY_MINT_BONUS
}

export function calculateTotalScore(components: ScoreComponents): bigint {
  return BigInt(
    components.baseScore + 
    components.zoraScore + 
    components.timelyScore
  );
}

/**
 * Calculate Base tenure score
 * 1 point per day since first transaction
 */
export function calculateBaseTenure(firstTxTimestamp: number, currentTimestamp: number): number {
  const secondsPerDay = 86400;
  const daysSinceFirst = Math.floor((currentTimestamp - firstTxTimestamp) / secondsPerDay);
  return Math.max(0, daysSinceFirst);
}

// ============================================
// ADDRESS UTILITIES
// ============================================

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export function isZeroAddress(address: string): boolean {
  return address.toLowerCase() === ZERO_ADDRESS.toLowerCase();
}

export function normalizeAddress(address: string): `0x${string}` {
  return address.toLowerCase() as `0x${string}`;
}
