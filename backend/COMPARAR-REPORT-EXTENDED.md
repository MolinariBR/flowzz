# 🔍 COMPARAR-REPORT EXTENDED - Análise Completa

**Continuação do COMPARAR-REPORT.md**  
**Data:** 04/10/2025 14:15  
**Comando:** `tests.md` - COMPARAR (Opção A - Arquivos Restantes)  

---

## 🔍 DIAGNÓSTICO DETALHADO #2: ProjectionService.test.ts (30 falhas)

### 📋 Contexto da Documentação

**user-stories.md Story 4.1: Ver Projeções de Fluxo de Caixa**
```gherkin
Como afiliado (Maria)
Quero ver projeções do meu faturamento futuro
Para tomar decisões de investimento em anúncios

Cenário: Visualizar projeções 30 dias
  Dado que tenho histórico de 90 dias de vendas
  Quando acesso página 'Projeções'
  E seleciono período 'Próximos 30 dias'
  Então vejo 3 cenários:
    Pessimista: R$ 8.500 (baseado em pior semana)
    Realista: R$ 12.300 (baseado em média)
    Otimista: R$ 15.800 (baseado em melhor semana)
  E vejo confiança do modelo: 'Precisão estimada: 85%'

Cenário: Dados insuficientes
  Dado que tenho apenas 5 dias de histórico
  Quando acesso projeções
  Então vejo mensagem 'Precisamos de pelo menos 30 dias de dados'
```

**tasks.md Task 9.1: ProjectionService**
- 9.1.1: Algoritmo de médias móveis (7, 30, 90 dias)
- 9.1.2: Detecção de tendência (growth/stable/decline)
- 9.1.3: Ajuste de sazonalidade (dia da semana)
- 9.1.4: Cache Redis (TTL 6h)
- 9.1.5: Health score calculation
- **Critério:** "Mínimo 30 dias de histórico necessário"

---

### 🧪 FALHA #1-12: Mock Schema Mismatch (12 falhas)

#### 📋 Contexto
**Schema Prisma (Sale model):**
```prisma
model Sale {
  id              String     @id
  user_id         String
  product_name    String     // ❌ OBRIGATÓRIO - falta no mock
  unit_price      Decimal    // ❌ OBRIGATÓRIO - falta no mock
  total_price     Decimal    // ⚠️ Mock usa number, deveria ser Decimal
  status          SaleStatus
  created_at      DateTime
  updated_at      DateTime   // ❌ OBRIGATÓRIO - falta no mock
  // Não tem: tracking_code, platform
}
```

#### 💻 Código de Produção (ProjectionService.ts)
```typescript
// Linha ~530: getHistoricalSales
private async getHistoricalSales(userId: string, days: number): Promise<SaleData[]> {
  const sales = await prisma.sale.findMany({
    where: {
      user_id: userId,
      status: 'PAID',
      created_at: { gte: cutoffDate },
    },
  });

  return sales.map(sale => ({
    valor: Number(sale.total_price),  // Converte Decimal → number
    data_venda: sale.created_at,
  }));
}
```

#### 🧪 Código do Teste (ProjectionService.test.ts)
```typescript
// Linha ~536: Helper generateMockSales
function generateMockSales(days: number, minValue: number, maxValue: number) {
  const sales = [];
  for (let i = 0; i < days; i++) {
    for (let j = 0; j < salesPerDay; j++) {
      sales.push({
        id: `sale-${i}-${j}`,
        user_id: 'test-user-123',
        total_price: value,           // ❌ number, deveria ser Decimal
        created_at: date,
        status: 'PAID' as SaleStatus,
        tracking_code: `TRACK-${i}`,  // ❌ Campo inexistente no schema
        platform: 'coinzz',           // ❌ Campo inexistente no schema
        // ❌ Faltam: product_name, unit_price, updated_at
      });
    }
  }
  return sales;
}
```

#### 🎯 Diagnóstico
**🔴 FONTE:** ❌ **TESTE** (mock incompleto e com campos extras)

**Discrepância:**
- **Esperado (Schema):** `product_name`, `unit_price`, `updated_at` obrigatórios
- **Implementado (Mock):** `tracking_code`, `platform` inexistentes
- **Tipo Errado:** `total_price` é `Decimal`, mock usa `number`

**Gap Identificado:**
1. Mock não é type-safe (passa em runtime, TypeScript não valida mocks genéricos)
2. Campos obrigatórios faltando podem causar falhas em métodos que dependem deles
3. Inconsistência entre schema e testes dificulta manutenção

#### 💡 Correção Proposta

**ANTES (INCORRETO):**
```typescript
function generateMockSales(days: number, minValue: number, maxValue: number) {
  const sales = [];
  // ...
  sales.push({
    id: `sale-${i}-${j}`,
    user_id: 'test-user-123',
    total_price: value,               // ❌ number
    created_at: date,
    status: 'PAID' as SaleStatus,
    tracking_code: `TRACK-${i}-${j}`, // ❌ não existe
    platform: 'coinzz',               // ❌ não existe
  });
  return sales;
}
```

