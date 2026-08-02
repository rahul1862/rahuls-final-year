import { test, expect } from '@playwright/test';

const uniqueEmail = `test+${Date.now()}@example.com`;
const password = 'Passw0rd1';
const fullName = 'Playwright Tester';
const firstName = fullName.split(' ')[0];

test('register, log out, and log back in against the real backend', async ({ page }) => {
  await page.goto('/register');
  await page.locator('#reg-name').fill(fullName);
  await page.locator('#reg-email').fill(uniqueEmail);
  await page.locator('#reg-password').fill(password);
  await page.locator('#reg-confirm').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/$/);

  const userMenuButton = page.getByRole('button', { name: new RegExp(firstName) });
  await expect(userMenuButton).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).not.toBeVisible();

  const sessionAfterRegister = await page.evaluate(() => localStorage.getItem('vendr-session'));
  expect(sessionAfterRegister).not.toBeNull();
  expect(JSON.parse(sessionAfterRegister!).email).toBe(uniqueEmail);

  await userMenuButton.click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  const sessionAfterLogout = await page.evaluate(() => localStorage.getItem('vendr-session'));
  expect(sessionAfterLogout).toBeNull();

  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.locator('#login-email').fill(uniqueEmail);
  await page.locator('#login-password').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: new RegExp(firstName) })).toBeVisible();

  const sessionAfterLogin = await page.evaluate(() => localStorage.getItem('vendr-session'));
  expect(sessionAfterLogin).not.toBeNull();
  expect(JSON.parse(sessionAfterLogin!).email).toBe(uniqueEmail);
});
