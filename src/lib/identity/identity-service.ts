/**
 * Identity Service
 * 
 * Manages multi-wallet and social account aggregation
 * Implements the "Identity Graph" architecture
 */

import { prisma } from '@/lib/db';
import type { Address } from 'viem';
import { verifySIWESignature, parseSIWEMessage, validateSIWEMessage } from './siwe';
import { RequestLogger } from '@/lib/request-logger';

export interface LinkWalletRequest {
  address: Address;
  chainType: string; // 'EVM' | 'SOLANA' | 'BITCOIN' | 'COSMOS' | 'FLOW'
  siweMessage: string;
  signature: `0x${string}`;
  nonce: string;
}

export interface LinkSocialRequest {
  provider: 'discord' | 'twitter' | 'github' | 'google';
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  providerUsername?: string;
  providerAvatar?: string;
}

export class IdentityService {
  /**
   * Generate SIWE nonce for wallet linking
   */
  static async generateNonce(userId?: string, address?: Address): Promise<string> {
    // Generate cryptographically secure nonce
    const nonce = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.siweNonce.create({
      data: {
        nonce,
        userId: userId || null,
        address: address || null,
        expiresAt,
      },
    });

    return nonce;
  }

  /**
   * Verify and consume SIWE nonce
   */
  static async verifyNonce(nonce: string): Promise<{ valid: boolean; userId?: string; address?: string }> {
    const nonceRecord = await prisma.siweNonce.findUnique({
      where: { nonce },
    });

    if (!nonceRecord) {
      return { valid: false };
    }

    // Check expiration
    if (new Date() > nonceRecord.expiresAt) {
      await prisma.siweNonce.delete({ where: { nonce } });
      return { valid: false };
    }

    // Check if already used
    if (nonceRecord.used) {
      return { valid: false };
    }

    // Mark as used
    await prisma.siweNonce.update({
      where: { nonce },
      data: { used: true },
    });

    return {
      valid: true,
      userId: nonceRecord.userId || undefined,
      address: nonceRecord.address || undefined,
    };
  }

