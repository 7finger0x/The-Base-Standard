import 'server-only';

/**
 * Provable Value Contribution (PVC) Framework
 * 
 * Replaces linear tenure model with multi-dimensional scoring that:
 * - Rewards active participation over passive existence
 * - Uses logarithmic/quadratic functions to prevent whale dominance
 * - Integrates social graph theory for Sybil resistance
 * - Implements quality-weighted metrics over quantity
 * 
 * Based on research: "Beyond Linear Tenure: A Comprehensive Framework for Algorithmic Fairness"
 */

export interface PVCMetrics {
  // Vector T: Active Tenure
  activeMonths: number;
  consecutiveStreak: number;
  walletAgeMonths: number;
  daysActive: number; // Distinct days with transactions
  
  // Vector E: Economic Impact (Pillar 1: Capital Efficiency)
  gasUsedETH: number;
  volumeUSD: number;
  uniqueContracts: number;
  gasInducedETH: number; // Gas others spent on user's contracts
  
  // Pillar 1: Capital Commitment
  liquidityDurationDays: number; // Longest liquidity position duration
  liquidityPositions: number; // Number of active liquidity positions
  lendingUtilization: number; // Borrowing activity on Morpho/Aave
  capitalTier: 'low' | 'mid' | 'high'; // Based on volume tiers
  
  // Pillar 2: Ecosystem Diversity
  uniqueProtocols: number; // Distinct protocols interacted with
  vintageContracts: number; // Contracts deployed >1 year ago
  protocolCategories: string[]; // Bridge, DEX, Lending, Gaming, etc.
  
  // Vector S: Social & Creator Capital (Pillar 3: Identity & Social Proof)
  farcasterOpenRank?: number;
  farcasterPercentile?: number;
  farcasterFID?: number; // Farcaster ID if linked
  uniqueZoraCollections: number;
  heldEarlyMints: number; // Mints held >30 days
  secondaryMarketVolumeUSD: number;
  zoraCreatorVolume: number; // Volume from user's created collections
  
  // Multiplier M: Sybil Resistance
  hasCoinbaseAttestation: boolean;
  gitcoinPassportScore?: number;
  
  // Additional metrics
  onchainSummerBadges: number;
  hackathonPlacement?: 'submission' | 'finalist' | 'winner';
  earlyAdopterVintage?: 'genesis' | 'month1' | 'none';
  
  // Score decay tracking
  lastActiveTimestamp: number; // Last qualifying transaction
  daysSinceLastActivity: number;
}

export interface PVCCardScores {
  baseTenure: number;        // Card 1: 0-365
  zoraMints: number;         // Card 2: 0-500
  timeliness: number;         // Card 3: 0-500
  farcaster: number;         // Card 4: 0-1000
  earlyAdopter: number;      // Card 5: 0-400
  builder: number;           // Card 6: 0-1000
  creator: number;           // Card 7: 0-1000
  onchainSummer: number;     // Card 8: 0-500
  hackathon: number;         // Card 9: 0-500
  // Recalibrated pillars (for display)
  capitalPillar?: number;    // Pillar 1: 0-400
  diversityPillar?: number; // Pillar 2: 0-300
  identityPillar?: number;   // Pillar 3: 0-300
}

export interface PVCScore {
  totalScore: number;        // Capped at 1000 (recalibrated)
  cardScores: PVCCardScores;
  multiplier: number;        // Combined multiplier (Sybil + Decay)
  tier: string;
  breakdown: {
    tenure: number;
    economic: number;        // Capital pillar score
    social: number;          // Identity pillar score
  };
  pillars?: {
    capital: number;         // Pillar 1: Capital Efficiency
    diversity: number;       // Pillar 2: Ecosystem Diversity
    identity: number;        // Pillar 3: Identity & Social Proof
  };
  decayInfo?: {
    daysSinceLastActivity: number;
    decayMultiplier: number;
    willDecay: boolean;
  };
}

/**
 * Calculate Provable Value Contribution score
 * 
 * Formula: S_Total = M × min(6365, (w_T × T + w_E × E + w_S × S))
 * 
 * Where:
 * - M = Sybil Resistance Multiplier (1.0 - 1.7)
 * - T = Active Tenure Vector (0-365)
 * - E = Economic Impact Vector (logarithmic/quadratic)
 * - S = Social & Creator Capital Vector
 */
