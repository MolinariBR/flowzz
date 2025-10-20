# 🎛️ PAINEL ADMIN - DESIGN SPECIFICATION

## 📋 VISÃO GERAL

Sistema administrativo profissional para **Persona Ana (Administradora Flowzz)** - gestão completa do SaaS FlowZZ com foco em:
- **Story 7.1:** Dashboard com métricas SaaS (MRR, churn, usuários ativos)
- **Story 7.2:** Gestão de usuários (suspender/reativar, impersonation)
- **Jornada 7:** Admin - Gestão da Plataforma (plan.md)
- **Release 2.5:** Painel Admin (roadmap estratégico)

**Persona Ana Características:**
- Equipe interna Flowzz
- Responsável por gestão de usuários e plataforma  
- Precisa monitorar métricas SaaS (MRR, churn, saúde)
- Suporte proativo ao invés de reativo

---

## 🎨 DESIGN SYSTEM

### **Paleta de Cores**
```scss
// Primary (Brand)
primary: {
  50: '#eff6ff',
  100: '#dbeafe', 
  500: '#3b82f6',
  600: '#2563eb',
  900: '#1e3a8a'
}

// Admin Theme
admin: {
  sidebar: '#1f2937',     // Gray-800
  nav: '#374151',         // Gray-700
  background: '#f9fafb',  // Gray-50
  surface: '#ffffff',     // White
  border: '#e5e7eb'       // Gray-200
}

// Status Colors
success: '#10b981',  // Green-500
warning: '#f59e0b',  // Amber-500
danger: '#ef4444',   // Red-500
info: '#3b82f6'      // Blue-500
```

### **Typography**
```scss
font-family: 'Inter', system-ui, sans-serif

// Headings
h1: font-size: 2.25rem (36px), font-weight: 700
h2: font-size: 1.875rem (30px), font-weight: 600
h3: font-size: 1.5rem (24px), font-weight: 600
h4: font-size: 1.25rem (20px), font-weight: 500

// Body Text
body: font-size: 0.875rem (14px), font-weight: 400
small: font-size: 0.75rem (12px), font-weight: 400
```

### **Spacing & Layout**
```scss
// Container
max-width: 1440px
padding: 1.5rem (24px)

// Cards
border-radius: 0.75rem (12px)
padding: 1.5rem (24px)
shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

// Sidebar
width: 288px (18rem)
collapsed-width: 80px (5rem)
```

---

## 🏗️ ESTRUTURA DE LAYOUT

### **Layout Principal**
```
┌─────────────────────────────────────────────────────────────┐
│                      TopBar (64px)                          │
│  [☰] FlowZZ Admin              [🔔] [👤] Ana Santos        │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│   Sidebar   │            Main Content Area                  │
│   (288px)   │                                               │
│             │  ┌─ Breadcrumb ─────────────────────────────┐ │
│  📊 Dash    │  │ Admin > Dashboard > Métricas SaaS       │ │
│  📈 Metrics │  └─────────────────────────────────────────┘ │
│  👥 Users   │                                               │
│  ⚙️ Config  │  ┌─ Page Header ────────────────────────────┐ │
│  🔍 Audit   │  │ Dashboard Métricas                        │ │
│             │  │ [🔄 Sync] [📊 Export] [⚙️ Config]        │ │
│             │  └─────────────────────────────────────────┘ │
│             │                                               │
│             │  ┌─ Content ─────────────────────────────────┐ │
│             │  │                                           │ │
│             │  │  [KPI Cards] [Charts] [Tables]            │ │
│             │  │                                           │ │
│             │  └─────────────────────────────────────────┘ │
└─────────────┴───────────────────────────────────────────────┘
```

---

## 🧭 SIDEBAR NAVIGATION

