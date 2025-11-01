// src/components/auth/ProtectedRoute.tsx
// Componente para proteger rotas que requerem autenticação

'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../../lib/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Não renderizar nada se não estiver autenticado (vai redirecionar)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}