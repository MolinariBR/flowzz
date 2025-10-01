/**
 * Prisma Client Configuration and Utilities
 * Referência: implement.md §Database Setup, design.md §Database Layer
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Global variable to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Create Prisma Client with logging and error handling
 */
const createPrismaClient = (): PrismaClient => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  });

  return prisma;
};

/**
 * Singleton Prisma Client instance
 * Prevents multiple connections in development with hot reload
 */
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

/**
 * Disconnect Prisma Client on application shutdown
 */
const disconnectPrisma = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Prisma Client disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting Prisma Client', { error });
  }
};

/**
 * Check database connection health
 */
const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
};

export { prisma, disconnectPrisma, checkDatabaseHealth };