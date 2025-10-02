// Referência: design.md §Validation with Zod, dev-stories.md Dev Story 4.2
// Atende tasks.md Task 10.1 - Validators para endpoints de relatórios

import { z } from 'zod';
import type { ReportType } from '@prisma/client';
import { ReportFormat, ReportStatus } from '../interfaces/ReportService.interface';

/**
 * Valores válidos para tipo de relatório (baseado no schema Prisma)
 */
const validReportTypes: ReportType[] = [
  'FINANCIAL_SUMMARY',
  'CLIENT_ANALYSIS',
  'SALES_REPORT',
  'PROJECTION_REPORT',
  'CUSTOM',
];

/**
 * Valores válidos para formato de relatório
 */
const validReportFormats = [ReportFormat.PDF, ReportFormat.EXCEL, ReportFormat.CSV] as const;

/**
 * Valores válidos para status de relatório
 */
const validReportStatuses = [
  ReportStatus.PENDING,
  ReportStatus.GENERATING,
  ReportStatus.READY,
  ReportStatus.ERROR,
  ReportStatus.EXPIRED,
] as const;

/**
 * Schema de validação para filtros de relatório
 */
export const reportFiltersSchema = z.object({
  startDate: z.coerce.date({
    required_error: 'Data de início é obrigatória',
    invalid_type_error: 'Data de início inválida',
  }),
  endDate: z.coerce.date({
    required_error: 'Data de fim é obrigatória',
    invalid_type_error: 'Data de fim inválida',
  }),
  clientIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  status: z.array(z.string()).optional(),
  includeCharts: z.boolean().optional().default(true),
  includeLogo: z.boolean().optional().default(false),
  customFields: z.array(z.string()).optional(),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'Data de fim deve ser maior ou igual à data de início',
    path: ['endDate'],
  }
);

/**
 * Schema de validação para criação de relatório
 */
export const createReportSchema = z.object({
  type: z.enum(validReportTypes as [ReportType, ...ReportType[]], {
    required_error: 'Tipo de relatório é obrigatório',
    invalid_type_error: 'Tipo de relatório inválido',
  }),
  title: z.string({
    required_error: 'Título é obrigatório',
  }).min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  format: z.enum(validReportFormats, {
    required_error: 'Formato é obrigatório',
    invalid_type_error: 'Formato inválido',
  }),
  filters: reportFiltersSchema,
  sendEmail: z.boolean().optional().default(false),
  emailRecipients: z.array(z.string().email('Email inválido')).optional(),
}).refine(
  (data) => {
    // Se sendEmail = true, emailRecipients deve ter pelo menos 1 email
    if (data.sendEmail && (!data.emailRecipients || data.emailRecipients.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Ao menos um destinatário de email deve ser fornecido quando sendEmail é true',
    path: ['emailRecipients'],
  }
);

/**
 * Schema de validação para query params de listagem
 */
export const listReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  type: z.enum(validReportTypes as [ReportType, ...ReportType[]]).optional(),
  status: z.enum(validReportStatuses).optional(),
  format: z.enum(validReportFormats).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * Schema de validação para ID de relatório (path param)
 */
export const reportIdParamSchema = z.object({
  id: z.string({
    required_error: 'ID do relatório é obrigatório',
  }).uuid('ID do relatório inválido'),
});

/**
 * Schema de validação para resposta de relatório com status
 */
export const reportWithStatusSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(validReportTypes as [ReportType, ...ReportType[]]),
  title: z.string(),
  format: z.enum(validReportFormats),
  status: z.enum(validReportStatuses),
  file_url: z.string().url().nullable(),
  error_message: z.string().nullable(),
  filters: reportFiltersSchema,
  created_at: z.date(),
  expires_at: z.date().nullable(),
  progress: z.number().min(0).max(100).optional(),
});

/**
 * Schema de validação para resposta de listagem
 */
export const listReportsResultSchema = z.object({
  reports: z.array(reportWithStatusSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema de validação para estatísticas de relatórios
 */
export const reportStatisticsSchema = z.object({
  totalReports: z.number().int().nonnegative(),
  reportsByType: z.array(z.object({
    type: z.enum(validReportTypes as [ReportType, ...ReportType[]]),
    count: z.number().int().nonnegative(),
  })),
  reportsByFormat: z.array(z.object({
    format: z.enum(validReportFormats),
    count: z.number().int().nonnegative(),
  })),
  reportsByStatus: z.array(z.object({
    status: z.enum(validReportStatuses),
    count: z.number().int().nonnegative(),
  })),
  averageGenerationTime: z.number().nonnegative(),
  lastGenerated: z.date().nullable(),
});

/**
 * Tipos inferidos dos schemas
 */
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
export type ReportIdParam = z.infer<typeof reportIdParamSchema>;
export type ReportWithStatusResponse = z.infer<typeof reportWithStatusSchema>;
export type ListReportsResultResponse = z.infer<typeof listReportsResultSchema>;
export type ReportStatisticsResponse = z.infer<typeof reportStatisticsSchema>;
