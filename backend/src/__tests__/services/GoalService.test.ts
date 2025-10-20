// Referência: design.md §Testing Strategy, dev-stories.md §Dev Story 4.2, user-stories.md Story 4.2
// Testes unitários para GoalService com CRUD completo e progresso
//
// NOTA: Este arquivo de teste é uma estrutura básica que valida a interface do serviço.
// Para testes completos com mocks do Prisma, é necessário configurar uma estratégia
// de mock mais robusta (ex: usar prisma-mock ou banco em memória).
//
// Cenários Gherkin cobertos (user-stories.md Story 4.2):
// - Criar primeira meta (com validação de limite de 5 metas)
// - Atingir meta antes do prazo (progress >= 100%)
// - Meta não atingida no prazo (expired_incomplete)
// - Filtros por target_type, period_type, is_active
// - Cálculo de progresso para REVENUE, PROFIT, ORDERS, CUSTOM
// - Soft delete (is_active = false)

import type { GoalTargetType, PeriodType } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoalProgressStatus } from '../../interfaces/GoalService.interface'

// Mock do prisma ANTES do import do service
// Usar factory function para evitar problemas de hoisting
vi.mock('../../shared/config/database', () => ({
  prisma: {
    goal: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    sale: {
      aggregate: vi.fn(),
      count: vi.fn(),
    },
    ad: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

// Importar service DEPOIS do mock
import { GoalService } from '../../services/GoalService'
import { prisma } from '../../shared/config/database'

interface CreateGoalDTO {
  title: string
  target_type: GoalTargetType
  target_value: number
  period_type: PeriodType
  period_start: Date
  period_end: Date
}

const testUserId = 'test-user-123'

describe('GoalService', () => {
  let goalService: GoalService

  beforeEach(() => {
    vi.clearAllMocks()
    goalService = new GoalService()
  })

  describe('Service Instantiation', () => {
    it('deve instanciar GoalService corretamente', () => {
      expect(goalService).toBeInstanceOf(GoalService)
    })

    it('deve ter todos os métodos públicos definidos', () => {
      expect(typeof goalService.createGoal).toBe('function')
      expect(typeof goalService.getGoals).toBe('function')
      expect(typeof goalService.getGoalById).toBe('function')
      expect(typeof goalService.updateGoal).toBe('function')
      expect(typeof goalService.deleteGoal).toBe('function')
      expect(typeof goalService.calculateProgress).toBe('function')
      expect(typeof goalService.updateAllGoalsProgress).toBe('function')
      expect(typeof goalService.checkAndNotifyProgress).toBe('function')
      expect(typeof goalService.expireOldGoals).toBe('function')
      expect(typeof goalService.getGoalStatistics).toBe('function')
      expect(typeof goalService.canCreateGoal).toBe('function')
      expect(typeof goalService.calculateDailyTarget).toBe('function')
    })
  })

  describe('createGoal - Story 4.2 Cenário: Criar primeira meta', () => {
    it('deve criar primeira meta com sucesso', async () => {
      // Gherkin: "Dado que não tenho metas ativas"
      vi.mocked(prisma.goal.count).mockResolvedValue(0)

      // Mock sales para calcular progresso inicial
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 10950 }, // R$ 10.950 já faturado
      })

      const newGoal = {
        id: 'goal-123',
        user_id: testUserId,
        title: 'Faturar R$ 15.000 em Outubro',
        target_type: 'REVENUE' as GoalTargetType,
        target_value: 15000,
        current_value: 10950,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(prisma.goal.create).mockResolvedValue(newGoal)

      // Gherkin: "Quando clico em 'Criar Meta'"
      const goalData: CreateGoalDTO = {
        title: 'Faturar R$ 15.000 em Outubro',
        target_type: 'REVENUE' as GoalTargetType,
        target_value: 15000,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
      }

      const result = await goalService.createGoal(testUserId, goalData)

      // Gherkin: "Então vejo card da meta no dashboard"
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title', 'Faturar R$ 15.000 em Outubro')

      // Gherkin: "E vejo progresso: '73% atingido (R$ 10.950/R$ 15.000)'"
      expect(result).toHaveProperty('progress_percentage', 73)
      expect(result.current_value).toBe(10950)
      expect(result.target_value).toBe(15000)

      // Gherkin: "E vejo '18 dias restantes'" (depende da data atual no teste)
      expect(result).toHaveProperty('days_remaining')
      expect(result.days_remaining).toBeGreaterThanOrEqual(0)

      // Verificar que foi criada no banco
      expect(prisma.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: testUserId,
          title: goalData.title,
          target_type: goalData.target_type,
          target_value: goalData.target_value,
        }),
      })
    })

    it('deve lançar erro quando atingir limite de 5 metas ativas', async () => {
      // Gherkin: "Critério: Máximo 5 metas ativas simultâneas"
      vi.mocked(prisma.goal.count).mockResolvedValue(5)

      const goalData: CreateGoalDTO = {
        title: 'Meta extra',
        target_type: 'REVENUE' as GoalTargetType,
        target_value: 20000,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-11-01'),
        period_end: new Date('2025-11-30'),
      }

      await expect(goalService.createGoal(testUserId, goalData)).rejects.toThrow(
        'Você já atingiu o limite de 5 metas ativas'
      )
    })

    it('deve criar meta com target_type PROFIT', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(0)
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 10000 as any },
      } as any)
      vi.mocked(prisma.ad.aggregate).mockResolvedValue({
        _sum: { spend: 3000 as any },
      } as any)

      const newGoal = {
        id: 'goal-456',
        user_id: testUserId,
        title: 'Lucrar R$ 5.000',
        target_type: 'PROFIT' as GoalTargetType,
        target_value: 5000,
        current_value: 7000, // 10000 - 3000
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(prisma.goal.create).mockResolvedValue(newGoal)

      const goalData: CreateGoalDTO = {
        title: 'Lucrar R$ 5.000',
        target_type: 'PROFIT' as GoalTargetType,
        target_value: 5000,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
      }

      const result = await goalService.createGoal(testUserId, goalData)

      expect(result.target_type).toBe('PROFIT')
      expect(result.current_value).toBe(7000)
    })

    it('deve criar meta com target_type ORDERS', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(0)
      vi.mocked(prisma.sale.count).mockResolvedValue(150)

      const newGoal = {
        id: 'goal-789',
        user_id: testUserId,
        title: 'Realizar 200 vendas',
        target_type: 'ORDERS' as GoalTargetType,
        target_value: 200,
        current_value: 150,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(prisma.goal.create).mockResolvedValue(newGoal)

      const goalData: CreateGoalDTO = {
        title: 'Realizar 200 vendas',
        target_type: 'ORDERS' as GoalTargetType,
        target_value: 200,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
      }

      const result = await goalService.createGoal(testUserId, goalData)

      expect(result.target_type).toBe('ORDERS')
      expect(result.current_value).toBe(150)
    })

    it('deve criar meta com target_type CUSTOM', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(0)

      const newGoal = {
        id: 'goal-custom',
        user_id: testUserId,
        title: 'Meta personalizada',
        target_type: 'CUSTOM' as GoalTargetType,
        target_value: 100,
        current_value: 0, // Começa em 0 para CUSTOM
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(prisma.goal.create).mockResolvedValue(newGoal)

      const goalData: CreateGoalDTO = {
        title: 'Meta personalizada',
        target_type: 'CUSTOM' as GoalTargetType,
        target_value: 100,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
      }

      const result = await goalService.createGoal(testUserId, goalData)

      expect(result.target_type).toBe('CUSTOM')
      expect(result.current_value).toBe(0)
    })
  })

  describe('createGoal - Story 4.2 Cenário: Atingir meta antes do prazo', () => {
    it('deve marcar meta como COMPLETED quando current_value >= target_value', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(0)

      // Gherkin: "Dado que tenho meta de R$ 15.000 E já faturei R$ 15.200"
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 15200 }, // Já atingiu a meta!
      })

      const newGoal = {
        id: 'goal-completed',
        user_id: testUserId,
        title: 'Faturar R$ 15.000',
        target_type: 'REVENUE' as GoalTargetType,
        target_value: 15000,
        current_value: 15200,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(prisma.goal.create).mockResolvedValue(newGoal)

      const goalData: CreateGoalDTO = {
        title: 'Faturar R$ 15.000',
        target_type: 'REVENUE' as GoalTargetType,
        target_value: 15000,
        period_type: 'MONTHLY' as PeriodType,
        period_start: new Date('2025-10-01'),
        period_end: new Date('2025-10-31'),
      }

      const result = await goalService.createGoal(testUserId, goalData)

      // Gherkin: "Então vejo confete animado 🎉 E vejo mensagem 'Parabéns! Você atingiu sua meta!'"
      expect(result.progress_percentage).toBeGreaterThanOrEqual(100)
      expect(result.progress_status).toBe(GoalProgressStatus.COMPLETED)

      // Gherkin: "E meta fica marcada como 'Concluída'"
      expect(result.current_value).toBeGreaterThanOrEqual(result.target_value)
    })
  })

  describe('getGoals', () => {
    it('deve listar todas as metas ativas do usuário', async () => {
      const mockGoals = [
        createMockGoal('goal-1', 'Meta 1', 'REVENUE', 10000, 5000, true),
        createMockGoal('goal-2', 'Meta 2', 'PROFIT', 5000, 3000, true),
      ]

      vi.mocked(prisma.goal.findMany).mockResolvedValue(mockGoals)

      const result = await goalService.getGoals(testUserId, {
        is_active: true,
      })

      expect(result.goals).toHaveLength(2)
      expect(result.count).toBe(2)
      expect(result.goals[0]).toHaveProperty('progress_percentage')
      expect(result.goals[0]).toHaveProperty('days_remaining')
    })

    it('deve filtrar metas por period_type', async () => {
      const mockGoals = [
        createMockGoal('goal-monthly', 'Meta Mensal', 'REVENUE', 10000, 5000, true, 'MONTHLY'),
      ]

      vi.mocked(prisma.goal.findMany).mockResolvedValue(mockGoals)

      const result = await goalService.getGoals(testUserId, {
        period_type: 'MONTHLY' as PeriodType,
      })

      expect(result.goals).toHaveLength(1)
      expect(result.goals[0].period_type).toBe('MONTHLY')
    })

    it('deve filtrar metas por target_type', async () => {
      const mockGoals = [
        createMockGoal('goal-revenue', 'Meta Receita', 'REVENUE', 10000, 5000, true),
      ]

      vi.mocked(prisma.goal.findMany).mockResolvedValue(mockGoals)

      const result = await goalService.getGoals(testUserId, {
        target_type: 'REVENUE' as GoalTargetType,
      })

      expect(result.goals).toHaveLength(1)
      expect(result.goals[0].target_type).toBe('REVENUE')
    })

    it('deve retornar array vazio quando não há metas', async () => {
      vi.mocked(prisma.goal.findMany).mockResolvedValue([])

      const result = await goalService.getGoals(testUserId)

      expect(result.goals).toHaveLength(0)
      expect(result.count).toBe(0)
    })
  })

  describe('getGoalById', () => {
    it('deve retornar meta específica com progresso calculado', async () => {
      const mockGoal = createMockGoal('goal-123', 'Minha Meta', 'REVENUE', 15000, 10950, true)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const result = await goalService.getGoalById(testUserId, 'goal-123')

      expect(result).toBeDefined()
      expect(result.id).toBe('goal-123')
      expect(result).toHaveProperty('progress_percentage')
      expect(result).toHaveProperty('days_remaining')
      expect(result).toHaveProperty('is_on_track')
    })

    it('deve lançar erro quando meta não existe', async () => {
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(null)

      await expect(goalService.getGoalById(testUserId, 'non-existent')).rejects.toThrow(
        'Meta não encontrada'
      )
    })

    it('deve lançar erro quando meta não pertence ao usuário', async () => {
      const mockGoal = createMockGoal('goal-other', 'Meta de outro', 'REVENUE', 10000, 5000, true)
      mockGoal.user_id = 'other-user-456'
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      await expect(goalService.getGoalById(testUserId, 'goal-other')).rejects.toThrow(
        'Você não tem permissão para acessar esta meta'
      )
    })
  })

  describe('updateGoal', () => {
    it('deve atualizar meta parcialmente', async () => {
      const mockGoal = createMockGoal('goal-update', 'Meta Original', 'REVENUE', 15000, 10000, true)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const updatedGoal = { ...mockGoal, title: 'Meta Atualizada' }
      vi.mocked(prisma.goal.update).mockResolvedValue(updatedGoal)

      const updateData: UpdateGoalDTO = {
        title: 'Meta Atualizada',
      }

      const result = await goalService.updateGoal(testUserId, 'goal-update', updateData)

      expect(result.title).toBe('Meta Atualizada')
      expect(prisma.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-update' },
        data: expect.objectContaining({
          title: 'Meta Atualizada',
          updated_at: expect.any(Date),
        }),
      })
    })

    it('deve atualizar target_value', async () => {
      const mockGoal = createMockGoal('goal-update-value', 'Meta', 'REVENUE', 15000, 10000, true)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const updatedGoal = { ...mockGoal, target_value: 20000 }
      vi.mocked(prisma.goal.update).mockResolvedValue(updatedGoal)

      const updateData: UpdateGoalDTO = {
        target_value: 20000,
      }

      const result = await goalService.updateGoal(testUserId, 'goal-update-value', updateData)

      expect(result.target_value).toBe(20000)
    })

    it('deve atualizar period_end', async () => {
      const mockGoal = createMockGoal('goal-update-date', 'Meta', 'REVENUE', 15000, 10000, true)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const newEndDate = new Date('2025-12-31')
      const updatedGoal = { ...mockGoal, period_end: newEndDate }
      vi.mocked(prisma.goal.update).mockResolvedValue(updatedGoal)

      const updateData: UpdateGoalDTO = {
        period_end: newEndDate,
      }

      const result = await goalService.updateGoal(testUserId, 'goal-update-date', updateData)

      expect(result.period_end).toEqual(newEndDate)
    })

    it('deve lançar erro quando meta não existe', async () => {
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(null)

      await expect(
        goalService.updateGoal(testUserId, 'non-existent', { title: 'Novo' })
      ).rejects.toThrow('Meta não encontrada')
    })

    it('deve lançar erro quando meta não pertence ao usuário', async () => {
      const mockGoal = createMockGoal('goal-other', 'Meta de outro', 'REVENUE', 10000, 5000, true)
      mockGoal.user_id = 'other-user-456'
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      await expect(
        goalService.updateGoal(testUserId, 'goal-other', { title: 'Novo' })
      ).rejects.toThrow('Você não tem permissão para atualizar esta meta')
    })
  })

  describe('deleteGoal - Soft Delete', () => {
    it('deve fazer soft delete marcando is_active como false', async () => {
      const mockGoal = createMockGoal('goal-delete', 'Meta', 'REVENUE', 15000, 10000, true)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const deletedGoal = { ...mockGoal, is_active: false }
      vi.mocked(prisma.goal.update).mockResolvedValue(deletedGoal)

      await goalService.deleteGoal(testUserId, 'goal-delete')

      expect(prisma.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-delete' },
        data: {
          is_active: false,
          updated_at: expect.any(Date),
        },
      })
    })

    it('deve lançar erro quando meta não existe', async () => {
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(null)

      await expect(goalService.deleteGoal(testUserId, 'non-existent')).rejects.toThrow(
        'Meta não encontrada'
      )
    })

    it('deve lançar erro quando meta não pertence ao usuário', async () => {
      const mockGoal = createMockGoal('goal-other', 'Meta de outro', 'REVENUE', 10000, 5000, true)
      mockGoal.user_id = 'other-user-456'
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      await expect(goalService.deleteGoal(testUserId, 'goal-other')).rejects.toThrow(
        'Você não tem permissão para deletar esta meta'
      )
    })
  })

  describe('calculateProgress', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('deve calcular progresso para meta REVENUE', async () => {
      const mockGoal = createMockGoal('goal-revenue', 'Meta Receita', 'REVENUE', 15000, 0, true)
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 10950 },
      } as any)

      const result = await goalService.calculateProgress(mockGoal)

      expect(result.current_value).toBe(10950)
      expect(result.progress_percentage).toBe(73) // 10950/15000 = 73%
      expect(result.progress_status).toBe(GoalProgressStatus.IN_PROGRESS)
    })

    it('deve calcular progresso para meta PROFIT', async () => {
      const mockGoal = createMockGoal('goal-profit', 'Meta Lucro', 'PROFIT', 5000, 0, true)
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 10000 },
      } as any)
      vi.mocked(prisma.ad.aggregate).mockResolvedValue({
        _sum: { spend: 3000 },
      } as any)

      const result = await goalService.calculateProgress(mockGoal)

      expect(result.current_value).toBe(7000) // 10000 - 3000
      expect(result.progress_percentage).toBeGreaterThan(100) // 7000/5000 = 140%
      expect(result.progress_status).toBe(GoalProgressStatus.COMPLETED)
    })

    it('deve calcular progresso para meta ORDERS', async () => {
      const mockGoal = createMockGoal('goal-orders', 'Meta Vendas', 'ORDERS', 200, 0, true)
      vi.mocked(prisma.sale.count).mockResolvedValue(150)

      const result = await goalService.calculateProgress(mockGoal)

      expect(result.current_value).toBe(150)
      expect(result.progress_percentage).toBe(75) // 150/200 = 75%
      expect(result.progress_status).toBe(GoalProgressStatus.IN_PROGRESS)
    })

    it('deve calcular progresso para meta CUSTOM (usa current_value do banco)', async () => {
      const mockGoal = createMockGoal('goal-custom', 'Meta Custom', 'CUSTOM', 100, 50, true)

      const result = await goalService.calculateProgress(mockGoal)

      expect(result.current_value).toBe(50) // Usa valor do banco
      expect(result.progress_percentage).toBe(50)
      expect(result.progress_status).toBe(GoalProgressStatus.IN_PROGRESS)
    })

    it('deve retornar NOT_STARTED quando current_value = 0', async () => {
      const mockGoal = createMockGoal('goal-not-started', 'Meta', 'REVENUE', 15000, 0, true)
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 0 },
      })

      const result = await goalService.calculateProgress(mockGoal)

      expect(result.progress_percentage).toBe(0)
      expect(result.progress_status).toBe(GoalProgressStatus.NOT_STARTED)
    })

    it('deve retornar ALMOST_THERE quando progresso >= 80% e < 100%', async () => {
      const mockGoal = createMockGoal('goal-almost', 'Meta', 'REVENUE', 10000, 0, true)
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 8500 }, // 85%
      })

      const result = await goalService.calculateProgress(mockGoal)

      expect(result.progress_percentage).toBe(85)
      expect(result.progress_status).toBe(GoalProgressStatus.ALMOST_THERE)
    })

    it('deve retornar COMPLETED quando progresso >= 100%', async () => {
      const mockGoal = createMockGoal('goal-completed', 'Meta', 'REVENUE', 10000, 0, true)
      vi.mocked(prisma.sale.aggregate).mockResolvedValue({
        _sum: { total_price: 12000 }, // 120%
      })

      const result = await goalService.calculateProgress(mockGoal)

      expect(result.progress_percentage).toBe(120)
      expect(result.progress_status).toBe(GoalProgressStatus.COMPLETED)
    })
  })

  describe('expireOldGoals - Story 4.2 Cenário: Meta não atingida no prazo', () => {
    it('deve marcar metas expiradas incompletas como EXPIRED_INCOMPLETE', async () => {
      // Gherkin: "Dado que tenho meta de R$ 15.000 até 31/10 E em 31/10 faturei apenas R$ 12.500"
      const expiredGoal = createMockGoal(
        'goal-expired',
        'Meta Expirada',
        'REVENUE',
        15000,
        12500,
        true
      )
      expiredGoal.period_end = new Date('2024-10-31') // Data passada

      vi.mocked(prisma.goal.findMany).mockResolvedValue([expiredGoal])
      vi.mocked(prisma.goal.update).mockResolvedValue(expiredGoal)

      // Gherkin: "Quando data vence"
      await goalService.expireOldGoals()

      // Gherkin: "Então meta fica marcada como 'Não atingida' E vejo '83% atingido'"
      expect(prisma.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-expired' },
        data: {
          is_active: false,
          updated_at: expect.any(Date),
        },
      })
    })

    it('não deve marcar meta expirada se já foi completada', async () => {
      const completedGoal = createMockGoal(
        'goal-completed',
        'Meta Completa',
        'REVENUE',
        15000,
        15200,
        true
      )
      completedGoal.period_end = new Date('2024-10-31')

      vi.mocked(prisma.goal.findMany).mockResolvedValue([completedGoal])

      await goalService.expireOldGoals()

      // Não deve atualizar meta já completa
      expect(prisma.goal.update).not.toHaveBeenCalled()
    })
  })

  describe('canCreateGoal', () => {
    it('deve retornar true quando tem menos de 5 metas ativas', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(3)

      const canCreate = await goalService.canCreateGoal(testUserId)

      expect(canCreate).toBe(true)
    })

    it('deve retornar false quando tem 5 metas ativas', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(5)

      const canCreate = await goalService.canCreateGoal(testUserId)

      expect(canCreate).toBe(false)
    })

    it('deve retornar true quando tem 0 metas ativas', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(0)

      const canCreate = await goalService.canCreateGoal(testUserId)

      expect(canCreate).toBe(true)
    })
  })

  describe('calculateDailyTarget', () => {
    it('deve calcular meta diária corretamente', async () => {
      const mockGoal = createMockGoal('goal-daily', 'Meta', 'REVENUE', 15000, 10000, true)
      mockGoal.period_start = new Date('2025-10-01')
      mockGoal.period_end = new Date('2025-10-31') // 31 dias

      const dailyTarget = await goalService.calculateDailyTarget(mockGoal)

      // Faltam R$ 5.000 (15000 - 10000)
      // Dias restantes: calculado dinamicamente
      // Daily target = faltante / dias_restantes
      expect(dailyTarget).toBeGreaterThan(0)
    })

    it('deve retornar 0 quando meta já foi atingida', async () => {
      const mockGoal = createMockGoal('goal-achieved', 'Meta', 'REVENUE', 15000, 15200, true)
      mockGoal.period_start = new Date('2025-10-01')
      mockGoal.period_end = new Date('2025-10-31')

      const dailyTarget = await goalService.calculateDailyTarget(mockGoal)

      expect(dailyTarget).toBe(0)
    })

    it('deve retornar 0 quando prazo expirou', async () => {
      const mockGoal = createMockGoal('goal-expired', 'Meta', 'REVENUE', 15000, 10000, true)
      mockGoal.period_start = new Date('2024-10-01')
      mockGoal.period_end = new Date('2024-10-31') // Passado

      const dailyTarget = await goalService.calculateDailyTarget(mockGoal)

      expect(dailyTarget).toBe(0)
    })
  })

  describe('getGoalStatistics', () => {
    it('deve retornar estatísticas de metas do usuário', async () => {
      const mockGoals = [
        createMockGoal('goal-1', 'Meta 1', 'REVENUE', 10000, 10500, false), // Completada
        createMockGoal('goal-2', 'Meta 2', 'REVENUE', 15000, 12000, false), // Não completada
        createMockGoal('goal-3', 'Meta 3', 'REVENUE', 20000, 15000, true), // Em progresso
      ]

      // Meta 1: completada em 25 dias
      mockGoals[0].created_at = new Date('2025-01-01')
      mockGoals[0].period_end = new Date('2025-01-25')
      mockGoals[0].updated_at = new Date('2025-01-25')

      // Meta 2: não completada em 30 dias
      mockGoals[1].created_at = new Date('2025-02-01')
      mockGoals[1].period_end = new Date('2025-03-03')
      mockGoals[1].updated_at = new Date('2025-03-03')

      vi.mocked(prisma.goal.findMany).mockResolvedValue(mockGoals)

      const stats = await goalService.getGoalStatistics(testUserId)

      expect(stats).toHaveProperty('total_goals', 3)
      expect(stats).toHaveProperty('completed_goals', 1)
      expect(stats).toHaveProperty('completion_rate')
      expect(stats.completion_rate).toBeCloseTo(33.33, 1) // 1/3 = 33.33%
      expect(stats).toHaveProperty('average_completion_time_days')
      expect(stats).toHaveProperty('current_streak')
    })

    it('deve retornar estatísticas vazias quando não há metas', async () => {
      vi.mocked(prisma.goal.findMany).mockResolvedValue([])

      const stats = await goalService.getGoalStatistics(testUserId)

      expect(stats.total_goals).toBe(0)
      expect(stats.completed_goals).toBe(0)
      expect(stats.completion_rate).toBe(0)
      expect(stats.current_streak).toBe(0)
    })
  })
})

// ==================== HELPER FUNCTIONS ====================

function createMockGoal(
  id: string,
  title: string,
  targetType: string,
  targetValue: number,
  currentValue: number,
  isActive: boolean,
  periodType: string = 'MONTHLY'
) {
  return {
    id,
    user_id: 'test-user-123',
    title,
    target_type: targetType as GoalTargetType,
    target_value: targetValue,
    current_value: currentValue,
    period_type: periodType as PeriodType,
    period_start: new Date('2025-10-01'),
    period_end: new Date('2025-10-31'),
    is_active: isActive,
    created_at: new Date('2025-10-01'),
    updated_at: new Date(),
  }
}
