# Prompt: `implement`

## Foco Exclusivo: **Geração de Código Novo Baseado em Documentação Completa**

**Objetivo:** Implementação rigorosa baseada em análise completa de TODOS os documentos de planejamento pré-existentes.

## ⚠️ RESTRIÇÕES IMPORTANTES

### 🎨 Frontend do Usuário
**O frontend do usuário JÁ ESTÁ IMPLEMENTADO e NÃO DEVE ter alterações visuais/UI:**
- ✅ Interface completa já desenvolvida
- ✅ Design system estabelecido  
- ✅ Componentes UI finalizados
- ❌ **NÃO modificar layouts, cores, fontes ou componentes visuais**
- ❌ **NÃO alterar estrutura de páginas ou navegação**
- ❌ **NÃO implementar novos componentes de UI**

**Escopo permitido no frontend:**
- ✅ Ajustes de integração com backend (APIs, endpoints)
- ✅ Correções de bugs funcionais
- ✅ Otimizações de performance
- ✅ Atualizações de dados/estado
- ✅ Configurações de autenticação

### 🎯 Foco Principal: Backend e Frontend Admin
**Toda implementação deve se concentrar em:**
- 🔧 APIs REST completas
- 🗄️ Modelos de dados e schemas
- 🔐 Autenticação e autorização
- 🔌 Integrações externas (Coinzz, Facebook, WhatsApp, PagBank)
- 📊 Lógica de negócio e use cases
- 🧪 Testes unitários e de integração
- 📚 Documentação da API /zedopenapi.yaml

---

## 📚 Documentos Obrigatórios para Análise

**ANTES de iniciar qualquer implementação, SEMPRE analise:**

1. **📋 plan.md** - Visão estratégica, personas, roadmap, objetivos de negócio
2. **🏗️ design.md** - Arquitetura técnica, stack, padrões, segurança
3. **🔧 dev-stories.md** - Stories técnicas de implementação com código de exemplo
4. **🗺️ user-journeys.md** - Jornadas completas dos usuários, touchpoints, emoções
5. **📖 user-stories.md** - User stories em formato Gherkin com critérios de aceitação
6. **✅ tasks.md** - Breakdown executável com dependências e referências cruzadas

## Protocolos de Implementação

### 1. 🔍 **Análise Estratégica** (plan.md)
```
- Identificar qual persona será impactada pela implementação
- Entender objetivos de negócio e métricas de sucesso
- Validar alinhamento com roadmap e releases
- Extrair requisitos de negócio e restrições estratégicas
```

### 2. 🏗️ **Análise Arquitetural** (design.md)
```
- Examinar stack tecnológica definida
- Entender padrões arquiteturais (DDD, Clean Architecture, Repository)
- Validar abordagens de segurança, cache e integração
- Identificar bibliotecas, frameworks e convenções
```

### 3. 🔧 **Análise de Implementação** (dev-stories.md)
```
- Localizar dev story correspondente à task
- Estudar exemplos de código fornecidos
- Entender estrutura de pastas e organização
- Identificar dependências técnicas e configurações
```

### 4. 🗺️ **Análise de Contexto de Uso** (user-journeys.md)
```
- Entender em qual jornada a feature se encaixa
- Identificar touchpoints e momentos críticos
- Compreender emoções e expectativas do usuário
- Validar fluxo de navegação e transições
```

### 5. 📖 **Análise de Requisitos** (user-stories.md)
```
- Localizar user stories relacionadas
- Extrair cenários Gherkin (Given/When/Then)
- Validar critérios de aceitação completos
- Identificar casos de erro e edge cases
```

### 6. ✅ **Análise de Execução** (tasks.md)
```
- Localizar task específica para implementar
- Verificar dependências (tasks que devem estar prontas)
- Identificar bloqueadores (tasks que dependem desta)
- Validar estimativa e prioridade
```

### 7. ⚡ **Implementação Orientada a Documentação**
```
- Transformar análise integrada em código concreto
- Seguir rigorosamente especificações de TODOS os documentos
- Aplicar padrões definidos em design.md
- Implementar casos de uso de user-stories.md
- Atender critérios de aceitação
```

