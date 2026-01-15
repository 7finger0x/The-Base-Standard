import type { NextRequest } from 'next/server';

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  ip: string;
  userAgent?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

/**
 * Request logger for audit trail
 * Logs all API requests with metadata for security and debugging
 */
export class RequestLogger {
  private static shouldLog(): boolean {
    // Only log in production or when explicitly enabled
    return process.env.NODE_ENV === 'production' || process.env.ENABLE_REQUEST_LOGGING === 'true';
  }

  static logRequest(request: NextRequest, statusCode: number, responseTime: number, error?: Error): void {
    if (!this.shouldLog()) {
      return;
    }

    const log: RequestLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.nextUrl.pathname,
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      statusCode,
      responseTime,
      error: error?.message,
    };

    // In production, use structured logging
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(log));
    } else {
      // Development: human-readable format
      console.log(`[${log.timestamp}] ${log.method} ${log.path} ${log.statusCode} ${log.responseTime}ms`);
      if (error) {
        console.error('Error:', error);
      }
    }
  }

  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return 'unknown';
  }

  /**
   * Log security events (rate limit violations, suspicious activity)
   */
  static logSecurityEvent(event: {
    type: 'rate_limit' | 'invalid_input' | 'suspicious_activity';
    path: string;
    ip: string;
    details?: Record<string, unknown>;
  }): void {
    if (!this.shouldLog()) {
      return;
    }

    const log = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      category: 'SECURITY',
      ...event,
    };

    console.warn(JSON.stringify(log));
  }

  /**
   * Log errors with structured format
   */
  static logError(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>
  ): void {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      } : String(error),
      ...context,
    };

    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(log));
    } else {
      console.error(`[ERROR] ${message}`, error, context);
    }
  }

  /**
   * Log warnings with structured format
   */
  static logWarning(
    message: string,
    context?: Record<string, unknown>
  ): void {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...context,
    };

    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify(log));
    } else {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Log info messages with structured format
   */
  static logInfo(
    message: string,
    context?: Record<string, unknown>
  ): void {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...context,
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(log));
    } else {
      console.log(`[INFO] ${message}`, context);
    }
  }
}