### **Estrutura Hierárquica**
```typescript
interface NavItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  children?: NavItem[]
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN'
}

const navigation: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    key: 'metrics',
    label: 'Métricas SaaS',
    href: '/metrics',
    icon: TrendingUp,
    children: [
      { key: 'metrics-overview', label: 'Visão Geral', href: '/metrics', icon: BarChart3 },
      { key: 'metrics-revenue', label: 'Receita (MRR/ARR)', href: '/metrics/revenue', icon: DollarSign },
      { key: 'metrics-users', label: 'Usuários & Churn', href: '/metrics/users', icon: Users },
      { key: 'metrics-ltv', label: 'LTV & CAC', href: '/metrics/ltv-cac', icon: Target },
      { key: 'metrics-cohorts', label: 'Análise de Coortes', href: '/metrics/cohorts', icon: TrendingUp }
    ]
  },
  {
    key: 'users',
    label: 'Gestão de Usuários',
    href: '/users',
    icon: Users,
    badge: 3, // Tickets pendentes
    children: [
      { key: 'users-list', label: 'Lista de Usuários', href: '/users', icon: Users },
      { key: 'users-subscriptions', label: 'Assinaturas', href: '/users/subscriptions', icon: CreditCard },
      { key: 'users-support', label: 'Tickets Suporte', href: '/users/support', icon: MessageSquare },
      { key: 'users-impersonate', label: 'Acesso de Usuário', href: '/users/impersonate', icon: UserCheck }
    ]
  },
  {
    key: 'integrations',
    label: 'Integrações',
    href: '/integrations',
    icon: Zap,
    children: [
      { key: 'integrations-status', label: 'Status Geral', href: '/integrations', icon: Activity },
      { key: 'integrations-coinzz', label: 'Coinzz API', href: '/integrations/coinzz', icon: Coins },
      { key: 'integrations-facebook', label: 'Facebook Ads', href: '/integrations/facebook', icon: Facebook },
      { key: 'integrations-whatsapp', label: 'WhatsApp Business', href: '/integrations/whatsapp', icon: MessageCircle },
      { key: 'integrations-pagbank', label: 'PagBank', href: '/integrations/pagbank', icon: CreditCard }
    ]
  },
  {
    key: 'audit',
    label: 'Auditoria',
    href: '/audit',
    icon: Shield,
    requiredRole: 'SUPER_ADMIN',
    children: [
      { key: 'audit-logs', label: 'Logs do Sistema', href: '/audit/logs', icon: FileText },
      { key: 'audit-activities', label: 'Atividades Admin', href: '/audit/activities', icon: Clock },
      { key: 'audit-security', label: 'Eventos Segurança', href: '/audit/security', icon: ShieldAlert },
      { key: 'audit-performance', label: 'Performance', href: '/audit/performance', icon: Gauge }
    ]
  },
  {
    key: 'settings',
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
    children: [
      { key: 'settings-general', label: 'Geral', href: '/settings', icon: Settings },
      { key: 'settings-notifications', label: 'Notificações', href: '/settings/notifications', icon: Bell },
      { key: 'settings-billing', label: 'Cobrança', href: '/settings/billing', icon: CreditCard },
      { key: 'settings-admin', label: 'Administradores', href: '/settings/admin', icon: UserCog, requiredRole: 'SUPER_ADMIN' },
      { key: 'settings-backup', label: 'Backup & Recovery', href: '/settings/backup', icon: HardDrive, requiredRole: 'SUPER_ADMIN' }
    ]
  }
]
```

### **Estados da Sidebar**
```typescript
// Expanded (Desktop)
width: 288px
- Ícone + Label + Badge/Arrow
- Submenus visíveis quando expandidos
- Scroll vertical se necessário

// Collapsed (Mobile/Toggle)
width: 80px
- Apenas ícones
- Tooltips no hover
- Submenu em popover

// Mobile Overlay
- Fullscreen overlay
- Slide animation
- Backdrop blur
```

---

## 📊 DASHBOARD PRINCIPAL

