# Prompt: `tests.md`

## Foco: **Usar Testes para Validar e Corrigir Código de Produção**

**Objetivo:** Executar testes para **identificar e corrigir erros no código de produção** baseado na documentação do projeto.

---

## ⚡ MODO DE OPERAÇÃO

### 🎯 Pipeline Automático

**Executar automaticamente:** `mapear` → `executar` → `comparar` → `corrigir` → `analisar` → `validar`

**Prioridade de Decisão:**
1. **📚 Documentação /zed = FONTE DA VERDADE**
2. **💻 Código de Produção = DEVE SER CORRIGIDO** (se não atende docs)
3. **🧪 Testes = FERRAMENTA DE VALIDAÇÃO** (para detectar erros no código)

**Saída:** Apenas 1 relatório consolidado final no chat (sem artefatos intermediários)

### ❌ NUNCA / ✅ SEMPRE

**❌ NUNCA:**
- Assumir que teste está errado sem comparar com docs
- Corrigir código sem validar contra /zed
- Criar artefatos intermediários
- Pausar pipeline entre etapas

**✅ SEMPRE:**
- Documentação /zed é a fonte da verdade
- Comparar: Docs → Código → Teste
- Priorizar correção do código de produção
- Executar pipeline completo automaticamente
- Apresentar apenas relatório final consolidado

---

## 📚 Documentos Obrigatórios (Fonte da Verdade)

1. **plan.md** - Objetivos, métricas, personas
2. **design.md** - Stack, padrões, cobertura mínima
3. **tasks.md** - Tasks, critérios técnicos
4. **user-stories.md** - Cenários Gherkin, critérios funcionais
5. **user-journeys.md** - Contexto emocional, touchpoints
6. **dev-stories.md** - Implementação, estrutura, exemplos
7. **openapi.yaml** - Contratos API, schemas, endpoints

---

## 🔄 Pipeline (Processamento Interno)

### 1. `mapear` 🗺️

**Processar:** Documentação → Código → Testes
**Coletar:** Matriz de rastreabilidade, gaps de implementação, código órfão, teste órfão

### 2. `executar` ▶️

**Processar:** Rodar testes (unit/integration/e2e), capturar falhas, calcular cobertura
**Coletar:** Falhas detalhadas (erro no código?), cobertura vs meta, áreas não testadas

### 3. `comparar` 🔍

**Para cada falha:**
1. Analisar docs: comportamento esperado (user-stories/tasks/openapi)
2. Analisar código: implementa docs?
3. Analisar teste: valida comportamento correto?
4. Diagnosticar: **CASO A** (erro código) / **CASO B** (erro teste) / **CASO C** (ambos) / **CASO D** (docs ambíguas)

**Coletar:** Diagnóstico (A/B/C/D), proposta de correção, priorização (P0/P1/P2)

### 4. `corrigir` 🔧

**CASO A (mais comum):** Corrigir código de produção para atender docs
**CASO B:** Corrigir teste que valida comportamento errado
**CASO C:** Corrigir ambos

**Validar:** Re-executar teste, confirmar passa, sem regressão

**Coletar:** Correções aplicadas (antes/depois), validações, impacto

### 5. `analisar` 📊

**Processar:**
- Conformidade código ↔ docs (%)
- Problemas de qualidade no código (anti-patterns, code smells)
- Gaps de cobertura críticos

**Coletar:** Score conformidade, problemas P0/P1/P2, recomendações

### 6. `validar` ✅

**Processar checklist:**
- Código implementa docs? (plan/design/tasks/stories/openapi)
- Qualidade OK? (SOLID, manutenível, error handling)
- Testes passam? Cobertura >= meta?
- Rastreabilidade completa?

**Coletar:** Score final, classificação, decisão (APROVADO/RESSALVAS/REPROVADO), ações obrigatórias

---

## 📊 Relatório Consolidado Final

**ÚNICA saída apresentada após completar 6 etapas:**

