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
  icon: React.ComponentType<{ className?: string }>
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
