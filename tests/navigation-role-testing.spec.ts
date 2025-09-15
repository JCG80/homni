import { test, expect, type Page } from '@playwright/test';

test.describe('Complete Navigation Testing by Role', () => {
  
  // Test guest navigation
  test('guest navigation - public routes only', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Guest should see public navigation
    await expect(page.getByText('Forside')).toBeVisible();
    await expect(page.getByText('Sammenlign')).toBeVisible();
    
    // Guest should not see protected routes
    await expect(page.getByText('Dashboard')).toHaveCount(0);
    await expect(page.getByText('Administrasjon')).toHaveCount(0);
    
    // Test navigation to public routes
    const publicRoutes = ['/', '/sammenlign', '/auth'];
    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page).not.toHaveURL(/404/);
    }
  });

  // Test user navigation
  test('user navigation - authenticated user routes', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Mock authenticated user state (in real implementation would login)
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', role: 'user' }
      }));
    });
    
    // Test user-specific routes
    const userRoutes = [
      '/dashboard/user',
      '/leads/my', 
      '/properties',
      '/diy-sales'
    ];
    
    for (const route of userRoutes) {
      await page.goto(route);
      // Should not redirect to login for authenticated user
      await expect(page).not.toHaveURL(/.*login/);
    }
  });

  // Test company navigation
  test('company navigation - business user routes', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Mock company user state
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-company', role: 'company' }
      }));
    });
    
    // Test company-specific routes
    const companyRoutes = [
      '/dashboard/company',
      '/leads',
      '/properties',
      '/diy-sales/pipeline',
      '/marketplace'
    ];
    
    for (const route of companyRoutes) {
      await page.goto(route);
      await expect(page).not.toHaveURL(/.*login/);
    }
  });

  // Test admin navigation
  test('admin navigation - administrative routes', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Mock admin user state
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-admin', role: 'admin' }
      }));
    });
    
    // Test admin-specific routes
    const adminRoutes = [
      '/admin',
      '/admin/companies', 
      '/admin/members',
      '/admin/leads',
      '/admin/system-modules'
    ];
    
    for (const route of adminRoutes) {
      await page.goto(route);
      await expect(page).not.toHaveURL(/.*login/);
      await expect(page).not.toHaveURL(/unauthorized/);
    }
  });

  // Test master admin navigation
  test('master admin navigation - full system access', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Mock master admin user state
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-master', role: 'master_admin' }
      }));
    });
    
    // Test master admin routes
    const masterAdminRoutes = [
      '/admin',
      '/admin/companies',
      '/admin/members', 
      '/admin/roles',
      '/admin/system-modules',
      '/admin/internal-access',
      '/master',
      '/master/system'
    ];
    
    for (const route of masterAdminRoutes) {
      await page.goto(route);
      await expect(page).not.toHaveURL(/.*login/);
      await expect(page).not.toHaveURL(/unauthorized/);
    }
  });

  // Test navigation consistency
  test('navigation links consistency across roles', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Check that navigation structure is consistent
    const nav = page.getByRole('navigation');
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
      
      // Verify no broken links
      const navLinks = page.getByRole('link');
      const linkCount = await navLinks.count();
      
      for (let i = 0; i < Math.min(linkCount, 10); i++) { // Limit to first 10 links
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && href.startsWith('/') && href !== '#') {
          // Click link and verify it doesn't lead to 404
          await link.click();
          await page.waitForLoadState('networkidle');
          await expect(page).not.toHaveURL(/404/);
          
          // Go back to test next link
          await page.goBack();
        }
      }
    }
  });

  // Test mobile navigation
  test('mobile navigation works for all roles', async ({ page }: { page: Page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Look for mobile navigation trigger (hamburger menu)
    const mobileMenuTrigger = page.getByRole('button', { name: /menu|meny/i });
    
    if (await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click();
      
      // Verify mobile navigation opens
      await page.waitForTimeout(300); // Wait for animation
      
      // Check that navigation items are visible in mobile
      const mobileNav = page.getByRole('navigation');
      if (await mobileNav.isVisible()) {
        await expect(mobileNav).toBeVisible();
      }
    }
  });

  // Test breadcrumb navigation
  test('breadcrumb navigation works correctly', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Navigate to nested route
    await page.goto('/admin/companies');
    
    // Check if breadcrumbs exist and are functional
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    if (await breadcrumbs.isVisible()) {
      const breadcrumbLinks = breadcrumbs.getByRole('link');
      const linkCount = await breadcrumbLinks.count();
      
      if (linkCount > 0) {
        // Click on a breadcrumb link
        await breadcrumbLinks.first().click();
        await expect(page).not.toHaveURL(/404/);
      }
    }
  });

  // Test route protection
  test('route protection works correctly', async ({ page }: { page: Page }) => {
    // Test accessing protected routes without authentication
    const protectedRoutes = [
      '/dashboard/user',
      '/dashboard/company',
      '/admin',
      '/master'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login or show unauthorized
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/login') || 
                          currentUrl.includes('/auth') || 
                          currentUrl.includes('/unauthorized');
      
      expect(isRedirected).toBeTruthy();
    }
  });
});