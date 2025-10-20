// Referência: design.md §Testing Strategy, tasks.md Task 13.1
// Configuração do Jest para testes unitários com TypeScript

import type { Config } from 'jest'

const config: Config = {
  // Usar ts-jest para transformar arquivos TypeScript
  preset: 'ts-jest',

  // Ambiente de testes
  testEnvironment: 'node',

  // Diretório raiz dos testes
  rootDir: '.',

  // Padrões de arquivos de teste
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts'],

  // Transformar arquivos .ts com ts-jest
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  // Extensões de arquivos
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Diretórios a ignorar
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],

  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Arquivos para coleta de cobertura
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/server.ts',
    '!src/prisma/seed.ts',
    '!src/__tests__/**',
  ],

  // Thresholds de cobertura (Task 13.1 - Meta: >60%)
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Module name mapper (aliases)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
  },

  // Timeout global
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks entre testes
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}

export default config