### 8. ✅ **Validação Multi-Dimensional**
```
- Conformidade com plan.md (objetivos de negócio)
- Conformidade com design.md (padrões técnicos)
- Conformidade com dev-stories.md (implementação)
- Conformidade com user-stories.md (requisitos)
- Conformidade com tasks.md (escopo e dependências)
- Qualidade de código e testes
```

## Fluxo de Trabalho Completo

### 📥 **Entrada Obrigatória**
```
✅ plan.md         - Contexto estratégico
✅ design.md       - Especificação técnica
✅ dev-stories.md  - Guia de implementação
✅ user-journeys.md - Contexto de uso
✅ user-stories.md - Requisitos funcionais
✅ tasks.md        - Execução e dependências
```

### 🔄 **Processamento Cross-Document**
```
1. Leitura e compreensão de TODOS os 6 documentos
2. Cross-reference entre:
   - plan.md ↔ tasks.md (objetivos → execução)
   - design.md ↔ dev-stories.md (arquitetura → código)
   - user-stories.md ↔ user-journeys.md (requisitos → contexto)
   - tasks.md ↔ dev-stories.md (breakdown → implementação)
3. Mapeamento de dependências entre documentos
4. Identificação de gaps, ambiguidades ou conflitos
5. Geração de código alinhado com TODAS as especificações
```

### 📤 **Saída Gerada**
```
- Código implementado seguindo especificações integradas
- Estrutura de arquivos conforme design.md
- Casos de uso atendendo user-stories.md
- Comentários referenciando todos os documentos originais
- Testes cobrindo cenários de user-stories.md
```

## Template de Resposta Integrada

```markdown
## � ANÁLISE INTEGRADA DA IMPLEMENTAÇÃO

### 🎯 Contexto Estratégico (plan.md)
**Persona Impactada:** [João/Maria/Carlos/Ana]
**Objetivo de Negócio:** [extraído do plan.md]
**Métrica de Sucesso:** [KPI esperado]
**Prioridade no Roadmap:** [Release 1.0/1.5/2.0]

### 🗺️ Contexto de Uso (user-journeys.md)
**Jornada:** [nome da jornada completa]
**Fase:** [fase específica da jornada]
**Touchpoint:** [onde usuário interage]
**Emoção Esperada:** [estado emocional do usuário]
**Necessidade:** [o que usuário precisa]

### 📖 Requisitos Funcionais (user-stories.md)
**User Story:** [Story X.Y - título]
**Cenários Gherkin:**
```gherkin
Dado que [contexto]
Quando [ação]
Então [resultado esperado]
```
**Critérios de Aceitação:** [lista de critérios]
**Estimativa:** [story points]

### 🏗️ Especificação Técnica (design.md)
**Stack:** [tecnologias específicas]
**Padrão Arquitetural:** [Repository/DDD/Clean Architecture]
**Camada:** [Presentation/Application/Domain/Infrastructure]
**Integrações:** [APIs externas necessárias]
**Segurança:** [autenticação, validação, sanitização]

### � Guia de Implementação (dev-stories.md)
**Dev Story:** [Dev Story X.Y - título]
**Estrutura de Arquivos:**
```
src/
  ├── [estrutura baseada em dev-stories.md]
