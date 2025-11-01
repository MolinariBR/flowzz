'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../lib/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Aguardar carregamento da autenticação
    if (isLoading) return

    if (isAuthenticated) {
      // Usuário logado, redirecionar para dashboard
      router.push('/dashboard')
    } else {
      // Usuário não logado, redirecionar para login
      router.push('/login')
    }
  }, [router, isAuthenticated, isLoading])

  // Renderizar loading enquanto verifica
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 mb-4 shadow-lg">
          <svg
            className="h-8 w-8 text-white animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-700">Carregando Flowzz...</h2>
        <p className="text-slate-500 mt-2">Verificando autenticação</p>
      </div>
    </div>
  )
}
