/**
 * Integration Controller - HTTP Handlers
 *
 * Gerencia requisições HTTP relacionadas às integrações externas
 *
 * Referências:
 * - design.md §External Integrations
 * - user-stories.md Story 2.2
 *
 * @autor Flowzz Team
 * @data 2025-10-31
 */

import type { Request, Response } from 'express';
import { IntegrationRepository } from '../repositories/IntegrationRepository';
import logger from '../shared/utils/logger';

/**
 * DTO para resposta de listagem de integrações
 */
export interface IntegrationListDTO {
  id: string;
  provider: string;
  status: string;
  lastSync: Date | null;
  createdAt: Date;
  config: {
    webhookUrl?: string;
    syncEnabled?: boolean;
    // Outros campos públicos (não incluir apiKey criptografada)
  };
}

/**
 * IntegrationController - Handlers para endpoints de integração
 *
 * Endpoints:
 * - GET /api/v1/integrations - Listar integrações do usuário
 */
export class IntegrationController {
  constructor(private integrationRepo: IntegrationRepository) {}

  /**
   * GET /api/v1/integrations
   *
   * Lista todas as integrações do usuário autenticado
   *
   * Response: IntegrationListDTO[]
   */
  async getUserIntegrations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        });
        return;
      }

      // Buscar todas as integrações do usuário
      const integrations = await this.integrationRepo.findByUserId(userId);

      // Mapear para DTO (remover dados sensíveis)
      const integrationDTOs: IntegrationListDTO[] = integrations.map((integration) => {
        const config = integration.config as unknown as Record<string, unknown>;

        return {
          id: integration.id,
          provider: integration.provider,
          status: integration.status,
          lastSync: integration.last_sync,
          createdAt: integration.created_at,
          config: {
            webhookUrl: config?.webhookUrl as string,
            syncEnabled: config?.syncEnabled as boolean,
            // Não incluir apiKey ou outros dados sensíveis
          },
        };
      });

      logger.info('User integrations retrieved', {
        userId,
        count: integrationDTOs.length,
      });

      res.status(200).json({
        success: true,
        data: integrationDTOs,
        message: 'Integrações encontradas com sucesso',
      });
    } catch (error) {
      logger.error('Error retrieving user integrations', { error });

      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      });
    }
  }
}