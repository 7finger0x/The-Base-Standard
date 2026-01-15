import { describe, it, expect } from 'vitest';
import {
  getTierFromScore,
  isEarlyMint,
  calculateTotalScore,
  calculateBaseTenure,
  isZeroAddress,
  normalizeAddress,
  EARLY_MINT_WINDOW,
  TIER_THRESHOLDS,
} from '../src/utils';

describe('getTierFromScore', () => {
  it('should return TOURIST for score 0', () => {
    expect(getTierFromScore(0)).toBe('TOURIST');
  });

  it('should return TOURIST for scores below 351', () => {
    expect(getTierFromScore(50)).toBe('TOURIST');
    expect(getTierFromScore(350)).toBe('TOURIST');
  });

  it('should return RESIDENT for score 351', () => {
    expect(getTierFromScore(351)).toBe('RESIDENT');
  });

  it('should return RESIDENT for scores 351-650', () => {
    expect(getTierFromScore(500)).toBe('RESIDENT');
    expect(getTierFromScore(650)).toBe('RESIDENT');
  });

  it('should return BUILDER for score 651', () => {
    expect(getTierFromScore(651)).toBe('BUILDER');
  });

  it('should return BUILDER for scores 651-850', () => {
    expect(getTierFromScore(700)).toBe('BUILDER');
    expect(getTierFromScore(850)).toBe('BUILDER');
  });

  it('should return BASED for score 851', () => {
    expect(getTierFromScore(851)).toBe('BASED');
  });

  it('should return BASED for scores 851-950', () => {
    expect(getTierFromScore(900)).toBe('BASED');
    expect(getTierFromScore(950)).toBe('BASED');
  });

  it('should return LEGEND for score 951', () => {
    expect(getTierFromScore(951)).toBe('LEGEND');
  });

  it('should return LEGEND for scores above 951', () => {
    expect(getTierFromScore(1000)).toBe('LEGEND');
    expect(getTierFromScore(5000)).toBe('LEGEND');
  });
});

describe('isEarlyMint', () => {
  it('should return true for mint within 24 hours', () => {
    const deployTime = 1000;
    const mintTime = deployTime + 10000; // 10000 seconds later
    expect(isEarlyMint(mintTime, deployTime)).toBe(true);
  });

  it('should return false for mint at exactly 24 hours', () => {
    const deployTime = 1000;
    const mintTime = deployTime + EARLY_MINT_WINDOW;
    expect(isEarlyMint(mintTime, deployTime)).toBe(false);
  });

  it('should return false for mint after 24 hours', () => {
    const deployTime = 1000;
    const mintTime = deployTime + EARLY_MINT_WINDOW + 1;
    expect(isEarlyMint(mintTime, deployTime)).toBe(false);
  });

  it('should return true for mint immediately after deploy', () => {
    const deployTime = 1000;
    const mintTime = deployTime + 1;
    expect(isEarlyMint(mintTime, deployTime)).toBe(true);
  });

  it('should return true for negative time difference (mint before deploy)', () => {
    const deployTime = 1000;
    const mintTime = 500; // Before deploy (negative difference)
    // The function returns (500 - 1000) < 86400, which is -500 < 86400 = true
    // This is technically correct as the difference is less than 24 hours
    expect(isEarlyMint(mintTime, deployTime)).toBe(true);
  });
});

describe('calculateTotalScore', () => {
  it('should sum all score components', () => {
    const result = calculateTotalScore({
      baseScore: 100,
      zoraScore: 200,
      timelyScore: 300,
    });
    expect(result).toBe(600n);
  });

  it('should handle zero scores', () => {
    const result = calculateTotalScore({
      baseScore: 0,
      zoraScore: 0,
      timelyScore: 0,
    });
    expect(result).toBe(0n);
  });

  it('should return bigint type', () => {
    const result = calculateTotalScore({
      baseScore: 1,
      zoraScore: 1,
      timelyScore: 1,
    });
    expect(typeof result).toBe('bigint');
  });
});

describe('calculateBaseTenure', () => {
  it('should calculate 0 days for same timestamp', () => {
    const result = calculateBaseTenure(1000, 1000);
    expect(result).toBe(0);
  });

  it('should calculate 1 day correctly', () => {
    const firstTx = 1000;
    const current = firstTx + 86400;
    const result = calculateBaseTenure(firstTx, current);
    expect(result).toBe(1);
  });

  it('should calculate 30 days correctly', () => {
    const firstTx = 1000;
    const current = firstTx + 86400 * 30;
    const result = calculateBaseTenure(firstTx, current);
    expect(result).toBe(30);
  });

  it('should round down partial days', () => {
    const firstTx = 1000;
    const current = firstTx + 86400 + 43200; // 1.5 days
    const result = calculateBaseTenure(firstTx, current);
    expect(result).toBe(1);
  });

  it('should handle year-long tenure', () => {
    const firstTx = 1000;
    const current = firstTx + 86400 * 365;
    const result = calculateBaseTenure(firstTx, current);
    expect(result).toBe(365);
  });

  it('should return 0 for negative time difference', () => {
    const result = calculateBaseTenure(2000, 1000);
    expect(result).toBe(0);
  });
});

describe('isZeroAddress', () => {
  it('should return true for zero address', () => {
    expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true);
  });

  it('should return true for uppercase zero address', () => {
    expect(isZeroAddress('0x0000000000000000000000000000000000000000'.toUpperCase())).toBe(true);
  });

  it('should return false for non-zero address', () => {
    expect(isZeroAddress('0x1234567890123456789012345678901234567890')).toBe(false);
  });
});

describe('normalizeAddress', () => {
  it('should lowercase addresses', () => {
    expect(normalizeAddress('0xABC')).toBe('0xabc');
  });

  it('should handle already lowercase addresses', () => {
    expect(normalizeAddress('0xabc')).toBe('0xabc');
  });

  it('should handle mixed case addresses', () => {
    expect(normalizeAddress('0xAbCdEf')).toBe('0xabcdef');
  });
});
