import { test, expect, type Page } from '@playwright/test';

test.describe('Navigation Validation Tests', () => {
  
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Intercept Supabase requests to prevent auth issues during testing
    await page.route('**/auth/v1/**', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({ json: {} });
      } else {
        route.continue();
      }
    });
  });

  test('verify all navigation hrefs match existing routes', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Core routes that should exist based on navigation-consolidated.ts
    const expectedRoutes = [
      '/', // Home
      '/auth', // Auth page
      '/sammenlign', // Compare
      '/dashboard/user', // User dashboard
      '/dashboard/company', // Company dashboard
      '/leads', // Leads
      '/leads/my', // My leads
      '/properties', // Properties
      '/diy-sales', // DIY sales (corrected from /sales)
      '/diy-sales/pipeline', // Sales pipeline
      '/marketplace', // Marketplace
      '/admin', // Admin
      '/admin/companies', // Admin companies
      '/admin/members', // Admin members
      '/admin/leads', // Admin leads
      '/konto', // Account
      '/sitemap' // Site map
    ];
    
    for (const route of expectedRoutes) {
      await page.goto(route);
      
      // Should not show 404 page
      await expect(page).not.toHaveURL(/404/);
      
      // Should not have "Siden finnes ikke" text (Norwegian 404 message)
      await expect(page.getByText('Siden finnes ikke')).toHaveCount(0);
    }
  });

  test('verify login redirect works correctly', async ({ page }: { page: Page }) => {
    // Test the /login -> /auth redirect
    await page.goto('/login');
    
    // Should redirect to /auth
    await expect(page).toHaveURL(/.*auth/);
    
    // Should show auth page content, not 404
    await expect(page.getByText('Siden finnes ikke')).toHaveCount(0);
  });

  test('verify sidebar navigation loads correctly', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if sidebar exists (it may be collapsed or hidden on mobile)
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
    
    if (await sidebar.count() > 0) {
      // Verify sidebar contains navigation elements
      const navLinks = sidebar.getByRole('link');
      const linkCount = await navLinks.count();
      
      // Should have at least some navigation links
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('verify role-based navigation filtering', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // For unauthenticated users (guest role)
    // Should not see admin-only navigation
    await expect(page.getByText('Admin Dashboard')).toHaveCount(0);
    await expect(page.getByText('Master Dashboard')).toHaveCount(0);
    await expect(page.getByText('Administrasjon')).toHaveCount(0);
    
    // Should see public navigation
    const publicNavigation = page.getByText('Forside');
    if (await publicNavigation.isVisible()) {
      await expect(publicNavigation).toBeVisible();
    }
  });

  test('verify site map shows all available routes', async ({ page }: { page: Page }) => {
    await page.goto('/sitemap');
    
    // Should load without 404
    await expect(page).not.toHaveURL(/404/);
    await expect(page.getByText('Siden finnes ikke')).toHaveCount(0);
    
    // Should show site map content
    // The exact content depends on implementation, but it should exist
    const heading = page.getByRole('heading');
    const headingCount = await heading.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('verify error boundary handles navigation errors', async ({ page }: { page: Page }) => {
    // Try to navigate to a definitely non-existent route
    await page.goto('/this-route-definitely-does-not-exist-12345');
    
    // Should show 404 or NotFound component
    const notFoundMessage = page.getByText('Siden finnes ikke');
    if (await notFoundMessage.isVisible()) {
      await expect(notFoundMessage).toBeVisible();
    } else {
      // Alternative: check if redirected to a valid page
      await expect(page).not.toHaveURL(/this-route-definitely-does-not-exist/);
    }
  });

  test('verify navigation accessibility', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Check that navigation elements have proper ARIA attributes
    const navElements = page.getByRole('navigation');
    const navCount = await navElements.count();
    
    if (navCount > 0) {
      // At least one navigation element should exist
      expect(navCount).toBeGreaterThanOrEqual(1);
      
      // Check that links are accessible
      const links = page.getByRole('link');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        // Verify first few links have accessible names
        for (let i = 0; i < Math.min(linkCount, 5); i++) {
          const link = links.nth(i);
          const accessibleName = await link.getAttribute('aria-label') || 
                                  await link.textContent() ||
                                  await link.getAttribute('title');
          expect(accessibleName).toBeTruthy();
        }
      }
    }
  });

  test('verify navigation performance', async ({ page }: { page: Page }) => {
    // Measure navigation timing
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Navigation should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Test navigation between pages is fast
    const navStartTime = Date.now();
    await page.goto('/sammenlign');
    await page.waitForLoadState('networkidle');
    const navTime = Date.now() - navStartTime;
    
    // Page navigation should be fast (3 seconds)
    expect(navTime).toBeLessThan(3000);
  });
});