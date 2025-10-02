/**
 * ProjectionService Interface
 *
 * Sistema de projeções financeiras com 3 cenários (pessimista/realista/otimista)
 * Baseado em médias móveis, tendências e ajuste de sazonalidade
 *
 * Referências:
 * - plan.md: Persona Maria - "Ter projeções financeiras confiáveis para tomar decisões"
 * - design.md: §Financial Projections - Cache Strategy, Algoritmo de médias móveis
 * - dev-stories.md: Dev Story 4.1 - Sistema de Projeções Financeiras
 * - user-stories.md: Story 4.1 - Ver Projeções de Fluxo de Caixa
 * - user-journeys.md: Jornada 5 Fase 4 - Projeções
 * - tasks.md: Task 9.1 - ProjectionService
 */

import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Tipos de período para projeções
 */
export enum ProjectionPeriod {
  DAYS_7 = 7,
  DAYS_30 = 30,
  DAYS_90 = 90,
  DAYS_180 = 180,
  DAYS_365 = 365,
}

/**
 * Tendência detectada nos dados históricos
 */
export enum TrendType {
  GROWTH = 'growth',       // Crescimento > 5%
  STABLE = 'stable',       // Variação entre -5% e +5%
  DECLINE = 'decline',     // Queda > 5%
}

/**
 * Dados de uma venda para cálculo de projeções
 */
export interface SaleData {
  id: string;
  valor: Decimal;
  data_venda: Date;
  status: string;
}

/**
 * Resultado de uma projeção com 3 cenários
 */
export interface ProjectionResult {
  period: number;                    // Período em dias
  pessimistic: number;               // Cenário pessimista (-20% do mínimo)
  realistic: number;                 // Cenário realista (média ponderada)
  optimistic: number;                // Cenário otimista (+30% do máximo)
  confidence: number;                // Confiança 0-100% (baseada em variância)
  trend: TrendType;                  // Tendência detectada
  historical_data_days: number;      // Dias de histórico utilizados
  avg_7_days: number;                // Média móvel 7 dias
  avg_30_days: number;               // Média móvel 30 dias
  avg_90_days: number;               // Média móvel 90 dias
  seasonality_adjusted: boolean;     // Se considerou sazonalidade
  cache_expires_at?: Date;           // Quando cache expira
}

/**
 * Projeção detalhada de fluxo de caixa
 */
export interface CashflowProjection {
  period: number;                    // Período em dias
  projected_sales: ProjectionResult;  // Projeção de vendas
  projected_expenses: {              // Projeção de despesas
    ads: number;                     // Gasto com anúncios projetado
    operational: number;             // Custos operacionais
    total: number;                   // Total de despesas
  };
  net_profit: {                      // Lucro líquido projetado
    pessimistic: number;
    realistic: number;
    optimistic: number;
  };
  roi: {                             // ROI projetado
    pessimistic: number;             // ROI cenário pessimista
    realistic: number;               // ROI cenário realista
    optimistic: number;              // ROI cenário otimista
  };
}

/**
 * Score de saúde financeira (0-100%)
 */
export interface HealthScore {
  overall_score: number;             // Score geral 0-100%
  trend_score: number;               // Score de tendência (30%)
  profitability_score: number;       // Score de lucratividade (40%)
  consistency_score: number;         // Score de consistência (30%)
  interpretation: string;            // Interpretação textual
  alerts: string[];                  // Alertas importantes
  recommendations: string[];         // Recomendações para melhorar
}

/**
 * Dados de sazonalidade por dia da semana
 */
export interface SeasonalityData {
  day_of_week: number;               // 0 = Domingo, 6 = Sábado
  multiplier: number;                // Multiplicador de ajuste (0.7 - 1.3)
  avg_sales: number;                 // Média de vendas neste dia
  sample_size: number;               // Quantidade de amostras
}

/**
 * Interface do ProjectionService
 */
export interface IProjectionService {
  /**
   * Calcula projeções de vendas para período especificado
   *
   * Critérios de Aceitação (user-stories.md Story 4.1):
   * - Mínimo 30 dias de histórico necessário
   * - Considera sazonalidade (dia da semana)
   * - 3 cenários: pessimista, realista, otimista
   * - Confiança 0-100% baseada em variância
   * - Cache de 6 horas
   *
   * @param userId - ID do usuário
   * @param period - Período em dias (7, 30, 90, 180, 365)
   * @returns Projeção com 3 cenários e confiança
   * @throws Error se dados históricos insuficientes (< 30 dias)
   */
  calculateSalesProjection(
    userId: string,
    period: ProjectionPeriod
  ): Promise<ProjectionResult>;

  /**
   * Calcula projeção de fluxo de caixa (vendas - despesas)
   *
   * @param userId - ID do usuário
   * @param period - Período em dias
   * @returns Projeção de cashflow com lucro líquido
   */
  calculateCashflowProjection(
    userId: string,
    period: ProjectionPeriod
  ): Promise<CashflowProjection>;

  /**
   * Calcula score de saúde financeira (0-100%)
   *
   * Score baseado em:
   * - Tendência (30%): Crescimento vs Queda
   * - Lucratividade (40%): Margem de lucro
   * - Consistência (30%): Baixa variância
   *
   * @param userId - ID do usuário
   * @returns Score com interpretação e recomendações
   */
  calculateHealthScore(userId: string): Promise<HealthScore>;

  /**
   * Detecta tendência nos dados de vendas
   *
   * @param sales - Array de vendas ordenadas por data
   * @returns Tipo de tendência detectada
   */
  detectTrend(sales: SaleData[]): TrendType;

  /**
   * Calcula média móvel para período específico
   *
   * @param sales - Array de vendas
   * @param days - Número de dias para média
   * @returns Valor médio diário
   */
  calculateMovingAverage(sales: SaleData[], days: number): number;

  /**
   * Calcula variância para determinar confiança
   *
   * @param sales - Array de vendas
   * @returns Variância dos dados (0-1)
   */
  calculateVariance(sales: SaleData[]): number;

  /**
   * Ajusta valor considerando sazonalidade do dia da semana
   *
   * Baseado em histórico:
   * - Segunda-Sexta: 1.1x (10% acima da média)
   * - Sábado-Domingo: 0.8x (20% abaixo da média)
   *
   * @param value - Valor a ser ajustado
   * @param date - Data para verificar dia da semana
   * @returns Valor ajustado
   */
  adjustForSeasonality(value: number, date: Date): number;

  /**
   * Analisa sazonalidade dos dados históricos
   *
   * @param sales - Array de vendas
   * @returns Dados de sazonalidade por dia da semana
   */
  analyzeSeasonality(sales: SaleData[]): SeasonalityData[];

  /**
   * Invalida cache de projeções do usuário
   *
   * Deve ser chamado quando:
   * - Nova venda registrada
   * - Sync Coinzz completo
   * - Sync Facebook Ads completo
   *
   * @param userId - ID do usuário
   */
  invalidateCache(userId: string): Promise<void>;
}
