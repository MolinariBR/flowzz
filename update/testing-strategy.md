# 🧪 Estratégia de Testes - FlowZZ

## 🎯 **Objetivo**

Expandir a suíte de testes existente que garanta:
- **Qualidade**: Código confiável e sem regressões
- **Velocidade**: Deploy seguro e frequente
- **Confiabilidade**: Sistema estável em produção

## 📊 **Status Atual dos Testes**
- ✅ Estrutura de testes implementada (Vitest + estrutura de pastas)
- ✅ Testes unitários para DashboardService e SaleService
- ✅ Mocks e helpers configurados
- ⚠️ Cobertura parcial (~30%)
- ❌ Testes E2E não implementados
- ❌ Testes de integração limitados

## 📊 **Pirâmide de Testes**

```
          E2E Tests (5-10%)
     Integration Tests (15-20%)
Unit Tests (70-80%)
```

### **1. Testes Unitários (70-80%)**

#### **1.1 Services**
```typescript
// src/__tests__/services/AuthService.test.ts
describe('AuthService', () => {
  describe('login', () => {
    it('should authenticate valid user', async () => {
      // Arrange
      const mockUser = { id: '1', email: 'test@example.com' }
      prisma.user.findUnique.mockResolvedValue(mockUser)

      // Act
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      })

      // Assert
      expect(result.user).toEqual(mockUser)
      expect(result.tokens).toBeDefined()
    })

    it('should throw error for invalid credentials', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(authService.login({
        email: 'invalid@example.com',
        password: 'wrong'
      })).rejects.toThrow('Invalid credentials')
    })
  })
})
```

#### **1.2 Controllers**
```typescript
// src/__tests__/controllers/AuthController.test.ts
describe('AuthController', () => {
  describe('POST /login', () => {
    it('should return tokens on successful login', async () => {
      // Mock request/response
      const mockReq = {
        body: { email: 'test@example.com', password: 'password123' }
      }
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }

      // Mock service
      const mockResult = {
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' }
      }
      AuthService.prototype.login.mockResolvedValue(mockResult)

      // Act
      await authController.login(mockReq as Request, mockRes as Response)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login realizado com sucesso',
        data: mockResult
      })
    })
  })
})
```

#### **1.3 Utilities**
```typescript
// src/__tests__/utils/password.test.ts
describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash password securely', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      expect(hash).not.toBe(password)
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/) // bcrypt format
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword('wrongPassword', hash)
      expect(isValid).toBe(false)
    })
  })
})
```

### **2. Testes de Integração (15-20%)**

#### **2.1 API Routes**
```typescript
// src/__tests__/integration/auth.routes.test.ts
describe('Auth Routes', () => {
  beforeAll(async () => {
    await createTestDatabase()
  })

  afterAll(async () => {
    await dropTestDatabase()
  })

  describe('POST /auth/register', () => {
    it('should create new user', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data).toHaveProperty('tokens')
    })

    it('should reject duplicate email', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@example.com', // Same email
        password: 'password123'
      }

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409)
    })
  })

  describe('POST /auth/login', () => {
    it('should authenticate user', async () => {
      const loginData = {
        email: 'joao@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('tokens')
    })
  })
})
```

#### **2.2 Database Operations**
```typescript
// src/__tests__/integration/database.test.ts
describe('Database Operations', () => {
  it('should create and retrieve user', async () => {
    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        nome: 'Test User'
      }
    })

    // Retrieve user
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    expect(foundUser?.email).toBe('test@example.com')
    expect(foundUser?.nome).toBe('Test User')
  })

  it('should handle transactions', async () => {
    await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: 'tx@example.com',
          password_hash: 'hash',
          nome: 'Transaction User'
        }
      })

      // Create client for user
      await tx.client.create({
        data: {
          user_id: user.id,
          name: 'Test Client',
          email: 'client@example.com'
        }
      })

      // Verify both were created
      const userWithClients = await tx.user.findUnique({
        where: { id: user.id },
        include: { clients: true }
      })

      expect(userWithClients?.clients).toHaveLength(1)
    })
  })
})
```

#### **2.3 External Integrations**
```typescript
// src/__tests__/integration/coinzz-webhook.test.ts
describe('Coinzz Webhook Integration', () => {
  it('should process order webhook', async () => {
    const webhookData = {
      event: 'order.created',
      data: {
        id: 12345,
        status: 'paid',
        total: 299.99,
        customer: {
          id: 67890,
          name: 'João Silva',
          email: 'joao@email.com'
        },
        items: [{
          name: 'Produto Teste',
          quantity: 1,
          price: 299.99
        }]
      }
    }

    const response = await request(app)
      .post('/webhooks/coinzz')
      .send(webhookData)
      .expect(200)

    // Verify database changes
    const sale = await prisma.sale.findFirst({
      where: { external_id: '12345' }
    })

    expect(sale).toBeDefined()
    expect(sale?.total_price).toBe(299.99)

    const client = await prisma.client.findFirst({
      where: { external_id: '67890' }
    })

    expect(client?.name).toBe('João Silva')
  })
})
```

