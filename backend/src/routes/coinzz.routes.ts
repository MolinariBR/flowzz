/**
 * Coinzz Routes - Endpoints de Integração
 *
 * Define rotas para gerenciamento da integração com Coinzz
 *
 * Referências:
 * - tasks.md: Task 5.2.5
 * - openapi.yaml: API Spec
 * - implement.md: §4 Routes
 *
 * @autor Flowzz Team
 * @data 2025-01-13
 */

import { Router } from 'express';
import { CoinzzController } from '../controllers/CoinzzController';
import { CoinzzService } from '../services/CoinzzService';
import { authenticate } from '../shared/middlewares/authenticate';
import { integrationSyncRateLimiter } from '../shared/middlewares/rateLimiter';
import { prisma } from '../shared/config/database';
import logger from '../shared/utils/logger';

// Criar instâncias de serviço e controller
const coinzzService = new CoinzzService(prisma);
const coinzzController = new CoinzzController(coinzzService);

// Criar router
const router = Router();

/**
 * Middleware de autenticação - Aplicado em todas as rotas
 *
 * Referência: implement.md §4.2
 */
router.use(authenticate);

/**
 * POST /integrations/coinzz/connect
 *
 * Conecta ou atualiza integração com Coinzz
 *
 * Body: { apiKey: string, webhookUrl?: string }
 * Response: CoinzzStatusDTO
 *
 * Referência: tasks.md Task 5.2.1
 */
router.post('/connect', async (req, res) => {
  logger.info('POST /integrations/coinzz/connect', { userId: req.user?.userId });
  await coinzzController.connect(req, res);
});

/**
 * GET /integrations/coinzz/status
 *
 * Retorna status atual da integração Coinzz
 *
 * Response: CoinzzStatusDTO
 *
 * Referência: tasks.md Task 5.2.5
 */
router.get('/status', async (req, res) => {
  logger.info('GET /integrations/coinzz/status', { userId: req.user?.userId });
  await coinzzController.getStatus(req, res);
});

/**
 * POST /integrations/coinzz/sync
 *
 * Sincroniza manualmente vendas do Coinzz
 * Rate limited: 10 syncs/hour per user
 *
 * Body: { forceFullSync?: boolean }
 * Response: SyncResultDTO
 *
 * Referência: tasks.md Task 5.2.4, Task 12.2.2
 */
router.post('/sync', integrationSyncRateLimiter, async (req, res) => {
  logger.info('POST /integrations/coinzz/sync', { userId: req.user?.userId });
  await coinzzController.syncManual(req, res);
});

/**
 * POST /integrations/coinzz/disconnect
 *
 * Desconecta integração com Coinzz
 *
 * Response: { success: true }
 *
 * Referência: tasks.md Task 5.2.5
 */
router.post('/disconnect', async (req, res) => {
  logger.info('POST /integrations/coinzz/disconnect', { userId: req.user?.userId });
  await coinzzController.disconnect(req, res);
});

export default router;
