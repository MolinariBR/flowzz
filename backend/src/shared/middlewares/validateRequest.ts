// src/shared/middlewares/validateRequest.ts
// Referência: tasks.md Task 12.3.1, design.md - Validation with Zod

import type { NextFunction, Request, Response } from 'express'
import { type ZodError, type ZodSchema, z } from 'zod'

/**
 * Middleware factory for request validation using Zod schemas
 * Referência: design.md Validation, dev-stories.md Zod Validation
 *
 * @param schema - Zod schema object with optional body, query, params
 * @returns Express middleware function
 */
export const validateRequest = (schema: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body if schema provided
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body)
      }

      // Validate query parameters if schema provided
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query)
      }

      // Validate URL parameters if schema provided
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params)
      }

      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors
        const formattedErrors = formatZodErrors(error)

        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: formattedErrors,
        })
        return
      }

      // Generic error fallback
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
      })
    }
  }
}

/**
 * Format Zod validation errors into readable format
 */
function formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))
}

/**
 * Common Zod validations for reuse
 * Referência: tasks.md Task 12.3.2
 */

// Email validation
export const emailSchema = z
  .string()
  .email({ message: 'Email inválido' })
  .min(5, 'Email deve ter no mínimo 5 caracteres')
  .max(255, 'Email deve ter no máximo 255 caracteres')

// Phone validation (Brazilian format)
export const phoneSchema = z
  .string()
  .regex(/^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/, {
    message: 'Telefone inválido. Use formato: (11) 98765-4321',
  })
  .optional()

// CPF validation (Brazilian tax ID)
export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, {
    message: 'CPF inválido. Use formato: 123.456.789-00',
  })
  .optional()
  .refine(
    (cpf) => {
      if (!cpf) {
        return true
      }

      // Remove formatting
      const cleanCpf = cpf.replace(/[^\d]/g, '')

      // Basic CPF validation
      if (cleanCpf.length !== 11) {
        return false
      }
      if (/^(\d)\1{10}$/.test(cleanCpf)) {
        return false
      } // All same digits

      // Validate check digits
      let sum = 0
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCpf.charAt(i), 10) * (10 - i)
      }
      let digit = 11 - (sum % 11)
      if (digit >= 10) {
        digit = 0
      }
      if (digit !== parseInt(cleanCpf.charAt(9), 10)) {
        return false
      }

      sum = 0
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCpf.charAt(i), 10) * (11 - i)
      }
      digit = 11 - (sum % 11)
      if (digit >= 10) {
        digit = 0
      }
      if (digit !== parseInt(cleanCpf.charAt(10), 10)) {
        return false
      }

      return true
    },
    { message: 'CPF inválido' }
  )

// CEP validation (Brazilian postal code)
export const cepSchema = z
  .string()
  .regex(/^\d{5}-\d{3}$|^\d{8}$/, {
    message: 'CEP inválido. Use formato: 01234-567',
  })
  .optional()

// UUID validation
export const uuidSchema = z.string().uuid({ message: 'ID inválido' })

// Date validation
export const dateSchema = z.coerce.date({
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_date) {
      return { message: 'Data inválida' }
    }
    return { message: ctx.defaultError }
  },
})

// Positive decimal validation (for currency)
export const currencySchema = z
  .number()
  .positive({ message: 'Valor deve ser positivo' })
  .or(
    z.string().regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Valor deve ser um número decimal válido (ex: 100.50)',
    })
  )

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// URL validation
export const urlSchema = z.string().url({ message: 'URL inválida' }).optional()

// Enum validation helper
export const enumSchema = <T extends string>(values: readonly T[]) =>
  z.enum(values as [T, ...T[]], {
    errorMap: () => ({ message: `Valor deve ser um de: ${values.join(', ')}` }),
  })
