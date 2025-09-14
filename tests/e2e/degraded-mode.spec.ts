import { test, expect } from '@playwright/test';

test.describe('Degraded Mode Tests', () => {
  test('should show degraded mode banner when Supabase is unavailable', async ({ page }) => {
    // Mock all Supabase requests to fail
    await page.route('**/auth/v1/**', (route) => route.abort('failed'));
    await page.route('**/rest/v1/**', (route) => route.abort('failed'));
    
    await page.goto('/');
    
    // Should still load the page
    await expect(page).not.toHaveURL(/404/);
    
    // Should show degraded mode banner
    await expect(page.getByText('Begrenset modus')).toBeVisible();
    await expect(page.getByText('Noen funksjoner er ikke tilgjengelige uten pålogging')).toBeVisible();
  });

  test('should not show degraded mode banner when Supabase is available', async ({ page }) => {
    // Mock successful Supabase responses
    await page.route('**/auth/v1/user', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null })
      });
    });
    
    await page.goto('/');
    
    // Should not show degraded mode banner
    await expect(page.getByText('Begrenset modus')).not.toBeVisible();
  });

  test('should handle authentication gracefully in degraded mode', async ({ page }) => {
    // Mock Supabase auth to fail
    await page.route('**/auth/v1/**', (route) => route.abort('failed'));
    
    await page.goto('/auth');
    
    // Should still show the auth page
    await expect(page).not.toHaveURL(/404/);
    
    // Should show degraded mode banner
    await expect(page.getByText('Begrenset modus')).toBeVisible();
  });

  test('should maintain functionality in degraded mode', async ({ page }) => {
    // Mock Supabase to be unavailable
    await page.route('**/rest/v1/**', (route) => route.abort('failed'));
    await page.route('**/auth/v1/**', (route) => route.abort('failed'));
    
    await page.goto('/');
    
    // Basic navigation should still work
    await page.goto('/auth');
    await expect(page).toHaveURL(/.*auth/);
    
    await page.goto('/');
    await expect(page).toHaveURL(/^\//);
    
    // Should show degraded mode banner throughout
    await expect(page.getByText('Begrenset modus')).toBeVisible();
  });

  test('should recover from degraded mode when connection restored', async ({ page }) => {
    // Start with failed Supabase
    await page.route('**/auth/v1/**', (route) => route.abort('failed'));
    
    await page.goto('/');
    
    // Should show degraded mode
    await expect(page.getByText('Begrenset modus')).toBeVisible();
    
    // "Restore" connection by removing route mock
    await page.unroute('**/auth/v1/**');
    
    // Mock successful response
    await page.route('**/auth/v1/user', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null })
      });
    });
    
    // Refresh to trigger re-initialization
    await page.reload();
    
    // Should no longer show degraded mode
    await expect(page.getByText('Begrenset modus')).not.toBeVisible();
  });
});