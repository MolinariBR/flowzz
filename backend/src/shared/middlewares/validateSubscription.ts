// src/shared/middlewares/validateSubscription.ts
// Referência: tasks.md Task 2.2.3, user-journeys.md Jornada 1, design.md Authorization

import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * Middleware to validate if user has active trial or subscription
 * Referência: tasks.md Task 2.2.3, plan.md Jornada 1 Fase 6
 */
export const validateSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verify user is authenticated (should run after authenticate middleware)
    if (!req.user?.userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
      return;
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        subscription_status: true,
        trial_ends_at: true,
        is_active: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
      return;
    }

    // Check if user account is active
    if (!user.is_active) {
      res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Contact support.',
      });
      return;
    }

    // Check subscription status
    const now = new Date();

    switch (user.subscription_status) {
    case 'ACTIVE':
      // User has active paid subscription
      next();
      return;

    case 'TRIAL':
      // Check if trial has expired
      if (user.trial_ends_at && user.trial_ends_at < now) {
        res.status(402).json({
          error: 'Trial expired',
          message: 'Your 7-day trial has expired. Please upgrade to continue using Flowzz.',
          trial_ended_at: user.trial_ends_at.toISOString(),
          upgrade_url: '/upgrade',
        });
        return;
      }

      // Trial is still active
      next();
      return;

    case 'CANCELED':
    case 'UNPAID':
    case 'PAST_DUE':
      res.status(402).json({
        error: 'Payment required',
        message: 'Your subscription is inactive. Please update your payment method to continue.',
        status: user.subscription_status.toLowerCase(),
        upgrade_url: '/billing',
      });
      return;

    default:
      res.status(402).json({
        error: 'Subscription required',
        message: 'Please activate a subscription to access this feature.',
        upgrade_url: '/upgrade',
      });
      return;
    }
  } catch (error) {
    console.error('Subscription validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate subscription status',
    });
  }
};

/**
 * Middleware variant that allows trial users but warns about expiration
 * Useful for non-critical features during trial period
 */
export const validateSubscriptionWithWarning = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        subscription_status: true,
        trial_ends_at: true,
        is_active: true,
      },
    });

    if (!user || !user.is_active) {
      res.status(403).json({
        error: 'Account inactive',
        message: 'Your account is not active',
      });
      return;
    }

    // Add subscription info to response headers for frontend awareness
    if (user.subscription_status === 'TRIAL' && user.trial_ends_at) {
      const daysLeft = Math.ceil((user.trial_ends_at.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      res.setHeader('X-Trial-Days-Left', daysLeft.toString());
      res.setHeader('X-Trial-Ends-At', user.trial_ends_at.toISOString());

      if (daysLeft <= 2) {
        res.setHeader('X-Trial-Warning', 'true');
      }
    }

    res.setHeader('X-Subscription-Status', user.subscription_status);
    next();
  } catch (error) {
    console.error('Subscription validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate subscription status',
    });
  }
};