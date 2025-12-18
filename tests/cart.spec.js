// @ts-check
import { test, expect } from '@playwright/test';
import { API_URL } from '../constants.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');

  await expect(page.locator('#tbodyid')).not.toBeEmpty();
  await page.locator('#tbodyid a').first().click();
  await page.waitForURL(/prod.html/);

  await page.getByText('Add to cart').click();

  await page.locator('#cartur').click();
  await page.waitForURL(/cart.html/);

  await page.waitForSelector('#tbodyid tr');
});

test('Test add product to cart', async ({ page }) => {
    await expect(page.locator('#tbodyid tr')).toHaveCount(1);
    await page.locator('#tbodyid').screenshot({ path: 'screenshoots/add_product_to_cart.png' });
});

test('Test delete product from cart', async ({ page }) => {
  const responsePromiseDeleteItem = page.waitForResponse(response => 
    response.url() === `${API_URL}/deleteitem` && response.status() === 200
  ); 
  page.locator('#tbodyid tr a', { hasText: 'Delete' }).click();
  await responsePromiseDeleteItem;

  await expect(page.locator('#tbodyid')).toBeEmpty();
  await page.screenshot({ path: 'screenshoots/delete_item.png' });
});

test('Test successfully purchase product', async ({ page }) => {
  await page.locator('[data-target="#orderModal"]', { hasText: 'Place Order' }).click();

  const orderModal = page.locator('#orderModal');
  await expect(orderModal).toBeVisible();
  await expect(page.locator('#name')).toBeVisible();
  await expect(page.locator('#card')).toBeVisible();
  await page.locator('#name').fill('Test');
  await page.locator('#card').fill('1234');
  await page.getByText('Purchase').click();

  await expect(page.getByText('Thank you for your purchase!')).toBeVisible();
  await orderModal.screenshot({ path: 'screenshoots/successfully_purchase_product.png' });
});

test('Test error alert when purchase form is not filled', async ({ page }) => {
  page.once('dialog', async dialog => {
    expect(dialog.type() === 'alert').toBe(true);
    expect(dialog.message().includes('Please fill out')).toBe(true);
    await dialog.accept();
  });
  
  await page.locator('[data-target="#orderModal"]', { hasText: 'Place Order' }).click();

  await expect(page.locator('#orderModal')).toBeVisible();
  await page.getByText('Purchase').click();
  
  await expect(page.getByText('Thank you for your purchase!')).not.toBeVisible();
});