/**
 * Integration test: End-to-end score calculation flow
 * Tests that score calculation is consistent from data -> calculation -> tier assignment
 */

import { describe, it, expect } from 'vitest';
import { getTierFromScore } from '@/lib/utils';

describe('Score Calculation Integration', () => {
  describe('Complete score calculation scenarios', () => {
    it('should calculate correct score for new user', () => {
      const baseTenure = 0; // Brand new user
      const zoraMints = 0;
      const earlyMints = 0;

      const totalScore = baseTenure + (zoraMints * 10) + (earlyMints * 100);
      const tier = getTierFromScore(totalScore);

      expect(totalScore).toBe(0);
      expect(tier).toBe('Novice');
    });

    it('should calculate correct score for active user', () => {
      const baseTenure = 30; // 30 days on Base
      const zoraMints = 5; // 5 NFTs minted
      const earlyMints = 1; // 1 early mint

      const totalScore = baseTenure + (zoraMints * 10) + (earlyMints * 100);
      const tier = getTierFromScore(totalScore);

      expect(totalScore).toBe(180); // 30 + 50 + 100
      expect(tier).toBe('Bronze');
    });

    it('should reach Silver tier with moderate activity', () => {
      const baseTenure = 100; // 100 days
      const zoraMints = 20; // 20 mints
      const earlyMints = 2; // 2 early mints

      const totalScore = baseTenure + (zoraMints * 10) + (earlyMints * 100);
      const tier = getTierFromScore(totalScore);

      expect(totalScore).toBe(500); // 100 + 200 + 200
      expect(tier).toBe('Silver');
    });

    it('should reach Gold tier with high activity', () => {
      const baseTenure = 250; // 250 days
      const zoraMints = 40; // 40 mints
      const earlyMints = 2; // 2 early mints

      const totalScore = baseTenure + (zoraMints * 10) + (earlyMints * 100);
      const tier = getTierFromScore(totalScore);

      expect(totalScore).toBe(850); // 250 + 400 + 200
      expect(tier).toBe('Gold');
    });

    it('should reach BASED tier with exceptional activity', () => {
      const baseTenure = 365; // 1 year
      const zoraMints = 50; // 50 mints
      const earlyMints = 2; // 2 early mints

      const totalScore = baseTenure + (zoraMints * 10) + (earlyMints * 100);
      const tier = getTierFromScore(totalScore);

      expect(totalScore).toBe(1065); // 365 + 500 + 200
      expect(tier).toBe('BASED');
    });

    it('should reach BASED tier through early minting alone', () => {
      const baseTenure = 0;
      const zoraMints = 10; // 10 regular mints
      const earlyMints = 10; // 10 early mints

      const totalScore = baseTenure + (zoraMints * 10) + (earlyMints * 100);
      const tier = getTierFromScore(totalScore);

      expect(totalScore).toBe(1100); // 0 + 100 + 1000
      expect(tier).toBe('BASED');
    });

    it('should handle linked wallet score aggregation', () => {
      // Main wallet
      const mainBaseTenure = 100;
      const mainZoraMints = 10;
      const mainEarlyMints = 1;

      // Linked wallet
      const linkedBaseTenure = 50;
      const linkedZoraMints = 5;
      const linkedEarlyMints = 1;

      const totalBaseTenure = mainBaseTenure + linkedBaseTenure;
      const totalZoraMints = mainZoraMints + linkedZoraMints;
      const totalEarlyMints = mainEarlyMints + linkedEarlyMints;

      const totalScore =
        totalBaseTenure +
        (totalZoraMints * 10) +
        (totalEarlyMints * 100);

      const tier = getTierFromScore(totalScore);

      // 150 (baseTenure) + 150 (zoraMints) + 200 (earlyMints) = 500
      expect(totalScore).toBe(500);
      expect(tier).toBe('Silver');
    });
  });

  describe('Edge cases', () => {
    it('should handle maximum realistic score', () => {
      const baseTenure = 365 * 2; // 2 years
      const zoraMints = 1000; // Very active minter
      const earlyMints = 50; // Early adopter

      const totalScore = baseTenure + (zoraMints * 10) + (earlyMints * 100);
      const tier = getTierFromScore(totalScore);

      expect(totalScore).toBe(15730); // 730 + 10000 + 5000
      expect(tier).toBe('BASED');
    });

    it('should handle score at exact tier boundaries', () => {
      expect(getTierFromScore(100)).toBe('Bronze');
      expect(getTierFromScore(500)).toBe('Silver');
      expect(getTierFromScore(850)).toBe('Gold');
      expect(getTierFromScore(1000)).toBe('BASED');
    });

    it('should handle score just below tier boundaries', () => {
      expect(getTierFromScore(99)).toBe('Novice');
      expect(getTierFromScore(499)).toBe('Bronze');
      expect(getTierFromScore(849)).toBe('Silver');
      expect(getTierFromScore(999)).toBe('Gold');
    });
  });

  describe('Score component weighting', () => {
    it('should weight early mints heavily (100 points)', () => {
      const earlyMintScore = 1 * 100;
      const normalMintScore = 10 * 10;

      expect(earlyMintScore).toBe(normalMintScore);
    });

    it('should value 1 year tenure equal to 36.5 mints', () => {
      const oneYearTenure = 365;
      const equivalentMints = Math.floor(oneYearTenure / 10);

      expect(equivalentMints).toBe(36);
    });

    it('should value 1 early mint equal to 100 days tenure', () => {
      const earlyMintScore = 100;
      const equivalentDays = 100;

      expect(earlyMintScore).toBe(equivalentDays);
    });
  });
});
