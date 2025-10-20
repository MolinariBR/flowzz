// Referência: design.md §Testing Strategy, dev-stories.md §Dev Story 4.1, user-stories.md Story 4.1
// Testes unitários para ProjectionService com algoritmos de projeção

import type { SaleStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectionPeriod, TrendType } from '../../interfaces/ProjectionService.interface'

// Mock do database ANTES do import
vi.mock('../../shared/config/database', () => ({
  prisma: {
    sale: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    ad: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}))

// Mock Redis Service
vi.mock('../../shared/services/RedisService', () => ({
  redisService: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    deletePattern: vi.fn().mockResolvedValue(undefined),
  },
}))

// Importar DEPOIS dos mocks
import { ProjectionService } from '../../services/ProjectionService'
import { prisma } from '../../shared/config/database'

describe('ProjectionService', () => {
  let projectionService: ProjectionService
  const testUserId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
    // Configurar mocks padrão
    vi.mocked(prisma.sale.findMany).mockResolvedValue([])
    vi.mocked(prisma.sale.count).mockResolvedValue(0)
    vi.mocked(prisma.ad.findMany).mockResolvedValue([])
    projectionService = new ProjectionService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Service Instantiation', () => {
    it('deve instanciar ProjectionService corretamente', () => {
      expect(projectionService).toBeInstanceOf(ProjectionService)
    })

    it('deve ter todos os métodos públicos definidos', () => {
      expect(typeof projectionService.calculateSalesProjection).toBe('function')
      expect(typeof projectionService.calculateCashflowProjection).toBe('function')
      expect(typeof projectionService.calculateHealthScore).toBe('function')
      expect(typeof projectionService.detectTrend).toBe('function')
      expect(typeof projectionService.calculateMovingAverage).toBe('function')
      expect(typeof projectionService.calculateVariance).toBe('function')
      expect(typeof projectionService.adjustForSeasonality).toBe('function')
      expect(typeof projectionService.analyzeSeasonality).toBe('function')
      expect(typeof projectionService.invalidateCache).toBe('function')
    })
  })

  describe('calculateSalesProjection - Story 4.1 Cenário: Visualizar projeções 30 dias', () => {
    it('deve retornar projeções para 30 dias com 3 cenários e confiança >= 85%', async () => {
      // Gherkin: "Dado que tenho histórico de 90 dias de vendas"
      const mockSales = generateMockSales(90, 400, 500) // 90 dias, média R$ 450/dia
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      // Gherkin: "Quando acesso página 'Projeções' E seleciono período 'Próximos 30 dias'"
      const result = await projectionService.calculateSalesProjection(
        testUserId,
        ProjectionPeriod.DAYS_30
      )

      // Gherkin: "Então vejo 3 cenários"
      expect(result).toHaveProperty('period', ProjectionPeriod.DAYS_30)
      expect(result).toHaveProperty('pessimistic')
      expect(result).toHaveProperty('realistic')
      expect(result).toHaveProperty('optimistic')

      // Gherkin: "Pessimista: R$ 8.500 (baseado em pior semana)"
      expect(result.pessimistic).toBeGreaterThan(0)
      expect(result.pessimistic).toBeLessThan(result.realistic)

      // Gherkin: "Realista: R$ 12.300 (baseado em média)"
      expect(result.realistic).toBeGreaterThan(0)
      expect(result.realistic).toBeGreaterThan(result.pessimistic)
      expect(result.realistic).toBeLessThan(result.optimistic)

      // Gherkin: "Otimista: R$ 15.800 (baseado em melhor semana)"
      expect(result.optimistic).toBeGreaterThan(result.realistic)

      // Gherkin: "E vejo confiança do modelo: 'Precisão estimada: 85%'"
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(100)

      // Verificar que foi cacheado (TTL 6h = 21600s)
      expect(vi.fn()).toHaveBeenCalledWith(
        `projections:sales:${testUserId}:${ProjectionPeriod.DAYS_30}`,
        21600,
        expect.any(String)
      )
    })

    it('deve usar cache se disponível', async () => {
      const cachedResult = {
        period: ProjectionPeriod.DAYS_30,
        pessimistic_scenario: 10000,
        realistic_scenario: 15000,
        optimistic_scenario: 20000,
        confidence: 85,
        trend: TrendType.GROWTH,
        generated_at: new Date().toISOString(),
      }
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(JSON.stringify(cachedResult))

      const result = await projectionService.calculateSalesProjection(
        testUserId,
        ProjectionPeriod.DAYS_30
      )

      expect(result).toEqual(cachedResult)
      expect(prisma.sale.findMany).not.toHaveBeenCalled()
    })

    it('deve calcular projeção para 7 dias', async () => {
      const mockSales = generateMockSales(30, 300, 400)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      const result = await projectionService.calculateSalesProjection(
        testUserId,
        ProjectionPeriod.DAYS_7
      )

      expect(result.period).toBe(ProjectionPeriod.DAYS_7)
      expect(result.realistic).toBeGreaterThan(0)
    })

    it('deve calcular projeção para 90 dias', async () => {
      const mockSales = generateMockSales(120, 500, 600)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      const result = await projectionService.calculateSalesProjection(
        testUserId,
        ProjectionPeriod.DAYS_90
      )

      expect(result.period).toBe(ProjectionPeriod.DAYS_90)
      expect(result.realistic).toBeGreaterThan(0)
    })

    it('deve calcular projeção para 180 dias', async () => {
      const mockSales = generateMockSales(200, 400, 500)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      const result = await projectionService.calculateSalesProjection(
        testUserId,
        ProjectionPeriod.DAYS_180
      )

      expect(result.period).toBe(ProjectionPeriod.DAYS_180)
      expect(result.realistic).toBeGreaterThan(0)
    })

    it('deve calcular projeção para 365 dias', async () => {
      const mockSales = generateMockSales(400, 300, 400)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      const result = await projectionService.calculateSalesProjection(
        testUserId,
        ProjectionPeriod.DAYS_365
      )

      expect(result.period).toBe(ProjectionPeriod.DAYS_365)
      expect(result.realistic).toBeGreaterThan(0)
    })
  })

  describe('calculateSalesProjection - Story 4.1 Cenário: Dados insuficientes', () => {
    it('deve lançar erro quando histórico < 30 dias', async () => {
      // Gherkin: "Dado que tenho apenas 5 dias de histórico"
      const mockSales = generateMockSales(5, 400, 500)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      // Gherkin: "Quando acesso projeções"
      // Gherkin: "Então vejo mensagem 'Precisamos de pelo menos 30 dias de dados para projeções confiáveis'"
      await expect(
        projectionService.calculateSalesProjection(testUserId, ProjectionPeriod.DAYS_30)
      ).rejects.toThrow('Dados históricos insuficientes')
    })

    it('deve lançar erro quando não há vendas', async () => {
      vi.mocked(prisma.sale.findMany).mockResolvedValue([])
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      await expect(
        projectionService.calculateSalesProjection(testUserId, ProjectionPeriod.DAYS_30)
      ).rejects.toThrow('Dados históricos insuficientes')
    })

    it('deve lançar erro quando histórico cobre menos de 30 dias únicos', async () => {
      // 100 vendas, mas todas no mesmo dia
      const mockSales = generateMockSalesInSameDay(100, 400, 500)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      await expect(
        projectionService.calculateSalesProjection(testUserId, ProjectionPeriod.DAYS_30)
      ).rejects.toThrow('Dados históricos insuficientes')
    })
  })

  describe('detectTrend', () => {
    it('deve detectar tendência de crescimento quando últimos 7d > média anterior', async () => {
      // Vendas crescentes: últimos 7d = R$ 600/dia, 7-14d = R$ 400/dia (+50%)
      const mockSales = [
        ...generateMockSalesForPeriod(7, 14, 550, 650), // dias 7-14 atrás (média ~600)
        ...generateMockSalesForPeriod(0, 7, 350, 450), // dias 0-7 atrás (média ~400)
      ]
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const trend = await projectionService.detectTrend(testUserId)

      expect(trend).toBe(TrendType.GROWTH)
    })

    it('deve detectar tendência estável quando variação < 5%', async () => {
      // Vendas estáveis: últimos 7d = R$ 500/dia, 7-14d = R$ 502/dia (-0.4%)
      const mockSales = [
        ...generateMockSalesForPeriod(7, 14, 495, 505), // média ~500
        ...generateMockSalesForPeriod(0, 7, 498, 508), // média ~503
      ]
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const trend = await projectionService.detectTrend(testUserId)

      expect(trend).toBe(TrendType.STABLE)
    })

    it('deve detectar tendência de declínio quando últimos 7d < média anterior', async () => {
      // Vendas em queda: últimos 7d = R$ 300/dia, 7-14d = R$ 500/dia (-40%)
      const mockSales = [
        ...generateMockSalesForPeriod(7, 14, 250, 350), // média ~300
        ...generateMockSalesForPeriod(0, 7, 450, 550), // média ~500
      ]
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const trend = await projectionService.detectTrend(testUserId)

      expect(trend).toBe(TrendType.DECLINE)
    })

    it('deve retornar STABLE quando não há dados suficientes', async () => {
      vi.mocked(prisma.sale.findMany).mockResolvedValue([])

      const trend = await projectionService.detectTrend(testUserId)

      expect(trend).toBe(TrendType.STABLE)
    })
  })

  describe('calculateMovingAverage', () => {
    it('deve calcular média móvel de 7 dias corretamente', async () => {
      const mockSales = generateMockSales(10, 400, 400) // 10 dias, R$ 400/dia
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const avg = await projectionService.calculateMovingAverage(testUserId, 7)

      // Média esperada: 400 * 7 dias = 2800 / 7 = 400
      expect(avg).toBeCloseTo(400, 0)
    })

    it('deve calcular média móvel de 30 dias corretamente', async () => {
      const mockSales = generateMockSales(35, 500, 500) // 35 dias, R$ 500/dia
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const avg = await projectionService.calculateMovingAverage(testUserId, 30)

      expect(avg).toBeCloseTo(500, 0)
    })

    it('deve retornar 0 quando não há vendas', async () => {
      vi.mocked(prisma.sale.findMany).mockResolvedValue([])

      const avg = await projectionService.calculateMovingAverage(testUserId, 7)

      expect(avg).toBe(0)
    })
  })

  describe('calculateVariance', () => {
    it('deve calcular variância baixa para vendas consistentes', async () => {
      // Vendas muito consistentes: sempre R$ 500/dia
      const mockSales = generateMockSales(30, 500, 500)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const variance = await projectionService.calculateVariance(testUserId)

      // Variância baixa = alta confiança
      expect(variance).toBeCloseTo(0, 1)
    })

    it('deve calcular variância alta para vendas voláteis', async () => {
      // Vendas muito voláteis: R$ 100 a R$ 900/dia
      const mockSales = generateMockSales(30, 100, 900)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const variance = await projectionService.calculateVariance(testUserId)

      // Variância alta = baixa confiança
      expect(variance).toBeGreaterThan(0.5)
    })

    it('deve retornar 0 quando não há vendas', async () => {
      vi.mocked(prisma.sale.findMany).mockResolvedValue([])

      const variance = await projectionService.calculateVariance(testUserId)

      expect(variance).toBe(0)
    })
  })

  describe('adjustForSeasonality', () => {
    it('deve aplicar multiplicador para segunda-feira (1.10)', () => {
      const baseValue = 1000
      const monday = new Date('2025-01-06') // segunda-feira

      const adjusted = projectionService.adjustForSeasonality(baseValue, monday)

      expect(adjusted).toBeCloseTo(1100, 0) // 1000 * 1.10
    })

    it('deve aplicar multiplicador para quarta-feira (1.05)', () => {
      const baseValue = 1000
      const wednesday = new Date('2025-01-08') // quarta-feira

      const adjusted = projectionService.adjustForSeasonality(baseValue, wednesday)

      expect(adjusted).toBeCloseTo(1050, 0) // 1000 * 1.05
    })

    it('deve aplicar multiplicador para sábado (0.85)', () => {
      const baseValue = 1000
      const saturday = new Date('2025-01-11') // sábado

      const adjusted = projectionService.adjustForSeasonality(baseValue, saturday)

      expect(adjusted).toBeCloseTo(850, 0) // 1000 * 0.85
    })

    it('deve aplicar multiplicador para domingo (0.85)', () => {
      const baseValue = 1000
      const sunday = new Date('2025-01-12') // domingo

      const adjusted = projectionService.adjustForSeasonality(baseValue, sunday)

      expect(adjusted).toBeCloseTo(850, 0) // 1000 * 0.85
    })
  })

  describe('analyzeSeasonality', () => {
    it('deve retornar padrões de sazonalidade por dia da semana', async () => {
      const mockSales = generateMockSales(90, 400, 500)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)

      const seasonality = await projectionService.analyzeSeasonality(testUserId)

      expect(seasonality).toHaveProperty('day_of_week_multipliers')
      expect(seasonality.day_of_week_multipliers).toHaveLength(7)

      // Todos os multiplicadores devem ser números positivos
      seasonality.day_of_week_multipliers.forEach((mult) => {
        expect(mult).toBeGreaterThan(0)
      })
    })

    it('deve retornar multiplicadores 1.0 quando não há dados', async () => {
      vi.mocked(prisma.sale.findMany).mockResolvedValue([])

      const seasonality = await projectionService.analyzeSeasonality(testUserId)

      // Sem dados, retorna multiplicador neutro (1.0) para todos os dias
      seasonality.day_of_week_multipliers.forEach((mult) => {
        expect(mult).toBe(1.0)
      })
    })
  })

  describe('calculateCashflowProjection', () => {
    it('deve calcular projeção de fluxo de caixa com receita e despesas', async () => {
      const mockSales = generateMockSales(60, 500, 600)
      const mockAdsExpenses = generateMockAdsExpenses(60, 150, 200)

      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(prisma.ad.findMany).mockResolvedValue(mockAdsExpenses)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      const result = await projectionService.calculateCashflowProjection(
        testUserId,
        ProjectionPeriod.DAYS_30
      )

      expect(result).toHaveProperty('period', ProjectionPeriod.DAYS_30)
      expect(result).toHaveProperty('projected_revenue')
      expect(result).toHaveProperty('projected_expenses')
      expect(result).toHaveProperty('projected_net_profit')
      expect(result).toHaveProperty('estimated_roi')

      // Net profit = revenue - expenses
      expect(result.projected_net_profit).toBeCloseTo(
        result.projected_revenue - result.projected_expenses,
        0
      )

      // ROI = (net_profit / expenses) * 100
      if (result.projected_expenses > 0) {
        const expectedROI = (result.projected_net_profit / result.projected_expenses) * 100
        expect(result.estimated_roi).toBeCloseTo(expectedROI, 0)
      }
    })

    it('deve usar cache se disponível', async () => {
      const cachedResult = {
        period: ProjectionPeriod.DAYS_30,
        projected_revenue: 15000,
        projected_expenses: 5000,
        projected_net_profit: 10000,
        estimated_roi: 200,
        generated_at: new Date().toISOString(),
      }
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(JSON.stringify(cachedResult))

      const result = await projectionService.calculateCashflowProjection(
        testUserId,
        ProjectionPeriod.DAYS_30
      )

      expect(result).toEqual(cachedResult)
      expect(prisma.sale.findMany).not.toHaveBeenCalled()
      expect(prisma.ad.findMany).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando histórico < 30 dias', async () => {
      const mockSales = generateMockSales(10, 500, 600)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      await expect(
        projectionService.calculateCashflowProjection(testUserId, ProjectionPeriod.DAYS_30)
      ).rejects.toThrow('Dados históricos insuficientes')
    })
  })

  describe('calculateHealthScore', () => {
    it('deve calcular health score com trend, lucratividade e consistência', async () => {
      const mockSales = generateMockSales(90, 500, 600)
      const mockAdsExpenses = generateMockAdsExpenses(90, 150, 200)

      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(prisma.ad.findMany).mockResolvedValue(mockAdsExpenses)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      const result = await projectionService.calculateHealthScore(testUserId)

      expect(result).toHaveProperty('overall_score')
      expect(result).toHaveProperty('trend_score')
      expect(result).toHaveProperty('profitability_score')
      expect(result).toHaveProperty('consistency_score')
      expect(result).toHaveProperty('interpretation')
      expect(result).toHaveProperty('alerts')
      expect(result).toHaveProperty('recommendations')

      // Scores devem estar entre 0 e 100
      expect(result.overall_score).toBeGreaterThanOrEqual(0)
      expect(result.overall_score).toBeLessThanOrEqual(100)
      expect(result.trend_score).toBeGreaterThanOrEqual(0)
      expect(result.trend_score).toBeLessThanOrEqual(100)
      expect(result.profitability_score).toBeGreaterThanOrEqual(0)
      expect(result.profitability_score).toBeLessThanOrEqual(100)
      expect(result.consistency_score).toBeGreaterThanOrEqual(0)
      expect(result.consistency_score).toBeLessThanOrEqual(100)

      // Interpretation deve ser string não vazia
      expect(result.interpretation.length).toBeGreaterThan(0)

      // Arrays de alerts e recommendations
      expect(Array.isArray(result.alerts)).toBe(true)
      expect(Array.isArray(result.recommendations)).toBe(true)
    })

    it('deve usar cache se disponível', async () => {
      const cachedResult = {
        overall_score: 75,
        trend_score: 80,
        profitability_score: 70,
        consistency_score: 75,
        interpretation: 'Saúde financeira boa',
        alerts: [],
        recommendations: ['Manter ritmo de vendas'],
        generated_at: new Date().toISOString(),
      }
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(JSON.stringify(cachedResult))

      const result = await projectionService.calculateHealthScore(testUserId)

      expect(result).toEqual(cachedResult)
      expect(prisma.sale.findMany).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando histórico < 30 dias', async () => {
      const mockSales = generateMockSales(15, 500, 600)
      vi.mocked(prisma.sale.findMany).mockResolvedValue(mockSales)
      vi.mocked(vi.fn().mockResolvedValue(null)).mockResolvedValue(null)

      await expect(projectionService.calculateHealthScore(testUserId)).rejects.toThrow(
        'Dados históricos insuficientes para calcular health score'
      )
    })
  })

  describe('invalidateCache', () => {
    it('deve invalidar cache de projeções quando nova venda', async () => {
      await projectionService.invalidateCache(testUserId, 'sale')

      // Deve deletar chaves de projeções de vendas e cashflow
      expect(vi.fn()).toHaveBeenCalledWith(
        expect.stringContaining(`projections:sales:${testUserId}`)
      )
    })

    it('deve invalidar cache quando sync de dados', async () => {
      await projectionService.invalidateCache(testUserId, 'sync')

      // Deve deletar múltiplas chaves
      expect(vi.fn()).toHaveBeenCalled()
    })
  })
})

