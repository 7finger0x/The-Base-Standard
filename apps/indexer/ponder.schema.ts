import { onchainTable, relations } from "ponder";

// ============================================
// ACCOUNTS - Main reputation profiles
// ============================================
export const account = onchainTable("account", (t) => ({
  id: t.hex().primaryKey(), // Wallet address
  baseScore: t.integer().notNull().default(0), // Days on Base
  zoraScore: t.integer().notNull().default(0), // Zora mint points
  timelyScore: t.integer().notNull().default(0), // Early mint bonus
  totalScore: t.bigint().notNull().default(0n),
  tier: t.text().notNull().default("Novice"),
  firstTxTimestamp: t.integer(), // First Base transaction
  lastUpdated: t.integer().notNull(),
}));

export const accountRelations = relations(account, ({ many }) => ({
  linkedWallets: many(linkedWallet),
  mints: many(zoraMint),
  snapshots: many(scoreSnapshot),
}));

// ============================================
// LINKED WALLETS - Secondary wallets tied to main account
// ============================================
export const linkedWallet = onchainTable("linked_wallet", (t) => ({
  address: t.hex().primaryKey(),
  mainAccountId: t.hex().notNull(),
  linkedAt: t.integer().notNull(),
  zoraMintCount: t.integer().notNull().default(0),
  earlyMintCount: t.integer().notNull().default(0),
}));

export const linkedWalletRelations = relations(linkedWallet, ({ one }) => ({
  mainAccount: one(account, {
    fields: [linkedWallet.mainAccountId],
    references: [account.id],
  }),
}));

// ============================================
// ZORA MINTS - Individual mint records
// ============================================
export const zoraMint = onchainTable("zora_mint", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  minter: t.hex().notNull(),
  contractAddress: t.hex().notNull(),
  tokenId: t.bigint().notNull(),
  quantity: t.integer().notNull(),
  mintedAt: t.integer().notNull(),
  network: t.text().notNull(), // "base" | "zora"
  isEarlyMint: t.boolean().notNull().default(false),
  collectionDeployedAt: t.integer(),
}));

export const zoraMintRelations = relations(zoraMint, ({ one }) => ({
  minterAccount: one(account, {
    fields: [zoraMint.minter],
    references: [account.id],
  }),
  collection: one(collection, {
    fields: [zoraMint.contractAddress],
    references: [collection.address],
  }),
}));

// ============================================
// COLLECTIONS - Zora 1155 collections tracked
// ============================================
export const collection = onchainTable("collection", (t) => ({
  address: t.hex().primaryKey(),
  network: t.text().notNull(),
  deployedAt: t.integer().notNull(),
  totalMints: t.integer().notNull().default(0),
  creator: t.hex(),
  name: t.text(),
  contractURI: t.text(),
}));

export const collectionRelations = relations(collection, ({ many }) => ({
  mints: many(zoraMint),
}));

// ============================================
// SCORE SNAPSHOTS - Historical score tracking
// ============================================
export const scoreSnapshot = onchainTable("score_snapshot", (t) => ({
  id: t.text().primaryKey(), // address-timestamp
  accountId: t.hex().notNull(),
  score: t.bigint().notNull(),
  tier: t.text().notNull(),
  timestamp: t.integer().notNull(),
}));

export const scoreSnapshotRelations = relations(scoreSnapshot, ({ one }) => ({
  account: one(account, {
    fields: [scoreSnapshot.accountId],
    references: [account.id],
  }),
}));
