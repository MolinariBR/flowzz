# 🔧 DEV STORIES - FLOWZZ PLATFORM
## Stories Técnicas para Implementação

---

## 🎫 ÉPICA DEV 1: Setup e Infraestrutura

### Dev Story 1.1: Setup Projeto Backend (Node.js + TypeScript + Prisma)

```gherkin
Como desenvolvedor backend
Quero configurar estrutura inicial do projeto
Para começar desenvolvimento com padrões definidos

Tarefas Técnicas:
- [ ] Criar repositório Git flowzz-api
- [ ] Inicializar npm project com package.json
- [ ] Instalar dependências base:
  - express, typescript, ts-node, @types/node
  - prisma, @prisma/client
  - dotenv, helmet, cors, compression
- [ ] Configurar tsconfig.json (strict mode)
- [ ] Criar estrutura de pastas:
  ```
  src/
  ├── controllers/
  ├── services/
  ├── repositories/
  ├── models/
  ├── middlewares/
  ├── utils/
  ├── config/
  └── server.ts
  ```
- [ ] Configurar scripts package.json:
  - dev: tsx watch src/server.ts
  - build: tsc
  - start: node dist/server.js
- [ ] Setup ESLint + Prettier
- [ ] Criar .env.example com variáveis necessárias
- [ ] Configurar Nodemon para hot reload

Critérios de Aceitação:
- [ ] npm run dev inicia servidor sem erros
- [ ] TypeScript compila sem erros
- [ ] ESLint passa sem warnings
- [ ] .gitignore configurado (node_modules, dist, .env)

Estimativa: 3 story points
Prioridade: 🔴 Crítica
```

---

### Dev Story 1.2: Configurar PostgreSQL + Prisma Schema

```gherkin
Como desenvolvedor backend
Quero configurar banco de dados PostgreSQL com Prisma
Para ter ORM type-safe e migrations automáticas

Tarefas Técnicas:
- [ ] Instalar PostgreSQL local (Docker Compose)
  ```yaml
  services:
    postgres:
      image: postgres:16-alpine
      environment:
        POSTGRES_USER: flowzz
        POSTGRES_PASSWORD: flowzz_dev
        POSTGRES_DB: flowzz_dev
      ports:
        - "5432:5432"
      volumes:
        - pgdata:/var/lib/postgresql/data
  ```
- [ ] Configurar Prisma schema.prisma:
  - datasource db (postgresql)
  - generator client
- [ ] Criar models principais:
  - User (id, email, password_hash, nome, role, created_at)
  - Subscription (id, user_id, plan, status, start_date, end_date)
  - Client (id, user_id, nome, email, telefone, status)
  - Tag (id, user_id, nome, cor)
  - Sale (id, user_id, client_id, valor, data_venda, status)
  - Integration (id, user_id, provider, status, config JSONB)
- [ ] Gerar migration inicial: npx prisma migrate dev --name init
- [ ] Criar seed.ts com dados de teste
- [ ] Testar conexão com Prisma Studio

Critérios de Aceitação:
- [ ] PostgreSQL roda via Docker
- [ ] Migrations aplicadas sem erro
- [ ] Prisma Client gerado e type-safe
- [ ] Seed insere dados de teste
- [ ] Prisma Studio abre e mostra tabelas

Estimativa: 5 story points
Prioridade: 🔴 Crítica
```

---

### Dev Story 1.3: Implementar Sistema de Autenticação JWT

```gherkin
Como desenvolvedor backend
Quero implementar auth completo com JWT
Para proteger endpoints e gerenciar sessões

Tarefas Técnicas:
- [ ] Instalar dependências:
  - jsonwebtoken, bcryptjs
  - @types/jsonwebtoken, @types/bcryptjs
- [ ] Criar AuthService:
  ```typescript
  class AuthService {
    async register(email: string, password: string): Promise<User>
    async login(email: string, password: string): Promise<AuthTokens>
    async refreshToken(refreshToken: string): Promise<string>
    async logout(refreshToken: string): Promise<void>
  }
  ```
- [ ] Implementar hash de senha (bcrypt rounds: 12)
- [ ] Gerar Access Token (exp: 15min):
  ```typescript
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  ```
- [ ] Gerar Refresh Token (exp: 7d, salvar no DB)
- [ ] Criar middleware authenticate:
  ```typescript
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.user = payload
      next()
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' })
    }
  }
  ```
- [ ] Criar endpoints:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout
  - GET /auth/me (protegido)

Critérios de Aceitação:
- [ ] Senha hashada com bcrypt (nunca plaintext)
- [ ] Access token expira em 15 minutos
- [ ] Refresh token salvo no DB com expiração
- [ ] Middleware bloqueia acesso sem token válido
- [ ] Logout invalida refresh token
- [ ] Testes unitários para AuthService (>80% coverage)

Estimativa: 8 story points
Prioridade: 🔴 Crítica
```

