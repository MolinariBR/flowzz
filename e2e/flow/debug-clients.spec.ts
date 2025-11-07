import { expect, test } from '@playwright/test'

test.describe('Debug - Clients Loading', () => {
  test('debug: verificar console logs ao carregar clientes', async ({ page }) => {
    const consoleLogs: string[] = []
    const networkErrors: string[] = []

    // Capturar todos os console.log e errors
    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`
      consoleLogs.push(text)
      console.log(text)
    })

    // Capturar erros de rede
    page.on('response', (response) => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`)
      }
    })

    // Ir para página de clientes
    await page.goto('/clientes')

    // Aguardar 3 segundos para carregamento
    await page.waitForTimeout(3000)

    // Ver o HTML da página para debug
    const bodyHTML = await page.locator('body').innerHTML()
    const hasContent =
      bodyHTML.includes('Cliente') || bodyHTML.includes('Novo') || bodyHTML.includes('Buscar')

    // Imprimir todos os logs
    console.log('\n=== CONSOLE LOGS CAPTURADOS ===')
    for (const log of consoleLogs) {
      console.log(log)
    }
    console.log('=== FIM DOS LOGS ===\n')

    // Verificar se a página carregou
    await expect(page.locator('body')).toBeVisible()

    // Procurar por sinais de carregamento de clientes
    const hasTable = await page.locator('table').isVisible()
    const hasEmptyState = await page.getByText(/nenhum cliente|adicione seu primeiro/i).isVisible()
    const hasHeader = await page.getByText(/Clientes/).isVisible()
    const hasButtons = await page.locator('button').count()

    console.log('\n=== PAGE STATE ===')
    console.log('Header visible:', hasHeader)
    console.log('Table visible:', hasTable)
    console.log('Empty state visible:', hasEmptyState)
    console.log('Buttons found:', hasButtons)
    console.log('Body has content:', hasContent)
    console.log('Body HTML length:', bodyHTML.length)
    console.log('=== FIM DO STATE ===\n')

    // Procurar por erros nos logs
    const errorLogs = consoleLogs.filter((log) => log.includes('[error]'))
    if (errorLogs.length > 0) {
      console.log('\n=== ERRORS FOUND ===')
      for (const log of errorLogs) {
        console.log(log)
      }
    }

    if (networkErrors.length > 0) {
      console.log('\n=== NETWORK ERRORS ===')
      for (const error of networkErrors) {
        console.log(error)
      }
    }

    expect(hasTable || hasEmptyState || hasHeader).toBeTruthy()
  })
})
