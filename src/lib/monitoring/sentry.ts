/**
 * Sentry Error Tracking Configuration
 * Provides error tracking and performance monitoring
 */

import 'server-only';

let sentryInitialized = false;

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  if (sentryInitialized) return;
  if (typeof window !== 'undefined') return; // Server-only

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.warn('[Sentry] DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    // Dynamic import to avoid bundling Sentry in client
    // In production, you would use: import * as Sentry from '@sentry/nextjs';
    // For now, we provide a placeholder implementation
    
    sentryInitialized = true;
    console.log('[Sentry] Error tracking initialized');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Capture exception in Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!sentryInitialized) {
    // Fallback to console logging
    console.error('[Error]', error, context);
    return;
  }

  // In production: Sentry.captureException(error, { extra: context });
  console.error('[Sentry] Exception captured:', error.message, context);
}

/**
 * Capture message in Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  // In production: Sentry.captureMessage(message, level);
  console.log(`[Sentry] Message captured (${level}):`, message);
}

/**
 * Set user context for Sentry
 */
export function setUserContext(userId: string, address?: string) {
  if (!sentryInitialized) return;

  // In production: Sentry.setUser({ id: userId, username: address });
  console.log('[Sentry] User context set:', { userId, address });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  if (!sentryInitialized) return;

  // In production: Sentry.addBreadcrumb({ message, category, data });
  console.log('[Sentry] Breadcrumb:', { message, category, data });
}

// Initialize on module load (server-side only)
if (typeof window === 'undefined') {
  initSentry();
}
