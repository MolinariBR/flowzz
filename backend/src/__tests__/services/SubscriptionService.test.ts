// src/__tests__/services/SubscriptionService.test.ts
// Referência: tasks.md Task 2.2, design.md Testing Strategy

import type { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubscriptionService } from '../../shared/services/SubscriptionService'

// Mock do Prisma
const mockPrisma: {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  subscription: {
    create: ReturnType<typeof vi.fn>
  }
} = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    create: vi.fn(),
  },
}

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService

  beforeEach(() => {
    vi.clearAllMocks()
    subscriptionService = new SubscriptionService(mockPrisma as unknown as PrismaClient)
  })

  describe('getTrialStatus', () => {
    it('deve retornar status TRIAL para usuário em trial ativo', async () => {
      // Arrange
      const userId = 'user-123'
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'TRIAL',
        trial_ends_at: futureDate,
        is_active: true,
      })

      // Act
      const result = await subscriptionService.getTrialStatus(userId)

      // Assert
      expect(result.status).toBe('TRIAL')
      expect(result.days_remaining).toBe(3)
      expect(result.is_active).toBe(true)
      expect(result.needs_upgrade).toBe(false)
      expect(result.warning_message).toBeUndefined()
    })

    it('deve retornar warning para trial próximo do fim', async () => {
      // Arrange
      const userId = 'user-123'
      const soonDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'TRIAL',
        trial_ends_at: soonDate,
        is_active: true,
      })

      // Act
      const result = await subscriptionService.getTrialStatus(userId)

      // Assert
      expect(result.status).toBe('TRIAL')
      expect(result.days_remaining).toBe(1)
      expect(result.warning_message).toContain('trial expires in 1 day')
    })

    it('deve retornar status EXPIRED para trial expirado', async () => {
      // Arrange
      const userId = 'user-123'
      const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'TRIAL',
        trial_ends_at: pastDate,
        is_active: true,
      })

      // Act
      const result = await subscriptionService.getTrialStatus(userId)

      // Assert
      expect(result.status).toBe('EXPIRED')
      expect(result.needs_upgrade).toBe(true)
      expect(result.warning_message).toContain('trial has expired')
    })

    it('deve retornar status ACTIVE para assinatura ativa', async () => {
      // Arrange
      const userId = 'user-123'

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'ACTIVE',
        trial_ends_at: null,
        is_active: true,
      })

      // Act
      const result = await subscriptionService.getTrialStatus(userId)

      // Assert
      expect(result.status).toBe('ACTIVE')
      expect(result.days_remaining).toBeNull()
      expect(result.needs_upgrade).toBe(false)
      expect(result.warning_message).toBeUndefined()
    })

    it('deve retornar status CANCELED para assinatura cancelada', async () => {
      // Arrange
      const userId = 'user-123'

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'CANCELED',
        trial_ends_at: null,
        is_active: true,
      })

      // Act
      const result = await subscriptionService.getTrialStatus(userId)

      // Assert
      expect(result.status).toBe('CANCELED')
      expect(result.needs_upgrade).toBe(true)
      expect(result.warning_message).toContain('subscription is inactive')
    })

    it('deve lançar erro quando usuário não existe', async () => {
      // Arrange
      const userId = 'nonexistent-user'
      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(subscriptionService.getTrialStatus(userId)).rejects.toThrow('User not found')
    })
  })

  describe('canAccessPremiumFeatures', () => {
    it('deve permitir acesso durante trial ativo', async () => {
      // Arrange
      const userId = 'user-123'
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'TRIAL',
        trial_ends_at: futureDate,
        is_active: true,
        plan: null,
      })

      // Act
      const result = await subscriptionService.canAccessPremiumFeatures(userId)

      // Assert
      expect(result).toBe(true)
    })

    it('deve negar acesso para trial expirado', async () => {
      // Arrange
      const userId = 'user-123'
      const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'TRIAL',
        trial_ends_at: pastDate,
        is_active: true,
        plan: null,
      })

      // Act
      const result = await subscriptionService.canAccessPremiumFeatures(userId)

      // Assert
      expect(result).toBe(false)
    })

    it('deve permitir acesso para assinatura ativa', async () => {
      // Arrange
      const userId = 'user-123'

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'ACTIVE',
        trial_ends_at: null,
        is_active: true,
        plan: {
          name: 'Pro',
          features: ['analytics', 'reports'],
        },
      })

      // Act
      const result = await subscriptionService.canAccessPremiumFeatures(userId)

      // Assert
      expect(result).toBe(true)
    })

    it('deve negar acesso para usuário inativo', async () => {
      // Arrange
      const userId = 'user-123'

      mockPrisma.user.findUnique.mockResolvedValue({
        subscription_status: 'ACTIVE',
        trial_ends_at: null,
        is_active: false,
        plan: null,
      })

      // Act
      const result = await subscriptionService.canAccessPremiumFeatures(userId)

      // Assert
      expect(result).toBe(false)
    })

    it('deve negar acesso quando usuário não existe', async () => {
      // Arrange
      const userId = 'nonexistent-user'
      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act
      const result = await subscriptionService.canAccessPremiumFeatures(userId)

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('extendTrial', () => {
    it('deve estender trial por dias adicionais', async () => {
      // Arrange
      const userId = 'user-123'
      const currentTrialEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      const additionalDays = 3

      mockPrisma.user.findUnique.mockResolvedValue({
        trial_ends_at: currentTrialEnd,
      })

      // Act
      await subscriptionService.extendTrial(userId, additionalDays)

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          trial_ends_at: expect.any(Date),
          subscription_status: 'TRIAL',
        },
      })
    })

    it('deve lançar erro quando usuário não existe', async () => {
      // Arrange
      const userId = 'nonexistent-user'
      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(subscriptionService.extendTrial(userId, 3)).rejects.toThrow('User not found')
    })
  })

  describe('activateSubscription', () => {
    it('deve ativar assinatura paga e limpar trial', async () => {
      // Arrange
      const userId = 'user-123'
      const planId = 'plan-pro'

      mockPrisma.user.update.mockResolvedValue({})
      mockPrisma.subscription.create.mockResolvedValue({})

      // Act
      await subscriptionService.activateSubscription(userId, planId)

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          subscription_status: 'ACTIVE',
          plan_id: planId,
          trial_ends_at: null,
        },
      })

      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          plan_id: planId,
          status: 'ACTIVE',
          current_period_start: expect.any(Date),
          current_period_end: expect.any(Date),
        },
      })
    })
  })
})
