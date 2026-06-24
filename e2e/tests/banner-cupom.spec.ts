import { test, expect } from '@playwright/test';
import { buildCatalogMock } from '../fixtures/catalog-mock';
import {
  MOCK_COUPON_VALID,
  MOCK_COUPON_EXPIRED,
  MOCK_COUPON_NOT_FOUND,
  MOCK_COUPON_MIN_NOT_MET,
} from '../fixtures/coupon-mock';

test.describe('Banner Promocional e Cupom (04-banner-cupom.feature)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: buildCatalogMock() });
    });
  });

  test('banner promocional ativo é exibido', async ({ page }) => {
    await page.goto('/e2e-test');
    const banner = page.locator('text=Compre 1 leve 2');
    await expect(banner).toBeVisible();
  });

  test('banner promocional inativo não é exibido', async ({ page }) => {
    const mock = buildCatalogMock();
    mock.restaurant.config_json.promo_banner.active = false;

    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: mock });
    });
    await page.goto('/e2e-test');

    const banner = page.locator('text=Compre 1 leve 2');
    await expect(banner).not.toBeVisible();
  });
});

test.describe('Cupom no Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: buildCatalogMock() });
    });
    await page.goto('/e2e-test');
    await page.waitForSelector('h1');

    const addButton = page.locator('button:has-text("+")').first();
    await addButton.click();
    await page.waitForTimeout(300);

    await page.goto('/e2e-test/checkout');
    await page.waitForTimeout(500);
  });

  test('aplica cupom válido', async ({ page }) => {
    await page.route('**/coupons/public/validate*', async (route) => {
      await route.fulfill({ json: MOCK_COUPON_VALID });
    });

    const cupomInput = page.locator('input[placeholder*="cupom"]');
    await cupomInput.fill('PROMO10');

    const aplicarBtn = page.locator('button:has-text("Aplicar")');
    await aplicarBtn.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Aplicado')).toBeVisible();
  });

  test('exibe erro para cupom inválido', async ({ page }) => {
    await page.route('**/coupons/public/validate*', async (route) => {
      await route.fulfill({ status: 404, json: MOCK_COUPON_NOT_FOUND });
    });

    const cupomInput = page.locator('input[placeholder*="cupom"]');
    await cupomInput.fill('INVALIDO');

    const aplicarBtn = page.locator('button:has-text("Aplicar")');
    await aplicarBtn.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=erro')).toBeVisible();
  });

  test('exibe erro para cupom expirado', async ({ page }) => {
    await page.route('**/coupons/public/validate*', async (route) => {
      await route.fulfill({ status: 400, json: MOCK_COUPON_EXPIRED });
    });

    const cupomInput = page.locator('input[placeholder*="cupom"]');
    await cupomInput.fill('EXPIRADO');

    const aplicarBtn = page.locator('button:has-text("Aplicar")');
    await aplicarBtn.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=expirou')).toBeVisible();
  });
});
