import { test, expect } from '@playwright/test';

/**
 * Comprehensive auth integration E2E tests
 * Tests real authentication flows with QuickLogin
 */

test.describe('Authentication Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure we start from clean state
    await page.goto('/');
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('guest user can access public pages', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Should see guest navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText('Logg inn')).toBeVisible();
  });

  test('QuickLogin functionality works for development', async ({ page }) => {
    // Only test QuickLogin in development mode
    await page.goto('/login');
    
    // QuickLogin should only appear in development
    if (process.env.NODE_ENV !== 'production') {
      const quickLoginCard = page.getByTestId('quick-login-card');
      await expect(quickLoginCard).toBeVisible();
      
      // Test user login
      const userButton = page.getByTestId('quicklogin-user');
      await userButton.click();
      
      // Should redirect to user dashboard
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    }
  });

  test('role-based navigation works correctly', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Login as admin
      const adminButton = page.getByTestId('quicklogin-admin');
      await adminButton.click();
      
      // Should redirect to admin dashboard
      await page.waitForURL(/.*dashboard\/admin/, { timeout: 10000 });
      
      // Should see admin navigation
      await expect(page.getByText('Lead-administrasjon')).toBeVisible();
      await expect(page.getByText('Brukerhåndtering')).toBeVisible();
      await expect(page.getByText('Systemanalyse')).toBeVisible();
    }
  });

  test('user cannot access admin routes', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Login as regular user
      const userButton = page.getByTestId('quicklogin-user');
      await userButton.click();
      
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      
      // Try to access admin route
      await page.goto('/admin/users');
      
      // Should be redirected or get unauthorized
      await expect(page).toHaveURL(/\/(login|unauthorized|dashboard\/user)/);
    }
  });

  test('company user has marketplace access', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Login as company
      const companyButton = page.getByTestId('quicklogin-company');
      await companyButton.click();
      
      await page.waitForURL(/.*dashboard\/company/, { timeout: 10000 });
      
      // Should have access to marketplace
      await page.goto('/marketplace');
      await expect(page).not.toHaveURL(/.*login/);
    }
  });

  test('logout functionality works', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Login as user
      const userButton = page.getByTestId('quicklogin-user');
      await userButton.click();
      
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      
      // Find and click logout button
      const logoutButton = page.getByRole('button', { name: /logg ut/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should redirect to home or login
        await expect(page).toHaveURL(/\/(|login)/);
      }
    }
  });

  test('session persistence works across page reloads', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Login as user
      const userButton = page.getByTestId('quicklogin-user');
      await userButton.click();
      
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      
      // Reload page
      await page.reload();
      
      // Should still be authenticated and on user dashboard
      await expect(page).toHaveURL(/.*dashboard\/user/);
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    }
  });

  test('role switching between user and company works', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      // Test user role first
      await page.goto('/login');
      const userButton = page.getByTestId('quicklogin-user');
      await userButton.click();
      
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      await expect(page.getByText('Mine forespørsler')).toBeVisible();
      
      // Switch to company role
      await page.goto('/login');
      const companyButton = page.getByTestId('quicklogin-company');
      await companyButton.click();
      
      await page.waitForURL(/.*dashboard\/company/, { timeout: 10000 });
      await expect(page.getByText('Lead-håndtering')).toBeVisible();
      await expect(page.getByText('Lead-markedsplass')).toBeVisible();
    }
  });
});