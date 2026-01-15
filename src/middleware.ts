import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleCors, addCorsHeaders } from '@/lib/cors';
import { RequestLogger } from '@/lib/request-logger';

// Simple in-memory rate limiter
// For production, use Redis or a proper rate limiting service
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

function getRateLimitKey(req: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimit.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetTime: record.resetTime };
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const corsResponse = handleCors(request);
    if (corsResponse) {
      return corsResponse;
    }
  }

  // Only apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    const { allowed, remaining, resetTime } = checkRateLimit(key);

    if (!allowed) {
      RequestLogger.logSecurityEvent({
        type: 'rate_limit',
        path: pathname,
        ip: key,
        details: { limit: MAX_REQUESTS },
      });

      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          },
        }
      );

      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 429, Date.now() - startTime);
      return response;
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
    addCorsHeaders(response, request.headers.get('origin'));

    // Log request after response (will be logged in route handler)
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
