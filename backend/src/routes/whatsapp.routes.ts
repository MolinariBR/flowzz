/**
 * WhatsApp Business API Routes
 *
 * Referências:
 * - apis.md: WhatsApp Business API documentation
 * - milestone02.md: Fase 2.1 WhatsApp Business API
 */

import { Router } from 'express';
import { whatsAppController } from '../controllers/WhatsAppController';
import { authenticate } from '../shared/middlewares/authenticate';
import { whatsAppRateLimiter, whatsAppWebhookRateLimiter } from '../shared/middlewares/rateLimiter';

const router = Router();

// Todas as rotas do WhatsApp requerem autenticação, exceto webhooks
router.use('/config', authenticate);
router.use('/templates', authenticate);
router.use('/status', authenticate);
router.use('/test', authenticate);

// Configuração da integração WhatsApp
router.get('/config', whatsAppController.getConfig.bind(whatsAppController));
router.post('/config', whatsAppController.configure.bind(whatsAppController));
router.delete('/config', whatsAppController.disconnect.bind(whatsAppController));

// Templates e status
router.get('/templates', whatsAppController.getTemplates.bind(whatsAppController));
router.get('/status', whatsAppController.getStatus.bind(whatsAppController));

// Teste de envio (rate limited por usuário)
router.post('/test', authenticate, whatsAppRateLimiter, whatsAppController.sendTestMessage.bind(whatsAppController));

// Webhooks (rate limited por business account)
router.get('/webhook', whatsAppWebhookRateLimiter, whatsAppController.verifyWebhook.bind(whatsAppController));
router.post('/webhook', whatsAppWebhookRateLimiter, whatsAppController.handleWebhook.bind(whatsAppController));

export default router;