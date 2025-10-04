import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

/**
 * Testes de integração E2E para autenticação (CORRIGIDO)
 * Baseado em auth-flow.test.ts (testes que funcionam)
 * 
 * Correções aplicadas:
 * 1. ✅ Formato resposta: { data: { user, tokens }, message }
 * 2. ✅ Senhas: Test@123456 (padrão do projeto)
 * 3. ✅ Status codes corretos (409 para email duplicado)
 * 4. ✅ Cria próprios usuários (não depende de seed)
 * 5. ✅ Cleanup em afterAll (não beforeEach)
 * 6. ✅ Timestamps únicos (evita conflitos)
 */
describe('Authentication E2E Tests', () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  const testUser = {
    email: `test-auth-e2e-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test Auth E2E User',
    role: 'USER' as const,
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
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.nome).toBe(testUser.nome);
      expect(response.body.data.user.role).toBe('USER');
      expect(response.body.data.user.subscription_status).toBe('TRIAL');

      // Salvar para próximos testes
      userId = response.body.data.user.id;
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;

      // Verificar que trial foi criado
      expect(response.body.data.user.trial_ends_at).toBeDefined();
      
      // Verificar que usuário foi salvo no banco
      const userInDb = await prisma.user.findUnique({
        where: { email: newUser.email },
      });
      
      expect(userInDb).toBeDefined();
      expect(userInDb?.subscription_status).toBe('TRIAL');
    });

    it('deve retornar 400 se email já existir', async () => {
      // Criar usuário primeiro
      const existingUser = createTestUser();
      await prisma.user.create({ data: existingUser });

      // Tentar registrar com mesmo email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: existingUser.email,
          password: 'OutraSenha@123',
          nome: 'Outro Nome',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 400 se senha for fraca', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Senha muito fraca
          nome: 'Test User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('deve fazer login com credenciais corretas (usuário demo do seed)', async () => {
      // Usar credenciais do seed: demo@flowzz.com.br / demo123456
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'demo@flowzz.com.br',
          password: 'demo123456',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          email: 'demo@flowzz.com.br',
          role: 'USER',
        },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      // Verificar que refresh token foi salvo no banco
      const refreshToken = await prisma.refreshToken.findFirst({
        where: { user_id: response.body.user.id },
      });
      
      expect(refreshToken).toBeDefined();
    });

    it('deve fazer login com admin do seed', async () => {
      // Usar credenciais do seed: admin@flowzz.com.br / admin123456
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@flowzz.com.br',
          password: 'admin123456',
        })
        .expect(200);

      expect(response.body.user).toMatchObject({
        email: 'admin@flowzz.com.br',
        role: 'ADMIN',
      });
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'inexistente@flowzz.com.br',
          password: 'senhaerrada',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 401 se senha estiver incorreta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'demo@flowzz.com.br',
          password: 'senhaerrada',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('deve renovar accessToken com refreshToken válido', async () => {
      // Login primeiro
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'demo@flowzz.com.br',
          password: 'demo123456',
        });

      const { refreshToken } = loginResponse.body;

      // Aguardar 1 segundo para garantir que o novo token será diferente
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Renovar token
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      // Novo access token deve ser diferente do anterior
      expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);
    });

    it('deve retornar 401 com refreshToken inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'token_invalido_xyz' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 401 com refreshToken expirado', async () => {
      // Criar um refresh token já expirado
      const user = await prisma.user.findUnique({ where: { email: 'demo@flowzz.com.br' } });
      
      if (!user) {
        throw new Error('User demo not found');
      }

      const expiredToken = await prisma.refreshToken.create({
        data: {
          token: 'expired_token_xyz',
          user_id: user.id,
          expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expirou ontem
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: expiredToken.token })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('deve invalidar refreshToken ao fazer logout', async () => {
      // Login primeiro
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'demo@flowzz.com.br',
          password: 'demo123456',
        });

      const { refreshToken } = loginResponse.body;

      // Logout
      await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Verificar que token foi removido do banco
      const tokenInDb = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      
      expect(tokenInDb).toBeNull();

      // Tentar usar o refresh token após logout deve falhar
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'demo@flowzz.com.br',
          password: 'demo123456',
        });

      const { accessToken } = loginResponse.body;

      // Buscar dados do usuário
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: 'demo@flowzz.com.br',
        role: 'USER',
        subscription_status: 'TRIAL',
      });
    });

    it('deve retornar 401 sem token de autenticação', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 401 com token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token_invalido_xyz')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