---

## 🎫 ÉPICA DEV 2: Core API - CRUD Básico

### Dev Story 2.1: API de Clientes - CRUD Completo

```gherkin
Como desenvolvedor backend
Quero implementar endpoints CRUD de clientes
Para permitir gestão completa de clientes

Tarefas Técnicas:
- [ ] Criar ClientRepository (Repository Pattern):
  ```typescript
  interface IClientRepository {
    findById(id: string): Promise<Client | null>
    findByUserId(userId: string, filters?: Filters): Promise<Client[]>
    create(data: CreateClientDTO): Promise<Client>
    update(id: string, data: UpdateClientDTO): Promise<Client>
    delete(id: string): Promise<void>
    count(userId: string): Promise<number>
  }
  ```
- [ ] Criar ClientService (Business Logic):
  ```typescript
  class ClientService {
    async getClients(userId: string, page: number, limit: number): Promise<PaginatedClients>
    async getClientById(id: string, userId: string): Promise<Client>
    async createClient(data: CreateClientDTO, userId: string): Promise<Client>
    async updateClient(id: string, data: UpdateClientDTO, userId: string): Promise<Client>
    async deleteClient(id: string, userId: string): Promise<void>
  }
  ```
- [ ] Criar Zod schemas para validação:
  ```typescript
  const createClientSchema = z.object({
    nome: z.string().min(3).max(255),
    email: z.string().email().optional(),
    telefone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/).optional(),
    valor_pedido: z.number().positive().optional(),
    status: z.enum(['pendente', 'pago', 'entregue', 'cancelado'])
  })
  ```
- [ ] Criar ClientController:
  - GET /clients (paginado, filtros)
  - GET /clients/:id
  - POST /clients (validação Zod)
  - PUT /clients/:id
  - DELETE /clients/:id
- [ ] Implementar paginação:
  ```typescript
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit
  
  const [clients, total] = await Promise.all([
    prisma.client.findMany({ skip, take: limit }),
    prisma.client.count()
  ])
  
  res.json({
    data: clients,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
  ```
- [ ] Implementar filtros (search, status, tags)
- [ ] Adicionar índices no banco:
  ```sql
  CREATE INDEX idx_clients_user_id ON clients(user_id);
  CREATE INDEX idx_clients_status ON clients(status);
  ```

Critérios de Aceitação:
- [ ] Todos endpoints protegidos (middleware authenticate)
- [ ] Validação de input com Zod (retorna 400 se inválido)
- [ ] Paginação funcional (20 itens/página)
- [ ] Filtros combinados funcionam
- [ ] Usuário só vê seus próprios clientes (isolamento por user_id)
- [ ] Testes de integração cobrindo happy path e erros

Estimativa: 13 story points
Prioridade: 🔴 Crítica
```

---

## 🎫 ÉPICA DEV 3: Integrações Externas

### Dev Story 3.1: Integração Coinzz API (Sync de Vendas)

```gherkin
Como desenvolvedor backend
Quero integrar com API do Coinzz
Para importar vendas automaticamente

Tarefas Técnicas:
- [ ] Pesquisar documentação Coinzz API (PENDENTE)
- [ ] Criar CoinzzService:
  ```typescript
  class CoinzzService {
    private apiKey: string
    private baseURL = 'https://api.coinzz.com/v1' // TBD
    
    async authenticate(apiKey: string): Promise<boolean>
    async getSales(startDate: Date, endDate: Date): Promise<CoinzzSale[]>
    async getClientData(clientId: string): Promise<CoinzzClient>
    async testConnection(): Promise<boolean>
  }
  ```
- [ ] Implementar retry logic com exponential backoff:
  ```typescript
  async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    try {
      return await fn()
    } catch (err) {
      if (retries === 0) throw err
      await new Promise(r => setTimeout(r, delay))
      return retryWithBackoff(fn, retries - 1, delay * 2)
    }
  }
  ```
- [ ] Criar endpoints:
  - POST /integrations/coinzz/connect (salva API key)
  - POST /integrations/coinzz/test (testa conexão)
  - POST /integrations/coinzz/sync (força sincronização)
  - GET /integrations/coinzz/status
- [ ] Implementar Bull job para sync automática:
  ```typescript
  // Queue: sync-coinzz
  // Cron: a cada 1 hora
  syncCoinzzQueue.process(async (job) => {
    const users = await getUsersWithCoinzzActive()
    
    for (const user of users) {
      const sales = await coinzzService.getSales(user.coinzzApiKey, lastSyncDate)
      await saveSalesToDB(sales, user.id)
      await updateLastSync(user.id)
    }
  })
  
  // Agendar job
  syncCoinzzQueue.add({}, { repeat: { cron: '0 * * * *' } }) // A cada hora
  ```
- [ ] Implementar cache Redis (1 hora TTL):
  ```typescript
  const cacheKey = `coinzz:sales:${userId}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  const sales = await coinzzService.getSales()
  await redis.setex(cacheKey, 3600, JSON.stringify(sales))
  return sales
  ```
- [ ] Tratar erros específicos:
  - 401: API key inválida
  - 429: Rate limit excedido
  - 500: Erro servidor Coinzz

Critérios de Aceitação:
- [ ] API key criptografada no banco (AES-256)
- [ ] Sync automática a cada 1 hora (Bull cron)
- [ ] Retry 3x com backoff em caso de erro
- [ ] Cache de 1 hora para reduzir chamadas
- [ ] Logs estruturados de todas as chamadas
- [ ] Testes com mock da API Coinzz

Estimativa: 13 story points
Prioridade: 🔴 Crítica
Bloqueio: Aguardando documentação oficial Coinzz
```

---

### Dev Story 3.2: Integração Facebook Ads Marketing API

```gherkin
Como desenvolvedor backend
Quero integrar com Facebook Ads API
Para importar gastos e métricas de campanhas

Tarefas Técnicas:
- [ ] Instalar SDK oficial:
  ```bash
  npm install facebook-nodejs-business-sdk
  ```
- [ ] Criar FacebookAdsService:
  ```typescript
  import { FacebookAdsApi, AdAccount } from 'facebook-nodejs-business-sdk'
  
  class FacebookAdsService {
    private api: FacebookAdsApi
    
    constructor(accessToken: string) {
      this.api = FacebookAdsApi.init(accessToken)
    }
    
    async getAdAccounts(): Promise<AdAccount[]>
    async getCampaigns(adAccountId: string): Promise<Campaign[]>
    async getInsights(adAccountId: string, datePreset: string): Promise<Insights>
  }
  ```
- [ ] Implementar OAuth 2.0 flow:
  ```typescript
  // 1. Redirect para Facebook
  GET /integrations/facebook/connect
  → Redirect to: https://www.facebook.com/v18.0/dialog/oauth?
    client_id={APP_ID}&
    redirect_uri={CALLBACK_URL}&
    scope=ads_read,ads_management
  
  // 2. Callback recebe code
  GET /integrations/facebook/callback?code={CODE}
  → Troca code por access_token
  → Salva access_token no DB (criptografado)
  ```
- [ ] Buscar insights com campos necessários:
  ```typescript
  const insights = await adAccount.getInsights([
    'spend',           // Gasto
    'impressions',     // Impressões
    'clicks',          // Cliques
    'ctr',            // CTR
    'cpc',            // CPC
    'cpm',            // CPM
    'actions'         // Conversões
  ], {
    date_preset: 'last_30d',
    time_increment: 1, // Diário
    level: 'campaign'
  })
  ```
- [ ] Implementar rate limiting (200 calls/hora):
  ```typescript
  const rateLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 18000 // 200 req/hora = 1 req a cada 18s
  })
  
  const wrappedGetInsights = rateLimiter.wrap(api.getInsights)
  ```
- [ ] Criar Bull job para sync a cada 6 horas
- [ ] Cache Redis (6 horas TTL)
- [ ] Calcular ROAS:
  ```typescript
  const roas = (totalRevenue / totalSpend) * 100
  ```

Critérios de Aceitação:
- [ ] OAuth flow completo (redirect + callback)
- [ ] Access token criptografado e refreshado automaticamente
- [ ] Rate limiting respeitado (não exceder 200/hora)
- [ ] Sync automática a cada 6 horas
- [ ] Cache de 6 horas
- [ ] Tratamento de erros OAuth (token expirado, revogado)
- [ ] Logs de todas as chamadas

Estimativa: 13 story points
Prioridade: 🟡 Alta
```

---

### Dev Story 3.3: Integração WhatsApp Business Cloud API

```gherkin
Como desenvolvedor backend
Quero integrar com WhatsApp API
Para enviar notificações automáticas

Tarefas Técnicas:
- [ ] Criar conta WhatsApp Business (Meta for Developers)
- [ ] Obter Phone Number ID e Access Token
- [ ] Criar templates de mensagem e enviar para aprovação Meta:
  ```
  Template 1: delivery_notification
  Categoria: TRANSACTIONAL
  Texto: "🎉 Cliente {{1}} recebeu o produto! Valor: R$ {{2}}"
  Variáveis: {{1}} = nome cliente, {{2}} = valor
  ```
- [ ] Criar WhatsAppService:
  ```typescript
  class WhatsAppService {
    private accessToken: string
    private phoneNumberId: string
    private baseURL = 'https://graph.facebook.com/v18.0'
    
    async sendTemplate(
      to: string, // Formato: 5511999999999
      template: string,
      variables: string[]
    ): Promise<{ messageId: string }>
    
    async getTemplateStatus(templateName: string): Promise<TemplateStatus>
  }
  ```
- [ ] Implementar envio de mensagem:
  ```typescript
  const response = await axios.post(
    `${this.baseURL}/${this.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: '5511999999999',
      type: 'template',
      template: {
        name: 'delivery_notification',
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'João Silva' },
              { type: 'text', text: '89.90' }
            ]
          }
        ]
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )
  ```
- [ ] Implementar sistema de créditos:
  ```typescript
  async function sendNotification(userId: string, message: WhatsAppMessage) {
    // 1. Verificar créditos disponíveis
    const user = await getUserWithPlan(userId)
    const creditsUsed = await getCreditsUsedThisMonth(userId)
    
    const limits = {
      basic: 50,
      pro: 200,
      premium: Infinity
    }
    
    if (creditsUsed >= limits[user.plan]) {
      throw new Error('Notification limit reached')
    }
    
    // 2. Enviar mensagem
    await whatsappService.sendTemplate(message.to, message.template, message.vars)
    
    // 3. Incrementar contador
    await incrementCreditsUsed(userId)
  }
  ```
- [ ] Criar Bull queue para envios assíncronos:
  ```typescript
  whatsappQueue.process(async (job) => {
    const { userId, to, template, variables } = job.data
    await whatsappService.sendTemplate(to, template, variables)
  })
  
  // Usage
  await whatsappQueue.add({ userId, to, template, variables })
  ```
- [ ] Webhooks para status de mensagens:
  ```typescript
  POST /webhooks/whatsapp
  {
    "entry": [{
      "changes": [{
        "value": {
          "statuses": [{
            "id": "msg-id",
            "status": "delivered", // sent, delivered, read, failed
            "timestamp": "1234567890"
          }]
        }
      }]
    }]
  }
  ```

Critérios de Aceitação:
- [ ] Templates aprovados pela Meta antes de produção
- [ ] Limite de créditos respeitado por plano
- [ ] Envios assíncronos via Bull queue
- [ ] Webhooks processando status de mensagens
- [ ] Custo por mensagem registrado (R$ 0,40-0,80)
- [ ] Retry 3x com backoff em caso de falha
- [ ] Dashboard mostra créditos usados/disponíveis

Estimativa: 13 story points
Prioridade: 🟢 Média
Bloqueio: Aprovação de templates Meta (2-5 dias úteis)
```

