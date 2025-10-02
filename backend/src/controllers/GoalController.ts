/**
 * GoalController
 * 
 * Controller REST para CRUD de metas financeiras
 * 
 * Referências:
 * - design.md: §Controller Layer - REST endpoints com validação
 * - dev-stories.md: Dev Story 4.2 - Endpoints de metas
 * - user-stories.md: Story 4.2 - Criar Metas Mensais Personalizadas
 * - tasks.md: Task 9.2.3 - Criar endpoints de metas
 */

import type { Request, Response } from 'express';
import { goalService } from '../services/GoalService';
import {
  createGoalSchema,
  updateGoalSchema,
  listGoalsQuerySchema,
  goalIdParamSchema,
} from '../validators/goal.validator';
import { logger } from '../shared/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class GoalController {
  /**
   * GET /goals?is_active=true&period_type=MONTHLY
   * Lista metas do usuário com filtros opcionais
   * 
   * Query params:
   * - is_active: boolean (opcional)
   * - period_type: DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY (opcional)
   * - target_type: REVENUE|PROFIT|ORDERS|CLIENTS|CUSTOM (opcional)
   */
  getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      const validatedQuery = listGoalsQuerySchema.parse(req.query);

      // Buscar metas com filtros
      const goals = await goalService.getGoals(userId, validatedQuery as Parameters<typeof goalService.getGoals>[1]);

      res.status(200).json({
        success: true,
        data: goals,
        count: goals.length,
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

      logger.error('Erro ao listar metas', {
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
   * GET /goals/:id
   * Busca meta por ID com cálculo de progresso atualizado
   */
  getGoalById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar ID do parâmetro
      const validatedParams = goalIdParamSchema.parse(req.params);

      // Buscar meta
      const goal = await goalService.getGoalById(validatedParams.id, userId);

      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      // Erro de validação Zod
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'ID inválido. Deve ser um UUID válido.',
          details: error.message,
        });
        return;
      }

      // Meta não encontrada
      if (error instanceof Error && error.message.includes('não encontrada')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Meta não pertence ao usuário
      if (error instanceof Error && error.message.includes('não pertence')) {
        res.status(403).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error('Erro ao buscar meta', {
        goalId: req.params.id,
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
   * POST /goals
   * Cria nova meta
   * 
   * Body:
   * {
   *   "title": "Faturar R$ 15.000 em Outubro",
   *   "description": "Meta mensal de receita",
   *   "target_type": "REVENUE",
   *   "target_value": 15000,
   *   "period_type": "MONTHLY",
   *   "period_start": "2025-10-01T00:00:00Z",
   *   "period_end": "2025-10-31T23:59:59Z"
   * }
   * 
   * Critérios de Aceitação (user-stories.md Story 4.2):
   * - Máximo 5 metas ativas simultâneas
   * - period_end > period_start
   * - target_value > 0
   */
  createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      const validatedData = createGoalSchema.parse(req.body);

      // Criar meta
      const goal = await goalService.createGoal(userId, validatedData as Parameters<typeof goalService.createGoal>[1]);

      res.status(201).json({
        success: true,
        data: goal,
        message: 'Meta criada com sucesso',
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

      // Limite de metas atingido
      if (error instanceof Error && error.message.includes('Limite de')) {
        res.status(422).json({
          success: false,
          error: error.message,
          code: 'MAX_GOALS_REACHED',
        });
        return;
      }

      // Data inválida
      if (error instanceof Error && error.message.includes('Data de término')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error('Erro ao criar meta', {
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
   * PUT /goals/:id
   * Atualiza meta existente
   * 
   * Body (todos opcionais):
   * {
   *   "title": "Novo título",
   *   "description": "Nova descrição",
   *   "target_value": 20000,
   *   "period_end": "2025-11-30T23:59:59Z",
   *   "is_active": false
   * }
   * 
   * Não pode alterar:
   * - target_type (tipo de meta)
   * - period_start (data início)
   */
  updateGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar ID do parâmetro
      const validatedParams = goalIdParamSchema.parse(req.params);

      // Validar body
      const validatedData = updateGoalSchema.parse(req.body);

      // Atualizar meta
      const goal = await goalService.updateGoal(validatedParams.id, userId, validatedData as Parameters<typeof goalService.updateGoal>[2]);

      res.status(200).json({
        success: true,
        data: goal,
        message: 'Meta atualizada com sucesso',
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

      // Meta não encontrada
      if (error instanceof Error && error.message.includes('não encontrada')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Meta não pertence ao usuário
      if (error instanceof Error && error.message.includes('não pertence')) {
        res.status(403).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Data inválida
      if (error instanceof Error && error.message.includes('Data de término')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error('Erro ao atualizar meta', {
        goalId: req.params.id,
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
   * DELETE /goals/:id
   * Remove meta (soft delete - marca is_active = false)
   */
  deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Validar ID do parâmetro
      const validatedParams = goalIdParamSchema.parse(req.params);

      // Remover meta
      await goalService.deleteGoal(validatedParams.id, userId);

      res.status(204).send(); // No content
    } catch (error) {
      // Erro de validação Zod
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'ID inválido. Deve ser um UUID válido.',
          details: error.message,
        });
        return;
      }

      // Meta não encontrada
      if (error instanceof Error && error.message.includes('não encontrada')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Meta não pertence ao usuário
      if (error instanceof Error && error.message.includes('não pertence')) {
        res.status(403).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error('Erro ao remover meta', {
        goalId: req.params.id,
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
   * GET /goals/statistics
   * Retorna estatísticas gerais das metas do usuário
   * 
   * Inclui:
   * - Total de metas
   * - Metas ativas
   * - Metas completas
   * - Metas expiradas
   * - Taxa de conclusão
   * - Tempo médio de conclusão
   * - Maior sequência de metas atingidas
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

      // Buscar estatísticas
      const statistics = await goalService.getGoalStatistics(userId);

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de metas', {
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
export const goalController = new GoalController();
