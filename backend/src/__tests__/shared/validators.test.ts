// Referência: tasks.md Task 13.1.3, design.md §Unit Tests
// Testes unitários para validações e formatações (Utils/Helpers)

import { describe, expect, it } from 'vitest'
import {
  cpfSchema,
  currencySchema,
  dateSchema,
  emailSchema,
  paginationSchema,
  phoneSchema,
  urlSchema,
  uuidSchema,
} from '../../shared/middlewares/validateRequest'

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('deve validar email válido', () => {
      const result = emailSchema.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('deve validar email com domínio brasileiro', () => {
      const result = emailSchema.safeParse('usuario@empresa.com.br')
      expect(result.success).toBe(true)
    })

    it('deve rejeitar email sem @', () => {
      const result = emailSchema.safeParse('emailinvalido')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar email sem domínio', () => {
      const result = emailSchema.safeParse('email@')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar email muito curto', () => {
      const result = emailSchema.safeParse('a@b')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar email muito longo', () => {
      const longEmail = `${'a'.repeat(250)}@test.com`
      const result = emailSchema.safeParse(longEmail)
      expect(result.success).toBe(false)
    })
  })

  describe('phoneSchema', () => {
    it('deve validar telefone com DDD e formatação: (11) 98765-4321', () => {
      const result = phoneSchema.safeParse('(11) 98765-4321')
      expect(result.success).toBe(true)
    })

    it('deve validar telefone sem formatação: 11987654321', () => {
      const result = phoneSchema.safeParse('11987654321')
      expect(result.success).toBe(true)
    })

    it('deve validar telefone fixo: (11) 3456-7890', () => {
      const result = phoneSchema.safeParse('(11) 3456-7890')
      expect(result.success).toBe(true)
    })

    it('deve validar telefone com espaços: 11 98765-4321', () => {
      const result = phoneSchema.safeParse('11 98765-4321')
      expect(result.success).toBe(true)
    })

    it('deve rejeitar telefone incompleto', () => {
      const result = phoneSchema.safeParse('(11) 9876')
      expect(result.success).toBe(false)
    })

    it('deve aceitar undefined (campo opcional)', () => {
      const result = phoneSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })
  })

  describe('cpfSchema', () => {
    it('deve validar CPF válido com formatação: 123.456.789-09', () => {
      const result = cpfSchema.safeParse('123.456.789-09')
      expect(result.success).toBe(true)
    })

    it('deve validar CPF válido sem formatação: 12345678909', () => {
      const result = cpfSchema.safeParse('12345678909')
      expect(result.success).toBe(true)
    })

    it('deve rejeitar CPF com todos os dígitos iguais', () => {
      const result = cpfSchema.safeParse('111.111.111-11')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar CPF com dígito verificador inválido', () => {
      const result = cpfSchema.safeParse('123.456.789-00')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar CPF incompleto', () => {
      const result = cpfSchema.safeParse('123.456.789')
      expect(result.success).toBe(false)
    })

    it('deve aceitar undefined (campo opcional)', () => {
      const result = cpfSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('deve validar CPF válido real: 529.982.247-25', () => {
      const result = cpfSchema.safeParse('529.982.247-25')
      expect(result.success).toBe(true)
    })
  })

  describe('uuidSchema', () => {
    it('deve validar UUID v4 válido', () => {
      const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000')
      expect(result.success).toBe(true)
    })

    it('deve rejeitar UUID inválido', () => {
      const result = uuidSchema.safeParse('invalid-uuid')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar string vazia', () => {
      const result = uuidSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar UUID incompleto', () => {
      const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716')
      expect(result.success).toBe(false)
    })
  })

  describe('dateSchema', () => {
    it('deve validar data ISO válida', () => {
      const result = dateSchema.safeParse('2024-01-15')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date)
      }
    })

    it('deve validar timestamp válido', () => {
      const result = dateSchema.safeParse('2024-01-15T10:30:00Z')
      expect(result.success).toBe(true)
    })

    it('deve converter string para Date', () => {
      const result = dateSchema.safeParse('2024-01-15')
      expect(result.success).toBe(true)
      if (result.success) {
        // Usar toISOString para evitar problemas de timezone
        expect(result.data).toBeInstanceOf(Date)
        expect(result.data.toISOString()).toContain('2024-01-15')
      }
    })

    it('deve rejeitar data inválida', () => {
      const result = dateSchema.safeParse('data-invalida')
      expect(result.success).toBe(false)
    })

    it('deve aceitar objeto Date', () => {
      const date = new Date('2024-01-15')
      const result = dateSchema.safeParse(date)
      expect(result.success).toBe(true)
    })
  })

  describe('currencySchema', () => {
    it('deve validar número positivo', () => {
      const result = currencySchema.safeParse(100)
      expect(result.success).toBe(true)
    })

    it('deve validar número decimal', () => {
      const result = currencySchema.safeParse(99.99)
      expect(result.success).toBe(true)
    })

    it('deve validar string com decimal: 100.50', () => {
      const result = currencySchema.safeParse('100.50')
      expect(result.success).toBe(true)
    })

    it('deve validar string sem decimal: 100', () => {
      const result = currencySchema.safeParse('100')
      expect(result.success).toBe(true)
    })

    it('deve rejeitar número negativo', () => {
      const result = currencySchema.safeParse(-10)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar zero', () => {
      const result = currencySchema.safeParse(0)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar string com mais de 2 casas decimais', () => {
      const result = currencySchema.safeParse('100.999')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar string com caracteres inválidos', () => {
      const result = currencySchema.safeParse('R$ 100,00')
      expect(result.success).toBe(false)
    })
  })

  describe('paginationSchema', () => {
    it('deve validar paginação padrão', () => {
      const result = paginationSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
      }
    })

    it('deve validar page e limit customizados', () => {
      const result = paginationSchema.safeParse({ page: 2, limit: 50 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(50)
      }
    })

    it('deve converter strings para números', () => {
      const result = paginationSchema.safeParse({ page: '3', limit: '30' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(3)
        expect(result.data.limit).toBe(30)
      }
    })

    it('deve rejeitar page negativa', () => {
      const result = paginationSchema.safeParse({ page: -1 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar page zero', () => {
      const result = paginationSchema.safeParse({ page: 0 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar limit maior que 100', () => {
      const result = paginationSchema.safeParse({ limit: 101 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar limit negativo', () => {
      const result = paginationSchema.safeParse({ limit: -10 })
      expect(result.success).toBe(false)
    })
  })

  describe('urlSchema', () => {
    it('deve validar URL HTTP válida', () => {
      const result = urlSchema.safeParse('http://example.com')
      expect(result.success).toBe(true)
    })

    it('deve validar URL HTTPS válida', () => {
      const result = urlSchema.safeParse('https://example.com')
      expect(result.success).toBe(true)
    })

    it('deve validar URL com caminho', () => {
      const result = urlSchema.safeParse('https://example.com/path/to/resource')
      expect(result.success).toBe(true)
    })

    it('deve validar URL com query params', () => {
      const result = urlSchema.safeParse('https://example.com?param=value&foo=bar')
      expect(result.success).toBe(true)
    })

    it('deve rejeitar URL sem protocolo', () => {
      const result = urlSchema.safeParse('example.com')
      expect(result.success).toBe(false)
    })

    it('deve rejeitar URL inválida', () => {
      const result = urlSchema.safeParse('not-a-url')
      expect(result.success).toBe(false)
    })

    it('deve aceitar undefined (campo opcional)', () => {
      const result = urlSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })
  })
})
