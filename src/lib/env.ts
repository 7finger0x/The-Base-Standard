import { z } from 'zod';

// Environment variable schema validation
const envSchema = z.object({
  // Required environment variables
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').optional().default('file:./dev.db'),
  
  // Base Network Configuration
  NEXT_PUBLIC_BASE_RPC_URL: z.string().url().or(z.literal('')).optional(),
  NEXT_PUBLIC_CHAIN_ID: z.string().optional(),

  // Contract Addresses
  NEXT_PUBLIC_REGISTRY_ADDRESS: z.string().startsWith('0x').length(42).or(z.literal('')).optional(),

  // OnchainKit API
  NEXT_PUBLIC_ONCHAINKIT_API_KEY: z.string().optional(),

  // Ponder Indexer
  PONDER_URL: z.string().url().or(z.literal('')).optional().default('http://localhost:42069'),
  PONDER_RPC_URL_BASE: z.string().url().or(z.literal('')).optional(),
  PONDER_RPC_URL_ZORA: z.string().url().or(z.literal('')).optional(),
  PONDER_DATABASE_URL: z.string().url().or(z.literal('')).optional(),

  // CDP AgentKit
  CDP_KEY_NAME: z.string().optional(),
  CDP_PRIVATE_KEY: z.string().optional(),

  // Farcaster
  NEXT_PUBLIC_FARCASTER_HUB_URL: z.string().url().or(z.literal('')).optional(),

  // Inngest
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
});

// Type inference from schema
type EnvVariables = z.infer<typeof envSchema>;

// Validate and parse environment variables
function validateEnvironment(): EnvVariables {
  try {
    const parsedEnv = envSchema.parse(process.env);
    return parsedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter((err): err is z.ZodIssue => err.code === 'invalid_type')
        .map(err => err.path.join('.'));

      console.error('❌ Missing or invalid environment variables:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });

      // During build, use defaults. In runtime, this will be caught
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('⚠️  Build-time: Using default values. Set proper values before deployment!');
        return envSchema.parse({
          ...process.env,
          DATABASE_URL: 'file:./dev.db',
        });
      }

      throw new Error(`Environment validation failed: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnvironment();

// Helper function to check if required services are configured
export function isServiceConfigured(service: 'ponder' | 'cdp' | 'farcaster'): boolean {
  switch (service) {
    case 'ponder':
      return !!env.PONDER_URL && env.PONDER_URL !== 'http://localhost:42069';
    case 'cdp':
      return !!env.CDP_KEY_NAME && !!env.CDP_PRIVATE_KEY;
    case 'farcaster':
      return !!env.NEXT_PUBLIC_FARCASTER_HUB_URL;
    default:
      return false;
  }
}

// Export individual environment helpers
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Service URLs
export const PONDER_URL = env.PONDER_URL;
export const BASE_RPC_URL = env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
export const ZORA_RPC_URL = env.PONDER_RPC_URL_ZORA || 'https://rpc.zora.energy';