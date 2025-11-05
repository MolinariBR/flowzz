import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/admin-layout'
import { useAuthStore } from './lib/stores/auth-store'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { ProfileSettings } from './pages/ProfileSettings'
import { Users } from './pages/Users'
import { WhatsAppSettings } from './pages/WhatsAppSettings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
})

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, hydrated } = useAuthStore()

  console.log('🔒 ProtectedRoute - Estado atual:', {
    isAuthenticated,
    hasUser: !!user,
    hydrated,
    hasToken: !!localStorage.getItem('access_token'),
  })

  // Aguardar a hidratação do Zustand
  if (!hydrated) {
    console.log('⏳ Aguardando hidratação do Zustand...')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Verificar autenticação
  const isAuth = isAuthenticated && user && localStorage.getItem('access_token')

  if (!isAuth) {
    console.log('⚠️ Usuário não autenticado, redirecionando para /login')
    return <Navigate to="/login" replace />
  }

  console.log('✅ Usuário autenticado, permitindo acesso')
  return <>{children}</>
}

function App() {
  const { isAuthenticated, user, token } = useAuthStore()

  React.useEffect(() => {
    console.log('🚀 App montado - Estado inicial:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      localStorage: {
        access_token: `${localStorage.getItem('access_token')?.substring(0, 20)}...`,
        refresh_token: !!localStorage.getItem('refresh_token'),
        'admin-auth-storage': localStorage.getItem('admin-auth-storage'),
      },
    })
  }, [isAuthenticated, user, token])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="configuracoes" element={<ProfileSettings />} />
              <Route path="whatsapp" element={<WhatsAppSettings />} />
              <Route path="metrics" element={<Dashboard />} />
              <Route path="integrations" element={<WhatsAppSettings />} />
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
