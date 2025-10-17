# 📱 WhatsApp Business API - Templates e Implementação

## � **Arquitetura Multi-Tenant (SaaS)**

**Importante:** O Flowzz é uma plataforma SaaS onde cada usuário final configura suas próprias integrações. Isso significa:

### **Características da Arquitetura:**
- ✅ **Por Usuário:** Cada usuário configura suas próprias credenciais WhatsApp
- ✅ **Isolamento:** Dados e mensagens são segregados por usuário
- ✅ **Webhook Routing:** Webhooks são automaticamente roteados para o usuário correto
- ✅ **Configuração Independente:** Templates e números são gerenciados individualmente

### **Fluxo de Integração:**
1. **Usuário configura** suas credenciais no painel admin
2. **Sistema armazena** credenciais criptografadas por usuário
3. **Webhooks chegam** e são identificados automaticamente pelo `business_account_id`
4. **Mensagens são enviadas** usando as credenciais do usuário específico

### **Identificação de Usuário nos Webhooks:**
- `business_account_id`: ID da conta de negócio WhatsApp
- `phone_number_id`: ID do número de telefone configurado
- **Query automática:** Sistema busca qual usuário possui essas credenciais

---

## �🎯 **Templates Obrigatórios Identificados**

Baseado na análise da documentação (`apis.md`, `milestone02.md`, `Analise.md`), os seguintes templates são necessários:

### **1. Template: Notificação de Entrega** 📦
**Nome:** `entrega_confirmada`  
**Categoria:** UTILITY (Utilitário)  
**Idioma:** pt_BR  

**Conteúdo do Template:**
```
Olá {{1}}! 🎉

Seu pedido foi *entregue com sucesso*!

📦 Produto: {{2}}
💰 Valor: R$ {{3}}
📍 Entregue em: {{4}}

Obrigado por escolher nossos serviços!
Qualquer dúvida, estamos aqui para ajudar.
```

**Variáveis:**
- `{{1}}`: Nome do cliente
- `{{2}}`: Nome do produto
- `{{3}}`: Valor da venda
- `{{4}}`: Data/hora de entrega

**Cenário de Uso:** Quando produto é marcado como entregue no sistema

---

### **2. Template: Alerta de Pagamento** 💳
**Nome:** `pagamento_lembrete`  
**Categoria:** UTILITY (Utilitário)  
**Idioma:** pt_BR  

**Conteúdo do Template:**
```
Olá {{1}}! ⏰

Lembrete importante sobre seu pagamento:

💳 Valor: R$ {{2}}
📅 Vencimento: {{3}}

Para evitar suspensão do serviço, realize o pagamento até a data limite.

Pagar agora: {{4}}

Dúvidas? Entre em contato conosco.
```

**Variáveis:**
- `{{1}}`: Nome do cliente
- `{{2}}`: Valor do pagamento
- `{{3}}`: Data de vencimento
- `{{4}}`: Link de pagamento

**Cenário de Uso:** 24h antes do vencimento de pagamentos agendados

---

### **3. Template: Confirmação de Pagamento** ✅
**Nome:** `pagamento_confirmado`  
**Categoria:** UTILITY (Utilitário)  
**Idioma:** pt_BR  

**Conteúdo do Template:**
```
Olá {{1}}! ✅

Seu pagamento de *R$ {{2}}* foi confirmado com sucesso!

📊 Status: Pago
🕒 Data: {{3}}

Obrigado pela pontualidade!
Seus serviços continuam ativos.
```

**Variáveis:**
- `{{1}}`: Nome do cliente
- `{{2}}`: Valor pago
- `{{3}}`: Data do pagamento

**Cenário de Uso:** Quando pagamento é confirmado

---

## 🔧 **Estrutura de Implementação**

### **1. Model Prisma - Integration**
```prisma
model Integration {
  id          String   @id @default(cuid())
  user_id     String
  provider    IntegrationProvider
  status      IntegrationStatus @default(DISCONNECTED)
  config      Json? // { accessToken, phoneNumberId, businessAccountId }
  last_sync   DateTime?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, provider])
}

enum IntegrationProvider {
  WHATSAPP
  FACEBOOK_ADS
  COINZZ
  PAGBANK
}

enum IntegrationStatus {
  DISCONNECTED
  CONNECTING
  CONNECTED
  ERROR
}
```

### **2. Service - WhatsAppService**
```typescript
class WhatsAppService {
  // Enviar template
  async sendTemplate(templateName: string, to: string, variables: string[]): Promise<boolean>

  // Verificar status da conta
  async getAccountStatus(): Promise<AccountStatus>

  // Listar templates aprovados
  async getApprovedTemplates(): Promise<Template[]>

  // Webhook handler
  async handleWebhook(payload: WebhookPayload): Promise<void>
}
```

### **3. Controller - WhatsAppController**
```typescript
class WhatsAppController {
  // Webhook endpoint
  @Post('/webhook')
  async handleWebhook(@Body() payload: any)

  // Verificação inicial do webhook
  @Get('/webhook')
  async verifyWebhook(@Query() query: WebhookQuery)

  // Enviar notificação manual
  @Post('/send')
  async sendMessage(@Body() data: SendMessageDto)
}
```

### **4. Frontend - Configuração**
- Interface para conectar WhatsApp Business
- Status da conexão em tempo real
- Teste de envio de mensagem
- Histórico de notificações enviadas

---

## 📋 **Fluxo de Implementação**

### **Fase 1: Setup da Conta** 🔧
1. Criar conta Facebook Business
2. Configurar WhatsApp Business API
3. Obter tokens e credenciais
4. Configurar webhook URL

### **Fase 2: Templates** 📝
1. Criar templates no WhatsApp Manager
2. Submeter para aprovação
3. Aguardar aprovação (pode levar 24-48h)
4. Testar templates

### **Fase 3: Backend** ⚙️
1. Implementar WhatsAppService
2. Criar endpoints de webhook
3. Implementar lógica de notificações
4. Adicionar integração com eventos do sistema

### **Fase 4: Frontend** 🎨
1. Interface de configuração
2. Status da conexão
3. Histórico de mensagens
4. Testes funcionais

---

## 🎯 **Critérios de Aceitação**

- ✅ Templates aprovados no WhatsApp
- ✅ Webhooks funcionando (recebendo eventos)
- ✅ Notificações enviadas automaticamente
- ✅ Interface de configuração funcional
- ✅ Logs de entrega das mensagens
- ✅ Tratamento de erros e rate limits