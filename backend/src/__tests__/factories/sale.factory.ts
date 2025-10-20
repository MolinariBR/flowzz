import { faker } from '@faker-js/faker/locale/pt_BR'
import type { Prisma, SaleStatus } from '@prisma/client'

/**
 * Factory para criar dados fake de Sale (Vendas)
 * Usa locale pt_BR para dados brasileiros realistas
 */

/**
 * Gera uma venda fake completa
 */
export function createSale(
  overrides: Partial<Prisma.SaleCreateInput> = {}
): Prisma.SaleCreateInput {
  const productNames = [
    'Curso de Marketing Digital',
    'Ebook Growth Hacking',
    'Consultoria Individual',
    'Workshop Online',
    'Mentoria Executiva',
    'Pacote de Templates',
  ]

  const paymentMethods = ['credit_card', 'pix', 'boleto', 'debit_card']

  const unitPrice = faker.number.float({
    min: 97,
    max: 5000,
    fractionDigits: 2,
  })
  const quantity = faker.number.int({ min: 1, max: 3 })
  const totalPrice = unitPrice * quantity

  return {
    product_name: faker.helpers.arrayElement(productNames),
    product_sku:
      faker.helpers.maybe(() => faker.string.alphanumeric(8).toUpperCase(), {
        probability: 0.6,
      }) ?? null,
    quantity,
    unit_price: unitPrice,
    total_price: totalPrice,
    commission: faker.helpers.maybe(() => totalPrice * 0.1, { probability: 0.5 }) ?? null,
    status: faker.helpers.arrayElement([
      'PAID',
      'PENDING',
      'CANCELLED',
      'REFUNDED',
    ] as SaleStatus[]),
    payment_method: faker.helpers.arrayElement(paymentMethods),
    payment_due_date:
      faker.helpers.maybe(() => faker.date.future({ years: 0.5 }), {
        probability: 0.3,
      }) ?? null,
    payment_date:
      faker.helpers.maybe(() => faker.date.recent({ days: 30 }), {
        probability: 0.7,
      }) ?? null,
    shipped_at:
      faker.helpers.maybe(() => faker.date.recent({ days: 20 }), {
        probability: 0.5,
      }) ?? null,
    delivered_at:
      faker.helpers.maybe(() => faker.date.recent({ days: 15 }), {
        probability: 0.4,
      }) ?? null,
    external_id:
      faker.helpers.maybe(() => `coinzz_sale_${faker.string.alphanumeric(12)}`, {
        probability: 0.8,
      }) ?? null,
    user: {
      connect: { id: overrides.user?.connect?.id || faker.string.uuid() },
    },
    ...overrides,
  }
}

/**
 * Gera múltiplas vendas
 */
export function createManySales(
  count: number,
  overrides: Partial<Prisma.SaleCreateInput> = {}
): Prisma.SaleCreateInput[] {
  return Array.from({ length: count }, () => createSale(overrides))
}

/**
 * Gera venda paga (status PAID)
 */
export function createPaidSale(
  overrides: Partial<Prisma.SaleCreateInput> = {}
): Prisma.SaleCreateInput {
  return createSale({
    status: 'PAID' as SaleStatus,
    payment_date: faker.date.recent({ days: 30 }),
    ...overrides,
  })
}

/**
 * Gera venda pendente
 */
export function createPendingSale(
  overrides: Partial<Prisma.SaleCreateInput> = {}
): Prisma.SaleCreateInput {
  return createSale({
    status: 'PENDING' as SaleStatus,
    payment_method: 'boleto', // Boleto geralmente fica pendente
    payment_due_date: faker.date.soon({ days: 3 }),
    ...overrides,
  })
}

/**
 * Gera venda de alto valor
 */
export function createHighValueSale(
  overrides: Partial<Prisma.SaleCreateInput> = {}
): Prisma.SaleCreateInput {
  return createSale({
    product_name: 'Mentoria Executiva Premium',
    total_price: faker.number.float({
      min: 3000,
      max: 10000,
      fractionDigits: 2,
    }),
    status: 'PAID' as SaleStatus,
    payment_method: 'credit_card',
    ...overrides,
  })
}

/**
 * Gera venda recente (últimos 7 dias)
 */
export function createRecentSale(
  overrides: Partial<Prisma.SaleCreateInput> = {}
): Prisma.SaleCreateInput {
  return createSale({
    payment_date: faker.date.recent({ days: 7 }),
    status: 'PAID' as SaleStatus,
    ...overrides,
  })
}
