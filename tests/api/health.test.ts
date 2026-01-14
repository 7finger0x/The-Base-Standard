import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';

// Mock the health checker
vi.mock('@/lib/health-checker', () => ({
  HealthChecker: {
    healthEndpoint: vi.fn(),
  },
}));

import { HealthChecker } from '@/lib/health-checker';

describe('Health API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return healthy status when all services are up', async () => {
      const mockHealthResponse = new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: [
            { name: 'database', status: 'healthy', responseTime: 10 },
            { name: 'base-rpc', status: 'healthy', responseTime: 50 },
          ],
          uptime: 10000,
        }),
        { status: 200 }
      );

      (HealthChecker.healthEndpoint as any).mockResolvedValueOnce(mockHealthResponse);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data).toHaveProperty('services');
      expect(data).toHaveProperty('uptime');
    });

    it('should return degraded status when some services are down', async () => {
      const mockHealthResponse = new Response(
        JSON.stringify({
          status: 'degraded',
          timestamp: new Date().toISOString(),
          services: [
            { name: 'database', status: 'healthy', responseTime: 10 },
            { name: 'ponder', status: 'degraded', error: 'Not configured' },
          ],
          uptime: 10000,
        }),
        { status: 200 }
      );

      (HealthChecker.healthEndpoint as any).mockResolvedValueOnce(mockHealthResponse);

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe('degraded');
    });

    it('should return unhealthy status on critical failure', async () => {
      const mockHealthResponse = new Response(
        JSON.stringify({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: [],
          uptime: 0,
          error: 'Health check failed',
        }),
        { status: 503 }
      );

      (HealthChecker.healthEndpoint as any).mockResolvedValueOnce(mockHealthResponse);

      const response = await GET();

      expect(response.status).toBe(503);
    });

    it('should handle health checker errors gracefully', async () => {
      (HealthChecker.healthEndpoint as any).mockRejectedValueOnce(
        new Error('Health check failure')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data).toHaveProperty('error');
    });
  });
});
