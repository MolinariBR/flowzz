# 💳 Sistema de Pagamentos e Assinaturas

## 🚨 **Problema Identificado**

O sistema de pagamentos está **parcialmente implementado**:

- ✅ PagBank service criado (`src/services/PagBankService.ts`)
- ✅ Controller de assinaturas implementado (`src/controllers/PagBankController.ts`)
- ❌ Webhooks PagBank não processam eventos
- ❌ Gestão completa de planos não funcional
- ❌ Modelos existem mas alguns campos faltam

## ✅ **Arquitetura Proposta**

### **Componentes Principais**
1. **PagBankService**: Cliente da API PagBank
2. **SubscriptionService**: Gestão de assinaturas
3. **Webhook Handler**: Processamento de eventos PagBank
4. **Billing Controller**: Endpoints de cobrança

---

## 💰 **1. PagBank Service**

### **1.1 Implementação Base**
Criar `src/services/PagBankService.ts`:

```typescript
import axios from 'axios'
import crypto from 'crypto'

export interface PagBankConfig {
  token: string
  email: string
  sandbox: boolean
}

export class PagBankService {
  private config: PagBankConfig
  private baseUrl: string

  constructor(config: PagBankConfig) {
    this.config = config
    this.baseUrl = config.sandbox
      ? 'https://sandbox.api.pagseguro.com'
      : 'https://api.pagseguro.com'
  }

  /**
   * Criar assinatura recorrente
   */
  async createSubscription(subscriptionData: {
    planId: string
    customer: {
      name: string
      email: string
      phone: string
      document: string
      address: any
    }
    paymentMethod: {
      type: 'credit_card' | 'pix' | 'boleto'
      card?: any
    }
  }) {
    try {
      const payload = {
        plan: subscriptionData.planId,
        sender: {
          name: subscriptionData.customer.name,
          email: subscriptionData.customer.email,
          phone: subscriptionData.customer.phone,
          documents: [{
            type: 'CPF',
            value: subscriptionData.customer.document,
          }],
          address: subscriptionData.customer.address,
        },
        paymentMethod: this.formatPaymentMethod(subscriptionData.paymentMethod),
      }

      const response = await axios.post(
        `${this.baseUrl}/pre-approvals`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        subscriptionId: response.data.code,
        status: response.data.status,
        link: response.data.link,
      }
    } catch (error) {
      console.error('PagBank subscription creation failed:', error)
      throw error
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      await axios.put(
        `${this.baseUrl}/pre-approvals/${subscriptionId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
          },
        }
      )

      return { success: true }
    } catch (error) {
      console.error('PagBank subscription cancellation failed:', error)
      throw error
    }
  }

  /**
   * Buscar status da assinatura
   */
  async getSubscriptionStatus(subscriptionId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/pre-approvals/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
          },
        }
      )

      return {
        status: response.data.status,
        lastPayment: response.data.lastEventDate,
        nextPayment: response.data.nextDueDate,
      }
    } catch (error) {
      console.error('PagBank subscription status fetch failed:', error)
      throw error
    }
  }

  private formatPaymentMethod(paymentMethod: any) {
    switch (paymentMethod.type) {
      case 'credit_card':
        return {
          type: 'CREDITCARD',
          creditCard: {
            token: paymentMethod.card.token,
            holder: {
              name: paymentMethod.card.holder.name,
              birthDate: paymentMethod.card.holder.birthDate,
              documents: [{
                type: 'CPF',
                value: paymentMethod.card.holder.document,
              }],
              phone: paymentMethod.card.holder.phone,
            },
          },
        }
      case 'pix':
        return { type: 'PIX' }
      case 'boleto':
        return { type: 'BOLETO' }
      default:
        throw new Error('Unsupported payment method')
    }
  }
}
```

### **1.2 Configuração**
Adicionar ao `.env`:

```env
# PagBank Configuration
PAGBANK_TOKEN=your_pagbank_token_here
PAGBANK_EMAIL=your_email@domain.com
PAGBANK_SANDBOX=true

# Webhook
PAGBANK_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 🔄 **2. Subscription Service**

### **2.1 Implementação**
Criar `src/services/SubscriptionService.ts`:

