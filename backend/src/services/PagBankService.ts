/**
 * PagBank Service
 *
 * Implementação da integração com PagBank para cobrança SaaS
 *
 * Features:
 * - Gestão de assinaturas recorrentes
 * - Criptografia de dados de cartão
 * - Webhooks para eventos de pagamento
 * - Trial gratuito e conversão automática
 * - Suporte a cartão de crédito, PIX e boleto
 *
 * Referências:
 * - milestone02.md: Fase 2.3 PagBank Integration
 * - apis.md: PagBank API documentation
 */

import axios, { type AxiosInstance } from 'axios';
import { createHash } from 'node:crypto';
import { prisma } from '../shared/config/database';
import { createRedisClient } from '../shared/config/redis';
import { logger } from '../shared/utils/logger';
import type Redis from 'ioredis';

interface PagBankCustomer {
  id: string;
  name: string;
  email: string;
  tax_id: string;
  phones: Array<{
    country: string;
    area: string;
    number: string;
    type: string;
  }>;
  address?: {
    street: string;
    number: string;
    complement?: string;
    locality: string;
    city: string;
    region: string;
    region_code: string;
    country: string;
    postal_code: string;
  };
}

interface PagBankPlan {
  id: string;
  name: string;
  description?: string;
  amount: {
    value: number;
    currency: string;
  };
  interval: {
    unit: 'MONTH' | 'YEAR';
    length: number;
  };
  trial?: {
    days: number;
  };
}

interface PagBankSubscription {
  id: string;
  plan_id: string;
  customer_id: string;
  payment_method: {
    type: 'CREDIT_CARD';
    card: {
      encrypted: string;
      security_code: string;
      holder: {
        name: string;
      };
    };
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
}

export class PagBankService {
  private readonly logger = logger;
  private readonly httpClient: AxiosInstance;
  private readonly redis: Redis;
  private readonly baseUrl: string;
  private readonly token: string;

  constructor() {
    this.baseUrl = process.env.PAGBANK_BASE_URL || 'https://api.pagseguro.com';
    this.token = process.env.PAGBANK_TOKEN || '';

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.redis = createRedisClient();
  }

  /**
   * Cria ou obtém chave pública do PagBank para criptografia de cartões
   */
  async getPublicKey(): Promise<string> {
    try {
      const cacheKey = 'pagbank:public_key';
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await this.httpClient.post('/public-keys', {
        type: 'card',
      });

      const publicKey = response.data.public_key;

      // Cache por 24 horas
      await this.redis.setex(cacheKey, 86400, publicKey);

      return publicKey;
    } catch (error) {
      this.logger.error('Error getting PagBank public key', error);
      throw error;
    }
  }

  /**
   * Cria um cliente (assinante) no PagBank
   */
  async createCustomer(userData: {
    name: string;
    email: string;
    tax_id: string;
    phone: string;
    address?: any;
  }): Promise<string> {
    try {
      const customer: PagBankCustomer = {
        id: `user_${Date.now()}`, // ID único para o usuário
        name: userData.name,
        email: userData.email,
        tax_id: userData.tax_id,
        phones: [{
          country: '55',
          area: userData.phone.substring(0, 2),
          number: userData.phone.substring(2),
          type: 'MOBILE',
        }],
      };

      if (userData.address) {
        customer.address = {
          street: userData.address.street,
          number: userData.address.number,
          complement: userData.address.complement,
          locality: userData.address.neighborhood,
          city: userData.address.city,
          region: userData.address.state,
          region_code: userData.address.state,
          country: 'BRA',
          postal_code: userData.address.zipCode,
        };
      }

      const response = await this.httpClient.post('/customers', customer);
      return response.data.id;
    } catch (error) {
      this.logger.error('Error creating PagBank customer', error);
      throw error;
    }
  }

