/**
 * Worker para enviar mensagens WhatsApp
 *
 * Referências:
 * - tasks.md: Task 4.0.3 - Implementar workers
 * - design.md: Background Jobs - WhatsApp Messages
 *
 * Execução: On-demand (disparado por ações do usuário)
 * Responsabilidade: Chamar WhatsAppService.sendMessage para enviar mensagens via API WhatsApp Business
 */

import type { Job } from 'bull';
import { whatsappQueue, type WhatsAppJobData } from '../queues/queues';
import { logger } from '../shared/utils/logger';
import { whatsAppService } from '../services/WhatsAppService';

/**
 * Processa job de envio de mensagem WhatsApp
 *
 * @param job - Job do Bull contendo dados da mensagem
 * @returns Promise com resultado do envio
 */
export async function processWhatsAppJob(job: Job<WhatsAppJobData>): Promise<void> {
  const { empresaId, to, templateName, templateParams, message } = job.data;

  logger.info('Starting WhatsApp message job', {
    jobId: job.id,
    empresaId,
    to,
    templateName,
    templateParams,
    message,
    attempt: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts,
  });

  try {
    let result;

    if (templateName) {
      // Enviar template message
      const variables = templateParams ? Object.values(templateParams) : [];
      result = await whatsAppService.sendTemplate(
        empresaId, // userId
        templateName,
        to,
        variables
      );
    } else {
      // Enviar text message
      result = await whatsAppService.sendText(
        empresaId, // userId
        to,
        message
      );
    }

    if (!result.success) {
      throw new Error(result.error || 'Failed to send WhatsApp message');
    }

    logger.info('WhatsApp message job completed successfully', {
      jobId: job.id,
      empresaId,
      to,
      messageId: result.messageId,
      result,
    });
  } catch (error) {
    logger.error('WhatsApp message job failed', {
      jobId: job.id,
      empresaId,
      to,
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
export function startWhatsAppWorker(): void {
  whatsappQueue.process(async (job) => {
    await processWhatsAppJob(job);
  });

  logger.info('WhatsApp worker started', {
    queue: whatsappQueue.name,
  });
}

/**
 * Para o worker gracefully
 * Deve ser chamado no shutdown do servidor
 */
export async function stopWhatsAppWorker(): Promise<void> {
  await whatsappQueue.close();
  logger.info('WhatsApp worker stopped');
}
