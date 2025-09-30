# 📋 BRIEFING TÉCNICO - FLOWZZ PLATFORM

## 🎯 RESUMO EXECUTIVO

**Produto:** Plataforma SaaS de contabilidade e gestão financeira para afiliados de produtos físicos  
**Modelo:** Pagamento após entrega (Cash on Delivery)  
**Status:** Front-end pronto | Integrações pendentes  
**Mercado:** R$ 15+ milhões/mês (baseado em dados Coinzz)

---

## 👥 PÚBLICO-ALVO

**Perfil:** Afiliados de produtos físicos que trabalham com:

- Vendas através do Facebook Ads
- Pagamento após entrega do produto
- Gestão de múltiplos clientes
- Necessidade de controle financeiro preciso

**Dor Principal:** Dificuldade em ter visão clara do lucro real considerando inadimplência, gastos com anúncios e outras despesas.

---

## 💰 MODELO DE NEGÓCIO

### Planos de Assinatura

|Plano|Volume|Preço/Mês|Público|
|---|---|---|---|
|Basic|0-100 vendas|R$ 59,90|Iniciantes|
|Pro|100-200 vendas|R$ 99,90|Intermediários|
|Premium|200+ vendas|R$ 109,90|Avançados|

**Trial:** 7 dias gratuitos (exige cartão)  
**Objetivo Trial:** Captura de leads qualificados + aquecimento de base

### Parceria Desenvolvedor

- **10 primeiros clientes:** 100% para desenvolvedor
- **A partir do 11º:** 20% contínuo de todas assinaturas
- **Participação societária:** 30% mediante contrato

---

## 🔌 INTEGRAÇÕES ESSENCIAIS

### 1. **Coinzz** ⚠️ CRÍTICO

**Status:** API não documentada publicamente  
**Ação Necessária:** Contato imediato com suporte técnico

**Dados Necessários:**

- Vendas realizadas (valores, datas, status)
- Comissões do afiliado
- Dados de clientes (nome, telefone, endereço)
- Status de pagamento (pago, pendente, inadimplente)
- Status de entrega

### 2. **Facebook Ads Marketing API**

**Status:** ✅ Documentação completa disponível

**Dados Necessários:**

- Gastos diários com anúncios
- Métricas: impressões, cliques, CPC, CPM, CTR
- Performance por campanha
- Dados históricos (últimos 30 dias)

**Endpoints Principais:**

```
GET /act_{ad-account-id}/insights
Parâmetros: date_preset, fields, level, time_increment
```

### 3. **WhatsApp Business Cloud API**

**Status:** ✅ Documentação completa disponível

**Funcionalidades:**

- Notificações automáticas de entrega
- Alertas de pagamentos agendados
- Lembretes de cobranças

**Custos:** ~R$ 0,40-0,80 por conversa (Brasil)

### 4. **PagBank API** (Pagamentos)

**Status:** ✅ Documentação completa disponível

**Funcionalidades:**

- Processamento de assinaturas mensais recorrentes
- Suporte a cartão de crédito, PIX e boleto bancário
- Gestão automática de trial gratuito (7 dias)
- Webhooks para confirmação de pagamentos e falhas
- Dashboard de faturamento e histórico de pagamentos

**Dados Necessários:**

- Dados do cliente (nome, email, CPF/CNPJ)
- Informações de cobrança (valor, frequência)
- Método de pagamento preferido
- Status de assinatura (ativa, cancelada, em trial)

---

## 🎨 ESTRUTURA DA PLATAFORMA

### Módulos Principais

#### 1. **Dashboard**

- Visão geral financeira do dia
- Saldo de pagamentos agendados
- Lucro real (vendas - custos - inadimplência)
- Métricas últimos 30 dias
- Próximos pagamentos (24h e 7 dias)

#### 2. **Clientes**

- Lista de todos os clientes
- Sistema de etiquetas customizáveis (ex: "Agendado 10/09")
- Status de pagamento individual
- Histórico de compras
- Integração com Logzz (entregas)

#### 3. **Integrações**

