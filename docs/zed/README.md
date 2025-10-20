# 📚 DOCUMENTAÇÃO FLOWZZ - ÍNDICE

## 🎯 Visão Geral

Esta pasta contém toda a documentação de planejamento e especificação técnica do projeto Flowzz, seguindo a metodologia de User Stories e Design-Driven Development.

---

## 📄 Arquivos Disponíveis

### 1. **plan.md** - Plano Estratégico
📋 **Objetivo:** Visão estratégica completa do projeto

**Conteúdo:**
- Objetivos estratégicos e metas
- 4 Personas detalhadas (João, Maria, Carlos, Ana)
- 7 Jornadas principais mapeadas
- Roadmap executável (Releases 1.0 a 3.0)
- Modelo de monetização e projeções financeiras
- Métricas de sucesso (North Star Metrics)
- Riscos e mitigações
- Timeline consolidado

**Quando usar:** Para entender a visão macro do projeto, objetivos de negócio e roadmap.

---

### 2. **user-journeys.md** - Jornadas de Usuário
🗺️ **Objetivo:** Mapear experiência completa de cada persona

**Conteúdo:**
- 4 Personas com demografia, objetivos, frustrações e necessidades
- 6 Jornadas detalhadas fase a fase:
  1. Onboarding e Trial (7 dias)
  2. Uso Diário do Dashboard
  3. Gestão de Clientes e Etiquetas
  4. Configuração de Integrações
  5. Análise Financeira e Projeções
  6. Upgrade de Plano
- Cada fase inclui: Touchpoint, Emoção, Pensamento, Ação, Necessidade
- Métricas de sucesso por jornada

**Quando usar:** Para entender comportamento do usuário, pontos de fricção e oportunidades de melhoria.

---

### 3. **user-stories.md** - User Stories (Gherkin)
📖 **Objetivo:** Especificar funcionalidades do ponto de vista do usuário

**Conteúdo:**
- 9 Épicas principais
- 50+ User Stories em formato Gherkin
- Estrutura: Como [persona] / Quero [ação] / Para [benefício]
- Cenários: Principal, Alternativo, Exceção
- Critérios de aceitação verificáveis
- Estimativas em story points
- Prioridades (Crítica, Alta, Média)

**Épicas:**
1. Autenticação e Onboarding
2. Dashboard e Métricas
3. Gestão de Clientes
4. Projeções Financeiras
5. Notificações WhatsApp
6. Relatórios
7. Painel Admin
8. Integrações Externas
9. Configurações

**Quando usar:** Para desenvolvimento, testes e validação de funcionalidades.

---

### 4. **design.md** - Especificação Técnica
🏗️ **Objetivo:** Definir arquitetura, stack e padrões técnicos

**Conteúdo:**
- Arquitetura geral (diagramas)
- Stack tecnológica completa:
  - Frontend: Next.js 14 + HeroUI + TanStack Query
  - Backend: Node.js + Express + Prisma + PostgreSQL
  - Cache: Redis + Bull Queues
  - Integrações: Coinzz, Facebook Ads, WhatsApp, PagBank
- Padrões arquiteturais:
  - Domain-Driven Design (DDD)
  - Clean Architecture (layers)
  - Repository Pattern
- Segurança: JWT, RBAC, Rate Limiting
- Performance: Caching strategy, Database optimization
- Testing: Pirâmide de testes (Unit, Integration, E2E)
- DevOps: CI/CD, Monitoring, Deployment

**Quando usar:** Para decisões técnicas, setup de ambiente e implementação.

---

### 5. **dev-stories.md** - Developer Stories
🔧 **Objetivo:** Tasks técnicas para implementação

**Conteúdo:**
- 5 Épicas técnicas
- 25+ Dev Stories com tarefas detalhadas
- Código de exemplo e snippets
- Estruturas de pastas e arquivos
- Configurações de bibliotecas
- Queries SQL otimizadas
- Implementações de algoritmos (projeções, cálculos)

**Épicas:**
1. Setup e Infraestrutura
2. Core API - CRUD Básico
3. Integrações Externas
4. Features Avançadas
5. Painel Admin

**Quando usar:** Para implementação técnica, code review e onboarding de devs.

---

## 🚀 Como Usar Esta Documentação

### Para Product Owner / Gerente de Projeto
1. **Comece com:** `plan.md` - Entenda visão estratégica
2. **Continue com:** `user-journeys.md` - Visualize experiência do usuário
3. **Priorize:** `user-stories.md` - Defina backlog e sprints

### Para UX/UI Designer
1. **Comece com:** `user-journeys.md` - Entenda personas e jornadas
2. **Continue com:** `user-stories.md` - Veja cenários de uso
3. **Consulte:** `design.md` (seção UX/UI) - Padrões de design

### Para Desenvolvedor Backend
1. **Comece com:** `design.md` - Entenda arquitetura e stack
2. **Continue com:** `dev-stories.md` - Veja tasks técnicas
3. **Implemente:** `user-stories.md` - Valide com critérios de aceitação

