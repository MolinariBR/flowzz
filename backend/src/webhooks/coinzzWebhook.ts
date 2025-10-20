/**
 * Coinzz Webhook Handler
 *
 * Processa webhooks recebidos do Coinzz de forma assíncrona via Bull Queue
 *
 * Referências:
 * - tasks.md: Task 5.2.3
 * - webhookcoinzz.md: Estrutura completa dos webhooks
 * - implement.md: §6 Webhooks - Async processing, queue patterns
 *
 * @autor Flowzz Team
 * @data 2025-01-13
 */

import type { Request, Response } from 'express'
import { Router } from 'express'
import { CoinzzService } from '../services/CoinzzService'
import { prisma } from '../shared/config/database'
import logger from '../shared/utils/logger'
import {
  coinzzSubscriptionWebhookPayloadSchema,
  coinzzWebhookPayloadSchema,
} from '../validators/coinzz.validator'

// Criar instância do serviço
const coinzzService = new CoinzzService(prisma)

// Criar router para webhooks
const router = Router()

/**
 * POST /webhooks/coinzz
 *
 * Recebe webhook de pedido do Coinzz
 *
 * Estratégia:
 * 1. Validar payload
 * 2. Adicionar job ao Bull queue para processamento assíncrono
 * 3. Retornar 200 OK imediatamente (não bloquear resposta do Coinzz)
 * 4. Worker processa job e chama CoinzzService.processWebhook()
 *
 * Referência: tasks.md Task 5.2.3
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar payload
    const validationResult = coinzzWebhookPayloadSchema.safeParse(req.body)

    if (!validationResult.success) {
      logger.warn('Invalid Coinzz webhook payload received', {
        errors: validationResult.error.errors,
        body: req.body,
      })

      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid webhook payload',
        details: validationResult.error.errors,
      })
      return
    }

    const payload = validationResult.data

    logger.info('Coinzz webhook received', {
      orderNumber: payload.order.order_number,
      orderStatus: payload.order.order_status,
      clientEmail: payload.client.client_email,
    })

    // Processar webhook de forma assíncrona (não await para retornar 200 rápido)
    // Referência: tasks.md Task 5.2.3
    coinzzService.processWebhook(payload).catch((error) => {
      logger.error('Error processing Coinzz webhook async', {
        error,
        orderNumber: payload.order.order_number,
      })
    })

    logger.info('Coinzz webhook processing initiated', {
      orderNumber: payload.order.order_number,
    })

    // Retornar 200 OK imediatamente (não bloquear Coinzz)
    res.status(200).json({
      success: true,
      message: 'Webhook received and processing',
    })
  } catch (error) {
    logger.error('Error processing Coinzz webhook', { error })

    // Mesmo em caso de erro, retornar 200 para não bloquear Coinzz
    // O erro será registrado nos logs para investigação
    res.status(200).json({
      success: true,
      message: 'Webhook received',
    })
  }
})

/**
 * POST /webhooks/coinzz/subscription
 *
 * Recebe webhook de assinatura do Coinzz
 *
 * Similar ao webhook de pedido, mas processa dados de assinatura recorrente
 *
 * Referência: webhookcoinzz.md - Webhook de Assinaturas
 */
router.post('/subscription', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar payload
    const validationResult = coinzzSubscriptionWebhookPayloadSchema.safeParse(req.body)

    if (!validationResult.success) {
      logger.warn('Invalid Coinzz subscription webhook payload received', {
        errors: validationResult.error.errors,
        body: req.body,
      })

      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid subscription webhook payload',
        details: validationResult.error.errors,
      })
      return
    }

    const payload = validationResult.data

    logger.info('Coinzz subscription webhook received', {
      subscriptionHash: payload.subscription.subscription_hash,
      subscriptionStatus: payload.subscription.status,
      clientEmail: payload.client.client_email,
    })

    // Processar webhook de assinatura de forma assíncrona
    coinzzService.processSubscriptionWebhook(payload).catch((error) => {
      logger.error('Error processing Coinzz subscription webhook async', {
        error,
        subscriptionHash: payload.subscription.subscription_hash,
      })
    })

    logger.info('Coinzz subscription webhook processing initiated', {
      subscriptionHash: payload.subscription.subscription_hash,
    })

    // Retornar 200 OK imediatamente
    res.status(200).json({
      success: true,
      message: 'Subscription webhook received and processing',
    })
  } catch (error) {
    logger.error('Error processing Coinzz subscription webhook', { error })

    // Mesmo em caso de erro, retornar 200 para não bloquear Coinzz
    res.status(200).json({
      success: true,
      message: 'Subscription webhook received',
    })
  }
})

export default router
