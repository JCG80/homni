
import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('should redirect unauthenticated user to login page', async ({ page }) => {
    // Try to access a protected page
    await page.goto('/leads/my');
    
    // Check if redirected to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display unauthorized page when accessing restricted content', async ({ page }) => {
    // Directly access unauthorized page
    await page.goto('/unauthorized');
    
    // Verify unauthorized page content
    await expect(page.getByRole('heading', { name: /ingen tilgang/i })).toBeVisible();
    await expect(page.getByText(/du har ikke tilgang til denne siden/i)).toBeVisible();
  });

  // More authentication tests would be added here
});
