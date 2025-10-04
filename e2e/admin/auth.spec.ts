import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Admin Authentication
 * Testa fluxo de autenticação no painel administrativo
 */

test.describe('Admin - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('deve fazer login de admin com sucesso', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher credenciais de admin
    await page.getByLabel(/email/i).fill('admin@flowzz.com.br');
    await page.getByLabel(/senha/i).fill('Admin@123');
    
    // Submeter
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Deve redirecionar para dashboard/metrics
    await expect(page).toHaveURL(/.*\/(dashboard|metrics)/);
  });

  test('deve mostrar erro ao tentar login de usuário comum no admin', async ({ page }) => {
    await page.goto('/login');
    
    // Tentar login com usuário não-admin
    await page.getByLabel(/email/i).fill('demo@flowzz.com.br');
    await page.getByLabel(/senha/i).fill('Demo@123');
    
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Deve mostrar erro de permissão (toast ou mensagem de erro)
    await expect(page.locator('[role="status"], [role="alert"], .Toastify, [data-sonner-toast]').filter({ hasText: /acesso negado|apenas administradores/i })).toBeVisible({ timeout: 10000 });
  });

  test('deve fazer logout do admin', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@flowzz.com.br');
    await page.getByLabel(/senha/i).fill('Admin@123');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await expect(page).toHaveURL(/.*\/(dashboard|metrics)/);
    
    // Abrir dropdown do perfil
    await page.getByTestId('profile-dropdown-button').click();
    
    // Logout
    await page.getByTestId('logout-button').click();
    
    // Redirecionar para login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
