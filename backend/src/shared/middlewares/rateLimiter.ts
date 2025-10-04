// src/shared/middlewares/rateLimiter.ts
// Referência: tasks.md Task 12.2, design.md - Security - Rate Limiting

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Global rate limiter - 100 requests/minute per IP
 * Referência: tasks.md Task 12.2.1
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the 100 requests in 1 minute limit!',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authenticated user rate limiter - 1000 requests/hour
 * Referência: tasks.md Task 12.2.1
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  keyGenerator: (req: Request) => {
    // Only use userId, never fallback to IP to avoid IPv6 issues
    return req.user?.userId || 'anonymous';
  },
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the 1000 requests per hour limit!',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login rate limiter - 5 attempts per 15 minutes (prevent brute force)
 * Referência: tasks.md Task 12.2.2
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  skipSuccessfulRequests: true,
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Register rate limiter - 3 registrations per hour per IP
 * Referência: tasks.md Task 12.2.2
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    error: 'Too Many Requests',
    message: 'Too many registration attempts from this IP, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Integration sync rate limiter - 10 syncs per hour per user
 * Referência: tasks.md Task 12.2.2
 */
export const integrationSyncRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 sync requests per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous';
  },
  message: {
    error: 'Too Many Requests',
    message: 'Too many sync requests, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Report generation rate limiter - 20 reports per hour per user
 * To prevent abuse of resource-intensive operations
 */
export const reportGenerationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 report generations per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous';
  },
  message: {
    error: 'Too Many Requests',
    message: 'Too many report generation requests, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin actions rate limiter - 100 actions per hour per admin
 * For sensitive admin operations
 */
export const adminActionsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 admin actions per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous';
  },
  message: {
    error: 'Too Many Requests',
    message: 'Too many admin actions, please slow down.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
