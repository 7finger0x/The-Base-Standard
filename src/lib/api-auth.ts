import type { NextRequest } from 'next/server';
import { error, Errors } from './api-utils';

/**
 * API Key authentication for admin endpoints
 * Set ADMIN_API_KEY environment variable
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    // If no API key is configured, allow access (development mode)
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    // In production, require API key to be set
    return false;
  }

  return apiKey === expectedKey;
}

/**
 * Middleware to protect admin endpoints with API key
 */
export function requireApiKey(request: NextRequest): Response | null {
  if (!validateApiKey(request)) {
    return new Response(
      JSON.stringify(
        error(Errors.UNAUTHORIZED('API key required'))
      ),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return null;
}
