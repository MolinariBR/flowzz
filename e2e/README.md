# Playwright E2E Tests - Flowzz

Este diretório contém os testes end-to-end (E2E) completos para o sistema Flowzz usando Playwright.

## 📁 Estrutura

```
e2e/
├── .auth/                 # Session files (gerados automaticamente)
│   ├── demo-user.json    # Sessão demo@flowzz.com.br
│   └── admin-user.json   # Sessão admin@flowzz.com.br
├── auth.setup.ts         # Setup global de autenticação
├── flow/                 # Testes do frontend Flow (usuário)
│   ├── auth.spec.ts     # Autenticação e registro
│   ├── dashboard.spec.ts # Dashboard e métricas
│   └── clients.spec.ts  # Gestão de clientes
└── admin/               # Testes do painel Admin
    ├── auth.spec.ts    # Autenticação admin
    ├── metrics.spec.ts # Métricas SaaS (MRR, ARR, Churn)
    └── users.spec.ts   # Gestão de usuários
```

## 🚀 Como Executar

### Pré-requisitos

1. Instalar dependências:
```bash
cd /home/mau/projetos/flowzz
pnpm install
pnpm exec playwright install chromium
```

2. Configurar variáveis de ambiente:
```bash
# Backend deve usar banco de teste
export DATABASE_URL_TEST="postgresql://user:pass@localhost:5432/flowzz_test"
export REDIS_URL_TEST="redis://localhost:6379/1"
```

3. Garantir que seed está populado:
```bash
cd backend
pnpm run db:seed
```

### Executar testes

```bash
# Todos os testes E2E
pnpm run test:e2e

# Com UI interativa (recomendado para desenvolvimento)
pnpm run test:e2e:ui

# Apenas Flow frontend
pnpm run test:e2e:flow

# Apenas Admin panel
pnpm run test:e2e:admin

# Com navegador visível (headed mode)
pnpm run test:e2e:headed

# Debug modo passo-a-passo
pnpm run test:e2e:debug

# Ver relatório HTML
pnpm run test:e2e:report
```

## 🧪 Cobertura de Testes

### Flow Frontend (7 specs, ~30 test cases)

**auth.spec.ts** (7 casos):
- ✅ Redirecionar para /login quando não autenticado
- ✅ Mostrar formulário de login
- ✅ Login com credenciais válidas
- ✅ Erro com credenciais inválidas
- ✅ Logout funcional
- ✅ Validação formato de email
- ✅ Link para registro

**dashboard.spec.ts** (10 casos):
- ✅ Carregar métricas visíveis
- ✅ Exibir valores numéricos
- ✅ Renderizar gráfico de vendas
- ✅ Alternar período gráfico (7d/30d)
- ✅ Listar atividades recentes
- ✅ Estado vazio atividades
- ✅ Navegação menu lateral
- ✅ Responsivo mobile
- ✅ Pull-to-refresh

**clients.spec.ts** (12 casos):
- ✅ Carregar página de clientes
- ✅ Listar clientes existentes
- ✅ Abrir modal criar cliente
- ✅ Criar novo cliente
- ✅ Validar campos obrigatórios
- ✅ Buscar clientes por nome
- ✅ Filtrar por status
- ✅ Abrir detalhes do cliente
- ✅ Editar cliente existente
- ✅ Deletar com confirmação
- ✅ Paginação
- ✅ Exportar lista

### Admin Panel (3 specs, ~25 test cases)

**auth.spec.ts** (4 casos):
- ✅ Redirecionar para /login quando não autenticado
- ✅ Login admin com sucesso
- ✅ Erro ao tentar login de usuário comum
- ✅ Logout do admin

**metrics.spec.ts** (12 casos):
- ✅ Carregar dashboard de métricas
- ✅ Exibir MRR (Monthly Recurring Revenue)
- ✅ Exibir ARR (Annual Recurring Revenue)
- ✅ Exibir taxa de Churn
- ✅ Exibir LTV (Lifetime Value)
- ✅ Exibir CAC (Customer Acquisition Cost)
- ✅ Renderizar gráfico crescimento MRR
- ✅ Alternar período de visualização
- ✅ Total de usuários ativos
- ✅ Novos registros do mês
- ✅ Calcular relação LTV/CAC
- ✅ Tendência de crescimento

**users.spec.ts** (11 casos):
- ✅ Carregar página de usuários
- ✅ Listar todos os usuários
- ✅ Exibir informações dos usuários
- ✅ Buscar usuários por email
- ✅ Filtrar por status
- ✅ Abrir detalhes do usuário
- ✅ Histórico de assinaturas
- ✅ Suspender usuário
- ✅ Reativar usuário suspenso
- ✅ Visualizar audit logs
- ✅ Paginar lista

## 🔐 Autenticação

Os testes usam **autenticação global** via `auth.setup.ts`:

1. **Setup executado ANTES de todos os testes**
2. Faz login via API para `demo@flowzz.com.br` e `admin@flowzz.com.br`
3. Salva tokens em `e2e/.auth/*.json`
4. Testes reutilizam sessões (sem re-login a cada teste)

### Credenciais

