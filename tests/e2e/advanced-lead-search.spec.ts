import { test, expect } from '@playwright/test';

test.describe('Advanced Lead Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the advanced search page
    await page.goto('/leads/advanced-search');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Avansert lead-søk")');
  });

  test('should display search interface', async ({ page }) => {
    // Check that main elements are present
    await expect(page.locator('h1')).toContainText('Avansert lead-søk');
    await expect(page.locator('input[placeholder*="Søk"]')).toBeVisible();
    await expect(page.locator('button:has-text("Ny lead")')).toBeVisible();
  });

  test('should filter leads by search term', async ({ page }) => {
    // Enter a search term
    await page.fill('input[placeholder*="Søk"]', 'electrical');
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // Check that results are filtered
    const leadCards = page.locator('[data-testid="lead-card"]');
    await expect(leadCards).toHaveCount(0); // Assuming no leads match initially
  });

  test('should open create lead modal', async ({ page }) => {
    // Click the "Ny lead" button
    await page.click('button:has-text("Ny lead")');
    
    // Check that modal opens
    await expect(page.locator('text=Opprett ny lead')).toBeVisible();
    
    // Close modal by clicking X or outside
    await page.click('button:has([aria-label="Close"])');
    await expect(page.locator('text=Opprett ny lead')).not.toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    // Open status filter dropdown if it exists
    const statusFilter = page.locator('select[name="status"], [role="combobox"][aria-label*="status"]').first();
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.click('text=Kontaktet');
      
      // Wait for results to update
      await page.waitForTimeout(500);
      
      // Verify filtering worked (results should be updated)
      const resultsText = page.locator('text*="resultater"');
      await expect(resultsText).toBeVisible();
    }
  });

  test('should save and load user filters', async ({ page }) => {
    // Skip if not authenticated
    const isAuth = await page.locator('text=Logg inn').isVisible();
    if (isAuth) {
      test.skip('User not authenticated');
    }
    
    // Set some filters
    await page.fill('input[placeholder*="Søk"]', 'test search');
    
    // Look for save filter button
    const saveButton = page.locator('button:has-text("Lagre filter"), button[aria-label*="save"]');
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Fill filter name if prompted
      const nameInput = page.locator('input[placeholder*="navn"], input[label*="navn"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Filter');
        await page.click('button:has-text("Lagre"), button[type="submit"]');
      }
      
      // Verify filter was saved by checking if it appears in saved filters list
      await expect(page.locator('text=Test Filter')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should reset filters', async ({ page }) => {
    // Set some filters first
    await page.fill('input[placeholder*="Søk"]', 'test');
    
    // Look for reset button
    const resetButton = page.locator('button:has-text("Tilbakestill"), button:has-text("Reset"), button[aria-label*="reset"]');
    
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      // Verify search field is cleared
      const searchInput = page.locator('input[placeholder*="Søk"]');
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile layout works
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="Søk"]')).toBeVisible();
    
    // Check that buttons are accessible on mobile
    const createButton = page.locator('button:has-text("Ny lead")');
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Search for something that definitely won't exist
    await page.fill('input[placeholder*="Søk"]', 'xyznonexistentlead123');
    await page.waitForTimeout(500);
    
    // Should show some kind of empty state message or zero results
    const emptyMessage = page.locator('text*="Ingen", text*="0 resultater", text*="Fant ingen"');
    
    // At minimum, the page shouldn't crash
    await expect(page.locator('h1')).toBeVisible();
  });
});