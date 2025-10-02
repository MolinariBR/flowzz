/**
 * Bull Queues Infrastructure
 * 
 * Referências:
 * - tasks.md: Task 4.0.2 - Criar todas as queues necessárias
 * - design.md: Background Jobs with Bull
 * 
 * Queues disponíveis:
 * - syncCoinzzQueue: Sincronizar vendas do Coinzz (cron: a cada hora)
 * - syncFacebookQueue: Sincronizar anúncios do Facebook Ads (cron: a cada 6 horas)
 * - whatsappQueue: Enviar mensagens WhatsApp (on-demand)
 * - reportQueue: Gerar relatórios (on-demand)
 */

import Bull, { type JobOptions, type Job } from 'bull';
import { redisConfig } from '../shared/config/redis';
import { logger } from '../shared/utils/logger';

/**
 * Default job options para todas as queues
 * Referência: tasks.md Task 4.0.1 - Retry policy: 3 tentativas, backoff exponencial
 */
const defaultJobOptions: JobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s
  },
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 200, // Keep last 200 failed jobs
};

/**
 * Create a new Bull queue with default configuration
 * @param name - Nome da queue
 * @param options - Opções adicionais (opcional)
 */
export function createQueue<T = unknown>(
  name: string,
  options?: JobOptions
): Bull.Queue<T> {
  const queue = new Bull<T>(name, {
    redis: redisConfig,
    defaultJobOptions: {
      ...defaultJobOptions,
      ...options,
    },
  });

  // Event listeners para logging
  queue.on('error', (error: Error) => {
    logger.error(`Queue ${name} error`, {
      queue: name,
      error: error.message,
      stack: error.stack,
    });
  });

  queue.on('waiting', (jobId: string | number) => {
    logger.debug(`Job ${jobId} waiting in queue ${name}`, {
      queue: name,
      jobId,
    });
  });

  queue.on('active', (job: Job<T>) => {
    logger.info(`Job ${job.id} started in queue ${name}`, {
      queue: name,
      jobId: job.id,
      data: job.data,
    });
  });

  queue.on('completed', (job: Job<T>, result: unknown) => {
    logger.info(`Job ${job.id} completed in queue ${name}`, {
      queue: name,
      jobId: job.id,
      result,
      duration: job.processedOn ? Date.now() - job.processedOn : 0,
    });
  });

  queue.on('failed', (job: Job<T>, error: Error) => {
    logger.error(`Job ${job?.id} failed in queue ${name}`, {
      queue: name,
      jobId: job?.id,
      error: error.message,
      stack: error.stack,
      attempts: job?.attemptsMade,
      maxAttempts: job?.opts.attempts,
    });
  });

  queue.on('stalled', (job: Job<T>) => {
    logger.warn(`Job ${job.id} stalled in queue ${name}`, {
      queue: name,
      jobId: job.id,
    });
  });

  logger.info(`Queue ${name} created`, {
    queue: name,
    redis: `${redisConfig.host}:${redisConfig.port}`,
  });

  return queue;
}

/**
 * Gracefully close a queue
 * Used in graceful shutdown
 */
export async function closeQueue(queue: Bull.Queue): Promise<void> {
  try {
    await queue.close();
    logger.info(`Queue ${queue.name} closed`);
  } catch (error) {
    logger.error(`Error closing queue ${queue.name}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Close all queues gracefully
 * Used in graceful shutdown of server
 */
export async function closeAllQueues(queues: Bull.Queue[]): Promise<void> {
  logger.info('Closing all queues...');
  await Promise.all(queues.map((queue) => closeQueue(queue)));
  logger.info('All queues closed');
}

/**
 * Check health of a queue
 * Returns true if queue is healthy (can connect to Redis)
 */
export async function checkQueueHealth(queue: Bull.Queue): Promise<boolean> {
  try {
    await queue.client.ping();
    return true;
  } catch (error) {
    logger.error(`Queue ${queue.name} health check failed`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
