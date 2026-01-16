import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/reputation/route';
import { NextRequest } from 'next/server';
import { dbService } from '@/lib/database-service';
import * as envLib from '@/lib/env';
import * as scoringLib from '@/lib/scoring';

// Mock dependencies
vi.mock('@/lib/database-service', () => ({
  dbService: {
    getUserRank: vi.fn(),
    getUserByAddress: vi.fn(),
  },
}));

vi.mock('@/lib/request-logger', () => ({
  RequestLogger: {
    logSecurityEvent: vi.fn(),
    logRequest: vi.fn(),
    logWarning: vi.fn(),
    logError: vi.fn(),
  },
}));

vi.mock('@/lib/env', async (importOriginal) => {
  const actual = await importOriginal<typeof envLib>();
  return {
    ...actual,
    isServiceConfigured: vi.fn(),
    PONDER_URL: 'http://mock-ponder',
  };
});

vi.mock('@/lib/scoring', () => ({
  calculateReputationScore: vi.fn(),
}));

describe('GET /api/reputation', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const validUrl = `http://localhost:3000/api/reputation?address=${mockAddress}`;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to false to ensure we test fallbacks; set to 'true' in specific tests to enable
    process.env.ENABLE_PVC_SCORING = 'false';
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it('should return 400 if address is missing or invalid', async () => {
    const req = new NextRequest('http://localhost:3000/api/reputation');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('should return Ponder data if configured and available', async () => {
    vi.mocked(envLib.isServiceConfigured).mockReturnValue(true);
    const mockPonderData = { score: 100, tier: 'GOLD' };
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPonderData,
    } as Response);

    const req = new NextRequest(validUrl);
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual(mockPonderData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(mockAddress),
      expect.any(Object)
    );
  });

  it('should fall back if Ponder fails', async () => {
    vi.mocked(envLib.isServiceConfigured).mockReturnValue(true);
    global.fetch = vi.fn().mockRejectedValue(new Error('Ponder down'));
    
    // Should fall through to mock data (since DB/PVC are mocked to fail/be disabled by default in beforeEach)
    const req = new NextRequest(validUrl);
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.scoringModel).toBe('mock');
  });

  it('should use PVC scoring if enabled', async () => {
    process.env.ENABLE_PVC_SCORING = 'true';
    vi.mocked(envLib.isServiceConfigured).mockReturnValue(false);
    
    const mockPvcScore = {
      totalScore: 500,
      tier: 'SILVER',
      multiplier: 1.0,
      breakdown: { tenure: 100, economic: 200, social: 200 },
      pillars: {},
      decayInfo: {},
    };
    
    vi.mocked(scoringLib.calculateReputationScore).mockResolvedValue(mockPvcScore as any);
    vi.mocked(dbService.getUserRank).mockResolvedValue({ rank: 1, totalUsers: 10 });

    const req = new NextRequest(validUrl);
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.scoringModel).toBe('PVC');
    expect(data.data.totalScore).toBe(500);
  });

  it('should use legacy DB scoring if PVC disabled and user exists', async () => {
    vi.mocked(envLib.isServiceConfigured).mockReturnValue(false);
    
    vi.mocked(dbService.getUserByAddress).mockResolvedValue({
      address: mockAddress,
      score: 300,
      tier: 'BRONZE',
      lastUpdated: new Date(),
    } as any);
    
    vi.mocked(dbService.getUserRank).mockResolvedValue({ rank: 5, totalUsers: 100 });

    const req = new NextRequest(validUrl);
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.scoringModel).toBe('legacy');
    expect(data.data.totalScore).toBe(300);
  });

  it('should return mock data if all else fails', async () => {
    vi.mocked(envLib.isServiceConfigured).mockReturnValue(false);
    vi.mocked(dbService.getUserByAddress).mockResolvedValue(null);

    const req = new NextRequest(validUrl);
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.scoringModel).toBe('mock');
    expect(data.data.address).toBe(mockAddress);
  });

  it('should handle internal errors gracefully', async () => {
    vi.mocked(envLib.isServiceConfigured).mockImplementation(() => {
      throw new Error('Critical failure');
    });

    const req = new NextRequest(validUrl);
    const res = await GET(req);
    
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});