### **Cards de Métricas (KPIs) - Story 7.1 Específicas**
```typescript
interface MetricCard {
  title: string
  value: string | number
  change: number // Percentage
  trend: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  color: 'success' | 'warning' | 'danger' | 'info'
}

// Layout Grid: 4 colunas desktop, 2 mobile (Story 7.1 específicas)
const kpiCards = [
  {
    title: 'Total Usuários',
    value: '247',
    change: +23,
    trend: 'up',
    icon: Users,
    color: 'info'
  },
  {
    title: 'Usuários Ativos (30d)',
    value: '198 (80%)',
    change: +8.7,
    trend: 'up',
    icon: UserCheck,
    color: 'success'
  },
  {
    title: 'MRR (Monthly Recurring Revenue)',
    value: 'R$ 18.450',
    change: +12.5,
    trend: 'up',
    icon: DollarSign,
    color: 'success'
  },
  {
    title: 'Churn Rate',
    value: '4,2%',
    change: -0.8,
    trend: 'down', // Good (lower is better)
    icon: UserMinus,
    color: 'success'
  },
  {
    title: 'Novas Assinaturas (Mês)',
    value: '23',
    change: +18.2,
    trend: 'up',
    icon: UserPlus,
    color: 'success'
  },
  {
    title: 'Cancelamentos (Mês)',
    value: '5',
    change: -12.1,
    trend: 'down', // Good (lower is better)
    icon: UserX,
    color: 'success'
  },
  {
    title: 'Tickets Abertos',
    value: '12',
    change: +15.0,
    trend: 'up',
    icon: MessageSquare,
    color: 'warning'
  },
  {
    title: 'ARR (Annual Recurring Revenue)', 
    value: 'R$ 221.400',
    change: +18.2,
    trend: 'up',
    icon: TrendingUp,
    color: 'success'
  }
]
```

### **Gráficos Interativos (Recharts)**
```typescript
// 1. Gráfico de Crescimento de Usuários (12 meses) - Story 7.1
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={userGrowthData}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip formatter={(value) => `${value} usuários`} />
    <Legend />
    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} />
  </LineChart>
</ResponsiveContainer>

// 2. Gráfico de Receita Mensal - Story 7.1
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={revenueData}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
    <Area type="monotone" dataKey="revenue" fill="#10b981" />
  </AreaChart>
</ResponsiveContainer>

// 3. Distribuição de Planos (Pizza) - Story 7.1
<ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={planDistribution}
      cx="50%"
      cy="50%"
      outerRadius={80}
      fill="#3b82f6"
      dataKey="users"
      label={({ name, percentage }) => `${name}: ${percentage}%`}
    />
    <Tooltip />
  </PieChart>
</ResponsiveContainer>

// 4. Drill-down em Churn Rate - Story 7.1
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={churnData}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="churnedUsers" fill="#ef4444" />
    <Bar dataKey="newUsers" fill="#10b981" />
  </BarChart>
</ResponsiveContainer>
```

---

## 👥 GESTÃO DE USUÁRIOS - STORY 7.2

