/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './backend/src'),
    },
  },
  // Configuração específica para testes de integração
  optimizeDeps: {
    include: ['ioredis', 'prisma', 'bcrypt', 'jsonwebtoken'],
  },
  // Externalizar dependências problemáticas para testes de integração
  ssr: {
    noExternal: ['ioredis', 'prisma', '@prisma/client'],
  },
})
