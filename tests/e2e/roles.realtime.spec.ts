import { test, expect } from '@playwright/test';

async function loginAs(page: any, email: string) {
  await page.goto('/login');
  await page.getByLabel(/E-post/i).fill(email);
  await page.getByRole('button', { name: /Logg inn/i }).click();
  await page.waitForURL(/dashboard|admin/);
}

test('grant & revoke reflect in two admin sessions', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const adminA = await ctxA.newPage();
  const adminB = await ctxB.newPage();

  const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@homni.no';
  const TARGET_EMAIL = process.env.E2E_TARGET_EMAIL || 'test@homni.no';

  await loginAs(adminA, ADMIN_EMAIL);
  await loginAs(adminB, ADMIN_EMAIL);

  await adminA.goto('/admin/roles');
  await adminB.goto('/admin/roles');

  // Grant role in session A
  await adminA.getByRole('button', { name: /Tildel rolle/i }).click();
  await adminA.getByPlaceholder('Skriv navn eller e-post').fill(TARGET_EMAIL);
  await adminA.getByRole('option', { name: new RegExp(TARGET_EMAIL, 'i') }).click();
  await adminA.getByRole('combobox').selectOption('content_editor');
  await adminA.getByRole('button', { name: /^Lagre$/ }).click();

  // Enter OTP
  await adminA.getByLabel(/OTP/i).fill('000000');
  await adminA.getByRole('button', { name: /^Bekreft$/ }).click();

  // Verify role appears in session B via realtime
  await expect(adminB.getByRole('cell', { name: 'content_editor' })).toBeVisible({ timeout: 7000 });

  // Revoke role in session A
  const row = adminA.getByRole('row', { name: /content_editor/i });
  await row.getByRole('button', { name: /Fjern/i }).click();
  await adminA.getByLabel(/OTP/i).fill('000000');
  await adminA.getByRole('button', { name: /^Bekreft$/ }).click();

  // Verify role disappears in session B via realtime
  await expect(adminB.getByRole('cell', { name: 'content_editor' })).toHaveCount(0, { timeout: 7000 });

  await ctxA.close();
  await ctxB.close();
});