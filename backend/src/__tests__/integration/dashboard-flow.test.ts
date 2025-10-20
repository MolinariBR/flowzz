// Teste de integração E2E - Fluxo de Dashboard
// Testa: Login → Get Metrics → Get Chart Data → Get Activities

import request from 'supertest'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import app from '../../app'

describe('E2E - Fluxo de Dashboard', () => {
  const testUser = {
    email: `test-dashboard-${Date.now()}@flowzz.com`,
    password: 'Test@123456',
    nome: 'Test Dashboard User',
  }

  let accessToken: string
  let userId: string

  beforeAll(async () => {
    // Registrar e fazer login
    const registerResponse = await request(app).post('/api/v1/auth/register').send(testUser)

    accessToken = registerResponse.body.data.tokens.accessToken
    userId = registerResponse.body.data.user.id

    // Criar alguns dados de teste
    // Criar cliente
    await request(app).post('/api/v1/clients').set('Authorization', `Bearer ${accessToken}`).send({
      name: 'Dashboard Test Client',
      email: 'dashclient@test.com',
      phone: '11999999999',
    })

    // Criar vendas
    const saleData = {
      external_id: `sale-${Date.now()}`,
      status: 'PAID',
      product_name: 'Produto Teste Dashboard',
      quantity: 1,
      unit_price: 1000,
      total_price: 1000,
      client_name: 'Dashboard Test Client',
      client_email: 'dashclient@test.com',
      sale_date: new Date().toISOString(),
    }

    await request(app)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(saleData)
  })

  afterEach(async () => {
    // Limpar dados de teste
    const { prisma } = await import('../../shared/config/database')
    await prisma.sale.deleteMany({
      where: { user_id: userId },
    })
    await prisma.goal.deleteMany({
      where: { user_id: userId },
    })
    await prisma.client.deleteMany({
      where: { name: { contains: 'Dashboard Test Client' } },
    })
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { contains: 'test-dashboard-' } } },
    })
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-dashboard-' } },
    })
  })

  it('deve buscar métricas do dashboard', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/metrics')
      .set('Authorization', `Bearer ${accessToken}`)

    if (response.status !== 200) {
      console.error('\n❌ GET /dashboard/metrics failed:')
      console.error('Status:', response.status)
      console.error('Body:', JSON.stringify(response.body, null, 2))
    }
    expect(response.status).toBe(200)

    // API retorna snake_case (padrão do backend)
    expect(response.body.data).toHaveProperty('vendas_hoje')
    expect(response.body.data).toHaveProperty('gasto_anuncios')
    expect(response.body.data).toHaveProperty('lucro_liquido')
    expect(response.body.data).toHaveProperty('pagamentos_agendados')
  })

  it('deve buscar dados do gráfico de vendas', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/chart')
      .set('Authorization', `Bearer ${accessToken}`)

    if (response.status !== 200) {
      console.error('\n❌ GET /dashboard/chart failed:')
      console.error('Status:', response.status)
      console.error('Body:', JSON.stringify(response.body, null, 2))
    }
    expect(response.status).toBe(200)

    expect(response.body.data).toBeInstanceOf(Array)
  })

  it('deve buscar atividades recentes', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/activities')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(response.body.data).toBeInstanceOf(Array)
  })

  it('deve filtrar métricas por período', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/metrics?period=7')
      .set('Authorization', `Bearer ${accessToken}`)

    if (response.status !== 200) {
      console.error('\n❌ GET /dashboard/metrics?period=7 failed:')
      console.error('Status:', response.status)
      console.error('Body:', JSON.stringify(response.body, null, 2))
    }
    expect(response.status).toBe(200)

    expect(response.body.data).toHaveProperty('vendas_hoje')
  })

  it('deve buscar top clientes', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/top-clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(response.body.data).toBeInstanceOf(Array)
  })

  it('deve validar período inválido', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/metrics?period=invalid')
      .set('Authorization', `Bearer ${accessToken}`)

    if (response.status !== 400) {
      console.error('\n❌ Validação de período inválido não funcionou:')
      console.error('Status esperado: 400, recebido:', response.status)
      console.error('Body:', JSON.stringify(response.body, null, 2))
      console.error('\n🔍 Diagnóstico:')
      console.error('   - DashboardController NÃO ESTÁ VALIDANDO o parâmetro period')
      console.error("   - Adicione validação: if (!['7', '30', '90'].includes(period)) return 400")
    }
    expect(response.status).toBe(400)

    expect(response.body).toHaveProperty('error')
  })

  it('não deve permitir acesso sem autenticação', async () => {
    await request(app).get('/api/v1/dashboard/metrics').expect(401)
  })

  it('deve garantir multi-tenancy (usuários não veem dados de outros)', async () => {
    // Criar outro usuário
    const otherUser = {
      email: `test-other-${Date.now()}@flowzz.com`,
      password: 'Test@123456',
      nome: 'Other User',
    }

    const otherRegisterResponse = await request(app).post('/api/v1/auth/register').send(otherUser)

    const otherAccessToken = otherRegisterResponse.body.data.tokens.accessToken

    // Tentar acessar métricas com token de outro usuário
    const response = await request(app)
      .get('/api/v1/dashboard/metrics')
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .expect(200)

    // Não deve ver vendas do primeiro usuário
    expect(response.body.data.vendas_hoje).toBe(0)
  })
})
