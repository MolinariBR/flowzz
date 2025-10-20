/**
 * PagBankController
 *
 * Controller para gerenciar integração com PagBank para cobrança SaaS.
 * Permite criar assinaturas, gerenciar pagamentos e processar webhooks.
 *
 * Referências:
 * - milestone02.md: Fase 2.3 PagBank Integration
 * - apis.md: PagBank API documentation
 */

import type { Request, Response } from 'express'
import { PagBankService } from '../services/PagBankService'
import { prisma } from '../shared/config/database'
import { logger } from '../shared/utils/logger'

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export class PagBankController {
  private pagBankService: PagBankService

  constructor() {
    this.pagBankService = new PagBankService()
  }

  /**
   * Criar assinatura para um usuário
   * POST /api/v1/pagbank/subscriptions
   */
  async createSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        })
        return
      }

      const { planId, paymentMethod } = req.body

      if (!planId || !paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: planId, paymentMethod',
        })
        return
      }

      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      })

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        })
        return
      }

      // Verificar se já existe uma assinatura ativa
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          user_id: userId,
          status: { in: ['ACTIVE', 'TRIAL'] },
        },
      })

      if (existingSubscription) {
        res.status(400).json({
          success: false,
          error: 'User already has an active subscription',
        })
        return
      }

      // Criar ou obter customer no PagBank
      let customerId = user.pagbank_customer_id

      if (!customerId) {
        customerId = await this.pagBankService.createCustomer({
          name: user.nome,
          email: user.email,
          tax_id: user.documento || '',
          phone: user.telefone || '',
          address: user.endereco,
        })

        // Atualizar user com customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { pagbank_customer_id: customerId },
        })
      }

      // Criar assinatura no PagBank
      const pagBankSubscriptionId = await this.pagBankService.createSubscription({
        customerId,
        planId,
        paymentMethod,
      })

      // Criar subscription no banco local
      const subscription = await prisma.subscription.create({
        data: {
          user_id: userId,
          plan_id: planId,
          pagbank_subscription_id: pagBankSubscriptionId,
          status: 'ACTIVE',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        },
      })

      // Salvar método de pagamento
      await prisma.paymentMethod.create({
        data: {
          user_id: userId,
          type: 'credit_card',
          pagbank_token: paymentMethod.token,
          last_four_digits: paymentMethod.lastFourDigits,
          brand: paymentMethod.brand,
          expiry_month: paymentMethod.expiryMonth,
          expiry_year: paymentMethod.expiryYear,
          is_default: true,
        },
      })

      res.status(201).json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          pagBankSubscriptionId,
          status: 'ACTIVE',
        },
      })
    } catch (error) {
      logger.error('Error creating subscription', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * Cancelar assinatura
   * DELETE /api/v1/pagbank/subscriptions/:subscriptionId
   */
  async cancelSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      const subscriptionId = req.params.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        })
        return
      }

      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          error: 'Subscription ID is required',
        })
        return
      }

      // Buscar subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          user_id: userId,
        },
      })

      if (!subscription) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        })
        return
      }

      // Cancelar no PagBank
      if (subscription.pagbank_subscription_id) {
        await this.pagBankService.cancelSubscription(subscription.pagbank_subscription_id)
      }

      // Cancelar localmente
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'CANCELED',
          canceled_at: new Date(),
        },
      })

      res.json({
        success: true,
        message: 'Subscription canceled successfully',
      })
    } catch (error) {
      logger.error('Error canceling subscription', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * Obter status da assinatura
   * GET /api/v1/pagbank/subscriptions/:id
   */
  async getSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      const subscriptionId = req.params.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        })
        return
      }

      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          error: 'Subscription ID is required',
        })
        return
      }

      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          user_id: userId,
        },
        include: {
          plan: true,
        },
      })

      if (!subscription) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        })
        return
      }

      res.json({
        success: true,
        data: subscription,
      })
    } catch (error) {
      logger.error('Error getting subscription', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * Obter assinaturas do usuário
   * GET /api/v1/pagbank/subscriptions
   */
  async getSubscriptions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        })
        return
      }

      const subscriptions = await prisma.subscription.findMany({
        where: { user_id: userId },
        include: {
          plan: true,
        },
        orderBy: { created_at: 'desc' },
      })

      res.json({
        success: true,
        data: subscriptions,
      })
    } catch (error) {
      logger.error('Error listing subscriptions', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * Processar webhook do PagBank
   * POST /api/v1/pagbank/webhook
   */
  async processWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData = req.body

      // Verificar se é um webhook válido (implementar verificação de assinatura)
      await this.pagBankService.processWebhook(webhookData)

      res.json({
        success: true,
        message: 'Webhook processed successfully',
      })
    } catch (error) {
      logger.error('Error processing webhook', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  /**
   * Obter chave pública para criptografia de cartão
   * GET /api/v1/pagbank/public-key
   */
  async getPublicKey(_req: Request, res: Response): Promise<void> {
    try {
      const publicKey = await this.pagBankService.getPublicKey()

      res.json({
        success: true,
        data: { publicKey },
      })
    } catch (error) {
      logger.error('Error getting public key', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }
}
