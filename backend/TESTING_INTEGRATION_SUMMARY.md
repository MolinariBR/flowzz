# 🧪 Implementação Completa de Testes de Integração

**Data:** 04/10/2025  
**Status:** ✅ Fase 1 e 2 Concluídas | ⏳ Fase 3 Pendente (Playwright E2E)

---

## 📦 O QUE FOI IMPLEMENTADO

### ✅ 1. Dependências Instaladas

```bash
npm install -D supertest @types/supertest @faker-js/faker msw@latest @playwright/test
npx playwright install chromium
```

**Pacotes:**
- `supertest` (3.4.2) - Testes de API REST
- `@faker-js/faker` (9.3.0) - Geração de dados fake pt_BR
- `msw` (2.x) - Mock Service Worker para APIs externas
- `@playwright/test` (1.49.1) - Testes E2E full-stack

---

### ✅ 2. Mocks MSW para APIs Externas

**Localização:** `backend/src/__tests__/mocks/`

#### 2.1. Coinzz API Mock (`coinzz.mock.ts`)
- ✅ GET /sales - Sync de vendas
- ✅ GET /customers - Listar clientes
- ✅ POST /webhook/delivery - Webhook de entrega
- ✅ GET /products - Listar produtos
- ✅ POST /auth/test - Testar conexão
- ✅ Handlers de erro (401, 429, 500)

#### 2.2. Facebook Ads API Mock (`facebook.mock.ts`)
- ✅ GET /oauth/access_token - OAuth callback
- ✅ GET /me/adaccounts - Listar ad accounts
- ✅ GET /act_:accountId/insights - Buscar insights
- ✅ GET /act_:accountId/campaigns - Listar campanhas
- ✅ GET /me - Verificar token
- ✅ GET /debug_token - Validar token
- ✅ Handlers de erro (401, 403, 429)

#### 2.3. WhatsApp Business API Mock (`whatsapp.mock.ts`)
- ✅ POST /:phoneNumberId/messages - Enviar template
- ✅ GET /:phoneNumberId - Buscar informações do número
- ✅ POST /webhook/whatsapp - Webhook de status
- ✅ GET /webhook/whatsapp - Verificação de webhook
- ✅ GET /message_templates - Listar templates aprovados
- ✅ Mock payloads de webhook (sent, delivered, read)
- ✅ Handlers de erro (400, 429)

#### 2.4. PagBank API Mock (`pagbank.mock.ts`)
- ✅ POST /subscriptions - Criar assinatura
- ✅ GET /subscriptions/:code - Buscar assinatura
- ✅ PUT /subscriptions/:code/cancel - Cancelar
- ✅ PUT /subscriptions/:code/suspend - Suspender
- ✅ PUT /subscriptions/:code/activate - Reativar
- ✅ POST /subscriptions/:code/payment-orders - Cobrar
- ✅ GET /transactions/notifications/:code - Consultar notificação
- ✅ POST /webhook/pagbank - Webhook de pagamento
- ✅ Mock payloads de webhook (approved, declined, cancelled)
- ✅ Handlers de erro (401, 404, 400)

#### 2.5. Index Centralizado (`index.ts`)
- ✅ Exporta todos os handlers e servers
- ✅ Funções `setupAllMockServers()`, `startAllMockServers()`, `stopAllMockServers()`, `resetAllMockServers()`

---

### ✅ 3. Factories com @faker

**Localização:** `backend/src/__tests__/factories/`

#### 3.1. Client Factory (`client.factory.ts`)
```typescript
// Funções disponíveis:
- createClient() - Cliente fake completo com locale pt_BR
- createManyClients(count) - Múltiplos clientes
- createVIPClient() - Cliente alto valor (R$ 10k-100k)
- createInactiveClient() - Cliente inativo
- createNewClient() - Cliente novo sem compras

// Campos gerados:
- name: Nome brasileiro realista
- email: Email baseado no nome
- phone: Telefone brasileiro (+55 11 9####-####)
- cpf: CPF formato válido (fake)
- address, city, state, cep: Endereço completo
- status: ACTIVE, INACTIVE, PENDING
- external_id: ID Coinzz (60% de chance)
- total_spent: R$ 0 - R$ 50.000
- total_orders: 0 - 100
- last_order_at: 70% de chance nos últimos 90 dias
```

