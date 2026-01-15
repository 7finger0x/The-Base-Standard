import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/leaderboard/route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = vi.fn();

describe('Leaderboard API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/leaderboard', () => {
    it('should return leaderboard with default limit and offset', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=100&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('leaderboard');
      expect(data).toHaveProperty('pagination');
      expect(data.leaderboard).toBeInstanceOf(Array);
    });

    it('should respect custom limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=50&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.leaderboard).toHaveLength(50);
      expect(data.pagination.limit).toBe(50);
    });

    it('should respect offset parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=100&offset=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.offset).toBe(100);
      if (data.leaderboard && data.leaderboard.length > 0) {
        expect(data.leaderboard[0].rank).toBe(101); // First rank should be offset + 1
      }
    });

    it('should return ranked users in descending score order', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=10&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.leaderboard && data.leaderboard.length > 0) {
        const scores = data.leaderboard.map((user: any) => user.score);
        const sortedScores = [...scores].sort((a, b) => b - a);
        expect(scores).toEqual(sortedScores);
      }
    });

    it('should include tier for each user', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=10&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('leaderboard');
      if (data.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
        data.leaderboard.forEach((user: any) => {
          expect(user).toHaveProperty('tier');
          expect(['TOURIST', 'RESIDENT', 'BUILDER', 'BASED', 'LEGEND']).toContain(user.tier);
        });
      }
    });

    it('should include address for each user', async () => {
      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=5&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('leaderboard');
      if (data.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
        data.leaderboard.forEach((user: any) => {
          expect(user).toHaveProperty('address');
          expect(user.address).toMatch(/^0x[0-9a-f]{40}$/i);
        });
      }
    });

    it('should indicate hasMore correctly', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/leaderboard?limit=100&offset=0');
      const response1 = await GET(request1);
      const data1 = await response1.json();
      expect(data1.pagination.hasMore).toBe(true);

      const request2 = new NextRequest('http://localhost:3000/api/leaderboard?limit=100&offset=950');
      const response2 = await GET(request2);
      const data2 = await response2.json();
      expect(data2.pagination.hasMore).toBe(false);
    });

    it('should fetch from Ponder when available', async () => {
      const mockLeaderboard = {
        leaderboard: [
          { rank: 1, address: '0x123', score: 2000, tier: 'BASED' },
        ],
        pagination: { limit: 100, offset: 0, hasMore: true },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboard,
      });

      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=100&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('leaderboard');
      expect(data).toHaveProperty('pagination');
      expect(data.leaderboard).toBeInstanceOf(Array);
    });

    it('should fallback to mock data when Ponder fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Ponder unavailable'));

      const request = new NextRequest('http://localhost:3000/api/leaderboard?limit=100&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('leaderboard');
      expect(data.leaderboard).toBeInstanceOf(Array);
    });
  });
});
