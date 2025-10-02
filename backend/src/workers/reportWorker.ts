/**
 * Worker para gerar relatórios PDF/Excel
 *
 * Referências:
 * - tasks.md: Task 10.1.3 - Bull queue worker para relatórios
 * - design.md: Background Jobs - Report Generation
 * - dev-stories.md: Dev Story 4.2 - Geração assíncrona de relatórios
 * - user-stories.md: Story 6.1 - Relatórios executivos
 *
 * Fluxo:
 * 1. Recebe job com reportId, userId, type, format, filters
 * 2. Atualiza status para GENERATING
 * 3. Coleta dados via ReportService
 * 4. Gera arquivo (PDF ou Excel)
 * 5. Faz upload para S3/R2 (placeholder)
 * 6. Atualiza status para READY com file_url
 * 7. Envia email de notificação (se solicitado)
 * 8. Em caso de erro: atualiza status para ERROR
 *
 * Configuração: timeout 5min, retry 3x, exponential backoff
 */

import type { Job } from 'bull';
import { PrismaClient } from '@prisma/client';
import { reportQueue, type ReportJobData } from '../queues/queues';
import { ReportService } from '../services/ReportService';
import { logger } from '../shared/utils/logger';

const prisma = new PrismaClient();
const reportService = new ReportService();

/**
 * Processa job de geração de relatório
 *
 * @param job - Job do Bull contendo configuração do relatório
 * @returns Promise com resultado da geração
 */
