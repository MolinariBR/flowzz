/**
 * Redis Configuration
 *
 * Referências:
 * - tasks.md: Task 4.0.1 - Configurar Bull Queues com Redis
 * - design.md: Cache Layer + Background Jobs
 * - docker-compose.yml: Redis rodando na porta 6380
 */

import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Parse Redis URL to extract host and port
 */
function parseRedisUrl(url: string): { host: string; port: number } {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: Number.parseInt(parsedUrl.port, 10) || 6379,
    };
  } catch {
    return { host: 'localhost', port: 6380 };
  }
}

/**
 * Redis connection options
 * Configurado para Bull Queues e Cache
 */
export const redisConfig = {
  ...parseRedisUrl(env.REDIS_URL),
  ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
  maxRetriesPerRequest: null, // Required for Bull
  enableReadyCheck: false, // Required for Bull
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

/**
 * Create Redis client for Bull queues
 * Usa configuração otimizada para Bull
 */
export function createRedisClient(): Redis {
  const client = new Redis(redisConfig);

  client.on('connect', () => {
    logger.info('Redis client connected for Bull queues', {
      host: redisConfig.host,
      port: redisConfig.port,
    });
  });

  client.on('error', (error) => {
    logger.error('Redis client error', {
      error: error.message,
      stack: error.stack,
    });
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('reconnecting', () => {
    logger.warn('Redis client reconnecting...');
  });

  return client;
}

/**
 * Check Redis health
 * Usado no health check endpoint
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = createRedisClient();
    await client.ping();
    await client.quit();
    return true;
  } catch (error) {
    logger.error('Redis health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Disconnect Redis client gracefully
 * Usado no graceful shutdown
 */
export async function disconnectRedis(client: Redis): Promise<void> {
  try {
    await client.quit();
    logger.info('Redis client disconnected');
  } catch (error) {
    logger.error('Error disconnecting Redis client', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