---

## 🎫 ÉPICA DEV 4: Features Avançadas

### Dev Story 4.1: Sistema de Projeções Financeiras

```gherkin
Como desenvolvedor backend
Quero implementar engine de projeções
Para calcular cenários futuros baseados em histórico

Tarefas Técnicas:
- [ ] Criar ProjectionService:
  ```typescript
  class ProjectionService {
    async calculateProjections(
      userId: string,
      period: number // dias
    ): Promise<{
      pessimistic: number
      realistic: number
      optimistic: number
      confidence: number
    }>
  }
  ```
- [ ] Implementar algoritmo de projeção:
  ```typescript
  async function projectSales(historicalSales: Sale[], days: number) {
    // 1. Calcular médias móveis
    const last7Days = getLastNDays(historicalSales, 7)
    const last30Days = getLastNDays(historicalSales, 30)
    const last90Days = getLastNDays(historicalSales, 90)
    
    const avg7 = calculateAverage(last7Days)
    const avg30 = calculateAverage(last30Days)
    const avg90 = calculateAverage(last90Days)
    
    // 2. Detectar tendência (crescimento, estável, queda)
    const trend = detectTrend(last30Days)
    
    // 3. Cenários
    const pessimistic = Math.min(avg7, avg30, avg90) * days
    const realistic = (avg7 * 0.3 + avg30 * 0.5 + avg90 * 0.2) * days
    const optimistic = Math.max(avg7, avg30, avg90) * days * (1 + trend)
    
    // 4. Confiança baseada em variância
    const variance = calculateVariance(last30Days)
    const confidence = Math.max(0, 100 - variance * 10)
    
    return { pessimistic, realistic, optimistic, confidence }
  }
  ```
- [ ] Considerar sazonalidade:
  ```typescript
  function adjustForSeasonality(value: number, date: Date): number {
    const dayOfWeek = date.getDay()
    
    // Histórico: seg-sex vendem 20% mais que sáb-dom
    const weekdayMultiplier = [0.8, 1.1, 1.1, 1.1, 1.1, 1.1, 0.8]
    return value * weekdayMultiplier[dayOfWeek]
  }
  ```
- [ ] Cache projeções (atualizar a cada 6 horas):
  ```typescript
  const cacheKey = `projections:${userId}:${period}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  const projections = await calculateProjections(userId, period)
  await redis.setex(cacheKey, 21600, JSON.stringify(projections)) // 6h
  return projections
  ```
