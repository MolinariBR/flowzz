/**
 * Coinzz Validators - Zod Schemas
 *
 * Referências:
 * - webhookcoinzz.md: Estrutura dos webhooks
 * - tasks.md: Task 5.2 - Implementar CoinzzService
 * - design.md: Validation Strategy
 *
 * Schemas de validação para integração Coinzz usando Zod
 */

import { z } from 'zod'

/**
 * Schema para dados do cliente no webhook
 * Referência: webhookcoinzz.md - Cliente
 */
export const coinzzClientSchema = z.object({
  client_name: z.string().min(1).max(255),
  client_phone: z.string().min(10).max(20),
  client_documment: z.string().min(11).max(18), // CPF: 11, CNPJ: 14
  client_email: z.string().email().nullable(),
  client_address: z.string().min(1).max(255),
  client_zip_code: z.string().length(8), // CEP sem hífen
  client_address_number: z.string().max(20),
  client_address_district: z.string().max(100),
  client_address_comp: z.string().max(100),
  client_address_city: z.string().max(100),
  client_address_state: z.string().length(2), // UF: SP, RJ, etc
  client_address_country: z.string().length(2).default('BR'),
})

/**
 * Schema para dados do pedido no webhook
 * Referência: webhookcoinzz.md - Pedido
 */
export const coinzzOrderSchema = z.object({
  first_order: z.boolean(),
  second_order: z.boolean(),
  date_order: z.string(), // yyyy-mm-dd H:i:s
  deadline_delivery: z.number().int().positive(),
  order_number: z.string().min(1).max(100),
  order_status: z.string().min(1).max(50),
  shipping_status: z.string().max(50),
  tracking_code: z.string().nullable(),
  order_quantity: z.number().int().positive(),
  product_name: z.string().min(1).max(255),
  order_final_price: z.number().positive(),
  method_payment: z.string().min(1).max(50),
  total_installments: z.number().int().min(1),
  qrcode_pix: z.string().nullable(),
  url_pix: z.string().url().nullable(),
  url_bank_slip: z.string().url().nullable(),
  terms_and_conditions_file_path: z.string().url().nullable(),
  courier_name: z.string().nullable(),
  delivery_time: z.string().nullable(),
  producer_name: z.string().min(1).max(255),
  producer_email: z.string().email(),
  affiliate_name: z.string().nullable(),
  affiliate_email: z.string().email().nullable(),
  affiliate_phone: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

/**
 * Schema para UTMs no webhook
 * Referência: webhookcoinzz.md - UTMs
 */
export const coinzzUtmsSchema = z.object({
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  utm_content: z.string().nullable(),
  utm_term: z.string().nullable(),
})

/**
 * Schema completo do payload do webhook de Pedidos
 * Referência: webhookcoinzz.md - Webhook de Pedidos
 */
export const coinzzWebhookPayloadSchema = z.object({
  client: coinzzClientSchema,
  order: coinzzOrderSchema,
  utms: coinzzUtmsSchema,
})

/**
 * Schema para dados de assinatura no webhook
 * Referência: webhookcoinzz.md - Assinatura
 */
export const coinzzSubscriptionSchema = z.object({
  subscription_hash: z.string().min(1),
  status: z.enum(['ativa', 'cancelada', 'suspensa', 'pendente']),
  frequency: z.string().min(1),
  cycle: z.string(),
  next_charge_date: z.string(),
})

/**
 * Schema completo do payload do webhook de Assinaturas
 * Referência: webhookcoinzz.md - Webhook de Assinaturas
 */
export const coinzzSubscriptionWebhookPayloadSchema = z.object({
  subscription: coinzzSubscriptionSchema,
  client: coinzzClientSchema,
  order: coinzzOrderSchema,
  utms: coinzzUtmsSchema,
  general_info: z.object({
    date_sent: z.string(),
    name_sent: z.string(),
  }),
})

/**
 * Schema para conectar integração Coinzz
 * Referência: tasks.md Task 5.2.5 - POST /integrations/coinzz/connect
 */
export const connectCoinzzSchema = z.object({
  apiKey: z
    .string()
    .min(20, 'API Key deve ter no mínimo 20 caracteres')
    .max(500, 'API Key inválida'),
  webhookUrl: z.string().url().optional(),
})

/**
 * Schema para forçar sincronização manual
 * Referência: tasks.md Task 5.2.5 - POST /integrations/coinzz/sync
 */
export const syncCoinzzSchema = z.object({
  forceFullSync: z.boolean().optional().default(false),
})

/**
 * Schema para validação de UUID (usado em params de rotas)
 */
export const uuidSchema = z.object({
  id: z.string().uuid('ID inválido'),
})

/**
 * Mapeamento de status Coinzz para SaleStatus do Prisma
 * Referência: tasks.md Task 5.2.2
 */
export const COINZZ_STATUS_MAP: Record<string, string> = {
  Aprovada: 'PAID',
  Pendente: 'PENDING',
  Cancelada: 'CANCELLED',
  Entregue: 'DELIVERED',
  'Em Processamento': 'PENDING',
  'Aguardando Pagamento': 'PENDING',
  Reembolsada: 'REFUNDED',
  Chargeback: 'REFUNDED',
}

/**
 * Função helper para mapear status Coinzz → SaleStatus
 */
export function mapCoinzzStatus(coinzzStatus: string): string {
  return COINZZ_STATUS_MAP[coinzzStatus] || 'PENDING'
}

/**
 * Função helper para validar e formatar CPF/CNPJ
 */
export function formatDocument(document: string): string {
  // Remove caracteres não numéricos
  const cleaned = document.replace(/\D/g, '')

  // Retorna formatado com zeros à esquerda se necessário
  return cleaned.padStart(11, '0') // Mínimo CPF
}

/**
 * Função helper para validar CEP
 */
export function formatCep(cep: string): string {
  // Remove caracteres não numéricos
  const cleaned = cep.replace(/\D/g, '')

  // Retorna com 8 dígitos
  return cleaned.padStart(8, '0')
}

/**
 * Função helper para parsear data no formato Coinzz
 * Formato esperado: yyyy-mm-dd H:i:s
 */
export function parseCoinzzDate(dateString: string): Date {
  // Coinzz usa formato: '2023-12-06 14:30:00'
  // JavaScript Date pode parsear isso diretamente se substituir espaço por T
  const isoString = dateString.replace(' ', 'T')
  return new Date(isoString)
}

/**
 * Função helper para validar telefone brasileiro
 */
export function formatPhone(phone: string): string {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')

  // Se não começa com código do país, adiciona +55
  if (!cleaned.startsWith('55')) {
    return `+55${cleaned}`
  }

  return `+${cleaned}`
}
