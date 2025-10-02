# 🎯 PLANO DE IMPLEMENTAÇÃO: Wizard de Onboarding
## Task 2.2.2 - Análise e Estratégia de Implementação

**Data:** 02 de Outubro de 2025  
**Status:** Planejamento antes da implementação  
**Responsável:** GitHub Copilot

---

## 📋 ANÁLISE DO ESTADO ATUAL DO FRONTEND (Flow)

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO (UI/UX)

#### 1. Estrutura Next.js 14
```json
✅ Next.js 14.2.3 (App Router)
✅ TypeScript configurado
✅ Tailwind CSS
✅ Layout principal com sidebar
✅ Sistema de rotas funcionando
```

#### 2. Componentes UI Existentes
```
✅ Layout.tsx - Sidebar + Header + Navigation completos
✅ Página de Integrações (/integracoes) - UI COMPLETO
✅ Sistema de modais (SetupModal já implementado)
✅ Toast notifications (react-hot-toast)
✅ Animações (framer-motion)
✅ Ícones (lucide-react)
✅ Gráficos (recharts)
```

#### 3. Página de Integrações (Análise Detalhada)
**Arquivo:** `/flow/src/app/integracoes/page.tsx`

**UI já implementado:**
- ✅ Grid de cards de integrações
- ✅ Modal de setup com wizard multi-step
- ✅ Estados visuais: connected, disconnected, error, warning
- ✅ Progress indicator de passos
- ✅ Formulários de configuração
- ✅ Campos para API keys, tokens, webhooks
- ✅ Health indicators
- ✅ Sync frequency display
- ✅ Botões de ação (conectar, desconectar, testar)

**Estrutura de dados mock:**
```typescript
interface Integration {
  id: string
  name: string
  description: string
  logo: string
  status: "connected" | "disconnected" | "error" | "warning"
  lastSync: string
  syncFrequency: string
  features: string[]
  health: number
  category: string
  monthlyData: string
  setupSteps: { id: number, title: string, description: string }[]
}
```

**Setup Modal já tem:**
- ✅ Sistema de steps (1, 2, 3, 4)
- ✅ Navegação entre passos (prevStep, nextStep)
- ✅ Inputs para credenciais
- ✅ Display de webhook URLs
- ✅ Checkboxes de configuração
- ✅ Botões de ação

### ❌ O QUE ESTÁ FALTANDO (Lógica/Backend)

#### 1. Dependências Críticas Ausentes
```json
// package.json atual NÃO TEM:
❌ "@tanstack/react-query" - Data fetching e cache
❌ "zustand" - State management global
❌ "zod" - Validação de schemas
❌ "react-hook-form" - Gestão de formulários
❌ "@hookform/resolvers" - Integração Zod + RHF
❌ "axios" ou "ky" - HTTP client
```

#### 2. Estrutura de Pastas Faltando
```
flow/src/
  ❌ lib/
      ❌ api/          - API clients e endpoints
      ❌ hooks/        - Custom hooks (useAuth, useIntegrations)
      ❌ stores/       - Zustand stores
      ❌ schemas/      - Zod validation schemas
      ❌ utils/        - Helper functions
      ❌ types/        - TypeScript interfaces
```

#### 3. Lógica de Negócio Ausente
```typescript
❌ Chamadas para backend (POST /integrations/coinzz/connect)
❌ Validação de formulários com Zod
❌ State management com Zustand
❌ Error handling consistente
❌ Loading states
❌ Success/error toasts integrados
❌ Retry logic
❌ Cache de dados
```

#### 4. Integração com Backend
```typescript
❌ API client configurado
❌ Autenticação JWT nos headers
❌ Refresh token logic
❌ Interceptors de erro
❌ Base URL configuration
```

---

## 🎯 TASK 2.2.2 - WIZARD DE ONBOARDING

### Objetivo (Conforme Documentação)
**Referência:** `tasks.md` Task 2.2.2, `user-stories.md` Story 1.2, 1.3, `user-journeys.md` Jornada 1 Fase 3

Criar wizard de onboarding com 4 telas:
1. ✅ **Conectar Coinzz** (obrigatório) - UI existe
2. ✅ **Conectar Facebook Ads** (opcional) - UI existe
3. ✅ **Conectar WhatsApp** (opcional) - UI existe
4. ❌ **Configurar moeda e fuso horário** - UI NÃO existe

