/**
 * Reputation Snapshot Storage Helper
 * 
 * Stores reputation snapshots on IPFS and database when scores are calculated or updated
 */

import 'server-only';
import { storeReputationSnapshot } from './ipfs';
import { resolveIPFSUrl } from './gateway';
import { isServiceConfigured } from '@/lib/env';
import { prisma } from '@/lib/db';

export interface ReputationSnapshotData {
  address: string;
  score: number;
  tier: string;
  breakdown?: {
    tenure?: number;
    economic?: number;
    social?: number;
  };
}

/**
 * Store reputation snapshot on IPFS and database
 * Called when scores are calculated or updated
 */
export async function storeReputationSnapshotIfConfigured(
  data: ReputationSnapshotData
): Promise<void> {
  try {
    if (!isServiceConfigured('ipfs')) {
      return; // IPFS not configured, skip silently
    }

    const cid = await storeReputationSnapshot(
      data.address,
      data.score,
      data.tier,
      data.breakdown
    );

    const ipfsUrl = `ipfs://${cid}`;
    const gatewayUrl = resolveIPFSUrl(ipfsUrl);

    // Save snapshot to database
    await prisma.reputationSnapshot.create({
      data: {
        address: data.address.toLowerCase(),
        score: data.score,
        tier: data.tier,
        ipfsCid: cid,
        ipfsUrl: gatewayUrl,
      },
    });
  } catch (error) {
    // Log error but don't fail the operation
    console.error('Failed to store reputation snapshot:', error);
  }
}
