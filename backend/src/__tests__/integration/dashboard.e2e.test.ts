/**
 * Testes E2E de Dashboard - CORRIGIDOS
 * 
 * ✅ Baseado em dashboard-flow.test.ts (testes que funcionam)
 * 
 * Correções aplicadas:
 * 1. ✅ Formato resposta: { data: { vendas_hoje, ... }, message }
 * 2. ✅ Snake_case: vendas_hoje, gasto_anuncios, lucro_liquido
 * 3. ✅ Cria próprio usuário (não depende de seed)
 * 4. ✅ Cleanup em afterEach (dados do teste)
 * 5. ✅ Import correto: app (não server)
 * 6. ✅ beforeAll para setup, afterEach para cleanup
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Dashboard E2E Tests - FIXED', () => {
  const testUser = {
    email: `test-dashboard-e2e-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test Dashboard E2E User'
  };

  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    // Registrar e fazer login
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    if (registerResponse.status !== 201) {
      console.error('\n❌ Setup failed - Register:');
      console.error('Status:', registerResponse.status);
      console.error('Body:', JSON.stringify(registerResponse.body, null, 2));
    }

    accessToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;

    // Criar alguns dados de teste
    // Criar cliente
    await request(app)
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Dashboard Test Client E2E',
        email: 'dashclient-e2e@test.com',
        phone: '11999999999'
      });

    // Criar vendas
    const saleData = {
      external_id: `sale-e2e-${Date.now()}`,
      status: 'PAID',
      product_name: 'Produto Teste Dashboard E2E',
      quantity: 1,
      unit_price: 1000,
      total_price: 1000,
      client_name: 'Dashboard Test Client E2E',
      client_email: 'dashclient-e2e@test.com',
      sale_date: new Date().toISOString()
    };

    await request(app)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(saleData);
  });

  afterEach(async () => {
    // Limpar dados de teste
    const { prisma } = await import('../../shared/config/database');
    await prisma.sale.deleteMany({ 
      where: { user_id: userId } 
    });
    await prisma.goal.deleteMany({ 
      where: { user_id: userId } 
    });
    await prisma.client.deleteMany({ 
      where: { name: { contains: 'Dashboard Test Client E2E' } } 
    });
    await prisma.refreshToken.deleteMany({ 
      where: { user: { email: { contains: 'test-dashboard-e2e-' } } } 
    });
    await prisma.user.deleteMany({ 
      where: { email: { contains: 'test-dashboard-e2e-' } } 
    });
  });

  describe('GET /api/v1/dashboard/metrics', () => {
    it('deve buscar métricas do dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${accessToken}`);

      if (response.status !== 200) {
        console.error('\n❌ GET /dashboard/metrics failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      // ✅ FORMATO CORRETO: snake_case
      expect(response.body.data).toHaveProperty('vendas_hoje');
      expect(response.body.data).toHaveProperty('gasto_anuncios');
      expect(response.body.data).toHaveProperty('lucro_liquido');
      expect(response.body.data).toHaveProperty('pagamentos_agendados');
    });

    it('deve filtrar métricas por período', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/metrics?period=7')
        .set('Authorization', `Bearer ${accessToken}`);

      if (response.status !== 200) {
        console.error('\n❌ GET /dashboard/metrics?period=7 failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      expect(response.body.data).toHaveProperty('vendas_hoje');
    });

    it('deve validar período inválido', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/metrics?period=invalid')
        .set('Authorization', `Bearer ${accessToken}`);

      if (response.status !== 400) {
        console.error('\n❌ Validação de período inválido não funcionou:');
        console.error('Status esperado: 400, recebido:', response.status);
      }
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('não deve permitir acesso sem autenticação', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/metrics');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/dashboard/chart', () => {
    it('deve buscar dados do gráfico de vendas', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/chart')
        .set('Authorization', `Bearer ${accessToken}`);

      if (response.status !== 200) {
        console.error('\n❌ GET /dashboard/chart failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/dashboard/activities', () => {
    it('deve buscar atividades recentes', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/activities')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/dashboard/top-clients', () => {
    it('deve buscar top clientes', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/top-clients')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Multi-tenancy', () => {
    it('deve garantir que usuários não vejam dados de outros', async () => {
      // Criar outro usuário
      const otherUser = {
        email: `test-other-dashboard-${Date.now()}@flowzz.com`,
        password: 'Test@123456',
        nome: 'Other Dashboard User'
      };

      const otherRegisterResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(otherUser);

      const otherAccessToken = otherRegisterResponse.body.data.tokens.accessToken;

      // Tentar acessar métricas com token de outro usuário
      const response = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${otherAccessToken}`);

      expect(response.status).toBe(200);
      
      // Não deve ver vendas do primeiro usuário
      expect(response.body.data.vendas_hoje).toBe(0);
    });
  });
});
