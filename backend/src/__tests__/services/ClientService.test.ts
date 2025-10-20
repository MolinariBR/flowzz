// Referência: design.md §Testing Strategy, dev-stories.md §Dev Story 2.1
// Atende user-stories.md Story 3.1 - Testes unitários para ClientService

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientService } from '../../services/ClientService'

// Mock simples do ClientRepository
vi.mock('../../repositories/ClientRepository', () => ({
  ClientRepository: vi.fn().mockImplementation(() => ({
    findByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    checkOwnership: vi.fn(),
  })),
}))

describe('ClientService', () => {
  let clientService: ClientService

  beforeEach(() => {
    vi.clearAllMocks()
    clientService = new ClientService()
  })

  describe('Service instantiation', () => {
    it('deve instanciar o ClientService corretamente', () => {
      expect(clientService).toBeInstanceOf(ClientService)
    })

    it('deve ter métodos públicos definidos', () => {
      expect(typeof clientService.getClients).toBe('function')
      expect(typeof clientService.getClientById).toBe('function')
      expect(typeof clientService.createClient).toBe('function')
      expect(typeof clientService.updateClient).toBe('function')
      expect(typeof clientService.deleteClient).toBe('function')
    })
  })

  describe('Email validation', () => {
    it('deve validar email válido', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = (clientService as any).isValidEmail('test@example.com')
      expect(isValid).toBe(true)
    })

    it('deve rejeitar email inválido', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = (clientService as any).isValidEmail('email-invalido')
      expect(isValid).toBe(false)
    })
  })

  describe('Phone validation', () => {
    it('deve validar telefone brasileiro válido', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = (clientService as any).isValidPhone('(11) 99999-9999')
      expect(isValid).toBe(true)
    })

    it('deve validar telefone sem formatação', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = (clientService as any).isValidPhone('11999999999')
      expect(isValid).toBe(true)
    })

    it('deve rejeitar telefone inválido', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = (clientService as any).isValidPhone('123456789')
      expect(isValid).toBe(false)
    })
  })
})
