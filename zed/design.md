# 🏗️ DESIGN SPECIFICATION - FLOWZZ PLATFORM

## 📐 ARQUITETURA GERAL

### Visão Macro
```
┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO                   │
├──────────────────┬──────────────────┬──────────────────────┤
│  Landing Page    │  App Cliente     │   Painel Admin       │
│  (Marketing)     │  (SaaS)          │   (Gestão)           │
│  Next.js SSG     │  Next.js SSR     │   Next.js SSR        │
│  ✅ Captar leads │  ✅ Dashboard    │   🚧 Métricas SaaS   │
│  ✅ SEO          │  ✅ Clientes     │   🚧 Gestão Users    │
│  ✅ Conversão    │  ✅ Relatórios   │   🚧 Admin Panel     │
└────────┬─────────┴────────┬─────────┴──────────┬───────────┘
         │                  │                    │
         └──────────────────┴────────────────────┘
                            │
                ┌───────────▼───────────┐
                │    API Gateway        │
                │  (Rate Limiting)      │
                └───────────┬───────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐
│  Auth Service   │ │  Core API   │  │  Integrations  │
│  (JWT/OAuth)    │ │  (REST)     │  │   Service      │
└─────────────────┘ └──────┬──────┘  └────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼──────┐ ┌──▼────┐ ┌────▼─────────┐
     │  PostgreSQL   │ │ Redis │ │ Bull Queues  │
     │  (Prisma)     │ │(Cache)│ │(Background)  │
     └───────────────┘ └───────┘ └──────────────┘
```

---

## 🛠️ STACK TECNOLÓGICA DETALHADA

### **Frontend Multi-App Architecture**

#### 🎯 **Três Aplicações Separadas**

##### 1. Landing Page (Marketing) - `/landing/`
```typescript
- Next.js 14+ (App Router) - SSG
  ✅ SEO otimizado para captação
  ✅ Performance máxima (Static)
  ✅ Conversão de leads
  
- Stack:
  ✅ HeroUI + Tailwind CSS
  ✅ Framer Motion (animações)
  ✅ React Hook Form + Zod
  ✅ Vercel/Netlify deployment
```

##### 2. App Cliente (SaaS) - `/flow/`
```typescript
- Next.js 14+ (App Router) - SSR
  ✅ Dashboard financeiro
  ✅ Gestão de clientes
  ✅ Relatórios e analytics
  ✅ Integrações (Coinzz, Facebook, WhatsApp)
  
- Stack Completo:
  ✅ HeroUI v2.4+ (componentes acessíveis)
  ✅ Tailwind CSS 3.4+ (styling)
  ✅ Zustand (state management)
  ✅ TanStack Query (data fetching)
  ✅ React Hook Form + Zod (forms)
  ✅ Recharts (visualizações)
  ✅ TanStack Table (tabelas)
  
- IMPORTANTE: ❌ NÃO MODIFICAR (já implementado)
```

##### 3. Painel Admin (Gestão) - `/admin/`
```typescript
- Next.js 14+ (App Router) - SSR
  ✅ Dashboard métricas SaaS (MRR, ARR, Churn, LTV, CAC)
  ✅ Gestão de usuários (CRUD, suspend, impersonate)
  ✅ Monitoramento de integrações
  ✅ Sistema de auditoria
  ✅ Alertas e notificações
  
- Stack Específico Admin:
  ✅ HeroUI v2.4+ (consistência visual)
  ✅ Tailwind CSS (tema admin customizado)
  ✅ Zustand (admin state)
  ✅ TanStack Query (cache métricas 1h)
  ✅ Recharts (gráficos SaaS)
  ✅ Lucide React (ícones)
  ✅ Framer Motion (transições)
  
- Autenticação:
  ✅ JWT validation
  ✅ Role-based access (ADMIN, SUPER_ADMIN)
  ✅ Session management
  ✅ Logout automático
```

#### Framework Base Unificado
```typescript
- Next.js 14.2+ (App Router)
  ✅ Razão: SSR/SSG, API Routes, SEO otimizado
  ✅ Permite 3 apps independentes
  ✅ Image optimization nativa
  ✅ Bundle splitting automático
  ✅ Shared components library
```