```typescript
import { PagBankService } from './PagBankService'
import { prisma } from '../shared/config/database'

export class SubscriptionService {
  private pagBankService: PagBankService

  constructor(pagBankConfig: any) {
    this.pagBankService = new PagBankService(pagBankConfig)
  }

  /**
   * Criar nova assinatura
   */
  async createSubscription(userId: string, planId: string, paymentData: any) {
    // 1. Buscar plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new Error('Plan not found')
    }

    // 2. Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // 3. Criar assinatura no PagBank
    const pagBankResponse = await this.pagBankService.createSubscription({
      planId: plan.id,
      customer: {
        name: user.nome,
        email: user.email,
        phone: user.telefone || '',
        document: user.documento || '',
        address: user.endereco || {},
      },
      paymentMethod: paymentData,
    })

    // 4. Salvar assinatura no banco
    const subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        plan_id: planId,
        status: 'TRIAL', // Começa como trial
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias trial
        pagbank_subscription_id: pagBankResponse.subscriptionId,
        pagbank_status: pagBankResponse.status,
      },
    })

    return {
      subscription,
      paymentLink: pagBankResponse.link,
    }
  }

  /**
   * Atualizar status da assinatura
   */
  async updateSubscriptionStatus(subscriptionId: string, status: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { pagbank_subscription_id: subscriptionId },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Atualizar status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: this.mapPagBankStatus(status),
        pagbank_status: status,
        updated_at: new Date(),
      },
    })

    // Se ativada, atualizar usuário
    if (status === 'ACTIVE') {
      await prisma.user.update({
        where: { id: subscription.user_id },
        data: {
          subscription_status: 'ACTIVE',
          plan_id: subscription.plan_id,
        },
      })
    }
  }

  private mapPagBankStatus(pagBankStatus: string): string {
    const statusMap: Record<string, string> = {
      'INITIATED': 'TRIAL',
      'ACTIVE': 'ACTIVE',
      'SUSPENDED': 'PAST_DUE',
      'CANCELLED': 'CANCELED',
    }
    return statusMap[pagBankStatus] || 'TRIAL'
  }
}
```

---

## 🎣 **3. Webhook Handler**

### **3.1 Implementação**
Criar `src/webhooks/pagbankWebhook.ts`:

```typescript
import { Request, Response } from 'express'
import { SubscriptionService } from '../services/SubscriptionService'
import { logger } from '../shared/utils/logger'

const subscriptionService = new SubscriptionService({
  token: process.env.PAGBANK_TOKEN!,
  email: process.env.PAGBANK_EMAIL!,
  sandbox: process.env.PAGBANK_SANDBOX === 'true',
})

export const pagbankWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event, data } = req.body

    logger.info('PagBank webhook received', { event, data })

    // Verificar assinatura do webhook
    const isValid = verifyWebhookSignature(req)
    if (!isValid) {
      logger.warn('Invalid webhook signature')
      res.status(401).json({ error: 'Invalid signature' })
      return
    }

    switch (event) {
      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break
      case 'subscription.activated':
        await handleSubscriptionActivated(data)
        break
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data)
        break
      case 'payment.received':
        await handlePaymentReceived(data)
        break
      case 'payment.overdue':
        await handlePaymentOverdue(data)
        break
      default:
        logger.warn('Unknown PagBank event', { event })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    logger.error('PagBank webhook error', { error })
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleSubscriptionCreated(data: any) {
  logger.info('Processing subscription created', { subscriptionId: data.code })

  // Atualizar status da assinatura
  await subscriptionService.updateSubscriptionStatus(data.code, data.status)
}

async function handleSubscriptionActivated(data: any) {
  logger.info('Processing subscription activated', { subscriptionId: data.code })

  // Ativar assinatura e usuário
  await subscriptionService.updateSubscriptionStatus(data.code, 'ACTIVE')
}

async function handleSubscriptionCancelled(data: any) {
  logger.info('Processing subscription cancelled', { subscriptionId: data.code })

  // Cancelar assinatura
  await subscriptionService.updateSubscriptionStatus(data.code, 'CANCELLED')
}

async function handlePaymentReceived(data: any) {
  logger.info('Processing payment received', {
    subscriptionId: data.subscriptionCode,
    amount: data.grossAmount,
  })

  // Registrar pagamento
  await prisma.payment.create({
    data: {
      subscription_id: data.subscriptionCode,
      amount: data.grossAmount,
      status: 'COMPLETED',
      pagbank_transaction_id: data.code,
      paid_at: new Date(),
    },
  })
}

async function handlePaymentOverdue(data: any) {
  logger.warn('Processing payment overdue', { subscriptionId: data.subscriptionCode })

  // Marcar como vencido
  await subscriptionService.updateSubscriptionStatus(data.subscriptionCode, 'SUSPENDED')
}

function verifyWebhookSignature(req: Request): boolean {
  // Implementar verificação de assinatura do PagBank
  // Comparar header de assinatura com hash do body
  return true // Temporário
}
```

### **3.2 Registrar Webhook**
Adicionar ao `src/app.ts`:

```typescript
// Webhooks (raw body parser required)
app.use('/webhooks/pagbank', express.raw({ type: 'application/json' }), pagbankWebhook)
```

---

## 🎛️ **4. Billing Controller**

