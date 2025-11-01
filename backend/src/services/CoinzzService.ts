/**
 * Coinzz Service - Business Logic
 *
 * Referências:
 * - tasks.md: Task 5.2 - Implementar CoinzzService
 * - user-stories.md: Story 1.3 - Sincronizar vendas automaticamente
 * - design.md: External Integrations - Coinzz, Security
 * - webhookcoinzz.md: Estrutura completa dos webhooks
 *
 * Service responsável por toda a lógica de integração    const existingClient = await this.prisma.client.findFirst({
      where: {
        user_id: userId,
        OR: [
          { cpf: clientData.cpf_cnpj },
          { phone: clientData.telefone },
        ],
      },
    });zz:
 * - Autenticação e criptografia de API Keys
 * - Sincronização de vendas (manual e automática)
 * - Processamento de webhooks
 * - Mapeamento de dados Coinzz → Sale model
 */

import crypto from 'node:crypto'
import type { PrismaClient, SaleStatus } from '@prisma/client'
import type {
  CoinzzStatusDTO,
  ConnectCoinzzDTO,
  ICoinzzIntegrationConfig,
  ICoinzzService,
  ICoinzzSubscriptionWebhookPayload,
  ICoinzzWebhookPayload,
  SyncResultDTO,
  TestConnectionResponseDTO,
} from '../interfaces/CoinzzService.interface'
import { logger } from '../shared/utils/logger'
import {
  formatCep,
  formatDocument,
  formatPhone,
  mapCoinzzStatus,
  parseCoinzzDate,
} from '../validators/coinzz.validator'

/**
 * CoinzzService Implementation
 *
 * Padrão: Service Layer (Clean Architecture)
 * Dependências: PrismaClient injetado via constructor
 */
export class CoinzzService implements ICoinzzService {
  private readonly prisma: PrismaClient
  private readonly encryptionKey: string
  private readonly encryptionAlgorithm = 'aes-256-cbc'

  constructor(prisma: PrismaClient) {
    this.prisma = prisma

    // Encryption key deve estar em .env
    // Referência: design.md §Security - AES-256 encryption
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

    if (this.encryptionKey === 'default-key-change-in-production') {
      logger.warn('⚠️ ENCRYPTION_KEY não configurada, usando chave padrão (INSEGURO)')
    }
  }

