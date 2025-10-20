/**
 * ProjectionService Implementation
 *
 * Sistema de projeções financeiras com 3 cenários (    // Aplicar tendência ao cenário realista
    const trendMultiplier = trend === TrendType.GROWTH ? 1.1 : trend === TrendType.DECLINE ? 0.9 : 1.0;ssimista/realista/otimista)
 * Baseado em médias móveis, detecção de tendências e ajuste de sazonalidade
 *
 * Referências:
 * - plan.md: Persona Maria - "Ter projeções financeiras confiáveis para tomar decisões"
 * - design.md: §Financial Projections - Algoritmo de médias móveis, cache strategy
 * - dev-stories.md: Dev Story 4.1 - Sistema de Projeções Financeiras
 * - user-stories.md: Story 4.1 - Ver Projeções de Fluxo de Caixa
 * - user-journeys.md: Jornada 5 Fase 4 - Projeções
 * - tasks.md: Task 9.1 - ProjectionService com algoritmos
 */

import type {
  CashflowProjection,
  HealthScore,
  IProjectionService,
  ProjectionPeriod,
  ProjectionResult,
  SaleData,
  SeasonalityData,
} from '../interfaces/ProjectionService.interface'
import { TrendType } from '../interfaces/ProjectionService.interface'
import { prisma } from '../shared/config/database'
import { redisService } from '../shared/services/RedisService'
import { logger } from '../shared/utils/logger'

export class ProjectionService implements IProjectionService {
  private readonly CACHE_PREFIX = 'projections'
  private readonly CACHE_TTL = 21600 // 6 horas em segundos
  private readonly MIN_HISTORICAL_DAYS = 30

