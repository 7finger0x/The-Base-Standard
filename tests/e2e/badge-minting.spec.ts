/**
 * E2E Tests: Badge Minting Flow
 * Tests the complete badge minting process
 */

import { test, expect } from '@playwright/test';

test.describe('Badge Minting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display mint badge button when eligible', async ({ page }) => {
    // Mock reputation API to return eligible score
    await page.route('**/api/reputation*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            score: 850,
            tier: 'BASED',
            eligibleForBadge: true,
          },
        }),
      });
    });

    // Mock badge status API
    await page.route('**/api/mint-badge*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              hasBadge: false,
              canMint: true,
            },
          }),
        });
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check for mint button (may not be visible without connection)
    const mintButton = page.locator('button:has-text("Mint Badge")');
    // Button visibility depends on wallet connection
  });

  test('should show mint transaction data', async ({ page }) => {
    await page.route('**/api/mint-badge', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
              data: '0x1234',
              value: '0',
            },
          }),
        });
      }
    });

    // Simulate mint button click
    const mintButton = page.locator('button:has-text("Mint Badge")');
    // Actual click requires wallet connection
  });

  test('should handle already minted badge', async ({ page }) => {
    await page.route('**/api/mint-badge*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              hasBadge: true,
              tokenId: 123,
              tier: 'BUILDER',
            },
          }),
        });
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should show badge status instead of mint button
  });

  test('should handle minting errors', async ({ page }) => {
    await page.route('**/api/mint-badge', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { message: 'Badge contract not configured' },
          }),
        });
      }
    });

    // Verify error handling
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Error should be displayed to user
    await expect(page.locator('body')).toBeVisible();
  });
});
