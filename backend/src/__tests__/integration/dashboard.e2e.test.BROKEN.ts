import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../../server'
import { createPaidSale, createTestUser } from '../factories'
import { prisma, resetDatabase, setupTestDatabase, teardownTestDatabase } from '../helpers/database'

/**
 * Testes de integração E2E para Dashboard
 * Testa métricas, gráficos e atividades recentes
 */
describe('Dashboard E2E Tests', () => {
  let accessToken: string
  let userId: string

  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()

    // Criar usuário de teste e fazer login
    const user = createTestUser()
    const createdUser = await prisma.user.create({ data: user })
    userId = createdUser.id

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: user.email,
      password: 'Test@123', // Senha padrão do createTestUser
    })

    accessToken = loginResponse.body.accessToken
  })

  describe('GET /api/v1/dashboard/metrics', () => {
    it('deve retornar métricas zeradas para usuário sem dados', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        vendas_hoje: 0,
        gasto_anuncios: 0,
        lucro_liquido: 0,
        pagamentos_agendados: 0,
      })
    })

    it('deve calcular métricas corretamente com vendas recentes', async () => {
      // Criar 3 vendas pagas recentes
      const sale1 = createPaidSale({
        user: { connect: { id: userId } },
        total_price: 497.0,
        payment_date: new Date(), // Hoje
      })
      const sale2 = createPaidSale({
        user: { connect: { id: userId } },
        total_price: 197.0,
        payment_date: new Date(),
      })
      const sale3 = createPaidSale({
        user: { connect: { id: userId } },
        total_price: 97.0,
        payment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás (não conta)
      })

      await prisma.sale.create({ data: sale1 })
      await prisma.sale.create({ data: sale2 })
      await prisma.sale.create({ data: sale3 })

      const response = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Vendas de hoje: 497 + 197 = 694
      expect(response.body.vendas_hoje).toBe(694)
    })

    it('deve calcular lucro líquido (vendas - gastos anúncios)', async () => {
      // Criar vendas
      const sale = createPaidSale({
        user: { connect: { id: userId } },
        total_price: 1000,
        payment_date: new Date(),
      })
      await prisma.sale.create({ data: sale })

      // Criar anúncios com gastos
      await prisma.ad.create({
        data: {
          user_id: userId,
          external_id: 'fb_ad_123',
          campaign_name: 'Campanha Teste',
          ad_name: 'Anúncio Teste',
          status: 'ACTIVE',
          spend: 300, // Gasto
          impressions: 10000,
          clicks: 250,
          date: new Date(),
        },
      })

      const response = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.vendas_hoje).toBe(1000)
      expect(response.body.gasto_anuncios).toBe(300)
      expect(response.body.lucro_liquido).toBe(700) // 1000 - 300
    })

    it('deve retornar 401 sem autenticação', async () => {
      await request(app).get('/api/v1/dashboard/metrics').expect(401)
    })

    it('deve retornar métricas isoladas por usuário (multi-tenancy)', async () => {
      // Criar outro usuário
      const user2 = createTestUser({ email: 'outro@flowzz.com.br' })
      const createdUser2 = await prisma.user.create({ data: user2 })

      // Criar vendas para usuário 2
      const sale2 = createPaidSale({
        user: { connect: { id: createdUser2.id } },
        total_price: 5000,
        payment_date: new Date(),
      })
      await prisma.sale.create({ data: sale2 })

      // Usuário 1 não deve ver vendas do usuário 2
      const response = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.vendas_hoje).toBe(0)
    })
  })

  describe('GET /api/v1/dashboard/chart', () => {
    it('deve retornar dados de gráfico para período de 7 dias', async () => {
      // Criar vendas nos últimos 7 dias
      for (let i = 0; i < 7; i++) {
        const sale = createPaidSale({
          user: { connect: { id: userId } },
          total_price: 100 * (i + 1),
          payment_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        })
        await prisma.sale.create({ data: sale })
      }

      const response = await request(app)
        .get('/api/v1/dashboard/chart')
        .query({ period: '7d' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeLessThanOrEqual(7)
    })

    it('deve retornar dados de gráfico para período de 30 dias', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/chart')
        .query({ period: '30d' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toBeInstanceOf(Array)
    })

    it('deve retornar 400 para período inválido', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/chart')
        .query({ period: 'invalid' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/v1/dashboard/activities', () => {
    it('deve retornar lista vazia para usuário sem atividades', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body).toHaveLength(0)
    })

    it('deve retornar atividades recentes do usuário', async () => {
      // Criar atividades
      await prisma.activity.createMany({
        data: [
          {
            user_id: userId,
            action: 'login',
            entity_type: 'user',
            created_at: new Date(),
          },
          {
            user_id: userId,
            action: 'create_client',
            entity_type: 'client',
            created_at: new Date(Date.now() - 60000), // 1 min atrás
          },
          {
            user_id: userId,
            action: 'create_sale',
            entity_type: 'sale',
            created_at: new Date(Date.now() - 120000), // 2 min atrás
          },
        ],
      })

      const response = await request(app)
        .get('/api/v1/dashboard/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body).toHaveLength(3)

      // Deve vir ordenado por data decrescente (mais recente primeiro)
      expect(response.body[0].action).toBe('login')
      expect(response.body[1].action).toBe('create_client')
      expect(response.body[2].action).toBe('create_sale')
    })

    it('deve limitar a 20 atividades por padrão', async () => {
      // Criar 25 atividades
      const activities = Array.from({ length: 25 }, (_, i) => ({
        user_id: userId,
        action: 'login',
        entity_type: 'user',
        created_at: new Date(Date.now() - i * 60000),
      }))

      await prisma.activity.createMany({ data: activities })

      const response = await request(app)
        .get('/api/v1/dashboard/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveLength(20)
    })

    it('deve respeitar parâmetro limit customizado', async () => {
      // Criar 15 atividades
      const activities = Array.from({ length: 15 }, (_, i) => ({
        user_id: userId,
        action: 'login',
        entity_type: 'user',
        created_at: new Date(Date.now() - i * 60000),
      }))

      await prisma.activity.createMany({ data: activities })

      const response = await request(app)
        .get('/api/v1/dashboard/activities')
        .query({ limit: 5 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveLength(5)
    })

    it('deve retornar apenas atividades do usuário autenticado', async () => {
      // Criar outro usuário
      const user2 = createTestUser({ email: 'outro@flowzz.com.br' })
      const createdUser2 = await prisma.user.create({ data: user2 })

      // Criar atividades para usuário 2
      await prisma.activity.create({
        data: {
          user_id: createdUser2.id,
          action: 'login',
          entity_type: 'user',
          created_at: new Date(),
        },
      })

      // Criar atividade para usuário 1
      await prisma.activity.create({
        data: {
          user_id: userId,
          action: 'login',
          entity_type: 'user',
          created_at: new Date(),
        },
      })

      const response = await request(app)
        .get('/api/v1/dashboard/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Deve retornar apenas 1 atividade (do usuário autenticado)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].action).toBe('login')
    })
  })

  describe('Cache Redis', () => {
    it('deve usar cache na segunda chamada de métricas', async () => {
      // Primeira chamada
      const response1 = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Criar venda após primeira chamada
      const sale = createPaidSale({
        user: { connect: { id: userId } },
        total_price: 500,
        payment_date: new Date(),
      })
      await prisma.sale.create({ data: sale })

      // Segunda chamada (deve retornar cache - ainda zerado)
      const response2 = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Cache deve retornar dados anteriores (sem a venda de 500)
      // Nota: Este teste depende da implementação do cache
      // Se cache estiver ativo, response2 deve ser igual a response1
      expect(response2.body).toEqual(response1.body)
    })
  })
})