**DEPOIS (CORRETO):**
```typescript
import { Decimal } from '@prisma/client/runtime/library';
import type { Sale, SaleStatus } from '@prisma/client';

function generateMockSales(days: number, minValue: number, maxValue: number): Partial<Sale>[] {
  const sales: Partial<Sale>[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const salesPerDay = Math.floor(Math.random() * 5) + 2;
    
    for (let j = 0; j < salesPerDay; j++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

      sales.push({
        id: `sale-${i}-${j}`,
        user_id: 'test-user-123',
        client_id: null,
        external_id: null,
        product_name: `Produto Mock ${j}`,      // ✅ OBRIGATÓRIO
        product_sku: null,
        quantity: 1,
        unit_price: new Decimal(value),         // ✅ OBRIGATÓRIO (Decimal)
        total_price: new Decimal(value),        // ✅ Corrigido (Decimal)
        commission: null,
        status: 'PAID' as SaleStatus,
        payment_method: null,
        payment_due_date: null,
        payment_date: date,
        shipped_at: null,
        delivered_at: null,
        created_at: date,
        updated_at: date,                       // ✅ OBRIGATÓRIO
      });
    }
  }

  return sales as any; // Cast para compatibilidade com vi.mocked(prisma.sale.findMany)
}
```

**Justificativa:**
- Alinha com schema.prisma (todos campos obrigatórios presentes)
- Remove campos inexistentes (`tracking_code`, `platform`)
- Usa `Decimal` para valores monetários (consistência com Prisma)
- Type annotation `Partial<Sale>[]` para type-safety

**Valida:**
- design.md §Testing Strategy - "Mocks devem refletir schema real"
- schema.prisma - Sale model completo

#### ✅ Validação
- [ ] Rodar testes com mock corrigido
- [ ] Verificar se `SaleData` interface aceita `Decimal` ou precisa converter
- [ ] Confirmar que métodos como `calculateMovingAverage` lidam com `Decimal`
- [ ] Validar performance (conversão Decimal → number se necessária)

**Impact:** Fixes **12 testes** que dependem de `generateMockSales`:
1. ✅ calculateSalesProjection - 30 dias
2. ✅ calculateSalesProjection - cache hit
3. ✅ calculateSalesProjection - 7 dias
4. ✅ calculateSalesProjection - 90 dias
5. ✅ calculateSalesProjection - 180 dias
6. ✅ calculateSalesProjection - 365 dias
7. ✅ detectTrend - growth
8. ✅ detectTrend - stable
9. ✅ detectTrend - decline
10. ✅ calculateMovingAverage - 7 dias
11. ✅ calculateMovingAverage - 30 dias
12. ✅ calculateVariance - consistent sales

---

### 🧪 FALHA #13: Mock adsExpense → ad (1 falha)

#### 💻 Código de Produção
```typescript
// Linha ~590: ProjectionService.ts
private async getHistoricalAdsExpenses(userId: string, days: number) {
  const ads = await prisma.ad.findMany({ // ✅ Usa prisma.ad
    where: {
      user_id: userId,
      date: { gte: cutoffDate },
    },
  });

  return ads.map(ad => ({
    valor: Number(ad.amount_spent),
    data: ad.date,
  }));
}
```

#### 🧪 Código do Teste
```typescript
// Linha ~10: Mock configuration
vi.mock('../../shared/config/database', () => ({
  prisma: {
    sale: { findMany: vi.fn(), count: vi.fn() },
    adsExpense: { // ❌ Schema usa 'ad', não 'adsExpense'
      findMany: vi.fn(),
    },
  },
}));
```

#### 🎯 Diagnóstico
**🔴 FONTE:** ❌ **TESTE** (mesmo erro do GoalService - inconsistência de nomenclatura)

**Problema:** Mock usa nome `adsExpense` mas schema.prisma define `model Ad`

**Correção:**
```typescript
// ANTES:
vi.mock('../../shared/config/database', () => ({
  prisma: {
    sale: { findMany: vi.fn(), count: vi.fn() },
    adsExpense: { findMany: vi.fn() }, // ❌
  },
}));

// DEPOIS:
vi.mock('../../shared/config/database', () => ({
  prisma: {
    sale: { findMany: vi.fn(), count: vi.fn() },
    ad: { // ✅ Corrigido
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));
```

**Justificativa:** Consistência com schema.prisma `model Ad`