#### UI Components
```typescript
- HeroUI v2.4+ ou Shadcn/UI
  ✅ Razão: Componentes acessíveis (WCAG 2.1)
  ✅ Tema dark/light nativo
  ✅ Customização fácil com Tailwind
  ✅ TypeScript first-class
```

#### Styling
```typescript
- Tailwind CSS 3.4+
  ✅ Utility-first para velocidade
  ✅ PurgeCSS para bundle pequeno
  ✅ Responsive design simplificado
```

#### State Management
```typescript
- Zustand (leve) ou Jotai (atômico)
  ✅ Razão: Simples, sem boilerplate
  ✅ DevTools integradas
  ✅ Persistence automática
  ❌ Evitar Redux (overkill para SaaS)
```

#### Data Fetching
```typescript
- TanStack Query (React Query) v5+
  ✅ Cache inteligente
  ✅ Invalidation automática
  ✅ Retry e error handling
  ✅ Optimistic updates
```

#### Forms & Validation
```typescript
- React Hook Form + Zod
  ✅ Performance (uncontrolled components)
  ✅ Type-safe validation
  ✅ Integração com Zod schemas
```

#### Charts & Visualizations
```typescript
- Recharts (declarativo)
  ✅ Razão: React-first, responsivo
  ✅ Animações suaves
  ✅ Acessível
  
- Alternativa: Chart.js + react-chartjs-2
  ✅ Mais leve, performance superior
```

---

## 👨‍💼 PAINEL ADMIN - ARQUITETURA ESPECÍFICA

### **Estrutura de Pastas Admin**
```
admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── metrics/
│   │   │   ├── integrations/
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
// Métricas SaaS (Story 7.1)
GET /admin/metrics
{
  mrr: 18450,
  arr: 221400,
  churn_rate: 4.2,
  ltv: 2840,
  cac: 285,
  total_users: 247,
  active_users_30d: 198,
  new_subscriptions_month: 23,
  cancellations_month: 5,
  tickets_open: 12
}

GET /admin/users/growth?period=12
[
  { month: '2024-01', users: 45 },
  { month: '2024-02', users: 67 },
  // ... 12 meses
]

GET /admin/revenue?period=12
[
  { month: '2024-01', revenue: 12450 },
  { month: '2024-02', revenue: 15630 },
  // ... 12 meses
]

// Gestão de Usuários (Story 7.2)
GET /admin/users?page=1&search=&plan=&status=
POST /admin/users/:id/suspend
POST /admin/users/:id/reactivate
POST /admin/users/:id/impersonate
GET /admin/users/:id/logs
```

### **Componentes Admin Específicos**
```typescript
// Dashboard Métricas
<MetricsGrid>
  <MetricCard title="MRR" value="R$ 18.450" change="+12%" />
  <MetricCard title="Churn Rate" value="4,2%" change="-0.8%" />
  <MetricCard title="Total Users" value="247" change="+23" />
</MetricsGrid>

<ChartsGrid>
  <GrowthChart data={userGrowth} />
  <RevenueChart data={revenue} />
  <PlanDistribution data={plans} />
</ChartsGrid>

// Gestão de Usuários
<UsersTable 
  data={users}
  onSuspend={handleSuspend}
  onImpersonate={handleImpersonate}
  pagination={{ page: 1, total: 247 }}
/>

<UserActions>
  <Button onClick={suspendUser}>Suspender</Button>
  <Button onClick={impersonateUser}>Impersonar</Button>
  <Button onClick={viewLogs}>Ver Logs</Button>
</UserActions>
```

### **State Management Admin**
```typescript
// Admin Store (Zustand)
interface AdminState {
  metrics: AdminMetrics | null
  users: User[]
  selectedUser: User | null
  loading: boolean
  
  // Actions
  fetchMetrics: () => Promise<void>
  fetchUsers: (filters: UserFilters) => Promise<void>
  suspendUser: (userId: string) => Promise<void>
  impersonateUser: (userId: string) => Promise<string> // returns token
}

// Auth Store
interface AuthState {
  user: AdminUser | null
  token: string | null
  role: 'ADMIN' | 'SUPER_ADMIN' | null
  
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  validateToken: () => Promise<boolean>
}
```

