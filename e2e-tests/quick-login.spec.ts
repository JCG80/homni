
import { test, expect } from '@playwright/test';

test.describe('Quick Login Flow', () => {
  test('should allow login as any user from the QuickLogin component', async ({ page }) => {
    // Visit the login page
    await page.goto('/login');
    
    // Wait for the page to load
    await page.waitForSelector('text=Sikker innlogging');

    // Check that we're on the login page
    await expect(page.getByRole('heading', { level: 1, name: /logg inn/i })).toBeVisible();
    
    // Look for the UnifiedQuickLogin card
    const quickLoginCard = page.locator('[data-test-id="quick-login-card"]');
    await expect(quickLoginCard).toBeVisible();
    
    // Wait for the card to load
    await page.waitForTimeout(1000);
    
    // Find and click the first user button (user role)
    const firstUserButton = page.locator('[data-test-id="quick-login-user-user"]').first();
    await expect(firstUserButton).toBeVisible({ timeout: 10000 });
    
    // Get user info before clicking (we'll verify this after login)
    const userName = await firstUserButton.textContent();
    console.log(`Selected user: ${userName}`);
    
    // Click to login as this user
    await firstUserButton.click();
    
    // Wait for redirection to dashboard
    await page.waitForURL(/.*dashboard.*/);
    
    // Verify we are on a dashboard page
    await expect(page.url()).toMatch(/dashboard/);
    
    // Verify some dashboard content is visible
    await expect(page.getByText(/velkommen/i)).toBeVisible({ timeout: 5000 });
    
    // Verify user info is displayed in the UI somewhere (adjust selector as needed)
    const userInfo = page.locator('.user-info, [data-testid="user-info"]').first();
    if (await userInfo.isVisible()) {
      const displayedUsername = await userInfo.textContent();
      console.log(`Displayed user: ${displayedUsername}`);
      // Partial match is fine since we might display only part of the info
      expect(userName).toContain(displayedUsername) || expect(displayedUsername).toContain(userName);
    }
  });
  
  test('should show different role buttons in QuickLogin', async ({ page }) => {
    // Visit the login page
    await page.goto('/login');
    
    // Wait for the page to load
    await page.waitForSelector('text=Sikker innlogging');
    
    // Look for the UnifiedQuickLogin card
    const quickLoginCard = page.locator('[data-test-id="quick-login-card"]');
    await expect(quickLoginCard).toBeVisible();
    
    // Check that different role buttons are visible
    await expect(page.locator('[data-test-id="quick-login-user-admin"]')).toBeVisible();
    await expect(page.locator('[data-test-id="quick-login-user-user"]')).toBeVisible();
    await expect(page.locator('[data-test-id="quick-login-user-company"]')).toBeVisible();
    await expect(page.locator('[data-test-id="quick-login-user-master_admin"]')).toBeVisible();
    
    // Test clicking different role buttons
    const adminButton = page.locator('[data-test-id="quick-login-user-admin"]');
    await expect(adminButton).toBeVisible();
    await expect(adminButton.getByText('Admin')).toBeVisible();
  });

  test('should redirect to appropriate dashboard after login', async ({ page }) => {
    // Visit the login page
    await page.goto('/login');
    
    // Look for the UnifiedQuickLogin card
    const quickLoginCard = page.locator('[data-test-id="quick-login-card"]');
    await expect(quickLoginCard).toBeVisible();
    
    // Find and click the admin user button
    const adminButton = page.locator('[data-test-id="quick-login-user-admin"]');
    await adminButton.click();
    
    // Wait for redirection to admin dashboard
    await page.waitForURL(/.*dashboard.*admin.*/);
    
    // Verify admin-specific UI elements
    await expect(page.getByText(/admin dashboard|administration/i)).toBeVisible({ timeout: 5000 });
    
    // Now go back to login page and try with a different role
    await page.goto('/login');
    
    // Wait for the card to load again
    await expect(quickLoginCard).toBeVisible();
    
    // Find and click a regular user button
    const userButton = page.locator('[data-test-id="quick-login-user-user"]');
    await userButton.click();
    
    // Wait for redirection to user dashboard
    await page.waitForURL(/.*dashboard$/);
    
    // Verify user-specific UI elements
    await expect(page.getByText(/dashboard|velkommen/i)).toBeVisible({ timeout: 5000 });
  });
});