- [ ] Endpoints:
  - GET /projections/sales?period=30
  - GET /projections/cashflow?period=90
  - GET /projections/health-score

Critérios de Aceitação:
- [ ] Mínimo 30 dias de histórico necessário
- [ ] Projeções recalculadas a cada 6 horas
- [ ] Confiança entre 0-100% baseada em variância
- [ ] Considera sazonalidade (dia da semana)
- [ ] Testes com dados históricos simulados
- [ ] Precisão de pelo menos 70% comparado com realidade

Estimativa: 13 story points
Prioridade: 🟡 Alta
Complexidade: Machine Learning básico
```

---

### Dev Story 4.2: Geração de Relatórios Assíncrona (PDF/Excel)

```gherkin
Como desenvolvedor backend
Quero gerar relatórios em background
Para não travar API com processamento pesado

Tarefas Técnicas:
- [ ] Instalar bibliotecas:
  ```bash
  npm install puppeteer xlsx pdfkit
  ```
- [ ] Criar ReportService:
  ```typescript
  class ReportService {
    async generateSalesReport(
      userId: string,
      startDate: Date,
      endDate: Date,
      format: 'pdf' | 'excel' | 'csv'
    ): Promise<string> // Retorna report ID
    
    async getReportStatus(reportId: string): Promise<ReportStatus>
    async getReportURL(reportId: string): Promise<string>
  }
  ```
