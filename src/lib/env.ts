/**
 * Environment variable validation
 * Ensures all required environment variables are set before the app starts
 */

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || '';
}

export const env = {
  // Public environment variables (available in browser)
  NEXT_PUBLIC_ONCHAINKIT_API_KEY: getEnvVar('NEXT_PUBLIC_ONCHAINKIT_API_KEY', false),
  NEXT_PUBLIC_REGISTRY_ADDRESS: getEnvVar('NEXT_PUBLIC_REGISTRY_ADDRESS', false),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: getEnvVar('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', false),
  NEXT_PUBLIC_PONDER_URL: getEnvVar('NEXT_PUBLIC_PONDER_URL', false),

  // Server-only environment variables
  PRIVATE_KEY: typeof window === 'undefined' ? getEnvVar('PRIVATE_KEY', false) : '',
  SEPOLIA_RPC: typeof window === 'undefined' ? getEnvVar('SEPOLIA_RPC', false) : '',
  ETHERSCAN_API_KEY: typeof window === 'undefined' ? getEnvVar('ETHERSCAN_API_KEY', false) : '',
} as const;

// Validate that critical env vars are set when used
export function validateEnv() {
  const warnings: string[] = [];

  if (!env.NEXT_PUBLIC_REGISTRY_ADDRESS) {
    warnings.push('NEXT_PUBLIC_REGISTRY_ADDRESS is not set. Smart contract interactions will fail.');
  }

  if (!env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    warnings.push('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect may not work.');
  }

  if (warnings.length > 0) {
    console.warn('Environment variable warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }
}
