import { faker } from '@faker-js/faker/locale/pt_BR'
import type { Prisma, Role, SubscriptionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * Factory para criar dados fake de User
 * Usa locale pt_BR para dados brasileiros realistas
 */

/**
 * Gera um usuário fake completo
 */
export function createUser(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  const nome = faker.person.fullName()
  const nameParts = nome.split(' ')
  const firstName = nameParts[0] || 'User'
  const lastName = nameParts[nameParts.length - 1] || 'Test'
  const email = faker.internet.email({
    firstName: firstName.toLowerCase(),
    lastName: lastName.toLowerCase(),
  })

  // Senha padrão para testes: "Test@123"
  const passwordHash = bcrypt.hashSync('Test@123', 12)

  return {
    email,
    password_hash: passwordHash,
    nome,
    role: faker.helpers.arrayElement(['USER', 'ADMIN'] as Role[]),
    subscription_status: faker.helpers.arrayElement([
      'TRIAL',
      'ACTIVE',
      'CANCELLED',
      'SUSPENDED',
    ] as SubscriptionStatus[]),
    trial_ends_at:
      faker.helpers.maybe(() => faker.date.future({ years: 0.1 }), {
        probability: 0.3,
      }) ?? null,
    is_active: faker.datatype.boolean({ probability: 0.9 }),
    ...overrides,
  }
}

/**
 * Gera múltiplos usuários
 */
export function createManyUsers(
  count: number,
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput[] {
  return Array.from({ length: count }, () => createUser(overrides))
}

/**
 * Gera usuário em trial (7 dias)
 */
export function createTrialUser(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 7)

  return createUser({
    role: 'USER' as Role,
    subscription_status: 'TRIAL' as SubscriptionStatus,
    trial_ends_at: trialEndsAt,
    is_active: true,
    ...overrides,
  })
}

/**
 * Gera usuário com assinatura ativa
 */
export function createActiveUser(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  return createUser({
    role: 'USER' as Role,
    subscription_status: 'ACTIVE' as SubscriptionStatus,
    trial_ends_at: null,
    is_active: true,
    ...overrides,
  })
}

/**
 * Gera usuário admin
 */
export function createAdminUser(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  return createUser({
    role: 'ADMIN' as Role,
    subscription_status: 'ACTIVE' as SubscriptionStatus,
    trial_ends_at: null,
    is_active: true,
    ...overrides,
  })
}

/**
 * Gera usuário suspenso
 */
export function createSuspendedUser(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  return createUser({
    role: 'USER' as Role,
    subscription_status: 'SUSPENDED' as SubscriptionStatus,
    is_active: false,
    ...overrides,
  })
}

/**
 * Gera usuário cancelado
 */
export function createCancelledUser(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  return createUser({
    role: 'USER' as Role,
    subscription_status: 'CANCELLED' as SubscriptionStatus,
    is_active: true, // Ainda pode acessar até fim do período
    ...overrides,
  })
}

/**
 * Cria credenciais de teste padrão
 * Email: test@flowzz.com.br
 * Senha: Test@123
 */
export function createTestUser(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  return createUser({
    email: 'test@flowzz.com.br',
    nome: 'Test User',
    role: 'USER' as Role,
    subscription_status: 'ACTIVE' as SubscriptionStatus,
    is_active: true,
    ...overrides,
  })
}

/**
 * Cria admin de teste padrão
 * Email: admin@flowzz.com.br
 * Senha: Test@123
 */
export function createTestAdmin(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  return createUser({
    email: 'admin@flowzz.com.br',
    nome: 'Admin User',
    role: 'ADMIN' as Role,
    subscription_status: 'ACTIVE' as SubscriptionStatus,
    is_active: true,
    ...overrides,
  })
}