  /**
   * Calcula projeções de vendas para período especificado
   *
   * Critérios de Aceitação (user-stories.md Story 4.1):
   * - Mínimo 30 dias de histórico necessário
   * - Considera sazonalidade (dia da semana)
   * - 3 cenários: pessimista (-20% do mínimo), realista (média ponderada), otimista (+30% do máximo)
   * - Confiança 0-100% baseada em variância
   * - Cache de 6 horas
   */
  async calculateSalesProjection(
    userId: string,
    period: ProjectionPeriod
  ): Promise<ProjectionResult> {
    try {
      // Verificar cache primeiro
      const cacheKey = `${this.CACHE_PREFIX}:sales:${userId}:${period}`
      const cached = await redisService.get<ProjectionResult>(cacheKey)
      if (cached) {
        logger.info(`Projeção de vendas obtida do cache para userId=${userId}, period=${period}`)
        return cached
      }

      // Buscar histórico de vendas (90 dias para melhor análise)
      const historicalDays = Math.max(90, period)
      const sales = await this.getHistoricalSales(userId, historicalDays)

      // Validar dados suficientes
      const daysCovered = this.getDaysCovered(sales)
      if (sales.length === 0 || daysCovered < this.MIN_HISTORICAL_DAYS) {
        throw new Error(
          `Dados históricos insuficientes. Necessário ${this.MIN_HISTORICAL_DAYS} dias, encontrado ${daysCovered} dias. ` +
            `Coletando dados: ${daysCovered}/${this.MIN_HISTORICAL_DAYS} dias.`
        )
      }

      // Calcular médias móveis
      const avg7Days = this.calculateMovingAverage(sales, 7)
      const avg30Days = this.calculateMovingAverage(sales, 30)
      const avg90Days = this.calculateMovingAverage(sales, 90)

      // Detectar tendência
      const trend = this.detectTrend(sales)

      // Calcular variância para confiança
      const variance = this.calculateVariance(sales)
      const confidence = Math.max(0, Math.min(100, 100 - variance * 50))

      // Analisar sazonalidade (para referência futura)
      // const seasonality = this.analyzeSeasonality(sales);

      // Calcular projeções base (sem ajuste de sazonalidade)
      const dailyPessimistic = Math.min(avg7Days, avg30Days, avg90Days) * 0.8 // -20% do mínimo
      const dailyRealistic = avg7Days * 0.3 + avg30Days * 0.5 + avg90Days * 0.2 // Média ponderada
      const dailyOptimistic = Math.max(avg7Days, avg30Days, avg90Days) * 1.3 // +30% do máximo

      // Aplicar tendência ao cenário realista
      const trendMultiplier = trend === 'growth' ? 1.1 : trend === 'decline' ? 0.9 : 1.0
      const dailyRealisticWithTrend = dailyRealistic * trendMultiplier

      // Projetar para o período com ajuste de sazonalidade
      const projectionResults = {
        pessimistic: 0,
        realistic: 0,
        optimistic: 0,
      }

      const today = new Date()
      for (let day = 0; day < period; day++) {
        const futureDate = new Date(today)
        futureDate.setDate(futureDate.getDate() + day)

        const pessimisticDay = this.adjustForSeasonality(dailyPessimistic, futureDate)
        const realisticDay = this.adjustForSeasonality(dailyRealisticWithTrend, futureDate)
        const optimisticDay = this.adjustForSeasonality(dailyOptimistic, futureDate)

        projectionResults.pessimistic += pessimisticDay
        projectionResults.realistic += realisticDay
        projectionResults.optimistic += optimisticDay
      }

      const result: ProjectionResult = {
        period,
        pessimistic: Math.round(projectionResults.pessimistic * 100) / 100,
        realistic: Math.round(projectionResults.realistic * 100) / 100,
        optimistic: Math.round(projectionResults.optimistic * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        trend,
        historical_data_days: daysCovered,
        avg_7_days: Math.round(avg7Days * 100) / 100,
        avg_30_days: Math.round(avg30Days * 100) / 100,
        avg_90_days: Math.round(avg90Days * 100) / 100,
        seasonality_adjusted: true,
        cache_expires_at: new Date(Date.now() + this.CACHE_TTL * 1000),
      }

      // Salvar no cache
      await redisService.set(cacheKey, result, this.CACHE_TTL)

      logger.info(`Projeção de vendas calculada para userId=${userId}, period=${period}`, {
        trend,
        confidence,
        historical_days: daysCovered,
      })

      return result
    } catch (error) {
      logger.error('Erro ao calcular projeção de vendas', {
        userId,
        period,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Calcula projeção de fluxo de caixa (vendas - despesas)
   */
  async calculateCashflowProjection(
    userId: string,
    period: ProjectionPeriod
  ): Promise<CashflowProjection> {
    try {
      // Verificar cache
      const cacheKey = `${this.CACHE_PREFIX}:cashflow:${userId}:${period}`
      const cached = await redisService.get<CashflowProjection>(cacheKey)
      if (cached) {
        logger.info(`Projeção de cashflow obtida do cache para userId=${userId}`)
        return cached
      }

      // Calcular projeção de vendas
      const salesProjection = await this.calculateSalesProjection(userId, period)

      // Buscar histórico de gastos com anúncios (últimos 30 dias)
      const adsExpenses = await this.getHistoricalAdsExpenses(userId, 30)
      const avgDailyAds = adsExpenses.reduce((sum, exp) => sum + exp, 0) / adsExpenses.length || 0

      // Estimar despesas operacionais (10% da receita como estimativa conservadora)
      const operationalRate = 0.1

      // Projetar despesas
      const projectedAds = avgDailyAds * period
      const projectedOperational = salesProjection.realistic * operationalRate
      const totalExpenses = projectedAds + projectedOperational

      // Calcular lucro líquido para cada cenário
      const netProfit = {
        pessimistic: salesProjection.pessimistic - totalExpenses,
        realistic: salesProjection.realistic - totalExpenses,
        optimistic: salesProjection.optimistic - totalExpenses,
      }

      // Calcular ROI para cada cenário
      const roi = {
        pessimistic: totalExpenses > 0 ? (netProfit.pessimistic / totalExpenses) * 100 : 0,
        realistic: totalExpenses > 0 ? (netProfit.realistic / totalExpenses) * 100 : 0,
        optimistic: totalExpenses > 0 ? (netProfit.optimistic / totalExpenses) * 100 : 0,
      }

      const result: CashflowProjection = {
        period,
        projected_sales: salesProjection,
        projected_expenses: {
          ads: Math.round(projectedAds * 100) / 100,
          operational: Math.round(projectedOperational * 100) / 100,
          total: Math.round(totalExpenses * 100) / 100,
        },
        net_profit: {
          pessimistic: Math.round(netProfit.pessimistic * 100) / 100,
          realistic: Math.round(netProfit.realistic * 100) / 100,
          optimistic: Math.round(netProfit.optimistic * 100) / 100,
        },
        roi: {
          pessimistic: Math.round(roi.pessimistic * 100) / 100,
          realistic: Math.round(roi.realistic * 100) / 100,
          optimistic: Math.round(roi.optimistic * 100) / 100,
        },
      }

      // Salvar no cache
      await redisService.set(cacheKey, result, this.CACHE_TTL)

      logger.info(`Projeção de cashflow calculada para userId=${userId}`, {
        period,
        net_profit: result.net_profit.realistic,
        roi: result.roi.realistic,
      })

      return result
    } catch (error) {
      logger.error('Erro ao calcular projeção de cashflow', {
        userId,
        period,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Calcula score de saúde financeira (0-100%)
   *
   * Score baseado em:
   * - Tendência (30%): Crescimento vs Queda
   * - Lucratividade (40%): Margem de lucro
   * - Consistência (30%): Baixa variância
   */
  async calculateHealthScore(userId: string): Promise<HealthScore> {
    try {
      // Verificar cache
      const cacheKey = `${this.CACHE_PREFIX}:health:${userId}`
      const cached = await redisService.get<HealthScore>(cacheKey)
      if (cached) {
        return cached
      }

      // Buscar dados históricos (90 dias)
      const sales = await this.getHistoricalSales(userId, 90)

      if (sales.length === 0) {
        throw new Error('Dados insuficientes para calcular score de saúde')
      }

      // 1. Score de Tendência (30%)
      const trend = this.detectTrend(sales)
      const trendScore = trend === TrendType.GROWTH ? 100 : trend === TrendType.STABLE ? 70 : 40

      // 2. Score de Lucratividade (40%)
      const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.valor), 0)
      const adsExpenses = await this.getHistoricalAdsExpenses(userId, 90)
      const totalAdsExpenses = adsExpenses.reduce((sum, exp) => sum + exp, 0)
      const profitMargin =
        totalRevenue > 0 ? ((totalRevenue - totalAdsExpenses) / totalRevenue) * 100 : 0

      // Profit margin > 60% = 100, 40-60% = 80, 20-40% = 60, < 20% = 30
      let profitabilityScore = 30
      if (profitMargin > 60) {
        profitabilityScore = 100
      } else if (profitMargin > 40) {
        profitabilityScore = 80
      } else if (profitMargin > 20) {
        profitabilityScore = 60
      }

      // 3. Score de Consistência (30%)
      const variance = this.calculateVariance(sales)
      // Variância baixa = score alto (0.1 = 100, 0.5 = 50, 1.0 = 0)
      const consistencyScore = Math.max(0, Math.min(100, 100 - variance * 100))

      // Calcular score geral
      const overallScore = Math.round(
        trendScore * 0.3 + profitabilityScore * 0.4 + consistencyScore * 0.3
      )

      // Gerar interpretação
      let interpretation = ''
      if (overallScore >= 80) {
        interpretation = 'Excelente! Seu negócio está muito saudável.'
      } else if (overallScore >= 60) {
        interpretation = 'Bom! Seu negócio está estável com espaço para crescimento.'
      } else if (overallScore >= 40) {
        interpretation = 'Regular. Atenção necessária em algumas áreas.'
      } else {
        interpretation = 'Crítico. Ação imediata necessária.'
      }

      // Gerar alertas
      const alerts: string[] = []
      if (trend === TrendType.DECLINE) {
        alerts.push('Tendência de queda nas vendas detectada')
      }
      if (profitMargin < 20) {
        alerts.push('Margem de lucro abaixo de 20%')
      }
      if (variance > 0.7) {
        alerts.push('Alta variação nas vendas (inconsistência)')
      }
      if (totalRevenue === 0) {
        alerts.push('Nenhuma receita nos últimos 90 dias')
      }

      // Gerar recomendações
      const recommendations: string[] = []
      if (trend === TrendType.DECLINE) {
        recommendations.push('Revisar estratégia de marketing e anúncios')
      }
      if (profitMargin < 40) {
        recommendations.push('Reduzir gastos com anúncios ou aumentar ticket médio')
      }
      if (variance > 0.5) {
        recommendations.push('Trabalhar na consistência de vendas diárias')
      }
      if (profitMargin > 60 && trend === TrendType.STABLE) {
        recommendations.push('Considerar aumentar investimento em ads para crescer')
      }

      const result: HealthScore = {
        overall_score: overallScore,
        trend_score: Math.round(trendScore),
        profitability_score: Math.round(profitabilityScore),
        consistency_score: Math.round(consistencyScore),
        interpretation,
        alerts,
        recommendations,
      }

      // Salvar no cache (1 hora para health score)
      await redisService.set(cacheKey, result, 3600)

      logger.info(`Health score calculado para userId=${userId}`, {
        overall_score: overallScore,
        trend,
        profit_margin: profitMargin.toFixed(2),
      })

      return result
    } catch (error) {
      logger.error('Erro ao calcular health score', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Detecta tendência nos dados de vendas
   *
   * Compara média dos últimos 7 dias com média dos 7-14 dias anteriores
   * Crescimento: >5% | Estável: -5% a +5% | Queda: <-5%
   */
  detectTrend(sales: SaleData[]): TrendType {
    if (sales.length < 14) {
      return TrendType.STABLE
    }

    const sortedSales = [...sales].sort(
      (a, b) => new Date(b.data_venda).getTime() - new Date(a.data_venda).getTime()
    )

    const recent7 = sortedSales.slice(0, 7)
    const previous7 = sortedSales.slice(7, 14)

    const recentAvg =
      recent7.reduce((sum, sale) => sum + Number(sale.total_price || sale.valor || 0), 0) / 7
    const previousAvg =
      previous7.reduce((sum, sale) => sum + Number(sale.total_price || sale.valor || 0), 0) / 7

    if (previousAvg === 0 && recentAvg === 0) {
      return TrendType.STABLE
    }

    if (previousAvg === 0) {
      return recentAvg > 0 ? TrendType.GROWTH : TrendType.STABLE
    }

    const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100

    if (changePercent > 5) {
      return TrendType.GROWTH
    }
    if (changePercent < -5) {
      return TrendType.DECLINE
    }
    return TrendType.STABLE
  }

  /**
   * Calcula média móvel para período específico
   */
  calculateMovingAverage(sales: SaleData[], days: number): number {
    if (sales.length === 0) {
      return 0
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentSales = sales.filter((sale) => new Date(sale.data_venda) >= cutoffDate)

    if (recentSales.length === 0) {
      return 0
    }

    const totalValue = recentSales.reduce((sum, sale) => sum + Number(sale.valor), 0)
    const daysCovered = this.getDaysCovered(recentSales)

    return daysCovered > 0 ? totalValue / daysCovered : 0
  }

  /**
   * Calcula variância para determinar confiança
   *
   * Retorna variância normalizada (0-1)
   * 0 = sem variação (perfeito), 1 = alta variação
   */
  calculateVariance(sales: SaleData[]): number {
    if (sales.length < 2) {
      return 1
    }

    // Agrupar vendas por dia
    const dailySales = this.groupSalesByDay(sales)
    const dailyValues = Object.values(dailySales)

    if (dailyValues.length < 2) {
      return 1
    }

    // Calcular média
    const mean = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length

    if (mean === 0) {
      return 1
    }

    // Calcular variância
    const squaredDiffs = dailyValues.map((val) => (val - mean) ** 2)
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / dailyValues.length

    // Calcular desvio padrão
    const stdDev = Math.sqrt(variance)

    // Coeficiente de variação (CV)
    const cv = stdDev / mean

    // Normalizar CV para 0-1 (CV > 1 = alta variação)
    return Math.min(1, cv)
  }

  /**
   * Ajusta valor considerando sazonalidade do dia da semana
   *
   * Baseado em análise histórica:
   * - Segunda-Sexta tendem a ter mais vendas
   * - Sábado-Domingo tendem a ter menos vendas
   */
  adjustForSeasonality(value: number, date: Date): number {
    const dayOfWeek = date.getDay() // 0 = Domingo, 6 = Sábado

    // Multiplicadores por dia da semana (baseado em padrão típico e-commerce)
    const multipliers: Record<number, number> = {
      0: 0.85, // Domingo - 15% menos
      1: 1.1, // Segunda - 10% mais (início semana forte)
      2: 1.1, // Terça - 10% mais
      3: 1.05, // Quarta - 5% mais
      4: 1.1, // Quinta - 10% mais
      5: 1.05, // Sexta - 5% mais
      6: 0.85, // Sábado - 15% menos
    }

    return value * (multipliers[dayOfWeek] || 1.0)
  }

  /**
   * Analisa sazonalidade dos dados históricos
   */
  analyzeSeasonality(sales: SaleData[]): SeasonalityData[] {
    const groupedByDay: Record<number, number[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    }

    sales.forEach((sale) => {
      const dayOfWeek = new Date(sale.data_venda).getDay()
      const dayValues = groupedByDay[dayOfWeek]
      if (dayValues) {
        dayValues.push(Number(sale.valor))
      }
    })

    const overallAvg =
      sales.reduce((sum, sale) => sum + Number(sale.valor), 0) / (sales.length || 1)

    return Object.entries(groupedByDay).map(([day, values]) => {
      const dayAvg =
        values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
      const multiplier = overallAvg > 0 ? dayAvg / overallAvg : 1.0

      return {
        day_of_week: Number(day),
        multiplier: Math.round(multiplier * 100) / 100,
        avg_sales: Math.round(dayAvg * 100) / 100,
        sample_size: values.length,
      }
    })
  }

  /**
   * Invalida cache de projeções do usuário
   */
  async invalidateCache(userId: string): Promise<void> {
    try {
      const patterns = [
        `${this.CACHE_PREFIX}:sales:${userId}:*`,
        `${this.CACHE_PREFIX}:cashflow:${userId}:*`,
        `${this.CACHE_PREFIX}:health:${userId}`,
      ]

      for (const pattern of patterns) {
        await redisService.deletePattern(pattern)
      }

      logger.info(`Cache de projeções invalidado para userId=${userId}`)
    } catch (error) {
      logger.error('Erro ao invalidar cache', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // ==================== MÉTODOS AUXILIARES PRIVADOS ====================

  /**
   * Busca histórico de vendas do usuário
   */
  private async getHistoricalSales(userId: string, days: number): Promise<SaleData[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const sales = await prisma.sale.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: cutoffDate,
        },
        status: {
          in: ['PAID', 'DELIVERED'], // Apenas vendas confirmadas
        },
      },
      select: {
        id: true,
        total_price: true,
        created_at: true,
        status: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    })

    // Mapear para SaleData com nomes esperados
    return sales.map((sale) => ({
      id: sale.id,
      valor: sale.total_price,
      data_venda: sale.created_at,
      status: sale.status,
    }))
  }

  /**
   * Busca histórico de gastos com anúncios
   */
  private async getHistoricalAdsExpenses(userId: string, days: number): Promise<number[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const ads = await prisma.ad.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: cutoffDate,
        },
      },
      select: {
        spend: true,
      },
    })

    // Calcular gasto diário médio
    const totalSpent = ads.reduce((sum, ad) => sum + Number(ad.spend), 0)
    const dailyAvg = totalSpent / days

    // Retornar array com valor diário para simplificar cálculos
    return Array(days).fill(dailyAvg)
  }

  /**
   * Calcula quantos dias únicos têm vendas
   */
  private getDaysCovered(sales: SaleData[]): number {
    if (sales.length === 0) {
      return 0
    }

    const uniqueDates = new Set(sales.map((sale) => new Date(sale.data_venda).toDateString()))

    return uniqueDates.size
  }

  /**
   * Agrupa vendas por dia
   */
  private groupSalesByDay(sales: SaleData[]): Record<string, number> {
    const grouped: Record<string, number> = {}

    sales.forEach((sale) => {
      const dateKey = new Date(sale.data_venda).toDateString()
      grouped[dateKey] = (grouped[dateKey] || 0) + Number(sale.valor)
    })

    return grouped
  }
}

// Export singleton instance
export const projectionService = new ProjectionService()
