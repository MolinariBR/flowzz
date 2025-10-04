// Teste de integração E2E - Fluxo de Clientes
// Testa: Login → Create Client → List Clients → Update Client → Delete Client

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('E2E - Fluxo de Clientes', () => {
  const testUser = {
    email: `test-clients-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test Clients User'
  };

  let accessToken: string;
  let clientId: string;

  beforeAll(async () => {
    // Registrar e fazer login
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    accessToken = registerResponse.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    // Limpar dados de teste APENAS NO FINAL
    const { prisma } = await import('../../shared/config/database');
    await prisma.client.deleteMany({ 
      where: { name: { contains: 'Silva' } } 
    });
    await prisma.refreshToken.deleteMany({ 
      where: { user: { email: { contains: 'test-clients-' } } } 
    });
    await prisma.user.deleteMany({ 
      where: { email: { contains: 'test-clients-' } } 
    });
  });

  it('deve criar um novo cliente', async () => {
    const newClient = {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11987654321',
      cpf: '12345678900',
      status: 'ACTIVE',
    };

    const response = await request(app)
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newClient);

    console.log('\n📦 Response Status:', response.status);
    console.log('📦 Response Body:', JSON.stringify(response.body, null, 2));

    if (response.status !== 201) {
      console.error('\n❌ POST /clients failed:');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(response.body, null, 2));
    }
    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newClient.name);
    clientId = response.body.id;
  });

  it('deve listar todos os clientes', async () => {
    const response = await request(app)
      .get('/api/v1/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('deve buscar cliente por ID', async () => {
    const response = await request(app)
      .get(`/api/v1/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(clientId);
  });

  it('deve atualizar dados do cliente', async () => {
    const updateData = {
      name: 'João Silva Updated',
      phone: '11999999999',
    };

    const response = await request(app)
      .put(`/api/v1/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body.name).toBe(updateData.name);
  });

  it('deve deletar cliente', async () => {
    const response = await request(app)
      .delete(`/api/v1/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // Verificar que foi deletado
    await request(app)
      .get(`/api/v1/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('não deve permitir criar cliente sem autenticação', async () => {
    const newClient = {
      name: 'Test Client',
      email: 'test@example.com',
    };

    await request(app)
      .post('/api/v1/clients')
      .send(newClient)
      .expect(401);
  });

  it('deve filtrar clientes por nome', async () => {
    const response = await request(app)
      .get('/api/v1/clients?search=Silva')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
