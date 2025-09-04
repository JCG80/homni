import { test, expect } from '@playwright/test';

/**
 * Performance E2E Tests
 * Validates Master Prompt performance requirements
 */

test.describe('Performance Monitoring', () => {
  
  test('page load times meet budget requirements', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: Page load ≤ 3000ms
    expect(loadTime).toBeLessThan(3000);
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('dashboard loads efficiently for authenticated users', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Use QuickLogin for fast test setup
      const userButton = page.getByTestId('quicklogin-user');
      
      const startTime = Date.now();
      await userButton.click();
      
      // Wait for dashboard to load
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 5 seconds (including auth)
      expect(loadTime).toBeLessThan(5000);
      console.log(`Dashboard load time: ${loadTime}ms`);
    }
  });

  test('bundle size is within budget', async ({ page }) => {
    // Navigate to page and check network requests
    await page.goto('/');
    
    // Get all JavaScript resources
    const jsRequests = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => resource.name.endsWith('.js'))
        .map(resource => ({
          name: resource.name,
          size: resource.transferSize || 0
        }));
    });
    
    const totalJSSize = jsRequests.reduce((sum, req) => sum + req.size, 0);
    
    // Performance budget: Total JS ≤ 200KB (gzipped)
    expect(totalJSSize).toBeLessThan(200 * 1024);
    console.log(`Total JS bundle size: ${Math.round(totalJSSize / 1024)}KB`);
  });

  test('API response times are within budget', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Login to trigger API calls
      const userButton = page.getByTestId('quicklogin-user');
      await userButton.click();
      
      // Monitor network requests
      const apiRequests: Array<{ url: string; duration: number }> = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.includes('supabase.co') || url.includes('/api/')) {
          const request = response.request();
          const timing = response.timing();
          if (timing) {
            apiRequests.push({
              url,
              duration: timing.responseEnd - timing.responseStart
            });
          }
        }
      });
      
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      
      // Check API response times
      for (const req of apiRequests) {
        // Performance budget: API p95 ≤ 200ms
        expect(req.duration).toBeLessThan(200);
        console.log(`API ${req.url}: ${req.duration}ms`);
      }
    }
  });

  test('critical rendering path is optimized', async ({ page }) => {
    await page.goto('/');
    
    // Check for render-blocking resources
    const renderMetrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint') as PerformanceEntry[];
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');
      
      return {
        fcp: fcp?.startTime || 0,
        lcp: lcp?.startTime || 0
      };
    });
    
    // First Contentful Paint should be ≤ 1.5s
    expect(renderMetrics.fcp).toBeLessThan(1500);
    
    // Largest Contentful Paint should be ≤ 2.5s
    if (renderMetrics.lcp > 0) {
      expect(renderMetrics.lcp).toBeLessThan(2500);
    }
    
    console.log(`FCP: ${renderMetrics.fcp}ms, LCP: ${renderMetrics.lcp}ms`);
  });

  test('memory usage remains stable during navigation', async ({ page }) => {
    if (process.env.NODE_ENV !== 'production') {
      await page.goto('/login');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Login as user
      const userButton = page.getByTestId('quicklogin-user');
      await userButton.click();
      await page.waitForURL(/.*dashboard\/user/, { timeout: 10000 });
      
      // Navigate through several pages
      const routes = ['/leads/my', '/properties', '/dashboard/user'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Check memory after each navigation
        const currentMemory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        
        // Memory should not increase by more than 10MB during navigation
        const memoryIncrease = currentMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        
        console.log(`Memory after ${route}: ${Math.round(currentMemory / 1024 / 1024)}MB`);
      }
    }
  });

  test('error pages load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to non-existent page
    await page.goto('/non-existent-page');
    
    // Wait for error page
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Error pages should load very quickly (≤ 1000ms)
    expect(loadTime).toBeLessThan(1000);
    console.log(`Error page load time: ${loadTime}ms`);
  });
});