```
**Dependências:** [bibliotecas npm necessárias]
**Configurações:** [env vars, configs]

### ✅ Execução (tasks.md)
**Task:** [Task X.Y - título]
**Dependências Necessárias:** [tasks que devem estar prontas]
**Bloqueadores:** [tasks que dependem desta]
**Subtasks:**
- [ ] [subtask 1]
- [ ] [subtask 2]
**Referências Cruzadas:**
- design.md: [seção específica]
- user-stories.md: [Story X.Y]
- dev-stories.md: [Dev Story X.Y]

---

## ⚡ IMPLEMENTAÇÃO

### 📁 Estrutura de Arquivos
```
[estrutura completa conforme design.md e dev-stories.md]
```

### 💾 Schema/Models (se aplicável)
```typescript
// Baseado em design.md §[seção] e dev-stories.md §[seção]
// Atende user-stories.md Story [X.Y]
```

### 🔐 Service Layer
```typescript
// Implementação seguindo padrões de design.md
// Casos de uso de user-stories.md
// Exemplo de dev-stories.md §[seção]
```

### 🌐 Controller/Routes
```typescript
// Endpoints conforme dev-stories.md
// Validação com Zod (design.md)
// Autenticação JWT (design.md §Segurança)
```

### 🧪 Testes
```typescript
// Cobertura de cenários de user-stories.md
// Testes unitários (dev-stories.md)
// Happy path + edge cases
```

---

## ✅ VALIDAÇÃO MULTI-DIMENSIONAL

### ✓ Conformidade com plan.md
- [ ] Atende objetivo de negócio: [objetivo específico]
- [ ] Impacta persona correta: [persona]
- [ ] Alinhado com release: [1.0/1.5/2.0]
- [ ] Métrica de sucesso mensurável

### ✓ Conformidade com design.md
- [ ] Stack correto: [tecnologias]
- [ ] Padrão arquitetural aplicado: [padrão]
- [ ] Segurança implementada: [JWT/validação/sanitização]
- [ ] Integrações conforme especificado

### ✓ Conformidade com dev-stories.md
- [ ] Estrutura de arquivos correta
- [ ] Dependências instaladas
- [ ] Exemplos de código seguidos
- [ ] Configurações aplicadas

### ✓ Conformidade com user-journeys.md
- [ ] Jornada identificada: [nome]
- [ ] Fase correta: [fase]
- [ ] Touchpoint implementado
- [ ] Experiência do usuário considerada

### ✓ Conformidade com user-stories.md
- [ ] User story implementada: [Story X.Y]
- [ ] Cenários Gherkin atendidos: [quantidade]
- [ ] Critérios de aceitação cumpridos: [X/Y]
- [ ] Estimativa respeitada

### ✓ Conformidade com tasks.md
- [ ] Task completa: [Task X.Y]
- [ ] Dependências verificadas
- [ ] Bloqueadores identificados
- [ ] Subtasks concluídas
- [ ] Referências cruzadas validadas

### ✓ Qualidade de Código
- [ ] TypeScript sem erros
- [ ] ESLint passa
- [ ] Testes > 80% coverage
- [ ] Sem erros de compilação
- [ ] Aquivos com 300 a 500 linhas
- [ ] Sem funções ou métodos muito longos ( > 50 linhas)
- [ ] funções bem nomeadas e coesas para evitar o maximo uso de comentários
- [ ] Documentação inline completa
- [ ] Imports organizados no inicio do arquivo e hierárquia alfabética
```

## 💡 Exemplo Completo de Implementação Integrada

### 📝 Solicitação do Usuário:
```
"Implemente o sistema de autenticação JWT com cadastro e trial de 7 dias"
```

### 🔍 Análise Integrada:

#### 🎯 plan.md §Jornadas/Onboarding
- **Persona:** João (Afiliado Iniciante)
- **Objetivo:** Converter lead em usuário pagante
- **Métrica:** Trial to Paid > 30%
- **Fase da Jornada:** FASE 2 - Cadastro Trial (2-3 min)

#### 🗺️ user-journeys.md §JORNADA 1/FASE 2
- **Touchpoint:** Formulário de cadastro
- **Emoção:** 😐 Neutro → 😊 Esperançoso
- **Pensamento:** "Por que precisam do meu cartão se é grátis?"
- **Necessidade:** Processo rápido, explicação clara do trial, segurança

