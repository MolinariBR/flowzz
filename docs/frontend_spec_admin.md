# 👨‍💼 **Especificação Técnica do Frontend Admin - Flowzz**

## 📋 **Visão Geral**

Este documento especifica os requisitos técnicos do painel administrativo da plataforma Flowzz, destinado à gestão completa dos usuários, planos, integrações e monitoramento da aplicação.

## 🎯 **Objetivo**

O painel admin permite que a equipe Flowzz gerencie:
- Usuários e suas assinaturas
- Planos e preços
- Integrações e webhooks
- Métricas globais da plataforma
- Suporte e tickets
- Configurações do sistema

---

## 🏗️ **Módulos e Funcionalidades**

### **1. Dashboard Admin**

#### **Métricas Principais**
*Admin deve ser capaz de ver:*
- Total de usuários cadastrados
- Usuários ativos (últimos 30 dias)
- MRR (Monthly Recurring Revenue)
- Churn rate
- Novas assinaturas (mês atual)
- Cancelamentos (mês atual)
- Receita total
- Tickets de suporte abertos

#### **Gráficos e Visualizações**
*Admin deve ser capaz de ver:*
- Gráfico de crescimento de usuários (últimos 12 meses)
- Gráfico de receita mensal
- Distribuição de planos (pizza)
- Status de integrações (health check)
- Atividades recentes do sistema
- Usuários mais ativos

#### **Ações Rápidas**
*Admin deve ser capaz de:*
- Ver usuários recém-cadastrados
- Acessar tickets pendentes
- Ver alertas do sistema
- Exportar relatório gerencial

---

### **2. Gestão de Usuários**

#### **Lista de Usuários**
*Admin deve ser capaz de ver:*
- Tabela com todos os usuários:
  - Nome
  - Email
  - Plano atual
  - Status (ativo/inativo/suspenso)
  - Data de cadastro
  - Último acesso
  - MRR individual
  - Ações

#### **Filtros e Busca**
*Admin deve ser capaz de:*
- Buscar por nome, email, CPF/CNPJ
- Filtrar por:
  - Plano (Mensal, Anual, Teste)
  - Status (Ativo, Inativo, Suspenso, Cancelado)
  - Data de cadastro
  - Último acesso
  - MRR
- Ordenar por qualquer coluna
- Exportar lista filtrada (CSV, Excel)

#### **Detalhes do Usuário**
*Admin deve ser capaz de ver:*
- **Perfil Completo**:
  - Dados pessoais
  - CPF/CNPJ
  - Endereço completo
  - Telefone
  - Email
- **Assinatura**:
  - Plano atual
  - Data de início
  - Próxima cobrança
  - Histórico de pagamentos
  - Faturas
- **Uso da Plataforma**:
  - Número de clientes cadastrados
  - Vendas realizadas
  - Anúncios ativos
  - Relatórios gerados
  - Integrações conectadas
- **Atividades Recentes**:
  - Logins
  - Ações realizadas
  - Dispositivos utilizados
- **Suporte**:
  - Tickets abertos
  - Histórico de contatos

#### **Ações sobre Usuário**
*Admin deve ser capaz de:*
- Editar dados do usuário
- Alterar plano manualmente
- Suspender conta
- Reativar conta
- Cancelar assinatura
- Resetar senha
- Fazer login como usuário (impersonation)
- Enviar email personalizado
- Adicionar notas internas
- Ver logs de atividade

---

### **3. Gestão de Planos**

#### **Lista de Planos**
*Admin deve ser capaz de ver:*
- Todos os planos disponíveis:
  - Nome do plano
  - Preço mensal
  - Preço anual
  - Recursos incluídos
  - Limite de clientes
  - Status (ativo/inativo)
  - Número de assinantes

#### **Gerenciamento de Planos**
*Admin deve ser capaz de:*
- Criar novo plano
- Editar plano existente
- Ativar/desativar plano
- Configurar recursos:
  - Limite de clientes
  - Limite de anúncios
  - Limite de relatórios
  - Integrações disponíveis
  - Suporte (email, chat, telefone)
- Definir preços:
  - Mensal
  - Anual (com desconto)
  - Trial period
- Criar cupons de desconto
- Ver histórico de alterações

#### **Cupons e Promoções**
*Admin deve ser capaz de:*
- Criar cupons de desconto
- Configurar:
  - Código do cupom
  - Tipo (percentual, valor fixo)
  - Valor do desconto
  - Data de validade
  - Limite de uso
  - Planos elegíveis
- Ver cupons ativos
- Desativar cupons
- Ver estatísticas de uso

---

### **4. Gestão Financeira**

#### **Dashboard Financeiro**
*Admin deve ser capaz de ver:*
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Receita total
- Receita por plano
- Churn rate
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)

