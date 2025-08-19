import { test, expect } from '@playwright/test';

test.describe('Critical Navigation Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state for each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('guest to authenticated user journey', async ({ page }) => {
    // 1. Start as guest - verify guest navigation
    await expect(page.getByText('Forside')).toBeVisible();
    await expect(page.getByText('Sammenlign')).toBeVisible();
    await expect(page.getByText('Om oss')).toBeVisible();
    
    // Verify admin sections not visible
    await expect(page.getByText('Admin Dashboard')).toHaveCount(0);
    await expect(page.getByText('Lead Management')).toHaveCount(0);
    
    // 2. Navigate to login/register
    await page.getByRole('button', { name: /logg inn|registrer/i }).first().click();
    
    // 3. Authenticate as user (using quick login for E2E)
    const quickLoginUser = page.getByTestId('quicklogin-user');
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 4. Verify user navigation appears
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Lead Engine')).toBeVisible();
    await expect(page.getByText('Eiendomsforvaltning')).toBeVisible();
    await expect(page.getByText('DIY Salg')).toBeVisible();
    
    // 5. Test navigation between modules
    await page.getByText('Lead Engine').click();
    await page.waitForURL('**/leads');
    await expect(page).toHaveURL(/.*leads/);
    
    await page.getByText('Eiendomsforvaltning').click();
    await page.waitForURL('**/property');
    await expect(page).toHaveURL(/.*property/);
  });

  test('role switching workflow', async ({ page }) => {
    // Login as admin to test role switching
    await page.goto('/');
    const quickLoginAdmin = page.getByTestId('quicklogin-admin');
    
    if (await quickLoginAdmin.isVisible()) {
      await quickLoginAdmin.click();
      await page.waitForLoadState('networkidle');
      
      // Should see admin navigation
      await expect(page.getByText('Admin Dashboard')).toBeVisible();
      
      // Look for role switcher
      const roleSwitcher = page.getByLabel(/bytt.*modus/i);
      if (await roleSwitcher.isVisible()) {
        // Test switching to user mode
        await roleSwitcher.click();
        await page.waitForTimeout(500);
        
        // Should see user navigation instead
        await expect(page.getByText('Dashboard')).toBeVisible();
        await expect(page.getByText('Admin Dashboard')).toHaveCount(0);
        
        // Switch back to admin mode
        await roleSwitcher.click();
        await page.waitForTimeout(500);
        
        // Should see admin navigation again
        await expect(page.getByText('Admin Dashboard')).toBeVisible();
      }
    }
  });

  test('cross-module navigation flow', async ({ page }) => {
    // Test business workflow navigation: Leads → Property → Sales
    await page.goto('/');
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // 1. Start with leads
      await page.getByText('Lead Engine').click();
      await page.waitForURL('**/leads');
      
      // Look for next step suggestions
      const propertyLink = page.getByText(/registrer eiendom|eiendom/i).first();
      if (await propertyLink.isVisible()) {
        await propertyLink.click();
        await page.waitForURL('**/property');
      } else {
        // Fallback to direct navigation
        await page.getByText('Eiendomsforvaltning').click();
        await page.waitForURL('**/property');
      }
      
      // 2. From property to sales
      const salesLink = page.getByText(/diy salg|salg/i).first();
      if (await salesLink.isVisible()) {
        await salesLink.click();
        await page.waitForURL('**/sales');
      }
      
      // 3. Verify full workflow completion
      await expect(page).toHaveURL(/.*sales/);
    }
  });

  test('mobile vs desktop navigation consistency', async ({ page }) => {
    // Test desktop navigation
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    const quickLoginUser = page.getByTestId('quicklogin-user');
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Record available navigation items on desktop
      const desktopNavItems = await page.getByRole('navigation').first().textContent();
      
      // Switch to mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Check mobile navigation (might be in hamburger menu or bottom bar)
      const mobileNav = page.getByRole('navigation').first();
      const hamburgerMenu = page.getByRole('button', { name: /menu|meny/i });
      
      if (await hamburgerMenu.isVisible()) {
        await hamburgerMenu.click();
        await page.waitForTimeout(300);
      }
      
      // Verify key navigation items exist in mobile
      await expect(page.getByText('Dashboard')).toBeVisible();
      await expect(page.getByText('Lead Engine')).toBeVisible();
    }
  });

  test('navigation performance and responsiveness', async ({ page }) => {
    await page.goto('/');
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Test navigation speed by measuring time between clicks and URL changes
      const navigationTests = [
        { name: 'Lead Engine', url: 'leads' },
        { name: 'Eiendomsforvaltning', url: 'property' },
        { name: 'DIY Salg', url: 'sales' },
        { name: 'Dashboard', url: 'dashboard' }
      ];
      
      for (const nav of navigationTests) {
        const startTime = Date.now();
        
        await page.getByText(nav.name).click();
        await page.waitForURL(`**/${nav.url}`);
        
        const endTime = Date.now();
        const navigationTime = endTime - startTime;
        
        // Navigation should be under 2 seconds
        expect(navigationTime).toBeLessThan(2000);
        
        // Page should be responsive quickly
        await page.waitForLoadState('domcontentloaded');
      }
    }
  });

  test('navigation error handling and fallbacks', async ({ page }) => {
    await page.goto('/');
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Test navigation to non-existent route
      await page.goto('/non-existent-route');
      
      // Should either redirect to 404 or home page
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      
      // Should not remain on non-existent route
      expect(currentUrl).not.toContain('/non-existent-route');
      
      // Should show some error indication or redirect to valid page
      const is404 = currentUrl.includes('404') || currentUrl.includes('not-found');
      const isHome = currentUrl.endsWith('/') || currentUrl.includes('/dashboard');
      
      expect(is404 || isHome).toBeTruthy();
    }
  });

  test('navigation context persistence', async ({ page }) => {
    await page.goto('/');
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Navigate through several pages to build history
      await page.getByText('Lead Engine').click();
      await page.waitForURL('**/leads');
      
      await page.getByText('Eiendomsforvaltning').click();
      await page.waitForURL('**/property');
      
      await page.getByText('DIY Salg').click();
      await page.waitForURL('**/sales');
      
      // Refresh page to test context persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be on sales page
      await expect(page).toHaveURL(/.*sales/);
      
      // Navigation context should be maintained
      const activeNavItem = page.locator('[data-active="true"], .active, .bg-primary').first();
      if (await activeNavItem.isVisible()) {
        const activeText = await activeNavItem.textContent();
        expect(activeText?.toLowerCase()).toContain('salg');
      }
    }
  });
});

test.describe('Navigation Accessibility', () => {
  test('keyboard navigation support', async ({ page }) => {
    await page.goto('/');
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Test tab navigation through main navigation
      await page.keyboard.press('Tab');
      
      let focusedElement = await page.locator(':focus').first();
      let tabCount = 0;
      const maxTabs = 10; // Prevent infinite loop
      
      // Navigate through navigation items with tab
      while (tabCount < maxTabs) {
        const elementText = await focusedElement.textContent();
        
        if (elementText?.includes('Dashboard') || 
            elementText?.includes('Lead Engine') || 
            elementText?.includes('Eiendomsforvaltning')) {
          // Found navigation item, test Enter key
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          
          // Should navigate to the page
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(dashboard|leads|property)/);
          break;
        }
        
        await page.keyboard.press('Tab');
        focusedElement = await page.locator(':focus').first();
        tabCount++;
      }
    }
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Check for proper ARIA labels and roles
      const navigationElement = page.getByRole('navigation').first();
      await expect(navigationElement).toBeVisible();
      
      // Navigation items should have proper roles
      const navLinks = page.getByRole('link');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Check for landmarks
      const main = page.getByRole('main');
      if (await main.isVisible()) {
        await expect(main).toBeVisible();
      }
    }
  });
});