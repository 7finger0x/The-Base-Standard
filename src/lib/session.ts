/**
 * Session Utilities
 * 
 * Helper functions for accessing session data in API routes and server components
 */

import { auth } from './auth';
import type { NextRequest } from 'next/server';
import { Errors } from './api-utils';

/**
 * Get the current user's session in API routes
 * Returns session with userId or null if not authenticated
 */
export async function getSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

/**
 * Get the current user's ID from session
 * Throws error if not authenticated (for protected routes)
 */
export async function getUserId(): Promise<string> {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw Errors.UNAUTHORIZED('Authentication required');
  }
  
  return session.user.id;
}

/**
 * Get the current user's ID from session or request
 * Falls back to userId header if session not available (for backward compatibility)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try session first
  try {
    const session = await getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // Session check failed, continue to fallback
  }
  
  // Fallback to header (for backward compatibility during migration)
  // NOTE: This is deprecated - all routes should use sessions
  const userId = request.headers.get('x-user-id');
  if (userId && userId !== 'current-user-id') {
    console.warn('Using deprecated x-user-id header. Please use session authentication.');
    return userId;
  }
  
  return null;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<{ userId: string; address?: string }> {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw Errors.UNAUTHORIZED('Authentication required');
  }
  
  return {
    userId: session.user.id,
    address: session.user.address,
  };
}
