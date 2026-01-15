import { describe, it, expect } from 'vitest';
import {
  cn,
  shortenAddress,
  formatScore,
  getTierFromScore,
  resolveBaseName,
  reverseResolveBaseName,
  formatAddressWithNames,
} from '@/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('shortenAddress', () => {
  const testAddress = '0x1234567890123456789012345678901234567890';

  it('should shorten address with default chars', () => {
    expect(shortenAddress(testAddress)).toBe('0x1234...7890');
  });

  it('should shorten address with custom chars', () => {
    expect(shortenAddress(testAddress, 6)).toBe('0x123456...567890');
  });

  it('should handle short addresses', () => {
    expect(shortenAddress('0x123', 2)).toBe('0x12...23');
  });
});

describe('formatScore', () => {
  it('should format small numbers', () => {
    expect(formatScore(100)).toBe('100');
  });

  it('should format numbers with commas', () => {
    expect(formatScore(1000)).toBe('1,000');
  });

  it('should format large numbers', () => {
    expect(formatScore(1234567)).toBe('1,234,567');
  });

  it('should handle zero', () => {
    expect(formatScore(0)).toBe('0');
  });
});

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

describe('resolveBaseName', () => {
  it('should return null for unmapped addresses', async () => {
    const result = await resolveBaseName('0x1234567890123456789012345678901234567890');
    expect(result).toBeNull();
  });

  it('should handle lowercase addresses', async () => {
    const result = await resolveBaseName('0xabc');
    expect(result).toBeNull();
  });
});

describe('reverseResolveBaseName', () => {
  it('should return null for unimplemented reverse lookup', async () => {
    const result = await reverseResolveBaseName('test');
    expect(result).toBeNull();
  });
});

describe('formatAddressWithNames', () => {
  it('should return empty string for empty address', async () => {
    const result = await formatAddressWithNames('');
    expect(result).toBe('');
  });

  it('should return shortened address when no name found', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const result = await formatAddressWithNames(address);
    // Default is 6 chars, so 0x + 6 chars ... + 6 chars
    expect(result).toBe('0x123456...567890');
  });

  it('should return full address when showFull is true and no name', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const result = await formatAddressWithNames(address, true);
    expect(result).toBe(address);
  });
});
