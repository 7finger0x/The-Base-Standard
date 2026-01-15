/*
  Warnings:

  - You are about to drop the `_ChainType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `ensName` on the `User` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ChainType";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "displayName" TEXT,
    "score" REAL NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'TOURIST',
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT
);
INSERT INTO "new_User" ("address", "createdAt", "id", "lastUpdated", "rank", "score", "tier", "updatedAt") SELECT "address", "createdAt", "id", "lastUpdated", "rank", "score", "tier", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");
CREATE INDEX "User_score_idx" ON "User"("score");
CREATE INDEX "User_rank_idx" ON "User"("rank");
CREATE INDEX "User_tier_idx" ON "User"("tier");
CREATE INDEX "User_username_idx" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineIndex
DROP INDEX "sqlite_autoindex_Session_2";
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- RedefineIndex
DROP INDEX "sqlite_autoindex_SiweNonce_2";
CREATE UNIQUE INDEX "SiweNonce_nonce_key" ON "SiweNonce"("nonce");
