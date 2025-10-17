/**
 * PagBank Routes
 *
 * Rotas para integração com PagBank para cobrança SaaS.
 * Referências:
 * - milestone02.md: Fase 2.3 PagBank Integration
 * - apis.md: PagBank API documentation
 */

import { Router } from 'express';
import { PagBankController } from '../controllers/PagBankController';
import { authenticate } from '../shared/middlewares/authenticate';

const router = Router();
const pagBankController = new PagBankController();

/**
 * POST /api/v1/pagbank/subscriptions
 * Criar nova assinatura para o usuário autenticado
 */
router.post('/subscriptions', authenticate, pagBankController.createSubscription.bind(pagBankController));

/**
 * GET /api/v1/pagbank/subscriptions
 * Obter todas as assinaturas do usuário autenticado
 */
router.get('/subscriptions', authenticate, pagBankController.getSubscriptions.bind(pagBankController));

/**
 * GET /api/v1/pagbank/subscriptions/:id
 * Obter detalhes de uma assinatura específica
 */
router.get('/subscriptions/:id', authenticate, pagBankController.getSubscription.bind(pagBankController));

/**
 * DELETE /api/v1/pagbank/subscriptions/:subscriptionId
 * Cancelar assinatura
 */
router.delete('/subscriptions/:subscriptionId', authenticate, pagBankController.cancelSubscription.bind(pagBankController));

/**
 * GET /api/v1/pagbank/public-key
 * Obter chave pública do PagBank (cacheada)
 */
router.get('/public-key', authenticate, pagBankController.getPublicKey.bind(pagBankController));

/**
 * POST /api/v1/pagbank/webhook
 * Webhook para receber notificações do PagBank
 * Nota: Webhooks não requerem autenticação pois vêm do PagBank
 */
router.post('/webhook', pagBankController.processWebhook.bind(pagBankController));

export { router as pagBankRoutes };