### Critérios de Aceitação
```gherkin
✅ Tela 1: Conectar Coinzz (obrigatório)
  - Input: API key
  - Validação: Testar conexão
  - Feedback: "✅ 847 vendas importadas!"
  - Não pode pular

✅ Tela 2: Conectar Facebook Ads (opcional)
  - OAuth flow
  - Validação: Buscar campanhas
  - Feedback: "✅ 5 campanhas conectadas"
  - Pode pular

✅ Tela 3: Conectar WhatsApp (opcional)
  - QR Code scan
  - Validação: Mensagem teste
  - Feedback: "✅ WhatsApp conectado!"
  - Pode pular

❌ Tela 4: Configurar moeda e fuso horário
  - Select: BRL, USD, EUR
  - Select: Fuso horário
  - Feedback: "✅ Preferências salvas"
```

---

## 📊 ESTRATÉGIA DE IMPLEMENTAÇÃO

### 🎨 RESTRIÇÃO CRÍTICA
> **O frontend Flow JÁ TEM UI PRONTO. NÃO MODIFICAR UI/UX EXISTENTE.**
> 
> **Foco:** Implementar apenas a **LÓGICA**, **INTEGRAÇÕES** e **STATE MANAGEMENT**.

### 🔄 Abordagem: "Backend-First, Frontend-Integration"

#### Fase 1: Setup de Infraestrutura Frontend (1-2h)
```bash
# 1. Adicionar dependências essenciais
cd /home/mau/projetos/flowzz/flow
npm install @tanstack/react-query zustand zod react-hook-form @hookform/resolvers axios
npm install -D @tanstack/react-query-devtools

# 2. Criar estrutura de pastas
mkdir -p src/lib/{api,hooks,stores,schemas,utils,types}
```

#### Fase 2: Configuração Base (2-3h)
```typescript
// 2.1 Configurar API client (src/lib/api/client.ts)
- Axios instance com baseURL do backend
- Interceptors para JWT
- Refresh token logic
- Error handling global

// 2.2 Configurar React Query (src/lib/api/query-client.ts)
- QueryClient com defaults
- Cache strategy
- Retry logic

// 2.3 Configurar Zustand stores (src/lib/stores/)
- authStore: user, token, isAuthenticated
- integrationStore: integrações conectadas
- onboardingStore: progresso do wizard

// 2.4 Criar schemas Zod (src/lib/schemas/)
- coinzzSchema: validação de API key
- facebookSchema: validação de OAuth
- whatsappSchema: validação de QR code
- settingsSchema: moeda, fuso horário
```

#### Fase 3: Backend APIs (Verificar se existem)
```typescript
// Verificar se backend tem estes endpoints:
POST /api/auth/register
POST /api/auth/login
POST /api/integrations/coinzz/connect
POST /api/integrations/coinzz/sync
POST /api/integrations/facebook/connect
POST /api/integrations/whatsapp/connect
PATCH /api/users/me/settings
```

#### Fase 4: Implementar Hooks Customizados (3-4h)
```typescript
// src/lib/hooks/use-coinzz-integration.ts
export const useCoinzzIntegration = () => {
  const connect = useMutation(...)
  const sync = useMutation(...)
  const disconnect = useMutation(...)
  return { connect, sync, disconnect, isLoading, error }
}

// src/lib/hooks/use-facebook-integration.ts
// src/lib/hooks/use-whatsapp-integration.ts
// src/lib/hooks/use-onboarding.ts
```

#### Fase 5: Integrar Lógica com UI Existente (4-6h)
```typescript
// Modificar /integracoes/page.tsx para:
1. Usar hooks ao invés de mock data
2. Conectar botões com mutations
3. Adicionar validação com Zod
4. Implementar loading states
5. Implementar error handling
6. Integrar toasts de sucesso/erro
7. Atualizar cache após mutations
```

#### Fase 6: Criar Tela 4 - Settings (2-3h)
```typescript
// Criar /app/onboarding/settings/page.tsx
- Form com react-hook-form
- Select de moeda (BRL, USD, EUR)
- Select de fuso horário
- Botão "Concluir Onboarding"
- Redirecionar para /dashboard após salvar
```

#### Fase 7: Criar Fluxo de Onboarding (2-3h)
```typescript
// Opção 1: Usar /integracoes como tela de onboarding
- Adicionar lógica para detectar primeiro acesso
- Forçar completar Coinzz antes de usar plataforma
- Após completar, redirecionar para settings
- Marcar onboarding como completo

// Opção 2: Criar rota /onboarding separada
- /onboarding/step-1 (Coinzz)
- /onboarding/step-2 (Facebook)
- /onboarding/step-3 (WhatsApp)
- /onboarding/step-4 (Settings)
```

