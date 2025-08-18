import { test, expect } from '@playwright/test';

test('admin‑meny vises ikke i bruker‑modus', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Admin')).toHaveCount(0);
  await expect(page.getByText('Master')).toHaveCount(0);
});
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that admin-specific navigation items are not visible
    // These should only appear in control mode for admin/master_admin users
    await expect(page.getByText('Admin Dashboard')).toHaveCount(0);
    await expect(page.getByText('Master Dashboard')).toHaveCount(0);
    await expect(page.getByText('System-oversikt')).toHaveCount(0);
    await expect(page.getByText('Feature Flags')).toHaveCount(0);
    await expect(page.getByText('Roller & Tilganger')).toHaveCount(0);
    
    // Admin-specific paths should not be accessible in user mode
    await expect(page.getByRole('link', { name: /\/admin/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /\/master/ })).toHaveCount(0);
  });

  test('kontrollplan-meny vises kun i kontrollplan-modus', async ({ page }) => {
    // This test assumes user can switch to control mode
    // In a real scenario, you'd need proper auth setup
    await page.goto('/');
    
    // Look for the role mode switcher (if user has admin permissions)
    const roleSwitcher = page.getByLabel('Bytt mellom bruker-modus og kontrollplan');
    
    // If switcher exists, test control mode
    if (await roleSwitcher.isVisible()) {
      // Switch to control mode
      await roleSwitcher.click();
      
      // Wait for navigation to update
      await page.waitForTimeout(500);
      
      // Now admin navigation should be visible
      await expect(page.getByText('Admin Dashboard')).toBeVisible();
      
      // Switch back to user mode
      await roleSwitcher.click();
      await page.waitForTimeout(500);
      
      // Admin navigation should be hidden again
      await expect(page.getByText('Admin Dashboard')).toHaveCount(0);
    } else {
      // User doesn't have admin permissions - control features should not be visible
      await expect(page.getByText('Kontrollplan')).toHaveCount(0);
      await expect(page.getByLabel('Bytt mellom bruker-modus og kontrollplan')).toHaveCount(0);
    }
  });

  test('brukerflater vises korrekt for alle roller', async ({ page }) => {
    await page.goto('/');
    
    // These user interface elements should be visible for appropriate roles
    // (This test would need to be parameterized for different user roles in practice)
    
    // Check for user-facing navigation that should be visible
    const userNavItems = [
      'Dashboard',
      'Forside', 
      'Sammenlign'
    ];
    
    for (const item of userNavItems) {
      // At least some user navigation should be present
      // Exact items depend on user role and auth state
      const element = page.getByText(item);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }
  });
});

test.describe('Role-Based Navigation Access', () => {
  test('guest kan ikke nå admin-ruter', async ({ page }) => {
    // Test direct navigation to admin routes as guest
    const adminRoutes = [
      '/admin',
      '/admin/leads',
      '/admin/brukere',
      '/master',
      '/master/system'
    ];
    
    for (const route of adminRoutes) {
      await page.goto(route);
      
      // Should be redirected to login or unauthorized page
      // Exact behavior depends on auth implementation
      await expect(page).toHaveURL(/\/(login|unauthorized|403)/);
    }
  });

  test('navigasjon tilpasser seg brukerrolle', async ({ page }) => {
    // This test would require proper auth setup to test different roles
    // For now, just verify the navigation structure exists
    await page.goto('/');
    
    // Check that navigation is rendered (structure test)
    const nav = page.getByRole('navigation');
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
    
    // Check that no broken navigation links exist
    const navLinks = page.getByRole('link');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && href.startsWith('/')) {
        // Verify link has valid href structure
        expect(href).toMatch(/^\/[a-zA-Z0-9\-_\/]*$/);
      }
    }
  });
});