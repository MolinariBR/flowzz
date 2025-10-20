// src/routes/admin.routes.ts
// Referência: tasks.md Task 11, design.md Admin Panel

import { Router } from 'express'
import {
  getAdminMetrics,
  getAuditLogs,
  getUserDetails,
  getUserGrowthMetrics,
  getUserStats,
  getWhatsAppConfig,
  impersonateUser,
  listUsers,
  reactivateUser,
  saveWhatsAppConfig,
  suspendUser,
  testWhatsAppConnection,
  updateUser,
} from '../controllers/AdminController'
import { authenticate, requireAdmin, requireSuperAdmin } from '../shared/middlewares/authenticate'
import { adminActionsRateLimiter } from '../shared/middlewares/rateLimiter'

const router = Router()

/**
 * Admin routes - Protected by RBAC middleware
 * All routes require authentication + ADMIN or SUPER_ADMIN role
 */

// Apply authentication and rate limiting to all admin routes
router.use(authenticate)
router.use(adminActionsRateLimiter)

// ==================== MÉTRICAS SAAS ====================
// GET /admin/metrics - SaaS metrics (MRR, ARR, churn, LTV, CAC)
router.get('/metrics', requireAdmin, getAdminMetrics)

// GET /admin/users/growth - User growth metrics
router.get('/users/growth', requireAdmin, getUserGrowthMetrics)

// GET /admin/stats - User statistics
router.get('/stats', requireAdmin, getUserStats)

// ==================== GESTÃO DE USUÁRIOS ====================
// GET /admin/users - List users with pagination and filters
router.get('/users', requireAdmin, listUsers)

// GET /admin/users/:id - Get user details
router.get('/users/:id', requireAdmin, getUserDetails)

// PUT /admin/users/:id - Update user
router.put('/users/:id', requireAdmin, updateUser)

// POST /admin/users/:id/suspend - Suspend user
router.post('/users/:id/suspend', requireAdmin, suspendUser)

// POST /admin/users/:id/reactivate - Reactivate user
router.post('/users/:id/reactivate', requireAdmin, reactivateUser)

// POST /admin/users/:id/impersonate - Impersonate user (SUPER_ADMIN only)
router.post('/users/:id/impersonate', requireSuperAdmin, impersonateUser)

// ==================== AUDIT LOGS ====================
// GET /admin/audit-logs - View audit logs
router.get('/audit-logs', requireAdmin, getAuditLogs)

// ==================== WHATSAPP CONFIG ====================
// GET /admin/whatsapp/config - Get WhatsApp configuration
router.get('/whatsapp/config', requireAdmin, getWhatsAppConfig)

// POST /admin/whatsapp/config - Save WhatsApp configuration
router.post('/whatsapp/config', requireAdmin, saveWhatsAppConfig)

// POST /admin/whatsapp/test-connection - Test WhatsApp connection
router.post('/whatsapp/test-connection', requireAdmin, testWhatsAppConnection)

export default router