---

## 🚀 PLANO DE AÇÃO PROPOSTO

### **ABORDAGEM RECOMENDADA:**

Como a UI de integrações já existe e é bonita, vou **REUTILIZAR** a página `/integracoes` existente e adicionar lógica para transformá-la em wizard de onboarding quando necessário.

### **Decisão Arquitetural:**
1. ✅ **Reutilizar** `/integracoes/page.tsx` existente
2. ✅ Adicionar lógica de "modo onboarding" vs "modo normal"
3. ✅ Forçar completar Coinzz no primeiro acesso
4. ✅ Criar apenas a tela 4 (Settings) que não existe
5. ✅ Implementar toda a lógica de backend integration

### **Vantagens:**
- ✅ Respeita UI existente 100%
- ✅ Menos código duplicado
- ✅ UX consistente entre onboarding e uso normal
- ✅ Mais rápido de implementar

---

## 📝 ETAPAS DE IMPLEMENTAÇÃO (Ordem)

### Sprint 1: Setup Infraestrutura (HOJE - 2-3h)
```markdown
[ ] 1.1 Instalar dependências
    - @tanstack/react-query
    - zustand
    - zod
    - react-hook-form
    - @hookform/resolvers
    - axios

[ ] 1.2 Criar estrutura de pastas
    - src/lib/api/
    - src/lib/hooks/
    - src/lib/stores/
    - src/lib/schemas/
    - src/lib/types/
    - src/lib/utils/

[ ] 1.3 Configurar API client base
    - axios instance
    - baseURL do backend
    - interceptors básicos

[ ] 1.4 Configurar React Query
    - QueryClientProvider no layout
    - Defaults de cache
    - DevTools em dev mode

[ ] 1.5 Criar store de autenticação
    - authStore com Zustand
    - user, token, isAuthenticated
    - login, logout, refresh
```

### Sprint 2: Verificar Backend (HOJE - 1-2h)
```markdown
[ ] 2.1 Verificar endpoints de integração no backend
    - POST /integrations/coinzz/connect existe?
    - POST /integrations/facebook/connect existe?
    - POST /integrations/whatsapp/connect existe?

[ ] 2.2 Se não existirem, IMPLEMENTAR NO BACKEND PRIMEIRO
    - (Seguir processo de implement.md)
    - Criar IntegrationController
    - Criar IntegrationService
    - Implementar rotas

[ ] 2.3 Testar endpoints com Postman/Thunder Client
    - Validar request/response
    - Verificar autenticação
    - Documentar erros possíveis
```

### Sprint 3: Implementar Hooks e Lógica (AMANHÃ - 4-6h)
```markdown
[ ] 3.1 Criar schemas Zod de validação
    - coinzzSchema
    - facebookSchema
    - whatsappSchema

[ ] 3.2 Implementar useCoinzzIntegration
    - Mutation connect
    - Mutation sync
    - Mutation disconnect
    - Query status

[ ] 3.3 Implementar useFacebookIntegration
[ ] 3.4 Implementar useWhatsAppIntegration
[ ] 3.5 Implementar useOnboarding
    - Detectar primeiro acesso
    - Salvar progresso
    - Marcar como completo
```

### Sprint 4: Integrar com UI Existente (DIA 3 - 4-6h)
```markdown
[ ] 4.1 Refatorar /integracoes/page.tsx
    - Substituir mock data por hooks
    - Conectar botões com mutations
    - Adicionar loading states
    - Implementar error handling

[ ] 4.2 Adicionar modo "onboarding"
    - Detectar primeiro acesso
    - Forçar completar Coinzz
    - Bloquear navegação se Coinzz não conectado
    - Mostrar progresso

[ ] 4.3 Integrar toasts
    - Sucesso: "✅ Coinzz conectado!"
    - Erro: "❌ API key inválida"
    - Loading: "Testando conexão..."
```

### Sprint 5: Criar Tela de Settings (DIA 4 - 2-3h)
```markdown
[ ] 5.1 Criar /app/onboarding/settings/page.tsx
    - Form com react-hook-form
    - Select de moeda
    - Select de fuso horário
    - Validação com Zod

[ ] 5.2 Implementar hook useSettings
    - Mutation para salvar settings
    - Query para buscar settings atuais

[ ] 5.3 Redirecionar para /dashboard após salvar
```

