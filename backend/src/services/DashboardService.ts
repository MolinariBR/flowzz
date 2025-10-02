// Referência: tasks.md Task 3.3.1, user-stories.md Story 2.1, design.md §Dashboard Architecture
// Service de dashboard com cálculos de métricas financeiras e agregações

/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  DashboardMetrics,
  DashboardMetricsWithComparisons,
  DashboardChartData,
  DashboardActivity,
  MetricComparison,
} from '../interfaces/DashboardService.interface';
import { DashboardRepository } from '../repositories/DashboardRepository';
import { redisService } from '../shared/services/RedisService';

export class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  /**
   * Obtém métricas do dashboard para o dia atual com comparações
   * Referência: Story 2.1 - Dashboard com dados do dia
   */
  async getMetrics(userId: string): Promise<DashboardMetricsWithComparisons> {
    // Verificar cache primeiro
    const cachedMetrics = await redisService.getDashboardMetrics<DashboardMetricsWithComparisons>(userId);
    if (cachedMetrics) {
      return cachedMetrics;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Buscar métricas de hoje e ontem em paralelo
    const [todayMetrics, yesterdayMetrics] = await Promise.all([
      this.calculateMetrics(userId, today),
      this.calculateMetrics(userId, yesterday),
    ]);

    // Calcular comparações percentuais
    const comparisons: MetricComparison = {
      vendas_hoje: this.calculatePercentageChange(
        todayMetrics.vendas_hoje,
        yesterdayMetrics.vendas_hoje,
      ),
      gasto_anuncios: this.calculatePercentageChange(
        todayMetrics.gasto_anuncios,
        yesterdayMetrics.gasto_anuncios,
      ),
      lucro_liquido: this.calculatePercentageChange(
        todayMetrics.lucro_liquido,
        yesterdayMetrics.lucro_liquido,
      ),
      pagamentos_agendados: this.calculatePercentageChange(
        todayMetrics.pagamentos_agendados,
        yesterdayMetrics.pagamentos_agendados,
      ),
    };

    const result: DashboardMetricsWithComparisons = {
      ...todayMetrics,
      comparisons,
      ultima_atualizacao: new Date(),
    };

    // Armazenar no cache (TTL 5 minutos)
    await redisService.setDashboardMetrics(userId, result);

    return result;
  }

  /**
   * Calcula métricas para uma data específica
   */
  private async calculateMetrics(userId: string, date: Date): Promise<DashboardMetrics> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar dados agregados do repositório
    const [
      vendas,
      gastos,
      pagamentosAgendados,
    ] = await Promise.all([
      this.dashboardRepository.getSalesForPeriod(userId, startOfDay, endOfDay),
      this.dashboardRepository.getAdSpendForPeriod(userId, startOfDay, endOfDay),
      this.dashboardRepository.getScheduledPayments(userId, startOfDay, endOfDay),
    ]);

    // Calcular vendas do dia
    const vendas_hoje = vendas.reduce((total: number, venda: any) => {
      return total + Number(venda.total_price);
    }, 0);

    // Calcular gastos com anúncios
    const gasto_anuncios = gastos.reduce((total: number, gasto: any) => {
      return total + Number(gasto.spend);
    }, 0);

    // Calcular pagamentos agendados (status PENDING ou SHIPPED)
    const pagamentos_agendados = pagamentosAgendados.reduce((total: number, pagamento: any) => {
      return total + Number(pagamento.total_price);
    }, 0);

    // Calcular lucro líquido = Vendas - Gastos com Anúncios
    // Nota: Outras despesas podem ser adicionadas no futuro
    const lucro_liquido = vendas_hoje - gasto_anuncios;

    return {
      vendas_hoje,
      gasto_anuncios,
      lucro_liquido,
      pagamentos_agendados,
    };
  }

  /**
   * Calcula variação percentual entre dois valores
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0; // 100% se houve crescimento, 0% se manteve zerado
    }

    return Number(((current - previous) / previous * 100).toFixed(1));
  }

  /**
   * Obtém dados para gráfico de vendas vs gastos (últimos 30 dias)
   * Referência: Story 2.2 - Gráfico vendas vs gastos
   */
  async getChartData(userId: string, days: number = 30): Promise<DashboardChartData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.dashboardRepository.getChartData(userId, startDate, endDate);

    return data.map((item: any) => ({
      date: item.date,
      vendas: Number(item.vendas),
      gastos: Number(item.gastos),
      lucro: Number(item.vendas) - Number(item.gastos),
    }));
  }

  /**
   * Obtém atividades recentes do dashboard
   * Referência: Dashboard activities endpoint
   */
  async getRecentActivities(userId: string, limit: number = 10): Promise<DashboardActivity[]> {
    return await this.dashboardRepository.getRecentActivities(userId, limit);
  }

  /**
   * Obtém métricas agregadas para um período específico
   */
  async getMetricsForPeriod(
    userId: string,
    startDate: Date,
    _endDate: Date,
  ): Promise<DashboardMetrics> {
    return await this.calculateMetrics(userId, startDate);
  }

  /**
   * Invalida cache de métricas do dashboard para um usuário
   * Usado quando há atualizações que afetam os dados (vendas, pagamentos, etc.)
   */
  async invalidateCache(userId: string): Promise<void> {
    await redisService.invalidateDashboardMetrics(userId);
  }

  /**
   * Invalida cache de métricas de todos os usuários
   * Usado em manutenções ou mudanças globais
   */
  async invalidateAllCache(): Promise<void> {
    await redisService.invalidateAllDashboardMetrics();
  }

  /**
   * Obtém estatísticas do cache do dashboard
   * Método administrativo para monitoramento
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    avgTTL: number;
  }> {
    return await redisService.getDashboardCacheStats();
  }
}