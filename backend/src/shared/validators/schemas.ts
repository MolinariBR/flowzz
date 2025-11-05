// src/shared/validators/schemas.ts
// Referência: tasks.md Task 12.3.2, design.md - Zod Schemas

import { z } from 'zod'
import {
  cepSchema,
  cpfSchema,
  currencySchema,
  dateSchema,
  emailSchema,
  enumSchema,
  paginationSchema,
  phoneSchema,
  urlSchema,
  uuidSchema,
} from '../middlewares/validateRequest'

// ==================== USER SCHEMAS ====================

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Senha é obrigatória'),
  }),
})

export const updateProfileSchema = z.object({
  body: z.object({
    nome: z.string().min(3).max(255).optional(),
    email: z.string().email().optional(),
    telefone: phoneSchema,
    documento: cpfSchema,
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    cep: cepSchema,
    avatar_url: urlSchema,
  }),
})

export const updateSystemSettingsSchema = z.object({
  body: z.object({
    dark_mode: z.boolean().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    date_format: z.string().optional(),
    currency: z.string().optional(),
  }),
})

export const changePasswordSchema = z.object({
  body: z
    .object({
      current_password: z.string().min(6),
      new_password: z.string().min(6),
      confirm_password: z.string().min(6),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: 'Nova senha e confirmação devem ser iguais',
      path: ['confirm_password'],
    }),
})

// ==================== CLIENT SCHEMAS ====================

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
    email: emailSchema.optional(),
    phone: phoneSchema,
    cpf: cpfSchema,
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().length(2, 'Estado deve ter 2 caracteres (ex: SP)').optional(),
    cep: z
      .string()
      .regex(/^\d{5}-?\d{3}$/, 'CEP inválido. Use formato: 12345-678')
      .optional(),
    status: enumSchema(['ACTIVE', 'INACTIVE', 'BLOCKED'] as const).optional(),
  }),
})

export const updateClientSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(3).max(255).optional(),
    email: emailSchema.optional().or(z.literal('')),
    phone: phoneSchema.or(z.literal('')),
    cpf: cpfSchema.or(z.literal('')),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().length(2).optional(),
    cep: z
      .string()
      .regex(/^\d{5}-?\d{3}$/)
      .optional(),
    status: enumSchema(['ACTIVE', 'INACTIVE', 'BLOCKED'] as const).optional(),
  }),
})

export const listClientsSchema = z.object({
  query: paginationSchema.extend({
    search: z.string().optional(),
    status: enumSchema(['ACTIVE', 'INACTIVE', 'BLOCKED'] as const).optional(),
    sortBy: enumSchema(['name', 'created_at', 'total_spent'] as const).optional(),
    sortOrder: enumSchema(['asc', 'desc'] as const).optional(),
  }),
})

// ==================== TAG SCHEMAS ====================

export const createTagSchema = z.object({
  body: z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(50),
    cor: z
      .string()
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Cor inválida. Use formato hexadecimal: #FF5733'
      ),
    descricao: z.string().max(255).optional(),
  }),
})

export const updateTagSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    nome: z.string().min(2).max(50).optional(),
    cor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .optional(),
    descricao: z.string().max(255).optional(),
  }),
})

// ==================== SALE SCHEMAS ====================

export const createSaleSchema = z.object({
  body: z.object({
    client_id: uuidSchema,
    valor: currencySchema,
    data_venda: dateSchema,
    status: enumSchema(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).default(
      'PENDING'
    ),
    product_name: z.string().max(255).optional(),
    observacoes: z.string().max(1000).optional(),
    external_id: z.string().max(255).optional(),
  }),
})

export const updateSaleSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    valor: currencySchema.optional(),
    status: enumSchema(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).optional(),
    observacoes: z.string().max(1000).optional(),
  }),
})

