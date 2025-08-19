import { test, expect } from '@playwright/test';

test.describe('Navigation Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navigation response time benchmarks', async ({ page }) => {
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');

      const navigationBenchmarks = [
        { name: 'Dashboard', route: '/dashboard', maxTime: 1000 },
        { name: 'Lead Engine', route: '/leads', maxTime: 1500 },
        { name: 'Property Management', route: '/property', maxTime: 1500 },
        { name: 'DIY Sales', route: '/sales', maxTime: 2000 },
      ];

      for (const benchmark of navigationBenchmarks) {
        // Start timing
        const startTime = Date.now();
        
        // Navigate
        await page.getByText(benchmark.name).click();
        await page.waitForURL(`**${benchmark.route}`);
        await page.waitForLoadState('domcontentloaded');
        
        // End timing
        const endTime = Date.now();
        const navigationTime = endTime - startTime;
        
        console.log(`${benchmark.name} navigation took ${navigationTime}ms`);
        
        // Assert performance benchmark
        expect(navigationTime).toBeLessThan(benchmark.maxTime);
        
        // Verify page is interactive
        const interactiveElements = page.getByRole('button').first();
        if (await interactiveElements.isVisible()) {
          await expect(interactiveElements).toBeEnabled();
        }
      }
    }
  });

  test('module preloading effectiveness', async ({ page }) => {
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Wait for preloading to complete
      await page.waitForTimeout(2000);
      
      // Check if modules are preloaded by testing instant navigation
      const moduleTests = [
        { name: 'Lead Engine', selector: 'Lead Engine' },
        { name: 'Property Management', selector: 'Eiendomsforvaltning' },
      ];
      
      for (const moduleTest of moduleTests) {
        const startTime = Date.now();
        
        await page.getByText(moduleTest.selector).click();
        await page.waitForLoadState('domcontentloaded');
        
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        console.log(`Preloaded ${moduleTest.name} loaded in ${loadTime}ms`);
        
        // Preloaded modules should load very quickly
        expect(loadTime).toBeLessThan(800);
      }
    }
  });

  test('cache hit rate monitoring', async ({ page }) => {
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Navigate to multiple pages to build cache
      const routes = ['leads', 'property', 'sales', 'dashboard'];
      
      // First pass - populate cache
      for (const route of routes) {
        await page.getByText(new RegExp(route, 'i')).first().click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(200);
      }
      
      // Second pass - should hit cache
      for (const route of routes) {
        const startTime = Date.now();
        
        await page.getByText(new RegExp(route, 'i')).first().click();
        await page.waitForLoadState('domcontentloaded');
        
        const endTime = Date.now();
        const cachedLoadTime = endTime - startTime;
        
        // Cached navigation should be faster
        expect(cachedLoadTime).toBeLessThan(600);
      }
      
      // Check if cache performance metrics are available
      const cacheMetrics = await page.evaluate(() => {
        return localStorage.getItem('homni_navigation_cache');
      });
      
      expect(cacheMetrics).toBeTruthy();
    }
  });

  test('bundle size impact measurement', async ({ page }) => {
    // Monitor network requests during navigation
    const requests: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        requests.push({
          url: response.url(),
          size: response.headers()['content-length'],
          status: response.status(),
        });
      }
    });
    
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Navigate to a module that should trigger chunk loading
      await page.getByText('Lead Engine').click();
      await page.waitForLoadState('networkidle');
      
      // Check bundle sizes
      const jsRequests = requests.filter(req => req.url.includes('.js'));
      const totalJSSize = jsRequests.reduce((total, req) => {
        const size = parseInt(req.size || '0', 10);
        return total + size;
      }, 0);
      
      console.log(`Total JS bundle size: ${totalJSSize} bytes`);
      console.log(`Number of JS chunks: ${jsRequests.length}`);
      
      // Ensure reasonable bundle sizes (adjust based on your requirements)
      expect(totalJSSize).toBeLessThan(2 * 1024 * 1024); // 2MB limit
      expect(jsRequests.length).toBeLessThan(20); // Reasonable chunk count
    }
  });

  test('memory usage during navigation', async ({ page }) => {
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      // Get initial memory usage
      const initialMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });
      
      if (initialMetrics) {
        const initialMemory = initialMetrics.usedJSHeapSize;
        
        // Navigate through multiple modules
        const routes = ['leads', 'property', 'sales', 'dashboard'];
        
        for (const route of routes) {
          await page.getByText(new RegExp(route, 'i')).first().click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);
        }
        
        // Get final memory usage
        const finalMetrics = await page.evaluate(() => {
          if ('memory' in performance) {
            return (performance as any).memory;
          }
          return null;
        });
        
        if (finalMetrics) {
          const finalMemory = finalMetrics.usedJSHeapSize;
          const memoryIncrease = finalMemory - initialMemory;
          
          console.log(`Memory increase during navigation: ${memoryIncrease} bytes`);
          
          // Ensure memory usage doesn't grow excessively
          expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
        }
      }
    }
  });

  test('responsive navigation performance', async ({ page }) => {
    const quickLoginUser = page.getByTestId('quicklogin-user');
    
    if (await quickLoginUser.isVisible()) {
      await quickLoginUser.click();
      await page.waitForLoadState('networkidle');
      
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' },
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(200);
        
        const startTime = Date.now();
        
        // Test navigation in current viewport
        await page.getByText('Lead Engine').first().click();
        await page.waitForLoadState('domcontentloaded');
        
        const endTime = Date.now();
        const navigationTime = endTime - startTime;
        
        console.log(`${viewport.name} navigation: ${navigationTime}ms`);
        
        // Navigation should be responsive across all viewports
        expect(navigationTime).toBeLessThan(2000);
        
        // Navigate back to dashboard for next test
        await page.getByText('Dashboard').first().click();
        await page.waitForLoadState('domcontentloaded');
      }
    }
  });
});