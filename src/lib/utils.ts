import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RequestLogger } from './request-logger';
import { createPublicClient, http, type Address } from 'viem';
import { base } from 'viem/chains';
import { BASE_RPC_URL } from './env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function getTierFromScore(score: number): string {
  // Recalibrated tier thresholds (0-1000 scale)
  if (score >= 951) return 'LEGEND';      // Top 1%
  if (score >= 851) return 'BASED';       // Top 5% (95th-99th)
  if (score >= 651) return 'BUILDER';     // 75th-95th
  if (score >= 351) return 'RESIDENT';    // 40th-75th
  return 'TOURIST';                       // Bottom 40% (0-350)
}

// Base Names resolution utilities
// Base Names uses ENS-compatible contracts on Base L2
const BASE_NAMES_REVERSE_REGISTRAR = '0x0000000000D8e504002cC26E3Ec46D81971C1664' as Address;
const BASE_NAMES_RESOLVER = '0x426fa03fB86E510d0Dd9F70335Cf102a98b10875' as Address;

// ENS resolver ABI (standard functions)
const RESOLVER_ABI = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

const REVERSE_REGISTRAR_ABI = [
  {
    name: 'node',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const;

/**
 * Resolve an Ethereum address to a Base Name (.base.eth)
 * Uses ENS reverse resolution on Base L2
 */
export async function resolveBaseName(address: string): Promise<string | null> {
  try {
    const normalizedAddress = address.toLowerCase() as Address;
    
    // Create viem client for Base
    const client = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL, {
        timeout: 10000, // 10 second timeout
      }),
    });

    // Step 1: Get the reverse node from Reverse Registrar
    try {
      await client.readContract({
        address: BASE_NAMES_REVERSE_REGISTRAR,
        abi: REVERSE_REGISTRAR_ABI,
        functionName: 'node',
        args: [normalizedAddress],
      });
    } catch {
      // If reverse node lookup fails, address doesn't have a name
      return null;
    }

    // Step 2: Query the resolver for the name
    try {
      const name = await client.readContract({
        address: BASE_NAMES_RESOLVER,
        abi: RESOLVER_ABI,
        functionName: 'name',
        args: [normalizedAddress],
      });

      // Return name if found (it may already include .base.eth suffix)
      if (name && name.length > 0) {
        return name.endsWith('.base.eth') ? name : `${name}.base.eth`;
      }

      return null;
    } catch {
      // Resolver query failed, address may not have a name
      return null;
    }
  } catch (error) {
    RequestLogger.logWarning('Failed to resolve Base Name', {
      address,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Reverse resolve a Base Name to an Ethereum address
 * Queries the ENS resolver on Base L2
 */
export async function reverseResolveBaseName(name: string): Promise<string | null> {
  try {
    // Note: This requires the full ENS namehash calculation
    // For now, return null as full implementation requires namehash library
    // In production, use @ensdomains/ensjs or calculate namehash manually
    return null;
  } catch (error) {
    RequestLogger.logWarning('Failed to reverse resolve Base Name', {
      name,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

// Enhanced address display with name resolution
export async function formatAddressWithNames(address: string, showFull = false): Promise<string> {
  if (!address) return '';
  
  const baseName = await resolveBaseName(address);
  
  if (baseName) {
    return `${baseName}.base.eth`;
  }
  
  return showFull ? address : shortenAddress(address, 6);
}