- **Demo User**: demo@flowzz.com.br / Demo@123
- **Admin User**: admin@flowzz.com.br / Admin@123

(Criadas via `backend/prisma/seed.ts`)

## ⚙️ Configuração

### playwright.config.ts

```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { 
    name: 'flow',
    baseURL: 'http://localhost:3000',
    storageState: 'e2e/.auth/demo-user.json',
    dependencies: ['setup']
  },
  {
    name: 'admin',
    baseURL: 'http://localhost:5173',
    storageState: 'e2e/.auth/admin-user.json',
    dependencies: ['setup']
  }
]

webServer: [
  { command: 'cd backend && pnpm run dev', url: 'http://localhost:4000/health' },
  { command: 'cd flow && pnpm run dev', url: 'http://localhost:3000' },
  { command: 'cd admin && pnpm run dev', url: 'http://localhost:5173' }
]
```

### Portas

- **Backend API**: 4000
- **Flow Frontend**: 3000
- **Admin Panel**: 5173
- **Landing**: 3001 (não testado)

## 🎯 Estratégia de Testes

### Testes Resilientes

Todos os testes seguem boas práticas:

1. **Seletores Semânticos**: `getByRole`, `getByLabel`, `getByText` (evita seletores CSS frágeis)
2. **Esperas Inteligentes**: `expect().toBeVisible()` com timeout automático
3. **Condicionais Defensivos**: Verifica se elemento existe antes de interagir
4. **Estado Vazio**: Testa both happy path E estado vazio
5. **Timeouts**: `waitForTimeout` apenas quando necessário (animações/API)

### Exemplo de Teste Resiliente

```typescript
test('deve criar novo cliente', async ({ page }) => {
  // 1. Abrir formulário
  await page.getByRole('button', { name: /novo cliente/i }).click();
  
  // 2. Preencher
  const timestamp = Date.now(); // Evita duplicados
  await page.getByLabel(/nome/i).fill(`Cliente ${timestamp}`);
  
  // 3. Salvar
  await page.getByRole('button', { name: /salvar/i }).click();
  
  // 4. Verificar confirmação
  await expect(page.getByText(/sucesso/i)).toBeVisible({ timeout: 5000 });
  
  // 5. Verificar na lista
  await expect(page.getByText(`Cliente ${timestamp}`)).toBeVisible();
});
```

## 📊 Relatórios

Após executar testes, visualize o relatório HTML:

```bash
pnpm run test:e2e:report
```

Abre navegador com:
- ✅ Testes passados/falhados
- 📹 Screenshots/vídeos de falhas
- ⏱️ Duração de cada teste
- 📈 Timeline de execução

## 🐛 Debug

### Modo UI (Recomendado)

```bash
pnpm run test:e2e:ui
```

Permite:
- ▶️ Executar testes individualmente
- 🔍 Inspecionar cada passo
- 🎬 Ver gravação de tela
- 🕵️ Debug DOM em cada passo

### Modo Debug Passo-a-Passo

```bash
pnpm run test:e2e:debug
```

Abre Playwright Inspector para step-by-step debugging.

### Headed Mode

```bash
pnpm run test:e2e:headed
```

Executa com navegador visível (útil para ver o que está acontecendo).

## 📝 Criar Novos Testes

### Flow Frontend

```typescript
// e2e/flow/meu-teste.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Flow - Minha Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/minha-rota');
  });

  test('deve fazer algo', async ({ page }) => {
    // Usa demo-user.json automaticamente
    await expect(page.getByText(/algo/i)).toBeVisible();
  });
});
```

### Admin Panel

```typescript
// e2e/admin/meu-teste.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin - Minha Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/minha-rota');
  });

  test('deve fazer algo admin', async ({ page }) => {
    // Usa admin-user.json automaticamente
    await expect(page.getByText(/algo/i)).toBeVisible();
  });
});
```

## 🔧 Troubleshooting

### Erro: "Timeout waiting for locator"

1. Verificar se elemento realmente existe na página
2. Aumentar timeout: `await expect(element).toBeVisible({ timeout: 10000 })`
3. Adicionar wait: `await page.waitForTimeout(1000)`

### Erro: "Session file not found"

1. Executar setup manualmente:
```bash
pnpm exec playwright test auth.setup.ts
```

### Backend não inicia

1. Verificar porta 4000 disponível:
```bash
lsof -ti:4000 | xargs kill -9
```

2. Verificar DATABASE_URL_TEST configurado

### Frontend não carrega

1. Verificar portas 3000 e 5173 disponíveis
2. Executar manualmente:
```bash
cd flow && pnpm run dev
cd admin && pnpm run dev
```

## 🚀 CI/CD

Para executar no CI (GitHub Actions, GitLab CI):

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps chromium

- name: Run E2E Tests
  run: pnpm run test:e2e
  env:
    CI: true
    DATABASE_URL_TEST: ${{ secrets.DATABASE_URL_TEST }}

- name: Upload Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 📚 Recursos

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Test Patterns](https://playwright.dev/docs/test-annotations)

---

**Total de Testes E2E**: ~55 test cases
**Cobertura**: Flow (3 specs) + Admin (3 specs) + Setup (1 spec)
**Tempo Estimado**: ~5min execução completa