- Conexão WhatsApp Business
- Conexão Facebook Ads
- Conexão Coinzz
- Status de sincronização

#### 4. **Projeções**

- Lucro projetado mensal
- Análise de tendências
- Metas vs. Realizado
- ROI por campanha

#### 5. **Pagamentos Agendados**

- Calendário financeiro
- Pagamentos hoje
- Próximos 7 dias
- Alertas automáticos

#### 6. **Configurações**

- Dados da conta
- Plano e faturamento
- Integrações
- Preferências de notificação

#### 7. **Suporte**

- Tutoriais em vídeo
- FAQ
- Chat (08h-17h)
- Guias de configuração

---

## 🎯 PROBLEMAS RESOLVIDOS

### Problema 1: Gestão de Inadimplência

**Situação:** Plataformas marcam cliente como inadimplente mesmo quando pagamento está apenas agendado

**Solução Flowzz:**

- Sistema de etiquetas customizáveis
- Dashboard mostra separadamente: inadimplentes reais vs. agendados
- Saldo total de pagamentos agendados visível

### Problema 2: Falta de Visão Consolidada

**Situação:** Facebook Ads não integra vendas e não considera outras despesas

**Solução Flowzz:**

- Resumo diário automático: vendas + gastos anúncios + despesas
- Inclui: impostos, salários, comissões
- Lucro líquido real em tempo real

### Problema 3: Ausência de Relatórios 30 Dias

**Situação:** Coinzz requer múltiplos filtros para ver dados mensais

**Solução Flowzz:**

- Dashboard automático últimos 30 dias
- Filtros customizáveis
- Comparativos com períodos anteriores

### Problema 4: Falta de Notificações

**Situação:** Só descobre que cliente recebeu produto entrando na plataforma

**Solução Flowzz:**

- WhatsApp automático quando produto é entregue
- Dados na mensagem: nome, telefone, valor
- Facilita cobrança proativa

### Problema 5: Lucro Real Inexistente

**Situação:** Nenhuma plataforma mostra lucro considerando todas variáveis

**Solução Flowzz:**

- Considera dívidas cartão de crédito
- Mostra disponível até vencimento fatura
- Projeções baseadas em vendas confirmadas
- Sistema de metas mensais

---

## 🛠️ STACK TECNOLÓGICO RECOMENDADO

### Frontend (Usuário e Admin)

```
Next.js (React Framework)
- SSR/SSG para performance
- API Routes para endpoints leves
- App Router para navegação moderna
- Integração nativa com HeroUI

HeroUI (Component Library)
- Componentes acessíveis e modernos
- Tema consistente (dark/light mode)
- Otimização para mobile responsivo
- Integração perfeita com Next.js
```

### Site Público (Landing Page/Marketing)

```
Next.js (Páginas Públicas)
- Landing page otimizada para conversão
- SEO avançado com meta tags dinâmicas
- Formulários de cadastro para trial
- Páginas institucionais (sobre, preços, contato)
- Blog Link para o WordPress (CMS)
```

### Backend

```
Node.js + Express/Fastify
- APIs RESTful com OpenAPI 3.0
- Escalável e performático
- SDKs oficiais para integrações
- Suporte a TypeScript
```

### Banco de Dados

```
PostgreSQL (principal)
- Dados relacionais complexos
- Transações ACID
- JSONB para dados flexíveis
- Índices otimizados para queries

Redis (cache + filas)
- Cache de dados Facebook Ads
- Sessões de usuário
- Filas de notificações WhatsApp
- Rate limiting distribuído
```

### APIs e Documentação

```
OpenAPI 3.0 (Swagger)
- Documentação automática de APIs
- Cliente SDK gerado automaticamente
- Testes de contrato
- Portal de desenvolvedor
```

### Autenticação e Segurança

```
NextAuth.js (Frontend)
- OAuth providers (Google, Facebook)
- JWT tokens seguros
- Sessões persistentes
- Integração com backend

JWT + OAuth 2.0 (Backend)
- Autenticação stateless
- Refresh tokens
- Autorização baseada em roles
- 2FA opcional
```

