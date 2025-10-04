// API Client base para comunicação com backend
// Padrão Flow: fetch nativo, TypeScript, error handling

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

export const apiClient = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      const error: ApiError = data
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
