// Teste de integração E2E - Fluxo de Autenticação
// Testa: Register → Login → Access Protected Route → Refresh Token → Logout

import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('E2E - Fluxo de Autenticação Completo', () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  const testUser = {
    email: `test-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test User E2E',
    role: 'ADMIN' as const,
  };

  afterAll(async () => {
    // Limpar dados de teste APENAS NO FINAL
    const { prisma } = await import('../../shared/config/database');
    await prisma.refreshToken.deleteMany({ 
      where: { user: { email: { contains: 'test-' } } } 
    });
    await prisma.user.deleteMany({ 
      where: { email: { contains: 'test-' } } 
    });
  });

  it('deve registrar novo usuário', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    if (response.status !== 201) {
      console.error('\n❌ POST /auth/register failed:');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(response.body, null, 2));
    }
    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('tokens');
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.user.nome).toBe(testUser.nome);

    userId = response.body.data.user.id;
    accessToken = response.body.data.tokens.accessToken;
    refreshToken = response.body.data.tokens.refreshToken;
  });

  it('deve fazer login com usuário criado', async () => {
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

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('tokens');
    expect(response.body.data.tokens).toHaveProperty('accessToken');
    expect(response.body.data.tokens).toHaveProperty('refreshToken');

    accessToken = response.body.data.tokens.accessToken;
    refreshToken = response.body.data.tokens.refreshToken;
  });

  it('deve acessar rota protegida com token válido', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    if (response.status !== 200) {
      console.error('\n❌ GET /auth/me failed:');
      console.error('Status:', response.status);
      console.error('Headers:', response.headers);
      console.error('Body:', JSON.stringify(response.body, null, 2));
      console.error('\n🔍 Diagnóstico:');
      if (response.status === 404) {
        console.error('   - Rota /api/v1/auth/me NÃO EXISTE ou não está registrada');
        console.error('   - Verifique se a rota está em src/routes/auth.ts');
        console.error('   - Verifique se as rotas estão montadas em src/app.ts');
      }
    }
    expect(response.status).toBe(200);

    expect(response.body.data.user.email).toBe(testUser.email);
  });

  it('deve bloquear acesso sem token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me');

    expect(response.status).toBe(401);
  });

  it('deve fazer refresh do token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    if (response.status !== 200) {
      console.error('\n❌ POST /auth/refresh failed:');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(response.body, null, 2));
      console.error('Refresh Token enviado:', refreshToken?.substring(0, 50) + '...');
      console.error('\n🔍 Diagnóstico:');
      if (response.status === 401) {
        console.error('   - Token inválido ou expirado');
        console.error('   - Verifique se o formato do token mudou (adicionamos jti)');
        console.error('   - Verifique AuthService.validateRefreshToken()');
      }
    }
    expect(response.status).toBe(200);

    expect(response.body.data).toHaveProperty('accessToken');
    
    // Atualizar o accessToken
    accessToken = response.body.data.accessToken;
  });

  it('deve fazer logout', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    if (response.status !== 200) {
      console.error('\n❌ POST /auth/logout failed:');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(response.body, null, 2));
      console.error('\n🔍 Diagnóstico:');
      if (response.status === 400 || response.status === 401) {
        console.error('   - Refresh token inválido ou não encontrado no banco');
        console.error('   - Verifique se o token foi salvo corretamente no register');
      }
    }
    expect(response.status).toBe(200);
    
    // Invalidar o token local
    accessToken = '';
  });

  it('deve bloquear acesso após logout', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(401);
  });
});
