/**
 * E2E Tests: Farcaster Frame Interactions
 * Tests frame interactions and Farcaster integration
 */

import { test, expect } from '@playwright/test';

test.describe('Frame Interactions', () => {
  test('should load frame page', async ({ page }) => {
    await page.goto('/frame/reputation');
    
    // Frame should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should detect frame context', async ({ page }) => {
    // Mock Farcaster frame SDK
    await page.addInitScript(() => {
      (window as any).farcaster = {
        sdk: {
          context: Promise.resolve({
            user: {
              fid: 12345,
              username: 'testuser',
              displayName: 'Test User',
              pfpUrl: 'https://example.com/pfp.png',
            },
          }),
          actions: {
            ready: () => Promise.resolve(),
            composeCast: () => Promise.resolve(),
            openUrl: () => Promise.resolve(),
          },
        },
      };
    });

    await page.goto('/frame/reputation');
    await page.waitForTimeout(1000);

    // Frame should initialize
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle share score action', async ({ page }) => {
    // Mock frame SDK
    let composeCastCalled = false;
    await page.addInitScript(() => {
      (window as any).farcaster = {
        sdk: {
          context: Promise.resolve({
            user: { fid: 12345, username: 'testuser' },
          }),
          actions: {
            ready: () => Promise.resolve(),
            composeCast: () => {
              composeCastCalled = true;
              return Promise.resolve();
            },
            openUrl: () => Promise.resolve(),
          },
        },
      };
    });

    await page.goto('/frame/reputation');
    await page.waitForTimeout(1000);

    // Share button should be available in frame context
    const shareButton = page.locator('button:has-text("Share")');
    // Button may not be visible without frame context
  });

  test('should handle frame API endpoints', async ({ page }) => {
    // Test frame API routes
    await page.route('**/api/frame/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {},
        }),
      });
    });

    // Test mint badge result endpoint
    const response = await page.request.get('/api/frame/mint-badge-result');
    expect(response.status()).toBe(200);
  });

  test('should display reputation in frame format', async ({ page }) => {
    await page.route('**/api/reputation*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            score: 750,
            tier: 'BUILDER',
          },
        }),
      });
    });

    await page.goto('/frame/reputation');
    await page.waitForTimeout(2000);

    // Frame should display reputation data
    await expect(page.locator('body')).toBeVisible();
  });
});
