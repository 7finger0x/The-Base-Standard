import { NextResponse } from 'next/server';
import { HealthChecker } from '@/lib/health-checker';
import { RequestLogger } from '@/lib/request-logger';

export async function GET() {
  try {
    return await HealthChecker.healthEndpoint();
  } catch (error) {
    RequestLogger.logError('Health check failed', error, {
      endpoint: '/api/health',
    });
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: [],
        uptime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}