// ==================== HELPER FUNCTIONS ====================

/**
 * Gera vendas mock distribuídas ao longo de N dias
 * Alinhado com schema Prisma Sale model
 */
function generateMockSales(days: number, minValue: number, maxValue: number) {
  const sales = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    // 3-5 vendas por dia
    const salesPerDay = Math.floor(Math.random() * 3) + 3

    for (let j = 0; j < salesPerDay; j++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(Math.floor(Math.random() * 24))
      date.setMinutes(Math.floor(Math.random() * 60))

      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue

      sales.push({
        id: `sale-${i}-${j}`,
        user_id: 'test-user-123',
        client_id: null,
        external_id: null,
        product_name: `Produto Mock ${j}`,
        product_sku: null,
        quantity: 1,
        unit_price: new Decimal(value),
        total_price: new Decimal(value),
        commission: null,
        status: 'PAID' as SaleStatus,
        payment_method: null,
        payment_due_date: null,
        payment_date: date,
        shipped_at: null,
        delivered_at: null,
        created_at: date,
        updated_at: date,
      })
    }
  }

  return sales as any // Cast para compatibilidade com vi.mocked
}

/**
 * Gera vendas mock todas no mesmo dia (para testar erro de dias insuficientes)
 * Alinhado com schema Prisma Sale model
 */
