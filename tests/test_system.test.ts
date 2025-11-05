// Testes Unitários - Configurações do Sistema
// Testa: getSystemSettings, updateSystemSettings

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../backend/src/app'

describe('Unitários - Configurações do Sistema', () => {
  let accessToken: string

  const testUser = {
    email: `test-system-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test User System',
  }

  // Setup: Registrar e logar usuário de teste
  beforeAll(async () => {
    // Registrar usuário
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)

    expect(registerResponse.status).toBe(201)
    accessToken = registerResponse.body.data.tokens.accessToken
  })

  // Cleanup: Remover dados de teste
  afterAll(async () => {
    const { prisma } = await import('../backend/src/shared/config/database')
    await prisma.userSettings.deleteMany({
      where: { user: { email: testUser.email } },
    })
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testUser.email } },
    })
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    })
  })

  describe('GET /auth/system-settings', () => {
    it('deve retornar configurações padrão para novo usuário', async () => {
      const response = await request(app)
        .get('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('dark_mode', false)
      expect(response.body.data).toHaveProperty('language', 'pt-BR')
      expect(response.body.data).toHaveProperty('timezone', 'America/Sao_Paulo')
      expect(response.body.data).toHaveProperty('date_format', 'DD/MM/YYYY')
      expect(response.body.data).toHaveProperty('currency', 'BRL')
      expect(response.body).toHaveProperty('message', 'Configurações obtidas com sucesso')
    })

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app).get('/api/v1/auth/system-settings')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Unauthorized')
    })
  })

  describe('PUT /auth/system-settings', () => {
    it('deve atualizar todas as configurações do sistema', async () => {
      const updateData = {
        dark_mode: true,
        language: 'en-US',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        currency: 'USD',
      }

      const response = await request(app)
        .put('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('dark_mode', updateData.dark_mode)
      expect(response.body.data).toHaveProperty('language', updateData.language)
      expect(response.body.data).toHaveProperty('timezone', updateData.timezone)
      expect(response.body.data).toHaveProperty('date_format', updateData.date_format)
      expect(response.body.data).toHaveProperty('currency', updateData.currency)
      expect(response.body).toHaveProperty('message', 'Configurações atualizadas com sucesso')
    })

    it('deve atualizar apenas campos enviados', async () => {
      const partialUpdate = {
        dark_mode: false,
        language: 'es-ES',
      }

      const response = await request(app)
        .put('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(partialUpdate)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('dark_mode', partialUpdate.dark_mode)
      expect(response.body.data).toHaveProperty('language', partialUpdate.language)
      // Mantém valores anteriores para campos não enviados
      expect(response.body.data).toHaveProperty('timezone', 'America/New_York')
      expect(response.body.data).toHaveProperty('currency', 'USD')
    })

    it('deve aceitar valores válidos para dark_mode', async () => {
      const darkModeUpdate = { dark_mode: false }

      const response = await request(app)
        .put('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(darkModeUpdate)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('dark_mode', false)
    })

    it('deve aceitar diferentes fusos horários', async () => {
      const timezoneUpdate = { timezone: 'Europe/London' }

      const response = await request(app)
        .put('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(timezoneUpdate)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('timezone', 'Europe/London')
    })

    it('deve aceitar diferentes formatos de data', async () => {
      const dateFormatUpdate = { date_format: 'YYYY-MM-DD' }

      const response = await request(app)
        .put('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dateFormatUpdate)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('date_format', 'YYYY-MM-DD')
    })

    it('deve aceitar diferentes moedas', async () => {
      const currencyUpdate = { currency: 'EUR' }

      const response = await request(app)
        .put('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(currencyUpdate)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('currency', 'EUR')
    })

    it('deve retornar erro 401 sem autenticação', async () => {
      const response = await request(app)
        .put('/api/v1/auth/system-settings')
        .send({ dark_mode: true })

      expect(response.status).toBe(401)
    })
  })

  describe('Isolamento Multitenant', () => {
    let otherUserToken: string

    beforeAll(async () => {
      // Criar outro usuário
      const otherUser = {
        email: `test-system-other-${Date.now()}@flowzz.com`,
        password: 'Test@123456',
        nome: 'Other User System',
      }

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(otherUser)

      otherUserToken = registerResponse.body.data.tokens.accessToken

      // Configurar diferentes settings para o outro usuário
      await request(app)
        .put('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          dark_mode: true,
          language: 'fr-FR',
          currency: 'EUR',
        })
    })

    it('usuário deve ter suas próprias configurações isoladas', async () => {
      // Verificar configurações do usuário original
      const originalUserResponse = await request(app)
        .get('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(originalUserResponse.status).toBe(200)
      expect(originalUserResponse.body.data).toHaveProperty('currency', 'EUR') // Último valor setado

      // Verificar configurações do outro usuário
      const otherUserResponse = await request(app)
        .get('/api/v1/auth/system-settings')
        .set('Authorization', `Bearer ${otherUserToken}`)

      expect(otherUserResponse.status).toBe(200)
      expect(otherUserResponse.body.data).toHaveProperty('dark_mode', true)
      expect(otherUserResponse.body.data).toHaveProperty('language', 'fr-FR')
      expect(otherUserResponse.body.data).toHaveProperty('currency', 'EUR')
    })

    afterAll(async () => {
      const { prisma } = await import('../backend/src/shared/config/database')
      await prisma.userSettings.deleteMany({
        where: { user: { email: { contains: 'test-system-other-' } } },
      })
      await prisma.refreshToken.deleteMany({
        where: { user: { email: { contains: 'test-system-other-' } } },
      })
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-system-other-' } },
      })
    })
  })
})