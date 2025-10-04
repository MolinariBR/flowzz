// src/services/AdminService.ts
// Referência: tasks.md Task 11.1, design.md Admin Panel

import { prisma } from '../shared/config/database'

export interface SaaSMetrics {
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churnRate: number // Taxa de churn mensal
  ltv: number // Customer Lifetime Value
  cac: number // Customer Acquisition Cost
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  revenueGrowth: number // Crescimento mensal da receita
}

export interface UserGrowthMetrics {
  totalUsers: number
  newUsersThisMonth: number
  newUsersLastMonth: number
  growthRate: number
  userRetention: number // Retenção de usuários
}

export class AdminService {
  /**
   * Calcula métricas SaaS principais
   */
  async getSaaSMetrics(): Promise<SaaSMetrics> {
    // Calcular MRR e ARR baseado nos planos ativos
    const mrr = await this.calculateMRR()
    const arr = mrr * 12

    // Calcular churn rate
    const churnRate = await this.calculateChurnRate()

    // Calcular LTV
    const ltv = await this.calculateLTV()

    // Calcular CAC
    const cac = await this.calculateCAC()

    // Métricas de usuários
    const totalUsers = await prisma.user.count()
    const activeUsers = await this.getActiveUsersCount()
    const newUsersThisMonth = await this.getNewUsersThisMonth()

    // Crescimento da receita
    const revenueGrowth = await this.calculateRevenueGrowth()

    const metrics: SaaSMetrics = {
      mrr,
      arr,
      churnRate,
      ltv,
      cac,
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      revenueGrowth
    }

    return metrics
  }

  /**
   * Calcula Monthly Recurring Revenue (MRR)
   * Baseado nos planos dos usuários ativos
   */
  private async calculateMRR(): Promise<number> {
    const activeUsers = await prisma.user.findMany({
      where: {
        is_active: true,
        subscription_status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    })

    const totalMRR = activeUsers.reduce((sum, user) => {
      if (user.plan?.price) {
        // Se o plano é anual, dividir por 12 para MRR
        const monthlyPrice = user.plan.interval === 'year'
          ? Number(user.plan.price) / 12
          : Number(user.plan.price)
        return sum + monthlyPrice
      }
      return sum
    }, 0)

    return totalMRR
  }

  /**
   * Calcula taxa de churn (cancelamentos / total ativos)
   */
  private async calculateChurnRate(): Promise<number> {
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    // Usuários que cancelaram este mês
    const cancellations = await prisma.user.count({
      where: {
        subscription_status: 'CANCELED',
        updated_at: {
          gte: firstDayOfMonth
        }
      }
    })

    // Total de usuários ativos
    const activeUsers = await prisma.user.count({
      where: {
        subscription_status: 'ACTIVE'
      }
    })

    if (activeUsers === 0) return 0

    return (cancellations / activeUsers) * 100
  }

  /**
   * Calcula Customer Lifetime Value (LTV)
   */
  private async calculateLTV(): Promise<number> {
    const avgRevenuePerUser = await this.calculateAvgRevenuePerUser()
    const avgLifespanMonths = await this.calculateAvgCustomerLifespan()

    return avgRevenuePerUser * avgLifespanMonths
  }

  /**
   * Calcula Customer Acquisition Cost (CAC)
   */
  private async calculateCAC(): Promise<number> {
    // Simplificado: custos de marketing / novos clientes
    const marketingCosts = 10000 // Valor fixo para exemplo
    const newCustomersThisYear = await prisma.user.count({
      where: {
        created_at: {
          gte: new Date(new Date().getFullYear(), 0, 1)
        }
      }
    })

    return newCustomersThisYear > 0 ? marketingCosts / newCustomersThisYear : 0
  }

  /**
   * Conta usuários ativos (com status ACTIVE)
   */
  private async getActiveUsersCount(): Promise<number> {
    return await prisma.user.count({
      where: {
        is_active: true,
        subscription_status: 'ACTIVE'
      }
    })
  }

  /**
   * Conta novos usuários este mês
   */
  private async getNewUsersThisMonth(): Promise<number> {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    return await prisma.user.count({
      where: {
        created_at: {
          gte: firstDayOfMonth
        }
      }
    })
  }

  /**
   * Calcula crescimento da receita mensal
   */
  private async calculateRevenueGrowth(): Promise<number> {
    const currentMonth = new Date()
    const firstDayCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const firstDayLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)

    const currentRevenue = await this.calculateRevenueForPeriod(firstDayCurrentMonth, new Date())
    const lastMonthRevenue = await this.calculateRevenueForPeriod(firstDayLastMonth, firstDayCurrentMonth)

    if (lastMonthRevenue === 0) return currentRevenue > 0 ? 100 : 0

    return ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
  }

  /**
   * Calcula receita para um período específico
   */
  private async calculateRevenueForPeriod(startDate: Date, endDate: Date): Promise<number> {
    const users = await prisma.user.findMany({
      where: {
        created_at: {
          gte: startDate,
          lt: endDate
        },
        subscription_status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    })

    return users.reduce((sum, user) => {
      if (user.plan?.price) {
        const monthlyPrice = user.plan.interval === 'year'
          ? Number(user.plan.price) / 12
          : Number(user.plan.price)
        return sum + monthlyPrice
      }
      return sum
    }, 0)
  }

  /**
   * Receita média por usuário
   */
  private async calculateAvgRevenuePerUser(): Promise<number> {
    const totalRevenue = await this.calculateMRR() * 12 // ARR
    const totalUsers = await prisma.user.count({
      where: {
        subscription_status: 'ACTIVE'
      }
    })

    return totalUsers > 0 ? totalRevenue / totalUsers : 0
  }

  /**
   * Tempo médio de vida do cliente em meses
   */
  private async calculateAvgCustomerLifespan(): Promise<number> {
    // Simplificado: média de 12 meses para exemplo
    return 12
  }

  /**
   * Obtém métricas de crescimento de usuários
   */
  async getUserGrowthMetrics(): Promise<UserGrowthMetrics> {
    const totalUsers = await prisma.user.count()
    const newUsersThisMonth = await this.getNewUsersThisMonth()

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const firstDayLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
    const firstDayThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const newUsersLastMonth = await prisma.user.count({
      where: {
        created_at: {
          gte: firstDayLastMonth,
          lt: firstDayThisMonth
        }
      }
    })

    const growthRate = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : (newUsersThisMonth > 0 ? 100 : 0)

    const userRetention = await this.calculateUserRetention()

    const metrics: UserGrowthMetrics = {
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      growthRate,
      userRetention
    }

    return metrics
  }

  /**
   * Calcula retenção de usuários (simplificado)
   */
  private async calculateUserRetention(): Promise<number> {
    // Simplificado: 85% para exemplo
    return 85
  }
}