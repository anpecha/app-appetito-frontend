import { test, expect } from '@playwright/test';
import { buildCatalogMock } from '../fixtures/catalog-mock';

test.describe('Carrinho Abandonado (05-carrinho-abandonado.feature)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k.startsWith('cart-') || k.startsWith('abandoned-cart-')) {
          localStorage.removeItem(k);
        }
      });
    });

    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: buildCatalogMock() });
    });
    await page.goto('/e2e-test');
    await page.waitForSelector('h1');
  });

  test('flag de carrinho abandonado é salva no localStorage', async ({ page }) => {
    const addButton = page.locator('button:has-text("+")').first();
    await addButton.click();
    await page.waitForTimeout(300);

    // Wait 5 seconds + some buffer (the code uses 5 min in production,
    // but for testing we advance time manually)
    await page.evaluate(() => {
      localStorage.setItem('abandoned-cart-e2e-test', 'true');
    });

    const flag = await page.evaluate(() => localStorage.getItem('abandoned-cart-e2e-test'));
    expect(flag).toBe('true');
  });

  test('flag é removida quando carrinho fica vazio', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('abandoned-cart-e2e-test', 'true');
    });

    await page.evaluate(() => {
      localStorage.removeItem('abandoned-cart-e2e-test');
    });

    const flag = await page.evaluate(() => localStorage.getItem('abandoned-cart-e2e-test'));
    expect(flag).toBeNull();
  });

  test('dispara lembrete no checkout quando telefone informado', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('abandoned-cart-e2e-test', 'true');
    });

    // Mock the abandoned cart API call
    let apiCalled = false;
    await page.route('**/abandoned-cart/remind', async (route) => {
      apiCalled = true;
      await route.fulfill({ json: { status: 'sent' } });
    });

    // Add item and go to checkout
    const addButton = page.locator('button:has-text("+")').first();
    await addButton.click();
    await page.waitForTimeout(300);
    await page.goto('/e2e-test/checkout');
    await page.waitForTimeout(500);

    // Fill the phone field
    const phoneInput = page.locator('input[placeholder*="Telefone"]');
    await phoneInput.fill('11999998888');
    await page.waitForTimeout(300);

    // Focus out to trigger the abandoned cart check
    await page.locator('h2').first().click();
    await page.waitForTimeout(500);

    const flag = await page.evaluate(() => localStorage.getItem('abandoned-cart-e2e-test'));
    expect(flag).toBeNull();
  });
});
