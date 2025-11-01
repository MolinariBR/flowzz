/**
 * Coinzz Service Interfaces and DTOs
 *
 * Referências:
 * - webhookcoinzz.md: Estrutura completa dos webhooks
 * - tasks.md: Task 5.2 - Implementar CoinzzService
 * - user-stories.md: Story 1.3 - Sincronizar vendas automaticamente
 * - design.md: External Integrations - Coinzz
 *
 * Este arquivo define as interfaces para integração com a plataforma Coinzz,
 * incluindo estruturas de webhooks, configuração e métodos do service.
 */

/**
 * Interface para dados do cliente no webhook Coinzz
 * Referência: webhookcoinzz.md - Webhook de Pedidos - Cliente
 */
export interface ICoinzzClient {
  client_name: string
  client_phone: string
  client_documment: string // CPF ou CNPJ
  client_email: string | null
  client_address: string
  client_zip_code: string
  client_address_number: string
  client_address_district: string
  client_address_comp: string
  client_address_city: string
  client_address_state: string
  client_address_country: string
}

/**
 * Interface para dados do pedido no webhook Coinzz
 * Referência: webhookcoinzz.md - Webhook de Pedidos - Pedido
 */
export interface ICoinzzOrder {
  first_order: boolean
  second_order: boolean
  date_order: string // yyyy-mm-dd H:i:s
  deadline_delivery: number
  order_number: string
  order_status: string // Aprovada, Pendente, Cancelada, etc
  shipping_status: string
  tracking_code: string | null
  order_quantity: number
  product_name: string
  order_final_price: number
  method_payment: string // Pix, Boleto, Cartão
  total_installments: number
  qrcode_pix: string | null
  url_pix: string | null
  url_bank_slip: string | null
  terms_and_conditions_file_path: string | null
  courier_name: string | null
  delivery_time: string | null
  producer_name: string
  producer_email: string
  affiliate_name: string | null
  affiliate_email: string | null
  affiliate_phone: string | null
  deleted_at: string | null
}

/**
 * Interface para UTMs no webhook Coinzz
 * Referência: webhookcoinzz.md - Webhook de Pedidos - UTMs
 */
export interface ICoinzzUtms {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
}

/**
 * Interface completa do payload do webhook Coinzz (Pedidos)
 * Referência: webhookcoinzz.md - Webhook de Pedidos
 */
export interface ICoinzzWebhookPayload {
  client: ICoinzzClient
  order: ICoinzzOrder
  utms: ICoinzzUtms
}

/**
 * Interface para dados de assinatura no webhook Coinzz
 * Referência: webhookcoinzz.md - Webhook de Assinaturas
 */
export interface ICoinzzSubscription {
  subscription_hash: string
  status: string // ativa, cancelada, suspensa
  frequency: string // Mensal, Trimestral, Anual
  cycle: string
  next_charge_date: string
}

/**
 * Interface completa do payload do webhook de Assinaturas
 * Referência: webhookcoinzz.md - Webhook de Assinaturas
 */
export interface ICoinzzSubscriptionWebhookPayload {
  subscription: ICoinzzSubscription
  client: ICoinzzClient
  order: ICoinzzOrder
  utms: ICoinzzUtms
  general_info: {
    date_sent: string
    name_sent: string
  }
}

/**
 * DTO para conectar integração Coinzz
 * Referência: tasks.md Task 5.2.5 - POST /integrations/coinzz/connect
 */
export interface ConnectCoinzzDTO {
  apiKey: string
  webhookUrl?: string // URL para receber webhooks (opcional, gerado automaticamente)
}

/**
 * DTO para resposta de teste de conexão
 */
export interface TestConnectionResponseDTO {
  connected: boolean
  message: string
  lastSyncAt?: Date
  totalSales?: number
  producerEmail?: string // 🔧 SAAS: Email do produtor para identificar webhooks
}

/**
 * DTO para resposta de status da integração
 * Referência: tasks.md Task 5.2.5 - GET /integrations/coinzz/status
 */
export interface CoinzzStatusDTO {
  id: string
  connected: boolean
  status: 'conectado' | 'desconectado' | 'erro'
  lastSyncAt: Date | null
  lastSyncStatus: 'success' | 'error' | null
  lastSyncError: string | null
  totalSalesSynced: number
  webhookUrl: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * DTO para resultado de sincronização
 */
export interface SyncResultDTO {
  success: boolean
  salesProcessed: number
  salesCreated: number
  salesUpdated: number
  errors: number
  errorDetails?: string[]
  syncedAt: Date
}

/**
 * Interface para configuração da integração Coinzz
 * Armazenada em Integration.configuracao (JSONB)
 */
export interface ICoinzzIntegrationConfig {
  apiKey: string // Criptografado com AES-256
  webhookUrl: string
  lastSyncAt: Date | null
  syncEnabled: boolean
  syncFrequency: string // Cron expression: '0 * * * *'
  producerEmail?: string // 🔧 SAAS: Email do produtor para identificar webhooks
}

/**
 * Interface do serviço Coinzz
 * Define todos os métodos disponíveis para integração
 *
 * Referências:
 * - tasks.md: Task 5.2 - Implementar CoinzzService
 * - design.md: External Integrations - Coinzz
 */
export interface ICoinzzService {
  /**
   * Conecta integração Coinzz e testa API Key
   * Referência: tasks.md Task 5.2.1, 5.2.5
   */
  connect(userId: string, dto: ConnectCoinzzDTO): Promise<CoinzzStatusDTO>

  /**
   * Testa conexão com Coinzz usando API Key
   * Referência: tasks.md Task 5.2.1
   */
  testConnection(apiKey: string): Promise<TestConnectionResponseDTO>

  /**
   * Desconecta integração Coinzz
   * Referência: tasks.md Task 5.2.5
   */
  disconnect(userId: string): Promise<void>

  /**
   * Obtém status atual da integração
   * Referência: tasks.md Task 5.2.5
   */
  getStatus(userId: string): Promise<CoinzzStatusDTO>

  /**
   * Sincroniza vendas do Coinzz (manual ou automática)
   * Referência: tasks.md Task 5.2.2, 5.2.4
   */
  syncSales(userId: string, forceFullSync?: boolean): Promise<SyncResultDTO>

  /**
   * Processa webhook de pedido recebido do Coinzz
   * Referência: tasks.md Task 5.2.3, webhookcoinzz.md
   */
  processWebhook(payload: ICoinzzWebhookPayload): Promise<void>

  /**
   * Processa webhook de assinatura recebido do Coinzz
   * Referência: webhookcoinzz.md - Webhook de Assinaturas
   */
  processSubscriptionWebhook(payload: ICoinzzSubscriptionWebhookPayload): Promise<void>

  /**
   * Mapeia dados do webhook Coinzz para modelo Sale
   * Referência: tasks.md Task 5.2.2
   */
  mapWebhookToSale(
    userId: string,
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
  }>

  /**
   * Criptografa API Key com AES-256
   * Referência: tasks.md Task 5.2.1, design.md Security
   */
  encryptApiKey(apiKey: string): string

  /**
   * Descriptografa API Key
   */
  decryptApiKey(encryptedApiKey: string): string
}
