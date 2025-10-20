// Referência: tasks.md Task 3.3, user-stories.md Story 2.1, design.md §Repository Pattern
// Implementação do repositório de dashboard seguindo padrões Prisma

/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  AdSpendAggregation,
  ChartDataRow,
  DashboardActivity,
  SalesAggregation,
  ScheduledPayment,
} from '../interfaces/DashboardService.interface'
import { prisma } from '../shared/config/database'

export class DashboardRepository {
  /**
   * Busca vendas para um período específico
   * Referência: Story 2.1 - Vendas hoje
   */
  async getSalesForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SalesAggregation[]> {
    const sales = await prisma.sale.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['PAID', 'SHIPPED', 'DELIVERED'], // Apenas vendas efetivadas
        },
      },
      select: {
        total_price: true,
        status: true,
      },
    })

    return sales.map(
      (sale: any): SalesAggregation => ({
        total_price: sale.total_price,
        status: sale.status,
      })
    )
  }

  /**
   * Busca gastos com anúncios para um período específico
   * Referência: Story 2.1 - Gasto anúncios
   */
  async getAdSpendForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdSpendAggregation[]> {
    const ads = await prisma.ad.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        spend: true,
        date: true,
      },
    })

    return ads.map(
      (ad: any): AdSpendAggregation => ({
        spend: ad.spend,
        date: ad.date,
      })
    )
  }

  /**
   * Busca pagamentos agendados (vendas pendentes ou enviadas)
   * Referência: Story 2.1 - Pagamentos agendados
   */
  async getScheduledPayments(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ScheduledPayment[]> {
    const scheduledPayments = await prisma.sale.findMany({
      where: {
        user_id: userId,
        OR: [
          {
            // Vendas pendentes com data de vencimento no período
            status: 'PENDING',
            payment_due_date: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Vendas enviadas aguardando confirmação
            status: 'SHIPPED',
            shipped_at: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      select: {
        total_price: true,
        payment_due_date: true,
        status: true,
      },
    })

    return scheduledPayments.map(
      (payment: any): ScheduledPayment => ({
        total_price: payment.total_price,
        payment_due_date: payment.payment_due_date,
        status: payment.status,
      })
    )
  }

  /**
   * Busca dados para gráfico de vendas vs gastos
   * Referência: Story 2.2 - Gráfico vendas vs gastos (últimos 30 dias)
   */
  async getChartData(userId: string, startDate: Date, endDate: Date): Promise<ChartDataRow[]> {
    // Query SQL raw para agregar dados por dia
    const result = await prisma.$queryRaw<
      Array<{
        date: string
        vendas: number
        gastos: number
      }>
    >`
      WITH date_series AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          '1 day'::interval
        )::date as date
      ),
      daily_sales AS (
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(total_price), 0) as vendas
        FROM sales 
        WHERE user_id = ${userId}
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
          AND status IN ('PAID', 'SHIPPED', 'DELIVERED')
        GROUP BY DATE(created_at)
      ),
      daily_ads AS (
        SELECT 
          DATE(date) as date,
          COALESCE(SUM(spend), 0) as gastos
        FROM ads 
        WHERE user_id = ${userId}
          AND date >= ${startDate}
          AND date <= ${endDate}
        GROUP BY DATE(date)
      )
      SELECT 
        ds.date::text,
        COALESCE(s.vendas, 0) as vendas,
        COALESCE(a.gastos, 0) as gastos
      FROM date_series ds
      LEFT JOIN daily_sales s ON ds.date = s.date
      LEFT JOIN daily_ads a ON ds.date = a.date
      ORDER BY ds.date
    `

    return result.map(
      (row: any): ChartDataRow => ({
        date: row.date,
        vendas: Number(row.vendas),
        gastos: Number(row.gastos),
      })
    )
  }

  /**
   * Busca atividades recentes para o dashboard
   * Referência: Dashboard activities endpoint
   */
  async getRecentActivities(userId: string, limit: number = 10): Promise<DashboardActivity[]> {
    const activities: DashboardActivity[] = []

    // Vendas recentes
    const recentSales = await prisma.sale.findMany({
      where: {
        user_id: userId,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: Math.ceil(limit / 2), // Metade do limite para vendas
    })

    // Adicionar vendas às atividades
    recentSales.forEach((sale: any) => {
      activities.push({
        id: sale.id,
        type: 'sale',
        title: `Nova venda: ${sale.product_name}`,
        description: `Venda para ${sale.client?.name || 'Cliente'} no valor de R$ ${Number(sale.total_price).toFixed(2)}`,
        amount: Number(sale.total_price),
        timestamp: sale.created_at,
        metadata: {
          saleId: sale.id,
          clientName: sale.client?.name,
          status: sale.status,
        },
      })
    })

    // Pagamentos recentes (vendas com mudança de status para PAID)
    const recentPayments = await prisma.sale.findMany({
      where: {
        user_id: userId,
        status: 'PAID',
        payment_date: {
          not: null,
        },
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        payment_date: 'desc',
      },
      take: Math.ceil(limit / 2), // Metade do limite para pagamentos
    })

    // Adicionar pagamentos às atividades
    recentPayments.forEach((payment: any) => {
      if (payment.payment_date) {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          title: 'Pagamento recebido',
          description: `Pagamento de ${payment.client?.name || 'Cliente'} no valor de R$ ${Number(payment.total_price).toFixed(2)}`,
          amount: Number(payment.total_price),
          timestamp: payment.payment_date,
          metadata: {
            saleId: payment.id,
            clientName: payment.client?.name,
            productName: payment.product_name,
          },
        })
      }
    })

    // Ordenar por timestamp e retornar apenas o limite solicitado
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  }

  /**
   * Busca vendas agregadas por mês para relatórios
   */
  async getMonthlySalesAggregation(
    userId: string,
    year: number
  ): Promise<Array<{ month: number; total: number; count: number }>> {
    const result = await prisma.$queryRaw<
      Array<{
        month: number
        total: number
        count: number
      }>
    >`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COALESCE(SUM(total_price), 0) as total,
        COUNT(*) as count
      FROM sales 
      WHERE user_id = ${userId}
        AND EXTRACT(YEAR FROM created_at) = ${year}
        AND status IN ('PAID', 'SHIPPED', 'DELIVERED')
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `

    return result.map((row: any) => ({
      month: Number(row.month),
      total: Number(row.total),
      count: Number(row.count),
    }))
  }
}
