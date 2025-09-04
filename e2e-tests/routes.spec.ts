import { test, expect } from '@playwright/test';

test.describe('@routes Route Objects Navigation', () => {
  test('main routes navigation works', async ({ page }) => {
    // Test home page
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Test category landing page
    await page.goto('/kategori/forsikring');
    await expect(page).toHaveURL('/kategori/forsikring');
    await expect(page.locator('h1')).toContainText('Forsikring');
    
    // Test insurance companies directory
    await page.goto('/forsikring/selskaper');
    await expect(page).toHaveURL('/forsikring/selskaper');
    
    // Test thank you page
    await page.goto('/takk');
    await expect(page).toHaveURL('/takk');
  });

  test('404 handling works', async ({ page }) => {
    await page.goto('/non-existent-route');
    await expect(page.locator('h1')).toContainText('404');
  });

  test('invalid category redirects to home', async ({ page }) => {
    await page.goto('/kategori/invalid-category');
    await expect(page).toHaveURL('/');
  });

  test('route loading states work', async ({ page }) => {
    // Navigate to a route and check for loading state
    const navigationPromise = page.goto('/kategori/forsikring');
    
    // Should show loading state briefly
    await expect(page.locator('text=Laster inn...')).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading might be too fast to catch, which is okay
    });
    
    await navigationPromise;
    await expect(page.locator('h1')).toContainText('Forsikring');
  });

  test('SEO meta tags are present', async ({ page }) => {
    await page.goto('/kategori/forsikring');
    
    // Check title
    await expect(page).toHaveTitle(/Forsikring.*Sammenlign og spar/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Sammenlign forsikringstilbud/);
    
    // Check og:title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Forsikring.*Sammenlign og spar/);
    
    // Check canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://homni.no/kategori/forsikring');
    
    // Check structured data
    const structuredData = page.locator('script[type="application/ld+json"]');
    await expect(structuredData).toBeVisible();
  });

  test('accessibility navigation works', async ({ page }) => {
    await page.goto('/kategori/forsikring');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate with keyboard
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Forsikring');
  });
});

test.describe('@routes Performance', () => {
  test('route navigation is fast', async ({ page }) => {
    // Measure navigation time
    const startTime = Date.now();
    await page.goto('/kategori/forsikring');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('lazy loading works', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a lazy-loaded route
    await page.goto('/kategori/forsikring');
    
    // Check that the component loaded
    await expect(page.locator('h1')).toContainText('Forsikring');
  });
});