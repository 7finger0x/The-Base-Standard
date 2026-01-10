import { createConfig } from "ponder";
import { http } from "viem";

import { ReputationRegistryABI } from "./abis/ReputationRegistry";
import { Zora1155ABI } from "./abis/Zora1155";

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
  networks: {
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL_8453),
    },
    zora: {
      chainId: 7777777,
      transport: http(process.env.PONDER_RPC_URL_7777777),
    },
  },
  contracts: {
    // ReputationRegistry on Base (deploy this contract)
    ReputationRegistry: {
      network: "base",
      abi: ReputationRegistryABI,
      address: process.env.REPUTATION_REGISTRY_ADDRESS as `0x${string}`,
      startBlock: 18000000, // Update after deployment
    },
    // Zora Creator 1155 Factory on Base
    ZoraMinterBase: {
      network: "base",
      abi: Zora1155ABI,
      address: "0x04E2516A2c207E84a1839755675dfd8eF6302F0a",
      startBlock: 1000000,
    },
    // Zora Creator 1155 Factory on Zora Network
    ZoraMinterZora: {
      network: "zora",
      abi: Zora1155ABI,
      address: "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021",
      startBlock: 1000000,
    },
  },
});
