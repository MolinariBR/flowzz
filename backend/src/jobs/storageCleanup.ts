/**
 * Storage Cleanup Job
 * 
 * Job que executa diariamente para remover arquivos antigos do S3/R2
 * 
 * Referências:
 * - tasks.md: Task 10.1.5 - Cleanup automático de arquivos
 * - TASK10_STORAGE_TODO.md: Cleanup de arquivos >30 dias
 */

import { CronJob } from 'cron';
import { StorageService } from '../services/StorageService';
import { logger } from '../shared/utils/logger';

const storageService = new StorageService();

/**
 * Job que roda diariamente às 3h da manhã (horário de Brasília)
 * Remove arquivos de relatórios com mais de 30 dias
 * 
 * Cron Schedule: '0 3 * * *'
 * - Minuto: 0
 * - Hora: 3 (3h AM)
 * - Dia do mês: * (todos)
 * - Mês: * (todos)
 * - Dia da semana: * (todos)
 */
export const storageCleanupJob = new CronJob(
  '0 3 * * *', // 3h AM todos os dias
  async () => {
    try {
      if (!storageService.isReady()) {
        logger.warn('Storage cleanup skipped - service not configured');
        return;
      }

      logger.info('Starting storage cleanup job');

      const startTime = Date.now();
      const deletedCount = await storageService.cleanupOldFiles(30); // 30 dias
      const duration = Date.now() - startTime;

      logger.info('Storage cleanup completed successfully', {
        deletedCount,
        duration: `${duration}ms`,
        olderThanDays: 30,
      });
    } catch (error) {
      logger.error('Storage cleanup job failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  },
  null, // onComplete callback
  false, // start: false (será iniciado manualmente no server.ts)
  'America/Sao_Paulo' // timezone
);

/**
 * Inicia o job de cleanup
 */
export function startStorageCleanup(): void {
  if (!storageService.isReady()) {
    logger.warn('Storage cleanup job not started - service not configured');
    return;
  }

  storageCleanupJob.start();
  logger.info('Storage cleanup job scheduled (daily at 3 AM Brasília time)');
}

/**
 * Para o job de cleanup
 */
export function stopStorageCleanup(): void {
  if (storageCleanupJob.running) {
    storageCleanupJob.stop();
    logger.info('Storage cleanup job stopped');
  }
}

/**
 * Executa cleanup manualmente (útil para testes)
 */
export async function runStorageCleanupNow(): Promise<number> {
  if (!storageService.isReady()) {
    throw new Error('Storage service not configured');
  }

  logger.info('Running manual storage cleanup');
  const deletedCount = await storageService.cleanupOldFiles(30);
  logger.info('Manual storage cleanup completed', { deletedCount });

  return deletedCount;
}
