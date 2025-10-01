// Referência: design.md §State Management Admin, user-stories.md Story 7.1
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser, LoginCredentials } from '@/types/admin'

interface AuthState {
  user: AdminUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: AdminUser) => void
  setToken: (token: string) => void
  clearError: () => void
  validateToken: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Erro ao fazer login')
          }

          const data = await response.json()
          
          // Estrutura de resposta do backend: { message, data: { user, tokens } }
          const user = data.data.user
          const tokens = data.data.tokens
          
          // Verificar se usuário tem role admin
          if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            throw new Error('Acesso negado. Apenas administradores podem acessar.')
          }

          set({
            user: {
              id: user.id,
              email: user.email,
              nome: user.nome,
              avatar: undefined,
              role: user.role,
              created_at: user.created_at,
              last_login: new Date().toISOString(),
            },
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Credenciais inválidas'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          })
          throw new Error(errorMessage)
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
        
        // Chamar endpoint de logout se token existir
        const { token } = get()
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }).catch(() => {
            // Ignorar erros de logout
          })
        }
      },

      setUser: (user: AdminUser) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      },

      clearError: () => {
        set({ error: null })
      },

      validateToken: async () => {
        const { token } = get()
        if (!token) return false

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            get().logout()
            return false
          }

          const userData = await response.json()
          
          // Verificar se ainda tem role admin
          if (!['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
            get().logout()
            return false
          }

          set({ user: userData, isAuthenticated: true })
          return true
        } catch {
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)