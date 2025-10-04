import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Flow Dashboard
 * Testa visualização de métricas, gráficos e atividades
 * 
 * Usa autenticação global (demo-user.json)
 */

test.describe('Flow - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('deve carregar dashboard com métricas visíveis', async ({ page }) => {
    // Verificar que as métricas principais estão visíveis
    await expect(page.getByText(/vendas hoje|vendas de hoje/i)).toBeVisible();
    await expect(page.getByText(/gasto em anúncios|investimento/i)).toBeVisible();
    await expect(page.getByText(/lucro líquido/i)).toBeVisible();
    await expect(page.getByText(/pagamentos agendados/i)).toBeVisible();
  });

  test('deve exibir valores numéricos nas métricas', async ({ page }) => {
    // Aguardar carregamento dos dados
    await page.waitForTimeout(1000);

    // Verificar que há valores numéricos (R$ ou números)
    const metricsCards = page.locator('[data-testid*="metric-card"], .metric-card, .dashboard-metric');
    await expect(metricsCards.first()).toBeVisible();
    
    // Pelo menos uma métrica deve ter valor
    const hasValue = await page.getByText(/R\$|[0-9]+/).isVisible();
    expect(hasValue).toBeTruthy();
  });

  test('deve renderizar gráfico de vendas', async ({ page }) => {
    // Verificar que o gráfico existe
    const chart = page.locator('canvas, svg, [data-testid="sales-chart"], .chart-container').first();
    await expect(chart).toBeVisible();
  });

  test('deve permitir alternar período do gráfico (7d/30d)', async ({ page }) => {
    // Verificar botões de período
    const button7d = page.getByRole('button', { name: /7 dias|7d/i });
    const button30d = page.getByRole('button', { name: /30 dias|30d/i });

    if (await button7d.isVisible()) {
      await button7d.click();
      await page.waitForTimeout(500); // Aguardar atualização
      
      await button30d.click();
      await page.waitForTimeout(500); // Aguardar atualização
      
      // Gráfico ainda deve estar visível
      const chart = page.locator('canvas, svg, [data-testid="sales-chart"]').first();
      await expect(chart).toBeVisible();
    }
  });

  test('deve listar atividades recentes', async ({ page }) => {
    // Verificar seção de atividades
    await expect(page.getByText(/atividades recentes|histórico/i)).toBeVisible();
    
    // Aguardar carregamento
    await page.waitForTimeout(1000);
    
    // Verificar que há lista de atividades (pode estar vazia ou com dados)
    const activitiesList = page.locator('[data-testid="activities-list"], .activities-list, .activity-item').first();
    
    // Se houver atividades, verificar formato
    const hasActivities = await activitiesList.isVisible();
    if (hasActivities) {
      // Verificar que há pelo menos uma atividade com timestamp
      await expect(page.getByText(/há|minutos|horas|dias/i).first()).toBeVisible();
    }
  });

  test('deve mostrar estado vazio quando não há atividades', async ({ page }) => {
    // Se não houver atividades, deve mostrar estado vazio
    const emptyState = page.getByText(/nenhuma atividade|sem atividades/i);
    
    // Ou há atividades, ou há estado vazio
    const hasActivities = await page.locator('.activity-item').count() > 0;
    const hasEmptyState = await emptyState.isVisible();
    
    expect(hasActivities || hasEmptyState).toBeTruthy();
  });

  test('deve ter navegação funcional no menu lateral', async ({ page }) => {
    // Verificar links de navegação
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    const clientsLink = page.getByRole('link', { name: /clientes/i });
    
    await expect(dashboardLink).toBeVisible();
    await expect(clientsLink).toBeVisible();
    
    // Navegar para clientes e voltar
    await clientsLink.click();
    await expect(page).toHaveURL(/.*\/clients/);
    
    await dashboardLink.click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('deve ser responsivo em mobile', async ({ page }) => {
    // Redimensionar para mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Menu mobile deve estar visível ou ter botão hamburger
    const mobileMenu = page.getByRole('button', { name: /menu|abrir menu/i });
    
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      // Navegação deve aparecer
      await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    }
  });

  test('deve atualizar métricas ao fazer pull-to-refresh', async ({ page }) => {
    // Recarregar página
    await page.reload();
    
    // Verificar que métricas carregam novamente
    await expect(page.getByText(/vendas hoje|vendas de hoje/i)).toBeVisible();
  });
});
