/**
 * Enhanced Logging with Aggregation Support
 * Provides structured logging with support for log aggregation services
 */

import 'server-only';
import { RequestLogger } from '../request-logger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
  userId?: string;
  ip?: string;
}

/**
 * Enhanced Logger with aggregation support
 */
export class Logger {
  private service: string;
  private requestId?: string;
  private userId?: string;

  constructor(service: string) {
    this.service = service;
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      } : undefined,
      requestId: this.requestId,
      userId: this.userId,
    };
  }

  private output(entry: LogEntry) {
    const jsonLog = JSON.stringify(entry);

    switch (entry.level) {
      case 'error':
        console.error(jsonLog);
        // Send to error aggregation service
        this.sendToAggregation(entry);
        break;
      case 'warn':
        console.warn(jsonLog);
        break;
      case 'info':
        console.log(jsonLog);
        break;
      case 'debug':
        if (process.env.NODE_ENV !== 'production') {
          console.debug(jsonLog);
        }
        break;
    }
  }

  private sendToAggregation(entry: LogEntry) {
    // In production, send to log aggregation service (e.g., Datadog, LogRocket, etc.)
    const aggregationUrl = process.env.LOG_AGGREGATION_URL;
    
    if (aggregationUrl && process.env.NODE_ENV === 'production') {
      // Async send to avoid blocking
      fetch(aggregationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail - don't break app if aggregation is down
      });
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('debug', message, context);
    this.output(entry);
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('info', message, context);
    this.output(entry);
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('warn', message, context);
    this.output(entry);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('error', message, context, error);
    this.output(entry);
    
    // Also use RequestLogger for backward compatibility
    RequestLogger.logError(message, error, context);
  }
}

/**
 * Create a logger instance for a service
 */
export function createLogger(service: string): Logger {
  return new Logger(service);
}

// Default logger
export const logger = createLogger('base-standard');
