/**
 * Bull Queues Definitions
 * 
 * Referências:
 * - tasks.md: Task 4.0.2 - Criar todas as queues necessárias
 * - design.md: Background Jobs with Bull
 * 
 * Queues disponíveis:
 * 1. syncCoinzzQueue: Sincronizar vendas do Coinzz (cron: a cada hora)
 * 2. syncFacebookQueue: Sincronizar anúncios do Facebook Ads (cron: a cada 6 horas)
 * 3. whatsappQueue: Enviar mensagens WhatsApp (on-demand)
 * 4. reportQueue: Gerar relatórios (on-demand)
 */

import { createQueue } from './index';

/**
 * Interface para dados de sincronização Coinzz
 */
export interface SyncCoinzzJobData {
  empresaId: string;
  forceFullSync?: boolean; // Se true, ignora lastSyncAt e sincroniza tudo
}

/**
 * Interface para dados de sincronização Facebook Ads
 * Atualizado para Task 6.1/6.2
 */
export interface SyncFacebookJobData {
  userId: string; // user_id do usuário/empresa
  forceFullSync?: boolean;
  adAccountId?: string; // Opcional: específico ad account (padrão: todos)
  
  // Legacy fields (deprecated - manter por compatibilidade temporária)
  empresaId?: string;
}

/**
 * Interface para envio de mensagens WhatsApp
 */
export interface WhatsAppJobData {
  empresaId: string;
  to: string; // Número do destinatário
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

/**
 * Interface para geração de relatórios
 * Atualizado para Task 10 - Sistema de Relatórios PDF/Excel
 */
export interface ReportJobData {
  reportId: string; // ID do relatório criado no banco
  userId: string; // Usuário que solicitou
  type: string; // Tipo do relatório (ReportType do Prisma)
  title: string; // Título do relatório
  format: string; // Formato (pdf, excel, csv)
  filters: {
    startDate: Date;
    endDate: Date;
    clientIds?: string[];
    tagIds?: string[];
    status?: string[];
    includeCharts?: boolean;
    includeLogo?: boolean;
    customFields?: string[];
  };
  sendEmail?: boolean; // Enviar email quando pronto
  emailRecipients?: string[]; // Lista de emails
  
  // Campos antigos (deprecated - manter compatibilidade)
  empresaId?: string;
  reportType?: 'sales' | 'leads' | 'performance' | 'custom';
  startDate?: string;
  endDate?: string;
}

/**
 * Queue para sincronizar vendas do Coinzz
 * Cron: '0 * * * *' (a cada hora, no minuto 0)
 * Referência: tasks.md Task 4.0.2
 */
export const syncCoinzzQueue = createQueue<SyncCoinzzJobData>('sync-coinzz', {
  repeat: {
    cron: '0 * * * *', // Executa toda hora no minuto 0
    tz: 'America/Sao_Paulo', // Timezone Brasil
  },
});

/**
 * Queue para sincronizar anúncios do Facebook Ads
 * Cron: 0 asterisk-slash-6 asterisk asterisk asterisk (a cada 6 horas, no minuto 0)
 * Referência: tasks.md Task 4.0.2
 */
export const syncFacebookQueue = createQueue<SyncFacebookJobData>('sync-facebook', {
  repeat: {
    cron: '0 */6 * * *', // Executa a cada 6 horas no minuto 0
    tz: 'America/Sao_Paulo',
  },
});

/**
 * Queue para enviar mensagens WhatsApp
 * On-demand (sem cron)
 * Referência: tasks.md Task 4.0.2
 */
export const whatsappQueue = createQueue<WhatsAppJobData>('whatsapp');

/**
 * Queue para gerar relatórios
 * On-demand (sem cron)
 * Referência: tasks.md Task 4.0.2
 */
export const reportQueue = createQueue<ReportJobData>('report');

/**
 * Exporta array de todas as queues para facilitar operações em lote
 * (ex: graceful shutdown, health checks, Bull Board)
 */
export const allQueues = [
  syncCoinzzQueue,
  syncFacebookQueue,
  whatsappQueue,
  reportQueue,
];
