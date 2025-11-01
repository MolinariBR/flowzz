// Dashboard API - Métricas, gráficos, atividades
// Integração com backend /api/v1/dashboard

import { apiClient } from './client'

// ============================================
// TYPES
// ============================================

export interface DashboardMetrics {
  vendas_hoje: number
  gasto_anuncios: number
  lucro_liquido: number
  pagamentos_agendados: number
}

export interface MetricComparison {
  vendas_hoje: number
  gasto_anuncios: number
  lucro_liquido: number
  pagamentos_agendados: number
}

export interface DashboardMetricsWithComparisons extends DashboardMetrics {
  comparisons: MetricComparison
  ultima_atualizacao: string
}

export interface DashboardActivity {
  id: string
  type: 'sale' | 'payment'
  title: string
  description: string
  amount: number
  timestamp: string
  metadata: {
    saleId: string
    clientName: string
    status?: string
    productName?: string
  }
}

export interface ChartDataPoint {
  date: string
  vendas: number
  gastos: number
  lucro: number
}

export interface DashboardMetricsResponse {
  success: boolean
  data: DashboardMetricsWithComparisons
}

export interface DashboardActivitiesResponse {
  success: boolean
  data: DashboardActivity[]
  meta: {
    total: number
    limit: number
  }
}

export interface DashboardChartResponse {
  success: boolean
  data: ChartDataPoint[]
  meta: {
    period: {
      start: string
      end: string
      days: number
    }
  }
}

export interface DashboardTopClientsResponse {
  success: boolean
  data: Array<{
    id: string
    name: string
    email: string
    total_spent: number
    total_orders: number
    last_order_at: string | null
  }>
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

/**
 * Obtém métricas do dashboard
 * Endpoint: GET /dashboard/metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetricsWithComparisons> {
  const response = await apiClient.get<DashboardMetricsResponse>('/dashboard/metrics')
  return response.data
}

/**
 * Obtém dados para gráfico de vendas vs gastos
 * Endpoint: GET /dashboard/chart
 */
export async function getDashboardChart(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
  data: ChartDataPoint[]
  meta: { period: { start: string; end: string; days: number } }
}> {
  const response = await apiClient.get<DashboardChartResponse>(`/dashboard/chart?period=${period}`)
  return {
    data: response.data,
    meta: response.meta
  }
}

/**
 * Obtém atividades recentes do dashboard
 * Endpoint: GET /dashboard/activities
 */
export async function getDashboardActivities(limit: number = 10): Promise<{
  data: DashboardActivity[]
  meta: { total: number; limit: number }
}> {
  const response = await apiClient.get<DashboardActivitiesResponse>(`/dashboard/activities?limit=${limit}`)
  return {
    data: response.data,
    meta: response.meta
  }
}

/**
 * Obtém top clientes por gasto
 * Endpoint: GET /dashboard/top-clients
 */
export async function getTopClients(limit: number = 10): Promise<DashboardTopClientsResponse['data']> {
  const response = await apiClient.get<DashboardTopClientsResponse>(`/dashboard/top-clients?limit=${limit}`)
  return response.data
}