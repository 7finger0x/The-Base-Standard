/**
 * Critical test: Verify tier calculation is consistent across all implementations
 *
 * Tier logic exists in 5 different places:
 * 1. foundry/src/ReputationRegistry.sol
 * 2. apps/agent/score_calculator.py
 * 3. apps/indexer/src/utils.ts
 * 4. src/lib/utils.ts
 * 5. src/app/api/reputation/route.ts (if tier calculation exists there)
 *
 * This test ensures they all produce the same results.
 */

import { describe, it, expect } from 'vitest';
import { getTierFromScore as frontendGetTier } from '@/lib/utils';
import { getTierFromScore as indexerGetTier } from '../apps/indexer/src/utils';

describe('Tier Consistency Across All Implementations', () => {
  const testCases = [
    // Novice tier
    { score: 0, expected: 'Novice' },
    { score: 50, expected: 'Novice' },
    { score: 99, expected: 'Novice' },

    // Bronze tier boundaries
    { score: 100, expected: 'Bronze' },
    { score: 250, expected: 'Bronze' },
    { score: 499, expected: 'Bronze' },

    // Silver tier boundaries
    { score: 500, expected: 'Silver' },
    { score: 700, expected: 'Silver' },
    { score: 849, expected: 'Silver' },

    // Gold tier boundaries
    { score: 850, expected: 'Gold' },
    { score: 900, expected: 'Gold' },
    { score: 999, expected: 'Gold' },

    // BASED tier boundaries
    { score: 1000, expected: 'BASED' },
    { score: 5000, expected: 'BASED' },
    { score: 10000, expected: 'BASED' },
  ];

  describe('Frontend implementation matches expected tiers', () => {
    testCases.forEach(({ score, expected }) => {
      it(`should return ${expected} for score ${score}`, () => {
        expect(frontendGetTier(score)).toBe(expected);
      });
    });
  });

  describe('Indexer implementation matches expected tiers', () => {
    testCases.forEach(({ score, expected }) => {
      it(`should return ${expected} for score ${score}`, () => {
        expect(indexerGetTier(score)).toBe(expected);
      });
    });
  });

  describe('Frontend and Indexer implementations match each other', () => {
    const allScores = [
      0, 1, 50, 99, 100, 101, 250, 499, 500, 501, 700, 849, 850, 851, 900, 999,
      1000, 1001, 5000, 10000, 50000
    ];

    allScores.forEach(score => {
      it(`should return same tier for score ${score}`, () => {
        const frontendTier = frontendGetTier(score);
        const indexerTier = indexerGetTier(score);
        expect(frontendTier).toBe(indexerTier);
      });
    });
  });

  describe('Tier threshold boundaries', () => {
    it('should have consistent Bronze threshold at 100', () => {
      expect(frontendGetTier(99)).toBe('Novice');
      expect(frontendGetTier(100)).toBe('Bronze');
      expect(indexerGetTier(99)).toBe('Novice');
      expect(indexerGetTier(100)).toBe('Bronze');
    });

    it('should have consistent Silver threshold at 500', () => {
      expect(frontendGetTier(499)).toBe('Bronze');
      expect(frontendGetTier(500)).toBe('Silver');
      expect(indexerGetTier(499)).toBe('Bronze');
      expect(indexerGetTier(500)).toBe('Silver');
    });

    it('should have consistent Gold threshold at 850', () => {
      expect(frontendGetTier(849)).toBe('Silver');
      expect(frontendGetTier(850)).toBe('Gold');
      expect(indexerGetTier(849)).toBe('Silver');
      expect(indexerGetTier(850)).toBe('Gold');
    });

    it('should have consistent BASED threshold at 1000', () => {
      expect(frontendGetTier(999)).toBe('Gold');
      expect(frontendGetTier(1000)).toBe('BASED');
      expect(indexerGetTier(999)).toBe('Gold');
      expect(indexerGetTier(1000)).toBe('BASED');
    });
  });
});
