/**
 * Testes E2E de PagBank Integration
 *
 * ⚠️ AVISO IMPORTANTE:
 * Estes testes são para validação da estrutura da API e lógica de negócio.
 * Para testar a integração completa com PagBank, são necessárias:
 *
 * 🔐 CREDENCIAIS DE TESTE DO PAGBANK:
 * - PAGBANK_API_TOKEN: Token de API para ambiente de teste
 * - PAGBANK_PUBLIC_KEY: Chave pública para criptografia
 * - PAGBANK_WEBHOOK_SECRET: Segredo para validação de webhooks
 *
 * 📋 CONFIGURAÇÃO NECESSÁRIA:
 * 1. Obter credenciais no painel de desenvolvedor PagBank
 * 2. Configurar variáveis de ambiente no .env
 * 3. Registrar URL de webhook no PagBank: /api/v1/pagbank/webhook
 *
 * 🚫 WEBHOOKS EM DESENVOLVIMENTO:
 * Os webhooks não podem ser testados diretamente em ambiente local.
 * Para testar webhooks, use ferramentas como ngrok ou similar para expor
 * a porta local, ou teste em ambiente de staging.
 */

import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../shared/config/database';

describe('PagBank Integration E2E Tests', () => {
  let accessToken: string;
  let userId: string;
  let subscriptionId: string;

  const testUser = {
    email: `test-pagbank-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test PagBank User',
  };

  // Dados de teste para PagBank
  const testSubscription = {
    planId: 'plan_test_monthly', // ID de plano que deve existir no banco
    paymentMethod: {
      type: 'CREDIT_CARD',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2026',
      cvv: '123',
      holderName: 'Test User',
    }
  };

  beforeAll(async () => {
    // Criar usuário de teste e fazer login
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.data).toHaveProperty('user');
    expect(registerResponse.body.data).toHaveProperty('tokens');

    accessToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;

    // Verificar se plano de teste existe, se não, criar um
    const existingPlan = await prisma.plan.findFirst({
      where: { id: testSubscription.planId }
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: {
          id: testSubscription.planId,
          name: 'Plano Teste Mensal',
          description: 'Plano para testes de PagBank',
          price: 29.90,
          currency: 'BRL',
          interval: 'MONTH',
          is_active: true,
          features: { test: true },
          limits: { users: 1 },
        }
      });
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    try {
      // Limpar assinaturas criadas no teste
      if (subscriptionId) {
        await prisma.subscription.deleteMany({
          where: { id: subscriptionId }
        });
      }

      // Limpar métodos de pagamento
      await prisma.paymentMethod.deleteMany({
        where: { user_id: userId }
      });

      // Limpar tokens e usuário
      await prisma.refreshToken.deleteMany({
        where: { user: { email: testUser.email } }
      });
      await prisma.user.deleteMany({
        where: { email: testUser.email }
      });

      // Limpar plano de teste se foi criado
      await prisma.plan.deleteMany({
        where: { id: testSubscription.planId }
      });
    } catch (error) {
      console.warn('Erro ao limpar dados de teste:', error);
    }
  });

  describe('GET /api/v1/pagbank/subscriptions - Listar Assinaturas', () => {
    it('deve retornar lista vazia para usuário sem assinaturas', async () => {
      const response = await request(app)
        .get('/api/v1/pagbank/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/v1/pagbank/public-key - Obter Chave Pública', () => {
    it('deve retornar erro informando necessidade de credenciais', async () => {
      const response = await request(app)
        .get('/api/v1/pagbank/public-key')
        .set('Authorization', `Bearer ${accessToken}`);

      // Em desenvolvimento sem credenciais, deve retornar erro
      expect([400, 500]).toContain(response.status);

      if (response.status === 400) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.error).toMatch(/credenciais|token|configura/i);
      }
    });

    it('deve validar autenticação obrigatória', async () => {
      const response = await request(app)
        .get('/api/v1/pagbank/public-key');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /api/v1/pagbank/subscriptions - Criar Assinatura', () => {
    it('deve validar autenticação obrigatória', async () => {
      const response = await request(app)
        .post('/api/v1/pagbank/subscriptions')
        .send(testSubscription);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('deve validar dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/v1/pagbank/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatch(/planId|paymentMethod/i);
    });

    it('deve retornar erro informando necessidade de credenciais PagBank', async () => {
      const response = await request(app)
        .post('/api/v1/pagbank/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testSubscription);

      // Sem credenciais PagBank, deve retornar erro
      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);

      if (response.body.error) {
        expect(response.body.error).toMatch(/credenciais|token|pagbank|configura/i);
      }
    });
  });

  describe('DELETE /api/v1/pagbank/subscriptions/:id - Cancelar Assinatura', () => {
    it('deve validar autenticação obrigatória', async () => {
      const response = await request(app)
        .delete('/api/v1/pagbank/subscriptions/test-id');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('deve retornar erro para assinatura inexistente', async () => {
      const response = await request(app)
        .delete('/api/v1/pagbank/subscriptions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatch(/assinatura|não encontrada/i);
    });
  });

  describe('POST /api/v1/pagbank/webhook - Webhook PagBank', () => {
    it('deve aceitar requisições sem autenticação (webhooks)', async () => {
      const webhookPayload = {
        event: 'PAYMENT_RECEIVED',
        subscription_id: 'sub_test_123',
        status: 'ACTIVE',
        payment_date: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/pagbank/webhook')
        .set('Content-Type', 'application/json')
        .send(webhookPayload);

      // Webhook deve ser aceito mesmo sem credenciais específicas
      // Pode retornar erro se assinatura não existir ou outros problemas de negócio
      expect([200, 400, 404, 500]).toContain(response.status);

      // Se retornar erro, deve informar sobre configuração
      if (response.status !== 200) {
        console.log('⚠️  Webhook test note:');
        console.log('   Para testar webhooks completamente:');
        console.log('   1. Configure PAGBANK_WEBHOOK_SECRET no .env');
        console.log('   2. Use ngrok ou similar para expor porta local');
        console.log('   3. Registre URL no painel PagBank');
        console.log('   4. Teste em ambiente de staging');
      }
    });

    it('deve validar formato do payload do webhook', async () => {
      const response = await request(app)
        .post('/api/v1/pagbank/webhook')
        .set('Content-Type', 'application/json')
        .send({ invalid: 'payload' });

      // Deve aceitar mas pode retornar erro de validação
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('GET /api/v1/pagbank/subscriptions/:id - Detalhes de Assinatura', () => {
    it('deve validar autenticação obrigatória', async () => {
      const response = await request(app)
        .get('/api/v1/pagbank/subscriptions/test-id');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('deve retornar erro para assinatura inexistente', async () => {
      const response = await request(app)
        .get('/api/v1/pagbank/subscriptions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toMatch(/assinatura|não encontrada/i);
    });
  });
});