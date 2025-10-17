// src/controllers/AdminController.ts
// Referência: tasks.md Task 11, design.md Admin Panel

import type { Request, Response } from 'express'
import { AdminService } from '../services/AdminService'
import { UserManagementService } from '../services/UserManagementService'

const adminService = new AdminService()
const userManagementService = new UserManagementService()

/**
 * GET /admin/metrics
 * Retorna métricas SaaS principais (MRR, ARR, churn, LTV, CAC)
 */
export const getAdminMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await adminService.getSaaSMetrics()

    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error fetching admin metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin metrics'
    })
  }
}

/**
 * GET /admin/users/growth
 * Retorna métricas de crescimento de usuários
 */
export const getUserGrowthMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await adminService.getUserGrowthMetrics()

    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error fetching user growth metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user growth metrics'
    })
  }
}

/**
 * GET /admin/users
 * Lista todos os usuários com paginação e filtros
 * Referência: tasks.md Task 11.2.4
 */
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const filters = {
      search: req.query.search as string,
      plan: req.query.plan as string,
      status: req.query.status as 'active' | 'inactive' | 'suspended',
      role: req.query.role as any,
      subscription_status: req.query.subscription_status as string
    }

    const result = await userManagementService.listUsers(filters, page, limit)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error listing users:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to list users'
    })
  }
}

/**
 * GET /admin/users/:id
 * Obtém detalhes completos de um usuário
 * Referência: tasks.md Task 11.2.4
 */
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' })
      return
    }
    const user = await userManagementService.getUserById(userId)

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user details'
    })
  }
}

/**
 * PUT /admin/users/:id
 * Atualiza dados de um usuário
 * Referência: tasks.md Task 11.2.4
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' })
      return
    }
    const adminId = req.user?.userId || ''
    const updateData = req.body

    const user = await userManagementService.updateUser(
      userId,
      updateData,
      adminId,
      {
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      }
    )

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    })
  }
}

/**
 * POST /admin/users/:id/suspend
 * Suspende um usuário (bloqueia login)
 * Referência: tasks.md Task 11.2.4
 */
export const suspendUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' })
      return
    }
    const adminId = req.user?.userId || ''
    const { reason } = req.body

    const user = await userManagementService.suspendUser(
      userId,
      reason || 'No reason provided',
      adminId,
      {
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      }
    )

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user
    })
  } catch (error) {
    console.error('Error suspending user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to suspend user'
    })
  }
}

/**
 * POST /admin/users/:id/reactivate
 * Reativa usuário suspenso
 * Referência: tasks.md Task 11.2.4
 */
export const reactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' })
      return
    }
    const adminId = req.user?.userId || ''

    const user = await userManagementService.reactivateUser(
      userId,
      adminId,
      {
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      }
    )

    res.json({
      success: true,
      message: 'User reactivated successfully',
      data: user
    })
  } catch (error) {
    console.error('Error reactivating user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate user'
    })
  }
}

/**
 * POST /admin/users/:id/impersonate
 * Gera token para admin operar como usuário
 * Referência: tasks.md Task 11.2.2, design.md Admin Impersonation
 */
export const impersonateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' })
      return
    }
    const adminId = req.user?.userId || ''

    const impersonation = await userManagementService.impersonateUser(
      userId,
      adminId,
      {
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      }
    )

    res.json({
      success: true,
      message: 'Impersonation token generated',
      data: impersonation
    })
  } catch (error: any) {
    console.error('Error impersonating user:', error)
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to impersonate user'
    })
  }
}

/**
 * GET /admin/audit-logs
 * Lista audit logs com filtros
 * Referência: tasks.md Task 11.2.3
 */
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      admin_id: req.query.admin_id as string,
      target_user_id: req.query.target_user_id as string,
      action: req.query.action as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50
    }

    const result = await userManagementService.getAuditLogs(filters)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs'
    })
  }
}

/**
 * GET /admin/stats
 * Estatísticas gerais de usuários
 */
export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await userManagementService.getUserStats()

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats'
    })
  }
}

/**
 * GET /admin/whatsapp/config
 * Retorna configuração WhatsApp do usuário atual
 */
export const getWhatsAppConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      })
      return
    }

    const config = await adminService.getWhatsAppConfig(userId)

    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WhatsApp config'
    })
  }
}

/**
 * POST /admin/whatsapp/config
 * Salva configuração WhatsApp do usuário
 */
export const saveWhatsAppConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      })
      return
    }

    const config = req.body
    await adminService.saveWhatsAppConfig(userId, config)

    res.json({
      success: true,
      message: 'Configuração WhatsApp salva com sucesso'
    })
  } catch (error) {
    console.error('Error saving WhatsApp config:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save WhatsApp config'
    })
  }
}

/**
 * POST /admin/whatsapp/test-connection
 * Testa conexão com WhatsApp API
 */
export const testWhatsAppConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      })
      return
    }

    const result = await adminService.testWhatsAppConnection(userId)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error testing WhatsApp connection:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to test WhatsApp connection'
    })
  }
}