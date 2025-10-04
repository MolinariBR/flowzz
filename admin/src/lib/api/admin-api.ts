// Referência: design.md §Admin API, tasks.md Task 11 - Admin Panel
// API endpoints para o painel administrativo

import apiClient, { type ApiResponse, type PaginatedResponse } from './client';

// ============================================
// TYPES
// ============================================

export interface AdminMetrics {
  mrr: number;
  arr: number;
  churn_rate: number;
  ltv: number;
  cac: number;
  active_users: number;
  total_users: number;
  trial_users: number;
}

export interface UserGrowth {
  month: string;
  total: number;
  active: number;
  trial: number;
  churned: number;
}

export interface AdminStats {
  today_signups: number;
  today_revenue: number;
  active_trials: number;
  expiring_trials_7d: number;
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  is_active: boolean;
  created_at: string;
  subscription?: {
    plan: string;
    status: string;
    current_period_end: string;
  };
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown>;
  timestamp: string;
}

// ============================================
// ADMIN METRICS
// ============================================

export const adminApi = {
  /**
   * Obter métricas SaaS (MRR, ARR, Churn, LTV, CAC)
   */
  getMetrics: async (): Promise<AdminMetrics> => {
    return apiClient.get('/admin/metrics');
  },

  /**
   * Obter crescimento de usuários por mês
   */
  getUsersGrowth: async (months: number = 12): Promise<UserGrowth[]> => {
    return apiClient.get(`/admin/users/growth?months=${months}`);
  },

  /**
   * Obter estatísticas do dia
   */
  getStats: async (): Promise<AdminStats> => {
    return apiClient.get('/admin/stats');
  },

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Listar todos os usuários com filtros
   */
  listUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    plan?: string;
    status?: string;
    role?: string;
  }): Promise<PaginatedResponse<AdminUser>> => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();

    return apiClient.get(`/admin/users?${queryString}`);
  },

  /**
   * Obter detalhes de um usuário
   */
  getUser: async (userId: string): Promise<AdminUser> => {
    return apiClient.get(`/admin/users/${userId}`);
  },

  /**
   * Atualizar usuário
   */
  updateUser: async (
    userId: string,
    data: { nome?: string; role?: string; is_active?: boolean },
  ): Promise<AdminUser> => {
    return apiClient.put(`/admin/users/${userId}`, data);
  },

  /**
   * Suspender usuário
   */
  suspendUser: async (userId: string, reason: string): Promise<ApiResponse> => {
    return apiClient.post(`/admin/users/${userId}/suspend`, { reason });
  },

  /**
   * Reativar usuário
   */
  reactivateUser: async (userId: string): Promise<ApiResponse> => {
    return apiClient.post(`/admin/users/${userId}/reactivate`);
  },

  /**
   * Impersonar usuário (fazer login como)
   */
  impersonateUser: async (userId: string): Promise<{ access_token: string }> => {
    return apiClient.post(`/admin/users/${userId}/impersonate`);
  },

  // ============================================
  // AUDIT LOGS
  // ============================================

  /**
   * Listar audit logs
   */
  getAuditLogs: async (params: {
    page?: number;
    limit?: number;
    admin_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();

    return apiClient.get(`/admin/audit-logs?${queryString}`);
  },
};

export default adminApi;
