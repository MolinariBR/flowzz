// src/shared/services/AuthService.ts
// Referência: tasks.md Task 2.1.1, dev-stories.md Dev Story 1.3, design.md Authentication Flow

import type { PrismaClient, User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { AuthPayload, AuthTokens, LoginDTO, RegisterUserDTO } from '../types/auth'

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Hash password using bcrypt with 12 rounds
   * Referência: dev-stories.md - bcrypt rounds: 12
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS)
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate Access Token (exp: 15m)
   * Referência: design.md Authentication Flow
   */
  generateAccessToken(userId: string, role: string, email?: string): string {
    return jwt.sign({ userId, role, email }, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions)
  }

  /**
   * Generate Refresh Token (exp: 7d)
   * Referência: design.md Authentication Flow
   */
  generateRefreshToken(): string {
    return jwt.sign(
      {
        type: 'refresh',
        jti: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    )
  }

  /**
   * Verify Access Token
   */
  verifyAccessToken(token: string): AuthPayload {
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload
  }

  /**
   * Verify Refresh Token
   */
  verifyRefreshToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload
  }

  /**
   * Register new user
   * Referência: user-stories.md Story 1.1, tasks.md Task 2.1.3
   */
  async register(data: RegisterUserDTO): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password)

    // Create user with trial subscription
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        nome: data.nome,
        role: 'USER',
        subscription_status: 'TRIAL',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        is_active: true,
      },
    })

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role, user.email)
    const refreshToken = this.generateRefreshToken()

    // Save refresh token to database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }

  /**
   * Login user
   * Referência: design.md Authentication Flow, dev-stories.md Dev Story 1.3
   */
  async login(data: LoginDTO): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is suspended')
    }

    // Verify password
    const isValidPassword = await this.comparePassword(data.password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role, user.email)
    const refreshToken = this.generateRefreshToken()

    // Save refresh token to database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }

  /**
   * Refresh access token
   * Referência: design.md Authentication Flow
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      // Verify refresh token
      this.verifyRefreshToken(refreshToken)
    } catch {
      throw new Error('Invalid refresh token')
    }

    // Find refresh token in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!tokenRecord) {
      throw new Error('Invalid refresh token')
    }

    // Check if token is expired
    if (tokenRecord.expires_at < new Date()) {
      // Delete expired token
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      })
      throw new Error('Refresh token expired')
    }

    // Check if user is active
    if (!tokenRecord.user.is_active) {
      throw new Error('Account is suspended')
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(
      tokenRecord.user.id,
      tokenRecord.user.role,
      tokenRecord.user.email
    )

    return newAccessToken
  }

  /**
   * Logout user (invalidate refresh token)
   * Referência: design.md Authentication Flow
   */
  async logout(refreshToken: string): Promise<void> {
    // Delete refresh token from database
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    })
  }

  /**
   * Revoke all refresh tokens for a user (useful for logout from all devices)
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    })
  }
}
