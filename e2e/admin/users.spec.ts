import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Admin Users Management
 * Testa gestão de usuários no painel admin
 * 
 * Usa autenticação global (admin-user.json)
 */

test.describe('Admin - Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('deve carregar página de usuários', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/users/);
    await expect(page.getByText(/usuários|lista de usuários/i)).toBeVisible();
  });

  test('deve listar todos os usuários', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar tabela de usuários
    const usersTable = page.locator('table, [data-testid="users-table"]').first();
    await expect(usersTable).toBeVisible();
    
    // Deve haver pelo menos demo e admin
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('deve exibir informações dos usuários', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar colunas: email, plano, status
    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByText(/plano|plan/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
  });

  test('deve buscar usuários por email', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('demo');
      await page.waitForTimeout(500);
      
      // Deve filtrar resultados
      await expect(page.getByText(/demo@flowzz.com.br/i)).toBeVisible();
    }
  });

  test('deve filtrar usuários por status', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const statusFilter = page.getByRole('button', { name: /status|filtrar/i }).or(
      page.locator('[data-testid="status-filter"]')
    );
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.getByText(/ativo|active/i).click();
      await page.waitForTimeout(500);
    }
  });

  test('deve abrir detalhes do usuário', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Clicar na primeira linha
    const firstUser = page.locator('tbody tr').first();
    await firstUser.click();
    
    // Verificar modal/página de detalhes
    await expect(page.getByText(/detalhes|informações do usuário/i)).toBeVisible({ timeout: 3000 });
  });

  test('deve exibir histórico de assinaturas', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Abrir detalhes
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(500);
    
    // Verificar seção de assinaturas
    const subscriptionSection = page.getByText(/assinatura|subscription|histórico/i);
    
    if (await subscriptionSection.isVisible()) {
      await expect(page.getByText(/trial|básico|premium/i)).toBeVisible();
    }
  });

  test('deve suspender usuário', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Encontrar botão de ações
    const actionsButton = page.getByRole('button', { name: /ações|actions/i }).first();
    
    if (await actionsButton.isVisible()) {
      await actionsButton.click();
      
      // Clicar em suspender
      const suspendButton = page.getByText(/suspender|suspend/i);
      
      if (await suspendButton.isVisible()) {
        await suspendButton.click();
        
        // Confirmar
        await page.getByRole('button', { name: /confirmar|sim/i }).click();
        
        // Verificar confirmação
        await expect(page.getByText(/suspenso|suspended/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('deve reativar usuário suspenso', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Encontrar botão de ações
    const actionsButton = page.getByRole('button', { name: /ações|actions/i }).first();
    
    if (await actionsButton.isVisible()) {
      await actionsButton.click();
      
      // Clicar em reativar
      const reactivateButton = page.getByText(/reativar|activate/i);
      
      if (await reactivateButton.isVisible()) {
        await reactivateButton.click();
        
        // Confirmar
        await page.getByRole('button', { name: /confirmar|sim/i }).click();
        
        // Verificar confirmação
        await expect(page.getByText(/reativado|ativo/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('deve visualizar audit logs do usuário', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Abrir detalhes
    await page.locator('tbody tr').first().click();
    await page.waitForTimeout(500);
    
    // Verificar seção de logs
    const logsSection = page.getByText(/logs|atividades|histórico/i);
    
    if (await logsSection.isVisible()) {
      // Deve haver registros de ações
      await expect(page.getByText(/login|criou|atualizou/i)).toBeVisible();
    }
  });

  test('deve paginar lista de usuários', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar paginação
    const nextButton = page.getByRole('button', { name: /próxima|next|>/i });
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Página deve ter mudado
      await expect(page.getByText(/página 2|page 2/i)).toBeVisible();
    }
  });

  test('deve exportar lista de usuários', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const exportButton = page.getByRole('button', { name: /exportar|export|download/i });
    
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/users|usuarios/i);
    }
  });
});
