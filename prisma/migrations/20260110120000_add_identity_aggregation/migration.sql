-- Migration: Add Identity Aggregation System
-- Creates multi-wallet and social account linking infrastructure

-- Create ChainType enum
CREATE TABLE IF NOT EXISTS "_ChainType" (
    "A" TEXT NOT NULL PRIMARY KEY
);

-- Create Wallet table
CREATE TABLE IF NOT EXISTS "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "chainType" TEXT NOT NULL DEFAULT 'EVM',
    "label" TEXT,
    "verifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationMethod" TEXT NOT NULL DEFAULT 'EIP712',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Account table (OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'oauth',
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "providerUsername" TEXT,
    "providerAvatar" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create SIWENonce table
CREATE TABLE IF NOT EXISTS "SiweNonce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nonce" TEXT NOT NULL UNIQUE,
    "userId" TEXT,
    "address" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Update User table (add new fields, make address nullable)
-- Note: SQLite doesn't support ALTER COLUMN, so we'll need to recreate
-- For production, use proper migration tool

-- Create indexes
CREATE INDEX IF NOT EXISTS "Wallet_address_idx" ON "Wallet"("address");
CREATE INDEX IF NOT EXISTS "Wallet_userId_idx" ON "Wallet"("userId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Account_provider_providerAccountId_idx" ON "Account"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "Session_sessionToken_idx" ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "SiweNonce_nonce_idx" ON "SiweNonce"("nonce");
CREATE INDEX IF NOT EXISTS "SiweNonce_userId_idx" ON "SiweNonce"("userId");
CREATE INDEX IF NOT EXISTS "SiweNonce_address_idx" ON "SiweNonce"("address");

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_address_chainType_key" ON "Wallet"("address", "chainType");
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
