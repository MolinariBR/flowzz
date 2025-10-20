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

## ⚡ Configuração de Desenvolvimento

### Setup Inicial

```bash
# Instalar dependências (raiz do projeto)
pnpm install

# Configurar hooks Git (automático na raiz)
npm run prepare
```

### Scripts de Desenvolvimento

```bash
# Verificação de código
pnpm run lint          # Verifica problemas de lint
pnpm run lint:fix      # Corrige problemas automaticamente
pnpm run format        # Formata código

# Validação completa (CI local)
pnpm run check         # Lint + TypeScript + testes

# Apenas TypeScript
pnpm run type-check    # Verifica tipos
```

### Automação Ativa

#### 1. Ao Salvar (VS Code)
✅ **Formatação automática** - Código formatado ao salvar (`Ctrl+S`)
✅ **Organização de imports** - Imports organizados automaticamente
✅ **Correção de problemas** - Problemas simples corrigidos automaticamente

#### 2. No Commit
✅ **Validação de arquivos modificados** - Apenas arquivos alterados são verificados
✅ **Correção automática** - Problemas corrigidos automaticamente quando possível
❌ **Bloqueio de commit** - Se houver erros críticos que não podem ser corrigidos

#### 3. No Push
✅ **Verificação de tipos** - TypeScript validado em todos os workspaces
✅ **Build completo** - Build testado antes do push
❌ **Bloqueio de push** - Se houver falhas de compilação

### Workflow de Desenvolvimento

1. **Criar/alterar código**
   - VS Code formata automaticamente ao salvar
   - Problemas são destacados em tempo real

2. **Fazer commit**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   ```
   - Hook aplica correções automáticas
   - Arquivos são formatados automaticamente

3. **Se houver problemas**
   ```bash
   # Corrigir tudo automaticamente
   pnpm run lint:fix

   # Verificar tipos
   pnpm run type-check

   # Tentar commit novamente
   git add .
   git commit -m "feat: nova funcionalidade"
   ```

4. **Fazer push**
   ```bash
   git push
   ```
   - Hook valida TypeScript e build
   - Push bloqueado se houver problemas

### Padrões de Código

- **Linter/Formatter**: Biome (configurado no raiz)
- **TypeScript**: Strict mode ativado
- **Commits**: Seguir conventional commits
- **Imports**: Organizados automaticamente

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 📖 Guia de Uso Diário

### Desenvolvimento do Dia a Dia

#### 1. **Início do Trabalho**
```bash
# Em cada workspace (backend, admin, flow, landing)
cd backend && npm run dev    # Terminal 1
cd admin && npm run dev      # Terminal 2
cd flow && npm run dev       # Terminal 3
cd landing && npm run dev    # Terminal 4
```

#### 2. **Durante o Desenvolvimento**
- ✅ **Escreva código** - O VS Code formata automaticamente ao salvar
- ✅ **Problemas destacados** - Erros aparecem em tempo real
- ✅ **Imports organizados** - Não precisa se preocupar com ordem

#### 3. **Antes de Commitar**
```bash
# Verificar problemas
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Formatar código
npm run format

# Validação completa (recomendado)
npm run check
```

#### 4. **Fazer Commit**
```bash
git add .
git commit -m "feat: descrição da mudança"

# O hook faz automaticamente:
# ✅ Formatação de arquivos modificados
# ✅ Correção de problemas simples
# ✅ Organização de imports
```

#### 5. **Se o Commit Falhar**
```bash
# Verificar o que está errado
npm run lint

# Corrigir problemas
npm run lint:fix

# Tentar novamente
git add .
git commit -m "feat: descrição da mudança"
```

#### 6. **Antes de Push**
```bash
# Validação automática pelo hook:
# ✅ Verificação de tipos TypeScript
# ✅ Build completo
# ✅ Testes (se configurados)

git push  # Push bloqueado se houver problemas
```

### Comandos Rápidos de Referência

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `npm run lint` | Verifica problemas de código | Sempre antes de commit |
| `npm run lint:fix` | Corrige problemas automaticamente | Quando houver erros simples |
| `npm run format` | Formata código | Para manter consistência |
| `npm run check` | Validação completa | CI local / antes de push |
| `npm run type-check` | Apenas TypeScript | Para verificar tipos |

### Cenários Comuns

#### 🎯 **"Meu código não está formatando automaticamente"**
1. Verifique se a extensão `Biome` está instalada no VS Code
2. Certifique-se que `editor.formatOnSave` está ativado
3. Reinicie o VS Code se necessário

#### 🎯 **"Commit está falhando"**
1. Execute `npm run lint` para ver os problemas
2. Execute `npm run lint:fix` para correções automáticas
3. Verifique tipos com `npm run type-check`
4. Tente o commit novamente

#### 🎯 **"Push está sendo bloqueado"**
1. O problema é sério (TypeScript ou build)
2. Execute `npm run check` para diagnóstico completo
3. Corrija os erros identificados
4. Execute `npm run build` para testar
5. Tente o push novamente

#### 🎯 **"Quero contribuir com o projeto"**
```bash
# 1. Fork e clone o projeto
git clone seu-fork-url
cd flowzz

# 2. Instalar dependências (raiz)
pnpm install

# 3. Configurar ambiente
cp config.env.example config.env
# Editar config.env

# 4. Hooks Git configurados automaticamente
npm run prepare

# 5. Desenvolver seguindo os padrões
# 6. Testar completamente
npm run check

# 7. Commitar e push
git push origin sua-branch
```

### Dicas de Produtividade

#### ⚡ **Atalhos VS Code**
- `Ctrl+S` - Salvar e formatar automaticamente
- `Ctrl+Shift+P` → "Format Document" - Formatação manual
- `Ctrl+Shift+I` - Organização de imports

#### ⚡ **Workflow Otimizado**
1. **Escreva código** → Salve automaticamente (`Ctrl+S`)
2. **Problemas aparecem** → Corrija enquanto desenvolve
3. **Antes de sair** → `npm run check` para validação
4. **Commit** → Hook faz o resto automaticamente

#### ⚡ **Debug de Problemas**
```bash
# Para problemas específicos:
npm run lint          # Vê problemas de lint
npm run type-check    # Vê problemas de TypeScript
npm run build         # Vê problemas de build

# Para correções automáticas:
npm run lint:fix      # Corrige lint automaticamente
npm run format        # Formata tudo
```

### Suporte

#### 📚 **Documentação Técnica**
- [Biome Documentation](https://biomejs.dev/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

#### 🆘 **Problemas Comuns**
- **Extensões VS Code desatualizadas** → Atualize para versões mais recentes
- **Cache do Biome** → Reinicie o VS Code ou execute `npm run format`
- **Hooks não funcionando** → Execute `npm run prepare` novamente

#### 💬 **Feedback**
Use este guia como referência. Se encontrar problemas ou melhorias:
1. Verifique se seguiu todos os passos
2. Execute `npm run check` para diagnóstico
3. Consulte a documentação oficial
4. Peça ajuda à equipe se necessário

---

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