### ORM e Data Access

```
Prisma ORM
- Type-safe database access
- Migrations automáticas
- Schema como código
- Suporte a PostgreSQL avançado
```

### Processamento e Background Jobs

```
Bull (Queue System)
- Filas para notificações WhatsApp
- Processamento de webhooks
- Jobs agendados (cron-like)

Cron Jobs (Node-cron)
- Sincronização periódica de dados
- Limpeza de cache
- Relatórios automáticos
```

### Testes e Qualidade

```
Jest + React Testing Library (Frontend)
- Testes unitários e de integração
- Componentes e hooks
- Cobertura de código >80%

Jest + Supertest (Backend)
- APIs e lógica de negócio
- Testes de integração com DB
- Mocks para APIs externas
```

### Monitoramento e Observabilidade

```
Sentry
- Error tracking em tempo real
- Performance monitoring
- User feedback integrado
- Alertas automáticos

DataDog / New Relic (opcional)
- Métricas de infraestrutura
- APM (Application Performance Monitoring)
- Logs centralizados
```

### Deploy e Infraestrutura

```
Netlify (Frontend)
- Deploy automático do Next.js
- CDN global integrado
- Preview deployments
- Formulários e analytics integrados

Railway / Render (Backend)
- Deploy simplificado
- PostgreSQL managed
- Escalabilidade automática
- Logs e monitoring

AWS/GCP (Produção Escala)
- ECS/Fargate para containers
- RDS para PostgreSQL
- CloudFront para CDN
- Lambda para serverless
```

### Ferramentas de Desenvolvimento

```
TypeScript (Linguagem)
- Type safety end-to-end
- Melhor DX e manutenção
- Suporte em Next.js/Node.js

ESLint + Prettier
- Code quality consistente
- Formatação automática
- Regras personalizadas

GitHub Actions
- CI/CD pipelines
- Testes automatizados
- Deploy automático
```

### Considerações Adicionais

**Justificativa da Stack:**
- **Next.js + HeroUI**: Frontend moderno, acessível e performático para usuário e admin em uma única aplicação com roles.
- **Node.js + OpenAPI**: Backend consistente com frontend, APIs bem documentadas para integrações futuras.
- **PostgreSQL + Prisma**: Dados relacionais robustos com type safety.
- **Redis + Bull**: Performance e processamento assíncrono para integrações pesadas.
- **NextAuth.js**: Autenticação simplificada integrada ao Next.js.

**Trade-offs:**
- Next.js pode ser overkill para admin simples, mas permite unificação.
- OpenAPI adiciona overhead, mas essencial para SaaS com integrações.
- HeroUI é novo, mas promissor; alternativa: Mantine ou Chakra UI.

**Próximos Passos:**
- Setup inicial com Next.js + Prisma
- Configuração OpenAPI com Swagger
- Implementação autenticação com NextAuth.js
- Testes de integração end-to-end

---

## 📊 ROADMAP DE DESENVOLVIMENTO

### FASE 1: MVP (4 semanas)

**Objetivo:** Versão mínima funcional

- [ ] Sistema de autenticação
- [ ] Integração básica Coinzz
- [ ] Dashboard principal
- [ ] Gestão de assinaturas
- [ ] Landing page

**Entregável:** Plataforma funcional para primeiros testes

### FASE 2: Integrações Avançadas (3 semanas)

- [ ] Facebook Ads API completa
- [ ] WhatsApp notificações
- [ ] Sistema de etiquetas
- [ ] Cálculo lucro real
- [ ] Sincronização automática

**Entregável:** Todas integrações funcionando

### FASE 3: Features Premium (3 semanas)

- [ ] Projeções financeiras
- [ ] Relatórios avançados
- [ ] Alertas inteligentes
- [ ] Otimizações UX
- [ ] Mobile responsivo

**Entregável:** Produto completo para lançamento

### FASE 4: Escala e Otimização (Contínuo)

