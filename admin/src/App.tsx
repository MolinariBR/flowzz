import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AdminLayout } from './components/layout/admin-layout'
import { Dashboard } from './pages/Dashboard'
import { Users } from './pages/Users'
import { Login } from './pages/Login'
import { useAuthStore } from './lib/stores/auth-store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
})

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAuthStore()
  const [isHydrated, setIsHydrated] = React.useState(false);
  
  // Aguardar o Zustand restaurar o estado do localStorage
  React.useEffect(() => {
    // Verificar se o estado foi hidratado verificando se há dados persistidos
    const persistedData = localStorage.getItem('admin-auth-storage');
    const hasToken = localStorage.getItem('access_token');
    
    console.log('🔒 ProtectedRoute - Verificando autenticação:', { 
      isAuthenticated: store.isAuthenticated, 
      hasUser: !!store.user, 
      hasToken: !!hasToken,
      hasPersisted: !!persistedData
    });
    
    setIsHydrated(true);
  }, []);
  
  // Mostrar loading enquanto aguarda restauração do estado
  if (!isHydrated) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }
  
  // Verificar autenticação com múltiplas condições
  const isAuth = store.isAuthenticated && store.user && localStorage.getItem('access_token');
  
  if (!isAuth) {
    console.log('⚠️ Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace />
  }
  
  console.log('✅ Usuário autenticado, permitindo acesso');
  return <>{children}</>
}

function App() {
  const { isAuthenticated, user, token } = useAuthStore();
  
  React.useEffect(() => {
    console.log('🚀 App montado - Estado inicial:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      localStorage: {
        access_token: localStorage.getItem('access_token')?.substring(0, 20) + '...',
        refresh_token: !!localStorage.getItem('refresh_token'),
        'admin-auth-storage': localStorage.getItem('admin-auth-storage')
      }
    });
  }, [isAuthenticated, user, token]);
  
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
              <Route path="metrics" element={<Dashboard />} />
              <Route path="integrations" element={<Dashboard />} />
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