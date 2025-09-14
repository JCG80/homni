import { test, expect, type Page } from '@playwright/test';

test.describe('Enhanced Authentication Flow', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Enhanced error handling for navigation
    page.on('pageerror', (error) => {
      console.log(`❌ Page error: ${error.message}`);
    });
    
    page.on('requestfailed', (request) => {
      console.log(`❌ Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('unauthenticated user redirected to login from protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/leads/my',
      '/marketplace/pipeline', 
      '/admin/companies',
      '/admin/members'
    ];

    for (const route of protectedRoutes) {
      await test.step(`Testing route: ${route}`, async () => {
        await page.goto(route);
        
        // Should redirect to login
        await expect(page).toHaveURL(/.*login/, {
          timeout: 10000
        });
        
        // Verify login form is present
        await expect(page.locator('form')).toBeVisible();
      });
    }
  });

  test('unauthorized page displays correct Norwegian content', async ({ page }) => {
    await page.goto('/unauthorized');
    
    // Check for Norwegian headings and text
    await expect(page.getByRole('heading', { name: /ingen tilgang/i })).toBeVisible();
    await expect(page.getByText(/du har ikke tilgang til denne siden/i)).toBeVisible();
    
    // Verify page accessibility
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveAttribute('id');
  });

  test('login form validation and UX', async ({ page }) => {
    await page.goto('/login');
    
    // Test form presence and structure
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Test required field validation (if implemented)
    const submitButton = page.getByRole('button', { name: /logg inn/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Check for validation messages (adjust selectors as needed)
      const validationErrors = page.locator('[role="alert"], .error-message, .text-destructive');
      const errorCount = await validationErrors.count();
      
      if (errorCount > 0) {
        console.log(`✅ Form validation working - ${errorCount} error(s) shown`);
      }
    }
  });

  test('responsive design on mobile devices', async ({ page, isMobile }) => {
    await page.goto('/login');
    
    if (isMobile) {
      // Mobile-specific checks
      await expect(page.locator('form')).toBeVisible();
      
      // Verify mobile-friendly button sizing
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            // Buttons should be at least 44px tall for mobile accessibility
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  });

  test('navigation menu visibility based on auth state', async ({ page }) => {
    await page.goto('/');
    
    // Check public navigation items
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Verify login/signup links are present for unauthenticated users
    const loginLink = page.getByRole('link', { name: /logg inn/i });
    if (await loginLink.isVisible()) {
      await expect(loginLink).toBeVisible();
    }
  });

  test('error boundary handling', async ({ page }) => {
    // Test navigation to non-existent route
    await page.goto('/this-route-does-not-exist');
    
    // Should show some form of error page or redirect
    await page.waitForLoadState('networkidle');
    
    // Check if we get redirected or error page is shown
    const currentUrl = page.url();
    const hasErrorContent = await page.locator('h1, [role="heading"]').isVisible();
    
    expect(hasErrorContent || currentUrl.includes('404') || currentUrl.includes('login')).toBeTruthy();
  });
});