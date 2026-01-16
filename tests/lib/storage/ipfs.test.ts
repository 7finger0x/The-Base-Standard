/**
 * Tests for IPFS Storage Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeReputationMetadata, storeFileOnIPFS, resolveIPFSUrl } from '@/lib/storage/ipfs';

// Mock environment
vi.mock('@/lib/env', () => ({
  env: {
    PINATA_JWT_TOKEN: 'test-token',
    NEXT_PUBLIC_PINATA_GATEWAY: 'gateway.pinata.cloud',
  },
  isServiceConfigured: vi.fn(() => true),
}));

// Mock fetch
global.fetch = vi.fn();

describe('IPFS Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('storeReputationMetadata', () => {
    it('should store metadata on IPFS and return CID', async () => {
      const mockResponse = {
        IpfsHash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        PinSize: 1234,
        Timestamp: '2024-01-01T00:00:00.000Z',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const metadata = {
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        score: 850,
        tier: 'BASED',
        timestamp: Date.now(),
        linkedWallets: [],
      };

      const cid = await storeReputationMetadata(metadata);

      expect(cid).toBe(mockResponse.IpfsHash);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should throw error if IPFS service not configured', async () => {
      const { isServiceConfigured } = await import('@/lib/env');
      vi.mocked(isServiceConfigured).mockReturnValueOnce(false);

      const metadata = {
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        score: 850,
        tier: 'BASED',
        timestamp: Date.now(),
        linkedWallets: [],
      };

      await expect(storeReputationMetadata(metadata)).rejects.toThrow(
        'IPFS service not configured'
      );
    });

    it('should throw error if Pinata API fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      const metadata = {
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        score: 850,
        tier: 'BASED',
        timestamp: Date.now(),
        linkedWallets: [],
      };

      await expect(storeReputationMetadata(metadata)).rejects.toThrow(
        'Failed to pin to IPFS'
      );
    });
  });

  describe('resolveIPFSUrl', () => {
    it('should resolve IPFS URI to gateway URL', () => {
      const cid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
      const ipfsUrl = `ipfs://${cid}`;
      const gatewayUrl = resolveIPFSUrl(ipfsUrl);

      expect(gatewayUrl).toBe(`https://gateway.pinata.cloud/ipfs/${cid}`);
    });

    it('should resolve Arweave URI', () => {
      const txId = 'abc123';
      const arUrl = `ar://${txId}`;
      const gatewayUrl = resolveIPFSUrl(arUrl);

      expect(gatewayUrl).toBe(`https://arweave.net/${txId}`);
    });

    it('should return HTTP URLs unchanged', () => {
      const httpUrl = 'https://example.com/image.png';
      const result = resolveIPFSUrl(httpUrl);

      expect(result).toBe(httpUrl);
    });
  });
});
