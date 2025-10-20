// Referência: design.md §Testing Strategy - Setup global para testes
// Mock global do Prisma Client e configurações de ambiente de teste

import { afterAll, afterEach, beforeAll, vi } from 'vitest'

// Mock do Prisma Client
vi.mock('../shared/config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    client: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    sale: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    tag: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    ad: {
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// Mock do RedisService
vi.mock('../shared/services/RedisService', () => ({
  redisService: {
    getDashboardMetrics: vi.fn(),
    setDashboardMetrics: vi.fn(),
    invalidateDashboardCache: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}))

// Configurar variáveis de ambiente para testes
beforeAll(() => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only'
  process.env.JWT_EXPIRES_IN = '15m'
  process.env.JWT_REFRESH_EXPIRES_IN = '7d'
})

// Limpar mocks após cada teste
afterEach(() => {
  vi.clearAllMocks()
})

// Cleanup após todos os testes
afterAll(() => {
  vi.restoreAllMocks()
})
