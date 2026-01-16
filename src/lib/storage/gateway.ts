/**
 * IPFS/Arweave Gateway Resolution
 * 
 * Bridges decentralized storage (IPFS/Arweave) with browser-compatible HTTP URLs
 */

/**
 * Resolve IPFS or Arweave URI to HTTP gateway URL
 * 
 * @param uri - IPFS URI (ipfs://...) or Arweave URI (ar://...) or HTTP URL
 * @returns HTTP URL that browsers can access
 */
export function resolveIPFSUrl(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    // Use dynamic import to avoid server-only issues in client components
    const gateway = typeof window === 'undefined' 
      ? process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'
      : (globalThis as { PINATA_GATEWAY?: string }).PINATA_GATEWAY || 'gateway.pinata.cloud';
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
 * Extract CID from IPFS URL
 */
export function extractCID(uri: string): string | null {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', '');
  }
  
  const ipfsMatch = uri.match(/ipfs\/([a-zA-Z0-9]+)/);
  if (ipfsMatch) {
    return ipfsMatch[1];
  }
  
  return null;
}

/**
 * Check if URI is a decentralized storage URI
 */
export function isDecentralizedStorage(uri: string): boolean {
  return uri.startsWith('ipfs://') || uri.startsWith('ar://');
}
