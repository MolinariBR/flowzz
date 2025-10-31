# 🔌 Roadmap de Integrações Externas

## 🚨 **Problema Identificado**

As integrações externas estão **parcialmente implementadas ou não funcionais**:

- **Coinzz**: Webhook existe mas não processa dados
- **WhatsApp Business API**: Configuração existe mas não envia mensagens
- **Facebook Ads**: Estrutura existe mas não sincroniza dados
- **PagBank**: Não implementado

## ✅ **Estratégia de Implementação**

### **Princípios**
1. **Incremental**: Implementar uma de cada vez
2. **Testável**: Cada integração com testes isolados
3. **Monitorável**: Logs e métricas para cada integração
4. **Resiliente**: Retry logic e fallbacks

---

## 📦 **1. Coinzz Integration** (Prioridade: 🔴 Alta)

### **Status Atual**
- ✅ Webhook endpoint existe (`/webhooks/coinzz`)
- ✅ Estrutura de dados mapeada
- ❌ Processamento não implementado
- ❌ Validação de dados faltando

### **Implementação**

#### **1.1 Atualizar Webhook Handler**
Modificar `src/webhooks/coinzzWebhook.ts`:

```typescript
import { Request, Response } from 'express'
import { prisma } from '../shared/config/database'
import { logger } from '../shared/utils/logger'

export const coinzzWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event, data } = req.body

    logger.info('Coinzz webhook received', { event, data })

    switch (event) {
      case 'order.created':
        await handleOrderCreated(data)
        break
      case 'order.updated':
        await handleOrderUpdated(data)
        break
      case 'customer.created':
        await handleCustomerCreated(data)
        break
      default:
        logger.warn('Unknown Coinzz event', { event })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    logger.error('Coinzz webhook error', { error })
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleOrderCreated(orderData: any) {
  // 1. Buscar ou criar cliente
  const client = await prisma.client.upsert({
    where: {
      user_id_external_id: {
        user_id: orderData.user_id, // Assumindo que temos user_id
        external_id: orderData.customer.id.toString(),
      },
    },
    update: {
      name: orderData.customer.name,
      email: orderData.customer.email,
      phone: orderData.customer.phone,
    },
    create: {
      user_id: orderData.user_id,
      external_id: orderData.customer.id.toString(),
      name: orderData.customer.name,
      email: orderData.customer.email,
      phone: orderData.customer.phone,
    },
  })

  // 2. Criar venda
  await prisma.sale.create({
    data: {
      user_id: orderData.user_id,
      client_id: client.id,
      external_id: orderData.id.toString(),
      product_name: orderData.items[0]?.name || 'Produto',
      product_sku: orderData.items[0]?.sku,
      quantity: orderData.items[0]?.quantity || 1,
      unit_price: orderData.items[0]?.price || 0,
      total_price: orderData.total,
      status: mapOrderStatus(orderData.status),
      payment_method: orderData.payment.method,
    },
  })

  logger.info('Order processed successfully', { orderId: orderData.id })
}

function mapOrderStatus(coinzzStatus: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'PENDING',
    'paid': 'PAID',
    'shipped': 'SHIPPED',
    'delivered': 'DELIVERED',
    'cancelled': 'CANCELED',
  }
  return statusMap[coinzzStatus] || 'PENDING'
}
```

#### **1.2 Adicionar Validação**
Criar `src/validators/coinzz.ts`:

```typescript
import { z } from 'zod'

export const coinzzOrderSchema = z.object({
  id: z.number(),
  status: z.string(),
  total: z.number(),
  customer: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  items: z.array(z.object({
    name: z.string(),
    sku: z.string().optional(),
    quantity: z.number(),
    price: z.number(),
  })),
  payment: z.object({
    method: z.string(),
  }),
})

export const coinzzWebhookSchema = z.object({
  event: z.string(),
  data: coinzzOrderSchema,
})
```

#### **1.3 Testes**
Criar `src/__tests__/webhooks/coinzz.test.ts`:

```typescript
import request from 'supertest'
import app from '../../app'

describe('Coinzz Webhook', () => {
  it('should process order.created event', async () => {
    const webhookData = {
      event: 'order.created',
      data: {
        id: 12345,
        status: 'paid',
        total: 299.99,
        customer: {
          id: 67890,
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '11999999999',
        },
        items: [{
          name: 'Produto Teste',
          sku: 'SKU123',
          quantity: 1,
          price: 299.99,
        }],
        payment: {
          method: 'credit_card',
        },
      },
    }

    const response = await request(app)
      .post('/webhooks/coinzz')
      .send(webhookData)
      .expect(200)

    expect(response.body).toEqual({ success: true })
  })
})
```

### **1.4 Configuração**
Adicionar ao `.env`:

```env
COINZZ_WEBHOOK_SECRET=your_webhook_secret_here
COINZZ_API_KEY=your_api_key_here
```

---

## 💬 **2. WhatsApp Business API** (Prioridade: 🟡 Média)

### **Status Atual**
- ✅ Página de configuração existe
- ✅ Campos de configuração salvos
- ❌ API não integrada
- ❌ Mensagens não enviadas

### **Implementação**

#### **2.1 Criar Serviço WhatsApp**
Criar `src/services/WhatsAppService.ts`:

```typescript
import axios from 'axios'

export class WhatsAppService {
  private apiUrl: string
  private accessToken: string
  private phoneNumberId: string

  constructor() {
    this.apiUrl = 'https://graph.facebook.com/v18.0'
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!
  }

  async sendMessage(to: string, message: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('WhatsApp API error:', error)
      throw error
    }
  }

  async sendTemplate(to: string, templateName: string, parameters: any[] = []) {
    // Implementar envio de templates
  }
}
```

#### **2.2 Atualizar Controller**
Modificar `src/controllers/AdminController.ts`:

```typescript
import { WhatsAppService } from '../services/WhatsAppService'

const whatsAppService = new WhatsAppService()

export const testWhatsAppConnection = async (req: Request, res: Response) => {
  try {
    // Buscar configuração salva
    const config = await prisma.integration.findFirst({
      where: {
        user_id: req.user!.userId,
        provider: 'WHATSAPP',
      },
    })

    if (!config) {
      return res.status(400).json({ error: 'WhatsApp not configured' })
    }

    // Testar envio de mensagem
    const testMessage = await whatsAppService.sendMessage(
      config.config.phoneNumberId, // Número de teste
      'Teste de conexão FlowZZ ✅'
    )

    res.json({ success: true, messageId: testMessage.messages[0].id })
  } catch (error) {
    res.status(500).json({ error: 'Connection test failed' })
  }
}
```

#### **2.3 Webhook de Resposta**
Criar `src/webhooks/whatsappWebhook.ts`:

```typescript
export const whatsappWebhook = async (req: Request, res: Response) => {
  const { entry } = req.body

  for (const e of entry) {
    for (const change of e.changes) {
      if (change.field === 'messages') {
        const message = change.value.messages[0]
        if (message.type === 'text') {
          await handleIncomingMessage(message)
        }
      }
    }
  }

  res.status(200).send('OK')
}

async function handleIncomingMessage(message: any) {
  const from = message.from
  const text = message.text.body

  // Lógica para processar mensagens recebidas
  // Ex: confirmações de pagamento, suporte, etc.
}
```

---

## 📘 **3. Facebook Ads Integration** (Prioridade: 🟡 Média)

### **Status Atual**
- ✅ Model Ad existe
- ✅ Estrutura de dados pronta
- ❌ Sync não implementado
- ❌ API não conectada

### **Implementação**

#### **3.1 Criar Serviço Facebook**
Criar `src/services/FacebookAdsService.ts`:

```typescript
export class FacebookAdsService {
  private accessToken: string
  private adAccountId: string

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken
    this.adAccountId = adAccountId
  }

  async getCampaigns() {
    // Buscar campanhas do Facebook
  }

  async syncAdsData(userId: string) {
    // Sincronizar dados de anúncios
    const campaigns = await this.getCampaigns()

    for (const campaign of campaigns) {
      await prisma.ad.upsert({
        where: {
          user_id_external_id_date: {
            user_id: userId,
            external_id: campaign.id,
            date: new Date(campaign.date_start),
          },
        },
        update: {
          campaign_name: campaign.name,
          spend: parseFloat(campaign.spend),
          impressions: campaign.impressions,
          clicks: campaign.clicks,
        },
        create: {
          user_id: userId,
          external_id: campaign.id,
          campaign_name: campaign.name,
          spend: parseFloat(campaign.spend),
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          date: new Date(campaign.date_start),
        },
      })
    }
  }
}
```

