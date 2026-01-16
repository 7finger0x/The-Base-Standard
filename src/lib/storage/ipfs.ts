/**
 * IPFS Storage Integration for The Base Standard
 * 
 * Provides hot memory storage for reputation metadata, user profiles,
 * and dynamic content using IPFS with Pinata pinning service.
 */

import 'server-only';

interface ReputationMetadata {
  address: string;
  score: number;
  tier: string;
  timestamp: number;
  linkedWallets: string[];
  breakdown?: {
    tenure: number;
    economic: number;
    social: number;
  };
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Store reputation metadata on IPFS
 * 
 * @param metadata - Reputation data to store
 * @returns IPFS CID (Content Identifier)
 */
export async function storeReputationMetadata(
  metadata: ReputationMetadata
): Promise<string> {
  const { env, isServiceConfigured } = await import('@/lib/env');
  
  if (!isServiceConfigured('ipfs')) {
    throw new Error('IPFS service not configured. Set PINATA_JWT_TOKEN environment variable.');
  }

  const pinataJwt = env.PINATA_JWT_TOKEN;
  
  if (!pinataJwt) {
    throw new Error('PINATA_JWT_TOKEN environment variable is required');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `reputation-${metadata.address}-${metadata.timestamp}`,
        keyvalues: {
          address: metadata.address,
          tier: metadata.tier,
          timestamp: metadata.timestamp.toString(),
        },
      },
      pinataContent: metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to pin to IPFS: ${error}`);
  }

  const result = (await response.json()) as PinataResponse;
  return result.IpfsHash;
}

/**
 * Store file (image, document) on IPFS
 * 
 * @param fileBuffer - File buffer to upload
 * @param fileName - Name for the file
 * @param metadata - Optional metadata
 * @returns IPFS CID
 */
export async function storeFileOnIPFS(
  fileBuffer: Buffer,
  fileName: string,
  metadata?: Record<string, string>
): Promise<string> {
  const { env, isServiceConfigured } = await import('@/lib/env');
  
  if (!isServiceConfigured('ipfs')) {
    throw new Error('IPFS service not configured. Set PINATA_JWT_TOKEN environment variable.');
  }

  const pinataJwt = env.PINATA_JWT_TOKEN;
  
  if (!pinataJwt) {
    throw new Error('PINATA_JWT_TOKEN environment variable is required');
  }

  const formData = new FormData();
  const blob = new Blob([fileBuffer]);
  formData.append('file', blob, fileName);

  const pinataMetadata = JSON.stringify({
    name: fileName,
    keyvalues: metadata || {},
  });

  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });

  formData.append('pinataOptions', pinataOptions);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to pin file to IPFS: ${error}`);
  }

  const result = (await response.json()) as PinataResponse;
  return result.IpfsHash;
}

/**
 * Retrieve data from IPFS
 * 
 * @param cid - IPFS Content Identifier
 * @returns Parsed JSON data
 */
export async function retrieveFromIPFS<T>(cid: string): Promise<T> {
  const gatewayUrl = resolveIPFSUrl(`ipfs://${cid}`);
  
  const response = await fetch(gatewayUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to retrieve from IPFS: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Resolve IPFS URI to HTTP gateway URL
 * 
 * @param uri - IPFS URI (ipfs://...) or Arweave URI (ar://...)
 * @returns HTTP URL for browser access
 */
export function resolveIPFSUrl(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    return `https://${gateway}/ipfs/${cid}`;
  }
  
  if (uri.startsWith('ar://')) {
    const txId = uri.replace('ar://', '');
    return `https://arweave.net/${txId}`;
  }
  
  // Already an HTTP URL
  return uri;
}

/**
 * Store reputation score snapshot for historical tracking
 */
export async function storeReputationSnapshot(
  address: string,
  score: number,
  tier: string,
  breakdown?: ReputationMetadata['breakdown']
): Promise<string> {
  const metadata: ReputationMetadata = {
    address: address.toLowerCase(),
    score,
    tier,
    timestamp: Date.now(),
    linkedWallets: [], // Will be populated from database
    breakdown,
  };

  return storeReputationMetadata(metadata);
}
