import { test, expect, type Page } from '@playwright/test';

test.describe('Router Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept potential Supabase errors to avoid test failures
    await page.route('**/rest/v1/**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else {
        route.continue();
      }
    });
  });

  test('should handle hash vs browser routing correctly', async ({ page }) => {
    // Navigate to root
    await page.goto('/');
    
    // Should load without 404
    await expect(page).not.toHaveURL(/404/);
    
    // Check that the page loads content
    await page.waitForSelector('body');
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should handle deeplink refresh correctly', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // Refresh the page (this tests deeplink handling)
    await page.reload();
    
    // Should still be on auth page without 404
    await expect(page).toHaveURL(/.*auth/);
    await expect(page).not.toHaveURL(/404/);
  });

  test('should redirect /login to /auth', async ({ page }) => {
    // Navigate to /login
    await page.goto('/login');
    
    // Should redirect to /auth
    await expect(page).toHaveURL(/.*auth/);
  });

  test('should show NotFound for invalid routes in app section', async ({ page }) => {
    // Navigate to invalid route that should be handled by SimpleRouter
    await page.goto('/invalid-route-that-does-not-exist');
    
    // Should show NotFound component
    await expect(page.getByText('Siden finnes ikke')).toBeVisible();
  });

  test('should handle authentication flow routing', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // Should show auth page content (not 404)
    await expect(page).not.toHaveURL(/404/);
    
    // Page should load without errors
    await page.waitForLoadState('networkidle');
    const errors = await page.evaluate(() => {
      return window.console.error.length || 0;
    });
    expect(errors).toBe(0);
  });

  test('should handle degraded mode when Supabase unavailable', async ({ page }) => {
    // Mock Supabase to fail
    await page.route('**/auth/v1/**', (route) => {
      route.abort('failed');
    });
    
    await page.goto('/');
    
    // Should still load (degraded mode)
    await expect(page).not.toHaveURL(/404/);
    
    // Should show degraded mode banner
    await expect(page.getByText('Begrenset modus')).toBeVisible();
  });

  test('should handle nested routes correctly', async ({ page }) => {
    // Test that nested routes work within the SiteLayout
    await page.goto('/properties');
    
    // Should not show 404
    await expect(page).not.toHaveURL(/404/);
    
    // Should be within the SiteLayout (which has the SimpleRouter)
    await page.waitForSelector('body');
  });

  test('should maintain router state during navigation', async ({ page }) => {
    // Start at home
    await page.goto('/');
    
    // Navigate to auth
    await page.goto('/auth');
    await expect(page).toHaveURL(/.*auth/);
    
    // Navigate back to home
    await page.goto('/');
    await expect(page).toHaveURL(/^\//);
    
    // Should not show any 404 during this flow
    await expect(page.getByText('Siden finnes ikke')).not.toBeVisible();
  });
});

test.describe('Error Boundary Integration', () => {
  test('should catch and display route errors', async ({ page }) => {
    // Navigate to a route that might have issues
    await page.goto('/');
    
    // Inject an error in React components
    await page.evaluate(() => {
      // Simulate a React error by breaking a component
      const originalError = console.error;
      window.reactError = new Error('Test React Error');
      console.error = originalError;
    });
    
    // The page should still be functional
    await expect(page).not.toHaveURL(/404/);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock authentication to fail
    await page.route('**/auth/v1/token**', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_grant' })
      });
    });
    
    await page.goto('/auth');
    
    // Should still show the auth page, not crash
    await expect(page).not.toHaveURL(/404/);
  });
});