  /**
   * Link wallet to user identity
   */
  static async linkWallet(userId: string, request: LinkWalletRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Parse SIWE message
      const siweMessage = parseSIWEMessage(request.siweMessage);
      if (!siweMessage) {
        return { success: false, error: 'Invalid SIWE message format' };
      }

      // Verify nonce
      const nonceCheck = await this.verifyNonce(request.nonce);
      if (!nonceCheck.valid) {
        return { success: false, error: 'Invalid or expired nonce' };
      }

      // Validate SIWE message
      const validation = validateSIWEMessage(
        siweMessage,
        request.nonce,
        process.env.NEXT_PUBLIC_APP_DOMAIN || 'base-standard.xyz',
        parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453', 10)
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Verify signature
      const signatureValid = await verifySIWESignature(
        request.siweMessage,
        request.signature,
        request.address
      );

      if (!signatureValid) {
        return { success: false, error: 'Invalid signature' };
      }

      // Check if wallet is already linked to another user
      const existingWallet = await prisma.wallet.findUnique({
        where: {
          address_chainType: {
            address: request.address.toLowerCase(),
            chainType: request.chainType,
          },
        },
      });

      if (existingWallet) {
        if (existingWallet.userId === userId) {
          return { success: false, error: 'Wallet already linked to this account' };
        }
        return { success: false, error: 'Wallet already linked to another account' };
      }

      // Check if user has any wallets (to determine if this should be primary)
      const userWallets = await prisma.wallet.findMany({
        where: { userId },
      });

      const isPrimary = userWallets.length === 0;

      // If setting as primary, unset other primary wallets
      if (isPrimary) {
        await prisma.wallet.updateMany({
          where: { userId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      // Create wallet link
      await prisma.wallet.create({
        data: {
          address: request.address.toLowerCase(),
          chainType: request.chainType,
          userId,
          isPrimary,
          verifiedAt: new Date(),
          verificationMethod: 'SIWE',
        },
      });

      return { success: true };
    } catch (error) {
      RequestLogger.logError('Link wallet error', error, {
        operation: 'linkWallet',
        address: request.address,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unlink wallet from user identity
   */
  static async unlinkWallet(userId: string, walletId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      if (wallet.userId !== userId) {
        return { success: false, error: 'Unauthorized' };
      }

      // If unlinking primary wallet, promote another wallet to primary
      if (wallet.isPrimary) {
        const otherWallets = await prisma.wallet.findMany({
          where: { userId, id: { not: walletId } },
          take: 1,
        });

        if (otherWallets.length > 0) {
          await prisma.wallet.update({
            where: { id: otherWallets[0].id },
            data: { isPrimary: true },
          });
        }
      }

      await prisma.wallet.delete({
        where: { id: walletId },
      });

      return { success: true };
    } catch (error) {
      RequestLogger.logError('Unlink wallet error', error, {
        operation: 'unlinkWallet',
        walletId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Set primary wallet
   */
  static async setPrimaryWallet(userId: string, walletId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet || wallet.userId !== userId) {
        return { success: false, error: 'Wallet not found or unauthorized' };
      }

      // Atomic transaction: unset all primary, set this one
      await prisma.$transaction([
        prisma.wallet.updateMany({
          where: { userId, isPrimary: true },
          data: { isPrimary: false },
        }),
        prisma.wallet.update({
          where: { id: walletId },
          data: { isPrimary: true },
        }),
      ]);

      return { success: true };
    } catch (error) {
      RequestLogger.logError('Set primary wallet error', error, {
        operation: 'setPrimaryWallet',
        walletId,
        userId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Link social account to user identity
   */
  static async linkSocialAccount(userId: string, request: LinkSocialRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if account is already linked to another user
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: request.provider,
            providerAccountId: request.providerAccountId,
          },
        },
      });

      if (existingAccount) {
        if (existingAccount.userId === userId) {
          return { success: false, error: 'Account already linked to this user' };
        }
        return { success: false, error: 'Account already linked to another user' };
      }

      // Create account link
      await prisma.account.create({
        data: {
          userId,
          type: 'oauth',
          provider: request.provider,
          providerAccountId: request.providerAccountId,
          access_token: request.accessToken,
          refresh_token: request.refreshToken,
          expires_at: request.expiresAt,
          providerUsername: request.providerUsername,
          providerAvatar: request.providerAvatar,
        },
      });

      return { success: true };
    } catch (error) {
      RequestLogger.logError('Link social account error', error, {
        operation: 'linkSocialAccount',
        userId,
        provider: request.provider,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unlink social account
   */
  static async unlinkSocialAccount(userId: string, accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account || account.userId !== userId) {
        return { success: false, error: 'Account not found or unauthorized' };
      }

      await prisma.account.delete({
        where: { id: accountId },
      });

      return { success: true };
    } catch (error) {
      RequestLogger.logError('Unlink social account error', error, {
        operation: 'unlinkSocialAccount',
        accountId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user identity with all linked accounts
   */
  static async getUserIdentity(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: {
          orderBy: [
            { isPrimary: 'desc' },
            { verifiedAt: 'desc' },
          ],
        },
        accounts: {
          orderBy: { provider: 'asc' },
        },
      },
    });

    if (!user) {
      return null;
    }

    const primaryWallet = user.wallets.find(w => w.isPrimary) || user.wallets[0];

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      score: user.score,
      tier: user.tier,
      rank: user.rank,
      primaryWallet: primaryWallet ? {
        id: primaryWallet.id,
        address: primaryWallet.address,
        chainType: primaryWallet.chainType,
        label: primaryWallet.label,
      } : null,
      wallets: user.wallets.map(w => ({
        id: w.id,
        address: w.address,
        chainType: w.chainType,
        label: w.label,
        isPrimary: w.isPrimary,
        verifiedAt: w.verifiedAt,
      })),
      socialAccounts: user.accounts.map(a => ({
        id: a.id,
        provider: a.provider,
        providerUsername: a.providerUsername,
        providerAvatar: a.providerAvatar,
      })),
      createdAt: user.createdAt,
      lastUpdated: user.lastUpdated,
    };
  }

  /**
   * Find user by wallet address
   */
  static async findUserByWallet(address: Address, chainType: string = 'EVM') {
    const wallet = await prisma.wallet.findUnique({
      where: {
        address_chainType: {
          address: address.toLowerCase(),
          chainType,
        },
      },
      include: {
        user: true,
      },
    });

    return wallet?.user || null;
  }

  /**
   * Find user by social account
   */
  static async findUserBySocialAccount(provider: string, providerAccountId: string) {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    return account?.user || null;
  }

  /**
   * Create or get user from wallet address
   * Used for initial wallet connection
   */
  static async createOrGetUserFromWallet(address: Address): Promise<{ 
    user: {
      id: string;
      username: string | null;
      displayName: string | null;
      avatarUrl: string | null;
      bio: string | null;
      score: number;
      rank: number;
      tier: string;
      address: string | null;
      createdAt: Date;
      updatedAt: Date;
      lastUpdated: Date;
    }; 
    isNew: boolean 
  }> {
    // Check if wallet exists
    const existingWallet = await prisma.wallet.findUnique({
      where: {
        address_chainType: {
          address: address.toLowerCase(),
          chainType: 'EVM',
        },
      },
      include: { user: true },
    });

    if (existingWallet) {
      return { user: existingWallet.user, isNew: false };
    }

    // Create new user with this wallet as primary
    const user = await prisma.user.create({
      data: {
        wallets: {
          create: {
            address: address.toLowerCase(),
            chainType: 'EVM',
            isPrimary: true,
            verifiedAt: new Date(),
            verificationMethod: 'EIP712', // Initial connection
          },
        },
      },
      include: {
        wallets: true,
        accounts: true,
      },
    });

    return { user, isNew: true };
  }

  /**
   * Aggregate reputation across all linked wallets
   */
  static async aggregateReputation(userId: string): Promise<{ totalScore: number; tier: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Aggregate scores from all linked wallets
    // This would integrate with the PVC framework
    // For now, return user's current score
    return {
      totalScore: user.score,
      tier: user.tier,
    };
  }
}
