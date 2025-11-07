# Flowzz - Milestone 02: PagBank Subscription Plans
**Status:** Em desenvolvimento  
**Prazo:** 4 semanas  
**Responsável:** Backend/Full-stack  

## 🎯 **OBJETIVO**
Implementar sistema completo de planos de assinatura usando PagBank para cobrança SaaS dos usuários da Flowzz.

## 📋 **VISÃO GERAL**
- **3 planos mensais**: Starter (R$ 97), Pro (R$ 197), Enterprise (R$ 497)
- **Trial gratuito**: 7 dias para novos usuários
- **Integração PagBank**: Criação automática de planos e assinaturas
- **Admin Panel**: Gestão completa de planos e assinaturas
- **Flow App**: Interface de seleção e contratação de planos

---

## **FASE 1: BACKEND - PLAN MANAGEMENT** 🔧
**Duração:** 1 semana  
**Status:** Pendente  

### **1.1 Criar PlanController**
- [ ] Criar `backend/src/controllers/PlanController.ts`
- [ ] Implementar métodos CRUD (create, read, update, delete)
- [ ] Adicionar validações Zod para entrada de dados
- [ ] Implementar tratamento de erros consistente

### **1.2 Adicionar Rotas de Planos**
- [ ] Criar `backend/src/routes/plans.routes.ts`
- [ ] Registrar rotas em `app.ts`: `/api/v1/plans`
- [ ] Adicionar middleware de autenticação
- [ ] Implementar autorização baseada em roles

### **1.3 Atualizar Schema do Prisma**
- [ ] Adicionar campo `pagbank_plan_id` no modelo Plan
- [ ] Criar migration para o novo campo
- [ ] Atualizar tipos TypeScript gerados

### **1.4 Implementar Seed de Planos**
- [ ] Criar script para popular planos iniciais
- [ ] Garantir que planos existem no banco de dados
- [ ] Validar dados de seed (preços, features, limites)

---

## **FASE 2: BACKEND - PAGBANK SYNC** 🔄
**Duração:** 1 semana  
**Status:** Pendente  

### **2.1 Sincronização de Planos**
- [ ] Modificar `PlanController.create()` para criar plano no PagBank
- [ ] Implementar `PagBankService.syncPlan()`
- [ ] Mapear campos locais ↔ PagBank (preço, intervalo, trial)
- [ ] Tratamento de erros de sincronização

### **2.2 Trial Management**
- [ ] Implementar trial de 7 dias no `PagBankService`
- [ ] Configurar `trial.days: 7` nos planos PagBank
- [ ] Lógica de cobrança no 8º dia
- [ ] Status tracking (trial → active → past_due)

### **2.3 Webhooks para Planos**
- [ ] Atualizar `PagBankController.processWebhook()`
- [ ] Implementar eventos de plano (created, updated, deleted)
- [ ] Sincronização bidirecional de status
- [ ] Logging detalhado de webhooks

### **2.4 Configuração de Ambiente**
- [ ] Corrigir variáveis de ambiente PagBank
- [ ] Unificar `PAGBANK_TOKEN` vs `PAGBANK_API_KEY`
- [ ] Verificar URLs (PagSeguro vs PagBank)
- [ ] Testar credenciais em sandbox

---

## **FASE 3: ADMIN - MANAGEMENT UI** 👨‍💼
**Duração:** 1 semana  
**Status:** Pendente  

### **3.1 Página de Planos**
- [ ] Criar `admin/src/pages/Plans.tsx`
- [ ] Interface CRUD para planos (criar/editar/deletar)
- [ ] Tabela com listagem de planos ativos
- [ ] Filtros e busca por nome/status

### **3.2 Dashboard de Assinaturas**
- [ ] Criar `admin/src/pages/Subscriptions.tsx`
- [ ] Visualizar assinaturas ativas por plano
- [ ] Métricas: MRR, churn rate, conversões
- [ ] Filtros por status, plano, período

### **3.3 Integração com Backend**
- [ ] Criar hooks para API de planos
- [ ] Implementar chamadas REST para CRUD
- [ ] Tratamento de loading states e erros
- [ ] Real-time updates com polling/SSE

### **3.4 Relatórios e Analytics**
- [ ] Gráficos de receita mensal/anual
- [ ] Taxa de conversão por plano
- [ ] Análise de churn por período
- [ ] Exportação de dados (CSV/PDF)

