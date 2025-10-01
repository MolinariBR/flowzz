// Referência: tasks.md Task 3.3.3, user-stories.md Story 2.1, design.md §Validation
// Schemas de validação Zod para dashboard

import { z } from 'zod';

// Schema para query parameters do endpoint /dashboard/metrics
export const dashboardMetricsQuerySchema = z.object({
  start_date: z.string()
    .datetime()
    .transform(val => new Date(val))
    .optional(),
  end_date: z.string()
    .datetime()
    .transform(val => new Date(val))
    .optional()
}).refine(
  (data) => {
    // Validar que end_date é posterior a start_date
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
    // Validar período máximo de 1 ano
    if (data.start_date && data.end_date) {
      const diffInDays = Math.ceil(
        (data.end_date.getTime() - data.start_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffInDays <= 365;
    }
    return true;
  },
  {
    message: 'Período máximo permitido é de 1 ano',
    path: ['end_date']
  }
);

// Schema para query parameters do endpoint /dashboard/chart
export const dashboardChartQuerySchema = z.object({
  start_date: z.string()
    .datetime()
    .transform(val => new Date(val))
    .optional(),
  end_date: z.string()
    .datetime()
    .transform(val => new Date(val))
    .optional(),
  period: z.enum(['7d', '30d', '90d', '1y', 'custom'])
    .optional()
    .default('30d')
}).refine(
  (data) => {
    // Se period for custom, start_date e end_date são obrigatórios
    if (data.period === 'custom') {
      return data.start_date && data.end_date;
    }
    return true;
  },
  {
    message: 'Para período customizado, start_date e end_date são obrigatórios',
    path: ['period']
  }
).refine(
  (data) => {
    // Validar que end_date é posterior a start_date
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
    // Validar período máximo de 2 anos para gráficos
    if (data.start_date && data.end_date) {
      const diffInDays = Math.ceil(
        (data.end_date.getTime() - data.start_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffInDays <= 730; // 2 anos
    }
    return true;
  },
  {
    message: 'Período máximo permitido para gráficos é de 2 anos',
    path: ['end_date']
  }
);

// Schema para query parameters do endpoint /dashboard/activities
export const dashboardActivitiesQuerySchema = z.object({
  limit: z.string()
    .regex(/^\d+$/, 'Limit deve ser um número')
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 1 && val <= 100, 'Limit deve estar entre 1 e 100')
    .optional()
    .default('10'),
  type: z.enum(['sale', 'payment', 'client', 'ad', 'all'])
    .optional()
    .default('all'),
  days: z.string()
    .regex(/^\d+$/, 'Days deve ser um número')
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 1 && val <= 90, 'Days deve estar entre 1 e 90')
    .optional()
    .default('7')
});

// Schema para resposta das métricas básicas
export const dashboardMetricsResponseSchema = z.object({
  vendas_hoje: z.number().min(0),
  gasto_anuncios: z.number().min(0),
  lucro_liquido: z.number(),
  pagamentos_agendados: z.number().min(0)
});

// Schema para resposta das métricas com comparações
export const dashboardMetricsWithComparisonsResponseSchema = dashboardMetricsResponseSchema.extend({
  comparisons: z.object({
    vendas_hoje: z.number(),
    gasto_anuncios: z.number(),
    lucro_liquido: z.number(),
    pagamentos_agendados: z.number()
  }),
  ultima_atualizacao: z.date()
});

// Schema para item de dados do gráfico
export const dashboardChartDataItemSchema = z.object({
  date: z.union([z.string(), z.date()]),
  vendas: z.number().min(0),
  gastos: z.number().min(0),
  lucro: z.number()
});

// Schema para resposta do gráfico
export const dashboardChartResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(dashboardChartDataItemSchema),
  meta: z.object({
    period: z.object({
      start: z.string(),
      end: z.string(),
      days: z.number()
    })
  })
});

// Schema para atividade do dashboard
export const dashboardActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['sale', 'payment', 'client', 'ad']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  amount: z.number().optional(),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional()
});

// Schema para resposta das atividades
export const dashboardActivitiesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(dashboardActivitySchema),
  meta: z.object({
    total: z.number(),
    limit: z.number()
  })
});

// Schema para validação de cache stats (admin)
export const dashboardCacheStatsSchema = z.object({
  total_keys: z.number().min(0),
  avg_ttl: z.number().min(0),
  hit_rate: z.number().min(0).max(100).optional(),
  miss_rate: z.number().min(0).max(100).optional()
});

// Schemas para validação de período predefinido
export const predefinedPeriods = {
  '7d': () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { start, end };
  },
  '30d': () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 30);
    return { start, end };
  },
  '90d': () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 90);
    return { start, end };
  },
  '1y': () => {
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
    return { start, end };
  }
};

// Helper para obter período baseado no parâmetro
export const getPeriodDates = (period: string, customStart?: Date, customEnd?: Date) => {
  if (period === 'custom' && customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }
  
  if (period in predefinedPeriods) {
    return predefinedPeriods[period as keyof typeof predefinedPeriods]();
  }
  
  // Default: últimos 30 dias
  return predefinedPeriods['30d']();
};

// Tipos TypeScript derivados dos schemas
export type DashboardMetricsQuery = z.infer<typeof dashboardMetricsQuerySchema>;
export type DashboardChartQuery = z.infer<typeof dashboardChartQuerySchema>;
export type DashboardActivitiesQuery = z.infer<typeof dashboardActivitiesQuerySchema>;
export type DashboardMetricsResponse = z.infer<typeof dashboardMetricsResponseSchema>;
export type DashboardMetricsWithComparisonsResponse = z.infer<typeof dashboardMetricsWithComparisonsResponseSchema>;
export type DashboardChartDataItem = z.infer<typeof dashboardChartDataItemSchema>;
export type DashboardActivity = z.infer<typeof dashboardActivitySchema>;
export type DashboardCacheStats = z.infer<typeof dashboardCacheStatsSchema>;