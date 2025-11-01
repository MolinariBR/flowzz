// src/lib/types/auth.ts
// Tipos para autenticação JWT

export interface User {
  id: string
  nome: string
  email: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  avatar_url?: string | null
  is_active: boolean
  created_at: string
  trial_ends_at?: string
  subscription_status?: 'TRIAL' | 'ACTIVE' | 'INACTIVE' | 'CANCELLED'
  plan_id?: string
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  tokens: Tokens | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  nome: string
  email: string
  password: string
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  clearAuth: () => void
}