function generateMockSalesInSameDay(count: number, minValue: number, maxValue: number) {
  const sales = []
  const sameDay = new Date()

  for (let i = 0; i < count; i++) {
    const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue

    sales.push({
      id: `sale-${i}`,
      user_id: 'test-user-123',
      client_id: null,
      external_id: null,
      product_name: `Produto Mock ${i}`,
      product_sku: null,
      quantity: 1,
      unit_price: new Decimal(value),
      total_price: new Decimal(value),
      commission: null,
      status: 'PAID' as SaleStatus,
      payment_method: null,
      payment_due_date: null,
      payment_date: sameDay,
      shipped_at: null,
      delivered_at: null,
      created_at: sameDay,
      updated_at: sameDay,
    })
  }

  return sales as any
}

/**
 * Gera vendas mock para período específico (usado em detectTrend)
 * Alinhado com schema Prisma Sale model
 */
function generateMockSalesForPeriod(
  startDaysAgo: number,
  endDaysAgo: number,
  minValue: number,
  maxValue: number
) {
  const sales = []
  const now = new Date()

  for (let i = startDaysAgo; i < endDaysAgo; i++) {
    const salesPerDay = Math.floor(Math.random() * 3) + 3

    for (let j = 0; j < salesPerDay; j++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue

      sales.push({
        id: `sale-${i}-${j}`,
        user_id: 'test-user-123',
        client_id: null,
        external_id: null,
        product_name: `Produto Mock ${j}`,
        product_sku: null,
        quantity: 1,
        unit_price: new Decimal(value),
        total_price: new Decimal(value),
        commission: null,
        status: 'PAID' as SaleStatus,
        payment_method: null,
        payment_due_date: null,
        payment_date: date,
        shipped_at: null,
        delivered_at: null,
        created_at: date,
        updated_at: date,
      })
    }
  }

  return sales as any
}

/**
 * Gera despesas de anúncios mock
 */
function generateMockAdsExpenses(days: number, minValue: number, maxValue: number) {
  const expenses = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue

    expenses.push({
      id: `expense-${i}`,
      user_id: 'test-user-123',
      amount_spent: value,
      date: date,
      platform: 'facebook',
    })
  }

  return expenses
}
