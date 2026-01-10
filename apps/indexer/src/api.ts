import { ponder } from "ponder:registry";
import { account, linkedWallet, zoraMint, scoreSnapshot } from "ponder:schema";
import { desc, eq, and, gte } from "ponder:core";

// ============================================
// GRAPHQL API EXTENSIONS
// ============================================

ponder.get("/health", async (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

/**
 * Get full reputation data for an address
 * GET /api/reputation/:address
 */
ponder.get("/api/reputation/:address", async (c) => {
  const address = c.req.param("address")?.toLowerCase() as `0x${string}`;
  
  if (!address || !address.startsWith("0x")) {
    return c.json({ error: "Invalid address" }, 400);
  }

  const { db } = c;

  // Check if this is a linked wallet
  const linked = await db.query.linkedWallet.findFirst({
    where: eq(linkedWallet.address, address),
  });

  const mainAddress = linked?.mainAccountId ?? address;

  // Get main account
  const acc = await db.query.account.findFirst({
    where: eq(account.id, mainAddress),
    with: {
      linkedWallets: true,
    },
  });

  if (!acc) {
    return c.json({
      address,
      totalScore: 0,
      tier: "Novice",
      breakdown: {
        baseTenure: { score: 0, days: 0 },
        zoraMints: { score: 0, count: 0, earlyMints: 0 },
        timeliness: { score: 0, earlyAdopterCount: 0 },
      },
      linkedWallets: [],
      lastUpdated: new Date().toISOString(),
    });
  }

  // Count mints
  const mints = await db.query.zoraMint.findMany({
    where: eq(zoraMint.minter, mainAddress),
  });

  const totalMints = mints.length;
  const earlyMints = mints.filter(m => m.isEarlyMint).length;

  return c.json({
    address: mainAddress,
    totalScore: Number(acc.totalScore),
    tier: acc.tier,
    breakdown: {
      baseTenure: {
        score: acc.baseScore,
        days: acc.firstTxTimestamp 
          ? Math.floor((Date.now() / 1000 - acc.firstTxTimestamp) / 86400)
          : 0,
        firstTx: acc.firstTxTimestamp 
          ? new Date(acc.firstTxTimestamp * 1000).toISOString()
          : null,
      },
      zoraMints: {
        score: acc.zoraScore,
        count: totalMints,
        earlyMints,
      },
      timeliness: {
        score: acc.timelyScore,
        earlyAdopterCount: earlyMints,
      },
    },
    linkedWallets: acc.linkedWallets?.map(w => w.address) ?? [],
    lastUpdated: new Date(acc.lastUpdated * 1000).toISOString(),
  });
});

/**
 * Get leaderboard
 * GET /api/leaderboard?limit=100&offset=0
 */
ponder.get("/api/leaderboard", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") ?? "100"), 1000);
  const offset = parseInt(c.req.query("offset") ?? "0");

  const { db } = c;

  const accounts = await db.query.account.findMany({
    orderBy: desc(account.totalScore),
    limit,
    offset,
  });

  return c.json({
    leaderboard: accounts.map((acc, idx) => ({
      rank: offset + idx + 1,
      address: acc.id,
      score: Number(acc.totalScore),
      tier: acc.tier,
    })),
    pagination: {
      limit,
      offset,
      hasMore: accounts.length === limit,
    },
  });
});

/**
 * Get tier distribution stats
 * GET /api/stats/tiers
 */
ponder.get("/api/stats/tiers", async (c) => {
  const { db } = c;

  const tiers = ["Novice", "Bronze", "Silver", "Gold", "BASED"];
  const distribution: Record<string, number> = {};

  for (const tier of tiers) {
    const count = await db.query.account.findMany({
      where: eq(account.tier, tier),
    });
    distribution[tier] = count.length;
  }

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return c.json({
    distribution,
    total,
    percentages: Object.fromEntries(
      Object.entries(distribution).map(([tier, count]) => [
        tier,
        total > 0 ? ((count / total) * 100).toFixed(2) : "0",
      ])
    ),
  });
});

/**
 * Get recent mints
 * GET /api/mints/recent?limit=50
 */
ponder.get("/api/mints/recent", async (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") ?? "50"), 200);

  const { db } = c;

  const recentMints = await db.query.zoraMint.findMany({
    orderBy: desc(zoraMint.mintedAt),
    limit,
  });

  return c.json({
    mints: recentMints.map(m => ({
      id: m.id,
      minter: m.minter,
      contract: m.contractAddress,
      tokenId: m.tokenId.toString(),
      quantity: m.quantity,
      network: m.network,
      isEarly: m.isEarlyMint,
      mintedAt: new Date(m.mintedAt * 1000).toISOString(),
    })),
  });
});

/**
 * Get score history for an address
 * GET /api/history/:address?days=30
 */
ponder.get("/api/history/:address", async (c) => {
  const address = c.req.param("address")?.toLowerCase() as `0x${string}`;
  const days = parseInt(c.req.query("days") ?? "30");

  if (!address) {
    return c.json({ error: "Address required" }, 400);
  }

  const { db } = c;

  const cutoff = Math.floor(Date.now() / 1000) - (days * 86400);

  const snapshots = await db.query.scoreSnapshot.findMany({
    where: and(
      eq(scoreSnapshot.accountId, address),
      gte(scoreSnapshot.timestamp, cutoff)
    ),
    orderBy: desc(scoreSnapshot.timestamp),
  });

  return c.json({
    address,
    history: snapshots.map(s => ({
      score: Number(s.score),
      tier: s.tier,
      timestamp: new Date(s.timestamp * 1000).toISOString(),
    })),
  });
});