### **Tabela de Usuários (TanStack Table)**
```typescript
interface User {
  id: string
  name: string
  email: string
  plan: 'trial' | 'basic' | 'pro' | 'premium'
  status: 'active' | 'suspended' | 'cancelled'  // Story 7.2: Suspender/Reativar
  trialEndsAt?: Date
  mrr: number
  lastLogin: Date
  signupDate: Date
  suspensionHistory: SuspensionRecord[]  // Story 7.2: Histórico de suspensões
  integrations: {
    coinzz: boolean
    facebook: boolean
    whatsapp: boolean
  }
}

// Story 7.2 específico
interface SuspensionRecord {
  id: string
  suspended_at: Date
  reactivated_at?: Date
  reason: string
  admin_id: string
  admin_name: string
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Usuário',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.original.avatar} name={row.original.name} />
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-gray-500">{row.original.email}</p>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'plan',
    header: 'Plano',
    cell: ({ row }) => (
      <Chip 
        color={planColors[row.original.plan]} 
        variant="flat"
      >
        {planLabels[row.original.plan]}
      </Chip>
    )
  },
  {
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }) => (
      <Chip 
        color={statusColors[row.original.status]}
        variant="dot"
      >
        {statusLabels[row.original.status]}
      </Chip>
    )
  },
  {
    accessorKey: 'mrr',
    header: 'MRR',
    cell: ({ row }) => `R$ ${row.original.mrr.toLocaleString()}`
  },
  {
    accessorKey: 'lastLogin',
    header: 'Último Login',
    cell: ({ row }) => formatDistanceToNow(row.original.lastLogin, { locale: ptBR })
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="light">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onClick={() => viewUser(row.original.id)}>
            <Eye className="w-4 h-4" /> Ver Detalhes
          </DropdownItem>
          <DropdownItem onClick={() => impersonateUser(row.original.id)}>
            <UserCheck className="w-4 h-4" /> Acessar como Usuário
          </DropdownItem>
          <DropdownItem onClick={() => viewUserLogs(row.original.id)}>
            <FileText className="w-4 h-4" /> Ver Logs
          </DropdownItem>
          {row.original.status === 'active' ? (
            <DropdownItem 
              color="warning"
              onClick={() => suspendUser(row.original.id)}
            >
              <UserX className="w-4 h-4" /> Suspender Conta
            </DropdownItem>
          ) : (
            <DropdownItem 
              color="success"
              onClick={() => reactivateUser(row.original.id)}
            >
              <UserCheck className="w-4 h-4" /> Reativar Conta
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    )
  }
]

// Filtros avançados
const filters = [
  {
    key: 'plan',
    label: 'Plano',
    options: ['trial', 'basic', 'pro', 'premium']
  },
  {
    key: 'status',
    label: 'Status', 
    options: ['active', 'suspended', 'cancelled']
  },
  {
    key: 'lastLogin',
    label: 'Último Login',
    options: ['today', 'week', 'month', 'never']
  }
]
```

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### **Alert Center (TopBar)**
```typescript
interface Notification {
  id: string
  type: 'info' | 'warning' | 'danger' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

const notifications = [
  {
    type: 'danger',
    title: 'Churn Rate Alto',
    message: 'Taxa de churn subiu para 8.5% (acima da meta de 7%)',
    timestamp: new Date(),
    actionUrl: '/metrics/users',
    actionLabel: 'Ver Análise'
  },
  {
    type: 'warning', 
    title: 'Integração Facebook Falhou',
    message: '3 usuários com erro de sincronização Facebook Ads',
    timestamp: subMinutes(new Date(), 15),
    actionUrl: '/integrations/facebook',
    actionLabel: 'Verificar'
  },
  {
    type: 'info',
    title: 'Novo Usuário Premium',
    message: 'João Silva upgradou para plano Premium (+R$ 99/mês)',
    timestamp: subHours(new Date(), 2),
    actionUrl: '/users?filter=premium',
    actionLabel: 'Ver Usuário'
  }
]
```

### **Real-time Updates**
```typescript
// WebSocket connection para updates em tempo real
const useRealtimeNotifications = () => {
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/admin/notifications`)
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      toast.success(notification.title, {
        description: notification.message,
        action: notification.actionUrl ? {
          label: notification.actionLabel,
          onClick: () => router.push(notification.actionUrl)
        } : undefined
      })
    }
    
    return () => ws.close()
  }, [])
}
```

---

## 🔧 STACK TÉCNICO

### **Estrutura de Pastas Admin (design.md)**
```
/admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/          # Dashboard métricas SaaS
│   │   │   ├── users/             # Gestão usuários (Story 7.2)
│   │   │   ├── metrics/           # Métricas detalhadas
│   │   │   ├── integrations/      # Status integrações
│   │   │   ├── audit/             # Logs auditoria
│   │   │   └── layout.tsx (sidebar + nav)
│   │   ├── globals.css
│   │   └── layout.tsx (root)
│   ├── components/
│   │   ├── ui/ (HeroUI wrappers)
│   │   ├── forms/ (admin forms)
│   │   ├── layout/ (sidebar, nav, breadcrumb)
│   │   └── charts/ (métricas SaaS)
│   ├── lib/
│   │   ├── api/ (admin endpoints)
│   │   ├── hooks/ (admin hooks)
│   │   ├── utils/ (helpers)
│   │   └── auth/ (JWT validation)
│   ├── providers/
│   │   ├── providers.tsx (HeroUI + TanStack)
│   │   ├── auth-provider.tsx
│   │   └── theme-provider.tsx
│   └── types/
│       ├── admin.ts
│       ├── metrics.ts
│       └── api.ts
├── tailwind.config.ts (tema admin)
├── next.config.ts
└── package.json
```

### **Endpoints Admin (Backend Integration)**
```typescript
// Métricas SaaS (Story 7.1 - user-stories.md)
GET /admin/metrics
{
  total_users: 247,              // Total usuários
  active_users_30d: 198,         // Usuários ativos (30d): 80%
  mrr: 18450,                    // MRR: R$ 18.450
  churn_rate: 4.2,               // Churn rate: 4,2%
  new_subscriptions_month: 23,   // Novas assinaturas (mês)
  cancellations_month: 5,        // Cancelamentos (mês)
  tickets_open: 12,              // Tickets abertos
  arr: 221400,
  ltv: 2840,
  cac: 285
}

