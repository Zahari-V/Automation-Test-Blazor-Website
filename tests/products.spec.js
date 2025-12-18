// @ts-check
import { test, expect } from '@playwright/test';
import { API_URL } from '../constants.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');

  await expect(page.locator('#tbodyid')).not.toBeEmpty();
});

test('Home page has title "STORE"', async ({ page }) => {
  // Expect a title "to contain" a substring "STORE".
  await expect(page).toHaveTitle(/STORE/);
});

test('Test filtering products catalog', async ({ page }) => {
  const productCatalog = page.locator('#tbodyid');
  await productCatalog.screenshot({ path: 'screenshoots/products_before_filtering.png' });
  const productBeforeFiltering = await productCatalog.innerHTML();

  const responsePromiseFilter = page.waitForResponse(response => 
    response.url() === `${API_URL}/bycat` && response.status() === 200
    && response.request().postData()?.includes('monitor') === true
  );
  await page.locator('#itemc', { hasText: 'Monitors' }).click();
  await responsePromiseFilter;

  await productCatalog.screenshot({ path: 'screenshoots/products_after_filtering.png' });
});

test('Test pagination products catalog', async ({ page }) => {
  const productCatalog = page.locator('#tbodyid');
  await productCatalog.screenshot({ path: 'screenshoots/products_before_pagination.png' });

  const responsePromisePagination = page.waitForResponse(response => 
    response.url() === `${API_URL}/pagination` && response.status() === 200
  );
  await page.locator('#next2', { hasText: 'Next' }).click();
  await responsePromisePagination;

  await productCatalog.screenshot({ path: 'screenshoots/products_after_pagination.png' });
});
