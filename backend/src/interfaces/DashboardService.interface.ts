// Referência: tasks.md Task 3.3, user-stories.md Story 2.1, design.md §Dashboard Architecture
// Interface do service de dashboard seguindo Clean Architecture

export interface DashboardMetrics {
  vendas_hoje: number;
  gasto_anuncios: number;
  lucro_liquido: number;
  pagamentos_agendados: number;
}

export interface MetricComparison {
  vendas_hoje: number; // Percentage change vs. previous day
  gasto_anuncios: number; // Percentage change vs. previous day
  lucro_liquido: number; // Percentage change vs. previous day
  pagamentos_agendados: number; // Percentage change vs. previous day
}

export interface DashboardMetricsWithComparisons extends DashboardMetrics {
  comparisons: MetricComparison;
  ultima_atualizacao: Date;
}

export interface DashboardChartData {
  date: string | Date;
  vendas: number;
  gastos: number;
  lucro: number;
}

export interface DashboardActivity {
  id: string;
  type: 'sale' | 'payment' | 'client' | 'ad';
  title: string;
  description: string;
  amount?: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Repository interfaces
export interface SalesAggregation {
  total_price: number | string;
  status?: string;
}

export interface AdSpendAggregation {
  spend: number | string;
  date: Date;
}

export interface ChartDataRow {
  date: string | Date;
  vendas: number | string;
  gastos: number | string;
}

export interface ScheduledPayment {
  total_price: number | string;
  payment_due_date?: Date | null;
  status: string;
}