#### **Transações**
*Admin deve ser capaz de ver:*
- Lista de todas as transações:
  - Usuário
  - Plano
  - Valor
  - Status (pago, pendente, falhou)
  - Data
  - Método de pagamento
  - Gateway (PagBank)
- Filtrar por período, status, usuário
- Exportar relatório financeiro

#### **Faturas**
*Admin deve ser capaz de:*
- Ver todas as faturas geradas
- Reenviar fatura por email
- Cancelar fatura
- Reembolsar pagamento
- Gerar 2ª via

---

### **5. Gestão de Integrações**

#### **Status das Integrações**
*Admin deve ser capaz de ver:*
- Status global das integrações:
  - Facebook Ads API
  - Coinzz API
  - WhatsApp Business API
  - PagBank API
  - OpenAI API
- Health check em tempo real
- Logs de erros
- Métricas de uso

#### **Configuração de Integrações**
*Admin deve ser capaz de:*
- Configurar credenciais das APIs
- Ativar/desativar integrações
- Configurar webhooks
- Testar conexões
- Ver documentação técnica
- Gerenciar rate limits

#### **Webhooks**
*Admin deve ser capaz de:*
- Ver todos os webhooks configurados
- Criar novos webhooks
- Testar webhooks
- Ver logs de chamadas
- Reenviar webhooks falhados

---

### **6. Suporte e Tickets**

#### **Central de Tickets**
*Admin deve ser capaz de ver:*
- Lista de todos os tickets:
  - ID do ticket
  - Usuário
  - Assunto
  - Categoria
  - Prioridade
  - Status (aberto, em andamento, resolvido)
  - Responsável
  - Data de abertura
  - SLA

#### **Gerenciamento de Tickets**
*Admin deve ser capaz de:*
- Ver detalhes completos do ticket
- Responder ticket
- Alterar status
- Atribuir a outro atendente
- Alterar prioridade
- Adicionar tags
- Anexar arquivos
- Ver histórico completo
- Encerrar ticket

#### **Categorias e SLA**
*Admin deve ser capaz de:*
- Criar categorias de tickets
- Configurar SLA por categoria
- Definir prioridades
- Configurar respostas automáticas
- Ver métricas de atendimento:
  - Tempo médio de resposta
  - Taxa de resolução
  - Satisfação do cliente

---

### **7. Configurações do Sistema**

#### **Configurações Gerais**
*Admin deve ser capaz de:*
- Configurar nome da plataforma
- Upload de logo
- Configurar cores da marca
- Configurar emails transacionais
- Configurar SMTP
- Configurar domínio customizado

#### **Segurança**
*Admin deve ser capaz de:*
- Configurar políticas de senha
- Ativar 2FA obrigatório
- Configurar rate limiting
- Ver tentativas de login falhas
- Bloquear IPs suspeitos
- Ver logs de auditoria

#### **Notificações**
*Admin deve ser capaz de:*
- Configurar notificações do sistema
- Enviar notificações em massa
- Criar templates de email
- Configurar notificações push
- Ver histórico de envios

#### **Backup e Manutenção**
*Admin deve ser capaz de:*
- Agendar backups automáticos
- Fazer backup manual
- Restaurar backup
- Ver status do sistema
- Agendar manutenções
- Enviar avisos de manutenção

---

### **8. Relatórios e Analytics**

#### **Relatórios Pré-definidos**
*Admin deve ser capaz de gerar:*
- Relatório de usuários
- Relatório financeiro
- Relatório de churn
- Relatório de integrações
- Relatório de suporte
- Relatório de uso da plataforma

#### **Analytics Avançado**
*Admin deve ser capaz de ver:*
- Funil de conversão (trial → pago)
- Cohort analysis
- Retenção de usuários
- Uso por funcionalidade
- Performance das integrações
- Erros e bugs reportados

---

### **9. Gestão de Equipe Admin**

#### **Administradores**
*Admin deve ser capaz de:*
- Ver lista de admins
- Adicionar novo admin
- Definir permissões:
  - Gestão de usuários
  - Gestão financeira
  - Gestão de planos
  - Gestão de integrações
  - Suporte
  - Configurações do sistema
- Remover acesso admin
- Ver logs de ações dos admins

#### **Auditoria**
*Admin deve ser capaz de ver:*
- Log completo de ações:
  - Quem fez
  - O que fez
  - Quando fez
  - IP de origem
- Filtrar por admin, data, ação
- Exportar logs

---

## 🎨 **Design e UX**

### **Princípios de Design**
- Interface clean e profissional
- Cores neutras com destaques
- Tipografia clara e legível
- Dashboard com métricas destacadas
- Tabelas com filtros avançados
- Formulários intuitivos
- Feedback visual claro

