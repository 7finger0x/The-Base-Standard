// Zora Creator 1155 ABI (simplified for minting events)
export const Zora1155ABI = [
  {
    type: "event",
    name: "Purchased",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "minter", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "quantity", type: "uint256", indexed: false },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TransferSingle",
    inputs: [
      { name: "operator", type: "address", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "id", type: "uint256", indexed: false },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TransferBatch",
    inputs: [
      { name: "operator", type: "address", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "ids", type: "uint256[]", indexed: false },
      { name: "values", type: "uint256[]", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ContractCreated",
    inputs: [
      { name: "newContract", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "contractURI", type: "string", indexed: false },
      { name: "name", type: "string", indexed: false },
      { name: "defaultAdmin", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SetupNewToken",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "sender", type: "address", indexed: true },
      { name: "newURI", type: "string", indexed: false },
      { name: "maxSupply", type: "uint256", indexed: false },
    ],
  },
] as const;