export class PVCFramework {
  // Weights for vector combination (sums to 1.0)
  // Recalibrated for mature ecosystem with three pillars
  private static readonly WEIGHTS = {
    tenure: 0.20,      // 20% - Active weeks (reduced from 25%)
    economic: 0.40,    // 40% - Capital efficiency & commitment (Pillar 1)
    diversity: 0.15,   // 15% - Ecosystem diversity (Pillar 2)
    social: 0.15,      // 15% - Social & creator capital (Pillar 3)
    identity: 0.10,    // 10% - EAS/Passport (applied as multiplier)
  };
  
  // Pillar maximums (for normalization)
  private static readonly PILLAR_MAXES = {
    capital: 400,      // Pillar 1: Capital Efficiency & Commitment
    diversity: 300,   // Pillar 2: Ecosystem Diversity
    identity: 300,    // Pillar 3: Identity & Social Proof
  };

  /**
   * Calculate total PVC score from metrics
   * Recalibrated for mature Base ecosystem with three-pillar system
   */
  static calculateScore(metrics: PVCMetrics): PVCScore {
    // Calculate individual card scores
    const cardScores = this.calculateCardScores(metrics);
    
    // Calculate vectors
    const tenureVector = this.calculateTenureVector(metrics);
    
    // Calculate three pillars (recalibrated system)
    const capitalPillar = this.calculateCapitalPillar(metrics);
    const diversityPillar = this.calculateDiversityPillar(metrics);
    const identityPillar = this.calculateIdentityPillar(metrics, cardScores);
    
    // Legacy economic/social for backward compatibility (calculated but not used in current scoring)
    this.calculateEconomicVector(metrics);
    this.calculateSocialVector(metrics, cardScores);
    
    // Calculate Sybil resistance multiplier
    const multiplier = this.calculateMultiplier(metrics);
    
    // Apply score decay for inactivity
    const decayMultiplier = this.calculateDecayMultiplier(metrics);
    
    // Combine vectors with weights (recalibrated)
    const rawScore = 
      this.WEIGHTS.tenure * tenureVector +
      this.WEIGHTS.economic * capitalPillar +
      this.WEIGHTS.diversity * diversityPillar +
      this.WEIGHTS.social * identityPillar;
    
    // Apply multipliers and cap at 1000 (recalibrated scale)
    const totalScore = Math.min(1000, Math.floor(rawScore * multiplier * decayMultiplier));
    
    // Determine tier (recalibrated thresholds)
    const tier = this.calculateTier(totalScore);
    
    return {
      totalScore,
      cardScores: {
        ...cardScores,
        capitalPillar: Math.floor(capitalPillar),
        diversityPillar: Math.floor(diversityPillar),
        identityPillar: Math.floor(identityPillar),
      },
      multiplier: multiplier * decayMultiplier,
      tier,
      breakdown: {
        tenure: Math.floor(tenureVector),
        economic: Math.floor(capitalPillar),
        social: Math.floor(identityPillar),
      },
      pillars: {
        capital: Math.floor(capitalPillar),
        diversity: Math.floor(diversityPillar),
        identity: Math.floor(identityPillar),
      },
      decayInfo: {
        daysSinceLastActivity: metrics.daysSinceLastActivity,
        decayMultiplier,
        willDecay: metrics.daysSinceLastActivity >= 30,
      },
    };
  }

  /**
   * Card 1: Base Tenure (Reconfigured)
   * Formula: min(365, 100 × log2(ActiveMonths + 1))
   * Rewards consistent monthly activity, not just wallet age
   */
  private static calculateBaseTenure(metrics: PVCMetrics): number {
    if (metrics.activeMonths === 0) return 0;
    
    // Logarithmic scaling with cap at 365
    const score = 100 * Math.log2(metrics.activeMonths + 1);
    return Math.min(365, Math.floor(score));
  }

  /**
   * Card 2: Zora Mints (Reconfigured)
   * Formula: min(500, UniqueCollections × 20)
   * Rewards curatorial breadth over quantity
   */
  private static calculateZoraMints(metrics: PVCMetrics): number {
    const score = metrics.uniqueZoraCollections * 20;
    return Math.min(500, score);
  }

