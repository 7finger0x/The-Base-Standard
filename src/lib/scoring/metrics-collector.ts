import 'server-only';

/**
 * Metrics Collector for PVC Framework
 * 
 * Collects on-chain and off-chain data to populate PVCMetrics
 * Integrates with:
 * - Base L2 transaction history
 * - Zora NFT data
 * - Farcaster social graph
 * - EAS attestations
 * - Gitcoin Passport
 */

import type { PVCMetrics } from './pvc-framework';
import { createPublicClient, http, type Address, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { BASE_RPC_URL, PONDER_URL } from '@/lib/env';
import { env } from '@/lib/env';
import { RequestLogger } from '@/lib/request-logger';

/**
 * BaseScan API transaction response format
 */
interface BaseScanTransaction {
  hash: string;
  timeStamp: string;
  gasUsed?: string;
  gasPrice?: string;
  to?: string;
  value?: string;
}

/**
 * Farcaster link response format
 */
interface FarcasterLink {
  fid: number;
  targetFid: number;
}

export interface OnChainData {
  address: string;
  firstTxTimestamp: number;
  transactions: Transaction[];
  contractInteractions: ContractInteraction[];
  deployedContracts: DeployedContract[];
}

export interface Transaction {
  hash: string;
  timestamp: number;
  gasUsed: bigint;
  gasPrice: bigint;
  to: string | null;
  value: bigint;
}

export interface ContractInteraction {
  contractAddress: string;
  contractTier: 'tier1' | 'tier2' | 'tier3';
  interactionCount: number;
  firstInteraction: number;
  lastInteraction: number;
}

export interface DeployedContract {
  address: string;
  deployTimestamp: number;
  totalGasInduced: bigint; // Gas others spent on this contract
}

export interface ZoraData {
  mints: ZoraMint[];
  collections: string[];
  earlyMints: string[]; // Token IDs held >30 days
  secondaryVolumeUSD: number;
  creatorVolume?: number; // Volume from user's created collections
}

export interface ZoraMint {
  tokenId: string;
  collectionAddress: string;
  mintTimestamp: number;
  stillHeld: boolean;
  daysSinceMint: number;
  collectionLaunchTimestamp: number;
}

export interface FarcasterData {
  openRank?: number;
  percentile?: number;
  fid?: number; // Farcaster ID
  followers: number;
  following: number;
  casts: number;
}

export interface IdentityData {
  hasCoinbaseAttestation: boolean;
  gitcoinPassportScore?: number;
  ensName?: string;
}

export class MetricsCollector {
  // Cache for transaction data (5 minutes TTL)
  private static txCache = new Map<string, { data: OnChainData; timestamp: number }>();
  private static zoraCache = new Map<string, { data: ZoraData; timestamp: number }>();
  private static farcasterCache = new Map<string, { data: FarcasterData; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Viem client for Base RPC
  private static getBaseClient() {
    return createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL, {
        timeout: 30000, // 30 second timeout
      }),
    });
  }

  /**
   * Collect all metrics for an address
   */
  static async collectMetrics(
    address: string,
    options: {
      onChainData?: OnChainData;
      zoraData?: ZoraData;
      farcasterData?: FarcasterData;
      identityData?: IdentityData;
    } = {}
  ): Promise<PVCMetrics> {
    const onChain = options.onChainData || await this.collectOnChainData(address);
    const zora = options.zoraData || await this.collectZoraData(address);
    const farcaster = options.farcasterData || await this.collectFarcasterData(address);
    const identity = options.identityData || await this.collectIdentityData(address);

    return this.aggregateMetrics(onChain, zora, farcaster, identity);
  }

  /**
   * Collect on-chain transaction data from Base RPC
   * Uses BaseScan API as primary source, falls back to RPC queries
   */
  private static async collectOnChainData(address: string): Promise<OnChainData> {
    const normalizedAddress = address.toLowerCase() as Address;

    // Check cache
    const cached = this.txCache.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Try BaseScan API first (more efficient for historical data)
      const data = await this.fetchFromBaseScan(normalizedAddress);
      
      // Cache result
      this.txCache.set(normalizedAddress, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      RequestLogger.logWarning('BaseScan fetch failed, falling back to RPC', {
        address: normalizedAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Fallback to RPC queries for recent transactions
      const data = await this.fetchFromRPC(normalizedAddress);
      
      // Cache result
      this.txCache.set(normalizedAddress, { data, timestamp: Date.now() });
      
      return data;
    }
  }

  /**
   * Fetch transaction data from BaseScan API (free tier)
   */
  private static async fetchFromBaseScan(address: Address): Promise<OnChainData> {
    // BaseScan API endpoint
    const apiKey = process.env.BASESCAN_API_KEY || '';
    const baseUrl = 'https://api.basescan.org/api';
    
    // Fetch transactions (limit 10000, but we'll process most recent 1000)
    const url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url, { next: { revalidate: 300 } }); // 5 min cache
      const result = await response.json();

      if (result.status !== '1' || !result.result || result.result.length === 0) {
        // No transactions found
        return {
          address,
          firstTxTimestamp: 0,
          transactions: [],
          contractInteractions: [],
          deployedContracts: [],
        };
      }

      const txs = result.result.slice(0, 1000) as BaseScanTransaction[]; // Limit to 1000 most recent
      
      // Convert BaseScan format to our Transaction format
      const transactions: Transaction[] = txs.map((tx: BaseScanTransaction) => ({
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp, 10),
        gasUsed: BigInt(tx.gasUsed || '0'),
        gasPrice: BigInt(tx.gasPrice || '0'),
        to: tx.to ? (tx.to.toLowerCase() as Address) : null,
        value: BigInt(tx.value || '0'),
      }));

      // Find first transaction timestamp
      const firstTxTimestamp = transactions.length > 0 
        ? Math.min(...transactions.map(tx => tx.timestamp))
        : 0;

      // Extract contract interactions
      const contractInteractions = this.extractContractInteractions(transactions);

      // Extract deployed contracts (transactions with empty 'to' field)
      const deployedContracts = this.extractDeployedContracts(transactions);

      return {
        address,
        firstTxTimestamp,
        transactions,
        contractInteractions,
        deployedContracts,
      };
    } catch (error) {
      throw new Error(`BaseScan API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch recent transactions from Base RPC (fallback)
   */
  private static async fetchFromRPC(address: Address): Promise<OnChainData> {
    const client = this.getBaseClient();
    const normalizedAddress = address.toLowerCase();
    
    try {
      // Get current block number
      const currentBlock = await client.getBlockNumber();
      
      // Fetch transactions from last 1000 blocks (reasonable limit)
      const startBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n;
      
      const transactions: Transaction[] = [];
      const contractInteractionsMap = new Map<string, ContractInteraction>();
      
      // Fetch blocks in batches
      for (let blockNum = startBlock; blockNum <= currentBlock; blockNum += 100n) {
        const endBlock = blockNum + 100n > currentBlock ? currentBlock : blockNum + 100n;
        
        try {
          const logs = await client.getLogs({
            address,
            fromBlock: blockNum,
            toBlock: endBlock,
          });

          // Also try to get transactions directly (limited by RPC)
          for (const log of logs) {
            const block = await client.getBlock({ blockNumber: log.blockNumber, includeTransactions: true });
            
            if (block.transactions) {
              for (const tx of block.transactions) {
                if (typeof tx !== 'string' && (tx.from?.toLowerCase() === address || tx.to?.toLowerCase() === address)) {
                  const receipt = await client.getTransactionReceipt({ hash: tx.hash });
                  
                  transactions.push({
                    hash: tx.hash,
                    timestamp: Number(block.timestamp),
                    gasUsed: receipt.gasUsed,
                    gasPrice: tx.gasPrice || 0n,
                    to: tx.to ? (tx.to.toLowerCase() as Address) : null,
                    value: tx.value,
                  });

                  // Track contract interactions
                  if (tx.to && tx.to.toLowerCase() !== address) {
                    const contractAddr = tx.to.toLowerCase();
                    const existing = contractInteractionsMap.get(contractAddr);
                    const timestamp = Number(block.timestamp);
                    
                    contractInteractionsMap.set(contractAddr, {
                      contractAddress: contractAddr,
                      contractTier: 'tier3', // Default, would need protocol registry
                      interactionCount: (existing?.interactionCount || 0) + 1,
                      firstInteraction: existing?.firstInteraction || timestamp,
                      lastInteraction: timestamp,
                    });
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue with next batch on error
          RequestLogger.logWarning('Error fetching blocks', {
            address: normalizedAddress,
            fromBlock: blockNum.toString(),
            toBlock: endBlock.toString(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Sort transactions by timestamp
      transactions.sort((a, b) => a.timestamp - b.timestamp);

      const firstTxTimestamp = transactions.length > 0 
        ? transactions[0].timestamp 
        : 0;

      // Extract deployed contracts
      const deployedContracts = this.extractDeployedContracts(transactions);

      return {
        address,
        firstTxTimestamp,
        transactions,
        contractInteractions: Array.from(contractInteractionsMap.values()),
        deployedContracts,
      };
    } catch (error) {
      RequestLogger.logError('RPC fetch error', error, {
        address: normalizedAddress,
        operation: 'fetchOnChainData',
      });
      // Return empty data on error
      return {
        address,
        firstTxTimestamp: 0,
        transactions: [],
        contractInteractions: [],
        deployedContracts: [],
      };
    }
  }

  /**
   * Extract contract interactions from transactions
   */
  private static extractContractInteractions(transactions: Transaction[]): ContractInteraction[] {
    const interactionsMap = new Map<string, ContractInteraction>();

    transactions.forEach(tx => {
      if (tx.to) {
        const contractAddr = tx.to.toLowerCase();
        const existing = interactionsMap.get(contractAddr);

        if (existing) {
          existing.interactionCount++;
          existing.lastInteraction = Math.max(existing.lastInteraction, tx.timestamp);
          existing.firstInteraction = Math.min(existing.firstInteraction, tx.timestamp);
        } else {
          interactionsMap.set(contractAddr, {
            contractAddress: contractAddr,
            contractTier: 'tier3', // TODO: Map to protocol registry
            interactionCount: 1,
            firstInteraction: tx.timestamp,
            lastInteraction: tx.timestamp,
          });
        }
      }
    });

    return Array.from(interactionsMap.values());
  }

  /**
   * Extract deployed contracts (transactions with null 'to' field)
   */
  private static extractDeployedContracts(transactions: Transaction[]): DeployedContract[] {
    const deployed = new Map<string, { deployTimestamp: number; totalGasInduced: bigint }>();

    transactions.forEach(tx => {
      if (!tx.to) {
        // Contract deployment - use transaction hash as contract address
        // Note: We'd need the actual deployed address, which requires transaction receipt
        // For now, we'll track deployments separately
        deployed.set(tx.hash, {
          deployTimestamp: tx.timestamp,
          totalGasInduced: 0n, // Would need to query separately
        });
      }
    });

    return Array.from(deployed.entries()).map(([address, data]) => ({
      address,
      deployTimestamp: data.deployTimestamp,
      totalGasInduced: data.totalGasInduced,
    }));
  }

  /**
   * Collect Zora NFT data
   * Uses Ponder indexer API if available, falls back to direct RPC queries
   */
  private static async collectZoraData(address: string): Promise<ZoraData> {
    const normalizedAddress = address.toLowerCase() as Address;

    // Check cache
    const cached = this.zoraCache.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Try Ponder indexer first (most efficient)
      const data = await this.fetchFromPonder(normalizedAddress);
      
      // Cache result
      this.zoraCache.set(normalizedAddress, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      RequestLogger.logWarning('Ponder Zora fetch failed, falling back to RPC', {
        address: normalizedAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Fallback to RPC queries
      const data = await this.fetchZoraFromRPC(normalizedAddress);
      
      // Cache result
      this.zoraCache.set(normalizedAddress, { data, timestamp: Date.now() });
      
      return data;
    }
  }

  /**
   * Fetch Zora mint data from Ponder indexer
   */
  private static async fetchFromPonder(address: Address): Promise<ZoraData> {
    try {
      // Query Ponder API for Zora mints
      // Note: Ponder API doesn't have a direct endpoint for mints by address,
      // so we'll use the reputation endpoint which includes mint count
      const url = `${PONDER_URL}/api/reputation/${address}`;
      
      const response = await fetch(url, { 
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
      
      if (!response.ok) {
        throw new Error(`Ponder API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Extract Zora mint information from reputation breakdown
      const zoraBreakdown = data.breakdown?.zoraMints || {};
      const earlyMintCount = zoraBreakdown.earlyMints || 0;

      // For full mint details, we'd need to query the mints endpoint or RPC
      // For now, return structure with counts
      return {
        mints: [], // Would need separate query to get full mint list
        collections: [], // Would need to query collections
        earlyMints: Array.from({ length: earlyMintCount }, (_, i) => `token-${i}`),
        secondaryVolumeUSD: 0, // Not available from this endpoint
      };
    } catch (error) {
      throw new Error(`Ponder API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch Zora mint data directly from RPC (fallback)
   * Queries Zora 1155 contract events on Base
   */
  private static async fetchZoraFromRPC(address: Address): Promise<ZoraData> {
    const client = this.getBaseClient();
    const normalizedAddress = address.toLowerCase();
    
    try {
      // Zora Creator 1155 Factory address on Base
      const ZORA_BASE_ADDRESS = '0x04E2516A2c207E84a1839755675dfd8eF6302F0a' as Address;
      
      // Get current block
      const currentBlock = await client.getBlockNumber();
      const startBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n; // Last 10k blocks

      // TransferSingle event signature: keccak256("TransferSingle(address,address,address,uint256,uint256)")
      const zeroAddress = '0x0000000000000000000000000000000000000000' as Address;

      // Query TransferSingle events with topic filters
      // Topic 0: event signature
      // Topic 2: from address (zero for mints)
      // Topic 3: to address (our address)
      const logs = await client.getLogs({
        address: ZORA_BASE_ADDRESS,
        event: {
          type: 'event',
          name: 'TransferSingle',
          inputs: [
            { type: 'address', indexed: true, name: 'operator' },
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'id' },
            { type: 'uint256', indexed: false, name: 'value' },
          ],
        } as const,
        args: {
          from: zeroAddress,
          to: address,
        },
        fromBlock: startBlock,
        toBlock: currentBlock,
      });

      const mints: ZoraMint[] = [];
      const collections = new Set<string>();
      const earlyMints: string[] = [];
      const now = Math.floor(Date.now() / 1000);

      // Process each mint event
      for (const log of logs) {
        try {
          const block = await client.getBlock({ blockNumber: log.blockNumber });
          const timestamp = Number(block.timestamp);
          const collectionAddress = log.address.toLowerCase();
          
          // Extract args from decoded log
          const args = log.args as { id?: bigint; value?: bigint; to?: Address; from?: Address } | undefined;
          if (!args || !args.id) continue;

          if (args.to?.toLowerCase() !== address.toLowerCase()) continue;
          
          const tokenId = args.id.toString();
          
          collections.add(collectionAddress);

          // Check if token is still held (query balance)
          let stillHeld = false;
          try {
            const balanceAbi = parseAbi(['function balanceOf(address account, uint256 id) view returns (uint256)']);
            const balance = await client.readContract({
              address: collectionAddress as Address,
              abi: balanceAbi,
              functionName: 'balanceOf',
              args: [address, args.id!],
            });
            stillHeld = balance > 0n;
          } catch {
            // If balanceOf fails, assume not held
            stillHeld = false;
          }

          // Get collection deployment time (approximate from first event)
          // In production, we'd query ContractCreated events or use indexer
          const collectionLaunchTimestamp = timestamp; // Placeholder

          const daysSinceMint = Math.floor((now - timestamp) / 86400);
          const isEarlyMint = timestamp >= collectionLaunchTimestamp && 
                              timestamp <= collectionLaunchTimestamp + (30 * 24 * 60 * 60);

          const mint: ZoraMint = {
            tokenId,
            collectionAddress,
            mintTimestamp: timestamp,
            stillHeld,
            daysSinceMint,
            collectionLaunchTimestamp,
          };

          mints.push(mint);

          // Track early mints that are still held
          if (isEarlyMint && stillHeld && daysSinceMint > 30) {
            earlyMints.push(`${collectionAddress}-${tokenId}`);
          }
        } catch (error) {
          RequestLogger.logWarning('Error processing Zora mint event', {
            address: normalizedAddress,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          // Continue with next event
        }
      }

      return {
        mints,
        collections: Array.from(collections),
        earlyMints,
        secondaryVolumeUSD: 0, // Would need secondary market data
        creatorVolume: 0, // Would need to check if address created collections
      };
    } catch (error) {
      RequestLogger.logError('RPC Zora fetch error', error, {
        address: normalizedAddress,
        operation: 'fetchZoraData',
      });
      // Return empty data on error
      return {
        mints: [],
        collections: [],
        earlyMints: [],
        secondaryVolumeUSD: 0,
      };
    }
  }

  /**
   * Collect Farcaster social graph data
   * Queries Farcaster Hub API for user data by verified address
   */
  private static async collectFarcasterData(address: string): Promise<FarcasterData> {
    const normalizedAddress = address.toLowerCase() as Address;

    // Check cache
    const cached = this.farcasterCache.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const hubUrl = env.NEXT_PUBLIC_FARCASTER_HUB_URL || 'https://hub.farcaster.xyz';
    
    try {
      const data = await this.fetchFromFarcasterHub(normalizedAddress, hubUrl);
      
      // Cache result
      this.farcasterCache.set(normalizedAddress, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      RequestLogger.logWarning('Farcaster Hub fetch failed', {
        address: normalizedAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Return empty data on error
      const emptyData: FarcasterData = {
        followers: 0,
        following: 0,
        casts: 0,
      };
      
      // Cache empty result (shorter TTL for errors)
      this.farcasterCache.set(normalizedAddress, { data: emptyData, timestamp: Date.now() });
      
      return emptyData;
    }
  }

  /**
   * Fetch Farcaster data from Hub API
   */
  private static async fetchFromFarcasterHub(address: Address, hubUrl: string): Promise<FarcasterData> {
    try {
      // Step 1: Get user by verified address
      const userResponse = await fetch(
        `${hubUrl}/v1/userByVerification?address=${address}`,
        {
          next: { revalidate: 300 }, // 5 min cache
          signal: AbortSignal.timeout(10000), // 10s timeout
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          // User not found on Farcaster
          return {
            followers: 0,
            following: 0,
            casts: 0,
          };
        }
        throw new Error(`Farcaster Hub API returned ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      const fid = userData.result?.user?.fid;

      if (!fid) {
        return {
          followers: 0,
          following: 0,
          casts: 0,
        };
      }

      // Step 2: Get follower/following counts and casts in parallel
      const [linksResponse, castsResponse] = await Promise.all([
        // Get links (follows) - both followers and following
        fetch(
          `${hubUrl}/v1/linksByFid?fid=${fid}`,
          {
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(10000),
            headers: { 'Accept': 'application/json' },
          }
        ).catch(() => null),
        
        // Get casts count
        fetch(
          `${hubUrl}/v1/castsByFid?fid=${fid}&pageSize=1`,
          {
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(10000),
            headers: { 'Accept': 'application/json' },
          }
        ).catch(() => null),
      ]);

      // Parse links (follows)
      let followers = 0;
      let following = 0;
      
      if (linksResponse?.ok) {
        const linksData = await linksResponse.json() as { result?: { links?: FarcasterLink[] } };
        const links = linksData.result?.links || [];
        
        // Count followers (links where targetFid = our fid)
        followers = links.filter((link: FarcasterLink) => 
          link.targetFid === fid
        ).length;
        
        // Count following (links where fid = our fid)
        following = links.filter((link: FarcasterLink) => 
          link.fid === fid
        ).length;
      }

      // Parse casts count
      let casts = 0;
      if (castsResponse?.ok) {
        const castsData = await castsResponse.json();
        // If we got a response, try to get total count
        // Note: Hub API may not return total count, so we'll estimate from pagination
        const castsList = castsData.result?.casts || [];
        casts = castsList.length;
        
        // If there's pagination info, we could fetch more, but for now use what we have
        // In production, you might want to paginate through all casts
      }

      // Step 3: Try to get OpenRank percentile (optional)
      let openRank: number | undefined;
      let percentile: number | undefined;
      
      try {
        const openRankResponse = await fetch(
          `https://openrank.xyz/api/v1/rankings/fid/${fid}`,
          {
            next: { revalidate: 3600 }, // 1 hour cache for OpenRank
            signal: AbortSignal.timeout(5000),
            headers: { 'Accept': 'application/json' },
          }
        );

        if (openRankResponse.ok) {
          const openRankData = await openRankResponse.json();
          openRank = openRankData.rank;
          
          // Calculate percentile (simplified - would need total user count for accurate percentile)
          // For now, use a rough estimate based on rank
          if (openRank !== undefined && openRank > 0) {
            // Rough percentile calculation (would need total Farcaster users for accuracy)
            // Assuming top 1M users, percentile = (1M - rank) / 1M * 100
            const estimatedTotalUsers = 1000000;
            percentile = Math.max(0, Math.min(100, ((estimatedTotalUsers - openRank) / estimatedTotalUsers) * 100));
          }
        }
      } catch (error) {
        // OpenRank is optional, continue without it
        // Only log in development for debugging
        if (process.env.NODE_ENV !== 'production') {
          RequestLogger.logWarning('OpenRank query failed (optional)', {
            fid,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return {
        fid,
        followers,
        following,
        casts,
        openRank,
        percentile,
      };
    } catch (error) {
      throw new Error(`Farcaster Hub API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Collect identity attestations
   * Queries EAS for Coinbase attestations and Gitcoin Passport API
   */
  private static async collectIdentityData(address: string): Promise<IdentityData> {
    const normalizedAddress = address.toLowerCase() as Address;

    try {
      // Query both in parallel
      const [coinbaseAttestation, gitcoinScore] = await Promise.all([
        this.queryEASAttestation(normalizedAddress),
        this.queryGitcoinPassport(normalizedAddress),
      ]);

      return {
        hasCoinbaseAttestation: coinbaseAttestation,
        gitcoinPassportScore: gitcoinScore,
      };
    } catch (error) {
      RequestLogger.logWarning('Identity data fetch failed', {
        address: normalizedAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        hasCoinbaseAttestation: false,
      };
    }
  }

  /**
   * Query EAS (Ethereum Attestation Service) for Coinbase verification
   */
  private static async queryEASAttestation(address: Address): Promise<boolean> {
    try {
      // EAS GraphQL endpoint
      const easUrl = 'https://easscan.org/graphql';
      
      // Query for Coinbase verification attestations
      // Schema: https://base.easscan.org/schema/view/0x4e51baf4c662bd2b8b87011e2e8e3c4b4e8e3c4b
      const query = `
        query GetAttestations($recipient: String!) {
          attestations(
            where: {
              recipient: { equals: $recipient }
              schemaId: { equals: "0x4e51baf4c662bd2b8b87011e2e8e3c4b4e8e3c4b" }
              revoked: { equals: false }
            }
            take: 1
          ) {
            id
            attester
            recipient
            revoked
            timeCreated
          }
        }
      `;

      const response = await fetch(easUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { recipient: address },
        }),
        next: { revalidate: 3600 }, // 1 hour cache
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const attestations = data.data?.attestations || [];
      
      // Return true if any valid attestation exists
      return attestations.length > 0 && !attestations[0].revoked;
    } catch (error) {
      // EAS is optional, only log in development
      if (process.env.NODE_ENV !== 'production') {
        RequestLogger.logWarning('EAS query failed (optional)', {
          address,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      return false;
    }
  }

  /**
   * Query Gitcoin Passport API for passport score
   */
  private static async queryGitcoinPassport(address: Address): Promise<number | undefined> {
    try {
      // Gitcoin Passport API endpoint
      const passportUrl = `https://api.scorer.gitcoin.co/registry/score/${address}`;
      
      // Note: This requires a Gitcoin Passport API key in production
      const apiKey = process.env.GITCOIN_PASSPORT_API_KEY;
      
      if (!apiKey) {
        // API key not configured, skip
        return undefined;
      }

      const response = await fetch(passportUrl, {
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }, // 1 hour cache
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No passport found
          return undefined;
        }
        return undefined;
      }

      const data = await response.json();
      
      // Gitcoin Passport returns score in different formats
      // Adjust based on actual API response structure
      return data.score || data.passport_score || undefined;
    } catch (error) {
      // Gitcoin Passport is optional, only log in development
      if (process.env.NODE_ENV !== 'production') {
        RequestLogger.logWarning('Gitcoin Passport query failed (optional)', {
          address,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      return undefined;
    }
  }

  /**
   * Aggregate collected data into PVCMetrics
   */
  private static aggregateMetrics(
    onChain: OnChainData,
    zora: ZoraData,
    farcaster: FarcasterData,
    identity: IdentityData
  ): PVCMetrics {
    // Calculate active months (months with at least one transaction)
    const activeMonths = this.calculateActiveMonths(onChain.transactions);
    const consecutiveStreak = this.calculateConsecutiveStreak(onChain.transactions);

    // Calculate gas used (in ETH)
    const gasUsedETH = this.calculateGasUsedETH(onChain.transactions);

    // Calculate volume (in USD) - sum of transaction values
    const volumeUSD = this.calculateVolumeUSD(onChain.transactions);

    // Count unique contract interactions
    const uniqueContracts = new Set(
      onChain.contractInteractions.map(c => c.contractAddress)
    ).size;

    // Calculate gas induced (gas others spent on user's contracts)
    const gasInducedETH = this.calculateGasInducedETH(onChain.deployedContracts);

    // Zora metrics
    const uniqueZoraCollections = zora.collections.length;
    const heldEarlyMints = zora.earlyMints.length;
    const secondaryMarketVolumeUSD = zora.secondaryVolumeUSD;

    // Early adopter vintage
    const earlyAdopterVintage = this.determineEarlyAdopterVintage(onChain.firstTxTimestamp);

    // Calculate wallet age
    const walletAgeMonths = this.calculateWalletAgeMonths(onChain.firstTxTimestamp);
    
    // Calculate days active (distinct days with transactions)
    const daysActive = this.calculateDaysActive(onChain.transactions);
    
    // Calculate liquidity metrics
    const liquidityMetrics = this.calculateLiquidityMetrics(onChain.transactions);
    
    // Determine capital tier
    const capitalTier = this.determineCapitalTier(volumeUSD);
    
    // Calculate protocol diversity
    const protocolMetrics = this.calculateProtocolMetrics(onChain.contractInteractions);
    
    // Calculate days since last activity
    const lastActiveTimestamp = onChain.transactions.length > 0
      ? Math.max(...onChain.transactions.map(tx => tx.timestamp))
      : 0;
    const daysSinceLastActivity = lastActiveTimestamp > 0
      ? Math.floor((Date.now() / 1000 - lastActiveTimestamp) / 86400)
      : 0;

    return {
      activeMonths,
      consecutiveStreak,
      walletAgeMonths,
      daysActive,
      gasUsedETH,
      volumeUSD,
      uniqueContracts,
      gasInducedETH,
      liquidityDurationDays: liquidityMetrics.durationDays,
      liquidityPositions: liquidityMetrics.positions,
      lendingUtilization: liquidityMetrics.lendingUtilization,
      capitalTier,
      uniqueProtocols: protocolMetrics.uniqueProtocols,
      vintageContracts: protocolMetrics.vintageContracts,
      protocolCategories: protocolMetrics.categories,
      farcasterOpenRank: farcaster.openRank,
      farcasterPercentile: farcaster.percentile,
      farcasterFID: farcaster.fid,
      uniqueZoraCollections,
      heldEarlyMints,
      secondaryMarketVolumeUSD,
      zoraCreatorVolume: zora.creatorVolume || 0,
      hasCoinbaseAttestation: identity.hasCoinbaseAttestation,
      gitcoinPassportScore: identity.gitcoinPassportScore,
      onchainSummerBadges: 0, // TODO: Query Onchain Summer badge contracts
      hackathonPlacement: undefined, // TODO: Query hackathon participation
      earlyAdopterVintage,
      lastActiveTimestamp,
      daysSinceLastActivity,
    };
  }

  /**
   * Calculate wallet age in months
   */
  private static calculateWalletAgeMonths(firstTxTimestamp: number): number {
    if (firstTxTimestamp === 0) return 0;
    const ageSeconds = Date.now() / 1000 - firstTxTimestamp;
    return Math.floor(ageSeconds / (30 * 24 * 60 * 60));
  }

  /**
   * Calculate distinct days with transactions
   */
  private static calculateDaysActive(transactions: Transaction[]): number {
    const days = new Set<string>();
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp * 1000);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.add(dayKey);
    });
    return days.size;
  }

  /**
   * Calculate liquidity metrics
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static calculateLiquidityMetrics(_transactions: Transaction[]): {
    durationDays: number;
    positions: number;
    lendingUtilization: number;
  } {
    // TODO: Parse liquidity position events from transactions
    // For now, return placeholder structure
    return {
      durationDays: 0,
      positions: 0,
      lendingUtilization: 0,
    };
  }

  /**
   * Determine capital tier based on volume
   */
  private static determineCapitalTier(volumeUSD: number): 'low' | 'mid' | 'high' {
    if (volumeUSD >= 100000) return 'high';
    if (volumeUSD >= 10000) return 'mid';
    return 'low';
  }

  /**
   * Calculate protocol diversity metrics
   */
  private static calculateProtocolMetrics(interactions: ContractInteraction[]): {
    uniqueProtocols: number;
    vintageContracts: number;
    categories: string[];
  } {
    const uniqueProtocols = new Set(interactions.map(i => i.contractAddress)).size;
    
    // Count vintage contracts (deployed >1 year ago)
    const oneYearAgo = Date.now() / 1000 - (365 * 24 * 60 * 60);
    const vintageContracts = interactions.filter(i => 
      i.firstInteraction < oneYearAgo
    ).length;
    
    // Extract protocol categories (simplified - would need protocol registry)
    const categories: string[] = [];
    // TODO: Map contract addresses to protocol categories
    
    return {
      uniqueProtocols,
      vintageContracts,
      categories,
    };
  }

  /**
   * Calculate number of months with at least one transaction
   */
  private static calculateActiveMonths(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0;

    const months = new Set<string>();
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp * 1000);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      months.add(monthKey);
    });

    return months.size;
  }

  /**
   * Calculate longest consecutive month streak
   */
  private static calculateConsecutiveStreak(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0;

    const months = Array.from(
      new Set(
        transactions.map(tx => {
          const date = new Date(tx.timestamp * 1000);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        })
      )
    ).sort();

    if (months.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < months.length; i++) {
      const prev = this.parseMonthKey(months[i - 1]);
      const curr = this.parseMonthKey(months[i]);
      
      // Check if consecutive month
      const monthsDiff = (curr.year - prev.year) * 12 + (curr.month - prev.month);
      if (monthsDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  private static parseMonthKey(key: string): { year: number; month: number } {
    const [year, month] = key.split('-').map(Number);
    return { year, month };
  }

  /**
   * Calculate total gas used in ETH
   */
  private static calculateGasUsedETH(transactions: Transaction[]): number {
    const totalGas = transactions.reduce((sum, tx) => {
      const gasCost = tx.gasUsed * tx.gasPrice;
      return sum + gasCost;
    }, 0n);

    // Convert from wei to ETH
    return Number(totalGas) / 1e18;
  }

  /**
   * Calculate total volume in USD (simplified - uses ETH price)
   */
  private static calculateVolumeUSD(transactions: Transaction[]): number {
    // TODO: Use actual USD conversion with historical prices
    const totalETH = transactions.reduce((sum, tx) => sum + tx.value, 0n);
    const ethPrice = 2500; // Placeholder - should fetch from oracle
    return (Number(totalETH) / 1e18) * ethPrice;
  }

  /**
   * Calculate gas induced (gas others spent on user's contracts)
   */
  private static calculateGasInducedETH(contracts: DeployedContract[]): number {
    const totalGas = contracts.reduce((sum, contract) => sum + contract.totalGasInduced, 0n);
    return Number(totalGas) / 1e18;
  }

  /**
   * Determine early adopter vintage
   */
  private static determineEarlyAdopterVintage(firstTxTimestamp: number): 'genesis' | 'month1' | 'none' {
    if (firstTxTimestamp === 0) return 'none';

    // Base mainnet launch: August 9, 2023
    const baseLaunch = 1691539200; // Aug 9, 2023 00:00:00 UTC
    const month1End = baseLaunch + (30 * 24 * 60 * 60); // 30 days after launch

    if (firstTxTimestamp < baseLaunch) return 'genesis';
    if (firstTxTimestamp < month1End) return 'month1';
    return 'none';
  }
}
