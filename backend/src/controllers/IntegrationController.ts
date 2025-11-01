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

import type { IntegrationProvider } from '@prisma/client'
import type { Request, Response } from 'express'
import type { IntegrationRepository } from '../repositories/IntegrationRepository'
import type { CoinzzService } from '../services/CoinzzService'
import logger from '../shared/utils/logger'

/**
 * DTO para resposta de listagem de integrações
 */
export interface IntegrationListDTO {
  id: string
  provider: string
  status: string
  lastSync: Date | null
  createdAt: Date
  config: {
    webhookUrl?: string
    syncEnabled?: boolean
    // Outros campos públicos (não incluir apiKey criptografada)
  }
}

/**
 * IntegrationController - Handlers para endpoints de integração
 *
 * Endpoints:
 * - GET /api/v1/integrations - Listar integrações do usuário
 * - POST /api/v1/integrations/connect - Conectar nova integração
 */
export class IntegrationController {
  constructor(
    private integrationRepo: IntegrationRepository,
    private coinzzService?: CoinzzService
  ) {}

  /**
   * GET /api/v1/integrations
   *
   * Lista todas as integrações do usuário autenticado
   *
   * Response: IntegrationListDTO[]
   */
  async getUserIntegrations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
        return
      }

      // Buscar todas as integrações do usuário
      const integrations = await this.integrationRepo.findByUserId(userId)

      // Mapear para DTO (remover dados sensíveis)
      const integrationDTOs: IntegrationListDTO[] = integrations.map((integration) => {
        const config = integration.config as unknown as Record<string, unknown>

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
        }
      })

      logger.info('User integrations retrieved', {
        userId,
        count: integrationDTOs.length,
      })

      res.status(200).json({
        success: true,
        data: integrationDTOs,
        message: 'Integrações encontradas com sucesso',
      })
    } catch (error) {
      logger.error('Error retrieving user integrations', { error })

      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * POST /api/v1/integrations/connect
   *
   * Conecta uma nova integração para o usuário autenticado
   *
   * Request Body: {
   *   provider: string,
   *   config: {
   *     producerEmail?: string,
   *     apiKey?: string,
   *     apiSecret?: string,
   *     webhookUrl?: string,
   *     syncEnabled?: boolean
   *   }
   * }
   */
  async connectIntegration(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      const body = req.body as { provider: string; config: Record<string, unknown> }
      const { provider, config } = body

      if (!userId) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
        return
      }

      if (!provider || !config) {
        res.status(400).json({
          error: 'INVALID_REQUEST',
          message: 'Provider e config são obrigatórios',
        })
        return
      }

      // Validar se o provider é válido
      const validProviders: IntegrationProvider[] = [
        'COINZZ',
        'FACEBOOK_ADS',
        'WHATSAPP',
        'PAGBANK',
      ]
      if (!validProviders.includes(provider as IntegrationProvider)) {
        res.status(400).json({
          error: 'INVALID_PROVIDER',
          message: 'Provider inválido',
        })
        return
      }

      const typedProvider = provider as IntegrationProvider

      // Verificar se já existe uma integração deste provider para o usuário
      const existingIntegration = await this.integrationRepo.findByUserAndProvider(
        userId,
        typedProvider
      )
      if (existingIntegration) {
        res.status(409).json({
          error: 'INTEGRATION_EXISTS',
          message: 'Já existe uma integração deste tipo para o usuário',
        })
        return
      }

      let integrationStatus: 'PENDING' | 'CONNECTED' | 'ERROR' = 'PENDING'
      const validatedConfig = config

      // Validar e conectar dependendo do provider
      if (provider === 'COINZZ') {
        try {
          // Usar o CoinzzService para validar as credenciais
          if (this.coinzzService && typeof config.apiKey === 'string') {
            const testResult = await this.coinzzService.testConnection(config.apiKey)
            if (!testResult.connected) {
              res.status(400).json({
                error: 'INVALID_CREDENTIALS',
                message: 'Credenciais da Coinzz inválidas',
              })
              return
            }
            integrationStatus = 'CONNECTED'
          }
        } catch (error) {
          logger.error('Error validating Coinzz credentials', { error, userId })
          res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Erro ao validar credenciais da Coinzz',
          })
          return
        }
      } else {
        // Para outros providers, marcar como conectado por enquanto
        integrationStatus = 'CONNECTED'
      }

      // Criar a integração no banco
      const integration = await this.integrationRepo.create({
        user_id: userId,
        provider: typedProvider,
        status: integrationStatus,
        config: validatedConfig,
      })

      logger.info('Integration connected successfully', {
        userId,
        provider,
        integrationId: integration.id,
      })

      res.status(201).json({
        success: true,
        data: {
          id: integration.id,
          provider: integration.provider,
          status: integration.status,
          createdAt: integration.created_at,
        },
        message: 'Integração conectada com sucesso',
      })
    } catch (error) {
      logger.error('Error connecting integration', { error })

      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      })
    }
  }
}
