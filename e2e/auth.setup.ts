import { test as setup, expect } from '@playwright/test';
import path from 'path';

/**
 * Setup global de autenticação
 * Cria session files para demo@flowzz.com.br e admin@flowzz.com.br
 * 
 * Executado ANTES de todos os testes E2E
 * Sessões são reutilizadas em todos os projetos
 */

const DEMO_USER_FILE = path.join(__dirname, '.auth/demo-user.json');
const ADMIN_USER_FILE = path.join(__dirname, '.auth/admin-user.json');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * Setup para usuário demo (flow frontend)
 */
setup('authenticate demo user', async ({ request }) => {
  // Login via API
  const response = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
    data: {
      email: 'demo@flowzz.com.br',
      password: 'Demo@123',
    },
  });

  expect(response.ok()).toBeTruthy();
  
  const responseData = await response.json();
  // ✅ Formato correto: { data: { user, tokens }, message }
  expect(responseData).toHaveProperty('data');
  expect(responseData.data).toHaveProperty('tokens');
  expect(responseData.data).toHaveProperty('user');

  const { tokens, user } = responseData.data;

  // Salvar tokens em storage state
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3001', // Flow app port
        localStorage: [
          {
            name: 'accessToken',
            value: tokens.accessToken,
          },
          {
            name: 'refreshToken',
            value: tokens.refreshToken,
          },
          {
            name: 'user',
            value: JSON.stringify(user),
          },
        ],
      },
    ],
  };

  // Escrever arquivo de sessão
  const fs = await import('fs/promises');
  await fs.mkdir(path.dirname(DEMO_USER_FILE), { recursive: true });
  await fs.writeFile(DEMO_USER_FILE, JSON.stringify(storageState, null, 2));

  console.log('✅ Demo user authenticated and session saved');
});

/**
 * Setup para usuário admin (admin panel)
 */
setup('authenticate admin user', async ({ request }) => {
  // Login via API
  const response = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
    data: {
      email: 'admin@flowzz.com.br',
      password: 'Admin@123',
    },
  });

  expect(response.ok()).toBeTruthy();
  
  const responseData = await response.json();
  // ✅ Formato correto: { data: { user, tokens }, message }
  expect(responseData).toHaveProperty('data');
  expect(responseData.data).toHaveProperty('tokens');
  expect(responseData.data).toHaveProperty('user');

  const { tokens, user } = responseData.data;

  // Salvar tokens em storage state
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          {
            name: 'access_token',
            value: tokens.accessToken,
          },
          {
            name: 'refresh_token',
            value: tokens.refreshToken,
          },
          {
            name: 'user',
            value: JSON.stringify(user),
          },
          {
            name: 'admin-auth-storage',
            value: JSON.stringify({
              state: {
                user: {
                  id: user.id,
                  name: user.nome,
                  email: user.email,
                  role: user.role,
                  avatar: user.avatar_url || undefined
                },
                token: tokens.accessToken,
                role: user.role,
                isAuthenticated: true
              },
              version: 0
            }),
          },
        ],
      },
    ],
  };

  // Escrever arquivo de sessão
  const fs = await import('fs/promises');
  await fs.mkdir(path.dirname(ADMIN_USER_FILE), { recursive: true });
  await fs.writeFile(ADMIN_USER_FILE, JSON.stringify(storageState, null, 2));

  console.log('✅ Admin user authenticated and session saved');
});
