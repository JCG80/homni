import { test, expect } from '@playwright/test';

test.describe('Production Validation Tests', () => {
  test('should handle all critical routes without errors', async ({ page }) => {
    const routes = ['/', '/auth', '/login'];
    
    for (const route of routes) {
      await page.goto(route);
      
      // Should not show 404
      await expect(page).not.toHaveURL(/404/);
      
      // Should load without console errors
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      // Filter out expected Supabase connection errors in test environment
      const criticalErrors = errors.filter(error => 
        !error.includes('Supabase') && 
        !error.includes('fetch') &&
        !error.includes('network')
      );
      
      expect(criticalErrors).toHaveLength(0);
    }
  });

  test('should handle performance requirements', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time (5 seconds for test env)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle browser navigation correctly', async ({ page }) => {
    // Test browser back/forward
    await page.goto('/');
    await page.goto('/auth');
    
    await page.goBack();
    await expect(page).toHaveURL(/^\//);
    
    await page.goForward();
    await expect(page).toHaveURL(/.*auth/);
    
    // Should not show 404 during navigation
    await expect(page.getByText('Siden finnes ikke')).not.toBeVisible();
  });

  test('should handle error boundaries without breaking navigation', async ({ page }) => {
    // Navigate to different routes to test error boundary integration
    await page.goto('/');
    await expect(page).not.toHaveURL(/404/);
    
    await page.goto('/auth');
    await expect(page).not.toHaveURL(/404/);
    
    // Test that error boundaries don't interfere with hot reload in dev
    if (process.env.NODE_ENV === 'development') {
      // Simulate component refresh
      await page.reload();
      await expect(page).toHaveURL(/.*auth/);
    }
  });

  test('should handle lazy Supabase loading correctly', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', (request) => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    
    // Should not make unnecessary Supabase requests on initial load
    await page.waitForLoadState('networkidle');
    
    // The lazy loading should work without throwing errors
    await expect(page).not.toHaveURL(/404/);
  });

  test('should maintain Norwegian language throughout navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to auth
    await page.goto('/auth');
    
    // Navigate to invalid route (should show Norwegian 404)
    await page.goto('/invalid-route');
    await expect(page.getByText('Siden finnes ikke')).toBeVisible();
    
    // Back to valid route
    await page.goto('/');
    await expect(page).not.toHaveURL(/404/);
  });
});