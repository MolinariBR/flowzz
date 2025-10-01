// Referência: design.md §Authentication Guards, user-stories.md Story 7.2
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import LoginForm from '@/components/auth/login-form'
import { Spinner } from '@heroui/react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN'
}

export default function AuthGuard({ children, requiredRole = 'ADMIN' }: AuthGuardProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const { isAuthenticated, user, validateToken, isLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      await validateToken()
      setIsInitialized(true)
    }

    initAuth()
  }, [validateToken])

  // Loading inicial
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não autenticado
  if (!isAuthenticated || !user) {
    return <LoginForm onSuccess={() => setIsInitialized(true)} />
  }

  // Verificar role necessária
  if (requiredRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissões suficientes para acessar esta área.
            Apenas Super Administradores podem acessar.
          </p>
          <button
            type="button"
            onClick={() => useAuthStore.getState().logout()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Fazer logout
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}