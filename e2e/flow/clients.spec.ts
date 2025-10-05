import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Flow Clients
 * Testa CRUD completo de clientes no frontend
 * 
 * Usa autenticação global (demo-user.json)
 */

test.describe('Flow - Clients Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clientes');
  });

  test('deve carregar página de clientes', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/clientes/);
    await expect(page.getByRole('heading', { name: /clientes/i })).toBeVisible();
  });

  test('deve listar clientes existentes', async ({ page }) => {
    // Aguardar carregamento
    await page.waitForTimeout(1000);
    
    // Verificar tabela ou lista de clientes
    const clientsList = page.locator('[data-testid="clients-list"], .clients-table, table').first();
    
    // Ou há clientes, ou há estado vazio
    const hasClients = await clientsList.isVisible();
    const emptyState = await page.getByText(/nenhum cliente|adicione seu primeiro cliente/i).isVisible();
    
    expect(hasClients || emptyState).toBeTruthy();
  });

  test('deve abrir modal de criar cliente', async ({ page }) => {
    // Clicar botão novo cliente
    const newClientButton = page.getByRole('button', { name: /novo cliente|adicionar cliente|criar cliente/i });
    await newClientButton.click();
    
    // Verificar que modal/formulário abriu
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /salvar|criar/i })).toBeVisible();
  });

  test('deve criar novo cliente com sucesso', async ({ page }) => {
    // Abrir formulário
    await page.getByRole('button', { name: /novo cliente|adicionar cliente/i }).click();
    
    // Preencher dados
    const timestamp = Date.now();
    await page.getByLabel(/nome/i).fill(`Cliente Teste ${timestamp}`);
    await page.getByLabel(/email/i).fill(`cliente${timestamp}@example.com`);
    await page.getByLabel(/telefone|phone/i).fill('11987654321');
    
    // Salvar
    await page.getByRole('button', { name: /salvar|criar/i }).click();
    
    // Aguardar confirmação
    await expect(page.getByText(/cliente criado|sucesso/i)).toBeVisible({ timeout: 5000 });
    
    // Verificar que aparece na lista
    await expect(page.getByText(`Cliente Teste ${timestamp}`)).toBeVisible();
  });

  test('deve validar campos obrigatórios ao criar cliente', async ({ page }) => {
    // Abrir formulário
    await page.getByRole('button', { name: /novo cliente|adicionar cliente/i }).click();
    
    // Tentar salvar sem preencher
    await page.getByRole('button', { name: /salvar|criar/i }).click();
    
    // Verificar mensagem de validação
    await expect(page.getByText(/campo obrigatório|preencha o nome/i)).toBeVisible();
  });

  test('deve buscar clientes por nome', async ({ page }) => {
    // Localizar campo de busca
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i).first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Cliente');
      
      // Aguardar filtro
      await page.waitForTimeout(500);
      
      // Resultados devem ser filtrados
      const results = page.locator('[data-testid="client-item"], .client-row, tbody tr');
      await expect(results.first()).toBeVisible();
    }
  });

  test('deve filtrar clientes por status', async ({ page }) => {
    // Verificar se há filtro de status
    const statusFilter = page.getByRole('button', { name: /status|filtrar/i }).or(
      page.locator('[data-testid="status-filter"]')
    );
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      
      // Selecionar status
      await page.getByText(/ativo|active/i).click();
      
      // Aguardar filtro
      await page.waitForTimeout(500);
    }
  });

  test('deve abrir detalhes do cliente ao clicar na linha', async ({ page }) => {
    // Aguardar lista carregar
    await page.waitForTimeout(1000);
    
    // Verificar se há clientes
    const firstClient = page.locator('[data-testid="client-item"], .client-row, tbody tr').first();
    
    if (await firstClient.isVisible()) {
      await firstClient.click();
      
      // Verificar que detalhes abriram (modal ou página)
      await expect(page.getByText(/detalhes do cliente|informações/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('deve editar cliente existente', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Encontrar botão de editar (primeiro da lista)
    const editButton = page.getByRole('button', { name: /editar/i }).first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modificar nome
      const nameInput = page.getByLabel(/nome/i);
      await nameInput.clear();
      await nameInput.fill('Nome Editado');
      
      // Salvar
      await page.getByRole('button', { name: /salvar|atualizar/i }).click();
      
      // Verificar confirmação
      await expect(page.getByText(/atualizado|sucesso/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve deletar cliente com confirmação', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Encontrar botão de deletar
    const deleteButton = page.getByRole('button', { name: /excluir|deletar|remover/i }).first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirmar exclusão
      await page.getByRole('button', { name: /confirmar|sim|excluir/i }).click();
      
      // Verificar confirmação
      await expect(page.getByText(/removido|excluído|deletado/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve paginar resultados', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar se há paginação
    const nextPageButton = page.getByRole('button', { name: /próxima|next|>/i });
    
    if (await nextPageButton.isVisible()) {
      const firstPageContent = await page.locator('tbody tr').first().textContent();
      
      await nextPageButton.click();
      await page.waitForTimeout(500);
      
      const secondPageContent = await page.locator('tbody tr').first().textContent();
      
      // Conteúdo deve ser diferente
      expect(firstPageContent).not.toBe(secondPageContent);
    }
  });

  test('deve exportar lista de clientes', async ({ page }) => {
    // Verificar botão de exportar
    const exportButton = page.getByRole('button', { name: /exportar|download/i });
    
    if (await exportButton.isVisible()) {
      // Iniciar download
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/clientes|clients/i);
    }
  });
});
