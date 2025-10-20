# 📋 Análise de Implementação: Tasks 7, 8, 9 e 10

> **Data de Análise:** 02/10/2025  
> **Objetivo:** Identificar o que pode ser implementado no backend sem depender de configurações externas  
> **Status:** ✅ Análise Completa

---

## 📊 Resumo Executivo

| Task | Subtasks | Status | Bloqueios | Tempo Est. |
|------|----------|--------|-----------|------------|
| **Task 9** | 7 subtasks | ✅ 100% | Nenhum | 2-3 dias |
| **Task 10** | 5 subtasks | ⚠️ 90% | S3/R2 (mock OK) | 2-3 dias |
| **Task 7.2** | 5 subtasks | ✅ 100% | Conta WhatsApp (após) | 2 dias |
| **Task 8.1** | 4 subtasks | ✅ 100% | API Key PagBank (após) | 2 dias |
| **TOTAL** | **21 subtasks** | **~95%** | Configs externas | **8-10 dias** |

---

## 🎯 Ordem de Implementação Recomendada

### 1️⃣ **PRIORIDADE MÁXIMA: Task 9 (Sistema de Projeções + Metas)**

**Por quê começar por aqui:**
- ✅ 100% independente de serviços externos
- ✅ Alto valor para usuário (insights financeiros)
- ✅ Diferencial competitivo forte
- ✅ Usa dados que já existem no banco
- ✅ Pode testar imediatamente
- ✅ Sem bloqueios de configuração

**Tempo estimado:** 2-3 dias

---

### 2️⃣ **PRIORIDADE ALTA: Task 10 (Relatórios PDF/Excel)**

**Por quê em segundo:**
- ✅ Feature premium importante
- ✅ 90% implementável (mock S3 local temporário)
- ✅ Geração assíncrona com Bull
- ⚠️ S3/R2 pode usar mock até obter credentials

**Tempo estimado:** 2-3 dias

---

### 3️⃣ **PRIORIDADE MÉDIA: Task 7.2 (WhatsApp Service)**

**Por quê em terceiro:**
- ✅ Deixar código 100% pronto
- ✅ Sistema de créditos crítico para monetização
- ⚠️ Só ativar em produção quando configurar conta WhatsApp

**Tempo estimado:** 2 dias

---

### 4️⃣ **PRIORIDADE MÉDIA: Task 8.1 (PagBank Service)**

**Por quê em quarto:**
- ✅ Critical para monetização
- ✅ Webhooks + assinaturas recorrentes
- ⚠️ Só ativar em produção quando obter credentials sandbox

**Tempo estimado:** 2 dias

---

## ✅ Detalhamento: O Que Pode Ser Implementado AGORA

---

## 📱 Task 7.2 - WhatsApp Business Service

### ✅ **7.2.1 - WhatsAppService para envio de templates**

**Implementar:**
- Service completo com `sendTemplate(phoneNumber, templateName, params)`
- Validação formato E.164: `+5511999999999`
- Retry 3x com exponential backoff
- Tracking de custo por mensagem (~R$ 0,40-0,80)

**Arquivos:**
- `src/services/WhatsAppService.ts`
- `src/interfaces/WhatsAppService.interface.ts`
- `src/validators/whatsapp.validator.ts`

---

### ✅ **7.2.2 - Sistema de créditos por plano**

**Implementar:**
- Model `WhatsAppCredit` (user_id, used, limit, reset_date)
- Validação por plano:
  - **Basic:** 50 mensagens/mês
  - **Pro:** 200 mensagens/mês
  - **Premium:** Ilimitado
- Retorno HTTP 402 quando créditos esgotados

**Arquivos:**
- Adicionar ao `prisma/schema.prisma`
- `src/services/WhatsAppCreditService.ts`

---

### ✅ **7.2.3 - Bull queue para envios assíncronos**

**Implementar:**
- Queue `whatsappQueue` (on-demand, sem cron)
- Worker com sistema de prioridade:
  - **urgent:** payment_overdue
  - **normal:** delivery_notification, payment_reminder
