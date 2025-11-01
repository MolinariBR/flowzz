// Integrations API - Listar integrações do usuário
// Integração com backend /api/v1/integrations

import { apiClient } from './client'

// ============================================
// TYPES
// ============================================

interface Integration {
  id: string
  provider: string
  status: string
  lastSync: string | null
  createdAt: string
  config: {
    webhookUrl?: string
    syncEnabled?: boolean
  }
}

interface IntegrationsResponse {
  success: boolean
  data: Integration[]
  message: string
}

// ============================================
// INTEGRATION FUNCTIONS
// ============================================

/**
 * Buscar todas as integrações do usuário
 * Endpoint: GET /integrations
 */
export async function getUserIntegrations(): Promise<Integration[]> {
  try {
    const response = await apiClient.get<IntegrationsResponse>('/integrations')

    if (response.success) {
      return response.data
    } else {
      throw new Error(response.message || 'Erro ao buscar integrações')
    }
  } catch (error) {
    console.error('Erro ao buscar integrações:', error)
    throw error
  }
}

/**
 * Mapear provider para nome amigável
 */
export function getIntegrationDisplayName(provider: string): string {
  const names: Record<string, string> = {
    COINZZ: 'Coinzz',
    FACEBOOK_ADS: 'Facebook Ads',
    WHATSAPP: 'WhatsApp Business',
    PAGBANK: 'PagBank',
  }

  return names[provider] || provider
}

/**
 * Mapear provider para emoji
 */
export function getIntegrationEmoji(provider: string): string {
  const emojis: Record<string, string> = {
    COINZZ: '🪙',
    FACEBOOK_ADS: '📘',
    WHATSAPP: '💬',
    PAGBANK: '💳',
  }

  return emojis[provider] || '🔗'
}

/**
 * Mapear status para status amigável
 */
export function getIntegrationStatusText(status: string): string {
  const statuses: Record<string, string> = {
    PENDING: 'Pendente',
    CONNECTED: 'Conectado',
    ERROR: 'Erro',
    DISCONNECTED: 'Desconectado',
  }

  return statuses[status] || status
}

/**
 * Calcular saúde da integração baseada no status
 */
export function getIntegrationHealth(status: string): number {
  const health: Record<string, number> = {
    CONNECTED: 100,
    PENDING: 50,
    ERROR: 25,
    DISCONNECTED: 0,
  }

  return health[status] || 0
}