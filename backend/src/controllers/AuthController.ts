// src/controllers/AuthController.ts
// Referência: tasks.md Task 2.1.3, dev-stories.md Dev Story 1.3, openapi.yaml Auth endpoints

import type { Request, Response } from 'express'
import { prisma } from '../shared/config/database'
import {
  changePasswordSchema,
  type LoginData,
  loginSchema,
  type LogoutData,
  logoutSchema,
  type RefreshTokenData,
  refreshTokenSchema,
  type RegisterData,
  registerSchema,
  updateProfileSchema,
  updateSystemSettingsSchema,
} from '../shared/schemas/auth'
import { AuthService } from '../shared/services/AuthService'
import { SubscriptionService } from '../shared/services/SubscriptionService'
import { logger } from '../shared/utils/logger'

export class AuthController {
  private authService: AuthService
  private subscriptionService: SubscriptionService

  constructor() {
    this.authService = new AuthService(prisma)
    this.subscriptionService = new SubscriptionService(prisma)
  }

  /**
   * POST /auth/register
   * Register a new user
   * Referência: user-stories.md Story 1.1, openapi.yaml /auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body)

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Dados inválidos',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const data: RegisterData = validationResult.data

      // Register user
      const result = await this.authService.register({
        email: data.email,
        password: data.password,
        nome: data.nome,
      })

      logger.info('User registered successfully', {
        userId: result.user.id,
        email: result.user.email,
      })

      // Return user data without password hash
      const { password_hash: _, ...userWithoutPassword } = result.user

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        data: {
          user: userWithoutPassword,
          tokens: result.tokens,
        },
      })
    } catch (error) {
      logger.error('Registration failed', { error, body: req.body })

      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          res.status(409).json({
            error: 'Conflict',
            message: 'Usuário com este email já existe',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * POST /auth/login
   * Login user
   * Referência: design.md Authentication Flow, openapi.yaml /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body)

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Dados inválidos',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const data: LoginData = validationResult.data

      // Login user
      const result = await this.authService.login({
        email: data.email,
        password: data.password,
      })

      logger.info('User logged in successfully', {
        userId: result.user.id,
        email: result.user.email,
      })

      // Return user data without password hash
      const { password_hash: _, ...userWithoutPassword } = result.user

      res.status(200).json({
        message: 'Login realizado com sucesso',
        data: {
          user: userWithoutPassword,
          tokens: result.tokens,
        },
      })
    } catch (error) {
      logger.error('Login failed', { error, email: req.body?.email })

      if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Email ou senha inválidos',
          })
          return
        }

        if (error.message === 'Account is suspended') {
          res.status(403).json({
            error: 'Forbidden',
            message: 'Conta suspensa',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token
   * Referência: design.md Authentication Flow, openapi.yaml /auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = refreshTokenSchema.safeParse(req.body)

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Dados inválidos',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const data: RefreshTokenData = validationResult.data

      // Refresh token
      const newAccessToken = await this.authService.refreshToken(data.refreshToken)

      logger.info('Access token refreshed successfully')

      res.status(200).json({
        message: 'Token renovado com sucesso',
        data: {
          accessToken: newAccessToken,
        },
      })
    } catch (error) {
      logger.error('Token refresh failed', { error })

      if (error instanceof Error) {
        if (
          error.message.includes('Invalid refresh token') ||
          error.message.includes('Refresh token expired') ||
          error.message.includes('Account is suspended')
        ) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Refresh token inválido ou expirado',
          })
          return
        }
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * POST /auth/logout
   * Logout user (invalidate refresh token)
   * Referência: design.md Authentication Flow, openapi.yaml /auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = logoutSchema.safeParse(req.body)

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Dados inválidos',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const data: LogoutData = validationResult.data

      // Logout user
      await this.authService.logout(data.refreshToken)

      logger.info('User logged out successfully')

      res.status(200).json({
        message: 'Logout realizado com sucesso',
      })
    } catch (error) {
      logger.error('Logout failed', { error })

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /auth/me
   * Get current user data
   * Referência: openapi.yaml /auth/me
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token inválido',
        })
        return
      }

      // Get user data from database
      const user = await this.authService.getUserById(req.user.userId)

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Usuário não encontrado',
        })
        return
      }

      if (!user.is_active) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Conta suspensa',
        })
        return
      }

      logger.info('User data retrieved successfully', { userId: user.id })

      // Return user data without password hash
      const { password_hash: _, ...userWithoutPassword } = user

      res.status(200).json({
        message: 'Dados do usuário obtidos com sucesso',
        data: {
          user: userWithoutPassword,
        },
      })
    } catch (error) {
      logger.error('Failed to get user data', {
        error,
        userId: req.user?.userId,
      })

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /auth/trial-status
   * Get trial status for authenticated user
   * Referência: tasks.md Task 2.2, user-stories.md Story 1.1
   */
  async getTrialStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuário não autenticado',
        })
        return
      }

      const trialStatus = await this.subscriptionService.getTrialStatus(req.user.userId)

      res.status(200).json({
        message: 'Status do trial obtido com sucesso',
        data: trialStatus,
      })
    } catch (error) {
      logger.error('Failed to get trial status', {
        error,
        userId: req.user?.userId,
      })

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /auth/subscription
   * Get subscription information for authenticated user
   * Referência: tasks.md Task 2.2, plan.md Subscription management
   */
  async getSubscriptionInfo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuário não autenticado',
        })
        return
      }

      const subscriptionInfo = await this.subscriptionService.getSubscriptionInfo(req.user.userId)

      res.status(200).json({
        message: 'Informações da assinatura obtidas com sucesso',
        data: subscriptionInfo,
      })
    } catch (error) {
      logger.error('Failed to get subscription info', {
        error,
        userId: req.user?.userId,
      })

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /auth/profile
   * Get user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          documento: true,
          endereco: true,
          avatar_url: true,
        },
      })

      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }

      res.json({
        data: user,
        message: 'Perfil obtido com sucesso',
      })
    } catch (error) {
      logger.error('Failed to get profile', { error, userId: req.user?.userId })
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * PUT /auth/profile
   * Update user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      // Validate request body
      const validationResult = updateProfileSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Dados inválidos',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const updateData = validationResult.data

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          documento: true,
          endereco: true,
          avatar_url: true,
        },
      })

      res.json({
        data: updatedUser,
        message: 'Perfil atualizado com sucesso',
      })
    } catch (error) {
      logger.error('Failed to update profile', { error, userId: req.user?.userId })
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /auth/system-settings
   * Get user system settings
   */
  async getSystemSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      // Get or create user settings
      let userSettings = await prisma.userSettings.findUnique({
        where: { user_id: userId },
      })

      if (!userSettings) {
        userSettings = await prisma.userSettings.create({
          data: {
            user_id: userId,
            dark_mode: false,
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            date_format: 'DD/MM/YYYY',
            currency: 'BRL',
          },
        })
      }

      res.json({
        data: {
          dark_mode: userSettings.dark_mode,
          language: userSettings.language,
          timezone: userSettings.timezone,
          date_format: userSettings.date_format,
          currency: userSettings.currency,
        },
        message: 'Configurações obtidas com sucesso',
      })
    } catch (error) {
      logger.error('Failed to get system settings', { error, userId: req.user?.userId })
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * PUT /auth/system-settings
   * Update user system settings
   */
  async updateSystemSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      // Validate request body
      const validationResult = updateSystemSettingsSchema.safeParse(req.body)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Dados inválidos',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const updateData = validationResult.data

      // Upsert user settings (create if not exists, update if exists)
      const userSettings = await prisma.userSettings.upsert({
        where: { user_id: userId },
        update: updateData,
        create: {
          user_id: userId,
          dark_mode: updateData.dark_mode ?? false,
          language: updateData.language ?? 'pt-BR',
          timezone: updateData.timezone ?? 'America/Sao_Paulo',
          date_format: updateData.date_format ?? 'DD/MM/YYYY',
          currency: updateData.currency ?? 'BRL',
        },
      })

      res.json({
        data: {
          dark_mode: userSettings.dark_mode,
          language: userSettings.language,
          timezone: userSettings.timezone,
          date_format: userSettings.date_format,
          currency: userSettings.currency,
        },
        message: 'Configurações atualizadas com sucesso',
      })
    } catch (error) {
      logger.error('Failed to update system settings', { error, userId: req.user?.userId })
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * PUT /auth/security
   * Change user password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = changePasswordSchema.safeParse(req.body)

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Dados inválidos',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }

      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { current_password, new_password } = req.body

      // Get current user to verify password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password_hash: true },
      })

      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }

      // Verify current password
      const bcrypt = await import('bcrypt')
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash)
      if (!isValidPassword) {
        res.status(400).json({
          error: 'Invalid password',
          message: 'Senha atual incorreta',
        })
        return
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 12)

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword },
      })

      res.json({
        message: 'Senha alterada com sucesso',
      })
    } catch (error) {
      logger.error('Failed to change password', { error, userId: req.user?.userId })
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /auth/sessions
   * Get user active sessions
   */
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const sessions = await prisma.refreshToken.findMany({
        where: {
          user_id: userId,
          expires_at: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          created_at: true,
          expires_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      })

      res.json({
        data: sessions.map((session) => ({
          id: session.id,
          user_agent: null,
          ip_address: null,
          device_info: null,
          created_at: session.created_at.toISOString(),
          expires_at: session.expires_at.toISOString(),
        })),
        message: 'Sessões obtidas com sucesso',
      })
    } catch (error) {
      logger.error('Failed to get sessions', { error, userId: req.user?.userId })
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * DELETE /auth/sessions/:id
   * Revoke a session
   */
  async revokeSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const sessionId = req.params.id

      // Verify session belongs to user
      const session = await prisma.refreshToken.findFirst({
        where: {
          id: sessionId,
          user_id: userId,
        },
      })

      if (!session) {
        res.status(404).json({ error: 'Session not found' })
        return
      }

      // Delete session
      await prisma.refreshToken.delete({
        where: { id: sessionId },
      })

      res.json({
        message: 'Sessão revogada com sucesso',
      })
    } catch (error) {
      logger.error('Failed to revoke session', { error, userId: req.user?.userId })
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  }
}
