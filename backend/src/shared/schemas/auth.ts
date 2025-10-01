// src/shared/schemas/auth.ts
// Referência: tasks.md Task 2.1.3, design.md Validation, openapi.yaml Auth schemas

import { z } from 'zod';

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
    .trim()
});

/**
 * Login user schema
 * Referência: design.md Authentication Flow, openapi.yaml /auth/login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email deve ter formato válido')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
});

/**
 * Refresh token schema
 * Referência: design.md Authentication Flow, openapi.yaml /auth/refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token é obrigatório')
});

/**
 * Logout schema
 * Referência: design.md Authentication Flow, openapi.yaml /auth/logout
 */
export const logoutSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token é obrigatório')
});

// Export types
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>;
export type LogoutData = z.infer<typeof logoutSchema>;