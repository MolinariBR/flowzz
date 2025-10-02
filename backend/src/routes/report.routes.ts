/**
 * Report Routes
 *
 * Rotas REST para geração e gestão de relatórios PDF/Excel
 *
 * Referências:
 * - design.md: §REST API - Endpoints com autenticação JWT
 * - dev-stories.md: Dev Story 4.2 - API assíncrona de relatórios
 * - user-stories.md: Story 6.1 - Relatórios executivos
 * - tasks.md: Task 10.1.4 - Routes com autenticação
 * - openapi.yaml: /reports endpoints
 */

import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticate } from '../shared/middlewares/authenticate';

const router = Router();
const reportController = new ReportController();

/**
 * POST /api/v1/reports/generate
 * Gera novo relatório (processamento assíncrono)
 *
 * @access Private (requer autenticação)
 * @rate-limit 10 req/hour (configurado em server.ts)
 *
 * Body: {
 *   type: 'SALES_REPORT' | 'FINANCIAL_SUMMARY' | 'CLIENT_ANALYSIS' | 'PROJECTION_REPORT' | 'CUSTOM',
 *   title: string,
 *   format: 'pdf' | 'excel',
 *   filters: {
 *     startDate: Date,
 *     endDate: Date,
 *     clientIds?: string[],
 *     tagIds?: string[],
 *     status?: string[],
 *     includeCharts?: boolean,
 *     includeLogo?: boolean,
 *     customFields?: string[]
 *   },
 *   sendEmail?: boolean,
 *   emailRecipients?: string[]
 * }
 *
 * Response: 202 Accepted {
 *   success: true,
 *   message: string,
 *   data: {
 *     id: string,
 *     status: 'PENDING',
 *     estimatedTime: string
 *   }
 * }
 */
router.post('/generate', authenticate, reportController.generateReport);

/**
 * GET /api/v1/reports/:id/status
 * Obtém status de geração de um relatório
 *
 * @access Private (requer autenticação + ownership)
 *
 * Response: 200 OK {
 *   success: true,
 *   data: {
 *     id: string,
 *     status: 'PENDING' | 'GENERATING' | 'READY' | 'ERROR',
 *     progress?: number,
 *     fileUrl?: string,
 *     error?: string
 *   }
 * }
 */
router.get('/:id/status', authenticate, reportController.getReportStatus);

/**
 * GET /api/v1/reports/:id/download
 * Obtém URL de download do relatório gerado
 *
 * @access Private (requer autenticação + ownership)
 *
 * Response: 200 OK {
 *   success: true,
 *   data: {
 *     downloadUrl: string,
 *     expiresAt: Date
 *   }
 * }
 */
router.get('/:id/download', authenticate, reportController.getDownloadUrl);

/**
 * GET /api/v1/reports
 * Lista relatórios do usuário com paginação e filtros
 *
 * @access Private (requer autenticação)
 *
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - type?: 'SALES_REPORT' | 'FINANCIAL_SUMMARY' | 'CLIENT_ANALYSIS' | 'PROJECTION_REPORT' | 'CUSTOM'
 * - status?: 'PENDING' | 'GENERATING' | 'READY' | 'ERROR'
 * - format?: 'pdf' | 'excel'
 * - startDate?: ISO date
 * - endDate?: ISO date
 *
 * Response: 200 OK {
 *   success: true,
 *   data: Report[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 */
router.get('/', authenticate, reportController.listReports);

/**
 * DELETE /api/v1/reports/:id
 * Remove um relatório
 *
 * @access Private (requer autenticação + ownership)
 *
 * Response: 204 No Content
 */
router.delete('/:id', authenticate, reportController.deleteReport);

/**
 * GET /api/v1/reports/statistics
 * Obtém estatísticas de uso de relatórios
 *
 * @access Private (requer autenticação)
 *
 * Response: 200 OK {
 *   success: true,
 *   data: {
 *     totalReports: number,
 *     reportsByType: Array<{ type: string, count: number }>,
 *     reportsByFormat: Array<{ format: string, count: number }>,
 *     reportsByStatus: Array<{ status: string, count: number }>,
 *     averageGenerationTime: number,
 *     lastGenerated: Date | null
 *   }
 * }
 */
router.get('/statistics', authenticate, reportController.getStatistics);

export { router as reportRoutes };