### **3. Testes E2E (5-10%)**

#### **3.1 User Journey**
```typescript
// e2e/user-registration.test.ts
describe('User Registration Flow', () => {
  it('should complete full registration and login', async () => {
    // Visit landing page
    await page.goto('http://localhost:3000')

    // Click register button
    await page.click('[data-testid="register-button"]')

    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'João Silva')
    await page.fill('[data-testid="email-input"]', 'joao@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="submit-button"]')

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard')

    // Verify dashboard loads
    await expect(page.locator('[data-testid="dashboard-heading"]')).toBeVisible()

    // Logout
    await page.click('[data-testid="logout-button"]')

    // Should redirect to login
    await page.waitForURL('**/login')
  })
})
```

#### **3.2 Admin Panel**
```typescript
// e2e/admin-panel.test.ts
describe('Admin Panel', () => {
  it('should login and manage users', async () => {
    // Login as admin
    await page.goto('http://localhost:4001/login')
    await page.fill('[data-testid="email-input"]', 'admin@flowzz.com.br')
    await page.fill('[data-testid="password-input"]', 'Admin@123')
    await page.click('[data-testid="submit-button"]')

    // Navigate to users
    await page.click('[data-testid="users-menu"]')

    // Verify users table loads
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible()

    // Test user suspension
    await page.click('[data-testid="suspend-user-1"]')
    await page.click('[data-testid="confirm-suspend"]')

    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })
})
```

## 🛠️ **Setup de Testes**

### **1. Configuração Base**
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/supertest": "^2.0.12",
    "jest": "^29.5.0",
    "playwright": "^1.30.0",
    "supertest": "^6.3.3"
  }
}
```

### **2. Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
}
```

### **3. Test Database**
```typescript
// src/__tests__/setup.ts
import { prisma } from '../shared/config/database'

beforeAll(async () => {
  // Create test database
  await prisma.$connect()
})

afterAll(async () => {
  // Clean up
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Reset database state
  await prisma.sale.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()
})
```

### **4. Test Utilities**
```typescript
// src/__tests__/utils/test-helpers.ts
export const createTestUser = async (overrides = {}) => {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      password_hash: 'hashed_password',
      nome: 'Test User',
      ...overrides,
    },
  })
}

export const generateAuthToken = (userId: string) => {
  // Generate JWT token for testing
  return jwt.sign({ userId }, process.env.JWT_SECRET!)
}

export const mockPagBankResponse = {
  code: 'SUB123',
  status: 'ACTIVE',
  link: 'https://pagseguro.com/payment-link',
}
```

## 📊 **CI/CD Pipeline**

### **GitHub Actions**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/flowzz_test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 📈 **Métricas e Relatórios**

### **Coverage Report**
```bash
npm run test:coverage
# Generates coverage/lcov-report/index.html
```

### **Performance Tests**
```typescript
// src/__tests__/performance/auth-performance.test.ts
describe('Auth Performance', () => {
  it('should handle 100 concurrent logins', async () => {
    const promises = Array(100).fill().map(() =>
      request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'password' })
    )

    const start = Date.now()
    const responses = await Promise.all(promises)
    const end = Date.now()

    expect(end - start).toBeLessThan(5000) // < 5 seconds
    responses.forEach(res => expect(res.status).toBe(200))
  })
})
```

## 📋 **Checklist de Qualidade**

### **Code Quality**
- [ ] ESLint sem erros
- [ ] Prettier formatado
- [ ] TypeScript sem erros
- [ ] Coverage > 80%

### **Test Quality**
- [ ] Testes unitários para services
- [ ] Testes de integração para APIs
- [ ] Testes E2E para fluxos críticos
- [ ] Mocks apropriados

### **Performance**
- [ ] Testes de carga básicos
- [ ] Queries otimizadas
- [ ] Cache funcionando
- [ ] Memory leaks verificados

---

## 🎯 **Benefícios Esperados**

- **🚀 Deploy Confiante**: Testes automatizados evitam regressões
- **🔧 Debug Eficiente**: Testes isolados facilitam localização de bugs
- **📈 Qualidade**: Código mais robusto e confiável
- **⚡ Velocidade**: CI/CD rápido com feedback imediato

## 🔄 **Próximos Passos**

Após testes básicos:
1. **Testes de Performance** - Load testing
2. **Testes de Segurança** - Penetration testing
3. **Testes Visuais** - UI regression
4. **Testes A/B** - Feature flags

---

**Data:** 31 de outubro de 2025
**Prioridade:** 🟡 Média
**Tempo Estimado:** 2-3 semanas