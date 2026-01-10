import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/reputation/route';
import { NextResponse } from 'next/server';

// Mock fetch
global.fetch = vi.fn();

describe('Reputation API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/reputation', () => {
    it('should return 400 when address is missing', async () => {
      const request = new Request('http://localhost:3000/api/reputation');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Address required');
    });

    it('should fetch from Ponder when available', async () => {
      const mockData = {
        address: '0x123',
        totalScore: 1000,
        tier: 'BASED',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const request = new Request('http://localhost:3000/api/reputation?address=0x123');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual(mockData);
    });

    it('should return mock data when Ponder is unavailable', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Connection failed'));

      const request = new Request('http://localhost:3000/api/reputation?address=0x123');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('totalScore');
      expect(data).toHaveProperty('tier');
      expect(data).toHaveProperty('breakdown');
    });

    it('should return mock data when Ponder returns non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = new Request('http://localhost:3000/api/reputation?address=0x123');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('totalScore');
      expect(data).toHaveProperty('tier');
    });

    it('should generate deterministic mock data for same address', async () => {
      (global.fetch as any).mockRejectedValue(new Error('No Ponder'));

      const request1 = new Request('http://localhost:3000/api/reputation?address=0xABC');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      const request2 = new Request('http://localhost:3000/api/reputation?address=0xABC');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data1.totalScore).toBe(data2.totalScore);
      expect(data1.tier).toBe(data2.tier);
    });

    it('should generate different mock data for different addresses', async () => {
      (global.fetch as any).mockRejectedValue(new Error('No Ponder'));

      const request1 = new Request('http://localhost:3000/api/reputation?address=0x111');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      const request2 = new Request('http://localhost:3000/api/reputation?address=0x222');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data1.totalScore).not.toBe(data2.totalScore);
    });
  });
});