### **4.1 Implementação**
Criar `src/controllers/BillingController.ts`:

```typescript
import { Request, Response } from 'express'
import { SubscriptionService } from '../services/SubscriptionService'

const subscriptionService = new SubscriptionService({
  token: process.env.PAGBANK_TOKEN!,
  email: process.env.PAGBANK_EMAIL!,
  sandbox: process.env.PAGBANK_SANDBOX === 'true',
})

export class BillingController {
  /**
   * POST /billing/subscriptions
   * Criar nova assinatura
   */
  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { planId, paymentMethod } = req.body
      const userId = req.user!.userId

      const result = await subscriptionService.createSubscription(
        userId,
        planId,
        paymentMethod
      )

      res.status(201).json({
        message: 'Assinatura criada com sucesso',
        data: result,
      })
    } catch (error) {
      console.error('Create subscription error:', error)
      res.status(500).json({
        error: 'Erro ao criar assinatura',
      })
    }
  }

  /**
   * GET /billing/subscriptions
   * Buscar assinatura do usuário
   */
  async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId

      const subscription = await prisma.subscription.findFirst({
        where: { user_id: userId },
        include: { plan: true },
      })

      if (!subscription) {
        res.status(404).json({ error: 'Assinatura não encontrada' })
        return
      }

      res.json({ data: subscription })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar assinatura' })
    }
  }

  /**
   * DELETE /billing/subscriptions
   * Cancelar assinatura
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId

      const subscription = await prisma.subscription.findFirst({
        where: { user_id: userId },
      })

      if (!subscription) {
        res.status(404).json({ error: 'Assinatura não encontrada' })
        return
      }

      await subscriptionService.cancelSubscription(subscription.pagbank_subscription_id!)

      res.json({ message: 'Assinatura cancelada com sucesso' })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cancelar assinatura' })
    }
  }
}
```

### **4.2 Rotas**
Criar `src/routes/billing.routes.ts`:

```typescript
import { Router } from 'express'
import { BillingController } from '../controllers/BillingController'
import { authenticate } from '../shared/middlewares/authenticate'

const router = Router()
const billingController = new BillingController()

router.use(authenticate)

router.post('/subscriptions', (req, res) =>
  billingController.createSubscription(req, res)
)

router.get('/subscriptions', (req, res) =>
  billingController.getSubscription(req, res)
)

router.delete('/subscriptions', (req, res) =>
  billingController.cancelSubscription(req, res)
)

export default router
```

Adicionar ao `src/app.ts`:

```typescript
app.use('/api/v1/billing', billingRoutes)
```

---

## 🧪 **5. Testes**

### **5.1 Testes Unitários**
```typescript
// src/__tests__/services/PagBankService.test.ts
describe('PagBankService', () => {
  it('should create subscription successfully', async () => {
    // Mock axios response
    // Test service method
  })
})
```

### **5.2 Testes de Integração**
```typescript
// src/__tests__/billing.integration.test.ts
describe('Billing Flow', () => {
  it('should create subscription end-to-end', async () => {
    // Create user
    // Create subscription
    // Verify database
    // Mock webhook
    // Verify activation
  })
})
```

---

## 📋 **6. Checklist de Implementação**

### **Fase 1: Setup Básico (1 semana)**
- [ ] PagBankService implementado
- [ ] SubscriptionService criado
- [ ] Modelos de banco atualizados
- [ ] Configurações de ambiente

### **Fase 2: Webhooks (1 semana)**
- [ ] Webhook handler implementado
- [ ] Verificação de assinatura
- [ ] Processamento de eventos
- [ ] Logging adequado

### **Fase 3: API de Cobrança (1 semana)**
- [ ] BillingController criado
- [ ] Rotas configuradas
- [ ] Validações implementadas
- [ ] Error handling

### **Fase 4: Testes e Deploy (1 semana)**
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes end-to-end
- [ ] Monitoramento

---

## 🎯 **Métricas de Sucesso**

- **Conversão**: 80% de trials convertem para pago
- **Retenção**: 90% de pagamentos processados com sucesso
- **Uptime**: 99.9% de disponibilidade do sistema de cobrança
- **Satisfação**: < 2% de chargebacks

## 🔄 **Próximos Passos**

Após sistema de pagamentos:
1. **Dashboard de Cobrança** - Visão geral financeira
2. **Relatórios de MRR/ARR** - Métricas SaaS
3. **Dunning Management** - Recuperação de pagamentos
4. **Multi-moeda** - Suporte internacional

---

**Data:** 31 de outubro de 2025
**Prioridade:** 🔴 Crítica
**Tempo Estimado:** 4 semanas
**Custo Estimado:** R$ 5.000-10.000 (PagBank setup)