### **Autenticação & Autorização Admin**
```typescript
// Login Flow
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

### **Design System Admin**
```typescript
// Tema Admin (Tailwind Config)
theme: {
  extend: {
    colors: {
      // Admin brand colors
      admin: {
        50: '#f0f9ff',
        500: '#3b82f6',
        600: '#2563eb',
        900: '#1e3a8a'
      },
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6'
    }
  }
}

// Layout Responsivo
<AdminShell>
  <Sidebar collapsed={isMobile} />
  <MainContent>
    <TopNav user={adminUser} />
    <Breadcrumb />
    <PageContent />
  </MainContent>
</AdminShell>
```

#### Tables
```typescript
- TanStack Table (React Table) v8+
  ✅ Headless UI
  ✅ Sorting, filtering, pagination nativo
  ✅ Virtual scrolling para 1000+ rows
```

---

### **Backend (API)**

#### Runtime & Framework
```typescript
- Node.js 20 LTS + TypeScript 5.3+
  ✅ Razão: Ecossistema maduro, SDKs disponíveis
  ✅ Single language (TS frontend/backend)
  
- Express.js 4.19+ ou Fastify 4.26+
  ✅ Express: Mais SDKs, middlewares prontos
  ✅ Fastify: 2x mais rápido, schema validation nativo
  
  Decisão: Express (familiaridade e integrações)
```

#### ORM & Database Access
```typescript
- Prisma ORM 5.10+
  ✅ Type-safe queries
  ✅ Migrations automáticas
  ✅ Studio para debug visual
  ✅ Suporta PostgreSQL avançado (JSONB, índices)
```

#### Authentication
```typescript
- JWT (jsonwebtoken)
  ✅ Stateless, escalável
  ✅ Refresh tokens para segurança
  
- bcrypt para hash de senhas
  ✅ Rounds: 12 (equilíbrio segurança/performance)
  
- OAuth 2.0 para integrações externas
  ✅ Facebook, Google (futuro)
```

#### Validation
```typescript
- Zod
  ✅ Compartilhado com frontend
  ✅ Type inference automática
  ✅ Custom error messages
```

#### File Upload & Storage
```typescript
- Multer (middleware Express)
  ✅ CSV imports, avatares
  
- AWS S3 ou Cloudflare R2
  ✅ Armazenamento de relatórios, avatares
  ✅ CDN integrado
```

#### Background Jobs
```typescript
- Bull + Redis
  ✅ Filas confiáveis
  ✅ Retry automático
  ✅ Cron jobs (sync Coinzz, Facebook)
  ✅ Dashboard visual (Bull Board)
```

#### API Documentation
```typescript
- OpenAPI 3.0 (Swagger)
  ✅ Auto-gerado com express-openapi
  ✅ Swagger UI para testes
  ✅ Cliente SDK gerado automaticamente
```

---

### **Database**

#### Primary Database
```typescript
- PostgreSQL 16+
  ✅ Razão: Relacional robusto
  ✅ JSONB para dados flexíveis (integrations config)
  ✅ Full-text search nativo
  ✅ Índices GIN/GIST para performance
  ✅ Row-level security para multi-tenancy
```

#### Schema Design Principles
```sql
-- Multi-tenancy via user_id FK
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  valor_pedido DECIMAL(10,2),
  status VARCHAR(50) CHECK (status IN ('pendente','pago','entregue','cancelado')),
  data_cadastro TIMESTAMP DEFAULT NOW(),
  CONSTRAINT clients_user_idx UNIQUE (user_id, email)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_data_cadastro ON clients(data_cadastro);
```

#### Cache Layer
```typescript
- Redis 7+
  ✅ Cache de queries frequentes (dashboard metrics)
  ✅ Rate limiting distribuído
  ✅ Session store
  ✅ Bull queues storage
  
  TTL Strategy:
  - Dashboard metrics: 5 min
  - User profile: 1 hora
  - API responses: 10 min
