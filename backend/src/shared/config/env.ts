// src/shared/config/env.ts
// Referência: design.md §Environment Variables, tasks.md Task 1.1

import * as dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Environment validation schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),

  // Frontend URLs (para CORS)
  FRONTEND_USER_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_ADMIN_URL: z.string().url().default('http://localhost:5173'),
  FRONTEND_LANDING_URL: z.string().url().default('http://localhost:3001'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Bcrypt
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_SECURE: z.string().transform(Boolean).default('false'),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  FROM_EMAIL: z.string().email(),

  // External APIs
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_API_VERSION: z.string().default('v18.0'),

  COINZZ_API_KEY: z.string().optional(),
  COINZZ_API_URL: z.string().url().default('https://api.coinzz.com'),

  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_API_URL: z.string().url().default('https://graph.facebook.com/v18.0'),

  PAGBANK_API_KEY: z.string().optional(),
  PAGBANK_API_URL: z.string().url().default('https://api.pagbank.com'),
  PAGBANK_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Trial Configuration
  TRIAL_DURATION_DAYS: z.string().transform(Number).default('7'),
  TRIAL_REMINDER_DAYS: z.string().transform(Number).default('2'),

  // Pagination
  DEFAULT_PAGE_SIZE: z.string().transform(Number).default('20'),
  MAX_PAGE_SIZE: z.string().transform(Number).default('100'),
})

// Validate environment variables
const parseResult = envSchema.safeParse(process.env)

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parseResult.error.format())
  process.exit(1)
}

export const env = parseResult.data

// Type for environment variables
export type Env = z.infer<typeof envSchema>

// Environment helpers
export const isDevelopment = (): boolean => env.NODE_ENV === 'development'
export const isProduction = (): boolean => env.NODE_ENV === 'production'
export const isTest = (): boolean => env.NODE_ENV === 'test'
