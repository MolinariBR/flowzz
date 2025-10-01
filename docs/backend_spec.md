# 🏗️ **Especificação Técnica do Backend - Flowzz**

## 📋 **Visão Geral**

Este documento especifica os requisitos técnicos do backend para a plataforma Flowzz, baseado na análise completa das funcionalidades do frontend.

## 🗄️ **Estrutura de Dados (Models/Schemas)**

### **1. Usuário (User)**
```json
{
  "id": "uuid",
  "nome": "string",
  "email": "string (unique)",
  "telefone": "string",
  "cpf_cnpj": "string",
  "endereco": {
    "rua": "string",
    "numero": "string",
    "complemento": "string",
    "bairro": "string",
    "cidade": "string",
    "estado": "string",
    "cep": "string"
  },
  "avatar_url": "string",
  "plano_atual": "string",
  "status": "enum(active, inactive, suspended)",
  "data_cadastro": "datetime",
  "ultimo_acesso": "datetime",
  "preferencias": {
    "tema": "enum(light, dark)",
    "fuso_horario": "string",
    "formato_data": "string",
    "moeda": "string"
  }
}
```

### **2. Cliente (Client)**
```json
{
  "id": "uuid",
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "valor_pedido": "decimal",
  "status": "enum(pendente, pago, entregue, cancelado)",
  "etiquetas": ["array de tag_ids"],
  "data_cadastro": "datetime",
  "data_ultima_compra": "datetime",
  "observacoes": "text",
  "user_id": "uuid (FK)"
}
```

### **3. Etiqueta (Tag)**
```json
{
  "id": "uuid",
  "nome": "string",
  "cor": "string (hex)",
  "user_id": "uuid (FK)"
}
```

### **4. Venda (Sale)**
```json
{
  "id": "uuid",
  "cliente_id": "uuid (FK)",
  "valor": "decimal",
  "data_venda": "datetime",
  "status": "enum(pendente, pago, cancelado)",
  "forma_pagamento": "string",
  "observacoes": "text",
  "user_id": "uuid (FK)"
}
```

### **5. Anúncio/Campanha (Ad)**
```json
{
  "id": "uuid",
  "nome": "string",
  "plataforma": "enum(facebook, instagram, google)",
  "status": "enum(ativo, pausado, finalizado)",
  "orcamento_diario": "decimal",
  "orcamento_total": "decimal",
  "gasto_atual": "decimal",
  "impressoes": "integer",
  "cliques": "integer",
  "conversoes": "integer",
  "ctr": "decimal",
  "cpc": "decimal",
  "cpm": "decimal",
  "roas": "decimal",
  "data_inicio": "datetime",
  "data_fim": "datetime",
  "user_id": "uuid (FK)"
}
```

### **6. Integração (Integration)**
```json
{
  "id": "uuid",
  "provedor": "enum(facebook, coinzz, whatsapp, pagbank)",
  "status": "enum(conectado, desconectado, erro)",
  "configuracao": "json",
  "ultima_sincronizacao": "datetime",
  "webhook_url": "string",
  "user_id": "uuid (FK)"
}
```

### **7. Relatório (Report)**
```json
{
  "id": "uuid",
  "nome": "string",
  "tipo": "enum(vendas, financeiro, performance, clientes, anuncios)",
  "formato": "enum(pdf, excel, csv)",
  "parametros": "json",
  "status": "enum(gerando, pronto, erro)",
  "url_download": "string",
  "data_criacao": "datetime",
  "favorito": "boolean",
  "tags": ["array de strings"],
  "user_id": "uuid (FK)"
}
```

### **8. Meta (Goal)**
```json
{
  "id": "uuid",
  "titulo": "string",
  "descricao": "string",
  "valor_alvo": "decimal",
  "valor_atual": "decimal",
  "prazo": "date",
  "status": "enum(ativo, concluido, cancelado)",
  "categoria": "enum(receita, despesa, reserva)",
  "user_id": "uuid (FK)"
}
```

### **9. Plano/Assinatura (Subscription)**
```json
{
  "id": "uuid",
  "plano": "enum(mensal, anual)",
  "status": "enum(ativo, cancelado, suspenso)",
  "valor": "decimal",
  "data_inicio": "datetime",
  "data_fim": "datetime",
  "metodo_pagamento": "json",
  "user_id": "uuid (FK)"
}
```

## 🔗 **API Endpoints (OpenAPI 3.0)**

### **Autenticação**
```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
```

### **Dashboard**
```
GET    /dashboard/metrics
GET    /dashboard/activities
GET    /dashboard/chart
POST   /dashboard/filter
```

### **Clientes**
```
GET    /clients
POST   /clients
GET    /clients/{id}
PUT    /clients/{id}
DELETE /clients/{id}
POST   /clients/import
GET    /clients/export
POST   /clients/bulk-actions
```