- [ ] Performance optimization
- [ ] Novas funcionalidades (feedback)
- [ ] Expansão de integrações
- [ ] A/B testing
- [ ] Analytics avançado

---

## 💵 ESTIMATIVA DE CUSTOS

### Custos Fixos Mensais (Infraestrutura)

|Item|Valor Estimado|
|---|---|
|Servidor (VPS/Cloud)|R$ 150-300|
|Banco de Dados|R$ 100-200|
|CDN|R$ 50-100|
|Monitoramento|R$ 50|
|**TOTAL**|**R$ 350-650/mês**|

### Custos Variáveis (Por Cliente)

|Item|Custo Unitário|Base 100 clientes|
|---|---|---|
|WhatsApp API|R$ 0,50/mensagem|R$ 1.500/mês|
|Processamento|R$ 0,10/cliente|R$ 10/mês|
|Storage|Marginal|~R$ 20/mês|
|**TOTAL**|-|**R$ 1.530/mês**|

### Análise de Viabilidade (100 Clientes)

**Receita:**

- 50 clientes Basic (R$ 59,90) = R$ 2.995
- 30 clientes Pro (R$ 99,90) = R$ 2.997
- 20 clientes Premium (R$ 109,90) = R$ 2.198
- **Total:** R$ 8.190/mês

**Custos:**

- Infraestrutura: R$ 500
- WhatsApp (50 notif/cliente): R$ 2.500
- Outros: R$ 200
- **Total:** R$ 3.200/mês

**Lucro Bruto:** R$ 4.990/mês  
**Margem:** ~61%

⚠️ **Atenção:** Custos WhatsApp podem inviabilizar plano Basic. Considerar:

- Limitar notificações no Basic
- Incluir custo no preço
- Cobrar adicional por notificação

---

## 🚨 RISCOS E MITIGAÇÕES

|Risco|Impacto|Mitigação|
|---|---|---|
|**Coinzz sem API**|CRÍTICO|Contato urgente, web scraping temporário, parceria|
|**Custos WhatsApp altos**|Alto|Otimizar mensagens, incluir no preço|
|**Churn elevado**|Alto|Onboarding eficiente, suporte ativo|
|**Rate limits APIs**|Médio|Cache agressivo, otimização requests|
|**Bugs em produção**|Médio|Testes automatizados, monitoring|
|**Concorrência**|Médio|Foco no diferencial (Coinzz + físicos)|

---

## 📈 MÉTRICAS DE SUCESSO

### Curto Prazo (3 meses)

- 100+ usuários no trial
- 50+ assinaturas pagas (conv. 50%)
- NPS: 60+
- Churn: <10%/mês

### Médio Prazo (6 meses)

- 300+ assinaturas
- MRR: R$ 25.000+
- CAC: <3x LTV
- NPS: 70+

### Longo Prazo (12 meses)

- 1.000+ assinaturas
- MRR: R$ 100.000+
- Líder no nicho
- Expansão para novas plataformas

---

## 🎯 DIFERENCIAIS COMPETITIVOS

**vs. Utmify (principal concorrente):**

|Aspecto|Utmify|Flowzz|
|---|---|---|
|Público|Infoprodutores|Afiliados físicos|
|Plataformas|Hotmart, Monetizze|Coinzz, Facebook Ads|
|Inadimplência|❌|✅ Etiquetas|
|Notificações|Email|WhatsApp|
|Lucro Real|Parcial|Completo|
|Nicho|Saturado|Oceano azul|

**Vantagens Únicas:**

1. **Único** focado em produtos físicos pós-pago
2. **Único** com integração Coinzz
3. **Único** com sistema inteligente de inadimplência
4. WhatsApp automático para cobranças
5. Cálculo de lucro real considerando TODAS variáveis

---

## 🔐 COMPLIANCE E SEGURANÇA

### LGPD

- [ ] Termo de consentimento explícito
- [ ] Política de privacidade clara
- [ ] Direito ao esquecimento
- [ ] Criptografia de dados sensíveis
- [ ] Logs de acesso

### Segurança