**Valida:** Mesma correção aplicada em GoalService (CORRIGIR-REPORT.md #3)

**Impact:** Fixes **1 teste**:
1. ✅ calculateCashflowProjection - basic projection

---

### 🧪 FALHA #14-16: Error Message Mismatch (3 falhas)

#### 💻 Código de Produção
```typescript
// Linha ~65: ProjectionService.ts
if (sales.length === 0) {
  throw new Error('Nenhuma venda encontrada para calcular projeções');
}

// Linha ~70:
if (daysCovered < this.MIN_HISTORICAL_DAYS) {
  throw new Error(
    `Dados históricos insuficientes. Necessário ${this.MIN_HISTORICAL_DAYS} dias, ` +
    `encontrado ${daysCovered} dias. Coletando dados: ${daysCovered}/${this.MIN_HISTORICAL_DAYS} dias.`
  );
}
```

#### 🧪 Código do Teste
```typescript
// Linha ~182: Teste #1 - histórico < 30 dias
await expect(
  projectionService.calculateSalesProjection(testUserId, ProjectionPeriod.THIRTY)
).rejects.toThrow('Dados históricos insuficientes para gerar projeções confiáveis');
//                  ❌ Esperado: mensagem genérica
//                  ✅ Recebido: mensagem detalhada com contador

// Linha ~191: Teste #2 - sem vendas
await expect(
  projectionService.calculateSalesProjection(testUserId, ProjectionPeriod.THIRTY)
).rejects.toThrow('Dados históricos insuficientes para gerar projeções confiáveis');
//                  ❌ Esperado: mensagem genérica
//                  ✅ Recebido: "Nenhuma venda encontrada para calcular projeções"

// Linha ~202: Teste #3 - histórico em dias únicos < 30
await expect(
  projectionService.calculateSalesProjection(testUserId, ProjectionPeriod.THIRTY)
).rejects.toThrow('Dados históricos insuficientes para gerar projeções confiáveis');
//                  ❌ Esperado: mensagem genérica
//                  ✅ Recebido: mensagem detalhada com contador
```

#### 🎯 Diagnóstico
**🔴 FONTE:** ⚠️ **AMBOS** (código usa mensagens detalhadas, testes esperam genérica)

**Análise:**
- **Código:** Mensagens detalhadas com contexto (boas para debug em produção)
- **Testes:** Esperam mensagem genérica user-friendly
- **user-stories.md:** Espera "Precisamos de pelo menos 30 dias de dados"

**Opções de Correção:**

**Opção A: Atualizar Testes** (recomendado para desenvolvimento)
```typescript
// Mais específicos, testam mensagens exatas do código
await expect(/*...*/).rejects.toThrow('Dados históricos insuficientes');
await expect(/*...*/).rejects.toThrow('Nenhuma venda encontrada');
```

**Opção B: Atualizar Código** (melhor UX, mas perde contexto debug)
```typescript
// Todas as validações lançam mesma mensagem genérica
if (sales.length === 0) {
  throw new Error('Dados históricos insuficientes para gerar projeções confiáveis');
}
if (daysCovered < this.MIN_HISTORICAL_DAYS) {
  throw new Error('Dados históricos insuficientes para gerar projeções confiáveis');
}
```

**Opção C: Hybrid** (mensagens user-friendly + contexto em logs)
```typescript
if (sales.length === 0) {
  logger.warn('Tentativa de projeção sem vendas', { userId });
  throw new Error('Precisamos de pelo menos 30 dias de dados para projeções confiáveis');
}
if (daysCovered < this.MIN_HISTORICAL_DAYS) {
  logger.warn('Histórico insuficiente', { userId, daysCovered, required: this.MIN_HISTORICAL_DAYS });
  throw new Error('Precisamos de pelo menos 30 dias de dados para projeções confiáveis');
}
```

**Recomendação:** **Opção C** - mantém UX user-friendly + contexto em logs

**Valida:** user-stories.md Story 4.1 Cenário "Dados insuficientes"

**Impact:** Fixes **3 testes**:
1. ✅ deve lançar erro quando histórico < 30 dias
2. ✅ deve lançar erro quando não há vendas
3. ✅ deve lançar erro quando histórico cobre < 30 dias únicos

---

### 🧪 FALHA #17-22: Properties Undefined + Missing Calculations (6 falhas)

#### 💻 Código de Produção
```typescript
// Linha ~95: ProjectionService.ts - calculateSalesProjection
const dailyPessimistic = Math.min(avg7Days, avg30Days, avg90Days) * 0.8;
const dailyRealistic = avg7Days * 0.3 + avg30Days * 0.5 + avg90Days * 0.2;
const dailyOptimistic = Math.max(avg7Days, avg30Days, avg90Days) * 1.3;

// Linha ~102: Aplicar tendência
const trendMultiplier = trend === 'growth' ? 1.1 : trend === 'decline' ? 0.9 : 1.0;
const dailyRealisticWithTrend = dailyRealistic * trendMultiplier;

// Linha ~105: ❌ PROBLEMA - Variáveis pessimisticTotal, realisticTotal, optimisticTotal
//                            NÃO SÃO CRIADAS mas são usadas no return!

const result: ProjectionResult = {
  period,
  pessimistic_scenario: pessimisticTotal, // ❌ ReferenceError: pessimisticTotal is not defined
  realistic_scenario: realisticTotal,     // ❌ ReferenceError: realisticTotal is not defined
  optimistic_scenario: optimisticTotal,   // ❌ ReferenceError: optimisticTotal is not defined
  confidence,
  trend,
  generated_at: new Date().toISOString(),
};
```

#### 🧪 Código do Teste
```typescript
// Linha ~82-90: Testes esperam properties
expect(result).toHaveProperty('pessimistic_scenario'); // ❌ undefined
expect(result).toHaveProperty('realistic_scenario');   // ❌ undefined
expect(result).toHaveProperty('optimistic_scenario');  // ❌ undefined
expect(result.pessimistic_scenario).toBeGreaterThan(0);
expect(result.realistic_scenario).toBeGreaterThan(0);
expect(result.optimistic_scenario).toBeGreaterThan(0);
```

#### 🎯 Diagnóstico
**🔴 FONTE:** ❌ **CÓDIGO** (variáveis não são calculadas antes do return)

**Problema Crítico:**
- Código calcula médias **diárias** (dailyPessimistic, dailyRealistic, dailyOptimistic)
- **MAS NÃO MULTIPLICA pelo período** para obter totais
- Retorna variáveis `pessimisticTotal`, `realisticTotal`, `optimisticTotal` que **nunca foram criadas**

**Análise de Impacto:**
- Código atual lança `ReferenceError` em runtime
- Testes falham com "expected undefined to have property"
- Projeções nunca funcionaram em produção

#### 💡 Correção Proposta

**ANTES (INCORRETO):**
```typescript
const dailyRealisticWithTrend = dailyRealistic * trendMultiplier;

// ❌ Nada aqui!

const result: ProjectionResult = {
  period,
  pessimistic_scenario: pessimisticTotal, // ❌ não existe
  realistic_scenario: realisticTotal,     // ❌ não existe
  optimistic_scenario: optimisticTotal,   // ❌ não existe
  confidence,
  trend,
  generated_at: new Date().toISOString(),
};
```

**DEPOIS (CORRETO):**
```typescript
const dailyRealisticWithTrend = dailyRealistic * trendMultiplier;

// ✅ Calcular totais para o período
const periodDays = this.getPeriodDays(period);
const pessimisticTotal = dailyPessimistic * periodDays;
const realisticTotal = dailyRealisticWithTrend * periodDays;
const optimisticTotal = dailyOptimistic * periodDays;

const result: ProjectionResult = {
  period,
  pessimistic_scenario: Math.round(pessimisticTotal * 100) / 100, // ✅ Arredondar para 2 decimais
  realistic_scenario: Math.round(realisticTotal * 100) / 100,
  optimistic_scenario: Math.round(optimisticTotal * 100) / 100,
  confidence,
  trend,
  generated_at: new Date().toISOString(),
};

return result;
```

**Helper Method (adicionar à classe):**
```typescript
/**
 * Converte enum ProjectionPeriod em número de dias
 */
private getPeriodDays(period: ProjectionPeriod): number {
  switch (period) {
    case ProjectionPeriod.SEVEN: return 7;
    case ProjectionPeriod.THIRTY: return 30;
    case ProjectionPeriod.NINETY: return 90;
    case ProjectionPeriod.ONE_EIGHTY: return 180;
    case ProjectionPeriod.THREE_SIXTY_FIVE: return 365;
    default: 
      logger.warn(`Período desconhecido: ${period}, usando 30 dias`);
      return 30;
  }
}
```

**Justificativa:**
- Fix crítico - código estava broken
- Implementa lógica de projeção conforme tasks.md 9.1.1
- Arredonda para 2 decimais (valores monetários)
- Helper method facilita manutenção

**Valida:**
- user-stories.md Story 4.1: "Pessimista: R$ 8.500, Realista: R$ 12.300, Otimista: R$ 15.800"
- tasks.md 9.1.1: "Projetar vendas para períodos: 7, 30, 90, 180, 365 dias"

**Impact:** Fixes **6 testes** (calculateSalesProjection para todos períodos):
1. ✅ deve retornar projeções para 30 dias
2. ✅ deve calcular projeção para 7 dias
3. ✅ deve calcular projeção para 90 dias
4. ✅ deve calcular projeção para 180 dias
5. ✅ deve calcular projeção para 365 dias
6. ✅ deve usar cache se disponível (properties agora existem)

---

### 🧪 FALHA #23-25: Trend Detection Logic Incorrect (3 falhas)

#### 💻 Código de Produção
```typescript
// Linha ~380: ProjectionService.ts - detectTrend
async detectTrend(userId: string): Promise<TrendType> {
  const sales = await this.getHistoricalSales(userId, 14);
  
  if (sales.length === 0) {
    return TrendType.STABLE;
  }

  // ❌ PROBLEMA: Filtros podem estar invertidos ou com lógica errada
  const last7Days = sales.filter(/* últimos 7 dias */);
  const previous7Days = sales.filter(/* 7-14 dias atrás */);

  const avg7 = this.calculateMovingAverage(last7Days, 7);
  const avg14 = this.calculateMovingAverage(previous7Days, 7);

  const change = ((avg7 - avg14) / avg14) * 100;

  if (change > 5) return TrendType.GROWTH;
  if (change < -5) return TrendType.DECLINE;
  return TrendType.STABLE;
}
```

#### 🧪 Código do Teste
```typescript
// Linha ~217: Teste #1 - Espera GROWTH
const mockSales = [
  ...generateMockSalesForPeriod(7, 14, 550, 650), // dias 7-14 atrás (média ~600)
  ...generateMockSalesForPeriod(0, 7, 350, 450),  // dias 0-7 atrás (média ~400)
];
vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales);

const trend = await projectionService.detectTrend(testUserId);
expect(trend).toBe(TrendType.GROWTH); // ❌ Recebe STABLE

// Análise:
// - Últimos 7 dias (0-7): média ~400
// - Anteriores 7 dias (7-14): média ~600
// - Mudança: (400 - 600) / 600 = -33% → DECLINE (não GROWTH!)
// ❌ TESTE ESTÁ ERRADO ou ordem dos períodos está invertida
```

#### 🎯 Diagnóstico
**🔴 FONTE:** ⚠️ **AMBOS** (lógica do código + setup do teste confusos)

**Análise Detalhada:**

**Problema 1: Helper `generateMockSalesForPeriod` é confuso**
```typescript
function generateMockSalesForPeriod(startDaysAgo: number, endDaysAgo: number, min, max) {
  for (let i = startDaysAgo; i < endDaysAgo; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i); // Subtrai i dias
  }
}

// Chamada: generateMockSalesForPeriod(0, 7, 350, 450)
// Gera: i=0,1,2,3,4,5,6 → hoje até 6 dias atrás (últimos 7 dias)

// Chamada: generateMockSalesForPeriod(7, 14, 550, 650)
// Gera: i=7,8,9,10,11,12,13 → 7 até 13 dias atrás (anteriores 7 dias)
```

**Problema 2: Ordem no array mockSales está invertida**
```typescript
const mockSales = [
  ...generateMockSalesForPeriod(7, 14, 550, 650), // ← Anteriores PRIMEIRO
  ...generateMockSalesForPeriod(0, 7, 350, 450),  // ← Últimos DEPOIS
];
// Mas teste espera GROWTH, o que significa últimos > anteriores
// Últimos (0-7) = 350-450 (média 400)
// Anteriores (7-14) = 550-650 (média 600)
// 400 < 600 → DECLINE, não GROWTH!
```

**Problema 3: Teste está com valores invertidos OU método detectTrend compara errado**

#### 💡 Correção Proposta

**Opção A: Corrigir Teste** (valores estão invertidos)
```typescript
// ANTES (ERRADO):
it('deve detectar tendência de crescimento quando últimos 7d > média anterior', async () => {
  const mockSales = [
    ...generateMockSalesForPeriod(7, 14, 550, 650), // Anteriores: média 600
    ...generateMockSalesForPeriod(0, 7, 350, 450),  // Últimos: média 400
  ];
  expect(trend).toBe(TrendType.GROWTH); // ❌ 400 < 600 = DECLINE!
});

// DEPOIS (CORRETO):
it('deve detectar tendência de crescimento quando últimos 7d > média anterior', async () => {
  const mockSales = [
    ...generateMockSalesForPeriod(7, 14, 350, 450), // ✅ Anteriores: média 400
    ...generateMockSalesForPeriod(0, 7, 550, 650),  // ✅ Últimos: média 600
  ];
  vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales);

  const trend = await projectionService.detectTrend(testUserId);
  
  expect(trend).toBe(TrendType.GROWTH); // ✅ 600 > 400 = +50% = GROWTH
});
```

**Opção B: Corrigir detectTrend** (se lógica de filtro estiver errada)
```typescript
// Revisar filtros em detectTrend para garantir:
async detectTrend(userId: string): Promise<TrendType> {
  const sales = await this.getHistoricalSales(userId, 14);
  const now = new Date();
  
  if (sales.length === 0) {
    return TrendType.STABLE;
  }

  // ✅ Últimos 7 dias: hoje até 7 dias atrás
  const last7Days = sales.filter(s => {
    const dayDiff = Math.floor((now.getTime() - new Date(s.data_venda).getTime()) / (1000 * 60 * 60 * 24));
    return dayDiff >= 0 && dayDiff < 7;
  });

  // ✅ Anteriores 7 dias: 7 até 14 dias atrás
  const previous7Days = sales.filter(s => {
    const dayDiff = Math.floor((now.getTime() - new Date(s.data_venda).getTime()) / (1000 * 60 * 60 * 24));
    return dayDiff >= 7 && dayDiff < 14;
  });

  if (last7Days.length === 0 || previous7Days.length === 0) {
    return TrendType.STABLE;
  }

  const avgLast = last7Days.reduce((sum, s) => sum + s.valor, 0) / last7Days.length;
  const avgPrev = previous7Days.reduce((sum, s) => sum + s.valor, 0) / previous7Days.length;

  const change = ((avgLast - avgPrev) / avgPrev) * 100;

  logger.info('Trend detection', { avgLast, avgPrev, change });

  if (change > 5) return TrendType.GROWTH;
  if (change < -5) return TrendType.DECLINE;
  return TrendType.STABLE;
}
```

**Recomendação:** **Opção A** (corrigir teste) + adicionar logs em **Opção B** para debug

**Valida:**
- tasks.md 9.1.2: "Detecção de tendência comparando últimos 7 dias vs anteriores"
- Lógica matemática: (atual - anterior) / anterior = % mudança

**Impact:** Fixes **3 testes**:
1. ✅ deve detectar tendência de crescimento
2. ✅ deve detectar tendência estável
3. ✅ deve detectar tendência de declínio

---

### 🧪 FALHA #26-28: Helper Methods Receiving Wrong Types (3 falhas)

#### 💻 Código de Produção
```typescript
// Linha ~410: calculateMovingAverage
calculateMovingAverage(sales: SaleData[], days: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSales = sales.filter(sale => new Date(sale.data_venda) >= cutoffDate);
  //                  ❌ Espera SaleData[] mas teste passa Sale[] diretamente
  
  if (recentSales.length === 0) return 0;
  
  const total = recentSales.reduce((sum, sale) => sum + sale.valor, 0);
  //                                                      ❌ Sale não tem 'valor'
  return total / days;
}
```

**Interfaces:**
```typescript
// SaleData (ProjectionService.interface.ts)
interface SaleData {
  valor: number;
  data_venda: Date;
}

// Sale (Prisma)
interface Sale {
  id: string;
  total_price: Decimal; // ❌ Não é 'valor'
  created_at: Date;     // ❌ Não é 'data_venda'
  // ... outros 15 campos
}
```

#### 🧪 Código do Teste
```typescript
// Linha ~262: Teste chama método público diretamente
const mockSales = generateMockSales(30, 400, 500); // Retorna Partial<Sale>[]
const avg = projectionService.calculateMovingAverage(mockSales, 7);
//                                                   ❌ Passa Sale[] mas espera SaleData[]
```

#### 🎯 Diagnóstico
**🔴 FONTE:** ❌ **TESTE** (passa tipo errado para métodos públicos)

**Problema:**
- Métodos públicos `calculateMovingAverage`, `calculateVariance`, `analyzeSeasonality` aceitam `SaleData[]`
- Testes passam `Sale[]` do Prisma diretamente
- TypeScript não detecta erro porque mock é `any`
- Runtime falha: `TypeError: Cannot read property 'valor' of undefined`

#### 💡 Correção Proposta

**ANTES (INCORRETO):**
```typescript
const mockSales = generateMockSales(30, 400, 500); // Retorna Sale[]
const avg = projectionService.calculateMovingAverage(mockSales, 7); // ❌
```

**DEPOIS - Opção A (Converter Mock):**
```typescript
const mockSales = generateMockSales(30, 400, 500);
const salesData: SaleData[] = mockSales.map(s => ({
  valor: Number(s.total_price),
  data_venda: s.created_at,
}));
const avg = projectionService.calculateMovingAverage(salesData, 7); // ✅
```

**DEPOIS - Opção B (Helper Retorna SaleData):**
```typescript
// Modificar generateMockSales para retornar SaleData[]
function generateMockSalesData(days: number, min: number, max: number): SaleData[] {
  const salesData: SaleData[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const salesPerDay = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < salesPerDay; j++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const value = Math.floor(Math.random() * (max - min + 1)) + min;

      salesData.push({
        valor: value,
        data_venda: date,
      });
    }
  }

  return salesData;
}

// Uso:
const salesData = generateMockSalesData(30, 400, 500);
const avg = projectionService.calculateMovingAverage(salesData, 7); // ✅
```

**DEPOIS - Opção C (Método Aceita Ambos - Overload):**
```typescript
// ProjectionService.ts
calculateMovingAverage(sales: SaleData[] | Sale[], days: number): number {
  // Normalizar para SaleData[]
  const normalized: SaleData[] = sales.map(s => 
    'valor' in s 
      ? s 
      : { 
          valor: Number(s.total_price), 
          data_venda: s.created_at 
        }
  );

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSales = normalized.filter(sale => 
    new Date(sale.data_venda) >= cutoffDate
  );

  if (recentSales.length === 0) return 0;

  const total = recentSales.reduce((sum, sale) => sum + sale.valor, 0);
  return total / days;
}
```

**Recomendação:** **Opção B** (helper específico) - mantém separação entre Sale (DB) e SaleData (logic)

**Valida:**
- design.md §Clean Architecture: "Domain models separados de DB models"
- Princípio DDD: `SaleData` é Value Object, `Sale` é Entity

**Impact:** Fixes **3 testes**:
1. ✅ calculateMovingAverage - 7 dias
2. ✅ calculateMovingAverage - 30 dias
3. ✅ calculateMovingAverage - sem dados

---

### 🧪 FALHA #29-31: Variance/Seasonality Methods Wrong Input (3 falhas)

**Mesmo problema da falha #26-28**, mas nos métodos:

**calculateVariance:**
```typescript
// Linha ~435: Espera SaleData[]
calculateVariance(sales: SaleData[]): number {
  const dailyTotals = this.groupSalesByDay(sales);
  // ❌ Teste passa Sale[]
}
```

**analyzeSeasonality:**
```typescript
// Linha ~490: Espera SaleData[]
analyzeSeasonality(sales: SaleData[]): SeasonalityData {
  sales.forEach(sale => {
    const dayOfWeek = new Date(sale.data_venda).getDay();
    // ❌ Teste passa Sale[], acessa sale.data_venda que não existe
  });
}
```

**groupSalesByDay (helper privado):**
```typescript
// Linha ~630: Espera SaleData[]
private groupSalesByDay(sales: SaleData[]): Record<string, number> {
  sales.forEach(sale => {
    grouped[dateKey] = (grouped[dateKey] || 0) + sale.valor;
    // ❌ Sale não tem 'valor'
  });
}
```

**Erro Runtime:**
- `TypeError: sales.forEach is not a function` (quando passa tipo incompatível)
- `TypeError: Cannot read property 'data_venda' of undefined`

#### 💡 Correção
**Mesma da falha #26-28:** Usar helper `generateMockSalesData()` ou converter mocks

**Impact:** Fixes **6 testes**:
1. ✅ calculateVariance - vendas consistentes
2. ✅ calculateVariance - vendas voláteis
3. ✅ calculateVariance - sem dados
4. ✅ analyzeSeasonality - padrões por dia da semana
5. ✅ analyzeSeasonality - sem dados
6. ✅ adjustForSeasonality - segunda-feira (1.10)

---

### 🧪 FALHA #32-33: Spy Cache Invalidation (2 falhas)

#### 🧪 Código do Teste
```typescript
// Linha ~515: Teste #1
it('deve invalidar cache de projeções quando nova venda', async () => {
  await projectionService.invalidateCache(testUserId);

  // ❌ PROBLEMA: vi.fn() cria novo spy a cada chamada!
  expect(vi.fn()).toHaveBeenCalledWith(
    expect.stringContaining(`projections:sales:${testUserId}`)
  );
});

// Linha ~524: Teste #2
it('deve invalidar cache quando sync de dados', async () => {
  await projectionService.invalidateCache(testUserId);

  // ❌ PROBLEMA: Spy nunca é invocado porque é novo
  expect(vi.fn()).toHaveBeenCalled();
});
```

#### 🎯 Diagnóstico
**🔴 FONTE:** ❌ **TESTE** (spy configurado incorretamente)

**Problema:**
- `vi.fn()` cria **novo** spy function a cada chamada
- Spy criado no `expect()` nunca é o mesmo que `redisService.deletePattern` usa
- Teste nunca passa porque verifica spy errado

**Análise:**
```typescript
// ❌ ERRADO:
expect(vi.fn()).toHaveBeenCalled(); 
// Cria spy1, verifica se spy1 foi chamado (nunca foi)

// ✅ CORRETO:
const spy = vi.mocked(redisService.deletePattern);
expect(spy).toHaveBeenCalled();
// Verifica spy do mock real que o código usa
```

#### 💡 Correção Proposta

**ANTES (INCORRETO):**
```typescript
it('deve invalidar cache quando nova venda', async () => {
  await projectionService.invalidateCache(testUserId);

  expect(vi.fn()).toHaveBeenCalledWith( // ❌ Spy errado
    expect.stringContaining(`projections:sales:${testUserId}`)
  );
});
```

**DEPOIS (CORRETO):**
```typescript
import { redisService } from '../../shared/services/RedisService';

it('deve invalidar cache quando nova venda', async () => {
  const deletePatternSpy = vi.mocked(redisService.deletePattern);
  
  await projectionService.invalidateCache(testUserId);

  // Verifica que deletePattern foi chamado com padrões corretos
  expect(deletePatternSpy).toHaveBeenCalledWith(
    expect.stringContaining(`projections:sales:${testUserId}`)
  );
  expect(deletePatternSpy).toHaveBeenCalledWith(
    expect.stringContaining(`projections:cashflow:${testUserId}`)
  );
  expect(deletePatternSpy).toHaveBeenCalledWith(
    expect.stringContaining(`projections:health:${testUserId}`)
  );
});

it('deve invalidar cache quando sync de dados', async () => {
  const deletePatternSpy = vi.mocked(redisService.deletePattern);
  
  await projectionService.invalidateCache(testUserId);

  expect(deletePatternSpy).toHaveBeenCalled();
  expect(deletePatternSpy).toHaveBeenCalledTimes(3); // 3 padrões diferentes
});
```

**Justificativa:**
- Spy correto referencia o mock real usado pelo código
- Valida behavior: invalidateCache deve deletar 3 padrões de cache
- Segue design.md §Cache Strategy: "Invalidar em nova venda/sync"

**Valida:**
- tasks.md 9.1.4: "Cache Redis invalidado em eventos de sync"
- design.md §Cache: "TTL 6h + invalidação manual"

**Impact:** Fixes **2 testes**:
1. ✅ deve invalidar cache quando nova venda
2. ✅ deve invalidar cache quando sync de dados

---

## 📊 RESUMO ProjectionService.test.ts

### Categorização de Falhas

| # | Categoria | Fonte | Testes | Correção | Prioridade |
|---|-----------|-------|--------|----------|------------|
| 1-12 | Mock Schema Mismatch | Teste | 12 | Alinhar com Prisma Sale | P0 |
| 13 | Mock Namespace | Teste | 1 | adsExpense → ad | P0 |
| 14-16 | Error Messages | Ambos | 3 | Hybrid (UX + logs) | P1 |
| 17-22 | Properties Undefined | Código | 6 | Calcular totais + getPeriodDays | **P0 Crítico** |
| 23-25 | Trend Logic | Ambos | 3 | Fix filtros + corrigir teste | P0 |
| 26-28 | Type Conversion (MA) | Teste | 3 | Helper generateMockSalesData | P1 |
| 29-31 | Type Conversion (Var/Season) | Teste | 3 | Mesma correção #26-28 | P1 |
| 32-33 | Spy Cache | Teste | 2 | Use vi.mocked(redisService) | P2 |
| **TOTAL** | **8 categorias** | **18T + 9C + 3A** | **33** | **8 correções** | - |

**Legenda:** T=Teste, C=Código, A=Ambos

### Distribuição por Fonte
- ❌ **Testes (18 falhas):** Mocks, types, spies incorretos
- ❌ **Código (9 falhas):** Properties undefined (crítico), trend logic
- ⚠️ **Ambos (3+3 falhas):** Error messages, trend test setup

### Priorização de Correções

**P0 CRÍTICO (Código Broken - 19 testes):**
1. **#17-22:** Properties undefined → Implementar cálculo de totais **(6 testes)**
   - **BLOQUEADOR:** Código lança ReferenceError, projeções não funcionam
   - **Tempo:** 30 minutos
   - **Arquivo:** `ProjectionService.ts` linha ~105

2. **#1-12:** Mock schema mismatch → Alinhar com Prisma **(12 testes)**
   - **Impact:** Todos testes que dependem de generateMockSales
   - **Tempo:** 45 minutos
   - **Arquivo:** `ProjectionService.test.ts` linha ~536

3. **#23-25:** Trend detection → Corrigir filtros + teste **(3 testes)**
   - **Blocker:** Lógica confusa entre código e teste
   - **Tempo:** 30 minutos
   - **Arquivos:** `ProjectionService.ts` + test

**P1 ALTO (Mocks/Types - 9 testes):**
4. **#26-31:** Type conversions → Helper `generateMockSalesData` **(6 testes)**
   - **Tempo:** 20 minutos
   - **Arquivo:** `ProjectionService.test.ts`

5. **#14-16:** Error messages → Hybrid approach **(3 testes)**
   - **Tempo:** 15 minutos
   - **Arquivo:** `ProjectionService.ts`

**P2 MÉDIO (Polish - 3 testes):**
6. **#13:** Mock namespace → adsExpense → ad **(1 teste)**
   - **Tempo:** 5 minutos
   - **Arquivo:** Mock config linha ~10

7. **#32-33:** Spy cache → Use proper spy **(2 testes)**
   - **Tempo:** 10 minutos
   - **Arquivo:** `ProjectionService.test.ts`

### Estimativa de Tempo Total
- **P0 Crítico:** 1h 45min → **19 testes fixados**
- **P1 Alto:** 35min → **9 testes fixados**
- **P2 Médio:** 15min → **3 testes fixados**
- **TOTAL:** **2h 35min** → **31/33 testes fixados** (93.9%)

*(2 testes restantes podem depender de ajustes finos após correções principais)*

---

**Próxima Ação:** Continuar COMPARAR para:
- DashboardService.test.ts (7 falhas)
- TagService.test.ts (4 falhas)
- ClientRepository.test.ts (7 falhas)

**Ou** aplicar correções P0 do ProjectionService imediatamente para validar diagnóstico?

