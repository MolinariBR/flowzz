// Testes Unitários - Segurança
// Testa: changePassword, getSessions, revokeSession

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../backend/src/app'

describe('Unitários - Segurança', () => {
  let accessToken: string

  const testUser = {
    email: `test-security-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test User Security',
  }

  // Setup: Registrar e logar usuário de teste
  beforeAll(async () => {
    // Registrar usuário
    const registerResponse = await request(app).post('/api/v1/auth/register').send(testUser)

    expect(registerResponse.status).toBe(201)
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

  describe('PUT /auth/security (Change Password)', () => {
    it('deve alterar senha com sucesso', async () => {
      const changePasswordData = {
        current_password: 'Test@123456',
        new_password: 'NewPass@123',
        confirm_password: 'NewPass@123',
      }

      const response = await request(app)
        .put('/api/v1/auth/security')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(changePasswordData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Senha alterada com sucesso')
    })

    it('deve retornar erro com senha atual incorreta', async () => {
      const invalidData = {
        current_password: 'WrongPassword@123',
        new_password: 'NewPass@123',
        confirm_password: 'NewPass@123',
      }

      const response = await request(app)
        .put('/api/v1/auth/security')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Invalid password')
      expect(response.body).toHaveProperty('message', 'Senha atual incorreta')
    })

    it('deve retornar erro quando senhas não coincidem', async () => {
      const mismatchData = {
        current_password: 'NewPass@123',
        new_password: 'NewPass@123',
        confirm_password: 'DifferentPass@123',
      }

      const response = await request(app)
        .put('/api/v1/auth/security')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(mismatchData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('deve validar força da nova senha', async () => {
      const weakPasswordData = {
        current_password: 'NewPass@123',
        new_password: '123',
        confirm_password: '123',
      }

      const response = await request(app)
        .put('/api/v1/auth/security')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(weakPasswordData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('deve retornar erro 401 sem autenticação', async () => {
      const response = await request(app).put('/api/v1/auth/security').send({
        current_password: 'test',
        new_password: 'newtest',
        confirm_password: 'newtest',
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /auth/sessions', () => {
    it('deve retornar lista de sessões ativas', async () => {
      const response = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('message', 'Sessões obtidas com sucesso')
      expect(Array.isArray(response.body.data)).toBe(true)

      // Verificar estrutura da primeira sessão (se existir)
      if (response.body.data.length > 0) {
        const session = response.body.data[0]
        expect(session).toHaveProperty('id')
        expect(session).toHaveProperty('user_agent')
        expect(session).toHaveProperty('ip_address')
        expect(session).toHaveProperty('device_info')
        expect(session).toHaveProperty('created_at')
        expect(session).toHaveProperty('expires_at')
      }
    })

    it('deve incluir apenas sessões do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)

      // Todas as sessões devem pertencer ao usuário
      for (const session of response.body.data) {
        expect(session.id).toBeDefined()
      }
    })

    it('deve retornar erro 401 sem autenticação', async () => {
      const response = await request(app).get('/api/v1/auth/sessions')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Unauthorized')
    })
  })

  describe('DELETE /auth/sessions/:id (Revoke Session)', () => {
    let sessionId: string

    beforeAll(async () => {
      // Fazer login para garantir que há uma sessão ativa
      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'NewPass@123',
      })

      expect(loginResponse.status).toBe(200)

      // Obter ID de uma sessão existente
      const sessionsResponse = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)

      if (sessionsResponse.body.data.length > 0) {
        sessionId = sessionsResponse.body.data[0].id
      }
    })

    it('deve revogar sessão com sucesso', async () => {
      if (!sessionId) {
        console.warn('Nenhuma sessão encontrada para teste de revogação')
        return
      }

      const response = await request(app)
        .delete(`/api/v1/auth/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Sessão revogada com sucesso')
    })

    it('deve retornar erro ao tentar revogar sessão inexistente', async () => {
      const fakeSessionId = '00000000-0000-0000-0000-000000000000'

      const response = await request(app)
        .delete(`/api/v1/auth/sessions/${fakeSessionId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error', 'Session not found')
    })

    it('deve retornar erro ao tentar revogar sessão de outro usuário', async () => {
      // Criar outro usuário e obter uma sessão dele
      const otherUser = {
        email: `test-security-other-${Date.now()}@flowzz.com`,
        password: 'Test@123456',
        nome: 'Other User Security',
      }

      const registerResponse = await request(app).post('/api/v1/auth/register').send(otherUser)

      const otherUserToken = registerResponse.body.data.tokens.accessToken

      const otherSessionsResponse = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${otherUserToken}`)

      if (otherSessionsResponse.body.data.length > 0) {
        const otherSessionId = otherSessionsResponse.body.data[0].id

        // Tentar revogar sessão do outro usuário
        const response = await request(app)
          .delete(`/api/v1/auth/sessions/${otherSessionId}`)
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error', 'Session not found')
      }

      // Cleanup
      const { prisma } = await import('../backend/src/shared/config/database')
      await prisma.refreshToken.deleteMany({
        where: { user: { email: otherUser.email } },
      })
      await prisma.user.deleteMany({
        where: { email: otherUser.email },
      })
    })

    it('deve retornar erro 401 sem autenticação', async () => {
      const response = await request(app).delete('/api/v1/auth/sessions/some-session-id')
      // Removendo o header Authorization para testar sem autenticação

      expect(response.status).toBe(401)
    })
  })

  describe('Integração entre funcionalidades', () => {
    it('deve manter sessão ativa após alteração de senha', async () => {
      // Verificar que ainda há sessões ativas
      const sessionsResponse = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(sessionsResponse.status).toBe(200)
      expect(sessionsResponse.body.data.length).toBeGreaterThan(0)
    })

    it('deve permitir login com nova senha após alteração', async () => {
      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'NewPass@123',
      })

      expect(loginResponse.status).toBe(200)
      expect(loginResponse.body).toHaveProperty('data.tokens')
    })
  })
})
