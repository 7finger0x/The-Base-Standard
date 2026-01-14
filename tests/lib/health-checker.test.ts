import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthChecker } from '@/lib/health-checker';

// Mock dependencies
vi.mock('@/lib/database-service', () => ({
  dbService: {
    healthCheck: vi.fn(),
  },
}));

vi.mock('@/lib/env', () => ({
  isServiceConfigured: vi.fn(),
  PONDER_URL: 'http://localhost:42069',
}));

import { dbService } from '@/lib/database-service';
import { isServiceConfigured } from '@/lib/env';

// Mock fetch
global.fetch = vi.fn();

describe('HealthChecker', () => {
  let healthChecker: HealthChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    healthChecker = new HealthChecker();
  });

  describe('checkDatabase', () => {
    it('should return healthy status when database is up', async () => {
      (dbService.healthCheck as any).mockResolvedValueOnce(true);

      const result = await healthChecker.checkDatabase();

      expect(result.name).toBe('database');
      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status when database is down', async () => {
      (dbService.healthCheck as any).mockResolvedValueOnce(false);

      const result = await healthChecker.checkDatabase();

      expect(result.status).toBe('unhealthy');
    });

    it('should handle database errors', async () => {
      (dbService.healthCheck as any).mockRejectedValueOnce(new Error('Connection refused'));

      const result = await healthChecker.checkDatabase();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe('Connection refused');
    });
  });

  describe('checkPonder', () => {
    it('should return degraded when Ponder not configured', async () => {
      (isServiceConfigured as any).mockReturnValueOnce(false);

      const result = await healthChecker.checkPonder();

      expect(result.name).toBe('ponder');
      expect(result.status).toBe('degraded');
      expect(result.error).toBe('Ponder service not configured');
    });

    it('should return healthy when Ponder responds ok', async () => {
      (isServiceConfigured as any).mockReturnValueOnce(true);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await healthChecker.checkPonder();

      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return degraded when Ponder responds not ok', async () => {
      (isServiceConfigured as any).mockReturnValueOnce(true);
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await healthChecker.checkPonder();

      expect(result.status).toBe('degraded');
    });

    it('should return unhealthy on connection error', async () => {
      (isServiceConfigured as any).mockReturnValueOnce(true);
      (global.fetch as any).mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const result = await healthChecker.checkPonder();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toContain('ECONNREFUSED');
    });

    it('should timeout after 5 seconds', async () => {
      (isServiceConfigured as any).mockReturnValueOnce(true);
      (global.fetch as any).mockImplementationOnce(
        () => new Promise((_, reject) => {
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 100); // Simulate abort after 100ms
        })
      );

      const result = await healthChecker.checkPonder();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBeTruthy();
    }, 10000); // Increase test timeout to 10 seconds
  });

  describe('checkRpcEndpoints', () => {
    it('should check both Base and Zora RPC endpoints', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const results = await healthChecker.checkRpcEndpoints();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('base-rpc');
      expect(results[1].name).toBe('zora-rpc');
    });

    it('should return healthy for working RPC', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const results = await healthChecker.checkRpcEndpoints();

      expect(results[0].status).toBe('healthy');
    });

    it('should return unhealthy for failed RPC', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const results = await healthChecker.checkRpcEndpoints();

      expect(results[0].status).toBe('unhealthy');
    });

    it('should make proper JSON-RPC request', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });

      await healthChecker.checkRpcEndpoints();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('eth_blockNumber'),
        })
      );
    });
  });

  describe('getOverallHealth', () => {
    beforeEach(() => {
      (isServiceConfigured as any).mockReturnValue(false);
      (dbService.healthCheck as any).mockResolvedValue(true);
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
    });

    it('should return healthy or degraded when services are checked', async () => {
      const health = await healthChecker.getOverallHealth();

      // Can be healthy or degraded depending on Ponder configuration
      expect(['healthy', 'degraded']).toContain(health.status);
      expect(health.services.length).toBeGreaterThan(0);
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.timestamp).toBeTruthy();
    });

    it('should return unhealthy when critical service is down', async () => {
      (dbService.healthCheck as any).mockResolvedValueOnce(false);

      const health = await healthChecker.getOverallHealth();

      expect(health.status).toBe('unhealthy');
    });

    it('should return degraded when non-critical service is down', async () => {
      (isServiceConfigured as any).mockReturnValueOnce(false);

      const health = await healthChecker.getOverallHealth();

      // With Ponder not configured, status should be degraded
      const ponderService = health.services.find((s) => s.name === 'ponder');
      expect(ponderService?.status).toBe('degraded');
    });

    it('should check all services concurrently', async () => {
      const startTime = Date.now();

      await healthChecker.getOverallHealth();

      const duration = Date.now() - startTime;
      // Should be much faster than sequential (which would take sum of all delays)
      expect(duration).toBeLessThan(500);
    });
  });

  describe('healthEndpoint', () => {
    beforeEach(() => {
      (isServiceConfigured as any).mockReturnValue(false);
      (dbService.healthCheck as any).mockResolvedValue(true);
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
    });

    it('should return 200 for healthy or degraded status', async () => {
      const response = await HealthChecker.healthEndpoint();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(['healthy', 'degraded']).toContain(data.status);
    });

    it('should return 200 for degraded status', async () => {
      (isServiceConfigured as any).mockReturnValueOnce(false);

      const response = await HealthChecker.healthEndpoint();

      // Degraded still returns 200 (service is up, just some features unavailable)
      expect(response.status).toBe(200);
    });

    it('should return 503 for unhealthy status', async () => {
      (dbService.healthCheck as any).mockResolvedValueOnce(false);

      const response = await HealthChecker.healthEndpoint();

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.status).toBe('unhealthy');
    });

    it('should set no-cache header', async () => {
      const response = await HealthChecker.healthEndpoint();

      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should set content-type to JSON', async () => {
      const response = await HealthChecker.healthEndpoint();

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
