import { test, expect, type Page } from '@playwright/test';

test('has title', async ({ page }: { page: Page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Homni/);
});

test('get started link', async ({ page }: { page: Page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Kom i gang' }).click();

  // Expects the URL to contain intro.
  await expect(page.getByRole('heading', { name: 'Velkommen til Homni' })).toBeVisible();
});