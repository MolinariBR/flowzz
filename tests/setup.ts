/**
 * Setup global para testes de integração
 */

import { afterAll, beforeAll, vi } from 'vitest'

// Mock Redis para evitar problemas de carregamento
vi.mock('../backend/src/shared/config/redis', () => ({
  redisConfig: {
    host: 'localhost',
    port: 6380,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
  },
  createRedisClient: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    keys: vi.fn(),
    scan: vi.fn(),
    hget: vi.fn(),
    hset: vi.fn(),
    hdel: vi.fn(),
    hgetall: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    smembers: vi.fn(),
    sismember: vi.fn(),
    incr: vi.fn(),
    decr: vi.fn(),
    exists: vi.fn(),
    ping: vi.fn(),
    quit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
  })),
  checkRedisHealth: vi.fn(() => Promise.resolve(true)),
  disconnectRedis: vi.fn(() => Promise.resolve()),
}))

// Configurar variáveis de ambiente para testes
beforeAll(async () => {
  // Configurar banco de dados de teste
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ||
    'postgresql://flowzz_user:flowzz_password@localhost:5433/flowzz_test'
  process.env.REDIS_URL = process.env.REDIS_URL_TEST || 'redis://localhost:6380/1'
  process.env.NODE_ENV = 'test'

  console.log('🧪 Configurando ambiente de teste...')
  console.log('📊 Database URL:', process.env.DATABASE_URL)
  console.log('🔴 Redis URL:', process.env.REDIS_URL)
})

afterAll(async () => {
  console.log('🧪 Testes finalizados')
})