- [ ] Implementar geração PDF com Puppeteer:
  ```typescript
  async function generatePDF(data: ReportData): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    
    // Renderizar HTML com template
    const html = renderReportTemplate(data)
    await page.setContent(html)
    
    // Gerar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    })
    
    await browser.close()
    return pdf
  }
  ```
- [ ] Implementar geração Excel:
  ```typescript
  function generateExcel(data: Sale[]): Buffer {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas')
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  }
  ```
- [ ] Bull queue para geração assíncrona:
  ```typescript
  reportQueue.process(async (job) => {
    const { reportId, userId, format, data } = job.data
    
    // 1. Atualizar status: "generating"
    await updateReportStatus(reportId, 'generating')
    
    try {
      // 2. Gerar arquivo
      const file = format === 'pdf' 
        ? await generatePDF(data) 
        : generateExcel(data)
      
      // 3. Upload para S3
      const url = await uploadToS3(file, `reports/${reportId}.${format}`)
      
      // 4. Atualizar status: "ready"
      await updateReportStatus(reportId, 'ready', url)
      
      // 5. Enviar email com link
      await sendEmail(userId, 'Seu relatório está pronto!', url)
    } catch (err) {
      await updateReportStatus(reportId, 'error', null, err.message)
    }
  })
  ```
