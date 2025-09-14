import { test, expect, type Page } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('should redirect unauthenticated user to login page', async ({ page }: { page: Page }) => {
    // Try to access a protected page
    await page.goto('/leads/my');
    
    // Check if redirected to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display unauthorized page when accessing restricted content', async ({ page }: { page: Page }) => {
    // Directly access unauthorized page
    await page.goto('/unauthorized');
    
    // Verify unauthorized page content
    await expect(page.getByRole('heading', { name: /ingen tilgang/i })).toBeVisible();
    await expect(page.getByText(/du har ikke tilgang til denne siden/i)).toBeVisible();
  });

  test('unauthenticated user is redirected to /login for all admin routes', async ({ page }: { page: Page }) => {
    const adminPaths = [
      '/admin/companies',
      '/admin/members',
      '/admin/roles',
      '/admin/system-modules',
      '/admin/internal-access',
      '/admin/leads',
    ];

    for (const path of adminPaths) {
      await page.goto(path);
      await expect(page).toHaveURL(/.*login/);
    }
  });
});