---

## **FASE 4: FLOW - USER EXPERIENCE** 💳
**Duração:** 1 semana  
**Status:** Pendente  

### **4.1 API Integration**
- [ ] Modificar `flow/src/app/planos/page.tsx`
- [ ] Substituir dados estáticos por API calls
- [ ] Criar hook `usePlans()` para buscar planos
- [ ] Loading states e error handling

### **4.2 Checkout Flow**
- [ ] Implementar fluxo de contratação
- [ ] Formulário de dados de cobrança
- [ ] Integração com criptografia PagBank
- [ ] Validação de dados de pagamento

### **4.3 Subscription Management**
- [ ] Página de gerenciamento de assinatura
- [ ] Upgrade/downgrade de planos
- [ ] Cancelamento de assinatura
- [ ] Histórico de pagamentos

### **4.4 Payment Methods**
- [ ] Suporte a cartão de crédito
- [ ] Integração com PIX
- [ ] Suporte a boleto bancário
- [ ] Gerenciamento de métodos salvos

---

## **FASE 5: TESTING & DEPLOYMENT** 🧪
**Duração:** 0.5 semana  
**Status:** Pendente  

### **5.1 Testes Unitários**
- [ ] Testes para `PlanController`
- [ ] Testes para `PagBankService`
- [ ] Cobertura > 80% dos métodos críticos
- [ ] Mocks para API externa PagBank

### **5.2 Testes de Integração**
- [ ] Testes E2E para fluxo completo
- [ ] Testes de webhooks PagBank
- [ ] Testes de sincronização de dados
- [ ] Cenários de erro e edge cases

### **5.3 Deployment**
- [ ] Configuração de produção PagBank
- [ ] Migração de dados existente
- [ ] Rollback plan para assinaturas
- [ ] Monitoramento de métricas pós-deploy

---

## **DEPENDÊNCIAS E PRÉ-REQUISITOS** 📋

### **Técnicos**
- ✅ PagBank business account
- ✅ Credenciais de sandbox/produção
- ✅ Schema do Prisma atualizado
- ✅ Backend compilando sem erros

### **Funcionais**
- ✅ Modelos Plan/Subscription/PaymentMethod
- ✅ PagBankService com métodos básicos
- ✅ Autenticação JWT funcionando
- ✅ Admin panel acessível

---

## **CRITÉRIOS DE ACEITAÇÃO** ✅

### **Backend**
- [ ] PlanController com CRUD completo
- [ ] Sincronização automática com PagBank
- [ ] Trial de 7 dias funcionando
- [ ] Webhooks processando eventos

### **Admin**
- [ ] Interface completa para gestão de planos
- [ ] Dashboard de assinaturas com métricas
- [ ] Relatórios de receita e churn
- [ ] UX responsiva e intuitiva

### **Flow App**
- [ ] Página de planos dinâmica (API-driven)
- [ ] Checkout flow completo
- [ ] Gerenciamento de assinaturas
- [ ] Suporte a múltiplos métodos de pagamento

### **Qualidade**
- [ ] Testes unitários > 80% cobertura
- [ ] Testes E2E passando
- [ ] Documentação atualizada
- [ ] Performance otimizada

---

## **RISCOS E MITIGAÇÕES** ⚠️

### **Riscos Técnicos**
- **API PagBank instável**: Implementar retry logic e fallbacks
- **Sincronização de dados**: Logs detalhados e reconciliation jobs
- **Webhooks não entregues**: Implementar polling como backup

### **Riscos de Negócio**
- **Perda de dados**: Backups frequentes e migration reversível
- **Cobrança duplicada**: Idempotency keys e validações
- **Churn durante migração**: Comunicação clara com usuários

### **Riscos Operacionais**
- **Credenciais expostas**: Environment variables e secrets management
- **Rate limits PagBank**: Queue system e throttling
- **Monitoramento**: Alertas para falhas de cobrança

---

## **MÉTRICAS DE SUCESSO** 📊

- **Conversão**: > 70% dos trials convertem para pago
- **Churn**: < 5% no primeiro mês
- **MRR**: R$ 50.000+ no primeiro trimestre
- **Satisfação**: > 4.5/5 no NPS
- **Performance**: < 2s para checkout completo