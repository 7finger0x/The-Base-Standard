// Contract Addresses
export const REPUTATION_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

// ABIs
export const REPUTATION_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'linkWallet',
    inputs: [
      { name: 'secondary', type: 'address' },
      { name: 'deadline', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unlinkWallet',
    inputs: [{ name: 'secondary', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateScore',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'score', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchUpdateScores',
    inputs: [
      { name: 'users', type: 'address[]' },
      { name: 'scores', type: 'uint256[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'walletLinks',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: 'mainWallet', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLinkedWallets',
    inputs: [{ name: 'main', type: 'address' }],
    outputs: [{ name: 'wallets', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMainWallet',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: 'main', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'reputationScores',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'score', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'reputationTiers',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'tier', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAggregatedScore',
    inputs: [{ name: 'main', type: 'address' }],
    outputs: [{ name: 'total', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nonces',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: 'nonce', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'WalletLinked',
    inputs: [
      { name: 'main', type: 'address', indexed: true },
      { name: 'secondary', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WalletUnlinked',
    inputs: [
      { name: 'main', type: 'address', indexed: true },
      { name: 'secondary', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'ScoreUpdated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'oldScore', type: 'uint256', indexed: false },
      { name: 'newScore', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TierUpdated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'oldTier', type: 'string', indexed: false },
      { name: 'newTier', type: 'string', indexed: false },
    ],
  },
] as const;