#### 📖 user-stories.md §Story 1.1
```gherkin
Como afiliado iniciante (João)
Quero me cadastrar com trial gratuito de 7 dias
Para testar a plataforma antes de pagar

Cenário: Cadastro bem-sucedido com cartão válido
  Dado que estou na landing page do Flowzz
  Quando preencho email, senha e dados do cartão válido
  E clico em "Começar Trial Grátis"
  Então vejo mensagem "Bem-vindo! Trial ativo por 7 dias"
  E sou redirecionado para wizard de integração
  E não sou cobrado imediatamente
```
**Critérios:**
- Trial dura exatamente 7 dias corridos
- Senha min 8 caracteres, 1 maiúscula, 1 número
- Email de boas-vindas < 1 minuto
- Conversão trial → pago > 30%

#### 🏗️ design.md §Authentication
- **Stack:** Node.js 20 + TypeScript 5.3 + Express 4.19
- **Auth:** JWT (jsonwebtoken) + bcrypt (rounds: 12)
- **Validação:** Zod schemas
- **Database:** PostgreSQL 16 + Prisma ORM
- **Pattern:** Clean Architecture + Repository Pattern

#### 🔧 dev-stories.md §Dev Story 1.3
```typescript
// AuthService com hash bcrypt
// JWT: Access Token (15min) + Refresh Token (7d)
// Middleware authenticate
// Endpoints: /auth/register, /auth/login, /auth/logout
```

#### ✅ tasks.md §Task 2.1
**Task 2.1: Auth JWT**
- **Dependências:** 1.5 (Prisma), 1.2 (Backend setup)
- **Bloqueadores:** Todos os endpoints protegidos
- **Subtasks:**
  - [ ] Implementar AuthService
  - [ ] Criar middleware authenticate
  - [ ] Endpoints de auth

---

### ⚡ IMPLEMENTAÇÃO

#### � Diretrizes de Implementação

**A implementação DEVE seguir este padrão:**

1. **Estrutura de Arquivos (design.md + dev-stories.md)**
   - Criar estrutura de pastas conforme padrão arquitetural definido
   - Organizar por camadas: domain → application → infrastructure → presentation
   - Separar responsabilidades (entities, repositories, use cases, controllers)

2. **Schema/Models (design.md §Database)**
   - Definir models com tipos corretos baseados nas especificações
   - Incluir relações (FK, indexes, constraints)
   - Adicionar referências aos documentos como comentários
   - Exemplo: `// Referência: design.md §[seção], user-stories.md Story [X.Y]`

3. **Validation Schemas (design.md §Validation)**
   - Criar schemas de validação com biblioteca especificada (ex: Zod)
   - Implementar regras dos critérios de aceitação (user-stories.md)
   - Validar tipos, formatos, ranges e regras de negócio
   - Fornecer mensagens de erro claras e localizadas

4. **Domain Layer**
   - Criar entidades com regras de negócio
   - Definir interfaces de repositórios (IRepository pattern)
   - Implementar value objects se necessário
   - Manter camada independente de frameworks

5. **Application Layer (Use Cases)**
   - Implementar use cases seguindo princípios de Clean Architecture
   - Injetar dependências via constructor
   - Orquestrar fluxo de negócio (validações → persistência → notificações)
   - Adicionar comentários referenciando documentos de origem
   - Tratar erros e edge cases definidos em user-stories.md

6. **Infrastructure Layer**
   - Implementar repositórios concretos (ex: PrismaRepository)
   - Configurar integrações externas (APIs, SDKs)
   - Implementar middleware de autenticação/autorização
   - Configurar cache, filas, storage conforme design.md

7. **Presentation Layer (Controllers/Routes)**
   - Criar controllers com injeção de dependências
   - Validar input com schemas antes de chamar use cases
   - Formatar responses seguindo padrão REST/GraphQL
   - Implementar error handling consistente
   - Adicionar status codes HTTP corretos

8. **Testes (user-stories.md Cenários)**
   - Escrever testes unitários para cada use case
   - Cobrir TODOS os cenários Gherkin de user-stories.md
   - Testar happy path + edge cases + error cases
   - Usar mocks para dependências externas
   - Target: > 80% coverage
   - Nomenclatura descritiva: `deve [ação] quando [condição]`

#### ✅ Checklist de Implementação

