
import { test, expect } from '@playwright/test';

test.describe('Quick Login Flow', () => {
  test('should allow login as any user from the QuickLogin component', async ({ page }) => {
    // Visit the login page
    await page.goto('/login');
    
    // Wait for the page to load
    await page.waitForSelector('text=Sikker innlogging');

    // Check that we're on the login page
    await expect(page.getByRole('heading', { level: 1, name: /logg inn/i })).toBeVisible();
    
    // Click the Quick Login dropdown trigger
    const quickLoginTrigger = page.locator('data-test-id=quick-login-trigger');
    await expect(quickLoginTrigger).toBeVisible();
    await quickLoginTrigger.click();
    
    // Wait for the dropdown to load users
    await page.waitForTimeout(1000); // Allow time for users to load
    
    // Find and click the first user in the dropdown
    const firstUserItem = page.locator('data-test-id=quick-login-user-*').first();
    await expect(firstUserItem).toBeVisible({ timeout: 10000 });
    
    // Get user info before clicking (we'll verify this after login)
    const userName = await firstUserItem.textContent();
    console.log(`Selected user: ${userName}`);
    
    // Click to login as this user
    await firstUserItem.click();
    
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
  
  test('should allow searching for users in QuickLogin', async ({ page }) => {
    // Visit the login page
    await page.goto('/login');
    
    // Wait for the page to load
    await page.waitForSelector('text=Sikker innlogging');
    
    // Click the Quick Login dropdown trigger
    const quickLoginTrigger = page.locator('data-test-id=quick-login-trigger');
    await quickLoginTrigger.click();
    
    // Wait for the dropdown to open
    await page.waitForSelector('data-test-id=quick-login-search');
    
    // Enter a search term (assuming there's an admin user)
    await page.locator('data-test-id=quick-login-search').fill('admin');
    
    // Check that the search results are filtered
    await expect(page.getByText(/admin/i)).toBeVisible();
    
    // Clear the search and try another term
    await page.locator('data-test-id=quick-login-search').fill('');
    await page.locator('data-test-id=quick-login-search').fill('member');
    
    // Check that the search results are updated
    await expect(page.getByText(/member/i)).toBeVisible();
  });

  test('should redirect to appropriate dashboard after login', async ({ page }) => {
    // Visit the login page
    await page.goto('/login');
    
    // Click the Quick Login dropdown trigger
    const quickLoginTrigger = page.locator('data-test-id=quick-login-trigger');
    await quickLoginTrigger.click();
    
    // Find and click an admin user
    const adminUser = page.getByText(/admin/i).first();
    await adminUser.click();
    
    // Wait for redirection to admin dashboard
    await page.waitForURL(/.*dashboard.*admin.*/);
    
    // Verify admin-specific UI elements
    await expect(page.getByText(/admin dashboard|administration/i)).toBeVisible({ timeout: 5000 });
    
    // Now go back to login page and try with a different role
    await page.goto('/login');
    
    // Click the Quick Login dropdown trigger again
    await quickLoginTrigger.click();
    
    // Find and click a member user
    const memberUser = page.getByText(/member/i).first();
    await memberUser.click();
    
    // Wait for redirection to member dashboard
    await page.waitForURL(/.*dashboard.*member.*/);
    
    // Verify member-specific UI elements
    await expect(page.getByText(/member dashboard|user dashboard/i)).toBeVisible({ timeout: 5000 });
  });
});
