// src/lib/contexts/AuthContext.tsx
// Contexto de autenticação JWT para o frontend

'use client'

import { jwtDecode } from 'jwt-decode'
import type React from 'react'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  login as apiLogin,
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  register as apiRegister,
} from '../api/auth'
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterData,
  Tokens,
  User,
} from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Interface para payload JWT decodificado
interface JWTPayload {
  exp?: number
  iat?: number
  sub?: string
  email?: string
}

// Função para verificar se um token JWT é válido e não expirou
const isTokenValid = (token: string): boolean => {
  try {
    console.log('AuthContext: Validating token (first 50 chars):', `${token.substring(0, 50)}...`)

    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.log('AuthContext: Token is not a valid JWT format')
      return false
    }

    const decoded = jwtDecode<JWTPayload>(token)

    if (!decoded.exp) {
      console.log('AuthContext: Token has no exp field')
      return false
    }

    // Verificar se o token não expirou (exp está em segundos)
    const currentTime = Math.floor(Date.now() / 1000)
    const isValid = decoded.exp > currentTime

    console.log('AuthContext: Token validation result:', {
      isValid,
      exp: decoded.exp,
      current: currentTime,
      timeUntilExpiry: decoded.exp - currentTime,
    })

    return isValid
  } catch (error) {
    console.error('AuthContext: Error decoding token:', error)
    return false
  }
}

// Função para validar tokens armazenados (apenas validação local, sem API calls)
const validateStoredTokens = (): { user: User; tokens: Tokens } | null => {
  try {
    const storedUser = localStorage.getItem('user')
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    // Verificar se todos os dados existem
    if (!storedUser || !storedAccessToken || !storedRefreshToken) {
      console.log('AuthContext: Missing stored auth data')
      return null
    }

    // Verificar se os tokens são válidos (não expiraram)
    if (!isTokenValid(storedAccessToken) || !isTokenValid(storedRefreshToken)) {
      console.log('AuthContext: Tokens expired or invalid, clearing storage')
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return null
    }

    const user: User = JSON.parse(storedUser)
    const tokens: Tokens = {
      accessToken: storedAccessToken,
      refreshToken: storedRefreshToken,
    }

    console.log('AuthContext: Stored tokens are valid for user:', user.email)
    return { user, tokens }
  } catch (error) {
    console.error('Error validating stored tokens:', error)
    // Limpar dados corrompidos
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return null
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadStoredAuth = () => {
      console.log('AuthContext: Starting auth initialization...')

      // Timeout de emergência - se demorar mais de 5 segundos, forçar conclusão
      const emergencyTimeout = setTimeout(() => {
        console.warn('AuthContext: Emergency timeout triggered - forcing unauthenticated state')
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }))
      }, 5000)

      try {
        const validAuth = validateStoredTokens()

        clearTimeout(emergencyTimeout) // Cancelar timeout se tudo correr bem

        if (validAuth) {
          console.log('AuthContext: Authentication successful')
          setState({
            user: validAuth.user,
            tokens: validAuth.tokens,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          console.log('AuthContext: No valid authentication found')
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }))
        }
      } catch (error) {
        clearTimeout(emergencyTimeout)
        console.error('AuthContext: Critical error during initialization:', error)

        // Limpeza de emergência
        try {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        } catch (cleanupError) {
          console.error('AuthContext: Failed to cleanup localStorage:', cleanupError)
        }

        setState({
          user: null,
          tokens: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    loadStoredAuth()
  }, [])

  // Função de login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await apiLogin(credentials)

      const { user, tokens } = response.data

      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)

      // Atualizar estado
      setState({
        user,
        tokens,
        isLoading: false,
        isAuthenticated: true,
      })

      toast.success('Login realizado com sucesso!')
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
      throw error
    }
  }

  // Função de registro
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await apiRegister(data)

      const { user, tokens } = response.data

      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)

      // Atualizar estado
      setState({
        user,
        tokens,
        isLoading: false,
        isAuthenticated: true,
      })

      toast.success('Conta criada com sucesso!')
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      toast.error('Erro ao criar conta. Tente novamente.')
      throw error
    }
  }

  // Função de logout
  const logout = (): void => {
    try {
      // Chamar API de logout (não bloqueante)
      apiLogout().catch(console.error)

      // Limpar autenticação
      clearAuth()

      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Erro ao fazer logout.')
    }
  }

  // Função para limpar completamente a autenticação
  const clearAuth = (): void => {
    console.log('AuthContext: Clearing all authentication data')

    // Limpar localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    // Resetar estado
    setState({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  // Função para renovar token
  const refreshToken = async (): Promise<void> => {
    try {
      if (!state.tokens?.refreshToken) {
        throw new Error('No refresh token available')
      }

      console.log('AuthContext: Attempting to refresh token...')

      const response = await apiRefreshToken(state.tokens.refreshToken)

      const { user, tokens } = response.data

      // Atualizar localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)

      // Atualizar estado
      setState((prev) => ({
        ...prev,
        user,
        tokens,
        isAuthenticated: true,
      }))

      console.log('AuthContext: Token refreshed successfully for user:', user.email)
    } catch (error) {
      console.error('Error refreshing token:', error)

      // Se o refresh falhar, fazer logout
      console.log('AuthContext: Refresh failed, logging out...')
      clearAuth()
      throw error
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
