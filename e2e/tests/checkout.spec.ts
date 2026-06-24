import { test, expect } from '@playwright/test';
import { buildCatalogMock } from '../fixtures/catalog-mock';

test.describe('Checkout (06-checkout.feature)', () => {
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

  test('exibe campo CPF opcional', async ({ page }) => {
    const cpfInput = page.locator('input[placeholder*="000.000.000-00"]');
    await expect(cpfInput).toBeVisible();
  });

  test('exibe alerta de pedido mínimo quando abaixo do valor', async ({ page }) => {
    const alerta = page.locator('text=mínimo');
    await expect(alerta).toBeVisible();
  });

  test('select de região de entrega aparece no modo Delivery', async ({ page }) => {
    const deliveryRadio = page.locator('text=Delivery').first();
    await deliveryRadio.click();
    await page.waitForTimeout(300);

    const regiao = page.locator('text=Região de entrega');
    await expect(regiao).toBeVisible();
  });

  test('confirma pedido com dados válidos', async ({ page }) => {
    await page.route('**/orders/checkout', async (route) => {
      await route.fulfill({ json: { id: 'order-123', status: 'received' } });
    });

    const nameInput = page.locator('input[placeholder*="Nome"]');
    await nameInput.fill('João Silva');

    const phoneInput = page.locator('input[placeholder*="Telefone"]');
    await phoneInput.fill('11999998888');

    const confirmarBtn = page.locator('button:has-text("Confirmar")');
    await confirmarBtn.click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=pedido')).toBeVisible();
  });
});
