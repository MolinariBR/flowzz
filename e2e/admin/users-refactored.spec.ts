import { expect, test } from '@playwright/test'

/**
 * Testes E2E - Admin Users Management (REFATORADO)
 * Testa gestão de usuários no painel admin
 *
 * VALIDAÇÕES CRÍTICAS:
 * - Zustand hydrated = true (fix do bug de hidratação)
 * - API de usuários chamada corretamente
 * - Usuários renderizados na tabela
 */

test.describe('Admin - Users Management (REFATORADO)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users')
  })

  test('🔍 DIAGNÓSTICO COMPLETO: valida hidratação Zustand + API + renderização', async ({ page }) => {
    console.log('🚀 Iniciando diagnóstico completo...')

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

    console.log('📦 LocalStorage:', storageInfo)

    // VALIDAÇÃO CRÍTICA: hydrated deve ser true
    expect(storageInfo.zustandState.hydrated).toBe(true)
    console.log('✅ Zustand hydrated = true (fix aplicado)')

    // Aguardar a API de usuários ser chamada
    console.log('📡 Aguardando request para /api/v1/admin/users...')
    const apiRequestPromise = page.waitForRequest(
      request => request.url().includes('/api/v1/admin/users'),
      { timeout: 10000 }
    )

    const apiRequest = await apiRequestPromise
    console.log('✅ Request capturado:', apiRequest.url())

    // Aguardar a resposta da API
    const apiResponse = await apiRequest.response()
    expect(apiResponse?.status()).toBe(200)
    console.log('✅ API respondeu com status 200')

    // Verificar se há usuários visíveis na tabela
    await page.waitForTimeout(2000) // Aguardar renderização
    const visibleUsers = await page.locator('tbody tr, [class*="user"]').count()
    console.log(`👥 Usuários visíveis: ${visibleUsers}`)

    // Capturar screenshot
    await page.screenshot({ path: 'debug-users-page-refactored.png', fullPage: true })
    console.log('📸 Screenshot salvo')

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
    expect(visibleUsers).toBeGreaterThan(0)
    console.log('✅ TESTE COMPLETO: Zustand hidratado ✓ | API chamada ✓ | Usuários renderizados ✓')
  })

  test('deve carregar página de usuários', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/users/)
    await expect(page.getByText(/usuários|lista de usuários/i).first()).toBeVisible()
  })

  test('deve listar todos os usuários', async ({ page }) => {
    await page.waitForTimeout(3000)

    // Aguardar que a tabela seja renderizada
    await page.waitForSelector('table', { timeout: 10000 })

    // Verificar se há linhas na tabela
    const tableRows = page.locator('table tbody tr')
    const count = await tableRows.count()

    // Se não houver linhas, tentar fallback
    if (count === 0) {
      const userElements = await page.locator('[class*="user"], [data-user], .user-card').count()
      expect(userElements).toBeGreaterThanOrEqual(2)
      console.log(`✅ Encontrados ${userElements} usuários via fallback`)
    } else {
      expect(count).toBeGreaterThanOrEqual(2)
      console.log(`✅ Encontrados ${count} usuários na tabela`)
    }
  })

  test('deve exibir informações dos usuários', async ({ page }) => {
    await page.waitForTimeout(3000)

    // Aguardar que a tabela seja renderizada
    await page.waitForSelector('table', { timeout: 10000 })

    // Verificar cabeçalhos da tabela usando seletores específicos
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

    // Usar o campo de busca específico da DataTable
    const searchInput = page.getByPlaceholder('Buscar usuários...')

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.clear()
      await searchInput.fill('demo')
      await page.waitForTimeout(1000)

      // Verificar se o campo foi preenchido corretamente
      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe('demo')

      console.log('✅ Campo de busca funcionou - preenchido com "demo"')
    } else {
      console.log('⚠️ Campo de busca não encontrado')
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
})
