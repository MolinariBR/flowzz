/**
 * Projection Routes
 *
 * Rotas REST para endpoints de projeções financeiras
 *
 * Referências:
 * - design.md: §Routes - REST endpoints com autenticação JWT
 * - tasks.md: Task 9.1.4 - Criar endpoints de projeções
 * - openapi.yaml: /projections/* endpoints
 */

import { Router } from 'express'
import { projectionController } from '../controllers/ProjectionController'
import { authenticate } from '../shared/middlewares/authenticate'

export const projectionRoutes = Router()

// Aplicar autenticação em todas as rotas
projectionRoutes.use(authenticate)

/**
 * GET /projections/sales?period=30
 * Projeção de vendas com 3 cenários (pessimista/realista/otimista)
 */
projectionRoutes.get('/sales', projectionController.getSalesProjection)

/**
 * GET /projections/cashflow?period=90
 * Projeção de fluxo de caixa (vendas - despesas)
 */
projectionRoutes.get('/cashflow', projectionController.getCashflowProjection)

/**
 * GET /projections/health-score
 * Score de saúde financeira (0-100%)
 */
projectionRoutes.get('/health-score', projectionController.getHealthScore)
