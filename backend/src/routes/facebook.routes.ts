/**
 * Facebook Ads Integration Routes
 *
 * Rotas para gerenciar integração com Facebook Marketing API.
 * Todas as rotas requerem autenticação (middleware authenticate).
 *
 * Referências:
 * - design.md: Facebook Ads Marketing API Integration
 * - dev-stories.md: Dev Story 3.2
 * - tasks.md: Task 6.1/6.2
 * - user-stories.md: Story 1.3
 */

import { Router } from 'express';
import { FacebookAdsController } from '../controllers/FacebookAdsController';
import { authenticate } from '../shared/middlewares/authenticate';
import { logger } from '../shared/utils/logger';

const router = Router();
const facebookAdsController = new FacebookAdsController();

/**
 * @route GET /api/v1/integrations/facebook/connect
 * @desc Iniciar processo de OAuth 2.0
 * @access Private
 * @returns {object} 200 - Authorization URL
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Internal Server Error
 */
router.get(
  '/connect',
  authenticate,
  async (req, res) => {
    logger.info('GET /integrations/facebook/connect', { userId: req.user?.userId });
    await facebookAdsController.connect(req, res);
  },
);

/**
 * @route GET /api/v1/integrations/facebook/callback
 * @desc Callback OAuth do Facebook
 * @access Private
 * @query {string} code - Authorization code
 * @query {string} state - State parameter
 * @returns {object} 200 - Integration config
 * @returns {object} 400 - Invalid callback parameters
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Internal Server Error
 */
router.get(
  '/callback',
  authenticate,
  async (req, res) => {
    logger.info('GET /integrations/facebook/callback', { userId: req.user?.userId, hasCode: !!req.query.code });
    await facebookAdsController.callback(req, res);
  },
);

/**
 * @route GET /api/v1/integrations/facebook/status
 * @desc Obter status da integração
 * @access Private
 * @returns {object} 200 - Integration status
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Internal Server Error
 */
router.get(
  '/status',
  authenticate,
  async (req, res) => {
    logger.info('GET /integrations/facebook/status', { userId: req.user?.userId });
    await facebookAdsController.getStatus(req, res);
  },
);

/**
 * @route POST /api/v1/integrations/facebook/insights
 * @desc Buscar insights de ad account
 * @access Private
 * @body {object} FacebookInsightsParamsDTO - adAccountId, datePreset, startDate, endDate, level, timeIncrement
 * @returns {object} 200 - Insights data
 * @returns {object} 400 - Invalid parameters
 * @returns {object} 401 - Unauthorized
 * @returns {object} 429 - Rate limit exceeded
 * @returns {object} 500 - Internal Server Error
 */
router.post(
  '/insights',
  authenticate,
  async (req, res) => {
    logger.info('POST /integrations/facebook/insights', { userId: req.user?.userId, adAccountId: req.body?.adAccountId });
    await facebookAdsController.getInsights(req, res);
  },
);

/**
 * @route POST /api/v1/integrations/facebook/sync
 * @desc Sincronizar insights manualmente
 * @access Private
 * @body {object} (opcional) { forceFullSync?: boolean }
 * @returns {object} 200 - Sync result
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Internal Server Error
 */
router.post(
  '/sync',
  authenticate,
  async (req, res) => {
    logger.info('POST /integrations/facebook/sync', { userId: req.user?.userId });
    await facebookAdsController.syncManual(req, res);
  },
);

/**
 * @route GET /api/v1/integrations/facebook/ad-accounts
 * @desc Listar ad accounts do usuário
 * @access Private
 * @returns {object} 200 - Ad accounts list
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Internal Server Error
 */
router.get(
  '/ad-accounts',
  authenticate,
  async (req, res) => {
    logger.info('GET /integrations/facebook/ad-accounts', { userId: req.user?.userId });
    await facebookAdsController.getAdAccounts(req, res);
  },
);

/**
 * @route GET /api/v1/integrations/facebook/test
 * @desc Testar conexão com Facebook
 * @access Private
 * @returns {object} 200 - Test result
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Internal Server Error
 */
router.get(
  '/test',
  authenticate,
  async (req, res) => {
    logger.info('GET /integrations/facebook/test', { userId: req.user?.userId });
    await facebookAdsController.testConnection(req, res);
  },
);

/**
 * @route POST /api/v1/integrations/facebook/disconnect
 * @desc Desconectar integração
 * @access Private
 * @returns {object} 200 - Disconnect confirmation
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Internal Server Error
 */
router.post(
  '/disconnect',
  authenticate,
  async (req, res) => {
    logger.info('POST /integrations/facebook/disconnect', { userId: req.user?.userId });
    await facebookAdsController.disconnect(req, res);
  },
);

export default router;
