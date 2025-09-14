import { test, expect, type Page } from '@playwright/test';

test('bytte til arbeidsmodus', async ({ page }: { page: Page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Arbeid' }).click();
  await expect(page.locator('.mode-indicator')).toContainText('Profesjonell');
});