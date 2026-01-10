import { ponder } from "ponder:registry";
import {
  account,
  linkedWallet,
  zoraMint,
  collection,
  scoreSnapshot
} from "ponder:schema";
import { getTierFromScore, calculateTotalScore } from "./utils";

// ============================================
// REPUTATION REGISTRY HANDLERS
// ============================================

ponder.on("ReputationRegistry:WalletLinked", async ({ event, context }) => {
  const { main, secondary, timestamp } = event.args;
  const { db } = context;

  // Ensure main account exists
  await db.insert(account).values({
    id: main,
    baseScore: 0,
    zoraScore: 0,
    timelyScore: 0,
    totalScore: 0n,
    tier: "Novice",
    lastUpdated: Number(timestamp),
  }).onConflictDoNothing();

  // Create linked wallet record
  await db.insert(linkedWallet).values({
    address: secondary,
    mainAccountId: main,
    linkedAt: Number(timestamp),
    zoraMintCount: 0,
    earlyMintCount: 0,
  }).onConflictDoUpdate({
    mainAccountId: main,
    linkedAt: Number(timestamp),
  });

  console.log(`Wallet linked: ${secondary} -> ${main}`);
});

ponder.on("ReputationRegistry:WalletUnlinked", async ({ event, context }) => {
  const { main, secondary } = event.args;
  const { db } = context;

  // Remove the linked wallet record
  await db.delete(linkedWallet).where({ address: secondary });

  console.log(`Wallet unlinked: ${secondary} from ${main}`);
});

ponder.on("ReputationRegistry:ScoreUpdated", async ({ event, context }) => {
  const { user, newScore } = event.args;
  const { db } = context;
  const timestamp = Number(event.block.timestamp);

  const tier = getTierFromScore(Number(newScore));

  // Update account score
  await db.insert(account).values({
    id: user,
    baseScore: 0,
    zoraScore: 0,
    timelyScore: 0,
    totalScore: newScore,
    tier,
    lastUpdated: timestamp,
  }).onConflictDoUpdate({
    totalScore: newScore,
    tier,
    lastUpdated: timestamp,
  });

  // Create snapshot
  await db.insert(scoreSnapshot).values({
    id: `${user}-${timestamp}`,
    accountId: user,
    score: newScore,
    tier,
    timestamp,
  });

  console.log(`Score updated for ${user}: ${newScore} (${tier})`);
});
