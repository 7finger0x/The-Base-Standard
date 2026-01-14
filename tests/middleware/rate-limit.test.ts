import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Route Protection', () => {
    it('should allow requests under rate limit', async () => {
      const request = new NextRequest('http://localhost:3000/api/reputation?address=0x123', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const response = await middleware(request);

      expect(response.status).not.toBe(429);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
    });

    it('should block requests exceeding rate limit', async () => {
      const ip = '192.168.1.100';
      const request = new NextRequest('http://localhost:3000/api/reputation?address=0x123', {
        headers: { 'x-forwarded-for': ip },
      });

      // Make 101 requests (1 over limit)
      let response;
      for (let i = 0; i < 101; i++) {
        response = await middleware(
          new NextRequest('http://localhost:3000/api/test', {
            headers: { 'x-forwarded-for': ip },
          })
        );
      }

      expect(response!.status).toBe(429);
      const data = await response!.json();
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should include rate limit headers in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/health', {
        headers: { 'x-forwarded-for': '192.168.1.2' },
      });

      const response = await middleware(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should include Retry-After header when rate limited', async () => {
      const ip = '192.168.1.3';

      // Exceed rate limit
      for (let i = 0; i < 101; i++) {
        await middleware(
          new NextRequest('http://localhost:3000/api/test', {
            headers: { 'x-forwarded-for': ip },
          })
        );
      }

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      const response = await middleware(request);

      expect(response.headers.get('Retry-After')).toBeTruthy();
      const retryAfter = parseInt(response.headers.get('Retry-After')!);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60);
    });

    it('should not apply rate limiting to non-API routes', async () => {
      const request = new NextRequest('http://localhost:3000/', {
        headers: { 'x-forwarded-for': '192.168.1.4' },
      });

      const response = await middleware(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBeNull();
    });

    it('should track rate limits per IP address', async () => {
      const ip1 = '192.168.1.5';
      const ip2 = '192.168.1.6';

      // Use up most of IP1's quota
      for (let i = 0; i < 99; i++) {
        await middleware(
          new NextRequest('http://localhost:3000/api/test', {
            headers: { 'x-forwarded-for': ip1 },
          })
        );
      }

      // IP2 should still have full quota
      const request2 = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip2 },
      });
      const response2 = await middleware(request2);

      expect(response2.headers.get('X-RateLimit-Remaining')).toBe('99');
    });

    it('should handle requests without x-forwarded-for header', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const response = await middleware(request);

      expect(response.status).not.toBe(500);
      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy();
    });
  });
});