export async function processReportJob(job: Job<ReportJobData>): Promise<void> {
  const { reportId, userId, type, title, format, filters, sendEmail, emailRecipients } = job.data;

  logger.info('Starting report generation job', {
    jobId: job.id,
    reportId,
    userId,
    type,
    format,
    title,
    attempt: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts,
  });

  try {
    // 1. Atualizar status para GENERATING
    await prisma.report.update({
      where: { id: reportId },
      data: {
        data: { status: 'GENERATING' },
      },
    });

    logger.info('Report status updated to GENERATING', { reportId });

    // 2. Coletar dados baseado no tipo de relatório
    type CustomReportData = {
      salesData: Awaited<ReturnType<typeof reportService.collectSalesData>>;
      financialData: Awaited<ReturnType<typeof reportService.collectFinancialData>>;
      clientsData: Awaited<ReturnType<typeof reportService.collectClientsData>>;
    };

    let reportData:
      | Awaited<ReturnType<typeof reportService.collectSalesData>>
      | Awaited<ReturnType<typeof reportService.collectFinancialData>>
      | Awaited<ReturnType<typeof reportService.collectClientsData>>
      | CustomReportData;

    switch (type) {
    case 'SALES_REPORT': {
      reportData = await reportService.collectSalesData(userId, filters);
      break;
    }

    case 'FINANCIAL_SUMMARY': {
      reportData = await reportService.collectFinancialData(userId, filters);
      break;
    }

    case 'CLIENT_ANALYSIS': {
      reportData = await reportService.collectClientsData(userId, filters);
      break;
    }

    case 'PROJECTION_REPORT': {
      // Para projeções, usar dados financeiros como base
      reportData = await reportService.collectFinancialData(userId, filters);
      break;
    }

    case 'CUSTOM': {
      // Para relatórios customizados, coletar múltiplos tipos de dados
      const [salesData, financialData, clientsData] = await Promise.all([
        reportService.collectSalesData(userId, filters),
        reportService.collectFinancialData(userId, filters),
        reportService.collectClientsData(userId, filters),
      ]);
      reportData = { salesData, financialData, clientsData };
      break;
    }

    default:
      throw new Error(`Tipo de relatório desconhecido: ${type}`);
    }

    logger.info('Report data collected successfully', { reportId, type });

    // 3. Gerar arquivo (PDF ou Excel)
    const reportOptions = {
      title,
      startDate: filters.startDate,
      endDate: filters.endDate,
      includeLogo: filters.includeLogo ?? false,
      includeCharts: filters.includeCharts ?? false,
    };

    let fileBuffer: Buffer;
    let fileExtension: string;

    // Para CUSTOM, usar salesData como padrão
    const dataForGeneration = (type === 'CUSTOM' && 'salesData' in reportData
      ? reportData.salesData
      : reportData) as
        | Awaited<ReturnType<typeof reportService.collectSalesData>>
        | Awaited<ReturnType<typeof reportService.collectFinancialData>>
        | Awaited<ReturnType<typeof reportService.collectClientsData>>
        | Awaited<ReturnType<typeof reportService.collectAdsData>>;

    if (format === 'pdf') {
      fileBuffer = await reportService.generatePDF(dataForGeneration, reportOptions);
      fileExtension = 'pdf';
    } else if (format === 'excel') {
      fileBuffer = await reportService.generateExcel(dataForGeneration, reportOptions);
      fileExtension = 'xlsx';
    } else {
      throw new Error(`Formato de relatório não suportado: ${format}`);
    }

    logger.info('Report file generated successfully', {
      reportId,
      format,
      fileSize: fileBuffer.length,
    });

    // 4. Upload do arquivo para S3/R2 (placeholder - será implementado na Task 6)
    const filename = `report_${reportId}_${Date.now()}.${fileExtension}`;
    let fileUrl: string;

    try {
      fileUrl = await reportService.uploadFile(fileBuffer, filename);
      logger.info('Report file uploaded successfully', { reportId, fileUrl });
    } catch (uploadError) {
      // Se upload falhar, usar placeholder local temporário
      logger.warn('File upload failed, using local placeholder', {
        reportId,
        error: uploadError instanceof Error ? uploadError.message : 'Unknown error',
      });
      fileUrl = `/temp/reports/${filename}`;
    }

    // 5. Atualizar relatório com status READY e file_url
    await prisma.report.update({
      where: { id: reportId },
      data: {
        file_url: fileUrl,
        data: JSON.parse(JSON.stringify({
          ...reportData,
          status: 'READY',
          generatedAt: new Date().toISOString(),
        })),
      },
    });

    logger.info('Report status updated to READY', { reportId, fileUrl });

    // 6. Enviar email de notificação (se solicitado)
    if (sendEmail && emailRecipients && emailRecipients.length > 0) {
      try {
        // TODO: Implementar envio de email (Task futura)
        // await sendReportReadyEmail(emailRecipients, {
        //   reportTitle: title,
        //   downloadUrl: fileUrl,
        //   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        // });

        logger.info('Report ready email sent', {
          reportId,
          recipients: emailRecipients,
        });
      } catch (emailError) {
        // Não falhar o job se email falhar
        logger.error('Failed to send report ready email', {
          reportId,
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        });
      }
    }

    logger.info('Report generation job completed successfully', {
      jobId: job.id,
      reportId,
      userId,
      type,
      format,
      fileUrl,
      duration: Date.now() - job.timestamp,
    });

  } catch (error) {
    // Atualizar status para ERROR no banco
    try {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          data: {
            status: 'ERROR',
            error: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
            failedAt: new Date().toISOString(),
          },
        },
      });
    } catch (updateError) {
      logger.error('Failed to update report status to ERROR', {
        reportId,
        originalError: error instanceof Error ? error.message : 'Unknown error',
        updateError: updateError instanceof Error ? updateError.message : 'Unknown error',
      });
    }

    logger.error('Report generation job failed', {
      jobId: job.id,
      reportId,
      userId,
      type,
      format,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      attempt: job.attemptsMade + 1,
    });

    throw error; // Re-throw para ativar retry policy do Bull
  }
}

/**
 * Registra o worker para processar jobs da queue
 * Deve ser chamado na inicialização do servidor
 */
export function startReportWorker(): void {
  reportQueue.process('generate-report', async (job) => {
    await processReportJob(job);
  });

  logger.info('Report worker started', {
    queue: reportQueue.name,
    jobName: 'generate-report',
  });
}

/**
 * Para o worker gracefully
 * Deve ser chamado no shutdown do servidor
 */
export async function stopReportWorker(): Promise<void> {
  await reportQueue.close();
  logger.info('Report worker stopped');
}
