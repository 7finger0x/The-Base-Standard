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
  it('should return Novice for score 0', () => {
    expect(getTierFromScore(0)).toBe('Novice');
  });

  it('should return Novice for scores below 100', () => {
    expect(getTierFromScore(50)).toBe('Novice');
    expect(getTierFromScore(99)).toBe('Novice');
  });

  it('should return Bronze for score 100', () => {
    expect(getTierFromScore(100)).toBe('Bronze');
  });

  it('should return Bronze for scores 100-499', () => {
    expect(getTierFromScore(250)).toBe('Bronze');
    expect(getTierFromScore(499)).toBe('Bronze');
  });

  it('should return Silver for score 500', () => {
    expect(getTierFromScore(500)).toBe('Silver');
  });

  it('should return Silver for scores 500-849', () => {
    expect(getTierFromScore(700)).toBe('Silver');
    expect(getTierFromScore(849)).toBe('Silver');
  });

  it('should return Gold for score 850', () => {
    expect(getTierFromScore(850)).toBe('Gold');
  });

  it('should return Gold for scores 850-999', () => {
    expect(getTierFromScore(900)).toBe('Gold');
    expect(getTierFromScore(999)).toBe('Gold');
  });

  it('should return BASED for score 1000', () => {
    expect(getTierFromScore(1000)).toBe('BASED');
  });

  it('should return BASED for scores above 1000', () => {
    expect(getTierFromScore(5000)).toBe('BASED');
    expect(getTierFromScore(10000)).toBe('BASED');
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
    expect(result).toBe('0x12345678...34567890');
  });

  it('should return full address when showFull is true and no name', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const result = await formatAddressWithNames(address, true);
    expect(result).toBe(address);
  });
});
