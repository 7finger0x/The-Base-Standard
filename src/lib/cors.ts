import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
}

const defaultConfig: CorsConfig = {
  allowedOrigins: process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : ['*'], // Allow all in development, restrict in production
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * CORS middleware for API routes
 * Configure via CORS_ALLOWED_ORIGINS environment variable
 */
export function handleCors(
  request: NextRequest,
  config: Partial<CorsConfig> = {}
): NextResponse | null {
  const corsConfig = { ...defaultConfig, ...config };
  const origin = request.headers.get('origin');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    addCorsHeaders(response, origin, corsConfig);
    return response;
  }

  // Validate origin for actual requests
  if (origin && !isOriginAllowed(origin, corsConfig.allowedOrigins)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          code: 'CORS_NOT_ALLOWED',
          message: 'Origin not allowed',
        },
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return null; // Continue with request
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null,
  config: CorsConfig = defaultConfig
): void {
  const allowedOrigin = origin && isOriginAllowed(origin, config.allowedOrigins)
    ? origin
    : config.allowedOrigins.includes('*')
    ? '*'
    : config.allowedOrigins[0] || '*';

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  if (config.allowCredentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  if (allowedOrigins.includes('*')) {
    return true;
  }

  return allowedOrigins.some((allowed) => {
    // Exact match
    if (allowed === origin) {
      return true;
    }

    // Wildcard subdomain match (e.g., *.example.com)
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(`.${domain}`) || origin === domain;
    }

    return false;
  });
}
