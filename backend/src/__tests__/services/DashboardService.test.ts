// Referência: tasks.md Task 13.1.1, design.md §Testing Strategy
// Testes unitários para DashboardService: cálculo de métricas, comparações, chart data

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardService } from '../../services/DashboardService'
import { redisService } from '../../shared/services/RedisService'

// Mock do DashboardRepository
vi.mock('../../repositories/DashboardRepository', () => ({
  DashboardRepository: vi.fn().mockImplementation(() => ({
    getSalesTotal: vi.fn(),
    getAdSpendTotal: vi.fn(),
    getPendingSales: vi.fn(),
    getRecentActivities: vi.fn(),
    getChartData: vi.fn(),
    getSalesForPeriod: vi.fn(),
    getAdSpendForPeriod: vi.fn(),
    getScheduledPayments: vi.fn(),
  })),
}))

// Mock do RedisService
vi.mock('../../shared/services/RedisService', () => ({
  redisService: {
    getDashboardMetrics: vi.fn(),
    setDashboardMetrics: vi.fn(),
    invalidateDashboardCache: vi.fn(),
  },
}))

describe('DashboardService', () => {
  let dashboardService: DashboardService
  const mockUserId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()
    dashboardService = new DashboardService()
  })

  describe('Service instantiation', () => {
    it('deve instanciar o DashboardService corretamente', () => {
      expect(dashboardService).toBeInstanceOf(DashboardService)
    })

    it('deve ter métodos públicos definidos', () => {
      expect(typeof dashboardService.getMetrics).toBe('function')
      expect(typeof dashboardService.getActivities).toBe('function')
      expect(typeof dashboardService.getChartData).toBe('function')
    })
  })

  describe('getMetrics', () => {
    it('deve retornar métricas do cache quando disponível', async () => {
      // Arrange
      const cachedMetrics = {
        vendas_hoje: 5000,
        gasto_anuncios: 1000,
        roi: 400,
        vendas_pendentes: 2,
        comparisons: {
          vendas_hoje: 10,
          gasto_anuncios: -5,
          roi: 15,
          vendas_pendentes: 0,
        },
      }

      vi.mocked(redisService.getDashboardMetrics).mockResolvedValue(cachedMetrics)

      // Act
      const result = await dashboardService.getMetrics(mockUserId)

      // Assert
      expect(result).toEqual(cachedMetrics)
      expect(redisService.getDashboardMetrics).toHaveBeenCalledWith(mockUserId)
    })

    it('deve calcular métricas quando não há cache', async () => {
      // Arrange
      vi.mocked(redisService.getDashboardMetrics).mockResolvedValue(null)

      const mockRepository = (dashboardService as any).dashboardRepository

      // Mock getSalesForPeriod - retorna array de vendas
      mockRepository.getSalesForPeriod = vi
        .fn()
        .mockResolvedValueOnce([{ total_price: 5000, status: 'PAID' }]) // today
        .mockResolvedValueOnce([{ total_price: 4500, status: 'PAID' }]) // yesterday

      // Mock getAdSpendForPeriod - retorna array de gastos
      mockRepository.getAdSpendForPeriod = vi
        .fn()
        .mockResolvedValueOnce([{ spend: 1000, date: new Date() }]) // today
        .mockResolvedValueOnce([{ spend: 1050, date: new Date() }]) // yesterday

      // Mock getScheduledPayments - retorna array de pagamentos agendados
      mockRepository.getScheduledPayments = vi.fn().mockResolvedValue([
        { total_price: 1500, status: 'PENDING' },
        { total_price: 500, status: 'SHIPPED' },
      ])

      // Act
      const result = await dashboardService.getMetrics(mockUserId)

      // Assert
      expect(result.vendas_hoje).toBe(5000)
      expect(result.gasto_anuncios).toBe(1000)
      expect(result.lucro_liquido).toBe(4000) // 5000 - 1000
      expect(result.pagamentos_agendados).toBe(2000) // 1500 + 500
      expect(result.comparisons.vendas_hoje).toBeCloseTo(11.11, 1) // (5000-4500)/4500 * 100
      expect(redisService.setDashboardMetrics).toHaveBeenCalled()
    })

    it('deve calcular lucro líquido corretamente', async () => {
      // Arrange
      vi.mocked(redisService.getDashboardMetrics).mockResolvedValue(null)

      const mockRepository = (dashboardService as any).dashboardRepository
      mockRepository.getSalesForPeriod = vi
        .fn()
        .mockResolvedValue([{ total_price: 10000, status: 'PAID' }])
      mockRepository.getAdSpendForPeriod = vi
        .fn()
        .mockResolvedValue([{ spend: 2000, date: new Date() }])
      mockRepository.getScheduledPayments = vi.fn().mockResolvedValue([])

      // Act
      const result = await dashboardService.getMetrics(mockUserId)

      // Assert
      expect(result.lucro_liquido).toBe(8000) // 10000 - 2000
    })

    it('deve retornar lucro líquido igual a vendas quando não há gastos com anúncios', async () => {
      // Arrange
      vi.mocked(redisService.getDashboardMetrics).mockResolvedValue(null)

      const mockRepository = (dashboardService as any).dashboardRepository
      mockRepository.getSalesForPeriod = vi
        .fn()
        .mockResolvedValue([{ total_price: 5000, status: 'PAID' }])
      mockRepository.getAdSpendForPeriod = vi.fn().mockResolvedValue([])
      mockRepository.getScheduledPayments = vi.fn().mockResolvedValue([])

      // Act
      const result = await dashboardService.getMetrics(mockUserId)

      // Assert
      expect(result.lucro_liquido).toBe(5000) // vendas - 0 gastos
    })
  })

  describe('getActivities', () => {
    it('deve retornar lista de atividades recentes', async () => {
      // Arrange
      const mockActivities = [
        {
          id: 'act-1',
          type: 'sale' as const,
          description: 'Venda de R$ 500',
          timestamp: new Date(),
        },
        {
          id: 'act-2',
          type: 'client' as const,
          description: 'Novo cliente: João',
          timestamp: new Date(),
        },
      ]

      const mockRepository = (dashboardService as any).dashboardRepository
      mockRepository.getRecentActivities = vi.fn().mockResolvedValue(mockActivities)

      // Act
      const result = await dashboardService.getActivities(mockUserId, 10)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('sale')
      expect(mockRepository.getRecentActivities).toHaveBeenCalledWith(mockUserId, 10)
    })

    it('deve usar limite padrão de 20 quando não fornecido', async () => {
      // Arrange
      const mockRepository = (dashboardService as any).dashboardRepository
      mockRepository.getRecentActivities = vi.fn().mockResolvedValue([])

      // Act
      await dashboardService.getActivities(mockUserId)

      // Assert
      expect(mockRepository.getRecentActivities).toHaveBeenCalledWith(mockUserId, 20)
    })
  })

  describe('getChartData', () => {
    it('deve retornar dados para gráfico de vendas vs gastos', async () => {
      // Arrange
      const mockChartData = [
        { month: 'Jan', vendas: 10000, gastos: 2000 },
        { month: 'Fev', vendas: 12000, gastos: 2500 },
        { month: 'Mar', vendas: 15000, gastos: 3000 },
      ]

      const mockRepository = (dashboardService as any).dashboardRepository
      mockRepository.getChartData = vi.fn().mockResolvedValue(mockChartData)

      // Act
      const result = await dashboardService.getChartData(mockUserId, 3)

      // Assert
      expect(result).toHaveLength(3)
      expect(result[0].month).toBe('Jan')
      expect(result[0].vendas).toBe(10000)
      expect(mockRepository.getChartData).toHaveBeenCalledWith(mockUserId, 3)
    })

    it('deve usar 6 meses como padrão', async () => {
      // Arrange
      const mockRepository = (dashboardService as any).dashboardRepository
      mockRepository.getChartData = vi.fn().mockResolvedValue([])

      // Act
      await dashboardService.getChartData(mockUserId)

      // Assert
      expect(mockRepository.getChartData).toHaveBeenCalledWith(mockUserId, 6)
    })
  })

  describe('calculatePercentageChange (método privado)', () => {
    it('deve calcular mudança percentual corretamente', () => {
      // Act
      const result = (dashboardService as any).calculatePercentageChange(150, 100)

      // Assert
      expect(result).toBe(50) // (150-100)/100 * 100 = 50%
    })

    it('deve retornar 0 quando valor anterior é 0', () => {
      // Act
      const result = (dashboardService as any).calculatePercentageChange(100, 0)

      // Assert
      expect(result).toBe(0)
    })

    it('deve calcular decréscimo corretamente', () => {
      // Act
      const result = (dashboardService as any).calculatePercentageChange(80, 100)

      // Assert
      expect(result).toBe(-20) // (80-100)/100 * 100 = -20%
    })
  })
})
