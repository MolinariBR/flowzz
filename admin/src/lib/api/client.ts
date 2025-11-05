// Referência: design.md §API Client, tasks.md Integração Frontend-Backend
// API client configurado com Axios para Admin Panel

import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

// Tipos de erro da API
export interface ApiError {
  error: string
  message: string
  statusCode: number
}

// Tipos de resposta da API
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

// Tipos de paginação
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Configuração da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Permitir cookies (para refresh token)
})

// ============================================
// INTERCEPTORS
// ============================================

// Request Interceptor - Adicionar token de autenticação
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obter token do localStorage
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Token adicionado à requisição:', config.url)
    } else {
      console.log('⚠️ Nenhum token encontrado para requisição:', config.url)
    }

    // Desabilitar cache para GET requests durante desenvolvimento
    if (config.method === 'get' && config.headers) {
      config.headers['Cache-Control'] = 'no-cache'
      config.headers['Pragma'] = 'no-cache'
    }

    return config
  },
  (error) => {
    console.error('❌ Erro no request interceptor:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor - Tratar erros e refresh token
apiClient.interceptors.response.use(
  (response) => {
    console.log('🔄 Response interceptor - response.data:', response.data)
    
    // Se a resposta tem um wrapper {success: true, data: ...}, desembrulhar
    if (response.data?.success && response.data?.data !== undefined) {
      console.log('📦 Desembrulhando response.data.data:', response.data.data)
      return response.data.data
    }
    // Caso contrário, retornar dados diretamente
    console.log('📦 Retornando response.data diretamente')
    return response.data
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Se erro 401 e não é tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tentar refresh token
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken: refreshToken },
          { withCredentials: true }
        )

        // API retorna em camelCase
        const data = response.data.data || response.data
        const { accessToken, refreshToken: newRefreshToken } = data.tokens || data

        // Salvar novos tokens
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', newRefreshToken)

        // Atualizar header da requisição original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        // Repetir requisição original
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Falha no refresh - fazer logout
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')

        // Redirecionar para login
        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    // Formatar erro para resposta padronizada
    const apiError: ApiError = {
      error: error.response?.data?.error || 'Unknown Error',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
    }

    return Promise.reject(apiError)
  }
)

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Salvar tokens de autenticação
 */
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

/**
 * Limpar tokens de autenticação
 */
export const clearTokens = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

/**
 * Verificar se usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token')
}

/**
 * Obter token de acesso
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token')
}

// ============================================
// API CLIENT EXPORT
// ============================================

export default apiClient

// Type helper para extrair tipo de resposta
export type UnwrapApiResponse<T> = T extends ApiResponse<infer U> ? U : T
