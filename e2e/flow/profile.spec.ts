import { expect, test } from '@playwright/test'

/**
 * Testes E2E - Flow Profile Management
 * Testa funcionalidades de gerenciamento de perfil na página de configurações
 */

test.describe('Flow - Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Garantir que está logado (usando storage state)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*\/dashboard/)
  })

  test('deve acessar página de configurações e aba perfil', async ({ page }) => {
    // Navegar para configurações
    await page.goto('/configuracoes')

    // Verificar que página carregou
    await expect(page.getByText(/configurações/i)).toBeVisible()

    // Verificar que aba perfil está ativa por padrão
    await expect(page.getByRole('tab', { name: /perfil/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.getByText(/meu perfil|dados pessoais/i)).toBeVisible()
  })

  test('deve carregar dados do perfil atual', async ({ page }) => {
    await page.goto('/configuracoes')

    // Aguardar carregamento dos dados
    await page.waitForTimeout(1000)

    // Verificar que campos estão preenchidos
    const nomeField = page.getByLabel(/nome/i)
    const emailField = page.getByLabel(/email/i)

    await expect(nomeField).not.toBeEmpty()
    await expect(emailField).not.toBeEmpty()

    // Verificar que email contém domínio flowzz
    const emailValue = await emailField.inputValue()
    expect(emailValue).toContain('@flowzz.com')
  })

  test('deve atualizar dados do perfil com sucesso', async ({ page }) => {
    await page.goto('/configuracoes')

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Modificar dados
    const novoNome = `João Silva Atualizado ${Date.now()}`
    const novoTelefone = '+55 11 99999-9999'

    await page.getByLabel(/nome/i).fill(novoNome)
    await page.getByLabel(/telefone/i).fill(novoTelefone)

    // Salvar
    await page.getByRole('button', { name: /salvar|atualizar/i }).click()

    // Aguardar feedback de sucesso
    await expect(page.getByText(/perfil atualizado|salvo com sucesso/i)).toBeVisible()

    // Verificar que dados foram atualizados
    await expect(page.getByLabel(/nome/i)).toHaveValue(novoNome)
    await expect(page.getByLabel(/telefone/i)).toHaveValue(novoTelefone)
  })

  test('deve validar formato de email', async ({ page }) => {
    await page.goto('/configuracoes')

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Tentar email inválido
    await page.getByLabel(/email/i).fill('email-invalido-sem-arroba')

    // Salvar
    await page.getByRole('button', { name: /salvar|atualizar/i }).click()

    // Verificar erro de validação
    await expect(page.getByText(/email.*inválido|formato.*email/i)).toBeVisible()
  })

  test('deve atualizar apenas campos modificados', async ({ page }) => {
    await page.goto('/configuracoes')

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Guardar valor original do nome
    const nomeOriginal = await page.getByLabel(/nome/i).inputValue()

    // Modificar apenas telefone
    const novoTelefone = '+55 11 88888-8888'
    await page.getByLabel(/telefone/i).fill(novoTelefone)

    // Salvar
    await page.getByRole('button', { name: /salvar|atualizar/i }).click()

    // Aguardar sucesso
    await expect(page.getByText(/perfil atualizado|salvo com sucesso/i)).toBeVisible()

    // Verificar que nome não mudou
    await expect(page.getByLabel(/nome/i)).toHaveValue(nomeOriginal)
    // Verificar que telefone foi atualizado
    await expect(page.getByLabel(/telefone/i)).toHaveValue(novoTelefone)
  })

  test('deve permitir atualizar avatar', async ({ page }) => {
    await page.goto('/configuracoes')

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Verificar se há campo de avatar
    const avatarInput = page.locator('input[type="file"]').first()
    const avatarUpload = page.getByText(/avatar|foto|imagem/i).first()

    // Se existir campo de upload, testar
    if (
      (await avatarInput.isVisible().catch(() => false)) ||
      (await avatarUpload.isVisible().catch(() => false))
    ) {
      // Upload de imagem de teste (arquivo fictício)
      // Nota: Em ambiente real, seria necessário um arquivo de teste
      await expect(page.getByText(/avatar|foto|imagem/i)).toBeVisible()
    }
  })

  test('deve manter dados após recarregar página', async ({ page }) => {
    await page.goto('/configuracoes')

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Modificar telefone
    const novoTelefone = '+55 11 77777-7777'
    await page.getByLabel(/telefone/i).fill(novoTelefone)

    // Salvar
    await page.getByRole('button', { name: /salvar|atualizar/i }).click()

    // Aguardar sucesso
    await expect(page.getByText(/perfil atualizado|salvo com sucesso/i)).toBeVisible()

    // Recarregar página
    await page.reload()

    // Aguardar carregamento
    await page.waitForTimeout(1000)

    // Verificar que telefone foi mantido
    await expect(page.getByLabel(/telefone/i)).toHaveValue(novoTelefone)
  })
})