  /**
   * Card 3: Timeliness Bonus (Reconfigured)
   * Formula: min(500, EarlyMintsHeld > 30 Days × 50)
   * Only counts mints still held after 30 days (anti-bot)
   */
  private static calculateTimeliness(metrics: PVCMetrics): number {
    const score = metrics.heldEarlyMints * 50;
    return Math.min(500, score);
  }

  /**
   * Card 4: Farcaster (Reconfigured)
   * Uses OpenRank percentile tiers (EigenTrust-based)
   */
  private static calculateFarcaster(metrics: PVCMetrics): number {
    if (!metrics.farcasterPercentile) return 0;
    
    const percentile = metrics.farcasterPercentile;
    
    if (percentile >= 99) return 1000;      // Top 1%
    if (percentile >= 95) return 750;       // Top 5%
    if (percentile >= 90) return 500;       // Top 10%
    if (percentile >= 75) return 200;       // Top 25%
    return 0;                               // Below top 25%
  }

  /**
   * Card 5: Early Adopter Bonus (Reconfigured)
   * Decaying vintage badge - static trait with reduced weight
   */
  private static calculateEarlyAdopter(metrics: PVCMetrics): number {
    switch (metrics.earlyAdopterVintage) {
      case 'genesis':
        return 400;  // Pre-mainnet
      case 'month1':
        return 200;  // Mainnet month 1
      default:
        return 0;
    }
  }

  /**
   * Card 6: Builder (Reconfigured)
   * Gas Guzzler Metric: Points from gas others spent on user's contracts
   * Logarithmic scaling to prevent whale dominance
   */
  private static calculateBuilder(metrics: PVCMetrics): number {
    const gasETH = metrics.gasInducedETH;
    
    if (gasETH < 0.1) return 0;
    if (gasETH < 1) return 200;
    if (gasETH < 10) return 600;
    return 1000;  // > 10 ETH
  }

  /**
   * Card 7: Creator (Reconfigured)
   * Secondary Market Volume - measures proven market demand
   */
  private static calculateCreator(metrics: PVCMetrics): number {
    const volume = metrics.secondaryMarketVolumeUSD;
    
    if (volume < 100) return 0;
    if (volume < 1000) return 250;
    if (volume < 10000) return 600;
    return 1000;  // > $10,000
  }

  /**
   * Card 8: Onchain Summer (Reconfigured)
   * Tiered badge collection based on completion rate
   */
  private static calculateOnchainSummer(metrics: PVCMetrics): number {
    const badges = metrics.onchainSummerBadges;
    
    if (badges >= 16) return 500;  // Superuser
    if (badges >= 6) return 300;   // Active participant
    if (badges >= 1) return 100;   // Casual participant
    return 0;
  }

