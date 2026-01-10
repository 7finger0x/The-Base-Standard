import { onchainTable, relations, index } from "@ponder/core";

// ============================================
// CORE TABLES
// ============================================

/**
 * Account - The primary identity (main wallet)
 * All scores are aggregated to this entity
 */
export const account = onchainTable("account", (t) => ({
  id: t.hex().primaryKey(), // Main wallet address
  baseScore: t.integer().notNull().default(0),
  zoraScore: t.integer().notNull().default(0),
  timelyScore: t.integer().notNull().default(0),
  totalScore: t.bigint().notNull().default(0n),
  tier: t.text().notNull().default("Novice"),
  firstTxTimestamp: t.integer(), // Unix timestamp of first Base tx
  lastUpdated: t.integer().notNull(),
}), (table) => ({
  scoreIdx: index().on(table.totalScore),
  tierIdx: index().on(table.tier),
}));

/**
 * LinkedWallet - Secondary wallets linked to a main account
 * Allows multi-wallet aggregation
 */
export const linkedWallet = onchainTable("linked_wallet", (t) => ({
  address: t.hex().primaryKey(),
  mainAccountId: t.hex().notNull().references(() => account.id),
  linkedAt: t.integer().notNull(), // Unix timestamp
  zoraMintCount: t.integer().notNull().default(0),
  earlyMintCount: t.integer().notNull().default(0),
  firstTxTimestamp: t.integer(),
}), (table) => ({
  mainAccountIdx: index().on(table.mainAccountId),
}));

/**
 * ZoraMint - Individual NFT mint records
 * Tracks both Base and Zora network mints
 */
export const zoraMint = onchainTable("zora_mint", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  minter: t.hex().notNull(),
  contractAddress: t.hex().notNull(),
  tokenId: t.bigint().notNull(),
  quantity: t.integer().notNull(),
  mintedAt: t.integer().notNull(), // Unix timestamp
  network: t.text().notNull(), // "base" or "zora"
  isEarlyMint: t.boolean().notNull().default(false), // < 24h from deploy
  collectionDeployedAt: t.integer(), // When the collection was created
}), (table) => ({
  minterIdx: index().on(table.minter),
  contractIdx: index().on(table.contractAddress),
  mintedAtIdx: index().on(table.mintedAt),
}));

/**
 * Collection - Zora 1155 collections we track
 */
export const collection = onchainTable("collection", (t) => ({
  address: t.hex().primaryKey(),
  network: t.text().notNull(),
  deployedAt: t.integer().notNull(),
  totalMints: t.integer().notNull().default(0),
}));

/**
 * ScoreSnapshot - Historical score records
 * Useful for tracking score changes over time
 */
export const scoreSnapshot = onchainTable("score_snapshot", (t) => ({
  id: t.text().primaryKey(), // accountId-timestamp
  accountId: t.hex().notNull().references(() => account.id),
  score: t.bigint().notNull(),
  tier: t.text().notNull(),
  timestamp: t.integer().notNull(),
}), (table) => ({
  accountIdx: index().on(table.accountId),
  timestampIdx: index().on(table.timestamp),
}));

// ============================================
// RELATIONS
// ============================================

export const accountRelations = relations(account, ({ many }) => ({
  linkedWallets: many(linkedWallet),
  mints: many(zoraMint),
  snapshots: many(scoreSnapshot),
}));

export const linkedWalletRelations = relations(linkedWallet, ({ one }) => ({
  mainAccount: one(account, {
    fields: [linkedWallet.mainAccountId],
    references: [account.id],
  }),
}));

export const zoraMintRelations = relations(zoraMint, ({ one }) => ({
  collection: one(collection, {
    fields: [zoraMint.contractAddress],
    references: [collection.address],
  }),
}));

export const scoreSnapshotRelations = relations(scoreSnapshot, ({ one }) => ({
  account: one(account, {
    fields: [scoreSnapshot.accountId],
    references: [account.id],
  }),
}));
