import { NextResponse } from 'next/server';
import { HealthChecker } from '@/lib/health-checker';

export async function GET() {
  try {
    return await HealthChecker.healthEndpoint();
  } catch (error) {
    console.error('Health check failed:', error);
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