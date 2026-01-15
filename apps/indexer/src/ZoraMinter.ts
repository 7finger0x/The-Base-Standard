import { ponder } from "ponder:registry";
import { account, zoraMint, collection, linkedWallet } from "ponder:schema";
import { eq } from "ponder:core";
import { getTierFromScore, isEarlyMint, EARLY_MINT_BONUS } from "./utils";

// ============================================
// ZORA MINTER HANDLERS (BASE NETWORK)
// ============================================

ponder.on("ZoraMinterBase:Purchased", async ({ event, context }) => {
  const { minter, tokenId, quantity } = event.args;
  const { db } = context;
  const timestamp = Number(event.block.timestamp);
  const contractAddress = event.log.address;

  // Get or create collection
  let col = await db.query.collection.findFirst({
    where: eq(collection.address, contractAddress),
  });
  if (!col) {
    const inserted = await db.insert(collection).values({
      address: contractAddress,
      network: "base",
      deployedAt: timestamp, // Approximate - use ContractCreated for accuracy
      totalMints: 0,
    }).returning();
    col = inserted[0];
  }

  // Check if early mint (within 24h of deploy)
  const early = isEarlyMint(timestamp, col.deployedAt);

  // Record the mint
  const mintId = `${event.transaction.hash}-${event.log.logIndex}`;
  await db.insert(zoraMint).values({
    id: mintId,
    minter,
    contractAddress,
    tokenId,
    quantity: Number(quantity),
    mintedAt: timestamp,
    network: "base",
    isEarlyMint: early,
    collectionDeployedAt: col.deployedAt,
  }).onConflictDoNothing();

  // Update collection stats
  await db.update(collection)
    .set({
      totalMints: col.totalMints + Number(quantity),
    })
    .where(eq(collection.address, contractAddress));

  // Update minter's account
  await updateMinterScore(db, minter, Number(quantity), early, timestamp);

  console.log(`Base mint: ${minter} minted ${quantity}x token ${tokenId} (early: ${early})`);
});

ponder.on("ZoraMinterBase:TransferSingle", async ({ event, context }) => {
  const { from, to, id, value } = event.args;
  const { db } = context;
  const timestamp = Number(event.block.timestamp);

  // Only track mints (from zero address)
  if (from !== "0x0000000000000000000000000000000000000000") return;

  const contractAddress = event.log.address;
  
  // Get collection deploy time
  const col = await db.query.collection.findFirst({
    where: eq(collection.address, contractAddress),
  });
  const deployedAt = col?.deployedAt ?? timestamp;
  const early = isEarlyMint(timestamp, deployedAt);

  const mintId = `${event.transaction.hash}-${event.log.logIndex}`;
  await db.insert(zoraMint).values({
    id: mintId,
    minter: to,
    contractAddress,
    tokenId: id,
    quantity: Number(value),
    mintedAt: timestamp,
    network: "base",
    isEarlyMint: early,
    collectionDeployedAt: deployedAt,
  }).onConflictDoNothing();

  await updateMinterScore(db, to, Number(value), early, timestamp);
});

// ============================================
// ZORA MINTER HANDLERS (ZORA NETWORK)
// ============================================

ponder.on("ZoraMinterZora:Purchased", async ({ event, context }) => {
  const { minter, tokenId, quantity } = event.args;
  const { db } = context;
  const timestamp = Number(event.block.timestamp);
  const contractAddress = event.log.address;

  let col = await db.query.collection.findFirst({
    where: eq(collection.address, contractAddress),
  });
  if (!col) {
    const inserted = await db.insert(collection).values({
      address: contractAddress,
      network: "zora",
      deployedAt: timestamp,
      totalMints: 0,
    }).returning();
    col = inserted[0];
  }

  const early = isEarlyMint(timestamp, col.deployedAt);

  const mintId = `${event.transaction.hash}-${event.log.logIndex}`;
  await db.insert(zoraMint).values({
    id: mintId,
    minter,
    contractAddress,
    tokenId,
    quantity: Number(quantity),
    mintedAt: timestamp,
    network: "zora",
    isEarlyMint: early,
    collectionDeployedAt: col.deployedAt,
  }).onConflictDoNothing();

  await db.update(collection)
    .set({
      totalMints: col.totalMints + Number(quantity),
    })
    .where(eq(collection.address, contractAddress));

  await updateMinterScore(db, minter, Number(quantity), early, timestamp);

  console.log(`Zora mint: ${minter} minted ${quantity}x token ${tokenId} (early: ${early})`);
});

ponder.on("ZoraMinterZora:TransferSingle", async ({ event, context }) => {
  const { from, to, id, value } = event.args;
  const { db } = context;
  const timestamp = Number(event.block.timestamp);

  if (from !== "0x0000000000000000000000000000000000000000") return;

  const contractAddress = event.log.address;
  const col = await db.query.collection.findFirst({
    where: eq(collection.address, contractAddress),
  });
  const deployedAt = col?.deployedAt ?? timestamp;
  const early = isEarlyMint(timestamp, deployedAt);

  const mintId = `${event.transaction.hash}-${event.log.logIndex}`;
  await db.insert(zoraMint).values({
    id: mintId,
    minter: to,
    contractAddress,
    tokenId: id,
    quantity: Number(value),
    mintedAt: timestamp,
    network: "zora",
    isEarlyMint: early,
    collectionDeployedAt: deployedAt,
  }).onConflictDoNothing();

  await updateMinterScore(db, to, Number(value), early, timestamp);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to update minter score
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateMinterScore(
  db: any, // Ponder context.db type - properly typed at call sites
  minter: `0x${string}`,
  quantity: number,
  isEarly: boolean,
  timestamp: number
) {
  // Check if this wallet is linked to a main account
  const linked = await db.query.linkedWallet.findFirst({
    where: eq(linkedWallet.address, minter),
  });
  const mainAccount = linked?.mainAccountId ?? minter;

  // Get or create account
  let acc = await db.query.account.findFirst({
    where: eq(account.id, mainAccount),
  });
  
  if (!acc) {
    const inserted = await db.insert(account).values({
      id: mainAccount,
      baseScore: 0,
      zoraScore: 0,
      timelyScore: 0,
      totalScore: 0n,
      tier: "Novice",
      lastUpdated: timestamp,
    }).returning();
    acc = inserted[0];
  }

  // Calculate new scores
  const zoraBonus = quantity * 10; // 10 points per mint
  const timelyBonus = isEarly ? quantity * EARLY_MINT_BONUS : 0;
  
  const newZoraScore = acc.zoraScore + zoraBonus;
  const newTimelyScore = acc.timelyScore + timelyBonus;
  const newTotalScore = BigInt(acc.baseScore + newZoraScore + newTimelyScore);
  const newTier = getTierFromScore(Number(newTotalScore));

  // Update account
  await db.update(account)
    .set({
      zoraScore: newZoraScore,
      timelyScore: newTimelyScore,
      totalScore: newTotalScore,
      tier: newTier,
      lastUpdated: timestamp,
    })
    .where(eq(account.id, mainAccount));

  // Update linked wallet stats if applicable
  if (linked) {
    await db.update(linkedWallet)
      .set({
        zoraMintCount: linked.zoraMintCount + quantity,
        earlyMintCount: linked.earlyMintCount + (isEarly ? quantity : 0),
      })
      .where(eq(linkedWallet.address, minter));
  }
}
