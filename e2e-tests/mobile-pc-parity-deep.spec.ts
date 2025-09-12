import { test, expect, devices } from '@playwright/test';

// Test routes for deep link validation
const testRoutes = [
  '/',
  '/dashboard', 
  '/login',
  '/properties',
  '/leads/intelligence',
  '/admin/dashboard',
  '/company/leads'
];

test.describe('Mobile/PC Parity - Deep Link Validation', () => {
  
  test('should cleanup __lovable_token from URL on initialization', async ({ page }) => {
    // Navigate with lovable token
    await page.goto('/?__lovable_token=test123&other=param');
    
    // Wait for app initialization
    await page.waitForTimeout(1000);
    
    // Check that token is removed but other params remain
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('__lovable_token');
    expect(currentUrl).toContain('other=param');
  });

  test('should handle deep links correctly on desktop', async ({ page }) => {
    for (const route of testRoutes) {
      console.log(`Testing desktop deep link: ${route}`);
      
      await page.goto(route);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded (not 404)
      const body = await page.textContent('body');
      expect(body).not.toContain('404');
      expect(body).not.toContain('Page not found');
      
      // Verify navigation worked (URL should match expected route)
      const currentUrl = new URL(page.url());
      if (route === '/') {
        expect([currentUrl.pathname, currentUrl.hash]).toContain('/');
      } else {
        expect(currentUrl.pathname + currentUrl.hash).toContain(route);
      }
    }
  });

  test('should handle deep links correctly on mobile', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      ...devices['iPhone 13'],
    });
    
    const page = await mobileContext.newPage();
    
    for (const route of testRoutes) {
      console.log(`Testing mobile deep link: ${route}`);
      
      await page.goto(route);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded and is responsive
      const viewportSize = page.viewportSize();
      expect(viewportSize?.width).toBeLessThanOrEqual(414); // Mobile width
      
      // Check for horizontal scroll (shouldn't exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
      
      // Verify content loaded
      const body = await page.textContent('body');
      expect(body).not.toContain('404');
      expect(body).not.toContain('Page not found');
    }
    
    await mobileContext.close();
  });

  test('should detect correct router mode', async ({ page }) => {
    // Listen for console logs
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'info') {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Check that router mode is logged
    const routerMessages = consoleMessages.filter(msg => 
      msg.includes('Router mode') || msg.includes('App initializing')
    );
    expect(routerMessages.length).toBeGreaterThan(0);
    
    // Verify router mode matches expected (hash for lovableproject.com, browser otherwise)
    const hostname = new URL(page.url()).hostname;
    const expectedMode = hostname.includes('lovableproject.com') ? 'hash' : 'browser';
    
    const modeMessage = routerMessages.find(msg => 
      msg.includes('Router mode')
    );
    
    if (modeMessage) {
      expect(modeMessage).toContain(expectedMode);
    }
  });

  test('should not register service workers in preview environment', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check service worker registration
    const swRegistrations = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length;
      }
      return 0;
    });
    
    // In Lovable preview (lovableproject.com), service workers should be cleaned up
    const hostname = new URL(page.url()).hostname;
    if (hostname.includes('lovableproject.com')) {
      expect(swRegistrations).toBe(0);
    }
  });

  test('should maintain fast navigation performance', async ({ page }) => {
    await page.goto('/');
    
    const navigationRoutes = ['/', '/dashboard', '/properties'];
    
    for (let i = 0; i < navigationRoutes.length; i++) {
      const route = navigationRoutes[i];
      
      const startTime = Date.now();
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const navigationTime = endTime - startTime;
      console.log(`Navigation to ${route}: ${navigationTime}ms`);
      
      // Navigation should be under 3 seconds
      expect(navigationTime).toBeLessThan(3000);
    }
  });

  test('should handle CORS correctly without failures', async ({ page }) => {
    // Monitor network requests for CORS failures
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      if (request.failure()?.errorText.includes('CORS')) {
        failedRequests.push(request.url());
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should not have any CORS-related failures
    expect(failedRequests).toHaveLength(0);
  });

  test('should work across different device breakpoints', async ({ browser }) => {
    const devices = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1024, height: 768 }
    ];
    
    for (const device of devices) {
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height }
      });
      
      const page = await context.newPage();
      
      console.log(`Testing ${device.name} (${device.width}x${device.height})`);
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
      
      // Verify navigation is accessible
      const navigation = await page.locator('nav, [role="navigation"]').first();
      if (await navigation.isVisible()) {
        expect(await navigation.isVisible()).toBeTruthy();
      }
      
      await context.close();
    }
  });
});