/**
 * Workers Index
 * Centraliza inicialização e gerenciamento de todos os workers
 *
 * Referências:
 * - tasks.md: Task 4.0.3 - Implementar workers
 * - design.md: Background Jobs
 */

import { logger } from '../shared/utils/logger'
import { startReportWorker, stopReportWorker } from './reportWorker'
import { startSyncCoinzzWorker, stopSyncCoinzzWorker } from './syncCoinzzWorker'
import { startSyncFacebookWorker, stopSyncFacebookWorker } from './syncFacebookWorker'
import { startWhatsAppWorker, stopWhatsAppWorker } from './whatsappWorker'

/**
 * Inicia todos os workers
 * Deve ser chamado na inicialização do servidor (server.ts)
 */
export function startAllWorkers(): void {
  logger.info('Starting all workers...')

  startSyncCoinzzWorker()
  startSyncFacebookWorker()
  startWhatsAppWorker()
  startReportWorker()

  logger.info('All workers started successfully')
}

/**
 * Para todos os workers gracefully
 * Deve ser chamado no shutdown do servidor (SIGTERM/SIGINT)
 */
export async function stopAllWorkers(): Promise<void> {
  logger.info('Stopping all workers...')

  await Promise.all([
    stopSyncCoinzzWorker(),
    stopSyncFacebookWorker(),
    stopWhatsAppWorker(),
    stopReportWorker(),
  ])

  logger.info('All workers stopped successfully')
}
