// src/shared/middlewares/rateLimiter.ts
// Referência: tasks.md Task 12.2, design.md - Security - Rate Limiting

import type { Request } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

/**
 * Global rate limiter - 100 requests/minute per IP
 * Referência: tasks.md Task 12.2.1
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  keyGenerator: (req: Request) => {
    return ipKeyGenerator(req.ip || req.connection?.remoteAddress || '127.0.0.1')
  },
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the 100 requests in 1 minute limit!',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Authenticated user rate limiter - 1000 requests/hour
 * Referência: tasks.md Task 12.2.1
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  keyGenerator: (req: Request) => {
    // Only use userId, never fallback to IP to avoid IPv6 issues
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the 1000 requests per hour limit!',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

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
})

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
})

/**
 * Integration sync rate limiter - 10 syncs per hour per user
 * Referência: tasks.md Task 12.2.2
 */
export const integrationSyncRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 sync requests per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many Requests',
    message: 'Too many sync requests, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Report generation rate limiter - 20 reports per hour per user
 * To prevent abuse of resource-intensive operations
 */
export const reportGenerationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 report generations per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many Requests',
    message: 'Too many report generation requests, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Admin actions rate limiter - 100 actions per hour per admin
 * For sensitive admin operations
 */
export const adminActionsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 admin actions per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many Requests',
    message: 'Too many admin actions, please slow down.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * WhatsApp API rate limiter - 100 messages per hour per user
 * WhatsApp Business API has its own rate limits, this is for user-level throttling
 * Referência: WhatsApp Business API rate limits (250 messages/day, but we limit to 100/hour for safety)
 */
export const whatsAppRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 WhatsApp messages per hour per user
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many WhatsApp Messages',
    message: 'You have exceeded the 100 WhatsApp messages per hour limit. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * WhatsApp webhook rate limiter - 1000 webhooks per hour per business account
 * To prevent webhook spam attacks, but allow legitimate high-volume businesses
 */
export const whatsAppWebhookRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 webhooks per hour
  keyGenerator: (req: Request) => {
    // Use business_account_id from webhook payload if available
    const body = req.body as any
    const businessId = body?.entry?.[0]?.id
    if (businessId) return businessId
    // Fallback to IP with proper IPv6 handling
    return ipKeyGenerator(req.ip || req.connection?.remoteAddress || '127.0.0.1')
  },
  message: {
    error: 'Too Many Webhooks',
    message: 'Too many webhook requests detected.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for successful requests (200) to allow legitimate traffic
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests (4xx) to allow error handling
  skipFailedRequests: false,
})

/**
 * Reports rate limiter - 50 report generations per hour per user
 * Reports are expensive operations, limit to prevent abuse
 */
export const reportsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 report generations per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many Reports',
    message: 'You have exceeded the 50 report generations per hour limit!',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Client listings rate limiter - 200 requests per hour per user
 * Client data is cached, but still limit to prevent excessive API calls
 */
export const clientListingsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 client listing requests per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many Client Requests',
    message: 'You have exceeded the 200 client listing requests per hour limit!',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Dashboard rate limiter - 300 requests per hour per user
 * Dashboard data is cached, but limit to prevent excessive load
 */
export const dashboardRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300, // 300 dashboard requests per hour
  keyGenerator: (req: Request) => {
    return req.user?.userId || 'anonymous'
  },
  message: {
    error: 'Too Many Dashboard Requests',
    message: 'You have exceeded the 300 dashboard requests per hour limit!',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
