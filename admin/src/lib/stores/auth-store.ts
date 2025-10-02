import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '../../types/admin'

interface AuthState {
  user: AdminUser | null
  token: string | null
  role: 'ADMIN' | 'SUPER_ADMIN' | null
  isAuthenticated: boolean
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

      login: async (email: string, password: string) => {
        try {
          // Simulação de login - substituir por API real
          const mockUser: AdminUser = {
            id: '1',
            name: 'Ana Santos',
            email: email,
            role: 'ADMIN',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
          }
          
          const mockToken = 'mock-jwt-token-' + Date.now()
          
          set({
            user: mockUser,
            token: mockToken,
            role: mockUser.role,
            isAuthenticated: true
          })
        } catch (error) {
          throw new Error('Falha na autenticação')
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false
        })
      },

      setUser: (user: AdminUser) => {
        set({ user, role: user.role, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      }
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
