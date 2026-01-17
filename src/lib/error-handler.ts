import 'server-only';

/**
 * Centralized Error Handler
 *
 * Provides consistent error handling and logging across the application
 * In production, integrate with Sentry or similar error tracking service
 */

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_API = 'EXTERNAL_API',
  DATABASE = 'DATABASE',
  BLOCKCHAIN = 'BLOCKCHAIN',
  INTERNAL = 'INTERNAL',
}

export interface AppError {
  category: ErrorCategory;
  message: string;
  statusCode: number;
  details?: unknown;
  cause?: Error;
}

export class ApplicationError extends Error implements AppError {
  category: ErrorCategory;
  statusCode: number;
  details?: unknown;
  cause?: Error;

  constructor(
    category: ErrorCategory,
    message: string,
    statusCode: number,
    details?: unknown,
    cause?: Error
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.category = category;
    this.statusCode = statusCode;
    this.details = details;
    this.cause = cause;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        category: this.category,
        message: this.message,
        statusCode: this.statusCode,
        ...(process.env.NODE_ENV !== 'production' && {
          details: this.details,
          stack: this.stack,
        }),
      },
    };
  }
}

/**
 * Error factory functions for common error types
 */
export const ErrorFactory = {
  validation: (message: string, details?: unknown) =>
    new ApplicationError(ErrorCategory.VALIDATION, message, 400, details),

  authentication: (message = 'Authentication required') =>
    new ApplicationError(ErrorCategory.AUTHENTICATION, message, 401),

  authorization: (message = 'Insufficient permissions') =>
    new ApplicationError(ErrorCategory.AUTHORIZATION, message, 403),

  notFound: (resource: string) =>
    new ApplicationError(ErrorCategory.NOT_FOUND, `${resource} not found`, 404),

  rateLimit: (message = 'Rate limit exceeded') =>
    new ApplicationError(ErrorCategory.RATE_LIMIT, message, 429),

  externalAPI: (service: string, cause?: Error) =>
    new ApplicationError(
      ErrorCategory.EXTERNAL_API,
      `External service error: ${service}`,
      502,
      undefined,
      cause
    ),

  database: (operation: string, cause?: Error) =>
    new ApplicationError(
      ErrorCategory.DATABASE,
      `Database error during ${operation}`,
      500,
      undefined,
      cause
    ),

  blockchain: (operation: string, cause?: Error) =>
    new ApplicationError(
      ErrorCategory.BLOCKCHAIN,
      `Blockchain error during ${operation}`,
      500,
      undefined,
      cause
    ),

  internal: (message: string, cause?: Error) =>
    new ApplicationError(ErrorCategory.INTERNAL, message, 500, undefined, cause),
};

/**
 * Error handler for API routes
 */
export function handleAPIError(error: unknown): Response {
  // Log error (in production, send to error tracking service)
  console.error('API Error:', error);

  if (error instanceof ApplicationError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  if (error instanceof Error) {
    // Convert generic errors to internal server errors
    const appError = ErrorFactory.internal('An unexpected error occurred', error);
    return Response.json(appError.toJSON(), { status: 500 });
  }

  // Unknown error type
  return Response.json(
    {
      error: {
        category: ErrorCategory.INTERNAL,
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    },
    { status: 500 }
  );
}

/**
 * Async error wrapper for API route handlers
 */
export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

/**
 * Send error to monitoring service (Sentry, LogRocket, etc.)
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  // In production, send to Sentry or similar service
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Example: Sentry.captureException(error, { extra: context });
    console.error('Error reported to monitoring service:', error, context);
  } else {
    console.error('Error:', error, 'Context:', context);
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}
