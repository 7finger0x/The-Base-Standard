/**
 * Tests for Metrics Collector
 * Tests data collection, caching, and aggregation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsCollector } from '@/lib/scoring/metrics-collector';
import type { OnChainData, ZoraData, FarcasterData, IdentityData } from '@/lib/scoring/metrics-collector';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  http: vi.fn(),
}));

// Mock environment variables
vi.mock('@/lib/env', () => ({
  BASE_RPC_URL: 'https://mainnet.base.org',
  PONDER_URL: 'http://localhost:42069',
}));

// Mock request logger
vi.mock('@/lib/request-logger', () => ({
  RequestLogger: {
    logWarning: vi.fn(),
    logError: vi.fn(),
  },
}));

describe('MetricsCollector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear caches
    (MetricsCollector as any).txCache?.clear();
    (MetricsCollector as any).zoraCache?.clear();
    (MetricsCollector as any).farcasterCache?.clear();
  });

  describe('collectMetrics', () => {
    it('should collect all metrics and aggregate', async () => {
      const mockOnChain: OnChainData = {
        address: '0x1234567890123456789012345678901234567890',
        firstTxTimestamp: 1691539200, // Base launch
        transactions: [],
        contractInteractions: [],
        deployedContracts: [],
      };

      const mockZora: ZoraData = {
        mints: [],
        collections: [],
        earlyMints: [],
        secondaryVolumeUSD: 0,
      };

      const mockFarcaster: FarcasterData = {
        followers: 0,
        following: 0,
        casts: 0,
      };

      const mockIdentity: IdentityData = {
        hasCoinbaseAttestation: false,
      };

      const metrics = await MetricsCollector.collectMetrics('0x1234567890123456789012345678901234567890', {
        onChainData: mockOnChain,
        zoraData: mockZora,
        farcasterData: mockFarcaster,
        identityData: mockIdentity,
      });

      expect(metrics).toBeDefined();
      expect(metrics.activeMonths).toBe(0);
      expect(metrics.volumeUSD).toBe(0);
      expect(metrics.uniqueZoraCollections).toBe(0);
    });

    it('should use provided metrics when available', async () => {
      const providedMetrics = {
        onChainData: {
          address: '0x123',
          firstTxTimestamp: 1691539200,
          transactions: [],
          contractInteractions: [],
          deployedContracts: [],
        },
        zoraData: {
          mints: [],
          collections: ['0xabc'],
          earlyMints: [],
          secondaryVolumeUSD: 1000,
        },
        farcasterData: {
          fid: 12345,
          followers: 100,
          following: 50,
          casts: 200,
        },
        identityData: {
          hasCoinbaseAttestation: true,
          gitcoinPassportScore: 30,
        },
      };

      const metrics = await MetricsCollector.collectMetrics('0x123', providedMetrics);

      expect(metrics.uniqueZoraCollections).toBe(1);
      expect(metrics.secondaryMarketVolumeUSD).toBe(1000);
      expect(metrics.farcasterFID).toBe(12345);
      expect(metrics.hasCoinbaseAttestation).toBe(true);
      expect(metrics.gitcoinPassportScore).toBe(30);
    });
  });

  describe('Caching', () => {
    it('should cache on-chain data', async () => {
      const address = '0x1234567890123456789012345678901234567890';
      
      // Mock fetch to return data
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          result: [],
        }),
      });

      // First call - should fetch
      await MetricsCollector.collectMetrics(address, {});
      
      // Second call - should use cache
      const startTime = Date.now();
      await MetricsCollector.collectMetrics(address, {});
      const endTime = Date.now();

      // Should be fast (cached)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      // Should not throw, but return empty/default metrics
      const metrics = await MetricsCollector.collectMetrics('0x123', {});
      expect(metrics).toBeDefined();
    });

    it('should handle invalid API responses', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const metrics = await MetricsCollector.collectMetrics('0x123', {});
      expect(metrics).toBeDefined();
    });
  });

  describe('Metric Aggregation', () => {
    it('should calculate active months correctly', async () => {
      const mockOnChain: OnChainData = {
        address: '0x123',
        firstTxTimestamp: 1691539200,
        transactions: [
          {
            hash: '0x1',
            timestamp: 1691539200, // Month 1
            gasUsed: 100000n,
            gasPrice: 1000000000n,
            to: null,
            value: 0n,
          },
          {
            hash: '0x2',
            timestamp: 1694217600, // Month 2
            gasUsed: 100000n,
            gasPrice: 1000000000n,
            to: null,
            value: 0n,
          },
        ],
        contractInteractions: [],
        deployedContracts: [],
      };

      const metrics = await MetricsCollector.collectMetrics('0x123', {
        onChainData: mockOnChain,
      });

      expect(metrics.activeMonths).toBeGreaterThan(0);
    });

    it('should calculate gas used in ETH', async () => {
      const mockOnChain: OnChainData = {
        address: '0x123',
        firstTxTimestamp: 1691539200,
        transactions: [
          {
            hash: '0x1',
            timestamp: 1691539200,
            gasUsed: 100000n,
            gasPrice: 1000000000000n, // 1 gwei
            to: null,
            value: 0n,
          },
        ],
        contractInteractions: [],
        deployedContracts: [],
      };

      const metrics = await MetricsCollector.collectMetrics('0x123', {
        onChainData: mockOnChain,
      });

      expect(metrics.gasUsedETH).toBeGreaterThan(0);
    });

    it('should determine capital tier correctly', async () => {
      const lowVolume = await MetricsCollector.collectMetrics('0x123', {
        onChainData: {
          address: '0x123',
          firstTxTimestamp: 0,
          transactions: [],
          contractInteractions: [],
          deployedContracts: [],
        },
      });
      expect(lowVolume.capitalTier).toBe('low');

      // Note: Capital tier is determined by volumeUSD in aggregateMetrics
      // We'd need to mock transactions with values to test mid/high tiers
    });

    it('should calculate early adopter vintage', async () => {
      // Genesis (before Base launch)
      const genesis = await MetricsCollector.collectMetrics('0x123', {
        onChainData: {
          address: '0x123',
          firstTxTimestamp: 1690000000, // Before Base launch (Aug 9, 2023)
          transactions: [],
          contractInteractions: [],
          deployedContracts: [],
        },
      });
      expect(genesis.earlyAdopterVintage).toBe('genesis');

      // Month 1 (within 30 days of launch)
      const month1 = await MetricsCollector.collectMetrics('0x123', {
        onChainData: {
          address: '0x123',
          firstTxTimestamp: 1692000000, // Within 30 days
          transactions: [],
          contractInteractions: [],
          deployedContracts: [],
        },
      });
      expect(month1.earlyAdopterVintage).toBe('month1');
    });
  });

  describe('Zora Data Collection', () => {
    it('should aggregate Zora metrics', async () => {
      const mockZora: ZoraData = {
        mints: [],
        collections: ['0xabc', '0xdef'],
        earlyMints: ['0xabc-token1', '0xabc-token2'],
        secondaryVolumeUSD: 5000,
        creatorVolume: 2000,
      };

      const metrics = await MetricsCollector.collectMetrics('0x123', {
        zoraData: mockZora,
      });

      expect(metrics.uniqueZoraCollections).toBe(2);
      expect(metrics.heldEarlyMints).toBe(2);
      expect(metrics.secondaryMarketVolumeUSD).toBe(5000);
      expect(metrics.zoraCreatorVolume).toBe(2000);
    });
  });

  describe('Farcaster Data Collection', () => {
    it('should aggregate Farcaster metrics', async () => {
      const mockFarcaster: FarcasterData = {
        fid: 12345,
        openRank: 1000,
        percentile: 95,
        followers: 500,
        following: 200,
        casts: 1000,
      };

      const metrics = await MetricsCollector.collectMetrics('0x123', {
        farcasterData: mockFarcaster,
      });

      expect(metrics.farcasterFID).toBe(12345);
      expect(metrics.farcasterOpenRank).toBe(1000);
      expect(metrics.farcasterPercentile).toBe(95);
    });
  });

  describe('Identity Data Collection', () => {
    it('should aggregate identity metrics', async () => {
      const mockIdentity: IdentityData = {
        hasCoinbaseAttestation: true,
        gitcoinPassportScore: 35,
        ensName: 'test.eth',
      };

      const metrics = await MetricsCollector.collectMetrics('0x123', {
        identityData: mockIdentity,
      });

      expect(metrics.hasCoinbaseAttestation).toBe(true);
      expect(metrics.gitcoinPassportScore).toBe(35);
    });
  });
});
