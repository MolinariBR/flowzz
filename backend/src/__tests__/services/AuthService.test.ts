// src/__tests__/services/AuthService.test.ts
// Referência: tasks.md Task 2.1.4, design.md Testing Strategy, dev-stories.md Dev Story 1.3

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthService } from '../../shared/services/AuthService'

// Mock das dependências
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  hash: vi.fn(),
  compare: vi.fn(),
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
  sign: vi.fn(),
  verify: vi.fn(),
}))

vi.mock('../../shared/config/env', () => ({
  env: {
    BCRYPT_ROUNDS: 12,
    JWT_SECRET: 'test-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}))

// Import das dependências mockadas
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

// Define User type for tests
type User = {
  id: string
  email: string
  password_hash: string
  nome: string
  role: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

describe('AuthService', () => {
  let authService: AuthService
  let mockPrisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
    }
    refreshToken: {
      findUnique: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
      delete: ReturnType<typeof vi.fn>
      deleteMany: ReturnType<typeof vi.fn>
    }
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Create mock prisma instance
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      refreshToken: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    }

    // AuthService requires a PrismaClient instance
    authService = new AuthService(mockPrisma)
  })

  describe('hashPassword', () => {
    it('deve gerar hash da senha usando bcrypt com rounds configurados', async () => {
      // Arrange
      const password = 'testPassword123'
      const expectedHash = 'hashedPassword123'
      vi.mocked(bcrypt.hash).mockResolvedValue(expectedHash as never)

      // Act
      const result = await authService.hashPassword(password)

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
      expect(result).toBe(expectedHash)
    })

    it('deve propagar erro do bcrypt quando falha', async () => {
      // Arrange
      const password = 'testPassword123'
      const error = new Error('Bcrypt error')
      vi.mocked(bcrypt.hash).mockRejectedValue(error)

      // Act & Assert
      await expect(authService.hashPassword(password)).rejects.toThrow('Bcrypt error')
    })
  })

  describe('comparePassword', () => {
    it('deve retornar true quando senha coincide com hash', async () => {
      // Arrange
      const password = 'testPassword123'
      const hash = 'hashedPassword123'
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      // Act
      const result = await authService.comparePassword(password, hash)

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(true)
    })

    it('deve retornar false quando senha não coincide com hash', async () => {
      // Arrange
      const password = 'wrongPassword'
      const hash = 'hashedPassword123'
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      // Act
      const result = await authService.comparePassword(password, hash)

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(false)
    })
  })

  describe('generateAccessToken', () => {
    it('deve gerar access token com payload correto e expiração de 15min', () => {
      // Arrange
      const userId = 'user-123'
      const role = 'USER'
      const expectedToken = 'generated-access-token'
      vi.mocked(jwt.sign).mockReturnValue(expectedToken as never)

      // Act
      const result = authService.generateAccessToken(userId, role)

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith({ userId, role }, 'test-secret', {
        expiresIn: '15m',
      })
      expect(result).toBe(expectedToken)
    })
  })

  describe('generateRefreshToken', () => {
    it('deve gerar refresh token com expiração de 7 dias', () => {
      // Arrange
      const expectedToken = 'generated-refresh-token'
      vi.mocked(jwt.sign).mockReturnValue(expectedToken as never)

      // Act
      const result = authService.generateRefreshToken()

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith({ type: 'refresh' }, 'test-refresh-secret', {
        expiresIn: '7d',
      })
      expect(result).toBe(expectedToken)
    })
  })

  describe('verifyAccessToken', () => {
    it('deve verificar e retornar payload do access token válido', () => {
      // Arrange
      const token = 'valid-access-token'
      const expectedPayload = { userId: 'user-123', role: 'USER' }
      vi.mocked(jwt.verify).mockReturnValue(expectedPayload as never)

      // Act
      const result = authService.verifyAccessToken(token)

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret')
      expect(result).toEqual(expectedPayload)
    })

    it('deve propagar erro quando token é inválido', () => {
      // Arrange
      const token = 'invalid-token'
      const error = new Error('Invalid token')
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw error
      })

      // Act & Assert
      expect(() => authService.verifyAccessToken(token)).toThrow('Invalid token')
    })

    it('deve propagar erro quando token está expirado', () => {
      // Arrange
      const token = 'expired-token'
      const error = new Error('Token expired')
      error.name = 'TokenExpiredError'
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw error
      })

      // Act & Assert
      expect(() => authService.verifyAccessToken(token)).toThrow('Token expired')
    })
  })

  describe('verifyRefreshToken', () => {
    it('deve verificar e retornar payload do refresh token válido', () => {
      // Arrange
      const token = 'valid-refresh-token'
      const expectedPayload = { type: 'refresh', iat: 1234567890 }
      vi.mocked(jwt.verify).mockReturnValue(expectedPayload as never)

      // Act
      const result = authService.verifyRefreshToken(token)

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-refresh-secret')
      expect(result).toEqual(expectedPayload)
    })

    it('deve propagar erro quando refresh token é inválido', () => {
      // Arrange
      const token = 'invalid-refresh-token'
      const error = new Error('Invalid refresh token')
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw error
      })

      // Act & Assert
      expect(() => authService.verifyRefreshToken(token)).toThrow('Invalid refresh token')
    })
  })

  describe('register', () => {
    it('deve registrar novo usuário com sucesso', async () => {
      // Arrange
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        nome: 'Test User',
      }

      const hashedPassword = 'hashedPassword123'
      const mockUser: User = {
        id: 'user-123',
        email: registerData.email,
        password_hash: hashedPassword,
        nome: registerData.nome,
        role: 'USER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never)
      mockPrisma.user.create.mockResolvedValue(mockUser)
      vi.mocked(jwt.sign)
        .mockReturnValueOnce('access-token' as never)
        .mockReturnValueOnce('refresh-token' as never)
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'refresh-123',
        token: 'refresh-token',
        user_id: 'user-123',
        expires_at: new Date(),
        created_at: new Date(),
      })

      // Act
      const result = await authService.register(registerData)

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 12)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          nome: registerData.nome,
          password_hash: hashedPassword,
          role: 'USER',
          is_active: true,
          subscription_status: 'TRIAL',
          trial_ends_at: expect.any(Date),
        },
      })
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nome: mockUser.nome,
          role: mockUser.role,
          is_active: mockUser.is_active,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          password_hash: mockUser.password_hash,
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      })
    })

    it('deve lançar erro quando usuário já existe', async () => {
      // Arrange
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        nome: 'Existing User',
      }

      const existingUser = {
        id: 'existing-user',
        email: registerData.email,
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      )
      expect(bcrypt.hash).not.toHaveBeenCalled()
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('deve propagar erro quando falha ao criar usuário', async () => {
      // Arrange
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        nome: 'Test User',
      }

      const error = new Error('Database error')
      mockPrisma.user.findUnique.mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never)
      mockPrisma.user.create.mockRejectedValue(error)

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow('Database error')
    })
  })

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockUser: User = {
        id: 'user-123',
        email: loginData.email,
        password_hash: 'hashedPassword123',
        nome: 'Test User',
        role: 'USER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const accessToken = 'access-token'
      const refreshToken = 'refresh-token'

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(jwt.sign)
        .mockReturnValueOnce(accessToken as never)
        .mockReturnValueOnce(refreshToken as never)
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'refresh-123',
        token: refreshToken,
        user_id: mockUser.id,
        expires_at: new Date(),
        created_at: new Date(),
      })

      // Act
      const result = await authService.login(loginData)

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password_hash)
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nome: mockUser.nome,
          role: mockUser.role,
          is_active: mockUser.is_active,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          password_hash: mockUser.password_hash,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      })
    })

    it('deve lançar erro quando usuário não existe', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando conta está suspensa', async () => {
      // Arrange
      const loginData = {
        email: 'suspended@example.com',
        password: 'password123',
      }

      const suspendedUser = {
        id: 'user-123',
        email: loginData.email,
        is_active: false,
      }

      mockPrisma.user.findUnique.mockResolvedValue(suspendedUser)

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Account is suspended')
      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando senha está incorreta', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword',
      }
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password_hash: 'hashedPassword123',
        is_active: true,
      }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('refreshToken', () => {
    it('deve renovar access token com refresh token válido', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token'
      const newAccessToken = 'new-access-token'

      const mockTokenRecord = {
        id: 'refresh-123',
        token: refreshToken,
        user_id: 'user-123',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        created_at: new Date(),
        user: {
          id: 'user-123',
          role: 'USER',
          is_active: true,
        },
      }

      vi.mocked(jwt.verify).mockReturnValue({ type: 'refresh' } as never)
      mockPrisma.refreshToken.findUnique.mockResolvedValue(mockTokenRecord)
      vi.mocked(jwt.sign).mockReturnValue(newAccessToken as never)

      // Act
      const result = await authService.refreshToken(refreshToken)

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, 'test-refresh-secret')
      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
        include: { user: true },
      })
      expect(result).toEqual(newAccessToken)
    })

    it('deve lançar erro quando refresh token não existe no DB', async () => {
      // Arrange
      const refreshToken = 'nonexistent-refresh-token'
      vi.mocked(jwt.verify).mockReturnValue({ type: 'refresh' } as never)
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token')
    })

    it('deve lançar erro e deletar token quando refresh token está expirado', async () => {
      // Arrange
      const refreshToken = 'expired-refresh-token'

      const expiredTokenRecord = {
        id: 'refresh-123',
        token: refreshToken,
        user_id: 'user-123',
        expires_at: new Date(Date.now() - 1000), // Expired 1 second ago
        created_at: new Date(),
        user: {
          id: 'user-123',
          role: 'USER',
          is_active: true,
        },
      }

      vi.mocked(jwt.verify).mockReturnValue({ type: 'refresh' } as never)
      mockPrisma.refreshToken.findUnique.mockResolvedValue(expiredTokenRecord)
      mockPrisma.refreshToken.delete.mockResolvedValue(expiredTokenRecord)

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Refresh token expired')
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: expiredTokenRecord.id },
      })
    })

    it('deve lançar erro quando usuário está suspenso', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token'

      const tokenRecordWithSuspendedUser = {
        id: 'refresh-123',
        token: refreshToken,
        user_id: 'user-123',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        user: {
          id: 'user-123',
          role: 'USER',
          is_active: false,
        },
      }

      vi.mocked(jwt.verify).mockReturnValue({ type: 'refresh' } as never)
      mockPrisma.refreshToken.findUnique.mockResolvedValue(tokenRecordWithSuspendedUser)

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Account is suspended')
    })

    it('deve lançar erro quando JWT é inválido', async () => {
      // Arrange
      const refreshToken = 'invalid-jwt-token'
      const error = new Error('Invalid JWT')
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw error
      })

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token')
    })
  })

  describe('logout', () => {
    it('deve deletar refresh token do banco de dados', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token'

      const deletedCount = { count: 1 }
      mockPrisma.refreshToken.deleteMany.mockResolvedValue(deletedCount)

      // Act
      await authService.logout(refreshToken)

      // Assert
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
      })
    })

    it('deve fazer nada se refresh token não existe', async () => {
      // Arrange
      const refreshToken = 'nonexistent-refresh-token'
      const deletedCount = { count: 0 }
      mockPrisma.refreshToken.deleteMany.mockResolvedValue(deletedCount)

      // Act
      await authService.logout(refreshToken)

      // Assert
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
      })
    })
  })

  describe('getUserById', () => {
    it('deve retornar usuário por ID sem dados sensíveis', async () => {
      // Arrange
      const userId = 'user-123'
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        password_hash: 'hashedPassword123', // Não deve ser retornado
        nome: 'Test User',
        role: 'USER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      // Act
      const result = await authService.getUserById(userId)

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      })
      expect(result).toEqual(mockUser)
    })

    it('deve retornar null quando usuário não existe', async () => {
      // Arrange
      const userId = 'nonexistent-user'
      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act
      const result = await authService.getUserById(userId)

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      })
      expect(result).toBeNull()
    })
  })

  describe('revokeAllTokens', () => {
    it('deve deletar todos os refresh tokens do usuário', async () => {
      // Arrange
      const userId = 'user-123'
      const deletedCount = { count: 3 }

      mockPrisma.refreshToken.deleteMany.mockResolvedValue(deletedCount)

      // Act
      await authService.revokeAllTokens(userId)

      // Assert
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      })
    })

    it('deve funcionar mesmo se usuário não tem tokens', async () => {
      // Arrange
      const userId = 'user-with-no-tokens'
      const deletedCount = { count: 0 }

      mockPrisma.refreshToken.deleteMany.mockResolvedValue(deletedCount)

      // Act
      await authService.revokeAllTokens(userId)

      // Assert
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      })
    })
  })
})
