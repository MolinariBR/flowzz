// Testes Unitários - CRUD de Perfil
// Testa: getProfile, updateProfile

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../backend/src/app'

describe('Unitários - CRUD de Perfil', () => {
  let accessToken: string
  let userId: string

  const testUser = {
    email: `test-perfil-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test User Perfil',
  }

  // Setup: Registrar e logar usuário de teste
  beforeAll(async () => {
    // Registrar usuário
    const registerResponse = await request(app).post('/api/v1/auth/register').send(testUser)

    expect(registerResponse.status).toBe(201)
    userId = registerResponse.body.data.user.id
    accessToken = registerResponse.body.data.tokens.accessToken
  })

  // Cleanup: Remover dados de teste
  afterAll(async () => {
    const { prisma } = await import('../backend/src/shared/config/database')
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testUser.email } },
    })
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    })
  })

  describe('GET /auth/profile', () => {
    it('deve retornar dados do perfil do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', userId)
      expect(response.body.data).toHaveProperty('nome', testUser.nome)
      expect(response.body.data).toHaveProperty('email', testUser.email)
      expect(response.body).toHaveProperty('message', 'Perfil obtido com sucesso')
    })

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app).get('/api/v1/auth/profile')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Unauthorized')
    })

    it('deve retornar erro 401 com token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /auth/profile', () => {
    it('deve atualizar dados do perfil com sucesso', async () => {
      const updateData = {
        nome: 'Nome Atualizado',
        telefone: '+55 11 99999-9999',
        documento: '123.456.789-00',
        endereco: 'Rua Teste, 123, São Paulo - SP, CEP: 01234-567',
      }

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('nome', updateData.nome)
      expect(response.body.data).toHaveProperty('telefone', updateData.telefone)
      expect(response.body.data).toHaveProperty('documento', updateData.documento)
      expect(response.body.data).toHaveProperty('endereco', updateData.endereco)
      expect(response.body).toHaveProperty('message', 'Perfil atualizado com sucesso')
    })

    it('deve atualizar apenas campos enviados', async () => {
      const partialUpdate = {
        telefone: '+55 11 88888-8888',
      }

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(partialUpdate)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('telefone', partialUpdate.telefone)
      expect(response.body.data).toHaveProperty('nome', 'Nome Atualizado') // Mantém valor anterior
    })

    it('deve permitir atualizar avatar_url', async () => {
      const avatarUpdate = {
        avatar_url: 'https://example.com/avatar.jpg',
      }

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(avatarUpdate)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('avatar_url', avatarUpdate.avatar_url)
    })

    it('deve retornar erro 401 sem autenticação', async () => {
      const response = await request(app).put('/api/v1/auth/profile').send({ nome: 'Teste' })

      expect(response.status).toBe(401)
    })

    it('deve validar formato de email se enviado', async () => {
      const invalidData = {
        email: 'invalid-email',
      }

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })

  describe('Isolamento Multitenant', () => {
    let otherUserToken: string
    let otherUserId: string

    beforeAll(async () => {
      // Criar outro usuário
      const otherUser = {
        email: `test-other-${Date.now()}@flowzz.com`,
        password: 'Test@123456',
        nome: 'Other User',
      }

      const registerResponse = await request(app).post('/api/v1/auth/register').send(otherUser)

      otherUserId = registerResponse.body.data.user.id
      otherUserToken = registerResponse.body.data.tokens.accessToken
    })

    it('usuário não deve acessar perfil de outro usuário', async () => {
      // Tentar acessar perfil do outro usuário
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${otherUserToken}`)

      // Deve retornar apenas os dados do próprio usuário
      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe(otherUserId)
      expect(response.body.data.id).not.toBe(userId)
    })

    afterAll(async () => {
      const { prisma } = await import('../backend/src/shared/config/database')
      await prisma.refreshToken.deleteMany({
        where: { user: { email: { contains: 'test-other-' } } },
      })
      await prisma.user.deleteMany({
        where: { email: { contains: 'test-other-' } },
      })
    })
  })
})