GET /admin/users/growth?period=12  // Gráfico crescimento usuários (12 meses)
[
  { month: '2024-01', users: 45 },
  { month: '2024-02', users: 67 },
  // ... 12 meses
]

GET /admin/revenue?period=12  // Gráfico receita mensal
[
  { month: '2024-01', revenue: 12450 },
  { month: '2024-02', revenue: 15630 },
  // ... 12 meses
]

// Gestão de Usuários (Story 7.2 - user-stories.md)
GET /admin/users?page=1&search=&plan=&status=
POST /admin/users/{id}/suspend      // Suspender usuário
POST /admin/users/{id}/reactivate   // Reativar após pagamento
POST /admin/users/{id}/impersonate  // Fazer login como usuário
GET /admin/users/{id}/logs          // Histórico de atividades

// Integrações e Auditoria (openapi.yaml)
GET /admin/integrations/status      // Status global das integrações
GET /admin/audit-logs              // Logs de auditoria
```

### **State Management Admin (Zustand)**
```typescript
// Admin Store (design.md específico)
interface AdminState {
  metrics: AdminMetrics | null
  users: User[]
  selectedUser: User | null
  loading: boolean
  
  // Actions (Story 7.1 e 7.2)
  fetchMetrics: () => Promise<void>
  fetchUsers: (filters: UserFilters) => Promise<void>
  suspendUser: (userId: string) => Promise<void>        // Story 7.2
  reactivateUser: (userId: string) => Promise<void>     // Story 7.2
  impersonateUser: (userId: string) => Promise<string>  // Returns token
  fetchUserLogs: (userId: string) => Promise<AuditLog[]>
  fetchIntegrationStatus: () => Promise<IntegrationStatus[]>
}

// Auth Store (design.md específico)
interface AuthState {
  user: AdminUser | null
  token: string | null
  role: 'ADMIN' | 'SUPER_ADMIN' | null
  
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  validateToken: () => Promise<boolean>
  checkRole: (requiredRole: string[]) => boolean
}

// Types específicos (design.md)
interface AdminMetrics {
  total_users: number
  active_users_30d: number
  mrr: number
  churn_rate: number
  new_subscriptions_month: number
  cancellations_month: number
  tickets_open: number
  arr: number
  ltv: number
  cac: number
}

interface AdminUser {
  id: string
  email: string
  nome: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  created_at: Date
}
```

### **Autenticação & Autorização Admin**
```typescript
// Login Flow (design.md específico)
1. POST /auth/admin/login
   { email: 'admin@flowzz.com.br', password: 'admin123456' }
   
2. Response:
   {
     user: { id, email, nome, role: 'ADMIN' },
     accessToken: 'jwt-token',
     refreshToken: 'refresh-token'
   }
   
3. Store tokens + redirect to /admin/dashboard

// Route Protection
<AdminLayout>
  <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
    <DashboardPage />
  </RoleGuard>
</AdminLayout>

// API Integration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

### **Principais Dependências**
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "@heroui/react": "^2.4.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.0.0"
  }
}
```

---

## 🎯 COMPONENTES ESPECIALIZADOS

### **MetricCard Component**
```typescript
interface MetricCardProps {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  color: 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({
  title, value, change, trend, icon: Icon, color, loading
}) => {
  const trendColor = trend === 'up' ? 'text-green-600' : 
                     trend === 'down' ? 'text-red-600' : 'text-gray-600'
  
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <Skeleton className="h-8 w-20" /> : value}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          {trend === 'up' && <TrendingUp className="w-4 h-4" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>
    </Card>
  )
}
```

### **DataTable Component**
```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  searchPlaceholder?: string
  filters?: FilterConfig[]
  pagination?: boolean
  sorting?: boolean
  loading?: boolean
}

