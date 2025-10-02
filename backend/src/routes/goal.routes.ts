/**
 * Goal Routes
 * 
 * Rotas REST para CRUD de metas financeiras
 * 
 * Referências:
 * - design.md: §Routes - REST endpoints com autenticação JWT
 * - tasks.md: Task 9.2.3 - Criar endpoints de metas
 * - openapi.yaml: /goals/* endpoints
 */

import { Router } from 'express';
import { goalController } from '../controllers/GoalController';
import { authenticate } from '../shared/middlewares/authenticate';

export const goalRoutes = Router();

// Aplicar autenticação em todas as rotas
goalRoutes.use(authenticate);

/**
 * GET /goals/statistics
 * Estatísticas gerais de metas do usuário
 * (Deve vir antes de /goals/:id para evitar conflito de rotas)
 */
goalRoutes.get('/statistics', goalController.getStatistics);

/**
 * GET /goals?is_active=true&period_type=MONTHLY
 * Lista metas do usuário com filtros opcionais
 */
goalRoutes.get('/', goalController.getGoals);

/**
 * POST /goals
 * Cria nova meta
 */
goalRoutes.post('/', goalController.createGoal);

/**
 * GET /goals/:id
 * Busca meta por ID
 */
goalRoutes.get('/:id', goalController.getGoalById);

/**
 * PUT /goals/:id
 * Atualiza meta existente
 */
goalRoutes.put('/:id', goalController.updateGoal);

/**
 * DELETE /goals/:id
 * Remove meta (soft delete)
 */
goalRoutes.delete('/:id', goalController.deleteGoal);