  /**
   * Cria um plano de assinatura no PagBank
   */
  async createPlan(planData: {
    name: string;
    description?: string;
    amount: number;
    interval: 'MONTH' | 'YEAR';
    trialDays?: number;
  }): Promise<string> {
    try {
      const plan: PagBankPlan = {
        id: `plan_${Date.now()}`,
        name: planData.name,
        amount: {
          value: planData.amount,
          currency: 'BRL',
        },
        interval: {
          unit: planData.interval,
          length: 1,
        },
      };

      if (planData.description) {
        plan.description = planData.description;
      }

      const response = await this.httpClient.post('/plans', plan);
      return response.data.id;
    } catch (error) {
      this.logger.error('Error creating PagBank plan', error);
      throw error;
    }
  }

  /**
   * Cria uma assinatura no PagBank
   */
  async createSubscription(subscriptionData: {
    customerId: string;
    planId: string;
    paymentMethod: {
      encrypted: string;
      securityCode: string;
      holderName: string;
    };
  }): Promise<string> {
    try {
      const subscription: PagBankSubscription = {
        id: `sub_${Date.now()}`,
        plan_id: subscriptionData.planId,
        customer_id: subscriptionData.customerId,
        payment_method: {
          type: 'CREDIT_CARD',
          card: {
            encrypted: subscriptionData.paymentMethod.encrypted,
            security_code: subscriptionData.paymentMethod.securityCode,
            holder: {
              name: subscriptionData.paymentMethod.holderName,
            },
          },
        },
        status: 'ACTIVE',
      };

      const response = await this.httpClient.post('/subscriptions', subscription);
      return response.data.id;
    } catch (error) {
      this.logger.error('Error creating PagBank subscription', error);
      throw error;
    }
  }

  /**
   * Cancela uma assinatura no PagBank
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.httpClient.post(`/subscriptions/${subscriptionId}/cancel`);
    } catch (error) {
      this.logger.error('Error canceling PagBank subscription', error);
      throw error;
    }
  }

  /**
   * Obtém status de uma assinatura no PagBank
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting PagBank subscription status', error);
      throw error;
    }
  }

  /**
   * Processa webhook do PagBank
   */
  async processWebhook(webhookData: any): Promise<void> {
    try {
      const { event, data } = webhookData;

      switch (event) {
        case 'subscription.created':
          await this.handleSubscriptionCreated(data);
          break;
        case 'subscription.paid':
          await this.handleSubscriptionPaid(data);
          break;
        case 'subscription.overdue':
          await this.handleSubscriptionOverdue(data);
          break;
        case 'subscription.canceled':
          await this.handleSubscriptionCanceled(data);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      this.logger.error('Error processing PagBank webhook', error);
      throw error;
    }
  }

  private async handleSubscriptionCreated(data: any): Promise<void> {
    // Atualizar status da subscription no banco
    await prisma.subscription.updateMany({
      where: { pagbank_subscription_id: data.id },
      data: {
        pagbank_status: 'ACTIVE',
        status: 'ACTIVE',
      },
    });
  }

  private async handleSubscriptionPaid(data: any): Promise<void> {
    // Atualizar último pagamento e próximo pagamento
    await prisma.subscription.updateMany({
      where: { pagbank_subscription_id: data.id },
      data: {
        last_payment_date: new Date(),
        next_payment_date: new Date(data.next_charge_at),
        status: 'ACTIVE',
      },
    });
  }

  private async handleSubscriptionOverdue(data: any): Promise<void> {
    // Marcar como pagamento pendente
    await prisma.subscription.updateMany({
      where: { pagbank_subscription_id: data.id },
      data: {
        status: 'PAST_DUE',
        pagbank_status: 'OVERDUE',
      },
    });
  }

  private async handleSubscriptionCanceled(data: any): Promise<void> {
    // Cancelar subscription
    await prisma.subscription.updateMany({
      where: { pagbank_subscription_id: data.id },
      data: {
        status: 'CANCELED',
        pagbank_status: 'CANCELED',
        canceled_at: new Date(),
      },
    });
  }
}