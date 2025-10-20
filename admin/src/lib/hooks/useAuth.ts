// Referência: design.md §Authentication Hooks, tasks.md Integração
// Hook de autenticação para Admin Panel (React + Zustand)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient, { isAuthenticated as checkAuth, clearTokens, saveTokens } from '../api/client'

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
}

interface LoginRequest {
  email: string
  password: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Fazer login
       */
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })

        try {
          // O interceptor do apiClient já retorna response.data
          const data = (await apiClient.post('/auth/login', credentials)) as {
            user: User
            access_token: string
            refresh_token: string
          }

          // Validar se é admin
          if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
            throw new Error('Acesso negado. Apenas administradores podem acessar este painel.')
          }

          // Salvar tokens
          saveTokens(data.access_token, data.refresh_token)

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login'

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })

          throw error
        }
      },

      /**
       * Fazer logout
       */
      logout: async () => {
        try {
          await apiClient.post('/auth/logout')
        } catch (error) {
          console.error('Erro ao fazer logout:', error)
        } finally {
          // Limpar tokens e estado
          clearTokens()

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      /**
       * Verificar autenticação
       */
      checkAuth: async () => {
        // Verificar se há token
        if (!checkAuth()) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }

        set({ isLoading: true })

        try {
          // O interceptor do apiClient já retorna response.data
          const user = (await apiClient.get('/auth/me')) as User

          // Validar se é admin
          if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Acesso negado')
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (_error) {
          // Token inválido ou expirado
          clearTokens()

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      /**
       * Limpar erro
       */
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ============================================
// HOOK CUSTOMIZADO
// ============================================

export const useAuth = () => {
  const store = useAuthStore()

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,

    // Helpers
    isAdmin: store.user?.role === 'ADMIN' || store.user?.role === 'SUPER_ADMIN',
    isSuperAdmin: store.user?.role === 'SUPER_ADMIN',
  }
}

export default useAuth
