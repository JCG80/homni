import { test, expect } from '@playwright/test';

test('bytte til arbeidsmodus', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Arbeid' }).click();
  await expect(page.locator('.mode-indicator')).toContainText('Profesjonell');
});