```

---

### **External Integrations**

#### Coinzz API (CRÍTICO)
```typescript
Interface: REST API (a confirmar) ou Scraping autorizado
Autenticação: API Key ou OAuth
Sync Frequency: A cada 1 hora (cron job)
Endpoints Necessários:
- GET /sales (últimas vendas)
- GET /clients (dados de clientes)
- Webhook /delivery-status (entregas)

Cache Strategy:
- Cache últimas 1000 vendas por 1h
- Invalidar cache em webhook delivery
```

#### Facebook Ads Marketing API
```typescript
SDK: facebook-nodejs-business-sdk
Autenticação: OAuth 2.0
Permissões: ads_read, ads_management
Sync Frequency: A cada 6 horas

Endpoints Principais:
- GET /{ad-account-id}/insights
  Params: date_preset=last_30d, fields=spend,impressions,clicks,ctr,cpc
  
- GET /{ad-account-id}/campaigns
  Fields: name, status, daily_budget, lifetime_budget

Rate Limiting:
- 200 calls/hora (conservador)
- Implementar exponential backoff
```

#### WhatsApp Business Cloud API
```typescript
SDK: whatsapp-business-sdk (oficial Meta)
Autenticação: Access Token + Phone Number ID
Templates: Pré-aprovados pela Meta

Templates Necessários:
1. delivery_notification
   "🎉 Cliente {{1}} recebeu o produto! Valor: R$ {{2}}"
   
2. payment_reminder
   "Olá {{1}}! Seu pagamento de R$ {{2}} vence amanhã ({{3}})."

Limites por Plano:
- Basic: 50 mensagens/mês
- Pro: 200 mensagens/mês
- Premium: Ilimitado

Custo Médio: R$ 0,40-0,80 por conversa (Brasil)
```

#### PagBank API (Pagamentos)
```typescript
SDK: pagseguro-nodejs-sdk
Autenticação: API Key + Secret

Funcionalidades:
1. Assinaturas Recorrentes
   - POST /subscriptions
   - Planos: Basic, Pro, Premium
   - Trial: 7 dias sem cobrança
   
2. Webhooks
   - /webhook/payment-confirmed
   - /webhook/payment-failed
   - /webhook/subscription-cancelled

3. Métodos de Pagamento
   - Cartão de crédito (primary)
   - PIX (futuro)
   - Boleto (futuro)
```

---

## 📊 PADRÕES ARQUITETURAIS

### **Domain-Driven Design (DDD)**

#### Bounded Contexts
```
1. User Management (Autenticação, Perfil)
2. Financial (Vendas, Despesas, Projeções)
3. Client Management (Clientes, Etiquetas)
4. Ads Management (Campanhas, Métricas)
5. Integration (Coinzz, Facebook, WhatsApp)
6. Reporting (Geração, Templates)
7. Billing (Assinaturas, Pagamentos)
```

#### Aggregates
```typescript
// Aggregate Root: User
class User {
  id: UUID
  subscription: Subscription // Value Object
  preferences: UserPreferences // Value Object
  integrations: Integration[] // Entities
}

// Aggregate Root: Client
class Client {
  id: UUID
  userId: UUID // FK para User
  tags: Tag[] // Entities
  sales: Sale[] // Entities
}
```

### **Clean Architecture (Layers)**

```
┌─────────────────────────────────────────┐
│  Presentation Layer (Controllers)      │
│  - Express Routes                       │
│  - Request/Response DTOs                │
│  - Validation (Zod)                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Application Layer (Use Cases)          │
│  - Business Logic                       │
│  - Orchestration                        │
│  - Transaction Management               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Domain Layer (Entities)                │
│  - Business Rules                       │
│  - Domain Events                        │
│  - Aggregates                           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Infrastructure Layer                   │
│  - Database (Prisma)                    │
│  - External APIs (Coinzz, Facebook)     │
│  - Cache (Redis)                        │
└─────────────────────────────────────────┘
```

### **Repository Pattern**
```typescript
// Interface (Domain Layer)
interface IClientRepository {
  findById(id: string): Promise<Client | null>
  findByUserId(userId: string): Promise<Client[]>
  create(client: Client): Promise<Client>
  update(id: string, data: Partial<Client>): Promise<Client>
  delete(id: string): Promise<void>
}

