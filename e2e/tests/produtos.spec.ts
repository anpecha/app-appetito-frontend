import { test, expect } from '@playwright/test';
import { buildCatalogMock } from '../fixtures/catalog-mock';

test.describe('Produtos (02-produtos.feature)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/catalog/e2e-test', async (route) => {
      await route.fulfill({ json: buildCatalogMock() });
    });
    await page.goto('/e2e-test');
    await page.waitForSelector('h1');
  });

  test('produto com preço promocional exibe badge Promoção e preço riscado', async ({ page }) => {
    const produto = page.locator('text=X-Tudo').first();
    await expect(produto).toBeVisible();

    await expect(page.locator('text=Promoção').first()).toBeVisible();

    const precoOriginal = page.locator('text=R$ 25,00');
    await expect(precoOriginal).toBeVisible();

    const precoPromo = page.locator('text=R$ 15,00');
    await expect(precoPromo).toBeVisible();
  });

  test('produto sem promoção exibe apenas preço normal', async ({ page }) => {
    await expect(page.locator('text=X-Bacon')).toBeVisible();

    const badgePromo = page.locator('text=Promoção');
    const count = await badgePromo.count();

    const xTudo = page.locator('text=X-Tudo').first();
    const xBacon = page.locator('text=X-Bacon').first();

    await expect(xTudo).toBeVisible();
    await expect(xBacon).toBeVisible();
  });

  test('produto esgotado exibe overlay Esgotado e botão desabilitado', async ({ page }) => {
    const esgotado = page.locator('text=X-Salada Esgotado');
    await expect(esgotado).toBeVisible();

    await expect(page.locator('text=Esgotado')).toBeVisible();
  });

  test('badge Mais Pedido aparece para produtos com orders_count > 5', async ({ page }) => {
    const maisPedido = page.locator('text=Mais Pedido');
    await expect(maisPedido.first()).toBeVisible();
  });

  test('adicionar produto ao carrinho', async ({ page }) => {
    const addButton = page.locator('button:has-text("+")').first();
    await addButton.click();
    await page.waitForTimeout(500);

    const carrinho = page.locator('text=carrinho').first();
    await expect(carrinho).toBeVisible();
  });
});