export const listSalesSchema = z.object({
  query: paginationSchema.extend({
    client_id: uuidSchema.optional(),
    status: enumSchema(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    sortBy: enumSchema(['data_venda', 'valor', 'created_at'] as const).optional(),
    sortOrder: enumSchema(['asc', 'desc'] as const).optional(),
  }),
})

// ==================== AD SCHEMAS ====================

export const createAdSchema = z.object({
  body: z.object({
    campaign_name: z.string().min(3).max(255),
    platform: enumSchema(['FACEBOOK', 'GOOGLE', 'INSTAGRAM', 'TIKTOK'] as const),
    budget: currencySchema,
    start_date: dateSchema,
    end_date: dateSchema.optional(),
    status: enumSchema(['ACTIVE', 'PAUSED', 'COMPLETED'] as const).default('ACTIVE'),
  }),
})

// ==================== INTEGRATION SCHEMAS ====================

export const connectIntegrationSchema = z.object({
  body: z.object({
    provider: enumSchema(['COINZZ', 'FACEBOOK', 'WHATSAPP', 'PAGBANK'] as const),
    api_key: z.string().min(10, 'API Key inválida').optional(),
    access_token: z.string().min(10).optional(),
    config: z.record(z.unknown()).optional(),
  }),
})

export const syncIntegrationSchema = z.object({
  params: z.object({
    provider: enumSchema(['COINZZ', 'FACEBOOK', 'WHATSAPP', 'PAGBANK'] as const),
  }),
  body: z.object({
    forceFullSync: z.boolean().optional().default(false),
  }),
})

// ==================== REPORT SCHEMAS ====================

export const generateReportSchema = z.object({
  body: z.object({
    type: enumSchema([
      'SALES_REPORT',
      'FINANCIAL_SUMMARY',
      'CLIENT_ANALYSIS',
      'PROJECTION_REPORT',
      'CUSTOM',
    ] as const),
    title: z.string().min(3).max(255),
    format: enumSchema(['pdf', 'excel'] as const),
    filters: z
      .object({
        startDate: dateSchema,
        endDate: dateSchema,
        clientIds: z.array(uuidSchema).optional(),
        tagIds: z.array(uuidSchema).optional(),
        status: z.array(z.string()).optional(),
        includeCharts: z.boolean().optional(),
        includeLogo: z.boolean().optional(),
      })
      .optional(),
    sendEmail: z.boolean().optional(),
    emailRecipients: z.array(emailSchema).max(10, 'Máximo de 10 destinatários').optional(),
  }),
})

// ==================== GOAL SCHEMAS ====================

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255),
    type: enumSchema(['REVENUE', 'SALES_COUNT', 'CLIENT_COUNT', 'CUSTOM'] as const),
    target_value: z.number().positive(),
    period: enumSchema(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const),
    deadline: dateSchema.optional(),
  }),
})

export const updateGoalSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    target_value: z.number().positive().optional(),
    deadline: dateSchema.optional(),
    status: enumSchema(['ACTIVE', 'COMPLETED', 'CANCELLED'] as const).optional(),
  }),
})

// ==================== SUBSCRIPTION SCHEMAS ====================

export const upgradeSubscriptionSchema = z.object({
  body: z.object({
    plan_id: uuidSchema,
    payment_method: enumSchema(['CREDIT_CARD', 'PIX', 'BOLETO'] as const),
    card_token: z.string().optional(), // For PagBank tokenized card
  }),
})

// ==================== ADMIN SCHEMAS ====================

export const listUsersSchema = z.object({
  query: paginationSchema.extend({
    search: z.string().optional(),
    plan: enumSchema(['BASIC', 'PRO', 'PREMIUM'] as const).optional(),
    status: enumSchema(['TRIAL', 'ACTIVE', 'CANCELLED', 'SUSPENDED'] as const).optional(),
    role: enumSchema(['USER', 'ADMIN', 'SUPER_ADMIN'] as const).optional(),
  }),
})

export const updateUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    nome: z.string().min(3).max(255).optional(),
    role: enumSchema(['USER', 'ADMIN', 'SUPER_ADMIN'] as const).optional(),
    is_active: z.boolean().optional(),
  }),
})

export const suspendUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    reason: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres').max(500),
  }),
})

// ==================== COMMON SCHEMAS ====================

export const idParamSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
})

export const dateRangeQuerySchema = z.object({
  query: z.object({
    startDate: dateSchema,
    endDate: dateSchema,
  }),
})