#### 3.2. Sale Factory (`sale.factory.ts`)
```typescript
// Funções disponíveis:
- createSale() - Venda fake completa
- createManySales(count) - Múltiplas vendas
- createPaidSale() - Venda paga (status PAID)
- createPendingSale() - Venda pendente (boleto)
- createHighValueSale() - Venda alto valor (R$ 3k-10k)
- createRecentSale() - Venda recente (últimos 7 dias)

// Campos gerados:
- product_name: Curso, Ebook, Consultoria, etc.
- product_sku: SKU alfanumérico (60% de chance)
- quantity: 1-3 unidades
- unit_price: R$ 97 - R$ 5.000
- total_price: Calculado automaticamente
- commission: 10% do total (50% de chance)
- status: PAID, PENDING, CANCELLED, REFUNDED
- payment_method: credit_card, pix, boleto, debit_card
- payment_date: 70% de chance nos últimos 30 dias
- shipped_at, delivered_at: Datas realistas
- external_id: ID Coinzz (80% de chance)
```

#### 3.3. User Factory (`user.factory.ts`)
```typescript
// Funções disponíveis:
- createUser() - Usuário fake completo
- createManyUsers(count) - Múltiplos usuários
- createTrialUser() - Trial 7 dias
- createActiveUser() - Assinatura ativa
- createAdminUser() - Admin
- createSuspendedUser() - Suspenso
- createCancelledUser() - Cancelado
- createTestUser() - test@flowzz.com.br (senha: Test@123)
- createTestAdmin() - admin@flowzz.com.br (senha: Test@123)

// Campos gerados:
- email: Email brasileiro
- password_hash: Bcrypt hash de "Test@123" (12 rounds)
- nome: Nome completo brasileiro
- role: USER, ADMIN
- subscription_status: TRIAL, ACTIVE, CANCELLED, SUSPENDED
- trial_ends_at: 30% de chance de ter trial
- is_active: 90% de chance de estar ativo
```

#### 3.4. Index Centralizado (`index.ts`)
- ✅ Exporta todas as funções das factories

---

### ✅ 4. Helpers de Banco de Dados

**Localização:** `backend/src/__tests__/helpers/database.ts`

```typescript
// Funções disponíveis:
- resetDatabase() - Trunca todas as tabelas
- seedDatabase() - Executa seed.ts
- resetAndSeedDatabase() - Reset + Seed
- connectDatabase() - Conecta ao Prisma
- disconnectDatabase() - Desconecta do Prisma
- executeRawQuery(query) - Executa SQL raw
- clearTable(tableName) - Limpa tabela específica
- setupTestDatabase() - Setup global (beforeAll)
- teardownTestDatabase() - Cleanup global (afterAll)

// Export da instância Prisma:
- prisma - Instância do PrismaClient para uso direto
```

---

### ✅ 5. Testes de Integração Backend (API E2E)

**Localização:** `backend/src/__tests__/integration/`

#### 5.1. Auth E2E Tests (`auth.e2e.test.ts`)

**Cobertura Completa:**
- ✅ POST /api/v1/auth/register
  - Registrar novo usuário com trial 7 dias
  - Validar erro 400 para email duplicado
  - Validar erro 400 para senha fraca
  
- ✅ POST /api/v1/auth/login
  - Login com credenciais demo do seed
  - Login com admin do seed
  - Validar erro 401 para credenciais inválidas
  - Validar erro 401 para senha incorreta
  
- ✅ POST /api/v1/auth/refresh
  - Renovar accessToken com refreshToken válido
  - Validar erro 401 para refreshToken inválido
  - Validar erro 401 para refreshToken expirado
  
- ✅ POST /api/v1/auth/logout
  - Invalidar refreshToken ao fazer logout
  - Verificar remoção do token no banco
  - Validar que refresh token não funciona após logout
  
- ✅ GET /api/v1/auth/me
  - Retornar dados do usuário autenticado
  - Validar erro 401 sem token
  - Validar erro 401 com token inválido

**Total:** 13 test cases implementados

**Uso:**
```bash
npm run test:integration
# ou
vitest run src/__tests__/integration/auth.e2e.test.ts
```

---

### ✅ 6. Scripts package.json Atualizados

```json
{
  "scripts": {
    "test": "vitest",                          // Roda todos os testes
    "test:unit": "vitest run src/__tests__/unit",  // Apenas unit tests
    "test:integration": "vitest run src/__tests__/integration",  // Apenas integration tests
    "test:e2e": "playwright test",             // E2E com Playwright (a implementar)
    "test:all": "npm run test && npm run test:e2e",  // Roda tudo
    "test:watch": "vitest --watch",            // Watch mode
    "test:coverage": "vitest --coverage"       // Com coverage
  }
}
```

