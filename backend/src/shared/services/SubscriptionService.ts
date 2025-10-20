// src/shared/services/SubscriptionService.ts
// Referência: tasks.md Task 2.2, plan.md Jornada 1, user-stories.md Story 1.1

import type { PrismaClient } from '@prisma/client'

export interface TrialStatus {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELED'
  trial_ends_at: Date | null
  days_remaining: number | null
  is_active: boolean
  needs_upgrade: boolean
  warning_message: string | undefined
}

export interface SubscriptionInfo {
  user_id: string
  subscription_status: string
  trial_ends_at: Date | null
  plan_id: string | null
  is_active: boolean
  created_at: Date
}

export class SubscriptionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get detailed trial/subscription status for user
   * Referência: user-stories.md Story 1.1, plan.md Jornada 1 Fase 6
   */
  async getTrialStatus(userId: string): Promise<TrialStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_status: true,
        trial_ends_at: true,
        is_active: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const now = new Date()
    const daysRemaining = user.trial_ends_at
      ? Math.ceil((user.trial_ends_at.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null

    // Determine status and messages
    let status: TrialStatus['status']
    let needsUpgrade = false
    let warningMessage: string | undefined

    switch (user.subscription_status) {
      case 'TRIAL':
        if (user.trial_ends_at && user.trial_ends_at < now) {
          status = 'EXPIRED'
          needsUpgrade = true
          warningMessage = 'Your 7-day trial has expired. Upgrade to continue using Flowzz.'
        } else {
          status = 'TRIAL'
          if (daysRemaining !== null && daysRemaining <= 2) {
            warningMessage = `Your trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Upgrade now to continue.`
          }
        }
        break

      case 'ACTIVE':
        status = 'ACTIVE'
        break

      case 'CANCELED':
      case 'PAST_DUE':
      case 'UNPAID':
        status = 'CANCELED'
        needsUpgrade = true
        warningMessage = 'Your subscription is inactive. Please update your payment to continue.'
        break

      default:
        status = 'EXPIRED'
        needsUpgrade = true
        warningMessage = 'Please activate a subscription to access Flowzz features.'
    }

    return {
      status,
      trial_ends_at: user.trial_ends_at,
      days_remaining: daysRemaining,
      is_active: user.is_active,
      needs_upgrade: needsUpgrade,
      warning_message: warningMessage,
    }
  }

  /**
   * Get full subscription information
   * Referência: design.md User Management, tasks.md Task 2.2
   */
  async getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscription_status: true,
        trial_ends_at: true,
        plan_id: true,
        is_active: true,
        created_at: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      user_id: user.id,
      subscription_status: user.subscription_status,
      trial_ends_at: user.trial_ends_at,
      plan_id: user.plan_id,
      is_active: user.is_active,
      created_at: user.created_at,
    }
  }

  /**
   * Check if user can access premium features
   * Referência: plan.md Personas - Different plan limitations
   */
  async canAccessPremiumFeatures(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_status: true,
        trial_ends_at: true,
        is_active: true,
        plan: {
          select: {
            name: true,
            features: true,
          },
        },
      },
    })

    if (!user || !user.is_active) {
      return false
    }

    // During trial, all features are available
    if (user.subscription_status === 'TRIAL') {
      const now = new Date()
      return user.trial_ends_at ? user.trial_ends_at > now : false
    }

    // For paid subscriptions, check plan features
    return user.subscription_status === 'ACTIVE'
  }

  /**
   * Extend trial period (admin only)
   * Referência: plan.md Admin functionality
   */
  async extendTrial(userId: string, additionalDays: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trial_ends_at: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentTrialEnd = user.trial_ends_at || new Date()
    const newTrialEnd = new Date(currentTrialEnd.getTime() + additionalDays * 24 * 60 * 60 * 1000)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        trial_ends_at: newTrialEnd,
        subscription_status: 'TRIAL',
      },
    })
  }

  /**
   * Activate paid subscription
   * Referência: user-stories.md Story 1.1 conversion, plan.md Jornada 1 Fase 6
   */
  async activateSubscription(userId: string, planId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscription_status: 'ACTIVE',
        plan_id: planId,
        trial_ends_at: null, // Clear trial when activating paid subscription
      },
    })

    // Create subscription record for history
    const currentPeriodStart = new Date()
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    await this.prisma.subscription.create({
      data: {
        user_id: userId,
        plan_id: planId,
        status: 'ACTIVE',
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
      },
    })
  }
}
