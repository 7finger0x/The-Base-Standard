import { describe, it, expect } from 'vitest';
import { ApiError, Errors, success, error, withErrorHandling } from '@/lib/api-utils';

describe('API Utils', () => {
  describe('ApiError', () => {
    it('should create error with all properties', () => {
      const apiError = new ApiError(400, 'Bad request', 'BAD_REQUEST', { field: 'email' });

      expect(apiError.statusCode).toBe(400);
      expect(apiError.message).toBe('Bad request');
      expect(apiError.code).toBe('BAD_REQUEST');
      expect(apiError.details).toEqual({ field: 'email' });
      expect(apiError.name).toBe('ApiError');
    });

    it('should create error without optional properties', () => {
      const apiError = new ApiError(500, 'Server error');

      expect(apiError.statusCode).toBe(500);
      expect(apiError.message).toBe('Server error');
      expect(apiError.code).toBeUndefined();
      expect(apiError.details).toBeUndefined();
    });
  });

  describe('Errors', () => {
    it('should create BAD_REQUEST error', () => {
      const err = Errors.BAD_REQUEST('Invalid input');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('BAD_REQUEST');
      expect(err.message).toBe('Invalid input');
    });

    it('should create UNAUTHORIZED error', () => {
      const err = Errors.UNAUTHORIZED();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('should create FORBIDDEN error', () => {
      const err = Errors.FORBIDDEN();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    });

    it('should create NOT_FOUND error', () => {
      const err = Errors.NOT_FOUND();
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
    });

    it('should create VALIDATION_ERROR with details', () => {
      const details = { email: 'invalid format', age: 'must be positive' };
      const err = Errors.VALIDATION_ERROR(details);
      expect(err.statusCode).toBe(422);
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.details).toEqual(details);
    });

    it('should create INTERNAL_SERVER_ERROR', () => {
      const err = Errors.INTERNAL_SERVER_ERROR('Database connection failed');
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('INTERNAL_SERVER_ERROR');
      expect(err.message).toBe('Database connection failed');
    });

    it('should create SERVICE_UNAVAILABLE', () => {
      const err = Errors.SERVICE_UNAVAILABLE();
      expect(err.statusCode).toBe(503);
      expect(err.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should create WALLET_REQUIRED error', () => {
      const err = Errors.WALLET_REQUIRED();
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('WALLET_REQUIRED');
    });

    it('should create WALLET_INVALID error', () => {
      const err = Errors.WALLET_INVALID();
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('WALLET_INVALID');
    });

    it('should create DATABASE_ERROR', () => {
      const err = Errors.DATABASE_ERROR();
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('DATABASE_ERROR');
    });

    it('should create INDEXER_UNAVAILABLE', () => {
      const err = Errors.INDEXER_UNAVAILABLE();
      expect(err.statusCode).toBe(503);
      expect(err.code).toBe('INDEXER_UNAVAILABLE');
    });
  });

  describe('success', () => {
    it('should create success response with data', () => {
      const data = { user: 'test', score: 100 };
      const response = success(data);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeTruthy();
    });

    it('should create success response with custom message', () => {
      const response = success({ id: 1 }, 'Created successfully');

      expect(response.success).toBe(true);
      expect(response.message).toBe('Created successfully');
    });

    it('should include timestamp in ISO format', () => {
      const response = success({ test: true });
      const timestamp = new Date(response.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('error', () => {
    it('should create error response from ApiError', () => {
      const apiError = new ApiError(400, 'Bad request', 'BAD_REQUEST');
      const response = error(apiError);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('BAD_REQUEST');
      expect(response.error.message).toBe('Bad request');
      expect(response.timestamp).toBeTruthy();
    });

    it('should create error response from generic Error', () => {
      const genericError = new Error('Something went wrong');
      const response = error(genericError);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.error.message).toBe('Something went wrong');
    });

    it('should include details when present', () => {
      const apiError = new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', {
        field: 'email',
      });
      const response = error(apiError);

      expect(response.error.details).toEqual({ field: 'email' });
    });

    it('should not include details when not present', () => {
      const apiError = new ApiError(400, 'Bad request');
      const response = error(apiError);

      expect(response.error.details).toBeUndefined();
    });
  });

  describe('withErrorHandling', () => {
    it('should handle successful request', async () => {
      const handler = async () => ({ result: 'success' });
      const wrappedHandler = withErrorHandling(handler);

      const request = new Request('http://localhost/test');
      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({ result: 'success' });
    });

    it('should handle ApiError', async () => {
      const handler = async () => {
        throw new ApiError(400, 'Bad request', 'BAD_REQUEST');
      };
      const wrappedHandler = withErrorHandling(handler);

      const request = new Request('http://localhost/test');
      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should handle generic Error', async () => {
      const handler = async () => {
        throw new Error('Unexpected error');
      };
      const wrappedHandler = withErrorHandling(handler);

      const request = new Request('http://localhost/test');
      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(data.error.message).toBe('Unexpected error');
    });

    it('should set correct content-type header', async () => {
      const handler = async () => ({ test: true });
      const wrappedHandler = withErrorHandling(handler);

      const request = new Request('http://localhost/test');
      const response = await wrappedHandler(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
