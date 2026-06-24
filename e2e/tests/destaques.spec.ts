import { test, expect } from '@playwright/test';
import { buildCatalogMock } from '../fixtures/catalog-mock';

test.describe('Seção de Destaques (03-destaques.feature)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: buildCatalogMock() });
    });
    await page.goto('/e2e-test');
    await page.waitForSelector('h1');
  });

  test('seção "Os mais pedidos" exibe produtos em destaque', async ({ page }) => {
    const secao = page.locator('text=Os mais pedidos');
    await expect(secao).toBeVisible();
  });

  test('seção "Promoções" exibe produtos com preço promocional', async ({ page }) => {
    const secao = page.locator('text=Promoções');
    await expect(secao).toBeVisible();
  });

  test('seções de destaque somem ao digitar na busca', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('X-Bacon');
    await page.waitForTimeout(300);

    const destaques = page.locator('text=Os mais pedidos');
    await expect(destaques).not.toBeVisible();
  });

  test('seções de destaque não aparecem com menos de 3 produtos populares', async ({ page }) => {
    const mock = buildCatalogMock();
    mock.products = mock.products.map((p) => ({ ...p, orders_count: 0 }));

    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: mock });
    });
    await page.goto('/e2e-test');
    await page.waitForSelector('h1');

    const secao = page.locator('text=Os mais pedidos');
    await expect(secao).not.toBeVisible();
  });
});
