import { test, expect, devices } from '@playwright/test';

test.describe('Mobile/PC Parity Tests', () => {
  const testRoutes = [
    '/',
    '/dashboard', 
    '/leads',
    '/maintenance',
    '/properties',
    '/smart-lead-capture',
    '/provider-pipeline'
  ];

  test('Token cleanup - __lovable_token removed from URL', async ({ page }) => {
    // Navigate with lovable token
    await page.goto('/?__lovable_token=test-token-123');
    
    // Wait for app initialization
    await page.waitForLoadState('networkidle');
    
    // Check that token is removed from URL
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('__lovable_token');
    
    // Verify app still loads correctly
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Deep link navigation works on desktop', async ({ page }) => {
    for (const route of testRoutes) {
      await test.step(`Testing route: ${route}`, async () => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Verify page loaded (not blank)
        await expect(page.locator('body')).not.toBeEmpty();
        
        // Verify we're on the correct route
        expect(page.url()).toContain(route === '/' ? '' : route);
        
        // Verify no 404 content
        const content = await page.textContent('body');
        expect(content).not.toContain('404');
        expect(content).not.toContain('Siden ble ikke funnet');
      });
    }
  });

  test('Deep link navigation works on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13']
    });
    const page = await context.newPage();

    for (const route of testRoutes) {
      await test.step(`Testing mobile route: ${route}`, async () => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Verify page loaded (not blank)
        await expect(page.locator('body')).not.toBeEmpty();
        
        // Verify responsive design
        const viewport = page.viewportSize();
        expect(viewport?.width).toBeLessThanOrEqual(414); // Mobile width
        
        // Verify no horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = viewport?.width || 375;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
      });
    }

    await context.close();
  });

  test('Router mode detection works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check console for router mode logging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'info' && msg.text().includes('Router Debug')) {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Verify router debug info was logged
    expect(consoleLogs.length).toBeGreaterThan(0);
    
    const routerLog = consoleLogs.find(log => log.includes('Router Debug'));
    expect(routerLog).toBeDefined();
    expect(routerLog).toContain('routerMode');
  });

  test('Service worker cleanup in preview', async ({ page }) => {
    await page.goto('/');
    
    // Check that no service workers are registered in preview
    const swRegistrations = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length;
      }
      return 0;
    });
    
    // In preview/dev, service workers should be cleaned up
    if (page.url().includes('lovableproject.com')) {
      expect(swRegistrations).toBe(0);
    }
  });

  test('Navigation performance within limits', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const routes = ['/dashboard', '/leads', '/maintenance'];
    
    for (const route of routes) {
      const startTime = Date.now();
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const navigationTime = endTime - startTime;
      
      // Navigation should be under 3 seconds
      expect(navigationTime).toBeLessThan(3000);
    }
  });

  test('CORS headers work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Monitor network requests for CORS issues
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      if (request.failure()?.errorText.includes('CORS')) {
        failedRequests.push(request.url());
      }
    });
    
    // Navigate to a page that makes API calls
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify no CORS failures
    expect(failedRequests).toHaveLength(0);
  });

  test('Responsive breakpoints work correctly', async ({ browser }) => {
    const breakpoints = [
      { name: 'Mobile', ...devices['iPhone 13'] },
      { name: 'Tablet', ...devices['iPad'] },
      { name: 'Desktop', viewport: { width: 1920, height: 1080 } }
    ];

    for (const breakpoint of breakpoints) {
      await test.step(`Testing ${breakpoint.name} breakpoint`, async () => {
        const context = await browser.newContext(breakpoint);
        const page = await context.newPage();
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Verify layout doesn't break
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        expect(hasHorizontalScroll).toBe(false);
        
        // Verify navigation is accessible
        const nav = page.locator('nav, [role="navigation"]').first();
        if (await nav.count() > 0) {
          await expect(nav).toBeVisible();
        }
        
        await context.close();
      });
    }
  });
});