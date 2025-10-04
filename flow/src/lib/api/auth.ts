// Auth API - Login, Register, Logout
// Integração com backend /api/v1/auth

import { apiClient } from './client'

// ============================================
// TYPES
// ============================================

interface User {
  id: string
  nome: string
  email: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  avatar_url?: string | null
  is_active: boolean
  created_at: string
}

interface Tokens {
  accessToken: string
  refreshToken: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  nome: string
  email: string
  password: string
}

interface AuthResponse {
  data: {
    user: User
    tokens: Tokens
  }
  message: string
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Login de usuário
 * Endpoint: POST /auth/login
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
  
  // Salvar tokens e usuário no localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', response.data.tokens.accessToken)
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }
  
  return response
}

/**
 * Registro de novo usuário
 * Endpoint: POST /auth/register
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data)
  
  // Salvar tokens e usuário no localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', response.data.tokens.accessToken)
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }
  
  return response
}

/**
 * Logout de usuário
 * Endpoint: POST /auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {})
  } finally {
    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }
}

/**
 * Obter usuário atual do localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userJson = localStorage.getItem('user')
  if (!userJson) return null
  
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

/**
 * Verificar se usuário está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('accessToken')
}
