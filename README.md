# Flowzz Platform

Sistema completo de gestão de vendas e automação para afiliados digitais.

## 🏗️ Arquitetura

Este é um monorepo que contém:

- **backend/** - API REST (Node.js + Express + TypeScript)
- **flow/** - Frontend Flow (Next.js)
- **admin/** - Painel Administrativo (Vite + React)
- **landing/** - Landing Page (Vite + React)

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL
- Redis

### Instalação

```bash
# Instalar dependências de todos os pacotes
pnpm install

# Configurar variáveis de ambiente
cp config.env.example config.env
# Editar config.env com suas configurações

# Setup do banco de dados
cd backend
pnpm run db:push
pnpm run db:seed
```

### Desenvolvimento

```bash
# Backend
cd backend && pnpm run dev

# Flow (em outro terminal)
cd flow && pnpm run dev

# Admin (em outro terminal)
cd admin && pnpm run dev

# Landing (em outro terminal)
cd landing && pnpm run dev
```

### Testes

```bash
# Todos os testes
pnpm run test:all

# Apenas E2E
pnpm run test:e2e

# E2E com interface visual
pnpm run test:e2e:ui
```

## 📦 Scripts Disponíveis

### Monorepo (raiz)
- `pnpm run test:e2e` - Executa testes E2E
- `pnpm run test:all` - Executa todos os testes

### Backend
- `pnpm run dev` - Desenvolvimento
- `pnpm run build` - Build de produção
- `pnpm run start` - Executar em produção
- `pnpm run db:push` - Sincronizar banco
- `pnpm run db:studio` - Prisma Studio

### Frontend (Flow, Admin, Landing)
- `pnpm run dev` - Desenvolvimento
- `pnpm run build` - Build de produção
- `pnpm run preview` - Preview do build

## 🚀 Deploy

### Desenvolvimento Local
```bash
# Setup completo
./setup-integration.sh

# Ou instalar dependências manualmente
pnpm install
```

### Produção (Hostinger VPS)
```bash
# Deploy automatizado
./deploy.sh [dominio] [email]

# Exemplo:
./deploy.sh flowzzoficial.com admin@flowzzoficial.com
```

## 📁 Estrutura do Projeto

```
flowzz/
├── backend/           # API REST
├── flow/             # Frontend Flow
├── admin/            # Painel Admin
├── landing/          # Landing Page
├── e2e/              # Testes E2E
├── docs/             # Documentação
│   ├── deploy/       # Documentação de deploy
│   └── ...           # Outros documentos
├── scripts/          # Scripts de automação
│   ├── deploy/       # Scripts de deploy modularizados
│   │   ├── config/   # Configurações de deploy
│   │   ├── modules/  # Módulos de deploy
│   │   └── *.backup  # Backups de versões anteriores
│   ├── setup_user.sh # Criação de usuário não-root
│   └── setup-integration.sh
├── deploy.sh         # Script principal de deploy
├── nginx.conf        # Configuração Nginx
├── ecosystem.config.js # Configuração PM2
└── playwright.config.ts # Configuração testes
```

## 🔧 Configuração

### Variáveis de Ambiente

Copie `config.env.example` para `config.env` e configure:

```env
# Banco de dados
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# JWT
JWT_SECRET="your-secret"

# APIs externas
PAGBANK_API_TOKEN="..."
FACEBOOK_APP_SECRET="..."
```

### Domínios

O sistema está configurado para:
- `flowzzoficial.com` - Landing page
- `app.flowzzoficial.com` - Aplicativo Flow
- `admin.flowzzoficial.com` - Painel Admin
- `api.flowzzoficial.com` - API Backend

## 📚 Documentação

- [Deploy](./docs/deploy/DEPLOY.md)
- [Checklist de Deploy](./docs/deploy/DEPLOY_CHECKLIST.md)
- [Deploy Hostinger](./docs/deploy/DEPLOY_HOSTINGER.md)
- [Testes](./docs/TESTING_INFRASTRUCTURE_FINAL_REPORT.md)

## 🧪 Testes

### E2E com Playwright

```bash
# Executar todos os testes E2E
pnpm run test:e2e

# Testar apenas um projeto
pnpm run test:e2e:flow
pnpm run test:e2e:admin

# Com interface visual
pnpm run test:e2e:ui

# Ver relatório
pnpm run test:e2e:report
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e confidencial.

---

**Flowzz** - Gestão inteligente para afiliados digitais 🚀</content>
<parameter name="filePath">/home/mau/projetos/flowzz/README.md