/**
 * Tests for Chainlink Data Feeds Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBasePrice, getETHPrice, calculateEconomicActivityScore, isPriceDataFresh } from '@/lib/chainlink/data-feeds';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Mock viem
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    createPublicClient: vi.fn(),
  };
});

describe('Chainlink Data Feeds', () => {
  let mockReadContract: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReadContract = vi.fn();
    
    (createPublicClient as ReturnType<typeof vi.fn>).mockReturnValue({
      readContract: mockReadContract,
    });
  });

  describe('getBasePrice', () => {
    it('should fetch Base/USD price from Chainlink', async () => {
      const mockData = [
        BigInt(1), // roundId
        BigInt(2500000000), // answer (25.00 USD with 8 decimals)
        BigInt(1704067200), // startedAt
        BigInt(1704067200), // updatedAt
        BigInt(1), // answeredInRound
      ];

      mockReadContract.mockResolvedValueOnce(mockData);

      const result = await getBasePrice();

      expect(result.price).toBe(25.0);
      expect(result.updatedAt).toBe(1704067200);
      expect(result.roundId).toBe(BigInt(1));
      expect(mockReadContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'latestRoundData',
        })
      );
    });
  });

  describe('getETHPrice', () => {
    it('should fetch ETH/USD price from Chainlink', async () => {
      const mockData = [
        BigInt(1),
        BigInt(300000000000), // 3000 USD with 8 decimals
        BigInt(1704067200),
        BigInt(1704067200),
        BigInt(1),
      ];

      mockReadContract.mockResolvedValueOnce(mockData);

      const result = await getETHPrice();

      expect(result.price).toBe(3000.0);
    });
  });

  describe('calculateEconomicActivityScore', () => {
    it('should calculate score based on transaction value', async () => {
      const mockData = [
        BigInt(1),
        BigInt(300000000000), // 3000 USD
        BigInt(1704067200),
        BigInt(1704067200),
        BigInt(1),
      ];

      mockReadContract.mockResolvedValueOnce(mockData);

      // 1 ETH transaction = 3000 USD
      const valueInWei = BigInt('1000000000000000000'); // 1 ETH
      const score = await calculateEconomicActivityScore(valueInWei);

      // log10(3000 + 1) * 10 ≈ 33.5, capped at 100
      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for zero value transactions', async () => {
      // Mock ETH price for the calculation
      const mockData = [
        BigInt(1),
        BigInt(300000000000), // 3000 USD
        BigInt(1704067200),
        BigInt(1704067200),
        BigInt(1),
      ];
      mockReadContract.mockResolvedValueOnce(mockData);

      const score = await calculateEconomicActivityScore(BigInt(0));
      expect(score).toBe(0);
    });
  });

  describe('isPriceDataFresh', () => {
    it('should return true for recent data', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 1800; // 30 minutes ago
      expect(isPriceDataFresh(recentTimestamp)).toBe(true);
    });

    it('should return false for stale data', () => {
      const staleTimestamp = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
      expect(isPriceDataFresh(staleTimestamp)).toBe(false);
    });
  });
});
