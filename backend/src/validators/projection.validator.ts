/**
 * Projection Validators
 *
 * Schemas de validação Zod para endpoints de projeções financeiras
 *
 * Referências:
 * - design.md: §Validation - Zod schemas compartilhados
 * - dev-stories.md: Dev Story 4.1 - Validação de queries
 * - user-stories.md: Story 4.1 - Períodos válidos
 * - tasks.md: Task 9.1.4 - Validação de endpoints
 */

import { z } from 'zod';

/**
 * Períodos válidos para projeções
 */
export const validProjectionPeriods = [7, 30, 90, 180, 365] as const;

/**
 * Schema para query de projeções de vendas
 * GET /projections/sales?period=30
 */
export const salesProjectionQuerySchema = z.object({
  period: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(
      z.number({
        required_error: 'Período é obrigatório',
        invalid_type_error: 'Período deve ser um número',
      })
        .refine(
          (val) => validProjectionPeriods.includes(val as typeof validProjectionPeriods[number]),
          {
            message: `Período deve ser um dos seguintes: ${validProjectionPeriods.join(', ')} dias`,
          },
        ),
    ),
});

/**
 * Schema para query de projeção de fluxo de caixa
 * GET /projections/cashflow?period=90
 */
export const cashflowProjectionQuerySchema = z.object({
  period: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(
      z.number({
        required_error: 'Período é obrigatório',
        invalid_type_error: 'Período deve ser um número',
      })
        .refine(
          (val) => validProjectionPeriods.includes(val as typeof validProjectionPeriods[number]),
          {
            message: `Período deve ser um dos seguintes: ${validProjectionPeriods.join(', ')} dias`,
          },
        ),
    ),
});

/**
 * Schema para query de health score
 * GET /projections/health-score (sem query params)
 */
export const healthScoreQuerySchema = z.object({}).strict();

/**
 * Schema para resposta de projeção de vendas
 * Usado para validação de output (type-safe)
 */
export const projectionResultSchema = z.object({
  period: z.number().positive(),
  pessimistic: z.number().min(0),
  realistic: z.number().min(0),
  optimistic: z.number().min(0),
  confidence: z.number().min(0).max(100),
  trend: z.enum(['growth', 'stable', 'decline']),
  historical_data_days: z.number().min(0),
  avg_7_days: z.number().min(0),
  avg_30_days: z.number().min(0),
  avg_90_days: z.number().min(0),
  seasonality_adjusted: z.boolean(),
  cache_expires_at: z.date().optional(),
});

/**
 * Schema para resposta de cashflow
 */
export const cashflowProjectionSchema = z.object({
  period: z.number().positive(),
  projected_sales: projectionResultSchema,
  projected_expenses: z.object({
    ads: z.number().min(0),
    operational: z.number().min(0),
    total: z.number().min(0),
  }),
  net_profit: z.object({
    pessimistic: z.number(),
    realistic: z.number(),
    optimistic: z.number(),
  }),
  roi: z.object({
    pessimistic: z.number(),
    realistic: z.number(),
    optimistic: z.number(),
  }),
});

/**
 * Schema para resposta de health score
 */
export const healthScoreSchema = z.object({
  overall_score: z.number().min(0).max(100),
  trend_score: z.number().min(0).max(100),
  profitability_score: z.number().min(0).max(100),
  consistency_score: z.number().min(0).max(100),
  interpretation: z.string(),
  alerts: z.array(z.string()),
  recommendations: z.array(z.string()),
});

/**
 * Tipos inferidos dos schemas
 */
export type SalesProjectionQuery = z.infer<typeof salesProjectionQuerySchema>;
export type CashflowProjectionQuery = z.infer<typeof cashflowProjectionQuerySchema>;
export type ProjectionResult = z.infer<typeof projectionResultSchema>;
export type CashflowProjection = z.infer<typeof cashflowProjectionSchema>;
export type HealthScore = z.infer<typeof healthScoreSchema>;
