# 🔗 Integração Flow App ↔ Backend

## 🚨 **Problema Identificado**

O Flow App (Next.js) tem uma interface bonita mas **dados parcialmente mockados**. Há API client implementado e autenticação funcionando, mas muitas operações ainda usam dados mockados.

### **Situação Atual**
- ✅ Layout profissional e responsivo
- ✅ API client implementado (`src/lib/api/client.ts`)
- ✅ Autenticação JWT integrada (`src/lib/api/auth.ts`)
- ⚠️ Dados parcialmente mockados em algumas páginas
- ⚠️ Falta conectar operações CRUD completas

## ✅ **Solução Proposta**

### **Fase 1: Autenticação Básica**

#### **1.1 Instalar Dependências**
```bash
cd flow
npm install axios zustand @tanstack/react-query
```

#### **1.2 Criar Cliente API**
Criar `src/lib/api/client.ts`:

```typescript
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

#### **1.3 Criar Store de Autenticação**
Criar `src/lib/stores/auth-store.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  nome: string
  email: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password })
        const { user, tokens } = response.data.data

        localStorage.setItem('access_token', tokens.accessToken)
        localStorage.setItem('refresh_token', tokens.refreshToken)

        set({
          user,
          token: tokens.accessToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'flow-auth-storage',
    }
  )
)
```

#### **1.4 Proteger Rotas**
Criar `src/components/ProtectedRoute.tsx`:

```typescript
'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return <div>Carregando...</div>
  }

  return <>{children}</>
}
```

### **Fase 2: Conectar Dashboard**

#### **2.1 Criar Hook para Métricas**
Criar `src/lib/hooks/use-dashboard.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'

export interface DashboardMetrics {
  totalSales: number
  totalRevenue: number
  activeClients: number
  pendingPayments: number
  recentSales: Array<{
    id: string
    clientName: string
    amount: number
    date: string
  }>
}

export const useDashboardMetrics = () => {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/metrics')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
```

#### **2.2 Atualizar Dashboard Page**
Modificar `src/app/dashboard/page.tsx`:

```typescript
'use client'

import { useDashboardMetrics } from '@/lib/hooks/use-dashboard'
import MetricCard from '@/components/MetricCard'
// ... outros imports

export default function Dashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Métricas Reais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas Hoje"
          value={`R$ ${metrics?.totalRevenue || 0}`}
          change="+12,5%"
          icon={DollarSign}
          color="bg-green-500"
          trend="up"
        />
        {/* ... outras métricas */}
      </div>

      {/* Gráfico Real */}
      <div className="bg-white rounded-xl p-6">
        <RevenueChart data={metrics?.salesData || []} />
      </div>
    </div>
  )
}
```

### **Fase 3: Conectar Gestão de Clientes**

#### **3.1 Criar Hook para Clientes**
Criar `src/lib/hooks/use-clients.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  totalSpent: number
  lastOrder: string
  status: 'active' | 'inactive'
}

export const useClients = (filters?: any) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      const response = await apiClient.get('/clients', { params: filters })
      return response.data.data
    },
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientData: Partial<Client>) =>
      apiClient.post('/clients', clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
```

#### **3.2 Atualizar Página de Clientes**
Modificar `src/app/clientes/page.tsx`:

```typescript
'use client'

import { useClients, useCreateClient } from '@/lib/hooks/use-clients'
// ... outros imports

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: clientsData, isLoading } = useClients({ search: searchTerm })
  const createClient = useCreateClient()

  const handleCreateClient = async (clientData: any) => {
    try {
      await createClient.mutateAsync(clientData)
      toast.success('Cliente criado com sucesso!')
    } catch (error) {
      toast.error('Erro ao criar cliente')
    }
  }

  if (isLoading) {
    return <div>Carregando clientes...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header com busca real */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Novo Cliente
        </button>
      </div>

      {/* Lista real de clientes */}
      <div className="bg-white rounded-xl shadow">
        {clientsData?.data?.map((client: Client) => (
          <div key={client.id} className="p-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-gray-600">{client.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">R$ {client.totalSpent}</p>
                <p className="text-sm text-gray-500">{client.lastOrder}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### **Fase 4: Configurar React Query**

#### **4.1 Criar Provider**
Criar `src/components/QueryProvider.tsx`:

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

#### **4.2 Atualizar Root Layout**
Modificar `src/app/layout.tsx`:

```typescript
import QueryProvider from '@/components/QueryProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>
          <Layout>{children}</Layout>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}
```

## 🧪 **Testes de Validação**

### **Teste 1: Autenticação**
```bash
# 1. Acessar /login
# 2. Tentar fazer login com credenciais válidas
# 3. Verificar se redireciona para /dashboard
# 4. Verificar se token foi salvo no localStorage
```

### **Teste 2: Dashboard**
```bash
# 1. Verificar se métricas carregam da API
# 2. Verificar se gráficos mostram dados reais
# 3. Testar atualização automática (React Query)
```

### **Teste 3: Clientes**
```bash
# 1. Verificar lista de clientes da API
# 2. Testar busca e filtros
# 3. Criar novo cliente
# 4. Verificar se lista atualiza
```

## 📋 **Checklist de Implementação**

### **Fase 1: Autenticação**
- [ ] Cliente API criado
- [ ] Store de auth implementado
- [ ] ProtectedRoute funcionando
- [ ] Login/logout testado

### **Fase 2: Dashboard**
- [ ] Hook de métricas criado
- [ ] Dashboard conectando à API
- [ ] Gráficos com dados reais
- [ ] Cache funcionando

### **Fase 3: Clientes**
- [ ] Hook de clientes implementado
- [ ] CRUD básico funcionando
- [ ] Busca e filtros ativos
- [ ] Estados de loading

### **Fase 4: Infraestrutura**
- [ ] React Query configurado
- [ ] Error handling implementado
- [ ] Loading states consistentes

## 🎯 **Benefícios Esperados**

- ✅ **Dados Reais**: Substituir mocks por dados reais
- ✅ **Performance**: Cache inteligente com React Query
- ✅ **UX**: Estados de loading e error apropriados
- ✅ **Manutenibilidade**: Separação clara entre UI e lógica
- ✅ **Escalabilidade**: Fácil adicionar novas funcionalidades

## 🔄 **Próximos Passos**

Após conectar o Flow App básico:
1. **Integrações Externas** - Coinzz, WhatsApp, Facebook
2. **Sistema de Pagamentos** - Assinaturas e webhooks
3. **Notificações** - Push e email
4. **Relatórios** - Geração automática

---

**Data:** 31 de outubro de 2025
**Prioridade:** 🔴 Crítica
**Tempo Estimado:** 1-2 semanas