---

## 📊 ESTRUTURA DE DIRETÓRIOS CRIADA

```
backend/src/__tests__/
├── mocks/                  # ✅ MSW handlers para APIs externas
│   ├── coinzz.mock.ts      # 173 linhas - Coinzz API
│   ├── facebook.mock.ts    # 210 linhas - Facebook Ads API
│   ├── whatsapp.mock.ts    # 283 linhas - WhatsApp Business API
│   ├── pagbank.mock.ts     # 245 linhas - PagBank API
│   └── index.ts            # 84 linhas - Centralizador
│
├── factories/              # ✅ Factories @faker para dados fake
│   ├── client.factory.ts   # 87 linhas - Clientes brasileiros
│   ├── sale.factory.ts     # 100 linhas - Vendas realistas
│   ├── user.factory.ts     # 143 linhas - Usuários c/ bcrypt
│   └── index.ts            # 32 linhas - Centralizador
│
├── helpers/                # ✅ Helpers utilitários
│   └── database.ts         # 108 linhas - Gerenciamento DB
│
├── integration/            # ✅ Testes de integração E2E
│   └── auth.e2e.test.ts    # 340 linhas - 13 test cases
│
├── unit/                   # (Já existente)
│   ├── services/
│   └── repositories/
│
└── (pendente) e2e/         # ⏳ Playwright full-stack E2E
    ├── flow/               # Testes frontend usuário
    ├── admin/              # Testes frontend admin
    └── auth/               # Sessions salvas
```

**Total de linhas adicionadas:** ~1.800 linhas de código de teste

---

## 🎯 PRÓXIMOS PASSOS (FASE 3)

### ⏳ 1. Testes de Integração Backend Restantes

**Arquivos a criar:**

#### `dashboard.e2e.test.ts` (estimativa: 200 linhas)
```typescript
describe('Dashboard E2E Tests', () => {
  - GET /api/v1/dashboard/metrics
    - Calcular métricas com dados do seed
    - Validar cache Redis (5min TTL)
    - Testar com usuário sem vendas
    
  - GET /api/v1/dashboard/chart
    - Retornar dados para gráfico (7d, 30d, 90d)
    - Validar formato de resposta
    
  - GET /api/v1/dashboard/activities
    - Listar últimas 20 atividades
    - Testar paginação
});
```

#### `clients.e2e.test.ts` (estimativa: 300 linhas)
```typescript
describe('Clients E2E Tests', () => {
  - GET /api/v1/clients (lista com paginação)
  - GET /api/v1/clients/:id (buscar específico)
  - POST /api/v1/clients (criar com validação)
  - PUT /api/v1/clients/:id (atualizar)
  - DELETE /api/v1/clients/:id (soft delete)
  
  // Testes com factories
  - Listar 50 clientes (usar createManyClients)
  - Filtrar por status (ACTIVE, INACTIVE, PENDING)
  - Buscar por nome/email
  - Testar isolamento multi-tenancy
});
```

---

### ⏳ 2. Configurar Playwright E2E Full-Stack

**Arquivos a criar:**

#### `playwright.config.ts` (raiz do projeto)
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: [
    { command: 'cd backend && npm run dev', port: 4000 },
    { command: 'cd flow && npm run dev', port: 3000 },
    { command: 'cd admin && npm run dev', port: 5173 },
  ],
  projects: [
    { name: 'flow', testDir: './e2e/flow' },
    { name: 'admin', testDir: './e2e/admin', use: { baseURL: 'http://localhost:5173' } },
  ],
});
```

#### `e2e/auth/setup.ts`
```typescript
// Gerar session files para reutilizar autenticação
// demo-user.json, admin-user.json
```

#### `e2e/flow/dashboard.spec.ts`
```typescript
test('Ver dashboard com dados do seed', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await expect(page.locator('[data-testid="vendas-hoje"]')).toBeVisible();
  // ... validações
});
```

#### `e2e/admin/metrics.spec.ts`
```typescript
test('Ver métricas SaaS', async ({ page }) => {
  await page.goto('http://localhost:5173/admin/metrics');
  await expect(page.locator('[data-testid="mrr"]')).toBeVisible();
  // ... validações
});
```

---

## 📚 COMO USAR

### 1. Rodar Testes de Integração Backend

```bash
# Setup inicial (apenas 1x)
npm run db:migrate
npm run db:seed

