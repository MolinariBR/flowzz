/**
 * WhatsApp Business API Controller
 *
 * Responsabilidades:
 * - Gerenciar configuração da integração WhatsApp
 * - Receber webhooks do WhatsApp
 * - Verificar webhooks
 * - Fornecer endpoints para configuração no admin
 *
 * Referências:
 * - apis.md: WhatsApp Business API documentation
 * - milestone02.md: Fase 2.1 WhatsApp Business API
 * - whatsapp-implementation-plan.md: Estrutura da API
 */

import type { Request, Response } from 'express';
import { whatsAppService } from '../services/WhatsAppService';
import { IntegrationRepository } from '../repositories/IntegrationRepository';
import { logger } from '../shared/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export class WhatsAppController {
  private integrationRepo: IntegrationRepository;

  constructor() {
    this.integrationRepo = new IntegrationRepository();
  }

  /**
   * GET /api/whatsapp/config
   * Obter configuração atual do WhatsApp para o usuário
   */
  async getConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const integration = await this.integrationRepo.findByUserAndProvider(
        userId,
        'WHATSAPP'
      );

      if (!integration) {
        res.json({
          configured: false,
          status: 'NOT_CONFIGURED',
        });
        return;
      }

      // Não retornar dados sensíveis como tokens
      res.json({
        configured: true,
        status: integration.status,
        createdAt: integration.created_at,
        updatedAt: integration.updated_at,
      });
    } catch (error) {
      logger.error('Error getting WhatsApp config', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/whatsapp/config
   * Configurar integração WhatsApp para o usuário
   */
  async configure(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const {
        accessToken,
        phoneNumberId,
        businessAccountId,
        apiVersion,
      } = req.body;

      // Validações básicas
      if (!accessToken || !phoneNumberId || !businessAccountId) {
        res.status(400).json({
          error: 'Missing required fields: accessToken, phoneNumberId, businessAccountId',
        });
        return;
      }

      // Verificar se já existe uma integração
      const existingIntegration = await this.integrationRepo.findByUserAndProvider(
        userId,
        'WHATSAPP'
      );

      const config = {
        accessToken,
        phoneNumberId,
        businessAccountId,
        apiVersion: apiVersion || 'v18.0',
      };

      let integration;
      if (existingIntegration) {
        // Atualizar integração existente
        integration = await this.integrationRepo.update(existingIntegration.id, {
          config,
          status: 'CONNECTED',
        });
      } else {
        // Criar nova integração
        integration = await this.integrationRepo.create({
          user_id: userId,
          provider: 'WHATSAPP',
          config,
          status: 'CONNECTED',
        });
      }

      logger.info('WhatsApp integration configured', {
        userId,
        integrationId: integration.id,
      });

      res.json({
        success: true,
        integration: {
          id: integration.id,
          status: integration.status,
          createdAt: integration.created_at,
          updatedAt: integration.updated_at,
        },
      });
    } catch (error) {
      logger.error('Error configuring WhatsApp', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/whatsapp/config
   * Remover configuração WhatsApp
   */
  async disconnect(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const integration = await this.integrationRepo.findByUserAndProvider(
        userId,
        'WHATSAPP'
      );

      if (!integration) {
        res.status(404).json({ error: 'WhatsApp integration not found' });
        return;
      }

      await this.integrationRepo.update(integration.id, {
        status: 'DISCONNECTED',
      });

      logger.info('WhatsApp integration disconnected', {
        userId,
        integrationId: integration.id,
      });

      res.json({ success: true });
    } catch (error) {
      logger.error('Error disconnecting WhatsApp', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/whatsapp/templates
   * Obter templates aprovados do WhatsApp
   */
  async getTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const templates = await whatsAppService.getApprovedTemplates(userId);

      res.json({
        templates,
        count: templates.length,
      });
    } catch (error) {
      logger.error('Error getting WhatsApp templates', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/whatsapp/status
   * Verificar status da conta WhatsApp
   */
  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const status = await whatsAppService.getAccountStatus(userId);

      res.json({ status });
    } catch (error) {
      logger.error('Error getting WhatsApp status', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/whatsapp/test
   * Enviar mensagem de teste
   */
  async sendTestMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { to, templateName, variables } = req.body;

      if (!to || !templateName) {
        res.status(400).json({
          error: 'Missing required fields: to, templateName',
        });
        return;
      }

      const result = await whatsAppService.sendTemplate(
        userId,
        templateName,
        to,
        variables || []
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      res.json({
        success: true,
        messageId: result.messageId,
      });
    } catch (error) {
      logger.error('Error sending test WhatsApp message', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/whatsapp/webhook
   * Verificação de webhook do WhatsApp (GET)
   */
  async verifyWebhook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': verifyToken } = req.query;

      // TODO: Implementar verificação do verify_token com valor armazenado no banco
      // Por enquanto, aceitamos qualquer token para desenvolvimento
      const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'flowzz_webhook_verify';

      if (mode === 'subscribe' && verifyToken === expectedToken) {
        logger.info('WhatsApp webhook verified successfully');
        res.status(200).send(challenge);
        return;
      }

      logger.warn('WhatsApp webhook verification failed', { mode, verifyToken });
      res.status(403).send('Verification failed');
    } catch (error) {
      logger.error('Error verifying WhatsApp webhook', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).send('Internal server error');
    }
  }

  /**
   * POST /api/whatsapp/webhook
   * Receber webhooks do WhatsApp (POST)
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      logger.info('Received WhatsApp webhook', {
        payload: JSON.stringify(payload),
      });

      // Verificar se é uma mensagem válida
      if (!payload.object || payload.object !== 'whatsapp_business_account') {
        res.status(400).send('Invalid webhook payload');
        return;
      }

      // Processar webhook - o serviço identifica automaticamente o usuário
      await whatsAppService.handleWebhook(payload);

      // Responder imediatamente para confirmar recebimento
      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling WhatsApp webhook', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Mesmo com erro, responder 200 para não receber retries desnecessários
      res.status(200).send('OK');
    }
  }
}

// Export singleton instance
export const whatsAppController = new WhatsAppController();