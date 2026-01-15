import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { neonConfig } from '@neondatabase/serverless';

// Configure WebSocket support for Neon (required for serverless environments)
// Lazy-load 'ws' if WebSocket is not available (Node.js environment)
if (typeof WebSocket === 'undefined') {
  // Use dynamic import to avoid top-level await
  import('ws')
    .then((ws) => {
      // Neon adapter accepts ws default export as WebSocket constructor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      neonConfig.webSocketConstructor = ws.default as any;
    })
    .catch(() => {
      // 'ws' not available, Neon will use HTTP fallback
    });
}

// Global Prisma client instance for Next.js API routes
// Prevents multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with appropriate adapter for Prisma v7
// Note: Schema provider is now 'postgresql', so we only use PostgreSQL adapters
const getPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  // Determine if using Neon (serverless) or standard PostgreSQL
  const isNeon = databaseUrl.includes('neon.tech');
  
  if (isNeon) {
    // Use Neon serverless adapter for Neon databases
    const adapter = new PrismaNeon({ connectionString: databaseUrl });
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  
  // For other PostgreSQL databases, use standard pg adapter
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown handler
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}