- Status tracking: enviado, entregue, lido, falhado

**Arquivos:**
- `src/queues/whatsappQueue.ts`
- `src/workers/sendWhatsAppWorker.ts`

---

### ✅ **7.2.4 - Webhook para status de mensagens**

**Implementar:**
- `POST /webhooks/whatsapp/status` - Receber callbacks Meta
- Validação de signature do webhook
- Atualização de status (enviado → entregue → lido)
- Retry logic para mensagens falhadas

**Arquivos:**
- `src/controllers/WhatsAppWebhookController.ts`
- `src/routes/whatsapp.webhook.routes.ts`

---

### ✅ **7.2.5 - Endpoints de integração WhatsApp**

**Implementar:**
- `POST /integrations/whatsapp/connect` - Salvar Phone Number ID + Access Token
- `POST /integrations/whatsapp/send` - Enviar mensagem (valida créditos)
- `GET /integrations/whatsapp/credits` - Ver créditos usados/disponíveis
- `GET /integrations/whatsapp/history` - Histórico de mensagens enviadas

**Arquivos:**
- `src/controllers/WhatsAppController.ts`
- `src/routes/whatsapp.routes.ts`

**📌 Nota:** Código fica 100% pronto. Só falta configurar conta WhatsApp Business (Task 7.1 - lado do cliente).

---

## 💳 Task 8.1 - PagBank Service (Pagamentos e Assinaturas)

### ✅ **8.1.2 - Implementar criação de assinatura**

**Implementar:**
- `POST /api/pagbank/subscriptions` - Criar assinatura recorrente
- Configurar trial: 7 dias sem cobrança
- Planos:
  - **Basic:** R$ 59,90/mês
  - **Pro:** R$ 99,90/mês
  - **Premium:** R$ 109,90/mês
- Salvar `subscription_id` no modelo Subscription

**Arquivos:**
- `src/services/PagBankService.ts`
- `src/interfaces/PagBankService.interface.ts`
- `src/validators/pagbank.validator.ts`

---

### ✅ **8.1.3 - Webhook confirmação de pagamento**

**Implementar:**
- `POST /webhooks/pagbank/payment` - Receber notificação de cobrança
- Validação de signature (autenticidade)
- Atualização de status: `TRIAL → ACTIVE`
- Enviar email de confirmação ao usuário

**Arquivos:**
- `src/controllers/PagBankWebhookController.ts`
- `src/routes/pagbank.webhook.routes.ts`

---

### ✅ **8.1.4 - Webhooks cancelamento e falha**

**Implementar:**
- `subscription_cancelled` → Atualizar status para `CANCELLED`
- `payment_failed` → Notificar usuário, retry em 3 dias
- `subscription_suspended` → Bloquear acesso após 3 falhas

**Arquivos:**
- Handlers no `PagBankWebhookController.ts`

---

### ✅ **8.1.5 - Endpoints de assinaturas**

**Implementar:**
- `GET /subscriptions/current` - Ver assinatura atual do usuário
- `POST /subscriptions/upgrade` - Fazer upgrade de plano (cobrar proporcional)
- `POST /subscriptions/cancel` - Cancelar assinatura (mantém até fim do período)
- `GET /subscriptions/invoices` - Listar faturas pagas

**Arquivos:**
- `src/controllers/SubscriptionController.ts`
- `src/routes/subscription.routes.ts`

**📌 Nota:** Código fica pronto com sandbox mode. Só falta obter API Key/Secret PagBank (Task 8.1.1).

---

## 📈 Task 9 - Sistema de Projeções Financeiras

### ✅ **9.1.1 - Algoritmo de projeção com médias móveis**

**Implementar:**
- Cálculo de médias móveis: 7 dias, 30 dias, 90 dias
- Detecção de tendência:
  - **Crescimento:** média atual > média anterior
  - **Estável:** variação < 5%
  - **Queda:** média atual < média anterior
- 3 cenários de projeção:
  - **Pessimista:** -20% da tendência
  - **Realista:** tendência atual
  - **Otimista:** +30% da tendência
