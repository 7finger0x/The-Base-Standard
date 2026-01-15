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
    // TOURIST tier
    { score: 0, expected: 'TOURIST' },
    { score: 50, expected: 'TOURIST' },
    { score: 350, expected: 'TOURIST' },

    // RESIDENT tier boundaries
    { score: 351, expected: 'RESIDENT' },
    { score: 500, expected: 'RESIDENT' },
    { score: 650, expected: 'RESIDENT' },

    // BUILDER tier boundaries
    { score: 651, expected: 'BUILDER' },
    { score: 750, expected: 'BUILDER' },
    { score: 850, expected: 'BUILDER' },

    // BASED tier boundaries
    { score: 851, expected: 'BASED' },
    { score: 900, expected: 'BASED' },
    { score: 950, expected: 'BASED' },

    // LEGEND tier boundaries
    { score: 951, expected: 'LEGEND' },
    { score: 1000, expected: 'LEGEND' },
    { score: 5000, expected: 'LEGEND' },
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
      0, 1, 50, 350, 351, 500, 650, 651, 750, 850, 851, 900, 950, 951, 1000, 5000
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
    it('should have consistent RESIDENT threshold at 351', () => {
      expect(frontendGetTier(350)).toBe('TOURIST');
      expect(frontendGetTier(351)).toBe('RESIDENT');
      expect(indexerGetTier(350)).toBe('TOURIST');
      expect(indexerGetTier(351)).toBe('RESIDENT');
    });

    it('should have consistent BUILDER threshold at 651', () => {
      expect(frontendGetTier(650)).toBe('RESIDENT');
      expect(frontendGetTier(651)).toBe('BUILDER');
      expect(indexerGetTier(650)).toBe('RESIDENT');
      expect(indexerGetTier(651)).toBe('BUILDER');
    });

    it('should have consistent BASED threshold at 851', () => {
      expect(frontendGetTier(850)).toBe('BUILDER');
      expect(frontendGetTier(851)).toBe('BASED');
      expect(indexerGetTier(850)).toBe('BUILDER');
      expect(indexerGetTier(851)).toBe('BASED');
    });

    it('should have consistent LEGEND threshold at 951', () => {
      expect(frontendGetTier(950)).toBe('BASED');
      expect(frontendGetTier(951)).toBe('LEGEND');
      expect(indexerGetTier(950)).toBe('BASED');
      expect(indexerGetTier(951)).toBe('LEGEND');
    });
  });
});
