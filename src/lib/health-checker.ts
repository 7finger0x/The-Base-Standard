import { dbService } from '@/lib/database-service';
import { isServiceConfigured, PONDER_URL } from '@/lib/env';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: ServiceHealth[];
  uptime: number;
}

export class HealthChecker {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const isHealthy = await dbService.healthCheck();
      return {
        name: 'database',
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkPonder(): Promise<ServiceHealth> {
    if (!isServiceConfigured('ponder')) {
      return {
        name: 'ponder',
        status: 'degraded',
        error: 'Ponder service not configured',
      };
    }

    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${PONDER_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      return {
        name: 'ponder',
        status: response.ok ? 'healthy' : 'degraded',
        responseTime: Date.now() - start,
        details: { statusCode: response.status },
      };
    } catch (error) {
      return {
        name: 'ponder',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async checkRpcEndpoints(): Promise<ServiceHealth[]> {
    const rpcChecks = [
      { name: 'base-rpc', url: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org' },
      { name: 'zora-rpc', url: process.env.PONDER_RPC_URL_ZORA || 'https://rpc.zora.energy' },
    ];

    return Promise.all(
      rpcChecks.map(async ({ name, url }) => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_blockNumber',
              params: [],
              id: 1,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          return {
            name,
            status: response.ok ? 'healthy' : 'degraded',
            responseTime: Date.now() - start,
            details: { statusCode: response.status },
          };
        } catch (error) {
          return {
            name,
            status: 'unhealthy',
            responseTime: Date.now() - start,
            error: error instanceof Error ? error.message : 'Connection failed',
          };
        }
      })
    );
  }

  async getOverallHealth(): Promise<HealthStatus> {
    const services: ServiceHealth[] = [];

    // Check all services concurrently
    const [database, ponder, rpcServices] = await Promise.all([
      this.checkDatabase(),
      this.checkPonder(),
      this.checkRpcEndpoints(),
    ]);

    services.push(database, ponder, ...rpcServices);

    // Determine overall status
    const hasUnhealthy = services.some(service => service.status === 'unhealthy');
    const hasDegraded = services.some(service => service.status === 'degraded');
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (hasUnhealthy) overallStatus = 'unhealthy';
    else if (hasDegraded) overallStatus = 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      uptime: Date.now() - this.startTime,
    };
  }

  // Simple health endpoint for monitoring
  static async healthEndpoint(): Promise<Response> {
    const healthChecker = new HealthChecker();
    const health = await healthChecker.getOverallHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(health), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  }
}

// Export singleton instance
export const healthChecker = new HealthChecker();