```markdown
## 📊 VALIDAÇÃO DE CÓDIGO VIA TESTES

**Projeto:** [nome] | **Data:** [timestamp]

---

### 🎯 DECISÃO FINAL

**Status:** [✅ APROVADO / ⚠️ RESSALVAS / ❌ REPROVADO]

**Justificativa:** [Análise conformidade + qualidade + testes]

---

### 📊 MÉTRICAS

| Métrica                    | Valor  | Meta   | Status  |
|----------------------------|--------|--------|---------|
| Testes Passando            | [X/Y]  | [Y]    | [✅/❌] |
| Cobertura Código           | [X]%   | [Z]%   | [✅/❌] |
| Conformidade Docs          | [X]%   | 100%   | [✅/❌] |
| User Stories Implementadas | [X/Y]  | [Y]    | [✅/❌] |
| Critérios Tasks Atendidos  | [X/Y]  | [Y]    | [✅/❌] |
| Endpoints Conformes        | [X/Y]  | [Y]    | [✅/❌] |
| Score Qualidade            | [X]%   | 75%    | [✅/❌] |

---

### 🗺️ MAPEAMENTO: DOCS → CÓDIGO → TESTES

**User Stories vs Código vs Testes:**
| Story | Docs | Código | Testes | Status | Gap                      |
|-------|------|--------|--------|--------|--------------------------|
| 1.1   | ✅   | ✅     | ✅     | ✅     | -                        |
| 1.2   | ✅   | ❌     | ❌     | ❌     | Código não implementado  |
| 1.3   | ✅   | ✅     | ⚠️     | ⚠️     | Teste incompleto         |

**Tasks vs Código vs Testes:**
| Task | Critérios | Código Atende | Testado | Status |
|------|-----------|---------------|---------|--------|
| 1.1  | 5         | 4/5 (80%)     | 3/5     | ⚠️     |
| 1.2  | 3         | 3/3 (100%)    | 3/3     | ✅     |

**Endpoints vs Código vs Testes:**
| Endpoint   | Método | Implementado | Status Codes | Testado | Status |
|------------|--------|--------------|--------------|---------|--------|
| /api/users | GET    | ✅           | 200,404      | ✅      | ✅     |
| /api/auth  | POST   | ✅           | 200,401      | ❌      | ⚠️     |

**Gaps:**
- 🔴 P0: [X] stories não implementadas, [Y] critérios não atendidos, [Z] endpoints faltando
- 🟡 P1: [X] comportamentos sem teste, [Y] edge cases descobertos
- 🟢 P2: [X] melhorias de nomenclatura

---

### ▶️ EXECUÇÃO DE TESTES

**Status:** [✅/⚠️/❌] | ✅ [X] passou ([Y]%) | ❌ [Z] falhou ([W]%) | Tempo: [T]s

**Cobertura:** (meta: [M]% - design.md)
- Linhas: [X]% | Branches: [Y]% | Funções: [Z]%
- Status: [✅ Atingiu / ❌ Abaixo]

**Falhas Detectadas:**

**#1: [Nome teste]**
- Teste: `tests/[caminho:linha]` | Código: `src/[caminho:linha]`
- Ref: user-stories.md [X.Y], tasks.md [X.Y]
- Erro: [stack trace resumido]
- Esperado: [comportamento docs] | Recebido: [comportamento código]
- Diagnóstico: [❌ ERRO NO CÓDIGO / ❌ ERRO NO TESTE / ❌ AMBOS]

---

### 🔍 DIAGNÓSTICO DETALHADO

**Falha #1: [Nome]**

**📋 Docs (Comportamento Esperado):**
- user-stories.md [X.Y]: `Given [x] When [y] Then [z]`
- tasks.md [X.Y]: "[critério]"
- openapi.yaml: [endpoint] → [método] → [status] → [schema]

**💻 Código Atual:**
```typescript
[código relevante - 10 linhas]
```
- ❌ NÃO implementa comportamento documentado
- Problema: [discrepância específica]

**🧪 Teste Atual:**
```typescript
[teste - 10 linhas]
```
- [✅ Correto / ❌ Incorreto] (valida comportamento [correto/errado])

**🎯 Diagnóstico:**
- Fonte: [❌ CÓDIGO / ❌ TESTE / ❌ AMBOS]
- Razão: [explicação técnica da discrepância docs vs código vs teste]

---

### 🔧 CORREÇÕES APLICADAS

**#1: [Falha]** | Tipo: [Código/Teste/Ambos] | `[arquivo]`

**🔴 ANTES:**
```typescript
[código/teste incorreto]
```

**🟢 DEPOIS:**
```typescript
[código/teste corrigido]
```

**Mudanças:** Linha [X]: [descrição]
**Justificativa:** [razão - ref aos docs]
**Validação:** ✅ Teste passou | ✅ Alinha user-stories.md [X.Y] | ✅ Atende tasks.md [X.Y] | ✅ Sem regressão

**Impacto Geral:**
- Antes: ✅ [X] passando | ❌ [Y] falhando | [Z]% cobertura
- Depois: ✅ [X+W] passando | ❌ [Y-W] falhando | [Z+V]% cobertura
- Melhoria: +[W] testes | +[V]% cobertura

---

### 📊 ANÁLISE DE QUALIDADE DO CÓDIGO

**Conformidade Código ↔ Docs:**
| Documento      | Conformidade | Gaps | Status  |
|----------------|--------------|------|---------|
| plan.md        | [X]%         | [Y]  | [✅/❌] |
| design.md      | [X]%         | [Y]  | [✅/❌] |
| tasks.md       | [X]%         | [Y]  | [✅/❌] |
| user-stories   | [X]%         | [Y]  | [✅/❌] |
| openapi.yaml   | [X]%         | [Y]  | [✅/❌] |

**Média:** [X]%

**Problemas de Qualidade no Código:**

**🔴 P0 - Bloqueadores:**
1. [Problema] - `src/[arquivo:linha]` - [descrição] - [correção]

**🟡 P1 - Alta:**
2. [Problema] - `src/[arquivo:linha]` - [descrição] - [correção]

**🟢 P2 - Melhorias:**
3. [Problema] - `src/[arquivo:linha]` - [descrição]

**Cobertura:**
- Áreas críticas descobertas: `src/[arquivo]` - [X]% (esperado: [Y]%)
- Happy paths: [X/Y] ([Z]%) | Edge cases: [X/Y] ([Z]%) | Error handling: [X/Y] ([Z]%)

---

### ✅ VALIDAÇÃO FINAL

**Checklist:**

**Conformidade Código** ([X/8])
- [ ] Implementa plan.md
- [ ] Segue design.md (stack/padrões)
- [ ] Cobertura >= meta ([X]% >= [Y]%)
- [ ] Atende tasks.md ([X/Y])
- [ ] Implementa user-stories.md ([X/Y])
- [ ] Respeita openapi.yaml ([X/Y])
- [ ] Endpoints corretos
- [ ] Schemas validados

**Qualidade Código** ([X/6])
- [ ] Sem anti-patterns P0
- [ ] Segue SOLID
- [ ] Legível/manutenível
- [ ] Error handling OK
- [ ] Performance OK
- [ ] Sem code smells graves

**Validação Testes** ([X/7])
- [ ] Todos passam ([X/Y])
- [ ] Sem skipped
- [ ] Cobertura >= meta
- [ ] Happy paths: 100%
- [ ] Edge cases: >= 80%
- [ ] Error cases: >= 80%
- [ ] Sem flaky

**Rastreabilidade** ([X/4])
- [ ] Stories têm código
- [ ] Tasks atendidas
- [ ] Endpoints implementados
- [ ] Código rastreável

**Score:** [X/25] ([Y]%)

**Classificação:**
- 90-100%: ✅ EXCELENTE
- 75-89%: ✅ BOM
- 60-74%: ⚠️ ACEITÁVEL
- < 60%: ❌ INSUFICIENTE

**Status:** [✅/⚠️/❌] [CLASSIFICAÇÃO]

---

### 📋 RESUMO EXECUTIVO

**✅ Fortes:**
1. [Aspecto positivo 1 com métrica]
2. [Aspecto positivo 2 com métrica]
3. [Aspecto positivo 3 com métrica]

**⚠️ Atenção:**
1. [Aspecto atenção 1]
2. [Aspecto atenção 2]
3. [Aspecto atenção 3]

**❌ Críticos:**
1. [Bloqueador 1] - **IMPEDE APROVAÇÃO**
2. [Bloqueador 2] - **IMPEDE APROVAÇÃO**

---

### 🎯 AÇÕES OBRIGATÓRIAS

**P0 - Bloqueadores (OBRIGATÓRIO):**
1. [ ] [Ação crítica no código 1]
2. [ ] [Ação crítica no código 2]

**P1 - Alta (RECOMENDADO):**
1. [ ] [Ação importante 1]
2. [ ] [Ação importante 2]

**P2 - Melhorias (OPCIONAL):**
1. [ ] [Melhoria 1]
2. [ ] [Melhoria 2]

---

### ✅ DECISÃO E PRÓXIMOS PASSOS

**Código Aprovado:** [✅ SIM / ⚠️ SIM com ressalvas / ❌ NÃO]

**Justificativa:** [Análise conformidade + qualidade + cobertura + alinhamento docs]

**Próximos Passos:**

**Se ✅ APROVADO:**
1. Deploy em [ambiente]
2. Monitorar métricas plan.md
3. Manter cobertura >= [meta]%

**Se ⚠️ RESSALVAS:**
1. Corrigir P1 antes de produção
2. Re-executar validação
3. Monitorar pontos de atenção

**Se ❌ REPROVADO:**
1. Corrigir TODOS P0
2. Implementar stories faltantes
3. Atender critérios tasks.md
4. Re-executar validação completa

---

### 📈 HISTÓRICO

**Anterior:** [data] | Score [X]% | [Y] passando | [Z]% cobertura | [status]
**Atual:** [data] | Score [X]% | [Y] passando | [Z]% cobertura | [status]
**Tendência:** [📈/📉/➡️] ([+/-X]%)

---

**Relatório automático - Validação Código via Testes**
**Base: docs /zed + testes + análise código**
```

---

## 🎯 GARANTIAS

✅ Código implementa TODA documentação /zed
✅ Código atende critérios tasks.md
✅ Código implementa cenários user-stories.md
✅ Código respeita contratos openapi.yaml
✅ Testes passam (validam comportamento correto)
✅ Cobertura >= meta
✅ Sem problemas P0 no código
✅ Rastreabilidade completa
✅ Decisão clara: APROVADO/RESSALVAS/REPROVADO
✅ Ações específicas para correções

---

**Pipeline:** `mapear` → `executar` → `comparar` → `corrigir` → `analisar` → `validar` 🚀