/**
 * Alert Configuration and Monitoring
 * Monitors critical system health and sends alerts
 */

import 'server-only';
import { logger } from './logger';
import { captureException, captureMessage } from './sentry';

export interface AlertConfig {
  apiErrorThreshold: number;      // Max errors per minute
  dbConnectionTimeout: number;   // DB timeout in ms
  chainlinkBalanceThreshold: string; // Minimum LINK balance
}

const defaultConfig: AlertConfig = {
  apiErrorThreshold: 10,
  dbConnectionTimeout: 5000,
  chainlinkBalanceThreshold: '0.1', // 0.1 LINK minimum
};

/**
 * Monitor API errors and alert if threshold exceeded
 */
export async function monitorAPIErrors(errorCount: number, threshold?: number) {
  const config = { ...defaultConfig, ...(threshold ? { apiErrorThreshold: threshold } : {}) };
  
  if (errorCount > config.apiErrorThreshold) {
    const message = `API error threshold exceeded: ${errorCount} errors/min (threshold: ${config.apiErrorThreshold})`;
    
    logger.error(message);
    captureMessage(message, 'error');
    
    // Send alert to monitoring service
    await sendAlert('api_errors', {
      level: 'critical',
      message,
      errorCount,
      threshold: config.apiErrorThreshold,
    });
  }
}

/**
 * Monitor database connection health
 */
export async function monitorDatabaseHealth(isHealthy: boolean, responseTime?: number) {
  if (!isHealthy) {
    const message = 'Database connection unhealthy';
    logger.error(message);
    captureMessage(message, 'error');
    
    await sendAlert('database_health', {
      level: 'critical',
      message,
      responseTime,
    });
  } else if (responseTime && responseTime > defaultConfig.dbConnectionTimeout) {
    const message = `Database response time slow: ${responseTime}ms`;
    logger.warn(message);
    captureMessage(message, 'warning');
  }
}

/**
 * Monitor Chainlink upkeep balance
 */
export async function monitorChainlinkBalance(balance: string, contractAddress?: string) {
  const threshold = BigInt(defaultConfig.chainlinkBalanceThreshold) * BigInt(10 ** 18); // Convert to wei
  const balanceBigInt = BigInt(balance);

  if (balanceBigInt < threshold) {
    const message = `Chainlink upkeep balance low: ${balance} (threshold: ${defaultConfig.chainlinkBalanceThreshold} LINK)`;
    logger.error(message);
    captureMessage(message, 'error');
    
    await sendAlert('chainlink_balance', {
      level: 'critical',
      message,
      balance,
      threshold: defaultConfig.chainlinkBalanceThreshold,
      contractAddress,
    });
  }
}

/**
 * Send alert to monitoring service
 */
async function sendAlert(type: string, data: Record<string, unknown>) {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  
  if (!webhookUrl) {
    // In development, just log
    logger.warn(`Alert (${type}):`, data);
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    });
  } catch (error) {
    logger.error('Failed to send alert', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Health check aggregator
 */
export async function performHealthChecks() {
  const checks = {
    database: false,
    rpc: false,
    chainlink: false,
  };

  try {
    // Check database
    const dbResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/health`);
    if (dbResponse.ok) {
      const health = await dbResponse.json();
      checks.database = health.database === 'healthy';
      checks.rpc = health.rpc === 'healthy';
    }
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));
  }

  // Alert if any check fails
  if (!checks.database) {
    await monitorDatabaseHealth(false);
  }

  return checks;
}
