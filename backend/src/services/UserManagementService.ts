// src/services/UserManagementService.ts
// Referência: tasks.md Task 11.2, design.md Admin Panel, user-stories.md Admin Management

import type { Role, User } from '@prisma/client'
import { prisma } from '../shared/config/database'

export interface UserListFilters {
  search?: string
  plan?: string
  status?: 'active' | 'inactive' | 'suspended'
  role?: Role
  subscription_status?: string
}

export interface PaginatedUsers {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateUserData {
  nome?: string
  email?: string
  role?: Role
  plan_id?: string | undefined
  is_active?: boolean
  subscription_status?: string
}

export interface AuditLogData {
  admin_id: string
  action: string
  target_user_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export interface ImpersonationToken {
  token: string
  expires_at: Date
  user_id: string
}

export class UserManagementService {
  /**
   * Lista usuários com paginação e filtros
   * Referência: tasks.md Task 11.2.1
   */
  async listUsers(
    filters: UserListFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedUsers> {
    // Validar paginação
    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 20

    const skip = (page - 1) * limit

    // Construir where clause
    const where: any = {}

    if (filters.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.plan) {
      where.plan_id = filters.plan
    }

    if (filters.role) {
      where.role = filters.role
    }

    if (filters.subscription_status) {
      where.subscription_status = filters.subscription_status
    }

    if (filters.status === 'active') {
      where.is_active = true
    } else if (filters.status === 'inactive') {
      where.is_active = false
    } else if (filters.status === 'suspended') {
      where.is_active = false
    }

    // Buscar usuários e total
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          plan: true,
          subscriptions: {
            take: 1,
            orderBy: { created_at: 'desc' },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
        subscriptions: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        clients: { take: 5 },
        sales: { take: 5 },
        integrations: true,
      },
    })
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        plan: true,
        subscriptions: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    })
  }

  /**
   * Atualiza dados de usuário (admin)
   * Referência: tasks.md Task 11.2.1
   */
  async updateUser(
    userId: string,
    data: UpdateUserData,
    adminId: string,
    auditData?: Pick<AuditLogData, 'ip_address' | 'user_agent'>
  ): Promise<User> {
    // Filtrar campos undefined para compatibilidade com Prisma
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    )

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { plan: true },
    })

    // Registrar no audit log
    await this.createAuditLog({
      admin_id: adminId,
      action: 'update',
      target_user_id: userId,
      details: { updated_fields: Object.keys(data), data },
      ...auditData,
    })

    return user
  }

  /**
   * Suspende usuário (bloqueia login imediatamente)
   * Referência: tasks.md Task 11.2.1
   */
  async suspendUser(
    userId: string,
    reason: string,
    adminId: string,
    auditData?: Pick<AuditLogData, 'ip_address' | 'user_agent'>
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    })

    // Invalidar todos os refresh tokens do usuário
    await prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    })

    // Registrar no audit log
    await this.createAuditLog({
      admin_id: adminId,
      action: 'suspend',
      target_user_id: userId,
      details: { reason },
      ...auditData,
    })

    return user
  }

  /**
   * Reativa usuário suspenso
   * Referência: tasks.md Task 11.2.1
   */
  async reactivateUser(
    userId: string,
    adminId: string,
    auditData?: Pick<AuditLogData, 'ip_address' | 'user_agent'>
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        is_active: true,
        updated_at: new Date(),
      },
    })

    // Registrar no audit log
    await this.createAuditLog({
      admin_id: adminId,
      action: 'reactivate',
      target_user_id: userId,
      details: {},
      ...auditData,
    })

    return user
  }

  /**
   * Gera token de impersonação (admin como usuário)
   * Referência: tasks.md Task 11.2.2, design.md Admin Impersonation
   */
  async impersonateUser(
    userId: string,
    adminId: string,
    auditData?: Pick<AuditLogData, 'ip_address' | 'user_agent'>
  ): Promise<ImpersonationToken> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.is_active) {
      throw new Error('Cannot impersonate inactive user')
    }

    // Gerar token temporário (exp: 1h)
    const jwt = require('jsonwebtoken')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        impersonated: true,
        impersonator_id: adminId,
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      process.env.JWT_SECRET || 'your-secret-key'
    )

    // Registrar no audit log
    await this.createAuditLog({
      admin_id: adminId,
      action: 'impersonate',
      target_user_id: userId,
      details: { expires_at: expiresAt },
      ...auditData,
    })

    return {
      token,
      expires_at: expiresAt,
      user_id: userId,
    }
  }

  /**
   * Deleta usuário permanentemente (uso com cuidado)
   */
  async deleteUser(
    userId: string,
    adminId: string,
    auditData?: Pick<AuditLogData, 'ip_address' | 'user_agent'>
  ): Promise<void> {
    // Registrar no audit log ANTES de deletar
    await this.createAuditLog({
      admin_id: adminId,
      action: 'delete',
      target_user_id: userId,
      details: { permanent: true },
      ...auditData,
    })

    // Deletar usuário (cascade deleta relacionados)
    await prisma.user.delete({
      where: { id: userId },
    })
  }

  /**
   * Cria registro no audit log
   * Referência: tasks.md Task 11.2.3
   */
  async createAuditLog(data: AuditLogData): Promise<void> {
    await prisma.auditLog.create({
      data: {
        admin_id: data.admin_id,
        action: data.action,
        target_user_id: data.target_user_id,
        details: data.details || {},
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      },
    })
  }

  /**
   * Lista audit logs (últimos 90 dias)
   * Referência: tasks.md Task 11.2.3
   */
  async getAuditLogs(
    filters: {
      admin_id?: string
      target_user_id?: string
      action?: string
      page?: number
      limit?: number
    } = {}
  ): Promise<{
    logs: any[]
    total: number
    page: number
    limit: number
  }> {
    const page = filters.page || 1
    const limit = filters.limit || 50
    const skip = (page - 1) * limit

    // 90 dias atrás
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const where: any = {
      created_at: { gte: ninetyDaysAgo },
    }

    if (filters.admin_id) {
      where.admin_id = filters.admin_id
    }

    if (filters.target_user_id) {
      where.target_user_id = filters.target_user_id
    }

    if (filters.action) {
      where.action = filters.action
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          admin: {
            select: { id: true, nome: true, email: true, role: true },
          },
          target_user: {
            select: { id: true, nome: true, email: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ])

    return {
      logs,
      total,
      page,
      limit,
    }
  }

  /**
   * Obtém estatísticas de usuários para admin dashboard
   */
  async getUserStats(): Promise<{
    total: number
    active: number
    suspended: number
    trial: number
    paid: number
    newThisMonth: number
  }> {
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const [total, active, suspended, trial, paid, newThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.user.count({ where: { is_active: false } }),
      prisma.user.count({ where: { subscription_status: 'TRIAL' } }),
      prisma.user.count({ where: { subscription_status: 'ACTIVE' } }),
      prisma.user.count({
        where: {
          created_at: { gte: firstDayOfMonth },
        },
      }),
    ])

    return {
      total,
      active,
      suspended,
      trial,
      paid,
      newThisMonth,
    }
  }
}
