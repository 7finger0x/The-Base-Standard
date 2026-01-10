import { createConfig } from "@ponder/core";
import { http } from "viem";

import { ReputationRegistryABI } from "./abis/ReputationRegistry";
import { Zora1155ABI } from "./abis/Zora1155";

export default createConfig({
  networks: {
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL_8453 ?? "https://mainnet.base.org"),
    },
    zora: {
      chainId: 7777777,
      transport: http(process.env.PONDER_RPC_URL_7777777 ?? "https://rpc.zora.energy"),
    },
  },
  contracts: {
    // BaseRank Reputation Registry
    ReputationRegistry: {
      abi: ReputationRegistryABI,
      network: "base",
      address: process.env.REPUTATION_REGISTRY_ADDRESS as `0x${string}`,
      startBlock: 12000000, // Adjust to deployment block
    },
    // Zora 1155 Minter on Base
    ZoraMinterBase: {
      abi: Zora1155ABI,
      network: "base",
      address: (process.env.ZORA_CREATOR_1155_BASE ?? "0x04E2516A2c207E84a1839755675dfd8eF6302F0a") as `0x${string}`,
      startBlock: 12000000,
    },
    // Zora 1155 Minter on Zora Network
    ZoraMinterZora: {
      abi: Zora1155ABI,
      network: "zora",
      address: (process.env.ZORA_CREATOR_1155_ZORA ?? "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021") as `0x${string}`,
      startBlock: 9000000,
    },
  },
});
