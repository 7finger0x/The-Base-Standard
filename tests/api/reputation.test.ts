import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock db module before importing route
vi.mock('@/lib/db', () => {
  const mockPrisma = {
    user: { findUnique: vi.fn(), create: vi.fn() },
    wallet: { findUnique: vi.fn(), create: vi.fn() },
    $queryRaw: vi.fn(),
  };
  return {
    prisma: mockPrisma,
  };
});

// Mock fetch
global.fetch = vi.fn();

import { GET } from '@/app/api/reputation/route';

describe('Reputation API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/reputation', () => {
    it('should return 400 when address is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/reputation');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('WALLET_REQUIRED');
    });

    it('should fetch from Ponder when available', async () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      const mockData = {
        address: validAddress,
        totalScore: 1000,
        tier: 'BASED',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const request = new NextRequest(`http://localhost:3000/api/reputation?address=${validAddress}`);
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.address).toBe(validAddress);
      expect(data.data.totalScore).toBeDefined();
      expect(data.data.tier).toBeDefined();
    });

    it('should return mock data when Ponder is unavailable', async () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      (global.fetch as any).mockRejectedValueOnce(new Error('Connection failed'));

      const request = new NextRequest(`http://localhost:3000/api/reputation?address=${validAddress}`);
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalScore');
      expect(data.data).toHaveProperty('tier');
      expect(data.data).toHaveProperty('breakdown');
    });

    it('should return mock data when Ponder returns non-ok response', async () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = new NextRequest(`http://localhost:3000/api/reputation?address=${validAddress}`);
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalScore');
      expect(data.data).toHaveProperty('tier');
    });

    it('should generate deterministic mock data for same address', async () => {
      const validAddress = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
      (global.fetch as any).mockRejectedValue(new Error('No Ponder'));

      const request1 = new NextRequest(`http://localhost:3000/api/reputation?address=${validAddress}`);
      const response1 = await GET(request1);
      const data1 = await response1.json();

      const request2 = new NextRequest(`http://localhost:3000/api/reputation?address=${validAddress}`);
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data1.data.totalScore).toBe(data2.data.totalScore);
      expect(data1.data.tier).toBe(data2.data.tier);
    });

    it('should generate different mock data for different addresses', async () => {
      const address1 = '0x1111111111111111111111111111111111111111';
      const address2 = '0x2222222222222222222222222222222222222222';
      (global.fetch as any).mockRejectedValue(new Error('No Ponder'));

      const request1 = new NextRequest(`http://localhost:3000/api/reputation?address=${address1}`);
      const response1 = await GET(request1);
      const data1 = await response1.json();

      const request2 = new NextRequest(`http://localhost:3000/api/reputation?address=${address2}`);
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data1.data.totalScore).not.toBe(data2.data.totalScore);
    });
  });
});