- Cálculo de confiança baseado em variância dos dados históricos

**Arquivos:**
- `src/services/ProjectionService.ts`
- `src/interfaces/ProjectionService.interface.ts`

---

### ✅ **9.1.2 - Ajuste de sazonalidade**

**Implementar:**
- Identificar padrões por dia da semana
- Ajustar projeções considerando sazonalidade
- Exemplo: Finais de semana com -30% vendas

**Arquivos:**
- Helper methods no `ProjectionService.ts`

---

### ✅ **9.1.3 - Cache de projeções**

**Implementar:**
- Cache key: `projections:${userId}:${period}`
- TTL: 6 horas (21600s)
- Invalidar cache em:
  - Nova venda criada
  - Sync Coinzz completo
  - Sync Facebook completo

**Arquivos:**
- Cache logic no `ProjectionService.ts`

---

### ✅ **9.1.4 - Endpoints de projeções**

**Implementar:**
- `GET /projections/sales?period=30` - Projeção de vendas (3 cenários)
- `GET /projections/cashflow?period=90` - Projeção de fluxo de caixa
- `GET /projections/health-score` - Score 0-100% de saúde financeira

**Arquivos:**
- `src/controllers/ProjectionController.ts`
- `src/routes/projection.routes.ts`

---

### ✅ **9.2.1 - GoalService CRUD**

**Implementar:**
- Criar, listar, atualizar, deletar metas
- Cálculo automático de progresso: `(valor_atual / valor_alvo) * 100`
- Limite: 5 metas ativas simultâneas por usuário

**Arquivos:**
- `src/services/GoalService.ts`
- `src/interfaces/GoalService.interface.ts`

---

### ✅ **9.2.2 - Notificações de progresso**

**Implementar:**
- Notificar quando atingir 80% da meta
- Notificar quando atingir 100% da meta
- Enviar email e/ou notificação in-app

**Arquivos:**
- `src/services/NotificationService.ts` (ou adicionar no GoalService)

---

### ✅ **9.2.3 - Endpoints de metas**

**Implementar:**
- `GET /goals` - Listar metas do usuário
- `POST /goals` - Criar nova meta com validação
- `PUT /goals/:id` - Atualizar meta
- `DELETE /goals/:id` - Remover meta

**Arquivos:**
- `src/controllers/GoalController.ts`
- `src/routes/goal.routes.ts`

**📌 Nota:** 100% independente de serviços externos. Não tem bloqueios!

---

## 📊 Task 10 - Sistema de Relatórios (PDF/Excel)

### ✅ **10.1.1 - Puppeteer para geração de PDF**

**Implementar:**
- Instalar puppeteer: `npm install puppeteer @types/puppeteer`
- Criar templates HTML com Tailwind CSS inline
- Implementar `generatePDF(reportData)` retornando Buffer

**Arquivos:**
- `src/services/ReportService.ts`
- `src/templates/report.html.ts` (template strings)

---

### ✅ **10.1.2 - XLSX para geração de Excel**

**Implementar:**
- Instalar xlsx: `npm install xlsx @types/xlsx`
- Implementar `generateExcel(reportData)` com múltiplas sheets:
  - Sheet 1: Resumo
  - Sheet 2: Vendas
  - Sheet 3: Anúncios
  - Sheet 4: Projeções
- Formatar células: moeda (R$), porcentagem (%), datas (DD/MM/YYYY)

**Arquivos:**
- Adicionar methods no `ReportService.ts`

---

### ✅ **10.1.3 - Bull queue para geração assíncrona**

**Implementar:**
- Queue `reportQueue` (on-demand, sem cron)
- Worker gera relatório (PDF ou Excel) e faz upload
- Timeout de 5 minutos por relatório
- Enviar email com link quando pronto

**Arquivos:**
- `src/queues/reportQueue.ts`
- `src/workers/generateReportWorker.ts`

---

### ⚠️ **10.1.4 - Upload para S3/Cloudflare R2**

