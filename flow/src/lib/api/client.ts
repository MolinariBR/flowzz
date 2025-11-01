// API Client base para comunicação com backend
// Padrão Flow: fetch nativo, TypeScript, error handling

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

// Função para obter token atual
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

// Função para tentar refresh do token
const attemptTokenRefresh = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      console.log('API Client: No refresh token available')
      return false
    }

    console.log('API Client: Attempting token refresh...')

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      const { tokens, user } = data.data

      // Atualizar localStorage
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      console.log('API Client: Token refreshed successfully')
      return true
    } else {
      console.log('API Client: Token refresh failed')
      return false
    }
  } catch (error) {
    console.error('API Client: Error during token refresh:', error)
    return false
  }
}

export const apiClient = {
  async request<T>(endpoint: string, options?: RequestInit, retryOn401: boolean = true): Promise<T> {
    const token = getAccessToken()
    console.log('API Client: Making request to', endpoint, 'with token:', !!token)

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    })

    console.log('API Client: Response status:', response.status)

    // Se receber 401 e ainda não tentou refresh, tentar refresh automático
    if (response.status === 401 && retryOn401 && token) {
      console.log('API Client: Received 401, attempting token refresh...')

      // Evitar múltiplas tentativas simultâneas
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = attemptTokenRefresh().finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
      }

      const refreshSuccess = await refreshPromise

      if (refreshSuccess) {
        // Tentar a requisição novamente com o novo token
        console.log('API Client: Retrying request with refreshed token...')
        return this.request<T>(endpoint, options, false) // retryOn401 = false para evitar loop
      } else {
        // Refresh falhou, limpar autenticação
        console.log('API Client: Refresh failed, clearing auth...')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
        // Recarregar a página para forçar reautenticação
        window.location.href = '/login'
        throw new Error('Sessão expirada. Redirecionando para login...')
      }
    }

    const data = await response.json()

    if (!response.ok) {
      const error: ApiError = data
      console.error('API Client: Request failed:', error)
      throw new Error(error.error || error.message || 'Erro na requisição')
    }

    return data
  },

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  },

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  },
}