  /**
   * Conecta integração Coinzz
   *
   * Referências:
   * - tasks.md: Task 5.2.1, 5.2.5
   * - user-stories.md: Story 1.3 Cenário 1
   */
  async connect(userId: string, dto: ConnectCoinzzDTO): Promise<CoinzzStatusDTO> {
    logger.info('Connecting Coinzz integration', { userId })

    // 1. Testar conexão com API Key fornecida e obter dados da conta
    const testResult = await this.testConnection(dto.apiKey)

    if (!testResult.connected) {
      logger.error('Coinzz connection test failed', {
        userId,
        error: testResult.message,
      })
      throw new Error(`Falha ao conectar com Coinzz: ${testResult.message}`)
    }

    // 2. Criptografar API Key
    const encryptedApiKey = this.encryptApiKey(dto.apiKey)

    // 3. Gerar URL do webhook
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000'
    const webhookUrl = dto.webhookUrl || `${baseUrl}/webhooks/coinzz`

    // 4. Criar configuração da integração
    const config: ICoinzzIntegrationConfig = {
      apiKey: encryptedApiKey,
      webhookUrl,
      lastSyncAt: null,
      syncEnabled: true,
      syncFrequency: '0 * * * *', // Cron: a cada hora
      // 🔧 CORREÇÃO SAAS: Armazenar producer_email para identificar webhooks
      producerEmail: testResult.producerEmail,
    }

    // 5. Verificar se já existe integração
    const existingIntegration = await this.prisma.integration.findFirst({
      where: {
        user_id: userId,
        provider: 'COINZZ',
      },
    })

    type IntegrationRecord = {
      id: string
      user_id: string
      status: string
      config: unknown
      last_sync: Date | null
      created_at: Date
      updated_at: Date
    }

    let integration: IntegrationRecord

    if (existingIntegration) {
      // Atualizar integração existente
      integration = (await this.prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          status: 'CONNECTED',
          config: JSON.parse(JSON.stringify(config)),
          last_sync: null,
          updated_at: new Date(),
        },
      })) as IntegrationRecord

      logger.info('Coinzz integration updated', {
        userId,
        integrationId: integration.id,
      })
    } else {
      // Criar nova integração
      integration = (await this.prisma.integration.create({
        data: {
          user_id: userId,
          provider: 'COINZZ',
          status: 'CONNECTED',
          config: JSON.parse(JSON.stringify(config)),
        },
      })) as IntegrationRecord

      logger.info('Coinzz integration created', {
        userId,
        integrationId: integration.id,
      })
    }

    // 6. Realizar sincronização inicial (últimas 1000 vendas ou 90 dias)
    // Referência: user-stories.md Story 1.3 - Critérios de Aceitação
    try {
      await this.syncSales(userId, false)
      logger.info('Initial Coinzz sync completed', { userId })
    } catch (error) {
      logger.error('Initial Coinzz sync failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // Não falha a conexão se sync inicial falhar
    }

    return {
      id: integration.id,
      connected: true,
      status: 'conectado',
      lastSyncAt: integration.last_sync,
      lastSyncStatus: null,
      lastSyncError: null,
      totalSalesSynced: 0, // TODO: calcular real
      webhookUrl: '', // TODO: armazenar webhook_url em config
      createdAt: integration.created_at,
      updatedAt: integration.updated_at,
    }
  }

  /**
   * Testa conexão com Coinzz usando API Key
   *
   * Referências:
   * - tasks.md: Task 5.2.1
   * - design.md: External Integrations - Coinzz
   *
   * NOTA: A API real do Coinzz será implementada quando documentação estiver disponível
   * Por ora, retorna mock de sucesso se API Key tem formato válido
   */
  async testConnection(apiKey: string): Promise<TestConnectionResponseDTO> {
    logger.info('Testing Coinzz connection')

    // Validação básica de formato
    if (!apiKey || apiKey.length < 20) {
      return {
        connected: false,
        message: 'API Key inválida: deve ter no mínimo 20 caracteres',
      }
    }

    // TODO: Quando API Coinzz estiver documentada, implementar chamada real
    // Exemplo:
    // const response = await fetch('https://api.coinzz.com/v1/account', {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // })
    // const accountData = await response.json()
    // return { connected: true, producerEmail: accountData.email, ... }

    // 🔧 SAAS: Por ora, simular producer_email baseado na API key
    // Em produção, isso virá da API real do Coinzz
    const mockProducerEmail = `producer${apiKey.slice(-8)}@coinzz.com`

    logger.info('Coinzz connection test successful (mock)', { mockProducerEmail })

    return {
      connected: true,
      message: 'Conexão bem-sucedida com Coinzz',
      lastSyncAt: new Date(),
      totalSales: 0,
      producerEmail: mockProducerEmail, // 🔧 SAAS: Retornar email simulado
    }
  }

  /**
   * Desconecta integração Coinzz
   *
   * Referências:
   * - tasks.md: Task 5.2.5 - POST /integrations/coinzz/disconnect
   */
  async disconnect(userId: string): Promise<void> {
    logger.info('Disconnecting Coinzz integration', { userId })

    const integration = await this.prisma.integration.findFirst({
      where: {
        user_id: userId,
        provider: 'COINZZ',
      },
    })

    if (!integration) {
      throw new Error('Integração Coinzz não encontrada')
    }

    await this.prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: 'DISCONNECTED',
        updated_at: new Date(),
      },
    })

    logger.info('Coinzz integration disconnected', {
      userId,
      integrationId: integration.id,
    })
  }

  /**
   * Obtém status atual da integração
   *
   * Referências:
   * - tasks.md: Task 5.2.5 - GET /integrations/coinzz/status
   */
  async getStatus(userId: string): Promise<CoinzzStatusDTO> {
    const integration = await this.prisma.integration.findFirst({
      where: {
        user_id: userId,
        provider: 'COINZZ',
      },
    })

    if (!integration) {
      throw new Error('Integração Coinzz não encontrada')
    }

    // Contar vendas sincronizadas
    const totalSales = await this.prisma.sale.count({
      where: {
        user_id: userId,
        external_id: { not: null }, // Vendas vindas do Coinzz têm external_id
      },
    })

    return {
      id: integration.id,
      connected: integration.status === 'CONNECTED',
      status:
        integration.status === 'CONNECTED'
          ? 'conectado'
          : integration.status === 'DISCONNECTED'
            ? 'desconectado'
            : 'erro',
      lastSyncAt: integration.last_sync,
      lastSyncStatus: null, // TODO: armazenar em metadados
      lastSyncError: null,
      totalSalesSynced: totalSales,
      webhookUrl: '', // TODO: extrair de config
      createdAt: integration.created_at,
      updatedAt: integration.updated_at,
    }
  }

  /**
   * Sincroniza vendas do Coinzz
   *
   * Referências:
   * - tasks.md: Task 5.2.2, 5.2.4
   * - user-stories.md: Story 1.3 - Sincronizar vendas automaticamente
   * - design.md: Cache Layer - Redis 1h TTL
   *
   * NOTA: Implementação mock até API real estar disponível
   */
  async syncSales(userId: string, forceFullSync = false): Promise<SyncResultDTO> {
    logger.info('Starting Coinzz sync', { userId, forceFullSync })

    const integration = await this.prisma.integration.findFirst({
      where: {
        user_id: userId,
        provider: 'COINZZ',
        status: 'CONNECTED',
      },
    })

    if (!integration) {
      throw new Error('Integração Coinzz não está conectada')
    }

    const config = integration.config as unknown as ICoinzzIntegrationConfig

    // Decriptar API key para usar na sincronização
    const _apiKey = this.decryptApiKey(config.apiKey)

    // TODO: Implementar chamada real à API Coinzz quando documentação estiver disponível
    // Por ora, retorna mock de sucesso
    // Exemplo: const sales = await coinzzAPI.getSales(_apiKey, { since: lastSync })

    logger.info('Coinzz sync completed (mock)', { userId })

    // Atualizar última sincronização
    await this.prisma.integration.update({
      where: { id: integration.id },
      data: {
        last_sync: new Date(),
      },
    })

    return {
      success: true,
      salesProcessed: 0,
      salesCreated: 0,
      salesUpdated: 0,
      errors: 0,
      syncedAt: new Date(),
    }
  }

  /**
   * Processa webhook de pedido do Coinzz
   *
   * Referências:
   * - tasks.md: Task 5.2.3
   * - webhookcoinzz.md: Webhook de Pedidos
   * - user-stories.md: Story 1.3 Cenário 1
   */
  async processWebhook(payload: ICoinzzWebhookPayload): Promise<void> {
    logger.info('Processing Coinzz webhook', {
      orderNumber: payload.order.order_number,
      clientName: payload.client.client_name,
    })

    // 🔧 CORREÇÃO SAAS: Buscar integração específica pelo producer_email
    // Em vez de pegar QUALQUER integração COINZZ, pegar a específica do usuário
    const producerEmail = payload.order.producer_email

    if (!producerEmail) {
      logger.warn('No producer_email in webhook payload', {
        orderNumber: payload.order.order_number,
      })
      return
    }

    // Buscar integração onde config.producerEmail === producerEmail
    const integrations = await this.prisma.integration.findMany({
      where: {
        provider: 'COINZZ',
        status: 'CONNECTED',
      },
    })

    const integration = integrations.find((integration) => {
      const config = integration.config as unknown as ICoinzzIntegrationConfig
      return config.producerEmail === producerEmail
    })

    if (!integration) {
      logger.warn('No active Coinzz integration found for producer_email', {
        producerEmail,
        orderNumber: payload.order.order_number,
      })
      return
    }

    const userId = integration.user_id

    // 2. Mapear dados do webhook para Sale e Client
    const { saleData, clientData } = await this.mapWebhookToSale(userId, payload)

    // 3. Buscar ou criar cliente
    let client = await this.prisma.client.findFirst({
      where: {
        user_id: userId,
        OR: [{ cpf: clientData.cpf }, { phone: clientData.phone }],
      },
    })

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          user_id: userId,
          ...clientData,
          status: 'ACTIVE',
        },
      })

      logger.info('Client created from webhook', {
        clientId: client.id,
        userId,
      })
    }

    // 4. Buscar venda existente por external_id
    const existingSale = await this.prisma.sale.findFirst({
      where: {
        user_id: userId,
        external_id: saleData.external_id,
      },
    })

    if (existingSale) {
      // Atualizar venda existente
      await this.prisma.sale.update({
        where: { id: existingSale.id },
        data: {
          ...saleData,
          status: saleData.status as SaleStatus, // Status already mapped by mapCoinzzStatus helper
          client_id: client.id,
        },
      })

      logger.info('Sale updated from webhook', {
        saleId: existingSale.id,
        userId,
      })
    } else {
      // Criar nova venda
      await this.prisma.sale.create({
        data: {
          user_id: userId,
          client_id: client.id,
          ...saleData,
          status: saleData.status as SaleStatus, // Status already mapped by mapCoinzzStatus helper
        },
      })

      logger.info('Sale created from webhook', {
        external_id: saleData.external_id,
        userId,
      })
    }

    // 5. Invalidar cache do dashboard
    // Referência: tasks.md Task 5.2.3 - Invalidar cache
    // TODO: Implementar invalidação de cache Redis quando disponível

    logger.info('Coinzz webhook processed successfully', {
      orderNumber: payload.order.order_number,
      userId,
    })
  }

  /**
   * Processa webhook de assinatura do Coinzz
   *
   * Referências:
   * - webhookcoinzz.md: Webhook de Assinaturas
   */
  async processSubscriptionWebhook(payload: ICoinzzSubscriptionWebhookPayload): Promise<void> {
    logger.info('Processing Coinzz subscription webhook', {
      subscriptionHash: payload.subscription.subscription_hash,
      status: payload.subscription.status,
    })

    // Processar como pedido normal, mas adicionar dados de assinatura aos metadados
    await this.processWebhook({
      client: payload.client,
      order: {
        ...payload.order,
        // Adicionar informações de assinatura aos metadados
      },
      utms: payload.utms,
    })
  }

  /**
   * Mapeia dados do webhook Coinzz para modelo Sale
   *
   * Referências:
   * - tasks.md: Task 5.2.2
   * - webhookcoinzz.md: Estrutura completa
   */
  async mapWebhookToSale(
    _userId: string,
    payload: ICoinzzWebhookPayload
  ): Promise<{
    saleData: {
      product_name: string
      quantity: number
      unit_price: number
      total_price: number
      status: string
      payment_method: string
      external_id: string
      sale_date: Date
      metadata: Record<string, unknown>
    }
    clientData: {
      name: string
      email: string | null
      phone: string
      cpf: string
      address: string
      city: string
      state: string
      cep: string
    }
  }> {
    const { client, order, utms } = payload

    // Mapear status Coinzz → SaleStatus
    const status = mapCoinzzStatus(order.order_status)

    // Parsear data do pedido
    const sale_date = parseCoinzzDate(order.date_order)

    // Calcular pre\u00e7o unit\u00e1rio
    const quantity = order.order_quantity
    const total_price = order.order_final_price
    const unit_price = quantity > 0 ? total_price / quantity : total_price

    // Montar metadados com informações extras
    const metadata = {
      tracking_code: order.tracking_code,
      shipping_status: order.shipping_status,
      affiliate_name: order.affiliate_name,
      affiliate_email: order.affiliate_email,
      producer_name: order.producer_name,
      producer_email: order.producer_email,
      first_order: order.first_order,
      second_order: order.second_order,
      total_installments: order.total_installments,
      deadline_delivery: order.deadline_delivery,
      utms: {
        source: utms.utm_source,
        medium: utms.utm_medium,
        campaign: utms.utm_campaign,
        content: utms.utm_content,
        term: utms.utm_term,
      },
    }

    const saleData = {
      product_name: order.product_name,
      quantity,
      unit_price,
      total_price,
      status,
      payment_method: order.method_payment,
      external_id: order.order_number,
      sale_date,
      metadata,
    }

    const clientData = {
      name: client.client_name,
      email: client.client_email,
      phone: formatPhone(client.client_phone),
      cpf: formatDocument(client.client_documment),
      address: client.client_address,
      city: client.client_address_city,
      state: client.client_address_state,
      cep: formatCep(client.client_zip_code),
    }

    return { saleData, clientData }
  }

  /**
   * Criptografa API Key com AES-256
   *
   * Referências:
   * - tasks.md: Task 5.2.1
   * - design.md: Security - AES-256 encryption
   */
  encryptApiKey(apiKey: string): string {
    const iv = crypto.randomBytes(16)
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32)
    const cipher = crypto.createCipheriv(this.encryptionAlgorithm, key, iv)

    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Retorna IV + encrypted (separados por :)
    return `${iv.toString('hex')}:${encrypted}`
  }

  /**
   * Descriptografa API Key
   */
  decryptApiKey(encryptedApiKey: string): string {
    const parts = encryptedApiKey.split(':')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Formato inválido de API key criptografada')
    }

    const ivHex = parts[0]
    const encrypted = parts[1]

    const iv = Buffer.from(ivHex, 'hex')
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32)
    const decipher = crypto.createDecipheriv(this.encryptionAlgorithm, key, iv)

    const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')

    return decrypted
  }
}
