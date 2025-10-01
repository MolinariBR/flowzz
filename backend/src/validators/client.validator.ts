// Referência: design.md §Validation, dev-stories.md §Dev Story 2.1
// Atende user-stories.md Story 3.1 - Validação de dados de clientes

import { z } from 'zod';

export const createClientSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome não pode exceder 255 caracteres')
    .trim(),
  
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  phone: z
    .string()
    .regex(
      /^(\(\d{2}\)\s?|\d{2})\d{4,5}-?\d{4}$/,
      'Formato de telefone inválido. Use (11) 99999-9999'
    )
    .optional()
    .or(z.literal('')),
  
  cpf: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
      'CPF deve estar no formato 000.000.000-00 ou 00000000000'
    )
    .optional()
    .or(z.literal('')),
  
  address: z
    .string()
    .max(500, 'Endereço não pode exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  city: z
    .string()
    .max(100, 'Cidade não pode exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  state: z
    .string()
    .length(2, 'Estado deve ter exatamente 2 caracteres')
    .optional()
    .or(z.literal('')),
  
  cep: z
    .string()
    .regex(
      /^\d{5}-?\d{3}$/,
      'CEP deve estar no formato 00000-000'
    )
    .optional()
    .or(z.literal('')),
  
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'], {
    required_error: 'Status é obrigatório',
    invalid_type_error: 'Status deve ser ACTIVE, INACTIVE ou BLOCKED'
  }),
  
  external_id: z
    .string()
    .optional()
    .or(z.literal(''))
});

export const updateClientSchema = createClientSchema.partial();

export const clientFiltersSchema = z.object({
  search: z
    .string()
    .optional(),
  
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
    .optional(),
  
  tags: z
    .array(z.string().uuid())
    .optional(),
  
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('20')
});

export const clientParamsSchema = z.object({
  id: z
    .string()
    .uuid('ID deve ser um UUID válido')
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientFiltersInput = z.infer<typeof clientFiltersSchema>;
export type ClientParamsInput = z.infer<typeof clientParamsSchema>;