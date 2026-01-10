// src/config/contracts.ts
import ReputationRegistryABI from '../abi/ReputationRegistry.json';
import { env } from '@/lib/env';

// Use environment variable if set, otherwise fall back to hardcoded address
export const REPUTATION_REGISTRY_ADDRESS = (env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  '0xA69FFF6D7B3D47E4945F0bF60Aac73f49DBd59a9') as `0x${string}`;

export const reputationRegistryConfig = {
  address: REPUTATION_REGISTRY_ADDRESS,
  abi: ReputationRegistryABI.abi || ReputationRegistryABI,
  chainId: 84532, // Base Sepolia
} as const;