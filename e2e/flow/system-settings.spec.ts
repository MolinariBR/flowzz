import { expect, test } from '@playwright/test'

/**
 * Testes E2E - Flow System Settings
 * Testa funcionalidades de configurações do sistema na página de configurações
 */

test.describe('Flow - System Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Garantir que está logado (usando storage state)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*\/dashboard/)
  })

  test('deve acessar aba sistema na página de configurações', async ({ page }) => {
    await page.goto('/configuracoes')

    // Clicar na aba sistema
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Verificar que aba sistema está ativa
    await expect(page.getByRole('tab', { name: /sistema/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.getByText(/preferências|sistema/i)).toBeVisible()
  })

  test('deve carregar configurações padrão', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Verificar configurações padrão
    await expect(page.getByText(/modo escuro|dark mode/i)).toBeVisible()
    await expect(page.getByText(/idioma|language/i)).toBeVisible()
    await expect(page.getByText(/fuso horário|timezone/i)).toBeVisible()
    await expect(page.getByText(/formato de data|date format/i)).toBeVisible()
    await expect(page.getByText(/moeda|currency/i)).toBeVisible()
  })

  test('deve permitir alternar modo escuro', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Localizar toggle de modo escuro
    const darkModeToggle = page
      .getByRole('switch', { name: /modo escuro|dark mode/i })
      .or(page.getByLabel(/modo escuro|dark mode/i))
      .or(page.locator('[data-testid="dark-mode-toggle"]'))

    // Verificar que toggle existe
    await expect(darkModeToggle).toBeVisible()

    // Guardar estado inicial
    const initialState = await darkModeToggle.isChecked()

    // Alternar
    await darkModeToggle.click()

    // Aguardar atualização
    await page.waitForTimeout(500)

    // Verificar que estado mudou
    const newState = await darkModeToggle.isChecked()
    expect(newState).not.toBe(initialState)

    // Verificar feedback visual (opcional - depende da implementação)
    if (initialState) {
      // Se estava escuro, verificar se ficou claro
      await expect(page.locator('html')).not.toHaveClass(/dark/)
    } else {
      // Se estava claro, verificar se ficou escuro
      await expect(page.locator('html')).toHaveClass(/dark/)
    }
  })

  test('deve permitir alterar idioma', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Localizar seletor de idioma
    const languageSelect = page
      .getByLabel(/idioma|language/i)
      .or(
        page.locator('select[name*="language"]').or(page.locator('[data-testid="language-select"]'))
      )

    await expect(languageSelect).toBeVisible()

    // Selecionar português brasileiro
    await languageSelect.selectOption('pt-BR')

    // Aguardar atualização
    await page.waitForTimeout(500)

    // Verificar que foi salvo (feedback de sucesso)
    await expect(page.getByText(/salvo|atualizado|configurações.*salvas/i)).toBeVisible()
  })

  test('deve permitir alterar fuso horário', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Localizar seletor de timezone
    const timezoneSelect = page
      .getByLabel(/fuso horário|timezone/i)
      .or(
        page.locator('select[name*="timezone"]').or(page.locator('[data-testid="timezone-select"]'))
      )

    await expect(timezoneSelect).toBeVisible()

    // Selecionar São Paulo
    await timezoneSelect.selectOption('America/Sao_Paulo')

    // Aguardar atualização
    await page.waitForTimeout(500)

    // Verificar que foi salvo
    await expect(page.getByText(/salvo|atualizado|configurações.*salvas/i)).toBeVisible()
  })

  test('deve permitir alterar formato de data', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Localizar seletor de formato de data
    const dateFormatSelect = page
      .getByLabel(/formato.*data|date.*format/i)
      .or(
        page.locator('select[name*="date"]').or(page.locator('[data-testid="date-format-select"]'))
      )

    await expect(dateFormatSelect).toBeVisible()

    // Selecionar formato brasileiro
    await dateFormatSelect.selectOption('DD/MM/YYYY')

    // Aguardar atualização
    await page.waitForTimeout(500)

    // Verificar que foi salvo
    await expect(page.getByText(/salvo|atualizado|configurações.*salvas/i)).toBeVisible()
  })

  test('deve permitir alterar moeda', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Localizar seletor de moeda
    const currencySelect = page
      .getByLabel(/moeda|currency/i)
      .or(
        page.locator('select[name*="currency"]').or(page.locator('[data-testid="currency-select"]'))
      )

    await expect(currencySelect).toBeVisible()

    // Selecionar Real brasileiro
    await currencySelect.selectOption('BRL')

    // Aguardar atualização
    await page.waitForTimeout(500)

    // Verificar que foi salvo
    await expect(page.getByText(/salvo|atualizado|configurações.*salvas/i)).toBeVisible()
  })

  test('deve atualizar múltiplas configurações simultaneamente', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Alterar múltiplas configurações
    const darkModeToggle = page
      .getByRole('switch', { name: /modo escuro|dark mode/i })
      .or(page.getByLabel(/modo escuro|dark mode/i))

    const languageSelect = page.getByLabel(/idioma|language/i)
    const timezoneSelect = page.getByLabel(/fuso horário|timezone/i)

    // Alterar modo escuro
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click()
    }

    // Alterar idioma
    if (await languageSelect.isVisible()) {
      await languageSelect.selectOption('en-US')
    }

    // Alterar timezone
    if (await timezoneSelect.isVisible()) {
      await timezoneSelect.selectOption('America/New_York')
    }

    // Salvar todas as alterações
    await page.getByRole('button', { name: /salvar|atualizar/i }).click()

    // Aguardar feedback de sucesso
    await expect(page.getByText(/salvo|atualizado|configurações.*salvas/i)).toBeVisible()
  })

  test('deve manter configurações após recarregar página', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.getByRole('tab', { name: /sistema/i }).click()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Alterar uma configuração
    const darkModeToggle = page
      .getByRole('switch', { name: /modo escuro|dark mode/i })
      .or(page.getByLabel(/modo escuro|dark mode/i))

    if (await darkModeToggle.isVisible()) {
      const initialState = await darkModeToggle.isChecked()
      await darkModeToggle.click()

      // Salvar
      await page.getByRole('button', { name: /salvar|atualizar/i }).click()
      await expect(page.getByText(/salvo|atualizado/i)).toBeVisible()

      // Recarregar página
      await page.reload()

      // Aguardar carregamento
      await page.waitForTimeout(1000)

      // Verificar que aba sistema ainda está ativa
      await expect(page.getByRole('tab', { name: /sistema/i })).toHaveAttribute(
        'aria-selected',
        'true'
      )

      // Verificar que configuração foi mantida
      const newState = await darkModeToggle.isChecked()
      expect(newState).not.toBe(initialState)
    }
  })
})
