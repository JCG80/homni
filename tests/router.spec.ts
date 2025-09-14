import { test, expect, type Page } from '@playwright/test';

test.describe('Legacy Router Tests (Updated)', () => {
  test('should handle deeplink refresh correctly', async ({ page }: { page: Page }) => {
    // Navigate to root
    await page.goto('/');
    
    // Navigate to auth page (valid route) 
    await page.goto('/auth');
    
    // Refresh the page (this tests deeplink handling)
    await page.reload();
    
    // Should still be on auth page without 404
    await expect(page).toHaveURL(/.*auth/);
    await expect(page).not.toHaveURL(/404/);
  });

  test('login route should redirect to auth', async ({ page }: { page: Page }) => {
    // Direct access to login page
    await page.goto('/login');
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/.*auth/);
    
    // Refresh should still work
    await page.reload();
    await expect(page).toHaveURL(/.*auth/);
  });

  test('should handle routing correctly', async ({ page }: { page: Page }) => {
    // Navigate to root
    await page.goto('/');
    
    // Basic navigation should work regardless of router type
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Should not show 404
    await expect(page).not.toHaveURL(/404/);
  });

  test('should handle invalid routes with NotFound', async ({ page }: { page: Page }) => {
    // Navigate to invalid route
    await page.goto('/invalid-route-12345');
    
    // Should show NotFound component
    await expect(page.getByText('Siden finnes ikke')).toBeVisible();
  });
});