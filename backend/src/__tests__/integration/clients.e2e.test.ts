/**
 * Testes E2E de Clients - CORRIGIDOS
 *
 * ✅ Baseado em client-flow.test.ts (testes que funcionam)
 *
 * Correções aplicadas:
 * 1. ✅ Formato resposta direto (sem wrapper { data }) para endpoints de recursos
 * 2. ✅ Cria próprio usuário (não depende de seed)
 * 3. ✅ Cleanup em afterAll (não beforeEach)
 * 4. ✅ Import correto: app (não server)
 * 5. ✅ Campos corretos do Client model
 * 6. ✅ Status codes corretos (201, 204, 404)
 */

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../../app'

describe('Clients E2E Tests - FIXED', () => {
  const testUser = {
    email: `test-clients-e2e-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test Clients E2E User',
  }

  let accessToken: string
  let clientId: string

  beforeAll(async () => {
    // Registrar e fazer login
    const registerResponse = await request(app).post('/api/v1/auth/register').send(testUser)

    if (registerResponse.status !== 201) {
      console.error('\n❌ Setup failed - Register:')
      console.error('Status:', registerResponse.status)
      console.error('Body:', JSON.stringify(registerResponse.body, null, 2))
    }

    accessToken = registerResponse.body.data.tokens.accessToken
  })

  afterAll(async () => {
    // Limpar dados de teste APENAS NO FINAL
    const { prisma } = await import('../../shared/config/database')
    await prisma.client.deleteMany({
      where: { name: { contains: 'E2E Client' } },
    })
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { contains: 'test-clients-e2e-' } } },
    })
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-clients-e2e-' } },
    })
  })

  describe('POST /api/v1/clients', () => {
    it('deve criar um novo cliente', async () => {
      const newClient = {
        name: 'João E2E Client',
        email: 'joao-e2e@example.com',
        phone: '11987654321',
        cpf: '12345678900',
        status: 'ACTIVE',
      }

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newClient)

      if (response.status !== 201) {
        console.error('\n❌ POST /clients failed:')
        console.error('Status:', response.status)
        console.error('Body:', JSON.stringify(response.body, null, 2))
      }
      expect(response.status).toBe(201)

      // ✅ FORMATO CORRETO: resposta direta do recurso criado
      expect(response.body).toHaveProperty('id')
      expect(response.body.name).toBe(newClient.name)
      expect(response.body.email).toBe(newClient.email)

      clientId = response.body.id
    })

    it('não deve permitir criar cliente sem autenticação', async () => {
      const newClient = {
        name: 'Test Client Unauthorized',
        email: 'test-unauth@example.com',
      }

      const response = await request(app).post('/api/v1/clients').send(newClient)

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/v1/clients', () => {
    it('deve listar todos os clientes', async () => {
      const response = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toBeInstanceOf(Array)
    })

    it('deve filtrar clientes por nome', async () => {
      const response = await request(app)
        .get('/api/v1/clients?search=E2E')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toBeInstanceOf(Array)
    })
  })

  describe('GET /api/v1/clients/:id', () => {
    it('deve buscar cliente por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/clients/${clientId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(clientId)
      expect(response.body.name).toContain('E2E Client')
    })

    it('deve retornar 404 para cliente inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'

      const response = await request(app)
        .get(`/api/v1/clients/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/v1/clients/:id', () => {
    it('deve atualizar dados do cliente', async () => {
      const updateData = {
        name: 'João E2E Client Updated',
        phone: '11999999999',
      }

      const response = await request(app)
        .put(`/api/v1/clients/${clientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe(updateData.name)
      expect(response.body.phone).toBe(updateData.phone)
    })
  })

  describe('DELETE /api/v1/clients/:id', () => {
    it('deve deletar cliente', async () => {
      const response = await request(app)
        .delete(`/api/v1/clients/${clientId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(204)

      // Verificar que foi deletado
      const getResponse = await request(app)
        .get(`/api/v1/clients/${clientId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(getResponse.status).toBe(404)
    })
  })

  describe('Multi-tenancy', () => {
    it('deve garantir que usuários não vejam clientes de outros', async () => {
      // Criar cliente para o primeiro usuário
      const client1 = {
        name: 'Client User 1',
        email: 'client1@test.com',
        phone: '11111111111',
      }

      await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(client1)

      // Criar outro usuário
      const otherUser = {
        email: `test-other-clients-${Date.now()}@flowzz.com`,
        password: 'Test@123456',
        nome: 'Other Clients User',
      }

      const otherRegisterResponse = await request(app).post('/api/v1/auth/register').send(otherUser)

      const otherAccessToken = otherRegisterResponse.body.data.tokens.accessToken

      // Tentar listar clientes com token de outro usuário
      const response = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${otherAccessToken}`)

      expect(response.status).toBe(200)

      // Não deve ver clientes do primeiro usuário
      expect(response.body.data.length).toBe(0)
    })
  })
})