- [ ] Upload para S3/R2:
  ```typescript
  async function uploadToS3(buffer: Buffer, key: string): Promise<string> {
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
      ACL: 'private'
    })
    
    // Gerar URL assinada (válida por 7 dias)
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Expires: 604800 // 7 dias
    })
  }
  ```
- [ ] Endpoints:
  - POST /reports/generate (cria job, retorna reportId)
  - GET /reports/:id/status
  - GET /reports/:id/download (redirect para S3 signed URL)

Critérios de Aceitação:
- [ ] Geração assíncrona via Bull queue
- [ ] Status visível (pending, generating, ready, error)
- [ ] Upload para S3 com URL assinada (7 dias)
- [ ] Email enviado quando pronto
- [ ] Timeout de 5 minutos
- [ ] Cleanup de arquivos antigos (>30 dias)
- [ ] Testes com relatórios grandes (1000+ vendas)

Estimativa: 13 story points
Prioridade: 🟢 Média
```

---

## 🎫 ÉPICA DEV 5: Painel Admin

### Dev Story 5.1: Dashboard Admin com Métricas SaaS

```gherkin
Como desenvolvedor backend
Quero criar endpoints de métricas admin
Para monitorar saúde do negócio

Tarefas Técnicas:
- [ ] Criar AdminService:
  ```typescript
  class AdminService {
    async getDashboardMetrics(): Promise<AdminMetrics>
    async getUserGrowth(period: number): Promise<GrowthData[]>
    async getRevenueMetrics(): Promise<RevenueMetrics>
    async getChurnRate(period: number): Promise<number>
  }
  ```
- [ ] Implementar cálculo de MRR:
  ```typescript
  async function calculateMRR(): Promise<number> {
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      include: { user: true }
    })
    
    let mrr = 0
    for (const sub of activeSubscriptions) {
      // Normalizar para mensal
      if (sub.plan === 'monthly') {
        mrr += sub.valor
      } else if (sub.plan === 'annual') {
        mrr += sub.valor / 12
      }
    }
    
    return mrr
  }
  ```
- [ ] Implementar cálculo de Churn:
  ```typescript
  async function calculateChurn(days: number): Promise<number> {
    const startDate = subDays(new Date(), days)
    
    const startActiveUsers = await prisma.subscription.count({
      where: { 
        status: 'active',
        start_date: { lte: startDate }
      }
    })
    
    const canceledUsers = await prisma.subscription.count({
      where: {
        status: 'cancelled',
        end_date: { gte: startDate }
      }
    })
    
    return (canceledUsers / startActiveUsers) * 100
  }
  ```
- [ ] Cache métricas (1 hora):
  ```typescript
  const metricsCache = await redis.get('admin:metrics')
  if (metricsCache) return JSON.parse(metricsCache)
  
  const metrics = await calculateAllMetrics()
  await redis.setex('admin:metrics', 3600, JSON.stringify(metrics))
  return metrics
  ```
- [ ] Endpoints protegidos (role: admin):
  ```typescript
  router.get('/admin/metrics', authorize([Role.ADMIN]), getMetricsController)
  router.get('/admin/users', authorize([Role.ADMIN]), getUsersController)
  router.get('/admin/revenue', authorize([Role.ADMIN]), getRevenueController)
  ```
- [ ] Criar queries otimizadas:
  ```sql
  -- View materializada para performance
  CREATE MATERIALIZED VIEW admin_metrics AS
  SELECT
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    COUNT(*) FILTER (WHERE last_access >= NOW() - INTERVAL '30 days') as active_users_30d,
    COUNT(*) FILTER (WHERE status = 'active') as total_active_users,
    AVG(CASE WHEN plan = 'monthly' THEN valor ELSE valor / 12 END) as avg_mrr
  FROM subscriptions;
  
  -- Refresh a cada hora (cron job)
  REFRESH MATERIALIZED VIEW admin_metrics;
  ```

Critérios de Aceitação:
- [ ] Métricas calculadas corretamente (MRR, churn, LTV)
- [ ] Cache de 1 hora para performance
- [ ] Queries otimizadas (< 500ms)
- [ ] Acesso restrito a role admin
- [ ] Materialized views para analytics pesadas
- [ ] Testes unitários para cálculos de métricas

Estimativa: 13 story points
Prioridade: 🟢 Média (Release 2.5)
```

---

**Total Dev Stories:** 25+  
**Estimativa Total:** ~250 story points (~15-18 sprints de 2 semanas)

**Documento gerado em:** 1 de outubro de 2025  
**Versão:** 1.0