- [ ] HTTPS obrigatório
- [ ] Rate limiting
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] 2FA para contas
- [ ] Backup diário automático

### APIs

- [ ] Respeitar rate limits
- [ ] Não armazenar dados FB >24h sem refresh
- [ ] Opt-in obrigatório WhatsApp
- [ ] Tokens seguros (env variables)

---

## 📞 PRÓXIMAS AÇÕES IMEDIATAS

### Desenvolvedor

1. ✅ Estudar documentação Facebook Ads API
2. ✅ Estudar documentação WhatsApp Business API
3. 🔴 **URGENTE:** Contatar Coinzz sobre API
4. ⏳ Criar conta Facebook for Developers
5. ⏳ Configurar ambiente de desenvolvimento
6. ⏳ Definir arquitetura do sistema

### Marketing (Cliente)

1. ⏳ Validar pricing considerando custos WhatsApp
2. ⏳ Preparar pitch para parceria Coinzz
3. ⏳ Criar estratégia de aquisição (trial 7 dias)
4. ⏳ Produzir conteúdo para landing page
5. ⏳ Definir funil de conversão

### Ambos

1. ⏳ Reunião de alinhamento técnico
2. ⏳ Definir milestones e prazos
3. ⏳ Formalizar contrato de parceria (70/30)
4. ⏳ Estabelecer metodologia de trabalho

---

## 📚 RECURSOS DISPONÍVEIS

### Documentação

- ✅ Front-end pronto (Lovable)
- ✅ Vídeo explicativo do projeto
- ✅ Facebook Ads API docs
- ✅ WhatsApp Business API docs
- ❌ Coinzz API (pendente)

### Ferramentas

- Facebook Graph API Explorer
- WhatsApp Business Manager
- Postman (testes de API)
- Git/GitHub (versionamento)

---

## 💡 RECOMENDAÇÕES FINAIS

### Prioridade MÁXIMA

**Resolver integração Coinzz esta semana.** Sem ela, não há produto.

### Estratégia de Lançamento

1. **Soft Launch:** 20 beta testers (gratuito 30 dias)
2. **Feedback Loop:** Ajustes baseados em uso real
3. **Hard Launch:** Campanhas pagas + afiliados

### Posicionamento

"A única plataforma que mostra o **lucro real** do seu negócio de afiliado de produtos físicos."

### Sugestão Pricing Ajustado

Considerar aumentar preços em 20-30% para absorver custos WhatsApp:

- Basic: R$ 79,90 (era R$ 59,90)
- Pro: R$ 119,90 (era R$ 99,90)
- Premium: R$ 139,90 (era R$ 109,90)

**Justificativa:** Notificações WhatsApp automatizadas são diferencial valioso.

---

## ⏰ TIMELINE REALISTA

|Fase|Duração|Dependências|
|---|---|---|
|Setup + Pesquisa|1 semana|API Coinzz|
|MVP Desenvolvimento|4 semanas|Setup|
|Integrações Avançadas|3 semanas|MVP|
|Testes e Ajustes|2 semanas|Integrações|
|Beta Testing|2 semanas|Testes|
|**TOTAL**|**12 semanas**|-|

**Data estimada de lançamento:** ~3 meses a partir de hoje

---

## 🎬 CONCLUSÃO

**Viabilidade:** ✅ Alta (com ressalvas)  
**Potencial de Mercado:** ⭐⭐⭐⭐⭐ (5/5)  
**Complexidade Técnica:** ⭐⭐⭐⭐ (4/5)  
**Risco Principal:** API Coinzz não disponível

**Decisão GO/NO-GO depende de:**

1. Confirmação de acesso à API Coinzz
2. Viabilidade financeira com custos WhatsApp
3. Comprometimento de 3+ meses de desenvolvimento

**Recomendação:** Projeto promissor e diferenciado. **Resolver gargalo Coinzz antes de investir tempo de desenvolvimento.**

---

_Documento preparado em: 30/09/2025_  
_Versão: 1.0_  
_Status: Aguardando confirmação API Coinzz_