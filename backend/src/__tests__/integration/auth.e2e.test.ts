/**
 * Testes E2E de Autenticação - CORRIGIDOS
 * 
 * ✅ Baseado em auth-flow.test.ts (testes que funcionam)
 * 
 * Correções aplicadas:
 * 1. ✅ Formato resposta: { data: { user, tokens }, message }
 * 2. ✅ Senhas: Test@123456 (padrão do projeto)
 * 3. ✅ Cria próprios usuários (não depende de seed)
 * 4. ✅ Cleanup em afterAll (não beforeEach)
 * 5. ✅ Import correto: app (não server)
 * 6. ✅ Timestamps únicos para evitar conflitos
 */

import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Authentication E2E Tests - FIXED', () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  const testUser = {
    email: `test-auth-e2e-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test Auth E2E User',
  };

  afterAll(async () => {
    // Limpar dados de teste APENAS NO FINAL
    const { prisma } = await import('../../shared/config/database');
    await prisma.refreshToken.deleteMany({ 
      where: { user: { email: { contains: 'test-auth-e2e-' } } } 
    });
    await prisma.user.deleteMany({ 
      where: { email: { contains: 'test-auth-e2e-' } } 
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('deve registrar um novo usuário com trial de 7 dias', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      if (response.status !== 201) {
        console.error('\n❌ POST /auth/register failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(201);

      // ✅ FORMATO CORRETO: { data: { user, tokens }, message }
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      
      const { user, tokens } = response.body.data;
      
      expect(user.email).toBe(testUser.email);
      expect(user.nome).toBe(testUser.nome);
      expect(user.role).toBe('USER');
      expect(user.subscription_status).toBe('TRIAL');
      expect(user.trial_ends_at).toBeDefined();
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      // Salvar para próximos testes
      userId = user.id;
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    });

    it('deve retornar 409 se email já existir', async () => {
      // Tentar registrar com mesmo email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(409); // ✅ CORRETO: 409 Conflict
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 400 se senha for fraca', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `weak-${Date.now()}@test.com`,
          password: '123', // Senha muito fraca
          nome: 'Test Weak',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('deve fazer login com credenciais corretas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      if (response.status !== 200) {
        console.error('\n❌ POST /auth/login failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      // ✅ FORMATO CORRETO
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');

      // Atualizar tokens
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'naoexiste@flowzz.com',
          password: 'SenhaQualquer@123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 401 para senha incorreta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'SenhaErrada@123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('deve renovar accessToken com refreshToken válido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      if (response.status !== 200) {
        console.error('\n❌ POST /auth/refresh failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      expect(response.body.data).toHaveProperty('accessToken');
      
      // Atualizar o accessToken
      accessToken = response.body.data.accessToken;
    });

    it('deve retornar 401 para refreshToken inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'token_invalido_fake' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      if (response.status !== 200) {
        console.error('\n❌ GET /auth/me failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.id).toBe(userId);
    });

    it('deve retornar 401 sem token de autenticação', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 401 com token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token_invalido_fake');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('deve fazer logout e invalidar refreshToken', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      if (response.status !== 200) {
        console.error('\n❌ POST /auth/logout failed:');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      // Tentar usar o refreshToken novamente deve falhar
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(401);
    });
  });
});
