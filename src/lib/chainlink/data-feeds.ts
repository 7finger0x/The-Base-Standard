/**
 * Chainlink Data Feeds Integration for The Base Standard
 * 
 * Provides access to Chainlink price feeds and Functions
 * for autonomous reputation score updates based on on-chain events.
 */

import 'server-only';
import { createPublicClient, http, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// Chainlink Data Feed addresses on Base
const CHAINLINK_FEEDS = {
  base: {
    BASE_USD: '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1' as Address,
    ETH_USD: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70' as Address,
  },
  baseSepolia: {
    BASE_USD: '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1' as Address,
    ETH_USD: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70' as Address,
  },
} as const;

const FEED_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface PriceData {
  price: number;
  updatedAt: number;
  roundId: bigint;
}

/**
 * Get Base/USD price from Chainlink Data Feed
 * Used for economic activity scoring (higher value transactions = more reputation)
 */
export async function getBasePrice(chainId: 8453 | 84532 = 8453): Promise<PriceData> {
  const chain = chainId === 8453 ? base : baseSepolia;
  const feedAddress = CHAINLINK_FEEDS[chainId === 8453 ? 'base' : 'baseSepolia'].BASE_USD;

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const data = await publicClient.readContract({
    address: feedAddress,
    abi: FEED_ABI,
    functionName: 'latestRoundData',
  });

  return {
    price: Number(data[1]) / 1e8, // Chainlink uses 8 decimals
    updatedAt: Number(data[3]),
    roundId: data[0],
  };
}

/**
 * Get ETH/USD price from Chainlink Data Feed
 */
export async function getETHPrice(chainId: 8453 | 84532 = 8453): Promise<PriceData> {
  const chain = chainId === 8453 ? base : baseSepolia;
  const feedAddress = CHAINLINK_FEEDS[chainId === 8453 ? 'base' : 'baseSepolia'].ETH_USD;

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const data = await publicClient.readContract({
    address: feedAddress,
    abi: FEED_ABI,
    functionName: 'latestRoundData',
  });

  return {
    price: Number(data[1]) / 1e8,
    updatedAt: Number(data[3]),
    roundId: data[0],
  };
}

/**
 * Calculate economic activity score based on transaction value
 * Higher value transactions contribute more to reputation
 */
export async function calculateEconomicActivityScore(
  transactionValue: bigint, // in wei
  chainId: 8453 | 84532 = 8453
): Promise<number> {
  const ethPrice = await getETHPrice(chainId);
  const valueInUSD = (Number(transactionValue) / 1e18) * ethPrice.price;

  // Score formula: log(value) * 10, capped at 100
  // This rewards higher value transactions but with diminishing returns
  const score = Math.min(100, Math.log10(valueInUSD + 1) * 10);
  
  return Math.round(score);
}

/**
 * Check if price feed data is fresh (updated within last hour)
 */
export function isPriceDataFresh(updatedAt: number): boolean {
  const oneHourAgo = Date.now() / 1000 - 3600;
  return updatedAt > oneHourAgo;
}
