# Flowzz Platform Backend API

API backend da plataforma Flowzz - SaaS de gestão financeira para afiliados de produtos físicos.

## 🚀 Stack Tecnológica

- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.3+
- **Framework:** Express.js 4.19+
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5.16+
- **Cache:** Redis 7
- **Queue:** Bull
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Vitest
- **Linting:** ESLint + Prettier

## 📁 Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── domain/
│   │   ├── entities/        # Entidades de negócio
│   │   └── repositories/    # Interfaces de repositório
│   ├── application/
│   │   ├── usecases/        # Casos de uso
│   │   └── services/        # Services auxiliares
│   ├── infrastructure/
│   │   ├── repositories/    # Implementações concretas
│   │   └── middleware/      # Middlewares
│   └── presentation/
│       ├── controllers/     # Controllers REST
│       └── routes/          # Definição de rotas
├── clients/                 # Módulo de gestão de clientes
├── dashboard/               # Módulo de dashboard e métricas
├── integrations/            # Módulo de integrações externas
├── billing/                 # Módulo de cobrança e planos
├── reports/                 # Módulo de relatórios
├── admin/                   # Módulo administrativo
├── shared/                  # Código compartilhado
│   ├── errors/              # Custom errors
│   ├── utils/               # Utilidades
│   ├── validation/          # Schemas de validação
│   └── config/              # Configurações
├── prisma/                  # Configurações do Prisma
└── server.ts                # Entry point
```

## 🔧 Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
```

### Database
```bash
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Sincroniza schema com database
npm run db:migrate   # Executa migrations
npm run db:studio    # Abre Prisma Studio
npm run db:seed      # Executa seeds
```

### Qualidade de Código
```bash
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run format       # Formata código com Prettier
```

### Testes
```bash
npm run test         # Executa todos os testes
npm run test:watch   # Executa testes em modo watch
npm run test:coverage # Executa testes com coverage
```

## 🌍 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flowzz"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# External APIs
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
COINZZ_API_KEY="your-coinzz-api-key"
WHATSAPP_ACCESS_TOKEN="your-whatsapp-token"
PAGBANK_API_KEY="your-pagbank-api-key"
```

## 🏗️ Padrões Arquiteturais

### Clean Architecture
- **Domain:** Regras de negócio puras
- **Application:** Casos de uso e orquestração
- **Infrastructure:** Implementações técnicas
- **Presentation:** Controllers e rotas

### Repository Pattern
- Interfaces no domain layer
- Implementações no infrastructure layer
- Injeção de dependência nos use cases

### Dependency Injection
- Constructor injection
- Interface segregation
- Inversion of control

## 📊 Funcionalidades

### 🔐 Autenticação
- [x] Cadastro com trial de 7 dias
- [x] Login/Logout
- [x] Refresh tokens
- [x] Middleware de autenticação

### 👥 Gestão de Clientes
- [x] CRUD completo
- [x] Sistema de etiquetas
- [x] Filtros e busca
- [x] Importação via Coinzz

### 📊 Dashboard
- [x] Métricas financeiras
- [x] Gráficos de vendas
- [x] Projeções
- [x] Alertas

### 🔌 Integrações
- [x] Coinzz API (vendas)
- [x] Facebook Ads API (métricas)
- [x] WhatsApp Business API (notificações)
- [x] PagBank API (pagamentos)

### 📈 Relatórios
- [x] Geração PDF/Excel
- [x] Templates customizáveis
- [x] Agendamento automático
- [x] Compartilhamento

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Coverage mínimo: 80%
npm run test:coverage

# Padrão de nomenclatura:
# deve [ação] quando [condição]
```

## 🚀 Deploy

```bash
# Build
npm run build

# Start production
npm start
```

## 📚 Documentação

- **API Docs:** `/docs/openapi.yaml`
- **Swagger UI:** `http://localhost:3000/docs`
- **Insomnia Collection:** `/docs/insomnia.json`

## 🔄 Workflow

1. **Feature Branch:** `git checkout -b feature/nova-funcionalidade`
2. **Desenvolvimento:** Seguir padrões de Clean Architecture
3. **Testes:** Garantir >80% coverage
4. **Lint:** `npm run lint:fix`
5. **PR:** Merge para main após review

## 📞 Suporte

- **Email:** dev@flowzz.com
- **Docs:** https://docs.flowzz.com
- **Issues:** https://github.com/flowzz/api/issues