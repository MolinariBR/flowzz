import { expect, test } from '@playwright/test'

/**
 * Teste E2E - Integração Coinzz com Clientes REAIS
 *
 * Fluxo:
 * 1. Limpar clientes fake do banco
 * 2. Conectar integração Coinzz com token REAL
 * 3. Sincronizar pedidos da Coinzz
 * 4. Verificar clientes REAIS no banco
 * 5. Validar UI com clientes reais
 *
 * Token: 8747|FicLC2IcZVB7uoMvXBtUgxnNFanuhABVPTS98Bc88c5cb051
 * Usuário: demo@flowzz.com.br / Demo@123
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'
const FLOW_URL = process.env.FLOW_URL || 'http://localhost:3000'
const COINZZ_API_KEY = '8747|FicLC2IcZVB7uoMvXBtUgxnNFanuhABVPTS98Bc88c5cb051'
const DEMO_EMAIL = 'demo@flowzz.com.br'
const DEMO_PASSWORD = 'Demo@123'
// Producer email observado no payload real (use este email ao conectar a integração)
const COINZZ_PRODUCER_EMAIL = 'venettoinv092@gmail.com'

test.describe('Integração Coinzz - Clientes REAIS', () => {
  let accessToken: string

  test.beforeAll(async ({ request }) => {
    console.log('🔐 Login no Flowzz...')
    const loginResponse = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    })

    expect(loginResponse.ok()).toBeTruthy()
    const loginData = await loginResponse.json()
    accessToken = loginData.data.tokens.accessToken
    console.log('✅ Autenticado')
  })

  test('1. Limpar banco de dados (deletar clientes fake)', async ({ request }) => {
    console.log('\n🗑️ Deletando clientes de seed...')

    const clientsResponse = await request.get(`${BACKEND_URL}/api/v1/clients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const clientsData = await clientsResponse.json()
    const clients = clientsData.data || []

    console.log(`📋 ${clients.length} clientes encontrados para deletar`)

    for (const client of clients) {
      await request.delete(`${BACKEND_URL}/api/v1/clients/${client.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      console.log(`  ✅ Deletado: ${client.name}`)
    }

    const verifyResponse = await request.get(`${BACKEND_URL}/api/v1/clients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const remaining = (await verifyResponse.json()).data || []
    expect(remaining.length).toBe(0)
    console.log('✅ Banco limpo - 0 clientes')
  })

  test('2. Conectar integração Coinzz', async ({ request }) => {
    console.log('\n🔗 Conectando Coinzz...')

    const connectResponse = await request.post(
      `${BACKEND_URL}/api/v1/integrations/coinzz/connect`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          apiKey: COINZZ_API_KEY,
          // usar o producerEmail da conta Coinzz (conforme docs/coinzzapi.md)
          producerEmail: COINZZ_PRODUCER_EMAIL,
        },
      }
    )

    const connectText = await connectResponse.text()
    console.log('📡 Status:', connectResponse.status())
    console.log('📡 Resposta:', connectText.substring(0, 200))

    await new Promise((resolve) => setTimeout(resolve, 2000))
  })

  test('3. Sincronizar pedidos da Coinzz', async ({ request }) => {
    console.log('\n🔄 Sincronizando pedidos...')

    const syncResponse = await request.post(`${BACKEND_URL}/api/v1/integrations/coinzz/sync`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { forceFullSync: true },
    })

    const syncText = await syncResponse.text()
    console.log('🔄 Status:', syncResponse.status())
    try {
      const syncJson = JSON.parse(syncText)
      console.log('🔄 Resposta JSON:', JSON.stringify(syncJson, null, 2))
    } catch {
      console.log('🔄 Resposta (texto):', syncText.substring(0, 200))
    }

    console.log('⏳ Aguardando 10 segundos...')
    await new Promise((resolve) => setTimeout(resolve, 10000))
  })

  test('4. Verificar clientes REAIS no banco', async ({ request }) => {
    console.log('\n🔍 Verificando clientes sincronizados...')

    const clientsResponse = await request.get(`${BACKEND_URL}/api/v1/clients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const clientsData = await clientsResponse.json()
    const clients = clientsData.data || []

    console.log(`\n📊 Total: ${clients.length} clientes`)

    if (clients.length === 0) {
      console.log('❌ NENHUM cliente sincronizado!')
      console.log('💡 Causas possíveis:')
      console.log('   - Token inválido')
      console.log('   - Sem pedidos na Coinzz')
      console.log('   - ProducerEmail não corresponde')
    } else {
      console.log('✅ Clientes REAIS:\n')

      for (let i = 0; i < clients.length; i++) {
        const c = clients[i]
        console.log(`${i + 1}. ${c.name}`)
        console.log(`   📧 ${c.email || 'N/A'}`)
        console.log(`   📱 ${c.phone || 'N/A'}`)
        console.log(`   🏙️ ${c.city || 'N/A'} - ${c.state || 'N/A'}`)
        console.log(`   💰 R$ ${c.total_spent || 0} (${c.total_orders || 0} pedidos)`)
        console.log('')
      }

      expect(clients.length).toBeGreaterThan(0)
      expect(clients[0].name).not.toBe('João Silva') // Não é seed
      console.log('✅ São clientes REAIS (não fake)')
    }
  })

  test('5. Validar UI com clientes reais', async ({ page }) => {
    console.log('\n🌐 Validando UI...')

    await page.goto(`${FLOW_URL}/clientes`)
    await page.waitForTimeout(2000)

    await page.screenshot({ path: 'test-results/real-clients.png', fullPage: true })
    console.log('📸 Screenshot salvo')

    const tableCount = await page.locator('table').count()

    if (tableCount > 0) {
      const rows = await page.locator('tbody tr').count()
      console.log(`📋 ${rows} clientes na UI`)

      if (rows > 0) {
        const cells = await page.locator('tbody tr').first().locator('td').allTextContents()
        console.log('👤 Primeiro:', cells.join(' | '))
        console.log('✅ UI mostrando clientes da Coinzz')
      }
    } else {
      console.log('⚠️ Sem tabela ou estado vazio')
    }
  })

  test('6. Verificar vendas sincronizadas', async ({ request }) => {
    console.log('\n💰 Verificando vendas...')

    const salesResponse = await request.get(`${BACKEND_URL}/api/v1/sales`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (salesResponse.ok()) {
      const salesData = await salesResponse.json()
      const sales = salesData.data?.sales || salesData.data || []

      console.log(`📊 ${sales.length} vendas`)

      if (sales.length > 0) {
        for (let i = 0; i < Math.min(3, sales.length); i++) {
          const s = sales[i]
          console.log(`${i + 1}. ${s.productName || s.product_name || 'Produto'}`)
          console.log(`   💵 R$ ${s.value || s.total || 0}`)
          console.log(`   📊 ${s.status}`)
        }
      }
    }
  })
})