### **Componentes Principais**
- **Cards de métricas**: Com ícones e variação percentual
- **Tabelas**: Ordenáveis, filtráveis, com paginação
- **Gráficos**: Line, bar, pie charts
- **Modais**: Para ações rápidas
- **Formulários**: Validação em tempo real
- **Alertas**: Toast notifications
- **Sidebar**: Navegação principal
- **Breadcrumbs**: Navegação contextual

---

## 🛠️ **Stack Tecnológica**

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Hero UI ou Chakra UI
- **Gráficos**: Recharts ou Chart.js
- **Tabelas**: TanStack Table (React Table)
- **Formulários**: React Hook Form + Zod
- **Estado**: Zustand ou Context API
- **Data Fetching**: React Query
- **Autenticação**: NextAuth.js

### **Ferramentas**
- **Icons**: Lucide React
- **Date Picker**: React Day Picker
- **Editor de Texto**: TipTap ou Quill
- **Upload de Arquivos**: React Dropzone
- **Exportação**: XLSX, jsPDF
- **Notificações**: React Hot Toast

---

## 📊 **Estrutura de Pastas**

```
flowzz-admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── usuarios/
│   │   │   ├── planos/
│   │   │   ├── financeiro/
│   │   │   ├── integracoes/
│   │   │   ├── suporte/
│   │   │   ├── configuracoes/
│   │   │   ├── relatorios/
│   │   │   ├── equipe/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── charts/
│   │   └── layout/
│   ├── lib/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── validations/
│   ├── types/
│   └── styles/
├── public/
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔐 **Autenticação e Permissões**

### **Níveis de Acesso**
1. **Super Admin**: Acesso total
2. **Admin**: Gestão de usuários e suporte
3. **Financeiro**: Apenas relatórios financeiros
4. **Suporte**: Apenas tickets e suporte

### **Proteção de Rotas**
- Middleware de autenticação
- Validação de permissões
- Session management
- Auto logout por inatividade

---

## 📋 **Endpoints da API Consumidos**

### **Dashboard**
```
GET /admin/metrics
GET /admin/charts/users
GET /admin/charts/revenue
GET /admin/activities
```

### **Usuários**
```
GET    /admin/users
GET    /admin/users/{id}
PUT    /admin/users/{id}
DELETE /admin/users/{id}
POST   /admin/users/{id}/suspend
POST   /admin/users/{id}/reactivate
POST   /admin/users/{id}/impersonate
POST   /admin/users/{id}/reset-password
GET    /admin/users/{id}/logs
```

### **Planos**
```
GET    /admin/plans
POST   /admin/plans
PUT    /admin/plans/{id}
DELETE /admin/plans/{id}
GET    /admin/coupons
POST   /admin/coupons
PUT    /admin/coupons/{id}
```

### **Financeiro**
```
GET /admin/transactions
GET /admin/invoices
POST /admin/invoices/{id}/resend
POST /admin/invoices/{id}/refund
GET /admin/financial-reports
```

### **Integrações**
```
GET    /admin/integrations/status
PUT    /admin/integrations/{provider}/config
POST   /admin/integrations/{provider}/test
GET    /admin/webhooks
POST   /admin/webhooks
GET    /admin/webhooks/{id}/logs
```

### **Suporte**
```
GET    /admin/tickets
GET    /admin/tickets/{id}
POST   /admin/tickets/{id}/reply
PUT    /admin/tickets/{id}/status
GET    /admin/tickets/metrics
```

### **Configurações**
```
GET /admin/settings
PUT /admin/settings
GET /admin/audit-logs
GET /admin/system-health
```

---

## 📊 **Estimativa de Desenvolvimento**

### **Fases do Projeto**

1. **Setup e Autenticação** (1 semana)
   - Estrutura do projeto
   - Autenticação admin
   - Layout base

2. **Dashboard e Métricas** (1 semana)
   - Dashboard principal
   - Gráficos e métricas
   - Cards informativos

3. **Gestão de Usuários** (2 semanas)
   - Lista de usuários
   - Detalhes do usuário
   - Ações sobre usuário
   - Filtros avançados

4. **Gestão de Planos e Financeiro** (2 semanas)
   - CRUD de planos
   - Cupons
   - Transações
   - Relatórios financeiros

5. **Integrações e Suporte** (2 semanas)
   - Status de integrações
   - Central de tickets
   - Webhooks

6. **Configurações e Analytics** (1 semana)
   - Configurações do sistema
   - Relatórios avançados
   - Auditoria

7. **Testes e Refinamentos** (1 semana)
   - Testes E2E
   - Ajustes de UX
   - Documentação

**Total estimado**: 10 semanas para painel admin completo

---

## 🚀 **Próximos Passos**

1. **Criar estrutura do projeto** Next.js Admin
2. **Implementar autenticação** e proteção de rotas
3. **Desenvolver dashboard** principal
4. **Implementar módulos** por prioridade
5. **Testes** e refinamentos
6. **Deploy** em produção

---

*Este documento será atualizado conforme o desenvolvimento avança.*