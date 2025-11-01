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
import { CoinzzService } from '../services/CoinzzService';
import { prisma } from '../shared/config/database';
import { authenticate } from '../shared/middlewares/authenticate';
import logger from '../shared/utils/logger';

// Criar instâncias
const integrationRepo = new IntegrationRepository();
const coinzzService = new CoinzzService(prisma);
const integrationController = new IntegrationController(integrationRepo, coinzzService);

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

/**
 * POST /api/v1/integrations/connect
 *
 * Conecta uma nova integração para o usuário autenticado
 *
 * Request: ConnectIntegrationDTO
 * Response: IntegrationDTO
 */
router.post('/connect', async (req, res) => {
  logger.info('POST /integrations/connect', {
    userId: req.user?.userId,
  });

  await integrationController.connectIntegration(req, res);
});

export default router;