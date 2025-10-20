/**
 * Facebook Ads Sync Worker - Task 6.1/6.2
 *
 * Worker Bull para sincronização automática de insights do Facebook Ads.
 * Executa a cada 6 horas para todos os usuários com integração ativa.
 *
 * Referências:
 * - design.md: Facebook Ads Marketing API Integration
 * - dev-stories.md: Dev Story 3.2
 * - tasks.md: Task 6.1/6.2
 * - user-stories.md: Story 1.3
 */

import type { Job } from 'bull'
import { syncFacebookQueue } from '../queues/queues'
import { FacebookAdsService } from '../services/FacebookAdsService'
import { prisma } from '../shared/config/database'
import { logger } from '../shared/utils/logger'

/**
 * Interface para job payload
 */
interface FacebookSyncJobData {
  userId: string
  forceFullSync?: boolean
}

/**
 * Processar job de sincronização individual
 */
async function processSyncFacebookJob(job: Job<FacebookSyncJobData>): Promise<unknown> {
  const { userId, forceFullSync = false } = job.data

  logger.info('Processing Facebook sync job', {
    userId,
    jobId: job.id,
    forceFullSync,
  })

  const facebookAdsService = new FacebookAdsService()

  try {
    // Verificar se integração está ativa
    const integration = await prisma.integration.findUnique({
      where: {
        user_id_provider: {
          user_id: userId,
          provider: 'FACEBOOK_ADS',
        },
      },
    })

    if (!integration || integration.status !== 'CONNECTED') {
      logger.warn('Facebook integration not active, skipping sync', { userId })
      return { success: false, reason: 'Integration not active' }
    }

    // Executar sincronização
    const result = await facebookAdsService.syncInsights(userId, forceFullSync)

    logger.info('Facebook sync job completed', {
      userId,
      jobId: job.id,
      insightsSynced: result.insightsSynced,
      campaignsSynced: result.campaignsSynced,
      success: result.success,
      errors: result.errors.length,
    })

    return result
  } catch (error) {
    logger.error('Facebook sync job failed', {
      userId,
      jobId: job.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error // Re-throw para Bull retry logic
  }
}

/**
 * Processar job de auto-sync para todos os usuários
 */
async function processAutoSyncAllUsers(job: Job): Promise<unknown> {
  logger.info('Starting Facebook auto-sync for all users', { jobId: job.id })

  try {
    // Buscar todos os usuários com integração Facebook ativa
    const integrations = await prisma.integration.findMany({
      where: {
        provider: 'FACEBOOK_ADS',
        status: 'CONNECTED',
      },
      select: {
        user_id: true,
      },
    })

    logger.info(`Found ${integrations.length} Facebook integrations to sync`)

    // Adicionar job individual para cada usuário
    const jobs = integrations.map((integration) =>
      syncFacebookQueue.add(
        'sync-user',
        {
          userId: integration.user_id,
          forceFullSync: false,
        },
        {
          priority: 5, // Menor prioridade que syncs manuais
        }
      )
    )

    await Promise.all(jobs)

    logger.info('Facebook auto-sync jobs scheduled', {
      jobId: job.id,
      usersCount: integrations.length,
    })

    return {
      success: true,
      usersScheduled: integrations.length,
    }
  } catch (error) {
    logger.error('Facebook auto-sync failed', {
      jobId: job.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

/**
 * Registrar workers para processar jobs
 */
export function startSyncFacebookWorker(): void {
  // Worker para sync individual
  syncFacebookQueue.process('sync-user', async (job) => {
    return await processSyncFacebookJob(job as Job<FacebookSyncJobData>)
  })

  // Worker para auto-sync de todos os usuários
  syncFacebookQueue.process('auto-sync-all-users', async (job) => {
    return await processAutoSyncAllUsers(job)
  })

  // Event listeners
  syncFacebookQueue.on('completed', (job, result) => {
    logger.info('Facebook sync job completed successfully', {
      jobId: job.id,
      jobName: job.name,
      result,
    })
  })

  syncFacebookQueue.on('failed', (job, error) => {
    logger.error('Facebook sync job failed', {
      jobId: job?.id,
      jobName: job?.name,
      error: error.message,
      attempts: job?.attemptsMade,
    })
  })

  syncFacebookQueue.on('stalled', (job) => {
    logger.warn('Facebook sync job stalled', {
      jobId: job.id,
      jobName: job.name,
    })
  })

  // Agendar cron job para sincronização automática (a cada 6 horas)
  syncFacebookQueue
    .add(
      'auto-sync-all-users',
      { userId: 'SYSTEM' }, // Placeholder - será substituído no processamento
      {
        repeat: {
          cron: '0 */6 * * *', // A cada 6 horas
        },
        jobId: 'facebook-auto-sync',
      }
    )
    .catch((error) => {
      logger.error('Failed to schedule Facebook auto-sync cron', {
        error: error.message,
      })
    })

  logger.info('Sync Facebook Ads worker started', {
    queue: syncFacebookQueue.name,
  })
}

/**
 * Parar worker gracefully
 */
export async function stopSyncFacebookWorker(): Promise<void> {
  await syncFacebookQueue.close()
  logger.info('Sync Facebook Ads worker stopped')
}

/**
 * Função helper para adicionar sync manual
 */
export async function scheduleFacebookSync(userId: string, forceFullSync = false): Promise<Job> {
  logger.info('Scheduling manual Facebook sync', { userId, forceFullSync })

  return syncFacebookQueue.add(
    'sync-user',
    {
      userId,
      forceFullSync,
    },
    {
      priority: 1, // Alta prioridade para syncs manuais
    }
  )
}

/**
 * Função helper para obter stats da queue
 */
export async function getFacebookSyncQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    syncFacebookQueue.getWaitingCount(),
    syncFacebookQueue.getActiveCount(),
    syncFacebookQueue.getCompletedCount(),
    syncFacebookQueue.getFailedCount(),
    syncFacebookQueue.getDelayedCount(),
  ])

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  }
}
