/**
 * Goal Validators
 * 
 * Schemas de validação Zod para CRUD de metas financeiras
 * 
 * Referências:
 * - design.md: §Validation - Zod schemas compartilhados
 * - dev-stories.md: Dev Story 4.2 - Validação de metas
 * - user-stories.md: Story 4.2 - Criar Metas Mensais Personalizadas
 * - tasks.md: Task 9.2.3 - Validação de endpoints de metas
 */

import { z } from 'zod';
import { GoalTargetType, PeriodType } from '@prisma/client';

/**
 * Schema para criação de meta
 * POST /goals
 * 
 * Critérios de Aceitação (user-stories.md Story 4.2):
 * - Máximo 5 metas ativas simultâneas
 * - period_end > period_start
 * - target_value > 0
 */
export const createGoalSchema = z.object({
  title: z
    .string({
      required_error: 'Título é obrigatório',
    })
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título não pode exceder 100 caracteres')
    .trim(),

  description: z
    .string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  target_type: z.nativeEnum(GoalTargetType, {
    required_error: 'Tipo de meta é obrigatório',
    invalid_type_error: 'Tipo de meta inválido',
  }),

  target_value: z
    .number({
      required_error: 'Valor alvo é obrigatório',
      invalid_type_error: 'Valor alvo deve ser um número',
    })
    .positive('Valor alvo deve ser positivo')
    .finite('Valor alvo deve ser um número finito'),

  period_type: z.nativeEnum(PeriodType, {
    required_error: 'Tipo de período é obrigatório',
    invalid_type_error: 'Tipo de período inválido',
  }),

  period_start: z
    .string({
      required_error: 'Data de início é obrigatória',
    })
    .datetime('Data de início deve estar no formato ISO 8601')
    .transform((val) => new Date(val)),

  period_end: z
    .string({
      required_error: 'Data de término é obrigatória',
    })
    .datetime('Data de término deve estar no formato ISO 8601')
    .transform((val) => new Date(val)),
}).refine(
  (data) => data.period_end > data.period_start,
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['period_end'],
  }
);

/**
 * Schema para atualização de meta
 * PUT /goals/:id
 * 
 * Campos não alteráveis:
 * - target_type (tipo de meta)
 * - period_start (data início)
 */
export const updateGoalSchema = z.object({
  title: z
    .string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título não pode exceder 100 caracteres')
    .trim()
    .optional(),

  description: z
    .string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  target_value: z
    .number({
      invalid_type_error: 'Valor alvo deve ser um número',
    })
    .positive('Valor alvo deve ser positivo')
    .finite('Valor alvo deve ser um número finito')
    .optional(),

  period_end: z
    .string()
    .datetime('Data de término deve estar no formato ISO 8601')
    .transform((val) => new Date(val))
    .optional(),

  is_active: z
    .boolean({
      invalid_type_error: 'is_active deve ser um booleano',
    })
    .optional(),
}).strict();

/**
 * Schema para query de listagem de metas
 * GET /goals?is_active=true&period_type=MONTHLY
 */
export const listGoalsQuerySchema = z.object({
  is_active: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),

  period_type: z
    .nativeEnum(PeriodType)
    .optional(),

  target_type: z
    .nativeEnum(GoalTargetType)
    .optional(),
}).strict();

/**
 * Schema para params de rota com ID
 * GET /goals/:id
 * PUT /goals/:id
 * DELETE /goals/:id
 */
export const goalIdParamSchema = z.object({
  id: z
    .string({
      required_error: 'ID da meta é obrigatório',
    })
    .uuid('ID da meta deve ser um UUID válido'),
});

/**
 * Schema para resposta de meta com progresso
 */
export const goalWithProgressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  target_type: z.nativeEnum(GoalTargetType),
  target_value: z.number(),
  current_value: z.number(),
  period_type: z.nativeEnum(PeriodType),
  period_start: z.date(),
  period_end: z.date(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
  
  // Campos calculados de progresso
  progress_percentage: z.number().min(0),
  progress_status: z.enum(['not_started', 'in_progress', 'almost_there', 'completed', 'expired_incomplete']),
  days_remaining: z.number(),
  days_elapsed: z.number(),
  is_on_track: z.boolean(),
  expected_progress: z.number().min(0).max(100),
  daily_target: z.number().min(0),
  current_daily_avg: z.number().min(0),
});

/**
 * Schema para estatísticas de metas
 */
export const goalStatisticsSchema = z.object({
  total_goals: z.number().min(0),
  active_goals: z.number().min(0),
  completed_goals: z.number().min(0),
  expired_goals: z.number().min(0),
  completion_rate: z.number().min(0).max(100),
  avg_completion_time: z.number().min(0),
  best_streak: z.number().min(0),
});

/**
 * Tipos inferidos dos schemas
 */
export type CreateGoalDTO = z.infer<typeof createGoalSchema>;
export type UpdateGoalDTO = z.infer<typeof updateGoalSchema>;
export type ListGoalsQuery = z.infer<typeof listGoalsQuerySchema>;
export type GoalIdParam = z.infer<typeof goalIdParamSchema>;
export type GoalWithProgress = z.infer<typeof goalWithProgressSchema>;
export type GoalStatistics = z.infer<typeof goalStatisticsSchema>;
