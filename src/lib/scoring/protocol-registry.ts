import 'server-only';

/**
 * Protocol Registry
 *
 * Maps Base ecosystem protocols to tiers and categories
 * Used for Builder Score calculations in the PVC Framework
 */

export type ProtocolTier = 'tier1' | 'tier2' | 'tier3';

export interface Protocol {
  address: string;
  name: string;
  tier: ProtocolTier;
  category: string;
  launchDate?: number; // Unix timestamp
}

/**
 * Tier 1: Cornerstone protocols (Uniswap, Aave, Compound, etc.)
 * High value, established protocols essential to Base ecosystem
 */
const TIER1_PROTOCOLS: Record<string, Omit<Protocol, 'address'>> = {
  // Uniswap V3 on Base
  '0x33128a8fc17869897dce68ed026d694621f6fdfd': {
    name: 'Uniswap V3 Factory',
    tier: 'tier1',
    category: 'DEX',
    launchDate: 1691539200, // Base mainnet launch
  },
  '0x2626664c2603336e57b271c5c0b26f421741e481': {
    name: 'Uniswap V3 Router',
    tier: 'tier1',
    category: 'DEX',
  },
  // Aave V3 on Base
  '0xa238dd80c259a72e81d7e4664a9801593f98d1c5': {
    name: 'Aave V3 Pool',
    tier: 'tier1',
    category: 'Lending',
    launchDate: 1693900800,
  },
  // Coinbase Smart Wallet Factory
  '0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a': {
    name: 'Coinbase Smart Wallet Factory',
    tier: 'tier1',
    category: 'Infrastructure',
    launchDate: 1691539200,
  },
  // Aerodrome (Base's native DEX)
  '0x420dd381b31aef6683db6b902084cb0ffece40da': {
    name: 'Aerodrome Factory',
    tier: 'tier1',
    category: 'DEX',
    launchDate: 1693411200,
  },
};

/**
 * Tier 2: Established protocols (SushiSwap, Curve, Balancer, etc.)
 * Solid protocols with good traction
 */
const TIER2_PROTOCOLS: Record<string, Omit<Protocol, 'address'>> = {
  // BaseSwap
  '0xfda619b6d20975be80a10332cd39b9a4b0faa8bb': {
    name: 'BaseSwap Router',
    tier: 'tier2',
    category: 'DEX',
    launchDate: 1691625600,
  },
  // Moonwell (Lending)
  '0xfbb21d0380bee3312b33c4353c8936a0f13ef26c': {
    name: 'Moonwell Comptroller',
    tier: 'tier2',
    category: 'Lending',
    launchDate: 1694073600,
  },
  // Seamless Protocol (Lending)
  '0x8f44fd754285aa6a2b8b9b97739b79746e0475a7': {
    name: 'Seamless Pool',
    tier: 'tier2',
    category: 'Lending',
    launchDate: 1695283200,
  },
};

/**
 * Tier 3: Emerging protocols and smaller contracts
 * New or niche protocols
 */
const TIER3_PROTOCOLS: Record<string, Omit<Protocol, 'address'>> = {
  // Example smaller protocols
  // Add more as needed
};

/**
 * Onchain Summer Badge Contracts (Base 2024)
 */
export const ONCHAIN_SUMMER_CONTRACTS = [
  '0x1234567890123456789012345678901234567890', // Placeholder - replace with actual Onchain Summer badge addresses
  '0x2345678901234567890123456789012345678901',
  // Add more Onchain Summer 2024 badge contracts
];

/**
 * Known Hackathon Badge/POAP Contracts
 */
export const HACKATHON_CONTRACTS = [
  '0x22c1f6050e56d2876009903609a2cc3fef83b415', // POAP contract (general)
  // Add specific Base hackathon badge contracts
];

export class ProtocolRegistry {
  private static registry: Map<string, Protocol> | null = null;

  /**
   * Initialize the protocol registry
   */
  private static initRegistry(): Map<string, Protocol> {
    if (this.registry) return this.registry;

    const registry = new Map<string, Protocol>();

    // Add Tier 1 protocols
    Object.entries(TIER1_PROTOCOLS).forEach(([address, protocol]) => {
      registry.set(address.toLowerCase(), { address: address.toLowerCase(), ...protocol });
    });

    // Add Tier 2 protocols
    Object.entries(TIER2_PROTOCOLS).forEach(([address, protocol]) => {
      registry.set(address.toLowerCase(), { address: address.toLowerCase(), ...protocol });
    });

    // Add Tier 3 protocols
    Object.entries(TIER3_PROTOCOLS).forEach(([address, protocol]) => {
      registry.set(address.toLowerCase(), { address: address.toLowerCase(), ...protocol });
    });

    this.registry = registry;
    return registry;
  }

  /**
   * Get protocol information by address
   */
  static getProtocol(address: string): Protocol | null {
    const registry = this.initRegistry();
    return registry.get(address.toLowerCase()) || null;
  }

  /**
   * Get protocol tier by address
   */
  static getProtocolTier(address: string): ProtocolTier {
    const protocol = this.getProtocol(address);
    return protocol?.tier || 'tier3';
  }

  /**
   * Get protocol category by address
   */
  static getProtocolCategory(address: string): string | null {
    const protocol = this.getProtocol(address);
    return protocol?.category || null;
  }

  /**
   * Check if contract is vintage (deployed >1 year ago)
   */
  static isVintageProtocol(address: string): boolean {
    const protocol = this.getProtocol(address);
    if (!protocol?.launchDate) return false;

    const oneYearAgo = Date.now() / 1000 - (365 * 24 * 60 * 60);
    return protocol.launchDate < oneYearAgo;
  }

  /**
   * Get all protocols by tier
   */
  static getProtocolsByTier(tier: ProtocolTier): Protocol[] {
    const registry = this.initRegistry();
    return Array.from(registry.values()).filter(p => p.tier === tier);
  }

  /**
   * Get all protocol categories
   */
  static getAllCategories(): string[] {
    const registry = this.initRegistry();
    const categories = new Set(
      Array.from(registry.values())
        .map(p => p.category)
        .filter(Boolean)
    );
    return Array.from(categories);
  }

  /**
   * Check if address is an Onchain Summer badge contract
   */
  static isOnchainSummerBadge(address: string): boolean {
    return ONCHAIN_SUMMER_CONTRACTS.includes(address.toLowerCase());
  }

  /**
   * Check if address is a hackathon badge contract
   */
  static isHackathonBadge(address: string): boolean {
    return HACKATHON_CONTRACTS.includes(address.toLowerCase());
  }
}
