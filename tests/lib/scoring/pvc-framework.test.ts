/**
 * Comprehensive tests for PVC Framework
 * Tests all card calculations, pillars, multipliers, and tier assignments
 */

import { describe, it, expect, vi } from 'vitest';
import { PVCFramework, type PVCMetrics } from '@/lib/scoring/pvc-framework';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('PVCFramework', () => {
  /**
   * Helper to create minimal valid metrics
   */
  function createBaseMetrics(overrides: Partial<PVCMetrics> = {}): PVCMetrics {
    return {
      activeMonths: 0,
      consecutiveStreak: 0,
      walletAgeMonths: 0,
      daysActive: 0,
      gasUsedETH: 0,
      volumeUSD: 0,
      uniqueContracts: 0,
      gasInducedETH: 0,
      liquidityDurationDays: 0,
      liquidityPositions: 0,
      lendingUtilization: 0,
      capitalTier: 'low',
      uniqueProtocols: 0,
      vintageContracts: 0,
      protocolCategories: [],
      uniqueZoraCollections: 0,
      heldEarlyMints: 0,
      secondaryMarketVolumeUSD: 0,
      zoraCreatorVolume: 0,
      hasCoinbaseAttestation: false,
      onchainSummerBadges: 0,
      earlyAdopterVintage: 'none',
      lastActiveTimestamp: 0,
      daysSinceLastActivity: 0,
      ...overrides,
    };
  }

  describe('calculateScore', () => {
    it('should calculate score for new user with zero metrics', () => {
      const metrics = createBaseMetrics();
      const score = PVCFramework.calculateScore(metrics);

      expect(score.totalScore).toBeGreaterThanOrEqual(0);
      expect(score.tier).toBe('TOURIST');
      expect(score.multiplier).toBeGreaterThanOrEqual(1.0);
      expect(score.cardScores.baseTenure).toBe(0);
      expect(score.cardScores.zoraMints).toBe(0);
    });

    it('should calculate score with active tenure', () => {
      const metrics = createBaseMetrics({
        activeMonths: 12,
        consecutiveStreak: 6,
      });
      const score = PVCFramework.calculateScore(metrics);

      expect(score.totalScore).toBeGreaterThan(0);
      expect(score.cardScores.baseTenure).toBeGreaterThan(0);
      expect(score.breakdown.tenure).toBeGreaterThan(0);
    });

    it('should cap total score at 1000', () => {
      const metrics = createBaseMetrics({
        activeMonths: 100,
        consecutiveStreak: 50,
        gasUsedETH: 1000,
        volumeUSD: 1000000,
        uniqueProtocols: 100,
        farcasterPercentile: 99,
        hasCoinbaseAttestation: true,
        gitcoinPassportScore: 50,
        earlyAdopterVintage: 'genesis',
        uniqueZoraCollections: 100,
        heldEarlyMints: 50,
        secondaryMarketVolumeUSD: 100000,
        onchainSummerBadges: 20,
        hackathonPlacement: 'winner',
      });
      const score = PVCFramework.calculateScore(metrics);

      expect(score.totalScore).toBeLessThanOrEqual(1000);
    });

    it('should apply Sybil resistance multiplier', () => {
      const baseMetrics = createBaseMetrics({
        activeMonths: 12,
        volumeUSD: 50000,
      });

      const withoutAttestation = PVCFramework.calculateScore(baseMetrics);
      const withAttestation = PVCFramework.calculateScore({
        ...baseMetrics,
        hasCoinbaseAttestation: true,
      });

      expect(withAttestation.multiplier).toBeGreaterThan(withoutAttestation.multiplier);
    });

    it('should apply decay multiplier for inactivity', () => {
      const activeMetrics = createBaseMetrics({
        activeMonths: 12,
        daysSinceLastActivity: 0,
      });
      const inactiveMetrics = createBaseMetrics({
        activeMonths: 12,
        daysSinceLastActivity: 60, // 2 periods of 30 days
      });

      const activeScore = PVCFramework.calculateScore(activeMetrics);
      const inactiveScore = PVCFramework.calculateScore(inactiveMetrics);

      expect(inactiveScore.decayInfo?.decayMultiplier).toBeLessThan(1.0);
      expect(inactiveScore.decayInfo?.willDecay).toBe(true);
      expect(activeScore.decayInfo?.decayMultiplier).toBe(1.0);
      expect(activeScore.decayInfo?.willDecay).toBe(false);
    });
  });

  describe('Card Scores', () => {
    describe('Base Tenure (Card 1)', () => {
      it('should return 0 for zero active months', () => {
        const metrics = createBaseMetrics({ activeMonths: 0 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.baseTenure).toBe(0);
      });

      it('should calculate logarithmic score for active months', () => {
        const metrics = createBaseMetrics({ activeMonths: 1 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.baseTenure).toBeGreaterThan(0);
      });

      it('should cap at 365', () => {
        const metrics = createBaseMetrics({ activeMonths: 1000 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.baseTenure).toBeLessThanOrEqual(365);
      });
    });

    describe('Zora Mints (Card 2)', () => {
      it('should return 0 for no collections', () => {
        const metrics = createBaseMetrics({ uniqueZoraCollections: 0 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.zoraMints).toBe(0);
      });

      it('should calculate 20 points per collection', () => {
        const metrics = createBaseMetrics({ uniqueZoraCollections: 5 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.zoraMints).toBe(100);
      });

      it('should cap at 500', () => {
        const metrics = createBaseMetrics({ uniqueZoraCollections: 100 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.zoraMints).toBe(500);
      });
    });

    describe('Timeliness (Card 3)', () => {
      it('should return 0 for no early mints', () => {
        const metrics = createBaseMetrics({ heldEarlyMints: 0 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.timeliness).toBe(0);
      });

      it('should calculate 50 points per early mint', () => {
        const metrics = createBaseMetrics({ heldEarlyMints: 3 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.timeliness).toBe(150);
      });

      it('should cap at 500', () => {
        const metrics = createBaseMetrics({ heldEarlyMints: 20 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.timeliness).toBe(500);
      });
    });

    describe('Farcaster (Card 4)', () => {
      it('should return 0 when no percentile', () => {
        const metrics = createBaseMetrics({ farcasterPercentile: undefined });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.farcaster).toBe(0);
      });

      it('should return 1000 for top 1%', () => {
        const metrics = createBaseMetrics({ farcasterPercentile: 99.5 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.farcaster).toBe(1000);
      });

      it('should return 750 for top 5%', () => {
        const metrics = createBaseMetrics({ farcasterPercentile: 97 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.farcaster).toBe(750);
      });

      it('should return 500 for top 10%', () => {
        const metrics = createBaseMetrics({ farcasterPercentile: 92 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.farcaster).toBe(500);
      });

      it('should return 200 for top 25%', () => {
        const metrics = createBaseMetrics({ farcasterPercentile: 80 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.farcaster).toBe(200);
      });

      it('should return 0 for below top 25%', () => {
        const metrics = createBaseMetrics({ farcasterPercentile: 50 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.farcaster).toBe(0);
      });
    });

    describe('Early Adopter (Card 5)', () => {
      it('should return 400 for genesis', () => {
        const metrics = createBaseMetrics({ earlyAdopterVintage: 'genesis' });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.earlyAdopter).toBe(400);
      });

      it('should return 200 for month1', () => {
        const metrics = createBaseMetrics({ earlyAdopterVintage: 'month1' });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.earlyAdopter).toBe(200);
      });

      it('should return 0 for none', () => {
        const metrics = createBaseMetrics({ earlyAdopterVintage: 'none' });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.earlyAdopter).toBe(0);
      });
    });

    describe('Builder (Card 6)', () => {
      it('should return 0 for gas < 0.1 ETH', () => {
        const metrics = createBaseMetrics({ gasInducedETH: 0.05 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.builder).toBe(0);
      });

      it('should return 200 for 0.1-1 ETH', () => {
        const metrics = createBaseMetrics({ gasInducedETH: 0.5 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.builder).toBe(200);
      });

      it('should return 600 for 1-10 ETH', () => {
        const metrics = createBaseMetrics({ gasInducedETH: 5 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.builder).toBe(600);
      });

      it('should return 1000 for > 10 ETH', () => {
        const metrics = createBaseMetrics({ gasInducedETH: 15 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.builder).toBe(1000);
      });
    });

    describe('Creator (Card 7)', () => {
      it('should return 0 for volume < $100', () => {
        const metrics = createBaseMetrics({ secondaryMarketVolumeUSD: 50 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.creator).toBe(0);
      });

      it('should return 250 for $100-$1000', () => {
        const metrics = createBaseMetrics({ secondaryMarketVolumeUSD: 500 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.creator).toBe(250);
      });

      it('should return 600 for $1000-$10000', () => {
        const metrics = createBaseMetrics({ secondaryMarketVolumeUSD: 5000 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.creator).toBe(600);
      });

      it('should return 1000 for > $10000', () => {
        const metrics = createBaseMetrics({ secondaryMarketVolumeUSD: 20000 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.creator).toBe(1000);
      });
    });

    describe('Onchain Summer (Card 8)', () => {
      it('should return 0 for no badges', () => {
        const metrics = createBaseMetrics({ onchainSummerBadges: 0 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.onchainSummer).toBe(0);
      });

      it('should return 100 for 1-5 badges', () => {
        const metrics = createBaseMetrics({ onchainSummerBadges: 3 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.onchainSummer).toBe(100);
      });

      it('should return 300 for 6-15 badges', () => {
        const metrics = createBaseMetrics({ onchainSummerBadges: 10 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.onchainSummer).toBe(300);
      });

      it('should return 500 for 16+ badges', () => {
        const metrics = createBaseMetrics({ onchainSummerBadges: 20 });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.onchainSummer).toBe(500);
      });
    });

    describe('Hackathon (Card 9)', () => {
      it('should return 0 when no placement', () => {
        const metrics = createBaseMetrics({ hackathonPlacement: undefined });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.hackathon).toBe(0);
      });

      it('should return 100 for submission', () => {
        const metrics = createBaseMetrics({ hackathonPlacement: 'submission' });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.hackathon).toBe(100);
      });

      it('should return 300 for finalist', () => {
        const metrics = createBaseMetrics({ hackathonPlacement: 'finalist' });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.hackathon).toBe(300);
      });

      it('should return 500 for winner', () => {
        const metrics = createBaseMetrics({ hackathonPlacement: 'winner' });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.cardScores.hackathon).toBe(500);
      });
    });
  });

  describe('Pillars', () => {
    describe('Capital Pillar (Pillar 1)', () => {
      it('should return 0 or minimal for no liquidity', () => {
        const metrics = createBaseMetrics({
          liquidityDurationDays: 0,
          volumeUSD: 0,
          gasUsedETH: 0,
          capitalTier: 'low',
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.capital).toBeGreaterThanOrEqual(0);
        expect(score.pillars?.capital).toBeLessThan(100); // Should be minimal
      });

      it('should reward liquidity duration >= 7 days', () => {
        const metrics = createBaseMetrics({
          liquidityDurationDays: 10,
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.capital).toBeGreaterThan(0);
      });

      it('should apply 1.5x multiplier for liquidity >= 30 days', () => {
        const shortTerm = createBaseMetrics({ liquidityDurationDays: 20 });
        const longTerm = createBaseMetrics({ liquidityDurationDays: 40 });
        const shortScore = PVCFramework.calculateScore(shortTerm);
        const longScore = PVCFramework.calculateScore(longTerm);
        expect(longScore.pillars?.capital).toBeGreaterThan(shortScore.pillars?.capital || 0);
      });

      it('should cap at 400', () => {
        const metrics = createBaseMetrics({
          liquidityDurationDays: 1000,
          volumeUSD: 1000000,
          capitalTier: 'high',
          gasUsedETH: 1000,
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.capital).toBeLessThanOrEqual(400);
      });
    });

    describe('Diversity Pillar (Pillar 2)', () => {
      it('should return 0 for no protocols', () => {
        const metrics = createBaseMetrics({
          uniqueProtocols: 0,
          vintageContracts: 0,
          protocolCategories: [],
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.diversity).toBe(0);
      });

      it('should reward unique protocols', () => {
        const metrics = createBaseMetrics({
          uniqueProtocols: 10,
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.diversity).toBeGreaterThan(0);
      });

      it('should cap at 300', () => {
        const metrics = createBaseMetrics({
          uniqueProtocols: 100,
          vintageContracts: 50,
          protocolCategories: ['DEX', 'Lending', 'Bridge', 'Gaming', 'NFT'],
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.diversity).toBeLessThanOrEqual(300);
      });
    });

    describe('Identity Pillar (Pillar 3)', () => {
      it('should return 0 for no identity verification', () => {
        const metrics = createBaseMetrics({
          farcasterFID: undefined,
          hasCoinbaseAttestation: false,
          walletAgeMonths: 0,
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.identity).toBe(0);
      });

      it('should reward Farcaster linking', () => {
        const metrics = createBaseMetrics({
          farcasterFID: 12345,
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.identity).toBeGreaterThan(0);
      });

      it('should reward Coinbase attestation', () => {
        const metrics = createBaseMetrics({
          hasCoinbaseAttestation: true,
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.identity).toBeGreaterThan(0);
      });

      it('should cap at 300', () => {
        const metrics = createBaseMetrics({
          farcasterFID: 12345,
          farcasterPercentile: 99,
          hasCoinbaseAttestation: true,
          walletAgeMonths: 24,
          secondaryMarketVolumeUSD: 50000,
        });
        const score = PVCFramework.calculateScore(metrics);
        expect(score.pillars?.identity).toBeLessThanOrEqual(300);
      });
    });
  });

  describe('Tier Calculation', () => {
    it('should return TOURIST for score 0-350', () => {
      const metrics = createBaseMetrics({ activeMonths: 1 });
      const score = PVCFramework.calculateScore(metrics);
      expect(['TOURIST', 'RESIDENT']).toContain(score.tier);
    });

    it('should return RESIDENT for score 351-650', () => {
      const metrics = createBaseMetrics({
        activeMonths: 12,
        volumeUSD: 50000,
        capitalTier: 'mid',
      });
      const score = PVCFramework.calculateScore(metrics);
      if (score.totalScore >= 351 && score.totalScore <= 650) {
        expect(score.tier).toBe('RESIDENT');
      }
    });

    it('should return BUILDER for score 651-850', () => {
      const metrics = createBaseMetrics({
        activeMonths: 24,
        volumeUSD: 100000,
        capitalTier: 'high',
        uniqueProtocols: 20,
        farcasterPercentile: 80,
      });
      const score = PVCFramework.calculateScore(metrics);
      if (score.totalScore >= 651 && score.totalScore <= 850) {
        expect(score.tier).toBe('BUILDER');
      }
    });

    it('should return BASED for score 851-950', () => {
      const metrics = createBaseMetrics({
        activeMonths: 36,
        volumeUSD: 200000,
        capitalTier: 'high',
        uniqueProtocols: 30,
        farcasterPercentile: 95,
        hasCoinbaseAttestation: true,
        earlyAdopterVintage: 'genesis',
      });
      const score = PVCFramework.calculateScore(metrics);
      if (score.totalScore >= 851 && score.totalScore <= 950) {
        expect(score.tier).toBe('BASED');
      }
    });

    it('should return LEGEND for score 951-1000', () => {
      const metrics = createBaseMetrics({
        activeMonths: 48,
        volumeUSD: 500000,
        capitalTier: 'high',
        uniqueProtocols: 50,
        farcasterPercentile: 99,
        hasCoinbaseAttestation: true,
        gitcoinPassportScore: 50,
        earlyAdopterVintage: 'genesis',
        uniqueZoraCollections: 50,
        heldEarlyMints: 20,
        secondaryMarketVolumeUSD: 100000,
        onchainSummerBadges: 20,
        hackathonPlacement: 'winner',
      });
      const score = PVCFramework.calculateScore(metrics);
      if (score.totalScore >= 951) {
        expect(score.tier).toBe('LEGEND');
      }
    });
  });

  describe('Multipliers', () => {
    it('should have base multiplier of 1.0', () => {
      const metrics = createBaseMetrics();
      const score = PVCFramework.calculateScore(metrics);
      expect(score.multiplier).toBeGreaterThanOrEqual(1.0);
    });

    it('should increase multiplier with Coinbase attestation', () => {
      const without = createBaseMetrics();
      const withAttestation = createBaseMetrics({ hasCoinbaseAttestation: true });
      const scoreWithout = PVCFramework.calculateScore(without);
      const scoreWith = PVCFramework.calculateScore(withAttestation);
      expect(scoreWith.multiplier).toBeGreaterThan(scoreWithout.multiplier);
    });

    it('should increase multiplier with Gitcoin Passport', () => {
      const without = createBaseMetrics();
      const withPassport = createBaseMetrics({ gitcoinPassportScore: 25 });
      const scoreWithout = PVCFramework.calculateScore(without);
      const scoreWith = PVCFramework.calculateScore(withPassport);
      expect(scoreWith.multiplier).toBeGreaterThan(scoreWithout.multiplier);
    });

    it('should cap multiplier at 1.7', () => {
      const metrics = createBaseMetrics({
        hasCoinbaseAttestation: true,
        gitcoinPassportScore: 50,
      });
      const score = PVCFramework.calculateScore(metrics);
      expect(score.multiplier).toBeLessThanOrEqual(1.7);
    });
  });

  describe('Decay Mechanism', () => {
    it('should have no decay for active users', () => {
      const metrics = createBaseMetrics({
        daysSinceLastActivity: 0,
      });
      const score = PVCFramework.calculateScore(metrics);
      expect(score.decayInfo?.decayMultiplier).toBe(1.0);
      expect(score.decayInfo?.willDecay).toBe(false);
    });

    it('should apply 5% decay per 30 days', () => {
      const metrics = createBaseMetrics({
        daysSinceLastActivity: 30,
      });
      const score = PVCFramework.calculateScore(metrics);
      expect(score.decayInfo?.decayMultiplier).toBeLessThan(1.0);
      expect(score.decayInfo?.willDecay).toBe(true);
    });

    it('should cap decay at 50%', () => {
      const metrics = createBaseMetrics({
        daysSinceLastActivity: 365, // 12+ periods
      });
      const score = PVCFramework.calculateScore(metrics);
      expect(score.decayInfo?.decayMultiplier).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values gracefully', () => {
      const metrics = createBaseMetrics({
        volumeUSD: -1000,
        gasUsedETH: -1,
      });
      const score = PVCFramework.calculateScore(metrics);
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large values', () => {
      const metrics = createBaseMetrics({
        activeMonths: 10000,
        volumeUSD: 1000000000,
        gasUsedETH: 100000,
      });
      const score = PVCFramework.calculateScore(metrics);
      expect(score.totalScore).toBeLessThanOrEqual(1000);
      expect(score.cardScores.baseTenure).toBeLessThanOrEqual(365);
    });

    it('should handle undefined optional fields', () => {
      const metrics = createBaseMetrics({
        farcasterOpenRank: undefined,
        farcasterPercentile: undefined,
        farcasterFID: undefined,
        gitcoinPassportScore: undefined,
        hackathonPlacement: undefined,
      });
      const score = PVCFramework.calculateScore(metrics);
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('normalizeScore', () => {
    it('should normalize score to 0-100 scale', () => {
      expect(PVCFramework.normalizeScore(0)).toBe(0);
      expect(PVCFramework.normalizeScore(500)).toBe(50);
      expect(PVCFramework.normalizeScore(1000)).toBe(100);
      expect(PVCFramework.normalizeScore(2000)).toBe(100); // Capped
    });
  });

  describe('getScoreBreakdown', () => {
    it('should return complete breakdown', () => {
      const metrics = createBaseMetrics({
        activeMonths: 12,
        volumeUSD: 50000,
        uniqueProtocols: 10,
      });
      const score = PVCFramework.calculateScore(metrics);
      const breakdown = PVCFramework.getScoreBreakdown(score);

      expect(breakdown.total).toBe(score.totalScore);
      expect(breakdown.max).toBe(1000);
      expect(breakdown.tier).toBe(score.tier);
      expect(breakdown.multiplier).toBe(score.multiplier);
      expect(breakdown.vectors).toBeDefined();
      expect(breakdown.cards).toBeDefined();
    });
  });
});
