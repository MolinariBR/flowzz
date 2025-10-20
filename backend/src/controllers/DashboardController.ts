// Referência: tasks.md Task 3.3.3, user-stories.md Story 2.1, design.md §Controller Layer
// Controller REST do dashboard com endpoints de métricas e análises

import type { Request, Response } from 'express'
import type {
  DashboardMetrics,
  DashboardMetricsWithComparisons,
} from '../interfaces/DashboardService.interface'
import { DashboardService } from '../services/DashboardService'
import {
  dashboardActivitiesQuerySchema,
  dashboardChartQuerySchema,
  dashboardMetricsQuerySchema,
} from '../validators/dashboard.validator'

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export class DashboardController {
  private dashboardService: DashboardService

  constructor() {
    this.dashboardService = new DashboardService()
  }

  /**
   * GET /dashboard/metrics - Métricas principais do dashboard
   * Referência: Story 2.1 - Dashboard com dados do dia
   */
  getMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        })
        return
      }

      // Validar period se fornecido
      const period = req.query.period as string | undefined
      if (period && !['7', '30', '90'].includes(period)) {
        res.status(400).json({
          success: false,
          error: 'Período inválido',
          message: 'Período deve ser: 7, 30 ou 90 dias',
        })
        return
      }

      // Validar query parameters (se houver)
      const validatedQuery = dashboardMetricsQuerySchema.parse(req.query)

      let metrics: DashboardMetrics | DashboardMetricsWithComparisons

      if (validatedQuery.start_date && validatedQuery.end_date) {
        // Métricas para período específico
        metrics = await this.dashboardService.getMetricsForPeriod(
          userId,
          validatedQuery.start_date,
          validatedQuery.end_date
        )
      } else {
        // Métricas do dia atual com comparações
        metrics = await this.dashboardService.getMetrics(userId)
      }

      res.status(200).json({
        success: true,
        data: metrics,
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros de query inválidos',
          details: error.message,
        })
        return
      }

      console.error('Error fetching dashboard metrics:', error)
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /dashboard/chart - Dados para gráfico vendas vs gastos
   * Referência: Story 2.2 - Gráfico vendas vs gastos (últimos 30 dias)
   */
  getChartData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        })
        return
      }

      // Validar e parsear query parameters
      const validatedQuery = dashboardChartQuerySchema.parse(req.query)

      // Calcular período em dias baseado nas datas ou período predefinido
      let days = 30 // default

      if (validatedQuery.start_date && validatedQuery.end_date) {
        days = Math.ceil(
          (validatedQuery.end_date.getTime() - validatedQuery.start_date.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      } else if (validatedQuery.period) {
        const periodDays: Record<string, number> = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
          '1y': 365,
          custom: 30,
        }
        days = periodDays[validatedQuery.period] || 30
      }

      const chartData = await this.dashboardService.getChartData(userId, days)

      // Calcular meta information
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      res.status(200).json({
        success: true,
        data: chartData,
        meta: {
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
          },
        },
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros de query inválidos',
          details: error.message,
        })
        return
      }

      console.error('Error fetching dashboard chart data:', error)
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /dashboard/activities - Atividades recentes do usuário
   * Referência: Dashboard activities para engajamento
   */
  getActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        })
        return
      }

      // Validar query parameters
      const validatedQuery = dashboardActivitiesQuerySchema.parse(req.query)

      const activities = await this.dashboardService.getRecentActivities(
        userId,
        validatedQuery.limit
      )

      res.status(200).json({
        success: true,
        data: activities,
        meta: {
          total: activities.length,
          limit: validatedQuery.limit,
        },
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros de query inválidos',
          details: error.message,
        })
        return
      }

      console.error('Error fetching dashboard activities:', error)
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * DELETE /dashboard/cache - Invalidar cache do dashboard
   * Endpoint administrativo para forçar atualização dos dados
   */
  invalidateCache = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId
      const userRole = req.user?.role

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        })
        return
      }

      // Apenas admin pode invalidar cache de todos os usuários
      const invalidateAll = req.query.all === 'true'

      if (invalidateAll && userRole !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Acesso negado: apenas administradores podem invalidar cache global',
        })
        return
      }

      if (invalidateAll) {
        await this.dashboardService.invalidateAllCache()
      } else {
        await this.dashboardService.invalidateCache(userId)
      }

      res.status(200).json({
        success: true,
        message: invalidateAll
          ? 'Cache global invalidado com sucesso'
          : 'Cache do usuário invalidado com sucesso',
      })
    } catch (error) {
      console.error('Error invalidating dashboard cache:', error)
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /dashboard/cache/stats - Estatísticas do cache do dashboard
   * Endpoint administrativo para monitoramento
   */
  getCacheStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userRole = req.user?.role

      if (userRole !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Acesso negado: apenas administradores podem visualizar estatísticas do cache',
        })
        return
      }

      // TODO: Implementar método getCacheStats no DashboardService
      const stats = {
        message: 'Cache stats não implementado ainda',
      }

      res.status(200).json({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error fetching cache stats:', error)
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /dashboard/top-clients - Top clientes por compra
   * Referência: Teste E2E dashboard
   */
  getTopClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        })
        return
      }

      const limit = parseInt(req.query.limit as string, 10) || 10

      // Buscar top clientes ordenados por total gasto
      const { prisma } = await import('../shared/config/database')
      const topClients = await prisma.client.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          total_spent: 'desc',
        },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          total_spent: true,
          total_orders: true,
          last_order_at: true,
        },
      })

      res.status(200).json({
        success: true,
        data: topClients,
      })
    } catch (error) {
      console.error('Error fetching top clients:', error)
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      })
    }
  }
}