**Implementar AGORA (com mock):**
- Interface abstrata `IStorageProvider`
- Implementação `LocalStorageProvider` (salvar em `/tmp/reports`)
- Implementação `S3StorageProvider` (preparar para futuro)
- Gerar URLs assinadas (válidas por 7 dias)
- Implementar cleanup automático de relatórios >30 dias

**Implementar DEPOIS (com credentials):**
- Configurar AWS SDK ou Cloudflare R2 SDK
- Obter credentials e configurar em produção

**Arquivos:**
- `src/interfaces/IStorageProvider.ts`
- `src/providers/LocalStorageProvider.ts`
- `src/providers/S3StorageProvider.ts`

---

### ✅ **10.1.5 - Endpoints de relatórios**

**Implementar:**
- `POST /reports/generate` - Enfileirar geração de relatório
- `GET /reports/:id/status` - Ver status (gerando, pronto, erro)
- `GET /reports/:id/download` - Download via URL assinada
- `GET /reports` - Listar relatórios gerados (paginado)

**Arquivos:**
- `src/controllers/ReportController.ts`
- `src/routes/report.routes.ts`

**📌 Nota:** 90% pronto. S3/R2 pode usar mock local até obter credentials.

---

## ❌ Bloqueios Externos (Não Pode Fazer Agora)

### **Task 7.1 - WhatsApp Business Account Setup**
- ❌ Criar conta Meta Business Suite
- ❌ Obter Phone Number ID + Access Token
- ❌ Criar e aprovar templates (2-5 dias úteis)

### **Task 8.1.1 - PagBank Account Setup**
- ❌ Criar conta PagBank/PagSeguro
- ❌ Obter API Key + Secret (sandbox)
- ❌ Configurar webhook URL

### **Task 10.1.4 - S3/R2 Credentials (parcial)**
- ✅ Pode implementar com mock local
- ❌ Precisa credentials para production

---

## 💡 Recomendação Final

### **Comece pela Task 9 (Sistema de Projeções)**

**Razões:**
1. ✅ Não tem bloqueios
2. ✅ Adiciona muito valor (core feature)
3. ✅ Usa dados que já existem no banco
4. ✅ Pode testar imediatamente
5. ✅ Diferencial competitivo forte

**Próximos Passos:**
1. Implementar Task 9 completa (2-3 dias)
2. Implementar Task 10 com mock S3 (2-3 dias)
3. Implementar Task 7.2 (código pronto) (2 dias)
4. Implementar Task 8.1 (código pronto) (2 dias)

---

## 📝 Checklist de Implementação

### Fase 1: Projeções e Metas (Task 9)
- [ ] ProjectionService.ts - Algoritmo médias móveis
- [ ] ProjectionService.ts - Ajuste sazonalidade
- [ ] ProjectionService.ts - Cache Redis (6h)
- [ ] ProjectionController.ts - 3 endpoints
- [ ] GoalService.ts - CRUD completo
- [ ] GoalService.ts - Notificações (80%, 100%)
- [ ] GoalController.ts - 4 endpoints

### Fase 2: Relatórios (Task 10)
- [ ] ReportService.ts - Puppeteer PDF
- [ ] ReportService.ts - XLSX Excel
- [ ] generateReportWorker.ts - Bull queue
- [ ] LocalStorageProvider.ts - Mock S3
- [ ] ReportController.ts - 4 endpoints

### Fase 3: WhatsApp (Task 7.2)
- [ ] WhatsAppService.ts - sendTemplate()
- [ ] WhatsAppCreditService.ts - Sistema créditos
- [ ] sendWhatsAppWorker.ts - Bull queue
- [ ] WhatsAppWebhookController.ts - Status webhook
- [ ] WhatsAppController.ts - 4 endpoints

### Fase 4: PagBank (Task 8.1)
- [ ] PagBankService.ts - Criar assinatura
- [ ] PagBankWebhookController.ts - 3 webhooks
- [ ] SubscriptionController.ts - 4 endpoints

---

**🚀 Pronto para começar? Comece pela Task 9!**