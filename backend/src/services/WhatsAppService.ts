/**
 * WhatsApp Business API Service
 *
 * Responsabilidades:
 * - Envio de mensagens via WhatsApp Cloud API
 * - Gerenciamento de templates
 * - Processamento de webhooks
 * - Verificação de status da conta
 *
 * Referências:
 * - apis.md: WhatsApp Business API documentation
 * - milestone02.md: Fase 2.1 WhatsApp Business API
 * - whatsapp-implementation-plan.md: Templates e estrutura
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../shared/utils/logger';
import { IntegrationRepository } from '../repositories/IntegrationRepository';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion?: string;
}

export interface TemplateMessage {
  name: string;
  language: string;
  components: Array<{
    type: 'header' | 'body' | 'footer';
    parameters?: Array<{
      type: 'text';
      text: string;
    }>;
  }>;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text' | 'template' | 'interactive';
  content: any;
}

export class WhatsAppService {
  private httpClient: AxiosInstance;
  private integrationRepo: IntegrationRepository;
  private readonly apiVersion: string = 'v18.0'; // WhatsApp API version
  private readonly baseUrl: string = 'https://graph.facebook.com';

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds
    });

    this.integrationRepo = new IntegrationRepository();

    // Add request/response interceptors for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        logger.info('WhatsApp API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('WhatsApp API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        logger.info('WhatsApp API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('WhatsApp API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          error: error.response?.data || error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get WhatsApp configuration for a user
   */
  private async getUserConfig(userId: string): Promise<WhatsAppConfig | null> {
    try {
      const integration = await this.integrationRepo.findByUserAndProvider(
        userId,
        'WHATSAPP'
      );

      if (!integration || integration.status !== 'CONNECTED') {
        return null;
      }

      const config = integration.config as unknown as WhatsAppConfig;
      return {
        ...config,
        apiVersion: config.apiVersion || this.apiVersion,
      };
    } catch (error: any) {
      logger.error('Error getting WhatsApp config', { userId, error: error.message });
      return null;
    }
  }

  /**
   * Send template message
   */
  async sendTemplate(
    userId: string,
    templateName: string,
    to: string,
    variables: string[] = []
  ): Promise<SendMessageResult> {
    try {
      const config = await this.getUserConfig(userId);
      if (!config) {
        return {
          success: false,
          error: 'WhatsApp not configured for this user',
        };
      }

      // Build template components with variables
      const components = this.buildTemplateComponents(templateName, variables);

      const messageData = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_BR' },
          components,
        },
      };

      const response = await this.httpClient.post(
        `/${config.apiVersion}/${config.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
      };
    } catch (error: any) {
      logger.error('Error sending WhatsApp template', {
        userId,
        templateName,
        to,
        error: error.response?.data || error.message,
      });

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send text message (for replies within 24h window)
   */
  async sendText(
    userId: string,
    to: string,
    message: string
  ): Promise<SendMessageResult> {
    try {
      const config = await this.getUserConfig(userId);
      if (!config) {
        return {
          success: false,
          error: 'WhatsApp not configured for this user',
        };
      }

      const messageData = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: { body: message },
      };

      const response = await this.httpClient.post(
        `/${config.apiVersion}/${config.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
      };
    } catch (error: any) {
      logger.error('Error sending WhatsApp text message', {
        userId,
        to,
        error: error.response?.data || error.message,
      });

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Get account status and phone number info
   */
  async getAccountStatus(userId: string): Promise<any> {
    try {
      const config = await this.getUserConfig(userId);
      if (!config) {
        throw new Error('WhatsApp not configured for this user');
      }

      const response = await this.httpClient.get(
        `/${config.apiVersion}/${config.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Error getting WhatsApp account status', {
        userId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Get approved templates
   */
  async getApprovedTemplates(userId: string): Promise<any[]> {
    try {
      const config = await this.getUserConfig(userId);
      if (!config) {
        throw new Error('WhatsApp not configured for this user');
      }

      const response = await this.httpClient.get(
        `/${config.apiVersion}/${config.businessAccountId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
          },
          params: {
            status: 'APPROVED',
          },
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      logger.error('Error getting WhatsApp templates', {
        userId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Handle incoming webhook - identifica o usuário automaticamente
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      logger.info('Processing WhatsApp webhook', {
        payload: JSON.stringify(payload),
      });

      // Verificar se é uma mensagem válida
      if (!payload.object || payload.object !== 'whatsapp_business_account') {
        throw new Error('Invalid webhook payload');
      }

      // Identificar o usuário baseado no business_account_id ou phone_number_id
      let userId: string | null = null;

      if (payload.entry && payload.entry.length > 0) {
        const entry = payload.entry[0];

        // Tentar identificar por business_account_id
        if (entry.id) {
          const integration = await this.integrationRepo.findByBusinessAccountId(entry.id);
          if (integration) {
            userId = integration.user_id;
          }
        }

        // Se não encontrou, tentar por phone_number_id nos changes
        if (!userId && entry.changes) {
          for (const change of entry.changes) {
            if (change.value && change.value.metadata && change.value.metadata.phone_number_id) {
              const integration = await this.integrationRepo.findByPhoneNumberId(
                change.value.metadata.phone_number_id
              );
              if (integration) {
                userId = integration.user_id;
                break;
              }
            }
          }
        }
      }

      if (!userId) {
        logger.warn('Could not identify user for WhatsApp webhook', {
          payload: JSON.stringify(payload),
        });
        return;
      }

      // Process different webhook types
      if (payload.entry) {
        for (const entry of payload.entry) {
          if (entry.messaging) {
            await this.processMessages(userId, entry.messaging);
          }
          if (entry.statuses) {
            await this.processStatuses(userId, entry.statuses);
          }
        }
      }
    } catch (error) {
      logger.error('Error processing WhatsApp webhook', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Process incoming messages
   */
  private async processMessages(userId: string, messages: any[]): Promise<void> {
    for (const message of messages) {
      try {
        // Extract message data
        const messageData: WebhookMessage = {
          id: message.id,
          from: message.from,
          timestamp: message.timestamp,
          type: message.type,
          content: message[message.type], // text, image, etc.
        };

        logger.info('Received WhatsApp message', {
          userId,
          messageId: messageData.id,
          from: messageData.from,
          type: messageData.type,
        });

        // TODO: Implement message processing logic
        // - Store in database
        // - Trigger automations
        // - Send responses if needed

      } catch (error) {
        logger.error('Error processing individual message', {
          userId,
          messageId: message.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Process message delivery statuses
   */
  private async processStatuses(userId: string, statuses: any[]): Promise<void> {
    for (const status of statuses) {
      try {
        logger.info('Received WhatsApp status update', {
          userId,
          messageId: status.id,
          status: status.status,
          timestamp: status.timestamp,
        });

        // TODO: Update message status in database
        // - sent, delivered, read, failed

      } catch (error) {
        logger.error('Error processing message status', {
          userId,
          messageId: status.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Build template components with variables
   */
  private buildTemplateComponents(
    templateName: string,
    variables: string[]
  ): any[] {
    const templates: Record<string, any[]> = {
      entrega_confirmada: [
        {
          type: 'body',
          parameters: variables.map((variable, index) => ({
            type: 'text',
            text: variable,
          })),
        },
      ],
      pagamento_lembrete: [
        {
          type: 'body',
          parameters: variables.map((variable, index) => ({
            type: 'text',
            text: variable,
          })),
        },
      ],
      pagamento_confirmado: [
        {
          type: 'body',
          parameters: variables.map((variable, index) => ({
            type: 'text',
            text: variable,
          })),
        },
      ],
    };

    return templates[templateName] || [];
  }

  /**
   * Format phone number to WhatsApp format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if not present (assuming Brazil)
    if (cleaned.length === 11 && cleaned.startsWith('9')) {
      // Mobile number without country code
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      // Landline without country code
      return `55${cleaned}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      // Already has country code
      return cleaned;
    }

    // Return as-is if format is unclear
    return cleaned;
  }
}

// Export singleton instance
export const whatsAppService = new WhatsAppService();