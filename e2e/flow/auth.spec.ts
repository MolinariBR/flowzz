import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Flow Authentication
 * Testa fluxo completo de autenticação no frontend Flow
 */

test.describe('Flow - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar storage para garantir estado limpo
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('deve mostrar formulário de login', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher formulário
    await page.getByLabel(/email/i).fill('demo@flowzz.com.br');
    await page.getByLabel(/senha/i).fill('Demo@123');
    
    // Submeter
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Aguardar redirecionamento para dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Verificar que dashboard carregou
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher formulário com dados inválidos
    await page.getByLabel(/email/i).fill('invalido@example.com');
    await page.getByLabel(/senha/i).fill('SenhaErrada123');
    
    // Submeter
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Aguardar tentativa de login
    await page.waitForTimeout(2000);
    
    // Verificar que NÃO redirecionou para dashboard (permanece em /login)
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verificar que ainda pode ver o formulário (não foi autenticado)
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('deve fazer logout corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@flowzz.com.br');
    await page.getByLabel(/senha/i).fill('Demo@123');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Abrir menu de perfil
    await page.locator('button:has-text("João Silva")').click();
    
    // Aguardar menu aparecer e clicar no botão de logout
    await page.waitForSelector('[data-testid="logout-button"]', { state: 'visible' });
    await page.getByTestId('logout-button').click();
    
    // Verificar redirecionamento para login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });

  test('deve mostrar link para registro', async ({ page }) => {
    await page.goto('/login');
    
    const registerLink = page.getByRole('link', { name: /criar conta|cadastrar|trial grátis/i });
    await expect(registerLink).toBeVisible();
    
    await registerLink.click();
    await expect(page).toHaveURL(/.*\/register/);
  });
});