# Rodar todos os testes de integração
npm run test:integration

# Rodar apenas auth tests
vitest run src/__tests__/integration/auth.e2e.test.ts

# Watch mode
npm run test:watch
```

### 2. Usar Factories nos Testes

```typescript
import { createClient, createManyClients, createVIPClient } from '../factories';
import { prisma } from '../helpers/database';

// Criar 1 cliente
const client = await prisma.client.create({
  data: createClient({
    user: { connect: { id: userId } },
    name: 'Nome Customizado',
  }),
});

// Criar 50 clientes
const clients = createManyClients(50, {
  user: { connect: { id: userId } },
});

await prisma.client.createMany({ data: clients });

// Criar cliente VIP
const vip = await prisma.client.create({
  data: createVIPClient({
    user: { connect: { id: userId } },
  }),
});
```

### 3. Usar MSW nos Testes

```typescript
import { coinzzServer, coinzzErrorHandlers } from '../mocks';

describe('Coinzz Integration Tests', () => {
  beforeAll(() => coinzzServer.listen());
  afterEach(() => coinzzServer.resetHandlers());
  afterAll(() => coinzzServer.close());

  test('Sync vendas com sucesso', async () => {
    // coinzzServer mockará automaticamente as chamadas HTTP
    const sales = await CoinzzService.syncSales(userId);
    expect(sales).toHaveLength(2);
  });

  test('Simular rate limit', async () => {
    // Substituir handler para simular erro
    coinzzServer.use(...coinzzErrorHandlers);
    
    await expect(CoinzzService.syncSales(userId)).rejects.toThrow();
  });
});
```

### 4. Gerenciar Banco de Dados

```typescript
import { resetDatabase, seedDatabase, prisma } from '../helpers/database';

beforeEach(async () => {
  await resetDatabase(); // Limpa todas as tabelas
  await seedDatabase();   // Popula com dados demo
});

// Ou usar seed existente + adicionar dados fake
beforeEach(async () => {
  await resetAndSeedDatabase();
  
  // Adicionar 10 clientes fake além do seed
  const fakeClients = createManyClients(10, {
    user: { connect: { email: 'demo@flowzz.com.br' } },
  });
  
  await prisma.client.createMany({ data: fakeClients });
});
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Cannot find module '../server'"
**Solução:** Verificar se `export default app` existe em `server.ts`

### Erro: "ECONNREFUSED" ao rodar testes
**Solução:** Garantir que PostgreSQL está rodando:
```bash
docker-compose up -d
```

### Erro: "seed.ts not found"
**Solução:** Verificar path em `database.ts`:
```typescript
const seedPath = path.join(__dirname, '../../prisma/seed.ts');
```

### Testes ficam pendentes sem rodar
**Solução:** Aumentar timeout do Vitest:
```typescript
// No beforeAll
beforeAll(async () => {
  await setupTestDatabase();
}, 30000); // 30 segundos
```

---

## 📈 MÉTRICAS DE SUCESSO

### Estado Atual
- ✅ **Testes Unitários:** 256/308 passando (83.1%)
- ✅ **MSW Mocks:** 4 APIs externas completas
- ✅ **Factories:** 3 entidades principais (Client, Sale, User)
- ✅ **Testes Integração:** 13 test cases (auth)
- ⏳ **Testes E2E:** 0 (a implementar)

### Meta Final (Estimativa)
- 🎯 **Testes Unitários:** 290/308 passando (94%)
- 🎯 **Testes Integração:** 50+ test cases
- 🎯 **Testes E2E:** 10 fluxos críticos
- 🎯 **Coverage Total:** >85%

---

## 🎉 PRÓXIMA AÇÃO RECOMENDADA

1. **Rodar testes de integração auth:**
   ```bash
   npm run test:integration
   ```

2. **Implementar dashboard.e2e.test.ts e clients.e2e.test.ts**

3. **Configurar Playwright após backends estarem 100% testados**

4. **Documentar casos de uso no README.md**

---

**Documentação gerada em:** 04/10/2025 23:45  
**Versão:** 1.0.0  
**Autor:** GitHub Copilot + Mau  
**Total de implementação:** ~3 horas  
**Linhas de código:** ~1.800 linhas