// Implementation (Infrastructure Layer)
class PrismaClientRepository implements IClientRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({ where: { id } })
  }
  // ... outros métodos
}
```

---

## 🔒 SEGURANÇA

### **Authentication Flow**
```typescript
1. Login:
   POST /auth/login { email, password }
   → Valida credenciais (bcrypt compare)
   → Gera Access Token JWT (exp: 15min)
   → Gera Refresh Token (exp: 7 dias, salvo no DB)
   → Retorna { accessToken, refreshToken, user }

2. Requests Autenticados:
   Authorization: Bearer {accessToken}
   → Middleware valida JWT
   → Extrai userId do payload
   → Injeta req.user

3. Refresh:
   POST /auth/refresh { refreshToken }
   → Valida refresh token no DB
   → Gera novo access token
   → Retorna { accessToken }

4. Logout:
   POST /auth/logout { refreshToken }
   → Invalida refresh token no DB
```

### **Authorization (RBAC) + Admin Security**
```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Backend Middleware
const authorize = (roles: Role[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

// Admin Endpoints Protection
router.get('/admin/metrics', authorize([Role.ADMIN, Role.SUPER_ADMIN]), getMetricsController)
router.get('/admin/users', authorize([Role.ADMIN, Role.SUPER_ADMIN]), getUsersController)
router.post('/admin/users/:id/suspend', authorize([Role.ADMIN, Role.SUPER_ADMIN]), suspendUserController)
router.post('/admin/users/:id/impersonate', authorize([Role.SUPER_ADMIN]), impersonateController) // Apenas SUPER_ADMIN

// Frontend Route Guards
const RoleGuard = ({ children, allowedRoles, fallback }) => {
  const { user } = useAuth()
  
  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <AccessDenied />
  }
  
  return children
}

// Usage in Admin App
<RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
  <AdminDashboard />
</RoleGuard>

<RoleGuard allowedRoles={['SUPER_ADMIN']} fallback={<div>Acesso negado</div>}>
  <UserImpersonation />
</RoleGuard>
```

### **Admin Session Security**
```typescript
// Token refresh automático
const useTokenRefresh = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refreshToken()
      } catch (error) {
        // Redirect to login
        router.push('/admin/login')
      }
    }, 14 * 60 * 1000) // Refresh a cada 14 min (token expira em 15)
    
    return () => clearInterval(interval)
  }, [])
}

// Logout automático por inatividade
const useInactivityLogout = (timeoutMs = 30 * 60 * 1000) => {
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const resetTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        logout()
        router.push('/admin/login?reason=timeout')
      }, timeoutMs)
    }
    
    // Reset timeout em qualquer atividade
    document.addEventListener('mousedown', resetTimeout)
    document.addEventListener('keydown', resetTimeout)
    
    resetTimeout() // Initial timeout
    
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', resetTimeout)
      document.removeEventListener('keydown', resetTimeout)
    }
  }, [])
}

// Audit Log para ações admin
const logAdminAction = async (action: string, targetUserId?: string, details?: any) => {
  await apiClient.post('/admin/audit-logs', {
    action,
    target_user_id: targetUserId,
    details,
    timestamp: new Date().toISOString(),
    ip_address: await getClientIP()
  })
}

// Usage
const suspendUser = async (userId: string) => {
  await apiClient.post(`/admin/users/${userId}/suspend`)
  await logAdminAction('USER_SUSPENDED', userId, { reason: 'payment_overdue' })
}
```

### **Rate Limiting**
```typescript
// express-rate-limit + Redis
const limiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: 'Too many requests, please try again later.'
})

app.use('/api/', limiter)

// Limites específicos
app.use('/api/reports/generate', rateLimit({ max: 10, windowMs: 60*60*1000 }))
```

### **Input Sanitization**
```typescript
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'

