// Referência: tasks.md Task 13.1.2, design.md §Repository Pattern Tests
// Testes unitários para ClientRepository: CRUD com mocks do Prisma Client

import type { Client } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientRepository } from '../../repositories/ClientRepository'
import { prisma } from '../../shared/config/database'

// Mock do Prisma Client
vi.mock('../../shared/config/database', () => ({
  prisma: {
    client: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('ClientRepository', () => {
  let clientRepository: ClientRepository
  const mockUserId = 'user-123'
  const mockClient: Client = {
    id: 'client-123',
    name: 'João Silva',
    email: 'joao@test.com',
    phone: '(11) 98765-4321',
    cpf: null,
    address: null,
    city: null,
    state: null,
    cep: null,
    status: 'ACTIVE',
    user_id: mockUserId,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    clientRepository = new ClientRepository()
  })

  describe('findById', () => {
    it('deve retornar cliente quando encontrado', async () => {
      // Arrange
      vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient)

      // Act
      const result = await clientRepository.findById('client-123')

      // Assert
      expect(result).toEqual(mockClient)
      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { id: 'client-123' },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
    })

    it('deve retornar null quando cliente não existe', async () => {
      // Arrange
      vi.mocked(prisma.client.findUnique).mockResolvedValue(null)

      // Act
      const result = await clientRepository.findById('client-999')

      // Assert
      expect(result).toBeNull()
      expect(prisma.client.findUnique).toHaveBeenCalled()
    })
  })

  describe('findByUserId', () => {
    it('deve retornar clientes paginados do usuário', async () => {
      // Arrange
      vi.mocked(prisma.client.findMany).mockResolvedValue([mockClient])
      vi.mocked(prisma.client.count).mockResolvedValue(1)

      // Act
      const result = await clientRepository.findByUserId(mockUserId, undefined, {
        page: 1,
        limit: 20,
      })

      // Assert
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.totalPages).toBe(1)
      expect(prisma.client.findMany).toHaveBeenCalled()
    })

    it('deve aplicar filtro de busca corretamente', async () => {
      // Arrange
      const filters = { search: 'João' }
      vi.mocked(prisma.client.findMany).mockResolvedValue([mockClient])
      vi.mocked(prisma.client.count).mockResolvedValue(1)

      // Act
      await clientRepository.findByUserId(mockUserId, filters, {
        page: 1,
        limit: 20,
      })

      // Assert
      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: mockUserId,
            OR: expect.arrayContaining([
              { name: { contains: 'João', mode: 'insensitive' } },
              { email: { contains: 'João', mode: 'insensitive' } },
              { phone: { contains: 'João', mode: 'insensitive' } },
            ]),
          }),
        })
      )
    })

    it('deve aplicar filtro de status corretamente', async () => {
      // Arrange
      const filters = { status: 'ACTIVE' as const }
      vi.mocked(prisma.client.findMany).mockResolvedValue([mockClient])
      vi.mocked(prisma.client.count).mockResolvedValue(1)

      // Act
      await clientRepository.findByUserId(mockUserId, filters, {
        page: 1,
        limit: 20,
      })

      // Assert
      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: mockUserId,
            status: 'ACTIVE',
          }),
        })
      )
    })

    it('deve calcular paginação corretamente', async () => {
      // Arrange
      vi.mocked(prisma.client.findMany).mockResolvedValue([])
      vi.mocked(prisma.client.count).mockResolvedValue(45)

      // Act
      const result = await clientRepository.findByUserId(mockUserId, undefined, {
        page: 2,
        limit: 20,
      })

      // Assert
      expect(result.totalPages).toBe(3) // 45 / 20 = 2.25 -> 3 páginas
      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (page 2 - 1) * 20 = 20
          take: 20,
        })
      )
    })
  })

  describe('create', () => {
    it('deve criar novo cliente com sucesso', async () => {
      // Arrange
      const createData = {
        name: 'João Silva',
        email: 'joao@test.com',
        phone: '(11) 98765-4321',
        user_id: mockUserId,
      }

      vi.mocked(prisma.client.create).mockResolvedValue(mockClient)

      // Act
      const result = await clientRepository.create(createData)

      // Assert
      expect(result).toEqual(mockClient)
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: createData,
      })
    })

    it('deve criar cliente com tags', async () => {
      // Arrange
      const createData = {
        name: 'João Silva',
        email: 'joao@test.com',
        user_id: mockUserId,
        tags: ['tag-1', 'tag-2'],
      }

      const mockClientWithTags = {
        ...mockClient,
        tags: [
          { tag_id: 'tag-1', tag: { id: 'tag-1', name: 'VIP' } },
          { tag_id: 'tag-2', tag: { id: 'tag-2', name: 'Premium' } },
        ],
      }

      vi.mocked(prisma.client.create).mockResolvedValue(mockClientWithTags as any)

      // Act
      const result = await clientRepository.create(createData)

      // Assert
      expect(result).toBeDefined()
      expect(prisma.client.create).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('deve atualizar cliente com sucesso', async () => {
      // Arrange
      const updateData = { name: 'João Silva Atualizado' }
      const updatedClient = { ...mockClient, name: 'João Silva Atualizado' }

      vi.mocked(prisma.client.update).mockResolvedValue(updatedClient)

      // Act
      const result = await clientRepository.update('client-123', updateData)

      // Assert
      expect(result.name).toBe('João Silva Atualizado')
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-123' },
        data: updateData,
      })
    })

    it('deve atualizar múltiplos campos', async () => {
      // Arrange
      const updateData = {
        name: 'Novo Nome',
        email: 'novo@test.com',
        phone: '(21) 99999-9999',
      }

      const updatedClient = { ...mockClient, ...updateData }
      vi.mocked(prisma.client.update).mockResolvedValue(updatedClient)

      // Act
      const result = await clientRepository.update('client-123', updateData)

      // Assert
      expect(result.name).toBe('Novo Nome')
      expect(result.email).toBe('novo@test.com')
      expect(result.phone).toBe('(21) 99999-9999')
    })
  })

  describe('delete', () => {
    it('deve deletar cliente com sucesso', async () => {
      // Arrange
      vi.mocked(prisma.client.delete).mockResolvedValue(mockClient)

      // Act
      await clientRepository.delete('client-123')

      // Assert
      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: 'client-123' },
      })
    })
  })

  describe('count', () => {
    it('deve contar total de clientes do usuário', async () => {
      // Arrange
      vi.mocked(prisma.client.count).mockResolvedValue(42)

      // Act
      const result = await clientRepository.count(mockUserId)

      // Assert
      expect(result).toBe(42)
      expect(prisma.client.count).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
      })
    })

    it('deve contar com filtros aplicados', async () => {
      // Arrange
      const filters = { status: 'ACTIVE' as const }
      vi.mocked(prisma.client.count).mockResolvedValue(30)

      // Act
      const result = await clientRepository.count(mockUserId, filters)

      // Assert
      expect(result).toBe(30)
      expect(prisma.client.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          user_id: mockUserId,
          status: 'ACTIVE',
        }),
      })
    })
  })

  describe('checkOwnership', () => {
    it('deve retornar true quando usuário é dono do cliente', async () => {
      // Arrange
      vi.mocked(prisma.client.findFirst).mockResolvedValue(mockClient)

      // Act
      const result = await clientRepository.checkOwnership('client-123', mockUserId)

      // Assert
      expect(result).toBe(true)
    })

    it('deve retornar false quando cliente não existe', async () => {
      // Arrange
      vi.mocked(prisma.client.findFirst).mockResolvedValue(null)

      // Act
      const result = await clientRepository.checkOwnership('client-999', mockUserId)

      // Assert
      expect(result).toBe(false)
    })

    it('deve retornar false quando cliente pertence a outro usuário', async () => {
      // Arrange
      const otherUserClient = { ...mockClient, user_id: 'other-user-456' }
      vi.mocked(prisma.client.findFirst).mockResolvedValue(otherUserClient)

      // Act
      const result = await clientRepository.checkOwnership('client-123', mockUserId)

      // Assert
      expect(result).toBe(false)
    })
  })
})
