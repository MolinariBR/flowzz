/**
 * ProjectionController
 * 
 * Controller REST para endpoints de projeções financeiras
 * 
 * Referências:
 * - design.md: §Controller Layer - REST endpoints com validação
 * - dev-stories.md: Dev Story 4.1 - Endpoints de projeções
 * - user-stories.md: Story 4.1 - Ver Projeções de Fluxo de Caixa
 * - tasks.md: Task 9.1.4 - Criar endpoints de projeções
 */

import type { Request, Response } from 'express';
import { projectionService } from '../services/ProjectionService';
import type { ProjectionPeriod } from '../interfaces/ProjectionService.interface';
import {
  salesProjectionQuerySchema,
  cashflowProjectionQuerySchema,
  healthScoreQuerySchema,
} from '../validators/projection.validator';
import { logger } from '../shared/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class ProjectionController {
  /**
   * GET /projections/sales?period=30
   * Retorna projeção de vendas com 3 cenários (pessimista/realista/otimista)
   * 
   * Critérios de Aceitação (user-stories.md Story 4.1):
   * - Mínimo 30 dias de histórico necessário
   * - 3 cenários: pessimista, realista, otimista
   * - Confiança 0-100% baseada em variância
   * - Cache de 6 horas
   */
  getSalesProjection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar query parameters
      const validatedQuery = salesProjectionQuerySchema.parse(req.query);
      const period = validatedQuery.period as ProjectionPeriod;

      // Calcular projeção
      const projection = await projectionService.calculateSalesProjection(userId, period);

      res.status(200).json({
        success: true,
        data: projection,
      });
    } catch (error) {
      // Erro de validação Zod
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Parâmetros de query inválidos',
          details: error.message,
        });
        return;
      }

      // Erro de dados insuficientes
      if (error instanceof Error && error.message.includes('Dados históricos insuficientes')) {
        res.status(422).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_DATA',
        });
        return;
      }

      logger.error('Erro ao obter projeção de vendas', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  /**
   * GET /projections/cashflow?period=90
   * Retorna projeção de fluxo de caixa (vendas - despesas)
   * 
   * Inclui:
   * - Projeção de vendas (3 cenários)
   * - Projeção de despesas (ads + operacional)
   * - Lucro líquido projetado (3 cenários)
   * - ROI projetado (3 cenários)
   */
  getCashflowProjection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar query parameters
      const validatedQuery = cashflowProjectionQuerySchema.parse(req.query);
      const period = validatedQuery.period as ProjectionPeriod;

      // Calcular projeção de cashflow
      const projection = await projectionService.calculateCashflowProjection(userId, period);

      res.status(200).json({
        success: true,
        data: projection,
      });
    } catch (error) {
      // Erro de validação Zod
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Parâmetros de query inválidos',
          details: error.message,
        });
        return;
      }

      // Erro de dados insuficientes
      if (error instanceof Error && error.message.includes('Dados históricos insuficientes')) {
        res.status(422).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_DATA',
        });
        return;
      }

      logger.error('Erro ao obter projeção de cashflow', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  /**
   * GET /projections/health-score
   * Retorna score de saúde financeira (0-100%)
   * 
   * Score baseado em:
   * - Tendência (30%): Crescimento vs Queda
   * - Lucratividade (40%): Margem de lucro
   * - Consistência (30%): Baixa variância
   * 
   * Inclui:
   * - Score geral (0-100%)
   * - Scores individuais
   * - Interpretação textual
   * - Alertas importantes
   * - Recomendações personalizadas
   */
  getHealthScore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar query (sem parâmetros esperados, mas valida estrutura)
      healthScoreQuerySchema.parse(req.query);

      // Calcular health score
      const healthScore = await projectionService.calculateHealthScore(userId);

      res.status(200).json({
        success: true,
        data: healthScore,
      });
    } catch (error) {
      // Erro de validação Zod
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Query inválida. Endpoint não aceita parâmetros.',
          details: error.message,
        });
        return;
      }

      // Erro de dados insuficientes
      if (error instanceof Error && error.message.includes('Dados insuficientes')) {
        res.status(422).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_DATA',
        });
        return;
      }

      logger.error('Erro ao obter health score', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };
}

// Export singleton instance
export const projectionController = new ProjectionController();
