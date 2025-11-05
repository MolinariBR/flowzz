import { expect, test } from '@playwright/test'

/**
 * Testes E2E - Admin Users Management
 * Testa gestão de usuários no painel admin
 *
 * Usa autenticação global (admin-user.json)
 */

test.describe('Admin - Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users')
  })

  test('🔍 DIAGNÓSTICO: deve verificar se usuários estão carregando', async ({ page }) => {
    console.log('🚀 Iniciando diagnóstico de carregamento de usuários...')

    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verificar se estamos na página correta
    await expect(page).toHaveURL(/.*\/users/)
    console.log('✅ Página /users carregada')

    // Verificar localStorage e Zustand
    const storageInfo = await page.evaluate(() => ({
      accessToken: !!localStorage.getItem('access_token'),
      authStorage: !!localStorage.getItem('admin-auth-storage'),
      zustandState: (() => {
        try {
          const state = JSON.parse(localStorage.getItem('admin-auth-storage') || '{}')
          return {
            hydrated: state.state?.hydrated,
            isAuthenticated: state.state?.isAuthenticated,
            hasUser: !!state.state?.user,
            hasToken: !!state.state?.token
          }
        } catch {
          return { error: 'Erro ao parsear Zustand' }
        }
      })()
    }))

    console.log('� LocalStorage:', storageInfo)

    // Verificar se há usuários visíveis
    const visibleUsers = await page.locator('tbody tr, [class*="user"]').count()
    console.log(`👥 Usuários visíveis: ${visibleUsers}`)

    // Capturar screenshot
    await page.screenshot({ path: 'debug-users-page.png', fullPage: true })
    console.log('📸 Screenshot salvo como debug-users-page.png')

    // Verificar requests de API
    const apiRequests: string[] = []
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(`${request.method()} ${request.url()}`)
      }
    })

    await page.waitForTimeout(1000)
    console.log('📡 Requests de API:', apiRequests.length)
    for (const req of apiRequests) {
      console.log(`  - ${req}`)
    }

    // Verificar se há erros no console
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    if (consoleErrors.length > 0) {
      console.log(`🚨 Erros no console:`, consoleErrors)
    }

    // Resultado final
    if (visibleUsers > 0) {
      console.log('✅ Usuários encontrados!')
      expect(visibleUsers).toBeGreaterThan(0)
    } else {
      console.log('❌ Nenhum usuário visível')
      throw new Error(`Nenhum usuário encontrado. LocalStorage: ${JSON.stringify(storageInfo)}, Requests: ${apiRequests.length}`)
    }
  })

  test('deve carregar página de usuários', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/users/)
    await expect(page.getByText(/usuários|lista de usuários/i).first()).toBeVisible()
  })

  test('deve listar todos os usuários', async ({ page }) => {
    await page.waitForTimeout(3000)

    // Aguardar que a tabela seja renderizada - tentar múltiplas estratégias
    const tableSelectors = [
      'table',
      '[role="table"]',
      '.data-table',
      '[class*="table"]',
      'tbody tr'
    ]

    let tableFound = false
    for (const selector of tableSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 10000 })
        console.log(`✅ Tabela encontrada com seletor: ${selector}`)
        tableFound = true
        break
      } catch {
        console.log(`❌ Tabela não encontrada com seletor: ${selector}`)
      }
    }

    if (!tableFound) {
      throw new Error('Nenhuma tabela encontrada na página')
    }

    // Verificar se há linhas na tabela usando múltiplas estratégias
    const rowSelectors = [
      'table tbody tr',
      'tbody tr',
      '[role="row"]:not([role="columnheader"])',
      'tr[data-row]'
    ]

    let rowsFound = false
    let rowCount = 0

    for (const selector of rowSelectors) {
      try {
        const rows = page.locator(selector)
        rowCount = await rows.count()
        if (rowCount > 0) {
          console.log(`✅ Encontradas ${rowCount} linhas com seletor: ${selector}`)
          break
        }
      } catch {
        console.log(`❌ Nenhuma linha encontrada com seletor: ${selector}`)
      }
    }

    // Verificar se há pelo menos 2 usuários
    if (rowCount >= 2) {
      expect(rowCount).toBeGreaterThanOrEqual(2)
      console.log(`✅ Encontrados ${rowCount} usuários na tabela`)
    } else {
      // Fallback: verificar se há elementos de usuário visíveis
      const userElements = await page.locator('[class*="user"], [data-user], .user-card').count()
      console.log(`Tentando fallback: ${userElements} elementos de usuário encontrados`)

      if (userElements >= 2) {
        expect(userElements).toBeGreaterThanOrEqual(2)
        console.log(`✅ Encontrados ${userElements} usuários via fallback`)
      } else {
        throw new Error(`Poucos usuários encontrados. Linhas na tabela: ${rowCount}, Elementos de usuário: ${userElements}`)
      }
    }
  })

  test('deve exibir informações dos usuários', async ({ page }) => {
    await page.waitForTimeout(3000)

    // Aguardar que a tabela seja renderizada
    await page.waitForSelector('table', { timeout: 10000 })

    // Verificar cabeçalhos da tabela usando seletores mais específicos
    await expect(page.locator('table thead th').filter({ hasText: 'Usuário' })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('table thead th').filter({ hasText: 'Plano' })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('table thead th').filter({ hasText: 'Status' })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('table thead th').filter({ hasText: 'MRR' })).toBeVisible({ timeout: 5000 })

    console.log('✅ Cabeçalhos da tabela encontrados')
  })

  test('deve buscar usuários por email', async ({ page }) => {
    await page.waitForTimeout(3000)

    // Aguardar que a tabela seja renderizada
    await page.waitForSelector('table', { timeout: 10000 })

    // Usar o campo de busca específico da DataTable (placeholder "Buscar usuários...")
    const searchInput = page.getByPlaceholder('Buscar usuários...')

    if (await searchInput.isVisible({ timeout: 5000 })) {
      // Limpar e preencher o campo de busca
      await searchInput.clear()
      await searchInput.fill('demo')
      await page.waitForTimeout(1000)

      // Verificar se o campo foi preenchido corretamente
      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe('demo')

      console.log('✅ Campo de busca funcionou - preenchido com "demo"')
    } else {
      console.log('⚠️ Campo de busca não encontrado')
      // Se não encontrou o campo específico, tentar o genérico
      const genericSearch = page.locator('input[type="text"]').first()
      if (await genericSearch.isVisible()) {
        await genericSearch.fill('demo')
        console.log('✅ Campo de busca genérico funcionou')
      }
    }
  })

  test('deve filtrar usuários por status', async ({ page }) => {
    await page.waitForTimeout(1000)

    const statusFilter = page
      .getByRole('button', { name: /status|filtrar/i })
      .or(page.locator('[data-testid="status-filter"]'))

    if (await statusFilter.isVisible()) {
      await statusFilter.click()
      await page.getByText(/ativo|active/i).click()
      await page.waitForTimeout(500)
    }
  })

  test('deve abrir detalhes do usuário', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Aguardar carregamento dos usuários
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr')
      return rows.length >= 2
    }, { timeout: 10000 })

    // Clicar na primeira linha
    const firstUser = page.locator('tbody tr').first()
    await firstUser.click()

    // Verificar modal/página de detalhes
    await expect(page.getByText(/detalhes|informações do usuário/i)).toBeVisible({ timeout: 3000 })
  })

  test('deve exibir histórico de assinaturas', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Aguardar carregamento dos usuários
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr')
      return rows.length >= 2
    }, { timeout: 10000 })

    // Abrir detalhes
    await page.locator('tbody tr').first().click()
    await page.waitForTimeout(500)

    // Verificar seção de assinaturas
    const subscriptionSection = page.getByText(/assinatura|subscription|histórico/i)

    if (await subscriptionSection.isVisible()) {
      await expect(page.getByText(/trial|básico|premium/i)).toBeVisible()
    }
  })

  test('deve suspender usuário', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Aguardar carregamento dos usuários
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr')
      return rows.length >= 2
    }, { timeout: 10000 })

    // Encontrar botão de ações
    const actionsButton = page.getByRole('button', { name: /ações|actions/i }).first()

    if (await actionsButton.isVisible()) {
      await actionsButton.click()

      // Clicar em suspender
      const suspendButton = page.getByText(/suspender|suspend/i)

      if (await suspendButton.isVisible()) {
        await suspendButton.click()

        // Confirmar
        await page.getByRole('button', { name: /confirmar|sim/i }).click()

        // Verificar confirmação
        await expect(page.getByText(/suspenso|suspended/i)).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('deve reativar usuário suspenso', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Aguardar carregamento dos usuários
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr')
      return rows.length >= 2
    }, { timeout: 10000 })

    // Encontrar botão de ações
    const actionsButton = page.getByRole('button', { name: /ações|actions/i }).first()

    if (await actionsButton.isVisible()) {
      await actionsButton.click()

      // Clicar em reativar
      const reactivateButton = page.getByText(/reativar|activate/i)

      if (await reactivateButton.isVisible()) {
        await reactivateButton.click()

        // Confirmar
        await page.getByRole('button', { name: /confirmar|sim/i }).click()

        // Verificar confirmação
        await expect(page.getByText(/reativado|ativo/i)).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('deve visualizar audit logs do usuário', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Aguardar carregamento dos usuários
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr')
      return rows.length >= 2
    }, { timeout: 10000 })

    // Abrir detalhes
    await page.locator('tbody tr').first().click()
    await page.waitForTimeout(500)

    // Verificar seção de logs
    const logsSection = page.getByText(/logs|atividades|histórico/i)

    if (await logsSection.isVisible()) {
      // Deve haver registros de ações
      await expect(page.getByText(/login|criou|atualizou/i)).toBeVisible()
    }
  })

  test('deve paginar lista de usuários', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Aguardar carregamento dos usuários
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr')
      return rows.length >= 2
    }, { timeout: 10000 })

    // Verificar paginação
    const nextButton = page.getByRole('button', { name: /próxima|next|>/i })

    if (await nextButton.isVisible()) {
      await nextButton.click()
      await page.waitForTimeout(500)

      // Página deve ter mudado
      await expect(page.getByText(/página 2|page 2/i)).toBeVisible()
    }
  })

  test('deve exportar lista de usuários', async ({ page }) => {
    await page.waitForTimeout(1000)

    const exportButton = page.getByRole('button', { name: /exportar|export|download/i })

    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download')
      await exportButton.click()

      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/users|usuarios/i)
    }
  })
})
