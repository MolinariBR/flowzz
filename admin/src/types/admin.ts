// Referência: design.md §Admin Types, user-stories.md Story 7.1, dev-stories.md §Dev Story 5.1

export interface AdminUser {
  id: string
  email: string
  nome: string
  avatar?: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  created_at: string
  last_login?: string
}

export interface AdminMetrics {
  // Métricas SaaS (Story 7.1)
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churn_rate: number // Taxa de churn (%)
  ltv: number // Lifetime Value
  cac: number // Customer Acquisition Cost
  
  // Usuários
  total_users: number
  active_users_30d: number
  new_subscriptions_month: number
  cancellations_month: number
  
  // Suporte
  tickets_open: number
  
  // Meta dados
  updated_at: string
  period: string
}

export interface UserGrowthData {
  month: string
  users: number
  new_users: number
  churned_users: number
}

export interface RevenueData {
  month: string
  revenue: number
  subscriptions: number
  avg_revenue_per_user: number
}

export interface PlanDistribution {
  plan: 'basic' | 'pro' | 'premium'
  count: number
  percentage: number
  revenue: number
}

export interface User {
  id: string
  email: string
  nome: string
  status: 'active' | 'suspended' | 'cancelled'
  plan: 'basic' | 'pro' | 'premium'
  created_at: string
  last_login?: string
  subscription?: {
    status: string
    current_period_end: string
    valor: number
  }
}

export interface UserFilters {
  search?: string
  status?: string
  plan?: string
  page?: number
  limit?: number
}

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_user_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: AdminUser
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}