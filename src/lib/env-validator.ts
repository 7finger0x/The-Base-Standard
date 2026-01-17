/**
 * Environment Variable Validator
 *
 * Validates required environment variables at startup
 * Prevents runtime errors due to missing configuration
 */

export interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // NextAuth
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;

  // Blockchain
  BASE_RPC_URL: string;
  NEXT_PUBLIC_REGISTRY_ADDRESS: string;
  NEXT_PUBLIC_CHAIN_ID: string;

  // Optional: API Keys
  BASESCAN_API_KEY?: string;
  GITCOIN_PASSPORT_API_KEY?: string;
  INNGEST_SIGNING_KEY?: string;

  // Optional: External Services
  PONDER_URL?: string;
  NEXT_PUBLIC_FARCASTER_HUB_URL?: string;

  // Optional: Configuration
  NODE_ENV?: string;
  NEXT_PUBLIC_ETH_PRICE?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_VARS: (keyof EnvConfig)[] = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'BASE_RPC_URL',
  'NEXT_PUBLIC_REGISTRY_ADDRESS',
  'NEXT_PUBLIC_CHAIN_ID',
];

const OPTIONAL_VARS: (keyof EnvConfig)[] = [
  'BASESCAN_API_KEY',
  'GITCOIN_PASSPORT_API_KEY',
  'INNGEST_SIGNING_KEY',
  'PONDER_URL',
  'NEXT_PUBLIC_FARCASTER_HUB_URL',
  'NODE_ENV',
  'NEXT_PUBLIC_ETH_PRICE',
];

/**
 * Validate environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];

    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    } else {
      // Additional validation based on variable type
      validateVariable(varName, value, errors, warnings);
    }
  }

  // Check optional variables (warnings only)
  for (const varName of OPTIONAL_VARS) {
    const value = process.env[varName];

    if (!value || value.trim() === '') {
      warnings.push(`Optional environment variable not set: ${varName}`);
    } else {
      validateVariable(varName, value, errors, warnings);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate individual environment variable
 */
function validateVariable(
  name: keyof EnvConfig,
  value: string,
  errors: string[],
  warnings: string[]
): void {
  switch (name) {
    case 'DATABASE_URL':
      if (!value.startsWith('postgresql://') && !value.startsWith('file:')) {
        errors.push('DATABASE_URL must be a valid PostgreSQL or SQLite connection string');
      }
      break;

    case 'NEXTAUTH_URL':
      try {
        new URL(value);
      } catch {
        errors.push('NEXTAUTH_URL must be a valid URL');
      }
      break;

    case 'NEXTAUTH_SECRET':
      if (value.length < 32) {
        errors.push('NEXTAUTH_SECRET should be at least 32 characters long');
      }
      break;

    case 'BASE_RPC_URL':
      try {
        new URL(value);
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          errors.push('BASE_RPC_URL must be an HTTP/HTTPS URL');
        }
      } catch {
        errors.push('BASE_RPC_URL must be a valid URL');
      }
      break;

    case 'NEXT_PUBLIC_REGISTRY_ADDRESS':
      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        errors.push('NEXT_PUBLIC_REGISTRY_ADDRESS must be a valid Ethereum address');
      }
      if (value === '0xA69FFF6D7B3D47E4945F0bF60Aac73f49DBd59a9') {
        warnings.push('Using testnet registry address - update for production');
      }
      break;

    case 'NEXT_PUBLIC_CHAIN_ID':
      const chainId = parseInt(value, 10);
      if (isNaN(chainId) || chainId <= 0) {
        errors.push('NEXT_PUBLIC_CHAIN_ID must be a positive integer');
      }
      if (chainId === 84532) {
        warnings.push('Using Base Sepolia (testnet) - update for mainnet (8453)');
      }
      break;

    case 'PONDER_URL':
      if (value) {
        try {
          new URL(value);
        } catch {
          errors.push('PONDER_URL must be a valid URL');
        }
      }
      break;

    case 'NEXT_PUBLIC_FARCASTER_HUB_URL':
      if (value) {
        try {
          new URL(value);
        } catch {
          errors.push('NEXT_PUBLIC_FARCASTER_HUB_URL must be a valid URL');
        }
      }
      break;

    case 'NEXT_PUBLIC_ETH_PRICE':
      if (value) {
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) {
          errors.push('NEXT_PUBLIC_ETH_PRICE must be a positive number');
        }
      }
      break;

    case 'NODE_ENV':
      if (value && !['development', 'production', 'test'].includes(value)) {
        warnings.push('NODE_ENV should be development, production, or test');
      }
      break;
  }
}

/**
 * Print validation results to console
 */
export function printValidationResults(result: ValidationResult): void {
  if (result.valid) {
    console.log('✅ Environment validation passed');
  } else {
    console.error('❌ Environment validation failed');
  }

  if (result.errors.length > 0) {
    console.error('\n🚫 Errors:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (!result.valid) {
    console.error('\n💡 Tip: Copy .env.example to .env and fill in the required values');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed - cannot start in production');
    }
  }
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const result = validateEnvironment();
  printValidationResults(result);

  // Return current environment (will throw if accessed but missing)
  return process.env as unknown as EnvConfig;
}
