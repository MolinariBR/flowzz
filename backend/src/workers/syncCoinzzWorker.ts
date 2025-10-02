/**
 * Worker para sincronizar vendas do Coinzz
 *
 * Referências:
 * - tasks.md: Task 5.2.4 - Sincronização automática via cron
 * - design.md: Background Jobs - Coinzz Sync
 *
 * Execução: Agendada via cron (a cada hora)
 * Responsabilidade: Chamar CoinzzService.syncSales para buscar vendas da API Coinzz
 */

import type { Job } from 'bull';
import { syncCoinzzQueue, type SyncCoinzzJobData } from '../queues/queues';
import { CoinzzService } from '../services/CoinzzService';
import { prisma } from '../shared/config/database';
import { logger } from '../shared/utils/logger';

// Criar instância do serviço
const coinzzService = new CoinzzService(prisma);

/**
 * Processa job de sincronização Coinzz
 *
 * @param job - Job do Bull contendo empresaId e opções
 * @returns Promise com resultado da sincronização
 */
export async function processSyncCoinzzJob(job: Job<SyncCoinzzJobData>): Promise<void> {
  const { empresaId, forceFullSync } = job.data;

  logger.info('Starting Coinzz sync job', {
    jobId: job.id,
    empresaId,
    forceFullSync,
    attempt: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts,
  });

  try {
    // Chamar CoinzzService.syncSales para sincronizar vendas
    // Referência: tasks.md Task 5.2.4
    const result = await coinzzService.syncSales(empresaId, forceFullSync);

    logger.info('Coinzz sync job completed successfully', {
      jobId: job.id,
      empresaId,
      result: {
        salesProcessed: result.salesProcessed,
        salesCreated: result.salesCreated,
        salesUpdated: result.salesUpdated,
        errors: result.errors,
        syncedAt: result.syncedAt,
      },
    });

    // Log de erros individuais se houver
    if (result.errors > 0 && result.errorDetails) {
      logger.warn('Coinzz sync completed with errors', {
        jobId: job.id,
        empresaId,
        errorCount: result.errors,
        errorDetails: result.errorDetails,
      });
    }
  } catch (error) {
    logger.error('Coinzz sync job failed', {
      jobId: job.id,
      empresaId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error; // Re-throw para ativar retry policy do Bull
  }
}

/**
 * Registra o worker para processar jobs da queue
 * Deve ser chamado na inicialização do servidor
 */
export function startSyncCoinzzWorker(): void {
  syncCoinzzQueue.process(async (job) => {
    await processSyncCoinzzJob(job);
  });

  logger.info('Sync Coinzz worker started', {
    queue: syncCoinzzQueue.name,
  });
}

/**
 * Para o worker gracefully
 * Deve ser chamado no shutdown do servidor
 */
export async function stopSyncCoinzzWorker(): Promise<void> {
  await syncCoinzzQueue.close();
  logger.info('Sync Coinzz worker stopped');
}
