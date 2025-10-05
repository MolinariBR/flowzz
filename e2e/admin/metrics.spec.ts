import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Admin Metrics
 * Testa visualização de métricas SaaS no painel admin
 * 
 * Usa autenticação global (admin-user.json)
 */

test.describe('Admin - Metrics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/metrics');
  });

  test('deve carregar dashboard de métricas', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/metrics/);
    await expect(page.getByTestId('dashboard-heading')).toBeVisible();
  });

  test('deve exibir MRR (Monthly Recurring Revenue)', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar card de MRR
    await expect(page.getByRole('heading', { name: 'MRR' })).toBeVisible();
  });

  test('deve exibir ARR (Annual Recurring Revenue)', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    await expect(page.getByRole('heading', { name: 'ARR' })).toBeVisible();
  });

  test('deve exibir taxa de Churn', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    await expect(page.getByRole('heading', { name: 'Churn Rate' })).toBeVisible();
  });

  test('deve exibir LTV (Lifetime Value)', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/LTV|valor vitalício/i)).toBeVisible();
  });

  test('deve exibir CAC (Customer Acquisition Cost)', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/CAC|custo de aquisição/i)).toBeVisible();
  });

  test('deve renderizar gráfico de crescimento MRR', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Verificar presença de gráfico
    const chart = page.locator('canvas, svg, [data-testid*="chart"]').first();
    await expect(chart).toBeVisible();
  });

  test('deve permitir alternar período de visualização', async ({ page }) => {
    // Verificar seletores de período
    const periodSelector = page.getByRole('button', { name: /mês|trimestre|ano/i }).first();
    
    if (await periodSelector.isVisible()) {
      await periodSelector.click();
      
      // Selecionar período diferente
      await page.getByText(/último trimestre|3 meses/i).click();
      
      // Aguardar atualização
      await page.waitForTimeout(1000);
    }
  });

  test('deve exibir total de usuários ativos', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/usuários ativos|active users/i)).toBeVisible();
    
    // Número deve estar visível
    await expect(page.getByText(/[0-9]+/).first()).toBeVisible();
  });

  test('deve exibir novos registros do mês', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/novos usuários|new users|registros/i)).toBeVisible();
  });

  test('deve calcular relação LTV/CAC', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar se há indicador LTV/CAC ratio
    const ltvCacRatio = page.getByText(/LTV\/CAC|ratio/i);
    
    if (await ltvCacRatio.isVisible()) {
      // Valor ideal é > 3
      await expect(page.getByText(/[0-9]+\.[0-9]+/)).toBeVisible();
    }
  });

  test('deve mostrar tendência de crescimento', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar ícones ou textos de tendência
    const growthIndicator = page.locator('[data-testid*="trend"], .trend-up, .trend-down').first();
    
    // Ou há indicador visual, ou há porcentagem
    const hasIndicator = await growthIndicator.isVisible();
    const hasPercentage = await page.getByText(/[+-]?\d+%/).first().isVisible();
    
    expect(hasIndicator || hasPercentage).toBeTruthy();
  });

  test('deve ter navegação para outras seções admin', async ({ page }) => {
    // Verificar links de navegação
    const usersLink = page.getByRole('link', { name: /usuários|users/i }).first();
    
    if (await usersLink.isVisible()) {
      await usersLink.click();
      await expect(page).toHaveURL(/.*\/users/);
    }
  });
});
