/**
 * Setup global para testes de integração
 */

import { afterAll, beforeAll } from 'vitest'

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
