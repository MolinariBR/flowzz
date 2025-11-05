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

interface ProfileData {
  nome?: string
  email?: string
  telefone?: string
  documento?: string
  endereco?: string
  cidade?: string
  cep?: string
  avatar_url?: string
}

interface SystemSettings {
  dark_mode?: boolean
  language?: string
  timezone?: string
  date_format?: string
  currency?: string
}

interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

interface Session {
  id: string
  user_agent: string
  ip_address: string
  device_info: string
  created_at: string
  expires_at: string
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
 * Refresh access token
 * Endpoint: POST /auth/refresh
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
  return response
}

/**
 * Get user profile
 * Endpoint: GET /auth/profile
 */
export async function getProfile(): Promise<{ data: ProfileData; message: string }> {
  const response = await apiClient.get<{ data: ProfileData; message: string }>('/auth/profile')
  return response
}

/**
 * Update user profile
 * Endpoint: PUT /auth/profile
 */
export async function updateProfile(
  data: ProfileData
): Promise<{ data: ProfileData; message: string }> {
  const response = await apiClient.put<{ data: ProfileData; message: string }>(
    '/auth/profile',
    data
  )
  return response
}

/**
 * Get system settings
 * Endpoint: GET /auth/system-settings
 */
export async function getSystemSettings(): Promise<{ data: SystemSettings; message: string }> {
  const response = await apiClient.get<{ data: SystemSettings; message: string }>(
    '/auth/system-settings'
  )
  return response
}

/**
 * Update system settings
 * Endpoint: PUT /auth/system-settings
 */
export async function updateSystemSettings(
  data: SystemSettings
): Promise<{ data: SystemSettings; message: string }> {
  const response = await apiClient.put<{ data: SystemSettings; message: string }>(
    '/auth/system-settings',
    data
  )
  return response
}

/**
 * Change password
 * Endpoint: PUT /auth/security
 */
export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.put<{ message: string }>('/auth/security', data)
  return response
}

/**
 * Get active sessions
 * Endpoint: GET /auth/sessions
 */
export async function getSessions(): Promise<{ data: Session[]; message: string }> {
  const response = await apiClient.get<{ data: Session[]; message: string }>('/auth/sessions')
  return response
}

/**
 * Revoke session
 * Endpoint: DELETE /auth/sessions/:id
 */
export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`)
  return response
}
