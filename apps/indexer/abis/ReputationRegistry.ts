export const ReputationRegistryABI = [
  {
    type: "event",
    name: "WalletLinked",
    inputs: [
      { name: "main", type: "address", indexed: true },
      { name: "secondary", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WalletUnlinked",
    inputs: [
      { name: "main", type: "address", indexed: true },
      { name: "secondary", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "ScoreUpdated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "oldScore", type: "uint256", indexed: false },
      { name: "newScore", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TierUpdated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "oldTier", type: "string", indexed: false },
      { name: "newTier", type: "string", indexed: false },
    ],
  },
] as const;