Antes de finalizar qualquer código, verificar:

- [ ] **Estrutura de arquivos** segue design.md
- [ ] **Nomenclatura** clara e consistente
- [ ] **Comentários** referenciam documentos fonte
- [ ] **Validações** cobrem critérios de user-stories.md
- [ ] **Use cases** implementam cenários Gherkin
- [ ] **Error handling** completo e consistente
- [ ] **Tipos TypeScript** corretos e type-safe
- [ ] **Injeção de dependências** aplicada
- [ ] **Testes** cobrem todos os cenários
- [ ] **Coverage** > 80%
- [ ] **ESLint** passa sem erros
- [ ] **Documentação inline** completa

---

### ✅ VALIDAÇÃO COMPLETA

#### ✓ plan.md
- [x] Jornada 1 FASE 2 implementada
- [x] Persona João atendida
- [x] Métrica Trial to Paid mensurável
- [x] Integração PagBank preparada

#### ✓ design.md
- [x] Node.js + TypeScript + Express
- [x] JWT + bcrypt (rounds: 12)
- [x] Zod validation
- [x] Clean Architecture aplicada
- [x] Repository Pattern

#### ✓ dev-stories.md
- [x] AuthService implementado
- [x] Endpoints criados
- [x] Estrutura de pastas seguida

#### ✓ user-journeys.md
- [x] Emoção "esperançoso" considerada
- [x] Necessidade de explicação clara atendida
- [x] Processo rápido (< 3min)

#### ✓ user-stories.md
- [x] Story 1.1 completa
- [x] 3 cenários Gherkin cobertos
- [x] Todos os critérios de aceitação atendidos

#### ✓ tasks.md
- [x] Task 2.1 Auth JWT completa
- [x] Dependências 1.2, 1.5 verificadas
- [x] Subtasks concluídas

---

## 🔄 Como Usar Este Prompt

### Opção 1: Referência Automática (Recomendado)
```
"Implemente Task 3.1 (API Clientes CRUD)"
```
→ Eu automaticamente analiso TODOS os 6 documentos e implemento de forma integrada.

### Opção 2: Referência Específica
```
"Implemente baseado em:
- plan.md: Seção Jornada 3
- user-stories.md: Story 3.1
- tasks.md: Task 3.1"
```

### Opção 3: Feature Livre
```
"Implemente sistema de projeções financeiras"
```
→ Eu localizo informações em todos os documentos e implemento.

---

## ⚠️ Validações Críticas Automáticas

### ✅ Verifico SEMPRE antes de implementar:
1. **Consistência entre documentos:** Todos os 6 documentos estão alinhados?
2. **Dependências prontas:** Tasks pré-requisitos já implementadas? (tasks.md)
3. **Especificações completas:** Critérios de aceitação claros? (user-stories.md)
4. **Stack definido:** Tecnologias e padrões especificados? (design.md)
5. **Contexto de uso:** Jornada e touchpoint identificados? (user-journeys.md)
6. **Exemplos disponíveis:** Código de referência existe? (dev-stories.md)

### ❌ Solicito esclarecimento se:
1. Documentos conflitam entre si
2. Informações essenciais ausentes em qualquer documento
3. Especificações ambíguas ou incompletas
4. Dependências não satisfeitas (tasks.md)
5. Stack ou padrões indefinidos

---

## 🎯 Garantias de Qualidade

Toda implementação gerada:
- ✅ Atende TODOS os 6 documentos simultaneamente
- ✅ Segue padrões arquiteturais (design.md)
- ✅ Cobre cenários Gherkin (user-stories.md)
- ✅ Respeita dependências (tasks.md)
- ✅ Considera contexto do usuário (user-journeys.md)
- ✅ Usa exemplos de código (dev-stories.md)
- ✅ Alinha com objetivos de negócio (plan.md)
- ✅ Inclui testes com > 80% coverage
- ✅ TypeScript type-safe
- ✅ Documentação inline completa

**Pronto para implementar com análise integrada de todos os documentos de planejamento!** 🚀