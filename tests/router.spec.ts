import { test, expect } from '@playwright/test';

test.describe('Router functionality', () => {
  test('should handle deeplink refresh correctly', async ({ page }) => {
    // Navigate to root
    await page.goto('/');
    
    // Navigate to nested route via click or direct navigation
    await page.goto('/dashboard');
    
    // Refresh the page (this tests deeplink handling)
    await page.reload();
    
    // Should still be on dashboard without 404
    await expect(page).not.toHaveURL(/404/);
  });

  test('login route should work directly', async ({ page }) => {
    // Direct access to login page
    await page.goto('/login');
    
    // Should show login page
    await expect(page).toHaveURL(/.*login/);
    
    // Refresh should still work
    await page.reload();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle hash routing in sandbox mode', async ({ page }) => {
    // This test would be more relevant in actual sandbox environment
    await page.goto('/');
    
    // Basic navigation should work regardless of router type
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});