// Referência: design.md §Validation, user-stories.md Story 2.1, tasks.md Task 3.2
// Schemas de validação Zod para vendas

import { z } from 'zod';

// Enum para status de vendas
export const saleStatusSchema = z.enum([
  'PENDING',
  'PAID', 
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
  'REFUNDED'
]);

// Schema para criação de venda
export const createSaleSchema = z.object({
  client_id: z.string().uuid().optional(),
  external_id: z.string().min(1).max(100).optional(),
  product_name: z.string().min(1, 'Nome do produto é obrigatório').max(200),
  product_sku: z.string()
    .regex(/^[A-Z0-9-]{3,50}$/i, 'SKU deve conter apenas letras, números e hífens (3-50 caracteres)')
    .optional(),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero'),
  unit_price: z.number().min(0, 'Preço unitário não pode ser negativo'),
  total_price: z.number().min(0, 'Preço total não pode ser negativo'),
  commission: z.number().min(0, 'Comissão não pode ser negativa').optional(),
  status: saleStatusSchema.optional().default('PENDING'),
  payment_method: z.string().max(50).optional(),
  payment_due_date: z.string().datetime().transform(val => new Date(val)).optional(),
  payment_date: z.string().datetime().transform(val => new Date(val)).optional(),
  shipped_at: z.string().datetime().transform(val => new Date(val)).optional(),
  delivered_at: z.string().datetime().transform(val => new Date(val)).optional()
}).refine(
  (data) => {
    // Validate that total_price equals quantity * unit_price
    return Math.abs(data.total_price - (data.quantity * data.unit_price)) < 0.01;
  },
  {
    message: 'Preço total deve ser igual a quantidade × preço unitário',
    path: ['total_price']
  }
).refine(
  (data) => {
    // Validate payment dates logic
    if (data.payment_due_date && data.payment_date) {
      return data.payment_date >= data.payment_due_date;
    }
    return true;
  },
  {
    message: 'Data de pagamento não pode ser anterior à data de vencimento',
    path: ['payment_date']
  }
).refine(
  (data) => {
    // Validate delivery dates logic
    if (data.shipped_at && data.delivered_at) {
      return data.delivered_at >= data.shipped_at;
    }
    return true;
  },
  {
    message: 'Data de entrega não pode ser anterior à data de envio',
    path: ['delivered_at']
  }
);

// Schema para atualização de venda
export const updateSaleSchema = z.object({
  client_id: z.string().uuid().optional(),
  product_name: z.string().min(1, 'Nome do produto é obrigatório').max(200).optional(),
  product_sku: z.string()
    .regex(/^[A-Z0-9-]{3,50}$/i, 'SKU deve conter apenas letras, números e hífens (3-50 caracteres)')
    .optional(),
  quantity: z.number().int().min(1, 'Quantidade deve ser maior que zero').optional(),
  unit_price: z.number().min(0, 'Preço unitário não pode ser negativo').optional(),
  total_price: z.number().min(0, 'Preço total não pode ser negativo').optional(),
  commission: z.number().min(0, 'Comissão não pode ser negativa').optional(),
  status: saleStatusSchema.optional(),
  payment_method: z.string().max(50).optional(),
  payment_due_date: z.string().datetime().transform(val => new Date(val)).optional(),
  payment_date: z.string().datetime().transform(val => new Date(val)).optional(),
  shipped_at: z.string().datetime().transform(val => new Date(val)).optional(),
  delivered_at: z.string().datetime().transform(val => new Date(val)).optional()
}).refine(
  (data) => {
    // Validate that total_price equals quantity * unit_price if both are provided
    if (data.quantity !== undefined && data.unit_price !== undefined && data.total_price !== undefined) {
      return Math.abs(data.total_price - (data.quantity * data.unit_price)) < 0.01;
    }
    return true;
  },
  {
    message: 'Preço total deve ser igual a quantidade × preço unitário',
    path: ['total_price']
  }
);

// Schema para filtros de vendas
export const saleFiltersSchema = z.object({
  client_id: z.string().uuid().optional(),
  status: saleStatusSchema.optional(),
  product_name: z.string().max(200).optional(),
  start_date: z.string().datetime().transform(val => new Date(val)).optional(),
  end_date: z.string().datetime().transform(val => new Date(val)).optional(),
  min_amount: z.number().min(0).optional(),
  max_amount: z.number().min(0).optional(),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('10')
}).refine(
  (data) => {
    // Validate date range
    if (data.start_date && data.end_date) {
      return data.end_date >= data.start_date;
    }
    return true;
  },
  {
    message: 'Data final deve ser posterior à data inicial',
    path: ['end_date']
  }
).refine(
  (data) => {
    // Validate amount range
    if (data.min_amount !== undefined && data.max_amount !== undefined) {
      return data.max_amount >= data.min_amount;
    }
    return true;
  },
  {
    message: 'Valor máximo deve ser maior que valor mínimo',
    path: ['max_amount']
  }
);

// Schema para parâmetros de período (análises)
export const periodParamsSchema = z.object({
  start_date: z.string().datetime().transform(val => new Date(val)),
  end_date: z.string().datetime().transform(val => new Date(val))
}).refine(
  (data) => {
    return data.end_date >= data.start_date;
  },
  {
    message: 'Data final deve ser posterior à data inicial',
    path: ['end_date']
  }
);

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
export type SaleFiltersInput = z.infer<typeof saleFiltersSchema>;
export type PeriodParamsInput = z.infer<typeof periodParamsSchema>;