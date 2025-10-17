/**
 * Testes Unitários do PagBankService
 *
 * ⚠️ AVISO IMPORTANTE:
 * Estes testes validam a lógica de negócio do serviço.
 * Para testar integração completa com PagBank API, são necessárias:
 *
 * 🔐 CREDENCIAIS DE TESTE DO PAGBANK:
 * - PAGBANK_API_TOKEN: Token de API para ambiente de teste
 * - PAGBANK_PUBLIC_KEY: Chave pública para criptografia
 *
 * 📋 CONFIGURAÇÃO PARA TESTES COMPLETOS:
 * 1. Obter credenciais no painel de desenvolvedor PagBank
 * 2. Configurar variáveis de ambiente no .env.test
 * 3. Executar testes com --run (para evitar timeouts)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PagBankService } from '../../services/PagBankService';
import { prisma } from '../../shared/config/database';

// Mock do Redis
vi.mock('../../shared/config/redis', () => ({
  createRedisClient: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
  })),
}));

// Mock do Axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

describe('PagBankService Unit Tests', () => {
  let pagBankService: PagBankService;
  let mockAxios: any;
  let mockRedis: any;

  beforeEach(async () => {
    // Limpar mocks
    vi.clearAllMocks();

    // Setup mocks
    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockRedis = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      expire: vi.fn(),
    };

    // Mock do axios.create
    const axios = await import('axios');
    axios.default.create = vi.fn(() => mockAxios);

    // Mock do createRedisClient
    const redis = await import('../../shared/config/redis');
    redis.createRedisClient = vi.fn(() => mockRedis);

    // Criar instância do serviço
    pagBankService = new PagBankService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPublicKey', () => {
    it('deve retornar erro quando não há token configurado', async () => {
      // Remover variável de ambiente
      delete process.env.PAGBANK_API_TOKEN;

      const result = await pagBankService.getPublicKey();

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/credenciais|token|configura/i);
    });

    it('deve buscar chave do cache Redis primeiro', async () => {
      process.env.PAGBANK_API_TOKEN = 'test_token';
      mockRedis.get.mockResolvedValue('cached_public_key');

      const result = await pagBankService.getPublicKey();

      expect(mockRedis.get).toHaveBeenCalledWith('pagbank:public_key');
      expect(mockAxios.get).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toBe('cached_public_key');
    });

    it('deve buscar chave da API quando não está em cache', async () => {
      process.env.PAGBANK_API_TOKEN = 'test_token';
      mockRedis.get.mockResolvedValue(null);
      mockAxios.get.mockResolvedValue({
        data: { public_key: 'api_public_key' }
      });

      const result = await pagBankService.getPublicKey();

      expect(mockRedis.get).toHaveBeenCalledWith('pagbank:public_key');
      expect(mockAxios.get).toHaveBeenCalledWith('/public-keys');
      expect(mockRedis.set).toHaveBeenCalledWith('pagbank:public_key', 'api_public_key', 'EX', 3600);
      expect(result.success).toBe(true);
      expect(result.data).toBe('api_public_key');
    });

    it('deve tratar erros da API PagBank', async () => {
      process.env.PAGBANK_API_TOKEN = 'test_token';
      mockRedis.get.mockResolvedValue(null);
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      const result = await pagBankService.getPublicKey();

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/erro|falha/i);
    });
  });

  describe('createCustomer', () => {
    const customerData = {
      name: 'João Silva',
      email: 'joao@example.com',
      tax_id: '12345678900',
      phone: '11999999999',
      address: {
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234567'
      }
    };

    it('deve validar dados obrigatórios', async () => {
      const result = await pagBankService.createCustomer({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/obrigatórios|requeridos/i);
    });

    it('deve criar cliente com sucesso', async () => {
      process.env.PAGBANK_API_TOKEN = 'test_token';
      mockAxios.post.mockResolvedValue({
        data: {
          id: 'cus_test_123',
          status: 'ACTIVE'
        }
      });

      const result = await pagBankService.createCustomer(customerData);

      expect(mockAxios.post).toHaveBeenCalledWith('/customers', expect.objectContaining({
        name: customerData.name,
        email: customerData.email,
        tax_id: customerData.tax_id,
        phones: [expect.objectContaining({
          type: 'MOBILE',
          number: customerData.phone
        })],
        address: expect.objectContaining({
          street: customerData.address.street,
          number: customerData.address.number
        })
      }));

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', 'cus_test_123');
    });

    it('deve informar necessidade de credenciais', async () => {
      delete process.env.PAGBANK_API_TOKEN;

      const result = await pagBankService.createCustomer(customerData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/credenciais|token|configura/i);
    });
  });

  describe('createSubscription', () => {
    const subscriptionData = {
      customer_id: 'cus_test_123',
      plan_id: 'plan_monthly',
      payment_method: {
        type: 'CREDIT_CARD',
        card: {
          number: '4111111111111111',
          exp_month: '12',
          exp_year: '2026',
          security_code: '123',
          holder: {
            name: 'João Silva'
          }
        }
      }
    };

    it('deve validar dados obrigatórios', async () => {
      const result = await pagBankService.createSubscription({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/obrigatórios|requeridos/i);
    });

    it('deve criar assinatura com sucesso', async () => {
      process.env.PAGBANK_API_TOKEN = 'test_token';
      mockAxios.post.mockResolvedValue({
        data: {
          id: 'sub_test_123',
          status: 'ACTIVE',
          current_period: {
            start_at: '2024-01-01T00:00:00Z',
            end_at: '2024-02-01T00:00:00Z'
          }
        }
      });

      const result = await pagBankService.createSubscription(subscriptionData);

      expect(mockAxios.post).toHaveBeenCalledWith('/subscriptions', expect.objectContaining({
        customer_id: subscriptionData.customer_id,
        plan_id: subscriptionData.plan_id,
        payment_method: subscriptionData.payment_method
      }));

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', 'sub_test_123');
    });
  });

  describe('cancelSubscription', () => {
    it('deve cancelar assinatura com sucesso', async () => {
      process.env.PAGBANK_API_TOKEN = 'test_token';
      mockAxios.delete.mockResolvedValue({
        data: {
          id: 'sub_test_123',
          status: 'CANCELED'
        }
      });

      const result = await pagBankService.cancelSubscription('sub_test_123');

      expect(mockAxios.delete).toHaveBeenCalledWith('/subscriptions/sub_test_123');
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('status', 'CANCELED');
    });

    it('deve informar necessidade de credenciais', async () => {
      delete process.env.PAGBANK_API_TOKEN;

      const result = await pagBankService.cancelSubscription('sub_test_123');

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/credenciais|token|configura/i);
    });
  });

  describe('processWebhook', () => {
    const webhookPayload = {
      event: 'PAYMENT_RECEIVED',
      subscription_id: 'sub_test_123',
      status: 'ACTIVE',
      payment_date: '2024-01-15T10:00:00Z'
    };

    it('deve processar webhook de pagamento recebido', async () => {
      // Criar assinatura de teste no banco
      const subscription = await prisma.subscription.create({
        data: {
          id: 'sub_test_123',
          user_id: 'user_test',
          plan_id: 'plan_test',
          status: 'ACTIVE',
          current_period_start: new Date(),
          current_period_end: new Date(),
          pagbank_subscription_id: 'sub_test_123'
        }
      });

      const result = await pagBankService.processWebhook(webhookPayload);

      expect(result.success).toBe(true);

      // Verificar se assinatura foi atualizada
      const updatedSubscription = await prisma.subscription.findUnique({
        where: { id: subscription.id }
      });

      expect(updatedSubscription).toBeTruthy();
      expect(updatedSubscription?.pagbank_status).toBe('ACTIVE');
      expect(updatedSubscription?.last_payment_date).toBeTruthy();

      // Limpar dados de teste
      await prisma.subscription.delete({ where: { id: subscription.id } });
    });

    it('deve ignorar webhooks para assinaturas inexistentes', async () => {
      const result = await pagBankService.processWebhook({
        ...webhookPayload,
        subscription_id: 'non_existent'
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/assinatura|não encontrada/i);
    });

    it('deve validar payload do webhook', async () => {
      const result = await pagBankService.processWebhook({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/payload|inválido/i);
    });
  });
});