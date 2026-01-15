/**
 * Sign-In with Ethereum (SIWE) Implementation
 * EIP-4361: https://eips.ethereum.org/EIPS/eip-4361
 * 
 * Provides cryptographic proof of wallet ownership for linking
 */

import { verifyMessage } from 'viem';
import type { Address } from 'viem';

export interface SIWEMessage {
  domain: string;
  address: Address;
  statement?: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

/**
 * Parse SIWE message from string format
 */
export function parseSIWEMessage(message: string): SIWEMessage | null {
  try {
    const lines = message.split('\n');
    const parsed: Partial<SIWEMessage> = {};

    // Parse domain
    const domainMatch = lines[0]?.match(/^(.+?) wants you to sign in/);
    if (domainMatch) {
      parsed.domain = domainMatch[1];
    }

    // Parse address
    const addressMatch = lines[0]?.match(/with your Ethereum account:\n(.+?)$/m);
    if (addressMatch) {
      parsed.address = addressMatch[1].trim() as Address;
    }

    // Parse statement
    const statementMatch = message.match(/^\n(.+?)\n\nURI:/);
    if (statementMatch) {
      parsed.statement = statementMatch[1].trim();
    }

    // Parse URI
    const uriMatch = message.match(/URI: (.+)/);
    if (uriMatch) {
      parsed.uri = uriMatch[1].trim();
    }

    // Parse version
    const versionMatch = message.match(/Version: (.+)/);
    if (versionMatch) {
      parsed.version = versionMatch[1].trim();
    }

    // Parse chain ID
    const chainIdMatch = message.match(/Chain ID: (\d+)/);
    if (chainIdMatch) {
      parsed.chainId = parseInt(chainIdMatch[1], 10);
    }

    // Parse nonce
    const nonceMatch = message.match(/Nonce: (.+)/);
    if (nonceMatch) {
      parsed.nonce = nonceMatch[1].trim();
    }

    // Parse issued at
    const issuedAtMatch = message.match(/Issued At: (.+)/);
    if (issuedAtMatch) {
      parsed.issuedAt = issuedAtMatch[1].trim();
    }

    // Parse expiration time
    const expirationMatch = message.match(/Expiration Time: (.+)/);
    if (expirationMatch) {
      parsed.expirationTime = expirationMatch[1].trim();
    }

    // Parse resources
    const resourcesMatch = message.match(/Resources:\n((?:- .+\n?)+)/);
    if (resourcesMatch) {
      parsed.resources = resourcesMatch[1]
        .split('\n')
        .filter(line => line.startsWith('- '))
        .map(line => line.substring(2).trim());
    }

    // Validate required fields
    if (!parsed.domain || !parsed.address || !parsed.uri || !parsed.version || !parsed.chainId || !parsed.nonce || !parsed.issuedAt) {
      return null;
    }

    return parsed as SIWEMessage;
  } catch (error) {
    console.error('Failed to parse SIWE message:', error);
    return null;
  }
}

/**
 * Generate SIWE message string
 */
export function generateSIWEMessage(params: {
  domain: string;
  address: Address;
  statement?: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  expirationTime?: string;
  resources?: string[];
}): string {
  const {
    domain,
    address,
    statement,
    uri,
    version,
    chainId,
    nonce,
    expirationTime,
    resources,
  } = params;

  const issuedAt = new Date().toISOString();

  let message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\n`;

  if (statement) {
    message += `${statement}\n\n`;
  }

  message += `URI: ${uri}\n`;
  message += `Version: ${version}\n`;
  message += `Chain ID: ${chainId}\n`;
  message += `Nonce: ${nonce}\n`;
  message += `Issued At: ${issuedAt}`;

  if (expirationTime) {
    message += `\nExpiration Time: ${expirationTime}`;
  }

  if (resources && resources.length > 0) {
    message += `\nResources:\n${resources.map(r => `- ${r}`).join('\n')}`;
  }

  return message;
}

/**
 * Verify SIWE signature
 */
export async function verifySIWESignature(
  message: string,
  signature: `0x${string}`,
  expectedAddress: Address
): Promise<boolean> {
  try {
    // Parse message to extract address
    const parsed = parseSIWEMessage(message);
    if (!parsed) {
      return false;
    }

    // Verify address matches
    if (parsed.address.toLowerCase() !== expectedAddress.toLowerCase()) {
      return false;
    }

    // Verify signature
    const isValid = await verifyMessage({
      address: expectedAddress,
      message,
      signature,
    });

    return isValid;
  } catch (error) {
    console.error('SIWE verification failed:', error);
    return false;
  }
}

/**
 * Validate SIWE message (nonce, expiration, etc.)
 */
export function validateSIWEMessage(
  message: SIWEMessage,
  expectedNonce: string,
  expectedDomain: string,
  expectedChainId: number
): { valid: boolean; error?: string } {
  // Check domain
  if (message.domain !== expectedDomain) {
    return { valid: false, error: 'Domain mismatch' };
  }

  // Check chain ID
  if (message.chainId !== expectedChainId) {
    return { valid: false, error: 'Chain ID mismatch' };
  }

  // Check nonce
  if (message.nonce !== expectedNonce) {
    return { valid: false, error: 'Nonce mismatch' };
  }

  // Check expiration
  if (message.expirationTime) {
    const expiration = new Date(message.expirationTime);
    if (expiration < new Date()) {
      return { valid: false, error: 'Message expired' };
    }
  }

  // Check issued at (not before)
  const issuedAt = new Date(message.issuedAt);
  if (issuedAt > new Date()) {
    return { valid: false, error: 'Message issued in future' };
  }

  return { valid: true };
}