app.use(helmet()) // Headers de segurança
app.use(mongoSanitize()) // Remove $ e . de inputs
app.use(express.json({ limit: '10mb' })) // Limit payload size
```

---

## 📈 PERFORMANCE & SCALABILITY

### **Caching Strategy**
```typescript
// Cache layers
1. CDN (Cloudflare)
   - Static assets (imagens, JS, CSS)
   - Landing page (SSG)
   
2. Redis (Application Cache)
   - Dashboard metrics (5 min)
   - User profile (1h)
   - API responses (10 min)
   
3. Database Query Cache
   - Prisma query cache
   - Materialized views para analytics
```

### **Database Optimization**
```sql
-- Índices estratégicos
CREATE INDEX CONCURRENTLY idx_sales_user_date 
  ON sales(user_id, data_venda DESC);

CREATE INDEX CONCURRENTLY idx_clients_user_status 
  ON clients(user_id, status) 
  WHERE status != 'cancelado';

-- Partial index (apenas clientes ativos)
CREATE INDEX CONCURRENTLY idx_clients_active 
  ON clients(user_id, data_cadastro) 
  WHERE status IN ('pendente', 'pago', 'agendado');

-- JSONB index para integration configs
CREATE INDEX idx_integrations_config_gin 
  ON integrations USING GIN (configuracao);
```

### **Connection Pooling**
```typescript
// Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Pool config
  connection_limit = 20 // Max connections
  pool_timeout = 10 // Timeout em segundos
}
```

### **Horizontal Scaling**
```yaml
# Docker Compose (exemplo)
services:
  api:
    image: flowzz-api:latest
    replicas: 3 # 3 instâncias
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - api
    # Load balancing round-robin
```

---

## 🧪 TESTING STRATEGY

### **Pirâmide de Testes**
```
         /\
        /  \  E2E (10%)
       /────\
      /      \  Integration (30%)
     /────────\
    /          \  Unit (60%)
   /────────────\
```

### **Unit Tests**
```typescript
// Jest + TypeScript
describe('ClientService', () => {
  it('should create client with valid data', async () => {
    const mockRepo = createMockRepository()
    const service = new ClientService(mockRepo)
    
    const client = await service.create({
      nome: 'João Silva',
      email: 'joao@test.com',
      userId: 'user-123'
    })
    
    expect(client).toBeDefined()
    expect(client.nome).toBe('João Silva')
    expect(mockRepo.create).toHaveBeenCalledTimes(1)
  })
})
```

### **Integration Tests**
```typescript
// Supertest + Test Database
describe('POST /clients', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })
  
  it('should create client when authenticated', async () => {
    const token = await getTestToken()
    
    const response = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'João', email: 'joao@test.com' })
      .expect(201)
    
    expect(response.body.id).toBeDefined()
  })
})
```

### **E2E Tests**
```typescript
// Playwright
test('user can create client and apply tag', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'test@flowzz.com')
  await page.fill('[name=password]', 'Test123!')
  await page.click('button[type=submit]')
  
  await page.click('text=Clientes')
  await page.click('text=Novo Cliente')
  await page.fill('[name=nome]', 'João Silva')
  await page.click('text=Salvar')
  
  await expect(page.locator('text=Cliente criado')).toBeVisible()
})
```

---

## 🚀 DEPLOYMENT & DEVOPS

### **Environments**
```
Development  → localhost:3000 (Next.js) + localhost:3001 (API)
Staging      → staging.flowzz.com (Railway/Render)
Production   → app.flowzz.com (Railway/AWS)
```

### **CI/CD Pipeline (GitHub Actions)**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: docker build -t flowzz-api .
      
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: railway up # ou AWS ECS deploy
```

### **Monitoring & Observability**
```typescript
// Sentry (Error Tracking)
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1 // 10% das transações
})

// Winston (Logging)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Health Check Endpoint
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    coinzz: await checkCoinzzAPI(),
    facebook: await checkFacebookAPI()
  }
  
  const healthy = Object.values(checks).every(c => c === 'ok')
  res.status(healthy ? 200 : 503).json(checks)
})
```

---

**Documento gerado em:** 1 de outubro de 2025  
**Versão:** 1.0  
**Próxima revisão:** Após validação com time
