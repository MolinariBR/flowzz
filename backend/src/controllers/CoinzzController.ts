/**
 * Coinzz Controller - HTTP Handlers
 *
 * Gerencia requisições HTTP relacionadas à integração com Coinzz
 *
 * Referências:
 * - tasks.md: Task 5.2.5
 * - implement.md: §3 Controllers - Request validation, error handling, response formatting
 * - openapi.yaml: API Spec
 *
 * @autor Flowzz Team
 * @data 2025-01-13
 */

import type { Request, Response } from 'express'
import type { CoinzzService } from '../services/CoinzzService'
import logger from '../shared/utils/logger'
import { connectCoinzzSchema, syncCoinzzSchema } from '../validators/coinzz.validator'

/**
 * CoinzzController - Handlers para endpoints de integração Coinzz
 *
 * Endpoints:
 * - POST /integrations/coinzz/connect - Conectar integração
 * - GET /integrations/coinzz/status - Obter status da integração
 * - POST /integrations/coinzz/sync - Sincronizar manualmente
 * - POST /integrations/coinzz/disconnect - Desconectar integração
 */
export class CoinzzController {
  constructor(private coinzzService: CoinzzService) {}

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
  async connect(req: Request, res: Response): Promise<void> {
    try {
      // Validar body
      const validationResult = connectCoinzzSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos para conectar Coinzz',
          details: validationResult.error.errors,
        })
        return
      }

      const userId = req.user?.userId
      const userEmail = req.user?.email

      if (!userId || !userEmail) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
        return
      }
      const dto = {
        apiKey: validationResult.data.apiKey,
        producerEmail: userEmail, // Usar email do usuário logado
        ...(validationResult.data.webhookUrl && {
          webhookUrl: validationResult.data.webhookUrl,
        }),
      }

      // Chamar serviço
      const status = await this.coinzzService.connect(
        userId,
        dto as { apiKey: string; webhookUrl?: string }
      )

      logger.info('Coinzz integration connected via controller', { userId })

      res.status(200).json({
        success: true,
        data: status,
        message: 'Integração Coinzz conectada com sucesso',
      })
    } catch (error) {
      this.handleError(res, error, 'connect')
    }
  }

  /**
   * GET /integrations/coinzz/status
   *
   * Retorna status atual da integração Coinzz
   *
   * Response: CoinzzStatusDTO
   *
   * Referência: tasks.md Task 5.2.5
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
        return
      }

      const status = await this.coinzzService.getStatus(userId)

      res.status(200).json({
        success: true,
        data: status,
      })
    } catch (error) {
      this.handleError(res, error, 'getStatus')
    }
  }

  /**
   * POST /integrations/coinzz/sync
   *
   * Sincroniza manualmente vendas do Coinzz
   *
   * Body: { forceFullSync?: boolean }
   * Response: SyncResultDTO
   *
   * Referência: tasks.md Task 5.2.4
   */
  async syncManual(req: Request, res: Response): Promise<void> {
    try {
      // Validar body
      const validationResult = syncCoinzzSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos para sincronização',
          details: validationResult.error.errors,
        })
        return
      }

      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
        return
      }

      const { forceFullSync } = validationResult.data

      // Chamar serviço
      const result = await this.coinzzService.syncSales(userId, forceFullSync)

      logger.info('Coinzz manual sync completed', { userId, result })

      res.status(200).json({
        success: true,
        data: result,
        message: `Sincronização concluída: ${result.salesCreated} vendas criadas, ${result.salesUpdated} atualizadas`,
      })
    } catch (error) {
      this.handleError(res, error, 'syncManual')
    }
  }

  /**
   * POST /integrations/coinzz/disconnect
   *
   * Desconecta integração com Coinzz
   *
   * Response: { success: true }
   *
   * Referência: tasks.md Task 5.2.5
   */
  async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
        return
      }

      await this.coinzzService.disconnect(userId)

      logger.info('Coinzz integration disconnected via controller', { userId })

      res.status(200).json({
        success: true,
        message: 'Integração Coinzz desconectada com sucesso',
      })
    } catch (error) {
      this.handleError(res, error, 'disconnect')
    }
  }

  /**
   * Tratamento centralizado de erros
   *
   * Mapeia erros do serviço para respostas HTTP apropriadas
   */
  private handleError(res: Response, error: unknown, operation: string): void {
    logger.error(`CoinzzController.${operation} error`, { error })

    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      // Integração não encontrada
      if (message.includes('não encontrada') || message.includes('not found')) {
        res.status(404).json({
          error: 'COINZZ_NOT_FOUND',
          message: error.message,
        })
        return
      }

      // Erro de conexão com Coinzz
      if (
        message.includes('conexão') ||
        message.includes('connection') ||
        message.includes('api key')
      ) {
        res.status(400).json({
          error: 'COINZZ_CONNECTION_FAILED',
          message: error.message,
        })
        return
      }

      // Integração não conectada
      if (message.includes('não está conectada') || message.includes('not connected')) {
        res.status(400).json({
          error: 'COINZZ_NOT_CONNECTED',
          message: error.message,
        })
        return
      }

      // Erro genérico
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao processar requisição Coinzz',
        details: error.message,
      })
      return
    }

    // Erro desconhecido
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro desconhecido ao processar requisição Coinzz',
    })
  }

  /**
   * GET /integrations/coinzz/clients
   *
   * Retorna lista de clientes criados via integração Coinzz
   *
   * Response: Array<ClientDTO>
   */
  async getClients(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
        return
      }

      // Chamar serviço
      const clients = await this.coinzzService.getClients(userId)

      logger.info('Coinzz clients retrieved via controller', { userId, count: clients.length })

      res.status(200).json({
        success: true,
        data: clients,
        message: `${clients.length} clientes encontrados`,
      })
    } catch (error) {
      this.handleError(res, error, 'getClients')
    }
  }
}
