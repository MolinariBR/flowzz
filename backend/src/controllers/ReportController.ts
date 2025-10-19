/**
 * ReportController
 *
 * Controller REST para geração e gestão de relatórios PDF/Excel
 *
 * Referências:
 * - design.md: §Controller Layer - REST endpoints com validação
 * - dev-stories.md: Dev Story 4.2 - Geração assíncrona de relatórios
 * - user-stories.md: Story 6.1 - Relatórios executivos customizáveis
 * - tasks.md: Task 10.1.4 - Criar ReportController e routes
 * - openapi.yaml: /reports endpoints
 */

import type { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import {
  createReportSchema,
  listReportsQuerySchema,
  reportIdParamSchema,
} from '../validators/report.validator';
import { logger } from '../shared/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const reportService = new ReportService();

export class ReportController {
  /**
   * POST /reports/generate
   * Gera novo relatório (processamento assíncrono)
   *
   * Body: {
   *   type: ReportType,
   *   title: string,
   *   format: 'pdf' | 'excel',
   *   filters: { startDate, endDate, ... },
   *   sendEmail?: boolean,
   *   emailRecipients?: string[]
   * }
   *
   * Response: 202 Accepted com reportId
   */
  generateReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar body
      const validatedData = createReportSchema.parse(req.body);

      // Enfileirar geração do relatório
      const report = await reportService.generateReport(
        userId,
        validatedData as unknown as Parameters<typeof reportService.generateReport>[1],
      );

      logger.info('Report generation queued', {
        userId,
        reportId: report.id,
        type: validatedData.type,
        format: validatedData.format,
      });

      res.status(202).json({
        success: true,
        message: 'Relatório enfileirado para geração',
        data: {
          id: report.id,
          status: report.status,
          estimatedTime: '2-5 minutos',
        },
      });
    } catch (error) {
      // Erro de validação Zod
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.message,
        });
        return;
      }

      logger.error('Erro ao gerar relatório', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação',
      });
    }
  };

  /**
   * GET /reports/:id/status
   * Obtém status de geração de um relatório
   *
   * Response: {
   *   id: string,
   *   status: 'PENDING' | 'GENERATING' | 'READY' | 'ERROR',
   *   progress?: number,
   *   fileUrl?: string,
   *   error?: string
   * }
   */
  getReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar param
      const { id } = reportIdParamSchema.parse(req.params);

      // Buscar status
      const report = await reportService.getReportStatus(id, userId);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Relatório não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: error.message,
        });
        return;
      }

      logger.error('Erro ao buscar status do relatório', {
        userId: req.user?.userId,
        reportId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação',
      });
    }
  };

  /**
   * GET /reports/:id/download
   * Faz download do arquivo de relatório gerado
   *
   * Response: Redirect para URL assinada ou stream do arquivo
   */
  getDownloadUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar param
      const { id } = reportIdParamSchema.parse(req.params);

      // Buscar relatório
      const report = await reportService.getReportById(id, userId);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Relatório não encontrado',
        });
        return;
      }

      // Verificar se está pronto
      const reportData = report as unknown as { data?: { status?: string } };
      if (reportData?.data?.status !== 'READY') {
        res.status(400).json({
          success: false,
          error: 'Relatório ainda não está pronto para download',
          status: reportData?.data?.status || 'UNKNOWN',
        });
        return;
      }

      // Verificar se expirou
      if (report.expires_at && new Date(report.expires_at) < new Date()) {
        res.status(410).json({
          success: false,
          error: 'Relatório expirado',
        });
        return;
      }

      // Retornar URL de download
      if (!report.file_url) {
        res.status(404).json({
          success: false,
          error: 'Arquivo do relatório não encontrado',
        });
        return;
      }

      logger.info('Report download requested', {
        userId,
        reportId: id,
        fileUrl: report.file_url,
      });

      res.status(200).json({
        success: true,
        data: {
          downloadUrl: report.file_url,
          expiresAt: report.expires_at,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: error.message,
        });
        return;
      }

      logger.error('Erro ao obter URL de download', {
        userId: req.user?.userId,
        reportId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação',
      });
    }
  };

  /**
   * GET /reports?page=1&limit=20&type=SALES_REPORT&status=READY
   * Lista relatórios do usuário com paginação e filtros
   *
   * Query params:
   * - page: number (default 1)
   * - limit: number (default 20, max 100)
   * - type?: ReportType
   * - status?: ReportStatus
   * - format?: 'pdf' | 'excel'
   * - startDate?: ISO date
   * - endDate?: ISO date
   */
  listReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar query params
      const validatedQuery = listReportsQuerySchema.parse(req.query);

      // Buscar relatórios
      const result = await reportService.listReports(
        userId,
        validatedQuery as unknown as Parameters<typeof reportService.listReports>[1],
      );

      res.status(200).json({
        success: true,
        data: result.reports,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Parâmetros de query inválidos',
          details: error.message,
        });
        return;
      }

      logger.error('Erro ao listar relatórios', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação',
      });
    }
  };

  /**
   * DELETE /reports/:id
   * Remove um relatório
   */
  deleteReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar param
      const { id } = reportIdParamSchema.parse(req.params);

      // Deletar relatório
      await reportService.deleteReport(id, userId);

      logger.info('Report deleted', {
        userId,
        reportId: id,
      });

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('não encontrado')) {
        res.status(404).json({
          success: false,
          error: 'Relatório não encontrado',
        });
        return;
      }

      if (error instanceof Error && error.message.includes('não autorizado')) {
        res.status(403).json({
          success: false,
          error: 'Não autorizado',
        });
        return;
      }

      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: error.message,
        });
        return;
      }

      logger.error('Erro ao deletar relatório', {
        userId: req.user?.userId,
        reportId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação',
      });
    }
  };

  /**
   * GET /reports/statistics
   * Obtém estatísticas de uso de relatórios
   */
  getStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      const stats = await reportService.getStatistics(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de relatórios', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação',
      });
    }
  };
}
