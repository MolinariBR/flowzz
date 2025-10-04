import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server';
import { setupTestDatabase, teardownTestDatabase, resetDatabase, prisma } from '../helpers/database';
import { 
  createTestUser, 
  createClient, 
  createManyClients, 
  createVIPClient, 
  createInactiveClient 
} from '../factories';

/**
 * Testes de integração E2E para Clients API
 * Testa CRUD completo, paginação, filtros e multi-tenancy
 */
describe('Clients E2E Tests', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();

    // Criar usuário de teste e fazer login
    const user = createTestUser();
    const createdUser = await prisma.user.create({ data: user });
    userId = createdUser.id;

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user.email,
        password: 'Test@123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  describe('GET /api/v1/clients', () => {
    it('deve retornar lista vazia para usuário sem clientes', async () => {
      const response = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('deve listar clientes com paginação padrão (20 itens)', async () => {
      // Criar 25 clientes
      const clients = createManyClients(25, {
        user: { connect: { id: userId } },
      });

      for (const client of clients) {
        await prisma.client.create({ data: client });
      }

      const response = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(20);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 25,
        totalPages: 2,
      });
    });

    it('deve respeitar parâmetro de paginação customizado', async () => {
      // Criar 15 clientes
      const clients = createManyClients(15, {
        user: { connect: { id: userId } },
      });

      for (const client of clients) {
        await prisma.client.create({ data: client });
      }

      const response = await request(app)
        .get('/api/v1/clients')
        .query({ page: 1, limit: 5 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('deve navegar entre páginas corretamente', async () => {
      // Criar 15 clientes
      const clients = createManyClients(15, {
        user: { connect: { id: userId } },
      });

      for (const client of clients) {
        await prisma.client.create({ data: client });
      }

      // Página 1
      const page1 = await request(app)
        .get('/api/v1/clients')
        .query({ page: 1, limit: 5 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Página 2
      const page2 = await request(app)
        .get('/api/v1/clients')
        .query({ page: 2, limit: 5 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Dados devem ser diferentes
      expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
    });

    it('deve filtrar clientes por status', async () => {
      // Criar clientes com diferentes status
      const activeClient = createClient({
        user: { connect: { id: userId } },
        status: 'ACTIVE',
      });
      const inactiveClient = createInactiveClient({
        user: { connect: { id: userId } },
      });

      await prisma.client.create({ data: activeClient });
      await prisma.client.create({ data: inactiveClient });

      // Filtrar apenas ACTIVE
      const response = await request(app)
        .get('/api/v1/clients')
        .query({ status: 'ACTIVE' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('ACTIVE');
    });

    it('deve buscar clientes por nome ou email', async () => {
      const client1 = createClient({
        user: { connect: { id: userId } },
        name: 'João da Silva',
        email: 'joao@example.com',
      });
      const client2 = createClient({
        user: { connect: { id: userId } },
        name: 'Maria Santos',
        email: 'maria@example.com',
      });

      await prisma.client.create({ data: client1 });
      await prisma.client.create({ data: client2 });

      // Buscar por nome
      const response = await request(app)
        .get('/api/v1/clients')
        .query({ search: 'João' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('João');
    });

    it('deve retornar apenas clientes do usuário autenticado (multi-tenancy)', async () => {
      // Criar outro usuário
      const user2 = createTestUser({ email: 'outro@flowzz.com.br' });
      const createdUser2 = await prisma.user.create({ data: user2 });

      // Criar clientes para ambos usuários
      const client1 = createClient({
        user: { connect: { id: userId } },
        name: 'Cliente User 1',
      });
      const client2 = createClient({
        user: { connect: { id: createdUser2.id } },
        name: 'Cliente User 2',
      });

      await prisma.client.create({ data: client1 });
      await prisma.client.create({ data: client2 });

      // Usuário 1 deve ver apenas seu cliente
      const response = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Cliente User 1');
    });

    it('deve retornar 401 sem autenticação', async () => {
      await request(app)
        .get('/api/v1/clients')
        .expect(401);
    });
  });

  describe('GET /api/v1/clients/:id', () => {
    it('deve retornar cliente específico por ID', async () => {
      const client = createClient({
        user: { connect: { id: userId } },
        name: 'Cliente Teste',
      });

      const createdClient = await prisma.client.create({ data: client });

      const response = await request(app)
        .get(`/api/v1/clients/${createdClient.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdClient.id,
        name: 'Cliente Teste',
        status: expect.any(String),
      });
    });

    it('deve retornar 404 para cliente inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/clients/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 403 ao tentar acessar cliente de outro usuário', async () => {
      // Criar outro usuário
      const user2 = createTestUser({ email: 'outro@flowzz.com.br' });
      const createdUser2 = await prisma.user.create({ data: user2 });

      // Criar cliente para usuário 2
      const client = createClient({
        user: { connect: { id: createdUser2.id } },
      });
      const createdClient = await prisma.client.create({ data: client });

      // Usuário 1 tenta acessar cliente do usuário 2
      const response = await request(app)
        .get(`/api/v1/clients/${createdClient.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/clients', () => {
    it('deve criar novo cliente com dados válidos', async () => {
      const newClient = {
        name: 'Novo Cliente',
        email: 'novo@example.com',
        phone: '+55 11 98888-8888',
        status: 'ACTIVE',
      };

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newClient)
        .expect(201);

      expect(response.body).toMatchObject({
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        status: newClient.status,
        user_id: userId,
      });

      // Verificar no banco
      const clientInDb = await prisma.client.findUnique({
        where: { id: response.body.id },
      });

      expect(clientInDb).toBeDefined();
      expect(clientInDb?.name).toBe(newClient.name);
    });

    it('deve criar cliente com dados opcionais nulos', async () => {
      const newClient = {
        name: 'Cliente Simples',
        email: null,
        phone: null,
        status: 'INACTIVE',
      };

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newClient)
        .expect(201);

      expect(response.body.email).toBeNull();
      expect(response.body.phone).toBeNull();
    });

    it('deve retornar 400 para dados inválidos (sem nome)', async () => {
      const invalidClient = {
        email: 'sem-nome@example.com',
      };

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidClient)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 400 para email inválido', async () => {
      const invalidClient = {
        name: 'Cliente Teste',
        email: 'email-invalido',
      };

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidClient)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve prevenir criação de cliente duplicado (mesmo email)', async () => {
      const client = createClient({
        user: { connect: { id: userId } },
        email: 'duplicado@example.com',
      });

      await prisma.client.create({ data: client });

      // Tentar criar com mesmo email
      const duplicateClient = {
        name: 'Outro Nome',
        email: 'duplicado@example.com',
      };

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(duplicateClient)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/clients/:id', () => {
    it('deve atualizar cliente existente', async () => {
      const client = createClient({
        user: { connect: { id: userId } },
        name: 'Nome Original',
        status: 'INACTIVE',
      });

      const createdClient = await prisma.client.create({ data: client });

      const updates = {
        name: 'Nome Atualizado',
        status: 'ACTIVE',
      };

      const response = await request(app)
        .put(`/api/v1/clients/${createdClient.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdClient.id,
        name: updates.name,
        status: updates.status,
      });

      // Verificar no banco
      const updatedClient = await prisma.client.findUnique({
        where: { id: createdClient.id },
      });

      expect(updatedClient?.name).toBe(updates.name);
    });

    it('deve retornar 404 ao tentar atualizar cliente inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .put(`/api/v1/clients/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Teste' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 403 ao tentar atualizar cliente de outro usuário', async () => {
      // Criar outro usuário
      const user2 = createTestUser({ email: 'outro@flowzz.com.br' });
      const createdUser2 = await prisma.user.create({ data: user2 });

      // Criar cliente para usuário 2
      const client = createClient({
        user: { connect: { id: createdUser2.id } },
      });
      const createdClient = await prisma.client.create({ data: client });

      // Usuário 1 tenta atualizar cliente do usuário 2
      const response = await request(app)
        .put(`/api/v1/clients/${createdClient.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Tentativa Hacker' })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/clients/:id', () => {
    it('deve remover cliente existente', async () => {
      const client = createClient({
        user: { connect: { id: userId } },
      });

      const createdClient = await prisma.client.create({ data: client });

      await request(app)
        .delete(`/api/v1/clients/${createdClient.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Verificar que foi removido do banco
      const deletedClient = await prisma.client.findUnique({
        where: { id: createdClient.id },
      });

      expect(deletedClient).toBeNull();
    });

    it('deve retornar 404 ao tentar remover cliente inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/v1/clients/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 403 ao tentar remover cliente de outro usuário', async () => {
      // Criar outro usuário
      const user2 = createTestUser({ email: 'outro@flowzz.com.br' });
      const createdUser2 = await prisma.user.create({ data: user2 });

      // Criar cliente para usuário 2
      const client = createClient({
        user: { connect: { id: createdUser2.id } },
      });
      const createdClient = await prisma.client.create({ data: client });

      // Usuário 1 tenta remover cliente do usuário 2
      const response = await request(app)
        .delete(`/api/v1/clients/${createdClient.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance e Volume', () => {
    it('deve listar 100 clientes com performance aceitável (<500ms)', async () => {
      // Criar 100 clientes
      const clients = createManyClients(100, {
        user: { connect: { id: userId } },
      });

      for (const client of clients) {
        await prisma.client.create({ data: client });
      }

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/v1/clients')
        .query({ limit: 100 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const duration = Date.now() - startTime;

      expect(response.body.data).toHaveLength(100);
      expect(duration).toBeLessThan(500); // Menos de 500ms
    });

    it('deve criar cliente VIP com alto valor gasto', async () => {
      const vipClient = createVIPClient({
        user: { connect: { id: userId } },
      });

      const createdClient = await prisma.client.create({ data: vipClient });

      // VIP deve ter gasto acima de 10k
      expect(Number(createdClient.total_spent)).toBeGreaterThan(10000);
      expect(createdClient.status).toBe('ACTIVE');
    });
  });
});
