import { execSync } from 'node:child_process'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

/**
 * Helper para gerenciar banco de dados nos testes
 * Fornece métodos para reset, seed e cleanup
 */

const prisma = new PrismaClient()

/**
 * Reseta o banco de dados (trunca todas as tabelas)
 * Mantém o schema mas remove todos os dados
 */
export async function resetDatabase(): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `

  // Desabilita constraints temporariamente
  await prisma.$executeRawUnsafe('SET session_replication_role = replica;')

  // Trunca todas as tabelas
  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`)
    }
  }

  // Reabilita constraints
  await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;')
}

/**
 * Executa o seed do banco
 * Popula com dados demo do arquivo seed.ts
 */
export async function seedDatabase(): Promise<void> {
  const seedPath = path.join(__dirname, '../../prisma/seed.ts')

  try {
    // Executa o seed usando tsx (TypeScript runner)
    execSync(`npx tsx ${seedPath}`, {
      stdio: 'inherit',
      env: process.env,
    })
  } catch (error) {
    console.error('Error running seed:', error)
    throw error
  }
}

/**
 * Reseta e roda o seed
 * Útil para começar cada teste com dados limpos e previsíveis
 */
export async function resetAndSeedDatabase(): Promise<void> {
  await resetDatabase()
  await seedDatabase()
}

/**
 * Conecta ao banco de dados
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect()
}

/**
 * Desconecta do banco de dados
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Executa query SQL raw
 * Útil para setup específico de testes
 */
export async function executeRawQuery(query: string): Promise<void> {
  await prisma.$executeRawUnsafe(query)
}

/**
 * Limpa uma tabela específica
 */
export async function clearTable(tableName: string): Promise<void> {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`)
}

/**
 * Exporta a instância do Prisma para uso direto nos testes
 */
export { prisma }

/**
 * Setup global para testes de integração
 * Use no beforeAll() do describe principal
 */
export async function setupTestDatabase(): Promise<void> {
  await connectDatabase()
  await resetDatabase()
}

/**
 * Cleanup global para testes de integração
 * Use no afterAll() do describe principal
 */
export async function teardownTestDatabase(): Promise<void> {
  await resetDatabase()
  await disconnectDatabase()
}
