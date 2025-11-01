/**
 * Integration Routes - Endpoints de Integração Geral
 *
 * Define rotas para gerenciamento geral das integrações
 *
 * Referências:
 * - design.md §External Integrations
 * - user-stories.md Story 2.2
 *
 * @autor Flowzz Team
 * @data 2025-10-31
 */

import { Router } from 'express';
import { IntegrationController } from '../controllers/IntegrationController';
import { IntegrationRepository } from '../repositories/IntegrationRepository';
import { authenticate } from '../shared/middlewares/authenticate';
import logger from '../shared/utils/logger';

// Criar instâncias
const integrationRepo = new IntegrationRepository();
const integrationController = new IntegrationController(integrationRepo);

// Criar router
const router = Router();

/**
 * Middleware de autenticação - Aplicado em todas as rotas
 */
router.use(authenticate);

/**
 * GET /api/v1/integrations
 *
 * Lista todas as integrações do usuário autenticado
 *
 * Response: IntegrationListDTO[]
 */
router.get('/', async (req, res) => {
  logger.info('GET /integrations', {
    userId: req.user?.userId,
  });

  await integrationController.getUserIntegrations(req, res);
});

export default router;