/**
 * Cache Revalidation Utilities
 * 
 * Handles cache invalidation for reputation-related routes
 */

import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidate reputation-related caches when scores update
 */
export async function revalidateReputationCache(address: string): Promise<void> {
  const normalizedAddress = address.toLowerCase();
  
  try {
    // Revalidate reputation API route
    revalidatePath(`/api/reputation?address=${normalizedAddress}`);
    
    // Revalidate frame image
    revalidatePath(`/api/frame/reputation?address=${normalizedAddress}`);
    revalidateTag(`reputation-${normalizedAddress}`);
    
    // Revalidate frame page
    revalidatePath(`/frame/reputation?address=${normalizedAddress}`);
  } catch (error) {
    // Revalidation is best-effort, don't throw
    console.warn('Cache revalidation failed:', error);
  }
}

/**
 * Revalidate all reputation caches (for batch updates)
 */
export async function revalidateAllReputationCaches(): Promise<void> {
  try {
    revalidatePath('/api/reputation');
    revalidatePath('/api/frame/reputation');
    revalidatePath('/frame/reputation');
    revalidatePath('/leaderboard');
  } catch (error) {
    console.warn('Bulk cache revalidation failed:', error);
  }
}