  /**
   * Card 9: Hackathon (Reconfigured)
   * Meritocratic placement - distinguishes winners from participants
   */
  private static calculateHackathon(metrics: PVCMetrics): number {
    switch (metrics.hackathonPlacement) {
      case 'winner':
        return 500;
      case 'finalist':
        return 300;
      case 'submission':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Calculate all card scores
   */
  private static calculateCardScores(metrics: PVCMetrics): PVCCardScores {
    return {
      baseTenure: this.calculateBaseTenure(metrics),
      zoraMints: this.calculateZoraMints(metrics),
      timeliness: this.calculateTimeliness(metrics),
      farcaster: this.calculateFarcaster(metrics),
      earlyAdopter: this.calculateEarlyAdopter(metrics),
      builder: this.calculateBuilder(metrics),
      creator: this.calculateCreator(metrics),
      onchainSummer: this.calculateOnchainSummer(metrics),
      hackathon: this.calculateHackathon(metrics),
    };
  }

  /**
   * Vector T: Active Tenure (Streak Model)
   * Formula: Σ(𝕀_w × (1 + Streak_w × k))
   * Rewards consistency with streak bonuses
   */
  private static calculateTenureVector(metrics: PVCMetrics): number {
    const baseScore = this.calculateBaseTenure(metrics);
    
    // Apply streak multiplier (5% bonus per consecutive month)
    const streakBonus = 1 + (metrics.consecutiveStreak * 0.05);
    const cappedStreakBonus = Math.min(1.5, streakBonus); // Cap at 50% bonus
    
    return baseScore * cappedStreakBonus;
  }

  /**
   * Pillar 1: Capital Efficiency & Commitment (Max 400 points)
   * Recalibrated for mature ecosystem - emphasizes commitment over volume
   */
  private static calculateCapitalPillar(metrics: PVCMetrics): number {
    let score = 0;
    
    // Liquidity Duration (Time-Weighted Value)
    // Hard rule: < 7 days = 0 points
    if (metrics.liquidityDurationDays >= 7) {
      const baseLiquidityScore = Math.min(150, metrics.liquidityDurationDays * 2);
      // Bonus: > 30 days = 1.5x multiplier
      if (metrics.liquidityDurationDays >= 30) {
        score += baseLiquidityScore * 1.5;
      } else {
        score += baseLiquidityScore;
      }
    }
    
    // Lending Utilization (borrowing indicates active management)
    const lendingScore = Math.min(100, metrics.lendingUtilization * 10);
    score += lendingScore;
    
    // Volume Tiers (weighted by capital commitment)
    switch (metrics.capitalTier) {
      case 'high': // $100k+
        score += 300;
        break;
      case 'mid': // $10k-$100k
        score += 150;
        break;
      case 'low': // $1k-$10k
        score += 50;
        break;
    }
    
    // Logarithmic gas scoring (prevents whale dominance)
    const gasScore = 100 * Math.log10(1 + metrics.gasUsedETH);
    score += Math.min(100, gasScore);
    
    return Math.min(this.PILLAR_MAXES.capital, score);
  }

  /**
   * Pillar 2: Ecosystem Diversity (Max 300 points)
   * Forces exploration of multiple protocols
   */
  private static calculateDiversityPillar(metrics: PVCMetrics): number {
    let score = 0;
    
    // Explorer Metric: 10 points per unique protocol
    // To get max points, need 30 distinct protocols
    const protocolScore = Math.min(200, metrics.uniqueProtocols * 10);
    score += protocolScore;
    
    // Contract Age Bonus: Interactions with vintage contracts (>1 year old)
    const vintageBonus = Math.min(50, metrics.vintageContracts * 5);
    score += vintageBonus;
    
    // Category Diversity: Bonus for using different protocol types
    const categoryBonus = Math.min(50, metrics.protocolCategories.length * 10);
    score += categoryBonus;
    
    return Math.min(this.PILLAR_MAXES.diversity, score);
  }

  /**
   * Pillar 3: Identity & Social Proof (Max 300 points)
   * Leverages human element for Sybil resistance
   */
  private static calculateIdentityPillar(metrics: PVCMetrics, cardScores: PVCCardScores): number {
    let score = 0;
    
    // Farcaster Integration
    if (metrics.farcasterFID) {
      score += 50; // Linking FID
    }
    
    // OpenRank Percentile Bonus
    if (metrics.farcasterPercentile) {
      if (metrics.farcasterPercentile >= 90) {
        score += 100; // Top 10%
      } else if (metrics.farcasterPercentile >= 80) {
        score += 75; // Top 20%
      } else if (metrics.farcasterPercentile >= 50) {
        score += 50; // Top 50%
      }
    }
    
    // Wallet Tenure Multiplier (applied to base score)
    if (metrics.walletAgeMonths >= 12) {
      score += 50; // 1+ year loyalty bonus
    } else if (metrics.walletAgeMonths < 3) {
      score *= 0.5; // New wallets penalized
    }
    
    // Coinbase Verification
    if (metrics.hasCoinbaseAttestation) {
      score += 50; // High-trust anchor
    }
    
    // Creator Capital (Zora)
    score += cardScores.creator * 0.3; // 30% of creator score
    
    return Math.min(this.PILLAR_MAXES.identity, score);
  }

  /**
   * Legacy economic vector (for backward compatibility)
   */
  private static calculateEconomicVector(metrics: PVCMetrics): number {
    // Logarithmic gas scoring
    const gasScore = 1000 * Math.log10(1 + metrics.gasUsedETH);
    
    // Quadratic volume scoring
    const volumeScore = 500 * Math.sqrt(metrics.volumeUSD / 1000);
    
    // Contract diversity bonus
    const diversityBonus = Math.min(200, metrics.uniqueContracts * 10);
    
    // Builder score
    const builderScore = this.calculateBuilder(metrics);
    
    return gasScore + volumeScore + diversityBonus + builderScore;
  }

  /**
   * Score Decay Mechanism
   * Penalizes inactivity to maintain "hard" tier requirements
   * Formula: 5% decay per 30 days of inactivity
   */
  private static calculateDecayMultiplier(metrics: PVCMetrics): number {
    if (metrics.daysSinceLastActivity === 0) {
      return 1.0; // Active, no decay
    }
    
    // 5% decay per 30 days of inactivity
    const decayPeriods = Math.floor(metrics.daysSinceLastActivity / 30);
    const decayRate = 0.05; // 5% per period
    
    // Maximum decay: 50% (after 10 periods = 300 days)
    const totalDecay = Math.min(0.5, decayPeriods * decayRate);
    
    return 1.0 - totalDecay;
  }

  /**
   * Vector S: Social & Creator Capital
   * Combines Farcaster OpenRank and Zora quality metrics
   */
  private static calculateSocialVector(
    metrics: PVCMetrics,
    cardScores: PVCCardScores
  ): number {
    const farcasterScore = cardScores.farcaster;
    const zoraScore = cardScores.zoraMints;
    const creatorScore = cardScores.creator;
    
    return farcasterScore + zoraScore + creatorScore;
  }

  /**
   * Multiplier M: Sybil Resistance Shield
   * Formula: 1.0 + (0.5 × HasCoinbaseAttestation) + (0.2 × GitcoinPassportScore > 20)
   * Range: 1.0 - 1.7
   */
  private static calculateMultiplier(metrics: PVCMetrics): number {
    let multiplier = 1.0;
    
    // Coinbase verification (50% boost)
    if (metrics.hasCoinbaseAttestation) {
      multiplier += 0.5;
    }
    
    // Gitcoin Passport (20% boost if score > 20)
    if (metrics.gitcoinPassportScore && metrics.gitcoinPassportScore > 20) {
      multiplier += 0.2;
    }
    
    return Math.min(1.7, multiplier); // Cap at 1.7x
  }

  /**
   * Calculate tier from total score
   * Recalibrated thresholds for 0-1000 scale (mature Base ecosystem)
   * Future: Dynamic percentile-based thresholds
   */
  private static calculateTier(score: number): string {
    // Recalibrated tier thresholds (0-1000 scale)
    if (score >= 951) return 'LEGEND';      // Top 1%
    if (score >= 851) return 'BASED';       // Top 5% (95th-99th) - Hard Gate
    if (score >= 651) return 'BUILDER';     // 75th-95th
    if (score >= 351) return 'RESIDENT';    // 40th-75th
    return 'TOURIST';                       // Bottom 40% (0-350)
  }

  /**
   * Normalize score to 0-100 scale for display
   * Recalibrated for 0-1000 scale
   */
  static normalizeScore(score: number): number {
    return Math.min(100, Math.floor((score / 1000) * 100));
  }

  /**
   * Get score breakdown for UI display
   */
  static getScoreBreakdown(score: PVCScore) {
    return {
      total: score.totalScore,
      max: 1000, // Recalibrated scale
      percentage: this.normalizeScore(score.totalScore),
      tier: score.tier,
      multiplier: score.multiplier,
      vectors: {
        tenure: {
          score: score.breakdown.tenure,
          weight: this.WEIGHTS.tenure,
          percentage: Math.floor((score.breakdown.tenure / 365) * 100),
        },
        capital: {
          score: score.breakdown.economic, // Capital pillar
          weight: this.WEIGHTS.economic,
          percentage: Math.floor((score.breakdown.economic / this.PILLAR_MAXES.capital) * 100),
        },
        diversity: {
          score: score.pillars?.diversity || 0,
          weight: this.WEIGHTS.diversity,
          percentage: score.pillars ? Math.floor((score.pillars.diversity / this.PILLAR_MAXES.diversity) * 100) : 0,
        },
        identity: {
          score: score.breakdown.social, // Identity pillar
          weight: this.WEIGHTS.social,
          percentage: Math.floor((score.breakdown.social / this.PILLAR_MAXES.identity) * 100),
        },
      },
      cards: score.cardScores,
    };
  }
}
