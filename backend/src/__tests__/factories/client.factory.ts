import { faker } from '@faker-js/faker/locale/pt_BR';
import type { Prisma, ClientStatus } from '@prisma/client';

/**
 * Factory para criar dados fake de Client
 * Usa locale pt_BR para dados brasileiros realistas
 */

/**
 * Gera um cliente fake completo
 */
export function createClient(overrides: Partial<Prisma.ClientCreateInput> = {}): Prisma.ClientCreateInput {
  const nome = faker.person.fullName();
  const nameParts = nome.split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts[nameParts.length - 1] || 'Test';
  const email = faker.internet.email({ firstName, lastName });
  
  // Gerar telefone brasileiro
  const ddd = faker.helpers.arrayElement(['11', '21', '47', '85', '71']);
  const telefone = `+55 ${ddd} 9${faker.string.numeric(4)}-${faker.string.numeric(4)}`;
  
  // Gerar CPF fake (formato válido mas não real)
  const cpf = `${faker.string.numeric(3)}.${faker.string.numeric(3)}.${faker.string.numeric(3)}-${faker.string.numeric(2)}`;
  
  return {
    name: nome,
    email,
    phone: telefone,
    cpf,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    cep: faker.location.zipCode('#####-###'),
    status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PENDING'] as ClientStatus[]),
    external_id: faker.helpers.maybe(() => `coinzz_${faker.string.alphanumeric(10)}`, { probability: 0.6 }) ?? null,
    total_spent: faker.number.float({ min: 0, max: 50000, fractionDigits: 2 }),
    total_orders: faker.number.int({ min: 0, max: 100 }),
    last_order_at: faker.helpers.maybe(() => faker.date.recent({ days: 90 }), { probability: 0.7 }) ?? null,
    user: { connect: { id: overrides.user?.connect?.id || faker.string.uuid() } },
    ...overrides,
  };
}

/**
 * Gera múltiplos clientes
 */
export function createManyClients(count: number, overrides: Partial<Prisma.ClientCreateInput> = {}): Prisma.ClientCreateInput[] {
  return Array.from({ length: count }, () => createClient(overrides));
}

/**
 * Gera cliente VIP (alto valor gasto)
 */
export function createVIPClient(overrides: Partial<Prisma.ClientCreateInput> = {}): Prisma.ClientCreateInput {
  return createClient({
    status: 'ACTIVE' as ClientStatus,
    total_spent: faker.number.float({ min: 10000, max: 100000, fractionDigits: 2 }),
    total_orders: faker.number.int({ min: 20, max: 200 }),
    last_order_at: faker.date.recent({ days: 7 }),
    ...overrides,
  });
}

/**
 * Gera cliente inativo
 */
export function createInactiveClient(overrides: Partial<Prisma.ClientCreateInput> = {}): Prisma.ClientCreateInput {
  return createClient({
    status: 'INACTIVE' as ClientStatus,
    last_order_at: faker.date.past({ years: 1 }),
    ...overrides,
  });
}

/**
 * Gera cliente novo (sem compras)
 */
export function createNewClient(overrides: Partial<Prisma.ClientCreateInput> = {}): Prisma.ClientCreateInput {
  return createClient({
    status: 'PENDING' as ClientStatus,
    total_spent: 0,
    total_orders: 0,
    last_order_at: null,
    ...overrides,
  });
}
