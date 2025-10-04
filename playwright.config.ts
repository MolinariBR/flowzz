import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration - Flowzz
 * Testa integração completa: Backend (4000) + Flow (3000) + Admin (5173)
 * 
 * Referência: TESTING_INTEGRATION_SUMMARY.md
 */
export default defineConfig({
  testDir: './e2e',
  
  // Timeout configurations
  timeout: 30 * 1000, // 30s por teste
  expect: {
    timeout: 5000, // 5s para expects
  },

  // Configuração de execução
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'playwright-results.json' }],
  ],

  // Configurações globais
  use: {
    // Base URL para testes
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Locale brasileiro
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  // Projetos de teste - diferentes frontends
  projects: [
    // Setup - Autenticação global
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Flow Frontend (usuário final)
    {
      name: 'flow',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
        storageState: 'e2e/.auth/demo-user.json',
      },
      dependencies: ['setup'],
      testMatch: /e2e\/flow\/.*.spec.ts/,
    },

    // Admin Panel Frontend
    {
      name: 'admin',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        storageState: 'e2e/.auth/admin-user.json',
      },
      dependencies: ['setup'],
      testMatch: /e2e\/admin\/.*.spec.ts/,
    },

    // Mobile - Flow
    {
      name: 'flow-mobile',
      use: {
        ...devices['iPhone 13'],
        baseURL: 'http://localhost:3000',
        storageState: 'e2e/.auth/demo-user.json',
      },
      dependencies: ['setup'],
      testMatch: /e2e\/flow\/.*\.mobile\.spec\.ts/,
    },
  ],

  // Web Servers - inicia backend + frontends
  webServer: [
    // Backend API
    {
      command: 'cd backend && pnpm run dev',
      url: 'http://localhost:4000/health',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL_TEST || process.env.REDIS_URL,
      },
    },
    // Flow Frontend
    {
      command: 'cd flow && pnpm run dev',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    // Admin Frontend
    {
      command: 'cd admin && pnpm run dev',
      url: 'http://localhost:5173',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