### Sprint 6: Testes e Validação (DIA 5 - 2-3h)
```markdown
[ ] 6.1 Testar fluxo completo de onboarding
    - Registro → Wizard → Settings → Dashboard

[ ] 6.2 Testar casos de erro
    - API key inválida
    - Timeout de conexão
    - Perda de conexão

[ ] 6.3 Testar em diferentes resoluções
    - Desktop
    - Tablet
    - Mobile
```

---

## 🎯 CRITÉRIOS DE SUCESSO

### Técnicos
- [ ] Todas dependências instaladas e configuradas
- [ ] API client funcional com autenticação
- [ ] React Query configurado com cache
- [ ] Zustand stores criados e funcionando
- [ ] Hooks customizados implementados
- [ ] Validação Zod em todos os formulários
- [ ] Error handling consistente
- [ ] Loading states em todas mutations
- [ ] Toasts de feedback integrados

### Funcionais (User Stories)
- [ ] Usuário pode conectar Coinzz com API key
- [ ] Validação de API key funciona
- [ ] Import de vendas funciona (feedback "847 vendas importadas")
- [ ] Conexão Facebook Ads opcional funciona
- [ ] Conexão WhatsApp opcional funciona
- [ ] Configuração de moeda e fuso funciona
- [ ] Não pode pular Coinzz (obrigatório)
- [ ] Pode pular Facebook e WhatsApp (opcionais)
- [ ] Após onboarding, redireciona para dashboard
- [ ] Dashboard mostra dados importados

### UX
- [ ] UI existente 100% preservada
- [ ] Transições suaves entre passos
- [ ] Feedback visual claro (loading, success, error)
- [ ] Mensagens de erro amigáveis
- [ ] Performance < 300ms para navegação
- [ ] Responsivo em todas telas

---

## ⚠️ RISCOS E MITIGAÇÕES

### Risco 1: Backend não tem endpoints
**Probabilidade:** Alta  
**Impacto:** Crítico  
**Mitigação:** Implementar endpoints de integração primeiro (Sprint 2)

### Risco 2: API Coinzz não disponível
**Probabilidade:** Média  
**Impacto:** Crítico (blocker)  
**Mitigação:** Criar mock server temporário para desenvolvimento

### Risco 3: OAuth Facebook complexo
**Probabilidade:** Média  
**Impacto:** Médio  
**Mitigação:** Usar biblioteca pronta (passport-facebook)

### Risco 4: Mudanças no UI necessárias
**Probabilidade:** Baixa  
**Impacto:** Alto  
**Mitigação:** Documentar qualquer desvio e pedir aprovação

---

## 📊 ESTIMATIVA DE TEMPO

| Sprint | Tarefa | Tempo Estimado |
|--------|--------|----------------|
| 1 | Setup Infraestrutura | 2-3h |
| 2 | Verificar/Implementar Backend | 1-2h (ou 8-10h se não existir) |
| 3 | Implementar Hooks | 4-6h |
| 4 | Integrar com UI | 4-6h |
| 5 | Criar Tela Settings | 2-3h |
| 6 | Testes e Validação | 2-3h |
| **TOTAL** | **15-23h** | **(2-3 dias de trabalho)** |

**Se backend não existir:** +8-10h = **23-33h (3-4 dias)**

---

## 🎬 PRÓXIMOS PASSOS

### Antes de implementar, preciso confirmar:

1. ✅ **Backend tem os endpoints de integração?**
   - POST /integrations/coinzz/connect
   - POST /integrations/facebook/connect
   - POST /integrations/whatsapp/connect

2. ✅ **Você aprova a abordagem de reutilizar `/integracoes`?**
   - Ou prefere criar rota `/onboarding` separada?

3. ✅ **Qual a URL do backend?**
   - http://localhost:4000?
   - Outra?

4. ✅ **Você quer que eu implemente o backend primeiro?**
   - Se sim, sigo processo de implement.md
   - Se não, assumo que endpoints existem

5. ✅ **Você quer implementação incremental?**
   - Sprint por sprint com validação
   - Ou implementar tudo de uma vez?

---

## 🚀 COMO PROCEDER

**Aguardando suas respostas para:**
1. Confirmar se backend tem endpoints
2. Aprovar abordagem de reutilizar `/integracoes`
3. Informar URL do backend
4. Decidir se implemento backend primeiro
5. Escolher abordagem incremental ou completa

**Após confirmação, irei:**
1. ✅ Instalar dependências
2. ✅ Criar estrutura de pastas
3. ✅ Implementar API client
4. ✅ Implementar hooks
5. ✅ Integrar com UI existente
6. ✅ Criar tela de settings
7. ✅ Testar fluxo completo

---

**Documento preparado para início de implementação** 🚀