const DataTable = <TData,>({ 
  columns, data, searchPlaceholder, filters, pagination = true, loading 
}: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
  })

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
          startContent={<Search className="w-4 h-4" />}
        />
        
        {filters && (
          <div className="flex gap-2">
            {filters.map(filter => (
              <Select key={filter.key} placeholder={filter.label}>
                {filter.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </Select>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {pagination && (
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-600">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} de{' '}
              {table.getFilteredRowModel().rows.length} resultados
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
```

---

## 📱 RESPONSIVIDADE

### **Breakpoints**
```scss
// Mobile First
sm: 640px   // Mobile landscape / Small tablet
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### **Layout Adaptativo**
```typescript
// Desktop (lg+)
- Sidebar sempre visível (288px)
- Grid de métricas: 4 colunas
- Tabelas: todas as colunas visíveis

// Tablet (md)
- Sidebar collapsible
- Grid de métricas: 2 colunas
- Tabelas: colunas importantes apenas

// Mobile (sm)
- Sidebar overlay
- Grid de métricas: 1 coluna
- Tabelas: modo cards
- Navegação bottom-sheet
```

---

## 🎯 FEATURES PRINCIPAIS

### **Dashboard Métricas SaaS (Story 7.1)**
- ✅ Cards KPIs específicos (Total usuários, Usuários ativos 30d, MRR, Churn rate, Novas assinaturas, Cancelamentos, Tickets abertos)
- ✅ Gráfico crescimento usuários (12 meses)
- ✅ Gráfico receita mensal
- ✅ Distribuição de planos (pizza)
- ✅ Drill-down em métricas (ex: churn rate → lista usuários cancelados)
- ✅ Comparação com mês anterior
- ✅ Alertas automáticos (churn > 7%)

### **Gestão de Usuários (Story 7.2)**
- ✅ Lista/busca/filtros avançados
- ✅ Suspender usuário (bloqueia login imediatamente)
- ✅ Reativar usuário (após pagamento regularizado)
- ✅ Impersonation (acessar como usuário)
- ✅ Histórico de suspensões registrado
- ✅ Emails automáticos (suspensão/reativação)
- ✅ Ver logs de atividades

### **Monitoramento Integrações**
- ✅ Status em tempo real (Coinzz, Facebook, WhatsApp, PagBank)
- ✅ Logs de erros e sincronização
- ✅ Health checks automáticos
- ✅ Alertas de falhas

### **Sistema de Auditoria**
- ✅ Logs de sistema
- ✅ Atividades administrativas
- ✅ Eventos de segurança
- ✅ Performance monitoring

### **Alertas & Notificações**
- ✅ Real-time via WebSocket
- ✅ Centro de notificações
- ✅ Alertas configuráveis (churn > 7%, integrações falham)
- ✅ Email notifications

---

## 🚀 PERFORMANCE & OTIMIZAÇÕES

### **Caching Strategy**
- ✅ TanStack Query: 1h cache para métricas
- ✅ Incremental regeneration para páginas estáticas
- ✅ Image optimization automática
- ✅ Code splitting por rota

### **Loading States**
- ✅ Skeleton components
- ✅ Progressive loading
- ✅ Optimistic updates
- ✅ Error boundaries

### **Acessibilidade**
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode

---

## 📅 ROADMAP & CONTEXT

### **Release 2.5 - Painel Admin (plan.md)**
- **Foco:** Stories 7.1 e 7.2 completas
- **Persona:** Ana - Administradora Flowzz
- **Jornada:** 7 - Admin - Gestão da Plataforma
- **Critério de Sucesso:**
  - Tempo resposta ticket < 2h
  - Visibilidade completa de usuários  
  - Health check > 99%

Este design specification garante um painel administrativo profissional, escalável e **100% alinhado** com as necessidades específicas da **Persona Ana** e **Stories 7.1/7.2** definidas na documentação estratégica do SaaS FlowZZ.