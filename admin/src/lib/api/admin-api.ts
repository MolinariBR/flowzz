// Referência: design.md §Admin API, tasks.md Task 11 - Admin Panel
// API endpoints para o painel administrativo

import type { User } from '../../types/admin'
import apiClient, { type ApiResponse, type PaginatedResponse } from './client'

// ============================================
// TYPES
// ============================================

export interface AdminMetrics {
  totalUsers: number
  activeUsers: number
  activeUsers30d: number
  mrr: number
  arr: number
  churnRate: number
  ltv: number
  cac: number
  newUsersThisMonth: number
  cancellationsMonth: number
  ticketsOpen: number
  revenueGrowth: number
}

export interface UserGrowth {
  month: string
  total: number
  active: number
  trial: number
  churned: number
}

export interface AdminStats {
  today_signups: number
  today_revenue: number
  active_trials: number
  expiring_trials_7d: number
}

export interface AdminUser {
  id: string
  nome: string
  email: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  is_active: boolean
  created_at: string
  subscription?: {
    plan: string
    status: string
    current_period_end: string
  }
}

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_user_id: string | null
  details: Record<string, unknown>
  timestamp: string
}

// ============================================
// ADMIN METRICS
// ============================================

export const adminApi = {
  /**
   * Obter métricas SaaS (MRR, ARR, Churn, LTV, CAC)
   */
  getMetrics: async (): Promise<AdminMetrics> => {
    return apiClient.get('/admin/metrics')
  },

  /**
   * Obter crescimento de usuários por mês
   */
  getUsersGrowth: async (months: number = 12): Promise<UserGrowth[]> => {
    return apiClient.get(`/admin/users/growth?months=${months}`)
  },

  /**
   * Obter estatísticas do dia
   */
  getStats: async (): Promise<AdminStats> => {
    return apiClient.get('/admin/stats')
  },

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Listar todos os usuários com filtros
   */
  listUsers: async (params: {
    page?: number
    limit?: number
    search?: string
    plan?: string
    status?: string
    role?: string
  }): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString()

    interface BackendUser {
      id: string
      nome: string
      email: string
      plan_id: string | null
      is_active: boolean
      created_at: string
      updated_at: string
    }

    const responseData = (await apiClient.get(
      `/admin/users?${queryString}`
    )) as PaginatedResponse<BackendUser>

    // Backend já retorna em formato PaginatedResponse graças ao interceptor
    // Transformar dados do backend (snake_case) para frontend (camelCase)
    const transformedUsers: User[] = responseData.data.map((user: BackendUser) => ({
      id: user.id,
      name: user.nome || 'Sem nome',
      email: user.email,
      plan: user.plan_id ? ('pro' as const) : ('trial' as const),
      status: user.is_active ? ('active' as const) : ('suspended' as const),
      mrr: 0, // TODO: calcular MRR real
      lastLogin: user.updated_at ? new Date(user.updated_at) : new Date(),
      signupDate: new Date(user.created_at),
      avatar: undefined,
    }))

    return {
      data: transformedUsers,
      total: responseData.total,
      page: responseData.page,
      limit: responseData.limit,
      totalPages: responseData.totalPages,
    }
  },

  /**
   * Obter detalhes de um usuário
   */
  getUser: async (userId: string): Promise<AdminUser> => {
    return apiClient.get(`/admin/users/${userId}`)
  },

  /**
   * Atualizar usuário
   */
  updateUser: async (
    userId: string,
    data: { nome?: string; role?: string; is_active?: boolean }
  ): Promise<AdminUser> => {
    return apiClient.put(`/admin/users/${userId}`, data)
  },

  /**
   * Suspender usuário
   */
  suspendUser: async (userId: string, reason: string): Promise<ApiResponse> => {
    return apiClient.post(`/admin/users/${userId}/suspend`, { reason })
  },

  /**
   * Reativar usuário
   */
  reactivateUser: async (userId: string): Promise<ApiResponse> => {
    return apiClient.post(`/admin/users/${userId}/reactivate`)
  },

  /**
   * Impersonar usuário (fazer login como)
   */
  impersonateUser: async (userId: string): Promise<{ access_token: string }> => {
    return apiClient.post(`/admin/users/${userId}/impersonate`)
  },

  // ============================================
  // AUDIT LOGS
  // ============================================

  /**
   * Listar audit logs
   */
  getAuditLogs: async (params: {
    page?: number
    limit?: number
    admin_id?: string
    action?: string
    start_date?: string
    end_date?: string
  }): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString()

    return apiClient.get(`/admin/audit-logs?${queryString}`)
  },
}

export default adminApi
