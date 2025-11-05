import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '../../types/admin'
import apiClient, { clearTokens, saveTokens } from '../api/client'

interface AuthState {
  user: AdminUser | null
  token: string | null
  role: 'ADMIN' | 'SUPER_ADMIN' | null
  isAuthenticated: boolean
  hydrated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: AdminUser) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      hydrated: true, // Iniciar como true - será sobrescrito após hidratação

      login: async (email: string, password: string) => {
        try {
          console.log('🔐 Iniciando login...')
          // Chamar API real do backend
          // O interceptor do apiClient já retorna response.data, então não precisa de .data
          const response = (await apiClient.post('/auth/login', { email, password })) as {
            message: string
            data: {
              user: {
                id: string
                nome: string
                email: string
                role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
                avatar_url?: string | null
              }
              tokens: {
                accessToken: string
                refreshToken: string
              }
            }
          }

          console.log('✅ Resposta da API:', response)
          const { user, tokens } = response.data

          // Validar se é admin
          if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Acesso negado. Apenas administradores podem acessar este painel.')
          }

          // Salvar tokens no localStorage (API retorna camelCase)
          saveTokens(tokens.accessToken, tokens.refreshToken)
          console.log('💾 Tokens salvos no localStorage')

          // Converter para formato AdminUser
          const adminUser: AdminUser = {
            id: user.id,
            name: user.nome,
            email: user.email,
            role: user.role as 'ADMIN' | 'SUPER_ADMIN',
            avatar: user.avatar_url || undefined,
          }

          console.log('👤 Setando estado do usuário:', adminUser)
          set({
            user: adminUser,
            token: tokens.accessToken,
            role: adminUser.role,
            isAuthenticated: true,
          })

          console.log('✅ Estado final:', get())
        } catch (error) {
          console.error('❌ Erro no login:', error)
          throw error instanceof Error ? error : new Error('Falha na autenticação')
        }
      },

      logout: () => {
        // Chamar API de logout
        apiClient.post('/auth/logout').catch((err) => {
          console.error('Erro ao fazer logout:', err)
        })

        // Limpar tokens
        clearTokens()

        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        })
      },

      setUser: (user: AdminUser) => {
        set({ user, role: user.role, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        // Não persistir hydrated - será setado na hidratação
      }),
            // Sincronizar com localStorage ao hidratar
      onRehydrateStorage: () => (state) => {
        console.log('💧 Zustand iniciando hidratação...')
        
        // MIGRAÇÃO: Detectar e corrigir estados antigos sem hydrated
        const storedState = localStorage.getItem('admin-auth-storage')
        if (storedState) {
          try {
            const parsed = JSON.parse(storedState)
            if (parsed.state && parsed.state.hydrated === undefined) {
              console.log('🔄 Migrando estado antigo - adicionando hydrated: true')
              parsed.state.hydrated = true
              localStorage.setItem('admin-auth-storage', JSON.stringify(parsed))
            }
          } catch (e) {
            console.error('Erro ao migrar estado:', e)
          }
        }
        
        if (state) {
          console.log('💧 Zustand hydrated - Estado restaurado:', {
            hasUser: !!state.user,
            hasToken: !!state.token,
            isAuthenticated: state.isAuthenticated,
            hydrated: state.hydrated,
          })

          // IMPORTANTE: Marcar como hidratado SEMPRE
          state.hydrated = true

          // Verificar se tem token no localStorage mas estado diz não autenticado
          const hasLocalToken = !!localStorage.getItem('access_token')
          if (hasLocalToken && state.user && !state.isAuthenticated) {
            console.log('🔧 Corrigindo inconsistência - setando isAuthenticated = true')
            state.isAuthenticated = true
          }
          
          console.log('✅ Hidratação completa - hydrated:', state.hydrated)
        } else {
          // Se não há estado, criar estado inicial com hydrated = true
          console.log('⚠️ Nenhum estado encontrado - criando estado inicial')
        }
      },
    }
  )
)
