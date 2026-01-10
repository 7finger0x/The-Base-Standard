import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  if (score >= 1000) return 'BASED';
  if (score >= 850) return 'Gold';
  if (score >= 500) return 'Silver';
  if (score >= 100) return 'Bronze';
  return 'Novice';
}

// Base Names resolution utilities
export async function resolveBaseName(address: string): Promise<string | null> {
  try {
    // Base Names registry contract address (this is the actual Base Names registry)
    const BASE_NAMES_REGISTRY = '0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5';
    
    // Simple check - in production, you'd use the actual Base Names contract
    // For now, we'll simulate the resolution
    
    // Mock implementation - in real app, integrate with Base Names API or contract
    const mockNames: Record<string, string> = {
      // You can add known addresses here for testing
    };
    
    return mockNames[address.toLowerCase()] || null;
  } catch (error) {
    console.warn('Failed to resolve Base Name:', error);
    return null;
  }
}

export async function reverseResolveBaseName(name: string): Promise<string | null> {
  try {
    // Reverse lookup - convert name back to address
    // This would typically query the Base Names registry
    return null; // Placeholder - implement actual reverse resolution
  } catch (error) {
    console.warn('Failed to reverse resolve Base Name:', error);
    return null;
  }
}

// Enhanced address display with name resolution
export async function formatAddressWithNames(address: string, showFull = false): Promise<string> {
  if (!address) return '';
  
  const baseName = await resolveBaseName(address);
  
  if (baseName) {
    return showFull ? `${baseName}.base.eth` : `${baseName}.base.eth`;
  }
  
  return showFull ? address : shortenAddress(address, 6);
}
