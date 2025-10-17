/**
 * Health Check Routes
 *
 * Referências:
 * - tasks.md: Task 4.0.5 - Criar health check endpoint
 * - design.md: Health Monitoring
 *
 * Rota: GET /health/queues
 * Acesso: Público (para monitoramento externo)
 */

import { Router, type Request, type Response } from 'express';
import { allQueues } from '../queues/queues';
import { checkQueueHealth } from '../queues/index';
import { logger } from '../shared/utils/logger';
import { StorageService } from '../services/StorageService';
import { redisService } from '../shared/services/RedisService';
import { prisma } from '../shared/config/database';

const router = Router();
const storageService = new StorageService();

/**
 * Interface para resposta do health check
 */
interface QueueHealthStatus {
  name: string;
  healthy: boolean;
  stats: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  };
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  redis: {
    connected: boolean;
  };
  queues: QueueHealthStatus[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
}

/**
 * GET /health/queues
 * Verifica saúde de todas as queues e Redis
 *
 * Referência: tasks.md Task 4.0.5
 */
router.get('/queues', async (_req: Request, res: Response) => {
  try {
    const queueHealthChecks = await Promise.all(
      allQueues.map(async (queue) => {
        const isHealthy = await checkQueueHealth(queue);

        // Get queue stats
        const [waiting, active, completed, failed, delayed, isPaused] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
          queue.isPaused(),
        ]);

        return {
          name: queue.name,
          healthy: isHealthy,
          stats: {
            waiting,
            active,
            completed,
            failed,
            delayed,
            paused: isPaused,
          },
        };
      }),
    );

    const healthyCount = queueHealthChecks.filter((q) => q.healthy).length;
    const unhealthyCount = queueHealthChecks.length - healthyCount;

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount === 0) {
      status = 'healthy';
    } else if (healthyCount > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const response: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      redis: {
        connected: healthyCount > 0, // Se pelo menos uma queue está saudável, Redis está conectado
      },
      queues: queueHealthChecks,
      summary: {
        total: queueHealthChecks.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
      },
    };

    // Log health check
    logger.info('Queue health check completed', {
      status,
      healthyCount,
      unhealthyCount,
    });

    // Return appropriate status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 207 : 503;
    res.status(httpStatus).json(response);
  } catch (error) {
    logger.error('Queue health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Failed to perform health check',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /health/storage
 * Verifica saúde do serviço de storage (S3/R2)
 *
 * Referência: tasks.md Task 10.1.5 - Storage health check
 */
router.get('/storage', async (_req: Request, res: Response) => {
  try {
    const isHealthy = await storageService.healthCheck();
    const bucket = storageService.getBucket();

    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        storage: {
          configured: storageService.isReady(),
          bucket,
          provider: bucket?.includes('.r2.') ? 'Cloudflare R2' : 'AWS S3',
        },
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        storage: {
          configured: storageService.isReady(),
          bucket,
          error: 'Storage health check failed',
        },
      });
    }
  } catch (error) {
    logger.error('Storage health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Storage health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /health/complete
 * Health check completo incluindo database, Redis e métricas de performance
 */
router.get('/complete', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Verificar Redis
    const redisConnected = redisService.isReady();

    // Verificar Database
    let dbConnected = false;
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
      dbConnected = true;
    } catch (error) {
      logger.warn('Database health check failed', { error: error instanceof Error ? error.message : 'Unknown' });
    }

    // Verificar Storage
    let storageHealthy = false;
    try {
      storageHealthy = storageService.isReady();
    } catch (error) {
      logger.warn('Storage health check failed', { error: error instanceof Error ? error.message : 'Unknown' });
    }

    const totalResponseTime = Date.now() - startTime;

    // Determinar status geral
    const allHealthy = redisConnected && dbConnected && storageHealthy && totalResponseTime < 2000;
    const status = allHealthy ? 'healthy' : totalResponseTime < 5000 ? 'degraded' : 'unhealthy';

    const response = {
      status,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      services: {
        redis: {
          connected: redisConnected,
          status: redisConnected ? 'healthy' : 'unhealthy',
        },
        database: {
          connected: dbConnected,
          responseTime: dbResponseTime,
          status: dbConnected ? 'healthy' : 'unhealthy',
        },
        storage: {
          configured: storageHealthy,
          status: storageHealthy ? 'healthy' : 'unhealthy',
        },
      },
      performance: {
        totalResponseTime,
        acceptable: totalResponseTime < 2000,
        warning: totalResponseTime >= 2000 && totalResponseTime < 5000,
        critical: totalResponseTime >= 5000,
      },
    };

    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 206 : 503;
    res.status(httpStatus).json(response);

  } catch (error) {
    logger.error('Complete health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Complete health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
