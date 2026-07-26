import { test, expect } from '@playwright/test';

const PRODUCT_ID = 1;
const PRODUCT_NAME = 'Premium Wireless Headphones';

function futureExpiry(): string {
  const year = (new Date().getFullYear() + 2) % 100;
  return `12/${String(year).padStart(2, '0')}`;
}

test('golden path: browse, add to cart, and complete checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();

  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Products', exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole('heading', { name: 'All products' })).toBeVisible();

  await page.locator(`a[href="/products/${PRODUCT_ID}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/products/${PRODUCT_ID}$`));
  await expect(page.getByRole('heading', { level: 1, name: PRODUCT_NAME })).toBeVisible();

  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByText(/Added 1 item to your cart\./)).toBeVisible();

  await page.getByRole('button', { name: /^Cart/ }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
  await expect(page.getByText(PRODUCT_NAME)).toBeVisible();

  await page.getByRole('link', { name: 'Proceed to checkout' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  await page.locator('[name="firstName"]').fill('Jane');
  await page.locator('[name="lastName"]').fill('Doe');
  await page.locator('[name="email"]').fill('jane.doe@example.com');
  await page.locator('[name="address"]').fill('123 Main St, Apt 4B');
  await page.locator('[name="city"]').fill('Metropolis');
  await page.locator('[name="zipCode"]').fill('10001');

  await page.locator('[name="cardNumber"]').fill('4242424242424242');
  await page.locator('[name="expiry"]').fill(futureExpiry());
  await page.locator('[name="cvv"]').fill('123');

  await page.getByRole('button', { name: /^Place order/ }).click();

  await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();
});
