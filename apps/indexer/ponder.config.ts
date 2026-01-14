import { createConfig } from "ponder";
import { http } from "viem";

import { ReputationRegistryABI } from "./abis/ReputationRegistry";
import { Zora1155ABI } from "./abis/Zora1155";

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
  chains: {
    base: {
      id: 8453,
      rpc: process.env.PONDER_RPC_URL_8453 ?? "https://mainnet.base.org",
    },
    zora: {
      id: 7777777,
      rpc: process.env.PONDER_RPC_URL_7777777 ?? "https://rpc.zora.energy",
    },
  },
  contracts: {
    // ReputationRegistry on Base (deploy this contract)
    ReputationRegistry: {
      chain: "base",
      abi: ReputationRegistryABI,
      address: (process.env.REPUTATION_REGISTRY_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
      startBlock: 18000000,
    },
    // Zora Creator 1155 Factory on Base
    ZoraMinterBase: {
      chain: "base",
      abi: Zora1155ABI,
      address: "0x04E2516A2c207E84a1839755675dfd8eF6302F0a",
      startBlock: 1000000,
    },
    // Zora Creator 1155 Factory on Zora Network
    ZoraMinterZora: {
      chain: "zora",
      abi: Zora1155ABI,
      address: "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021",
      startBlock: 1000000,
    },
  },
});