### Para Desenvolvedor Frontend
1. **Comece com:** `design.md` (seção Frontend) - Stack e componentes
2. **Continue com:** `user-journeys.md` - Entenda fluxos de tela
3. **Implemente:** `user-stories.md` - Critérios de aceitação de UI

### Para QA / Tester
1. **Comece com:** `user-stories.md` - Cenários e critérios de aceitação
2. **Continue com:** `user-journeys.md` - Valide jornadas end-to-end
3. **Consulte:** `design.md` (seção Testing) - Estratégia de testes

---

## 📊 Métricas de Planejamento

### Estimativas Totais
- **User Stories:** 50+
- **Dev Stories:** 25+
- **Story Points:** ~650 points
- **Sprints Estimados:** 25-30 sprints (2 semanas cada)
- **Duração Total:** 12-15 meses para produto completo

### Prioridades
- 🔴 **Crítica:** 15 stories (MVP - Release 1.0)
- 🟡 **Alta:** 25 stories (Features Premium - Release 2.0)
- 🟢 **Média:** 35 stories (Admin + Otimizações - Release 2.5+)

### Releases Planejadas
1. **Release 1.0 - MVP** (8-10 semanas)
   - Autenticação + Trial
   - Dashboard básico
   - Integração Coinzz + Facebook Ads
   - Gestão de clientes

2. **Release 1.5 - Projeções** (4 semanas)
   - Projeções financeiras
   - Metas personalizadas
   - WhatsApp integração

3. **Release 2.0 - Premium** (6 semanas)
   - Relatórios customizados
   - Analytics avançado
   - Sistema de upgrade

4. **Release 2.5 - Admin** (4 semanas)
   - Painel administrativo
   - Métricas SaaS
   - Central de tickets

5. **Release 3.0 - Escalabilidade** (8 semanas)
   - API pública
   - Otimizações
   - Webhooks

---

## 🔄 Fluxo de Trabalho Recomendado

### Sprint Planning
1. Review `plan.md` - Validar prioridades do roadmap
2. Selecionar User Stories de `user-stories.md`
3. Quebrar em Dev Stories de `dev-stories.md`
4. Estimar e commitar para sprint

### Durante Sprint
1. Desenvolvedores consultam `design.md` e `dev-stories.md`
2. QA valida com `user-stories.md` (critérios de aceitação)
3. PM acompanha progresso no roadmap de `plan.md`

### Sprint Review
1. Demonstrar funcionalidades seguindo `user-journeys.md`
2. Validar critérios de `user-stories.md`
3. Coletar feedback e atualizar backlog

### Sprint Retrospective
1. Revisar métricas de `plan.md`
2. Ajustar estimativas em `user-stories.md`
3. Atualizar decisões técnicas em `design.md`

---

## 📌 Referências Rápidas

### Integrações Críticas
- **Coinzz:** Vendas e clientes (BLOQUEIO - aguardando API)
- **Facebook Ads:** Gastos e métricas (Documentação oficial disponível)
- **WhatsApp:** Notificações (Aprovação de templates: 2-5 dias)
- **PagBank:** Pagamentos recorrentes (Documentação oficial disponível)

### Stack Tecnológica
```
Frontend: Next.js 14 + TypeScript + HeroUI + TanStack Query
Backend:  Node.js + Express + TypeScript + Prisma + PostgreSQL
Cache:    Redis + Bull Queues
Deploy:   Railway (staging) / AWS (production)
```

### Contatos Importantes
- **Coinzz API:** [Aguardando contato com suporte técnico]
- **Meta Business:** https://developers.facebook.com/
- **PagBank:** https://dev.pagseguro.uol.com.br/

---

## 📝 Manutenção dos Documentos

### Frequência de Atualização
- `plan.md`: Mensal (após reviews estratégicas)
- `user-journeys.md`: A cada nova persona ou jornada identificada
- `user-stories.md`: Semanal (após sprint planning/review)
- `design.md`: Quando há mudanças arquiteturais significativas
- `dev-stories.md`: Conforme novas tasks técnicas surgem

### Versionamento
Todos os documentos incluem:
- Data de geração
- Número de versão
- Status (Em desenvolvimento, Em produção, Deprecated)

---

## 🎓 Glossário

- **MRR:** Monthly Recurring Revenue (Receita Recorrente Mensal)
- **Churn:** Taxa de cancelamento de usuários
- **LTV:** Lifetime Value (Valor vitalício do cliente)
- **CAC:** Customer Acquisition Cost (Custo de aquisição de cliente)
- **ROAS:** Return on Ad Spend (Retorno sobre investimento em anúncios)
- **DDD:** Domain-Driven Design
- **CRUD:** Create, Read, Update, Delete
- **JWT:** JSON Web Token
- **RBAC:** Role-Based Access Control
- **ORM:** Object-Relational Mapping

---

**Última atualização:** 1 de outubro de 2025  
**Versão:** 1.0  
**Mantido por:** Equipe Flowzz
