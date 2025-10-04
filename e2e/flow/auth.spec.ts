import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Flow Authentication
 * Testa fluxo completo de autenticação no frontend Flow
 */

test.describe('Flow - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/login/);
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
    
    // Verificar mensagem de erro
    await expect(page.getByText(/credenciais inválidas|email ou senha incorretos/i)).toBeVisible();
  });

  test('deve fazer logout corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@flowzz.com.br');
    await page.getByLabel(/senha/i).fill('Demo@123');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Fazer logout
    await page.getByRole('button', { name: /sair|logout/i }).click();
    
    // Verificar redirecionamento para login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('deve validar formato de email', async ({ page }) => {
    await page.goto('/login');
    
    // Email inválido
    await page.getByLabel(/email/i).fill('email-invalido');
    await page.getByLabel(/senha/i).fill('Senha@123');
    
    // Verificar validação
    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });

  test('deve mostrar link para registro', async ({ page }) => {
    await page.goto('/login');
    
    const registerLink = page.getByRole('link', { name: /criar conta|cadastrar/i });
    await expect(registerLink).toBeVisible();
    
    await registerLink.click();
    await expect(page).toHaveURL(/.*\/register/);
  });
});
