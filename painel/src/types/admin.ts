export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  avatar?: string
}

export interface User {
  id: string
  name: string
  email: string
  plan: 'trial' | 'basic' | 'pro' | 'premium'
  status: 'active' | 'suspended' | 'cancelled'
  mrr: number
  lastLogin: Date
  signupDate: Date
  avatar?: string
}

export interface AdminMetrics {
  total_users: number
  active_users_30d: number
  mrr: number
  churn_rate: number
  new_subscriptions_month: number
  cancellations_month: number
  tickets_open: number
}

export interface UserGrowth {
  month: string
  users: number
  active: number
}

export interface RevenueData {
  month: string
  mrr: number
  arr: number
  churn: number
}

export interface PlanDistribution {
  plan: string
  users: number
  revenue: number
}

export interface Notification {
  id: string
  type: 'danger' | 'warning' | 'info' | 'success'
  title: string
  message: string
  actionUrl?: string
  timestamp: Date
  read: boolean
}

export interface NavigationItem {
  key: string
  label: string
  href?: string
  icon: any
  badge?: number
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN'
  children?: NavigationItem[]
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  details: string
  timestamp: Date
  ip: string
}

export interface IntegrationStatus {
  name: string
  status: 'connected' | 'error' | 'warning'
  lastSync: Date
  errorCount: number
}
