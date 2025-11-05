// src/shared/schemas/auth.ts
// Referência: tasks.md Task 2.1.3, design.md Validation, openapi.yaml Auth schemas

import { z } from 'zod'

/**
 * Register user schema
 * Referência: user-stories.md Story 1.1, openapi.yaml /auth/register
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Email deve ter formato válido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos 1 letra minúscula, 1 maiúscula e 1 número'
    ),

  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
})

/**
 * Login user schema
 * Referência: design.md Authentication Flow, openapi.yaml /auth/login
 */
export const loginSchema = z.object({
  email: z.string().email('Email deve ter formato válido').toLowerCase().trim(),

  password: z.string().min(1, 'Senha é obrigatória'),
})

/**
 * Refresh token schema
 * Referência: design.md Authentication Flow, openapi.yaml /auth/refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

/**
 * Logout schema
 * Referência: design.md Authentication Flow, openapi.yaml /auth/logout
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

/**
 * Change password schema
 * Referência: design.md Security, openapi.yaml /auth/security
 */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Senha atual é obrigatória'),

    new_password: z
      .string()
      .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
      .max(128, 'Nova senha deve ter no máximo 128 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Nova senha deve conter pelo menos 1 letra minúscula, 1 maiúscula e 1 número'
      ),

    confirm_password: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Senhas não coincidem',
    path: ['confirm_password'],
  })

/**
 * Update profile schema
 * Referência: user-stories.md Story 1.2, openapi.yaml /auth/profile
 */
export const updateProfileSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Email deve ter formato válido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .trim()
    .optional(),

  telefone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 caracteres')
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .trim()
    .optional(),

  documento: z
    .string()
    .min(11, 'Documento deve ter pelo menos 11 caracteres')
    .max(20, 'Documento deve ter no máximo 20 caracteres')
    .trim()
    .optional(),

  endereco: z
    .string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .trim()
    .optional(),

  avatar_url: z.string().url('Avatar deve ser uma URL válida').optional(),
})

/**
 * Update system settings schema
 * Referência: design.md User Preferences, openapi.yaml /auth/system-settings
 */
export const updateSystemSettingsSchema = z.object({
  dark_mode: z.boolean().optional(),
  language: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).max(50).optional(),
  date_format: z.string().min(1).max(20).optional(),
  currency: z.string().length(3).optional(),
})

/**
 * Update notification settings schema
 * Referência: design.md User Preferences, openapi.yaml /auth/notification-settings
 */
export const updateNotificationSettingsSchema = z.object({
  email_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  vendas_enabled: z.boolean().optional(),
  marketing_enabled: z.boolean().optional(),
  sistema_enabled: z.boolean().optional(),
})

// Export types
export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>
export type LogoutData = z.infer<typeof logoutSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type UpdateSystemSettingsData = z.infer<typeof updateSystemSettingsSchema>
export type UpdateNotificationSettingsData = z.infer<typeof updateNotificationSettingsSchema>
