// Standardized API error responses
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Common error types
export const Errors = {
  // Client errors
  BAD_REQUEST: (message = 'Bad Request') => new ApiError(400, message, 'BAD_REQUEST'),
  UNAUTHORIZED: (message = 'Unauthorized') => new ApiError(401, message, 'UNAUTHORIZED'),
  FORBIDDEN: (message = 'Forbidden') => new ApiError(403, message, 'FORBIDDEN'),
  NOT_FOUND: (message = 'Not Found') => new ApiError(404, message, 'NOT_FOUND'),
  VALIDATION_ERROR: (details?: Record<string, unknown>) =>
    new ApiError(422, 'Validation Error', 'VALIDATION_ERROR', details),

  // Server errors
  INTERNAL_SERVER_ERROR: (message = 'Internal Server Error') => 
    new ApiError(500, message, 'INTERNAL_SERVER_ERROR'),
  SERVICE_UNAVAILABLE: (message = 'Service Unavailable') => 
    new ApiError(503, message, 'SERVICE_UNAVAILABLE'),
  
  // Custom errors
  WALLET_REQUIRED: () => new ApiError(400, 'Wallet address is required', 'WALLET_REQUIRED'),
  WALLET_INVALID: () => new ApiError(400, 'Invalid wallet address', 'WALLET_INVALID'),
  DATABASE_ERROR: (message = 'Database operation failed') => 
    new ApiError(500, message, 'DATABASE_ERROR'),
  INDEXER_UNAVAILABLE: () => 
    new ApiError(503, 'Indexer service is unavailable', 'INDEXER_UNAVAILABLE'),
};

// Success response helper
export function success<T>(data: T, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

// Error response helper
export function error(error: ApiError | Error) {
  const apiError = error instanceof ApiError ? error : 
    Errors.INTERNAL_SERVER_ERROR(error.message);

  return {
    success: false,
    error: {
      code: apiError.code || 'UNKNOWN_ERROR',
      message: apiError.message,
      ...(apiError.details && { details: apiError.details }),
    },
    timestamp: new Date().toISOString(),
  };
}

// Wrapper for API route handlers
export function withErrorHandling<T>(
  handler: (req: Request) => Promise<T>
) {
  return async (req: Request): Promise<Response> => {
    try {
      const result = await handler(req);
      return new Response(JSON.stringify(success(result)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      const apiError = err instanceof ApiError ? err : 
        Errors.INTERNAL_SERVER_ERROR(err instanceof Error ? err.message : 'Unknown error');
      
      return new Response(JSON.stringify(error(apiError)), {
        status: apiError.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}