#### **3.2 Job de Sync**
Criar `src/jobs/syncFacebookAds.ts`:

```typescript
import { FacebookAdsService } from '../services/FacebookAdsService'

export const syncFacebookAds = async (userId: string) => {
  const integrations = await prisma.integration.findMany({
    where: {
      user_id: userId,
      provider: 'FACEBOOK_ADS',
      status: 'CONNECTED',
    },
  })

  for (const integration of integrations) {
    const service = new FacebookAdsService(
      integration.config.accessToken,
      integration.config.adAccountId
    )

    await service.syncAdsData(userId)
  }
}
```

---

## 💳 **4. PagBank Integration** (Prioridade: 🔴 Alta)

### **Status Atual**
- ❌ Não implementado
- ❌ Modelos existem mas não usados
- ❌ Webhooks não configurados

### **Implementação**

#### **4.1 Criar Serviço PagBank**
Criar `src/services/PagBankService.ts`:

```typescript
export class PagBankService {
  private apiUrl: string
  private token: string

  constructor() {
    this.apiUrl = 'https://api.pagseguro.com'
    this.token = process.env.PAGBANK_TOKEN!
  }

  async createSubscription(planData: any, customerData: any) {
    // Criar assinatura recorrente
  }

  async processPayment(paymentData: any) {
    // Processar pagamento único
  }

  async cancelSubscription(subscriptionId: string) {
    // Cancelar assinatura
  }
}
```

#### **4.2 Webhook PagBank**
Criar `src/webhooks/pagbankWebhook.ts`:

```typescript
export const pagbankWebhook = async (req: Request, res: Response) => {
  const { event, data } = req.body

  switch (event) {
    case 'subscription.created':
      await handleSubscriptionCreated(data)
      break
    case 'payment.received':
      await handlePaymentReceived(data)
      break
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(data)
      break
  }

  res.status(200).json({ success: true })
}
```

---

## 🧪 **Testes e Monitoramento**

### **Testes Unitários**
```typescript
// src/__tests__/services/WhatsAppService.test.ts
describe('WhatsAppService', () => {
  it('should send message successfully', async () => {
    // Mock axios
    // Test service
  })
})
```

### **Testes de Integração**
```typescript
// src/__tests__/integrations/coinzz.integration.test.ts
describe('Coinzz Integration', () => {
  it('should process webhook and create sale', async () => {
    // Send webhook
    // Verify database
  })
})
```

### **Monitoramento**
- Logs estruturados para cada integração
- Métricas de sucesso/falha
- Alertas para falhas consecutivas
- Dashboard de status das integrações

---

## 📋 **Checklist de Rollout**

### **Fase 1: Coinzz (1 semana)**
- [ ] Webhook handler implementado
- [ ] Validação de dados
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Monitoramento ativo

### **Fase 2: WhatsApp (1 semana)**
- [ ] Serviço WhatsApp criado
- [ ] Envio de mensagens
- [ ] Webhook de resposta
- [ ] Testes funcionais

### **Fase 3: Facebook Ads (1 semana)**
- [ ] Sync de dados implementado
- [ ] Job agendado
- [ ] Dashboard atualizado

### **Fase 4: PagBank (2 semanas)**
- [ ] Assinaturas recorrentes
- [ ] Webhooks de pagamento
- [ ] Gestão de planos
- [ ] Testes end-to-end

---

## 🎯 **Métricas de Sucesso**

- **Coinzz**: 99% de webhooks processados com sucesso
- **WhatsApp**: 95% de mensagens entregues
- **Facebook**: Dados sincronizados em < 5 minutos
- **PagBank**: 100% de pagamentos processados

## 🔄 **Próximos Passos**

Após integrações básicas:
1. **Automação**: Workflows baseados em eventos
2. **Analytics**: Relatórios avançados
3. **Multi-tenant**: Suporte a múltiplos usuários
4. **API**: Endpoints para integrações customizadas

---

**Data:** 31 de outubro de 2025
**Prioridade:** 🔴 Crítica para MVP
**Tempo Estimado:** 4-6 semanas