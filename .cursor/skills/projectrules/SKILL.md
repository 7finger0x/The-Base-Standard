---
name: projectrules
description: This is a new rule
---

# Overview

# Project: The Base Standard
# Description: On-chain reputation scoring & identity aggregation for Base L2.
# Philosophy: MANUAL BUILD ONLY. No scaffolding wizards. Architectural purity.

# --- 1. TECH STACK & VERSIONS ---

# Core Frameworks
- Frontend: Next.js 15 (App Router), React 19, TypeScript (Strict)
- Styling: Tailwind CSS 3.4+ (Utility-first) - Note: 4.0 upgrade planned for Q2 2026
- Web3: OnchainKit, wagmi v2, viem
- Database: Prisma ORM
- Smart Contracts: Foundry (Solidity 0.8.23)

# Critical Constraints
- NEVER use scaffolding wizards (e.g., `npm create onchain`). We build manually.
- NEVER use `any` type. Define strict interfaces for all data structures.
- NEVER use `db:push` in production context. Use `migrate deploy`.
- ALWAYS use `import type` for interfaces to optimize tree-shaking.

# --- 2. CODING STANDARDS ---

# React & Next.js
- Default to **Server Components**. Use `'use client'` only for interactive leaves.
- Use `lucide-react` for icons.
- Use `clsx` or `tailwind-merge` for dynamic classes.
- Place all business logic in `src/lib/`. UI components should be logic-light.
- Security: Add `import 'server-only'` to all files in `src/lib/scoring/` and `src/lib/db/`.

# TypeScript
- Prefer `interface` over `type` for object definitions.
- Use Zod for runtime validation of API inputs and Environment Variables.
- Naming: PascalCase for components (`MintButton.tsx`), camelCase for logic (`calculateScore.ts`).

# Web3 Patterns
- Use `wagmi` hooks for React component integration.
- Use `viem` for non-hook, pure TS interactions or server-side calls.
- Handle chain mismatches gracefully in the UI (User is on Base Mainnet?).

# --- 3. DOMAIN LOGIC: REPUTATION SYSTEM ---

# Scoring Algorithm (The 9 Metrics)
1. Base Tenure: Days since first transaction.
2. Zora Mints: Total mint count on Zora network.
3. Timeliness: Bonus for minting within 24h of collection launch.
4. Farcaster Social: Composite (Casts, Followers, Following, Reactions).
5. Builder Activity: Contracts deployed & verified (Verified = 2x weight).
6. Creator Stats: Collections created & mints by others.
7. Onchain Summer: 2023 & 2024 participation counts.
8. Hackathons/Events: Badge counts.
9. Early Adopter: First 100k users on Base, Zora, or Farcaster.

# Tier Thresholds (Total Score)
- Novice: 0-99
- Bronze: 100-499
- Silver: 500-849
- Gold: 850-999
- BASED: 1000+ (Unlocks 0.002 ETH Mint)

# Identity Aggregation
- Users link wallets via EIP-712 signatures.
- Scores aggregate across all linked wallets.
- Max linked wallets: 5 (configurable).

# --- 4. DATABASE & MIGRATIONS ---

# Development
- Provider: SQLite
- URL: `file:./dev.db`
- Command: `npx prisma migrate dev`

# Production
- Provider: PostgreSQL (Neon/Vercel)
- Pooling: Required (PgBouncer/Supabase Pooler)
- URL Env: `DATABASE_URL` (Pooled/Transaction)
- Direct Env: `DIRECT_URL` (Session/Migration)
- Command: `npx prisma migrate deploy`

# --- 5. TESTING & QUALITY ---

# Mandates
- **100% Test Coverage** required for:
  - `src/lib/scoring/` (Business Logic)
  - `src/app/api/` (API Routes)
  - `foundry/src/` (Smart Contracts)

# Commands
- App Tests: `npm run test` (Vitest)
- Contract Tests: `npm run foundry:test` (Forge)
- DB Validation: `npm run db:validate`

# --- 6. DIRECTORY STRUCTURE ---

- `src/app/` -> Routes & Pages
- `src/components/` -> React Components
- `src/lib/` -> Core Logic (Scoring, Utils, Constants)
- `src/lib/db/` -> Prisma Client & DAO
- `foundry/` -> Smart Contract Workspace
- `foundry/src/` -> Solidity Contracts
- `foundry/script/` -> Deployment Scripts