### **Etiquetas**
```
GET    /tags
POST   /tags
PUT    /tags/{id}
DELETE /tags/{id}
```

### **Vendas**
```
GET    /sales
POST   /sales
GET    /sales/{id}
PUT    /sales/{id}
DELETE /sales/{id}
POST   /sales/whatsapp-charge
```

### **Anúncios**
```
GET    /ads/campaigns
POST   /ads/campaigns
GET    /ads/campaigns/{id}
PUT    /ads/campaigns/{id}
DELETE /ads/campaigns/{id}
GET    /ads/metrics
POST   /ads/sync
```

### **Integrações**
```
GET    /integrations
POST   /integrations/{provider}/connect
DELETE /integrations/{provider}/disconnect
POST   /integrations/{provider}/test
GET    /integrations/logs
```

### **Projeções**
```
GET    /projections/sales
GET    /projections/cashflow
GET    /projections/goals
POST   /projections/goals
PUT    /projections/goals/{id}
DELETE /projections/goals/{id}
GET    /projections/health-score
```

### **Relatórios**
```
GET    /reports
POST   /reports/generate
GET    /reports/{id}
DELETE /reports/{id}
GET    /reports/{id}/download
POST   /reports/{id}/favorite
POST   /reports/{id}/share
GET    /reports/templates
```

### **Configurações**
```
GET    /settings/profile
PUT    /settings/profile
POST   /settings/profile/avatar
PUT    /settings/preferences
GET    /settings/notifications
PUT    /settings/notifications
POST   /settings/change-password
GET    /settings/sessions
DELETE /settings/sessions/{id}
GET    /settings/export-data
DELETE /settings/account
```

### **Planos**
```
GET    /plans
GET    /subscriptions/current
POST   /subscriptions/upgrade
POST   /subscriptions/cancel
GET    /subscriptions/history
```

### **Ajuda**
```
GET    /help/categories
GET    /help/articles
GET    /help/search
POST   /help/contact
GET    /help/tickets
```

## 🔧 **Integrações Externas**

### **1. Facebook Ads API**
- Buscar campanhas ativas
- Obter métricas de performance
- Sincronização automática

### **2. Coinzz API**
- Integração com produtos
- Sincronização de vendas
- Webhooks de eventos

### **3. WhatsApp Business API**
- Envio de mensagens
- Cobranças automáticas
- Confirmações de entrega

### **4. PagBank API**
- Processamento de pagamentos
- Webhooks de confirmação
- Gestão de assinaturas

### **5. OpenAI API**
- Geração de conteúdo
- Análise de dados
- Recomendações inteligentes

## 🛠️ **Requisitos Técnicos**

### **Stack Tecnológica**
- **Linguagem**: Node.js + TypeScript
- **Framework**: Express.js ou Fastify
- **Banco**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT
- **Validação**: Zod
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest + Supertest
- **Cache**: Redis (opcional)

### **Arquitetura**
- **Padrão**: REST API
- **Versionamento**: `/api/v1/`
- **Autenticação**: Bearer Token (JWT)
- **Rate Limiting**: Por usuário/IP
- **Logs**: Estruturados com Winston
- **Monitoramento**: Health checks

### **Segurança**
- **HTTPS obrigatório**
- **CORS configurado**
- **Input sanitization**
- **SQL injection prevention**
- **Rate limiting**
- **API keys para integrações**

### **Performance**
- **Paginação** em listas grandes
- **Compressão** de respostas
- **Cache** para dados estáticos
- **Database indexing** adequado
- **Connection pooling**

## 📊 **Estimativa de Desenvolvimento**

### **Fases do Projeto**
1. **Setup Inicial** (1 semana)
   - Estrutura do projeto
   - Configuração banco
   - Autenticação básica

2. **Core API** (2 semanas)
   - Models principais
   - CRUD básico
   - Validações

3. **Funcionalidades Avançadas** (3 semanas)
   - Integrações externas
   - Relatórios
   - Projeções

4. **Testes e Documentação** (1 semana)
   - Testes unitários
   - Documentação OpenAPI
   - Deploy

**Total estimado**: 7 semanas para MVP funcional

## 🚀 **Próximos Passos**

1. **Criar estrutura do projeto** Node.js
2. **Configurar PostgreSQL + Prisma**
3. **Implementar autenticação JWT**
4. **Criar models principais**
5. **Desenvolver endpoints por módulo**
6. **Integrações externas**
7. **Testes e documentação**

---

*Este documento será atualizado conforme o desenvolvimento avança.*</content>
<parameter name="filePath">/home/mau/projetos/flowzz/docs/backend_spec.md