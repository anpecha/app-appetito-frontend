import { test, expect } from '@playwright/test';
import { buildCatalogMock } from '../fixtures/catalog-mock';

test.describe('Header Dinâmico (01-header.feature)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: buildCatalogMock() });
    });
    await page.goto('/e2e-test');
    await page.waitForSelector('h1');
  });

  test('exibe nome do restaurante e logo', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('E2E Test Restaurant');
    await expect(page.locator('img[alt*="logo" i]')).toBeVisible();
  });

  test('exibe badge Aberto quando dentro do horário', async ({ page }) => {
    const badge = page.locator('text=Aberto');
    await expect(badge).toBeVisible();
  });

  test('exibe footer personalizado', async ({ page }) => {
    await expect(page.locator('text=Feito com amor')).toBeVisible();
  });

  test('exibe capa e logo com fallback quando sem imagens', async ({ page }) => {
    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({
        json: buildCatalogMock({ logo_url: null, cover_url: null }),
      });
    });
    await page.goto('/e2e-test');
    await page.waitForSelector('h1');
    const imgs = page.locator('img');
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
  });
});
