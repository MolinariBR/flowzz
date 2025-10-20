// Referência: dev-stories.md Dev Story 4.2 - Geração PDF com Puppeteer
// Atende tasks.md Task 10.1.1 - Implementar generatePDF() com Puppeteer

import puppeteer from 'puppeteer'
import type {
  AdsReportData,
  ClientsReportData,
  FinancialReportData,
  SalesReportData,
} from '../../interfaces/ReportService.interface'
import { logger } from '../../shared/utils/logger'
import { generateSalesReportTemplate } from './templates'

/**
 * PDFGenerator - Gera PDFs usando Puppeteer
 *
 * Features:
 * - Gera PDF a partir de HTML
 * - Usa templates com Tailwind CSS
 * - Suporte a logos customizadas
 * - Formato A4
 *
 * Referência: user-stories.md Story 6.1 - "formato PDF"
 */
export class PDFGenerator {
  /**
   * Gera PDF para relatório de vendas
   */
  async generateSalesReportPDF(
    data: SalesReportData,
    options: { title: string; includeLogo?: boolean }
  ): Promise<Buffer> {
    const html = generateSalesReportTemplate(data, options)
    return this.generatePDFFromHTML(html)
  }

  /**
   * Gera PDF para relatório financeiro
   */
  async generateFinancialReportPDF(
    data: FinancialReportData,
    options: { title: string; includeLogo?: boolean }
  ): Promise<Buffer> {
    // Template simplificado inline por agora
    const html = this.generateFinancialTemplate(data, options)
    return this.generatePDFFromHTML(html)
  }

  /**
   * Gera PDF para relatório de anúncios
   */
  async generateAdsReportPDF(
    data: AdsReportData,
    options: { title: string; includeLogo?: boolean }
  ): Promise<Buffer> {
    const html = this.generateAdsTemplate(data, options)
    return this.generatePDFFromHTML(html)
  }

  /**
   * Gera PDF para relatório de clientes
   */
  async generateClientsReportPDF(
    data: ClientsReportData,
    options: { title: string; includeLogo?: boolean }
  ): Promise<Buffer> {
    const html = this.generateClientsTemplate(data, options)
    return this.generatePDFFromHTML(html)
  }

  /**
   * Gera PDF a partir de HTML usando Puppeteer
   * Referência: dev-stories.md Dev Story 4.2 - Exemplo de código
   */
  private async generatePDFFromHTML(html: string): Promise<Buffer> {
    let browser

    try {
      logger.info('Starting PDF generation with Puppeteer')

      // Lançar navegador em modo headless
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })

      const page = await browser.newPage()

      // Setar conteúdo HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0', // Esperar até carregar todos os recursos
      })

      // Gerar PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
      })

      logger.info('PDF generated successfully', {
        size: pdfBuffer.length,
      })

      // Converter Uint8Array para Buffer se necessário
      return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer)
    } catch (error) {
      logger.error('Error generating PDF', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new Error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  // ==================== TEMPLATES INLINE SIMPLIFICADOS ====================

  private generateFinancialTemplate(
    data: FinancialReportData,
    options: { title: string; includeLogo?: boolean }
  ): string {
    const { title, includeLogo } = options
    const logoSection = includeLogo
      ? '<div class="text-center mb-8"><h1 class="text-4xl font-bold text-blue-600">Flowzz</h1></div>'
      : ''

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white p-8">
  ${logoSection}
  <h1 class="text-3xl font-bold mb-6">${title}</h1>
  
  <div class="grid grid-cols-3 gap-4 mb-8">
    <div class="bg-green-50 p-4 rounded">
      <p class="text-sm text-gray-600">Receita Total</p>
      <p class="text-2xl font-bold text-green-600">R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
    <div class="bg-red-50 p-4 rounded">
      <p class="text-sm text-gray-600">Despesas Totais</p>
      <p class="text-2xl font-bold text-red-600">R$ ${data.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
    <div class="bg-blue-50 p-4 rounded">
      <p class="text-sm text-gray-600">Lucro Líquido</p>
      <p class="text-2xl font-bold text-blue-600">R$ ${data.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
  </div>

  <div class="mb-6">
    <p><strong>Margem de Lucro:</strong> ${data.profitMargin.toFixed(2)}%</p>
    <p><strong>ROI:</strong> ${data.roi.toFixed(2)}%</p>
  </div>

  <footer class="mt-12 pt-4 border-t text-center text-sm text-gray-500">
    <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </footer>
</body>
</html>
    `
  }

  private generateAdsTemplate(
    data: AdsReportData,
    options: { title: string; includeLogo?: boolean }
  ): string {
    const { title, includeLogo } = options
    const logoSection = includeLogo
      ? '<div class="text-center mb-8"><h1 class="text-4xl font-bold text-blue-600">Flowzz</h1></div>'
      : ''

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white p-8">
  ${logoSection}
  <h1 class="text-3xl font-bold mb-6">${title}</h1>
  
  <div class="grid grid-cols-4 gap-4 mb-8">
    <div class="bg-purple-50 p-4 rounded">
      <p class="text-sm text-gray-600">Gasto Total</p>
      <p class="text-xl font-bold text-purple-600">R$ ${data.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
    <div class="bg-blue-50 p-4 rounded">
      <p class="text-sm text-gray-600">Impressões</p>
      <p class="text-xl font-bold text-blue-600">${data.totalImpressions.toLocaleString('pt-BR')}</p>
    </div>
    <div class="bg-green-50 p-4 rounded">
      <p class="text-sm text-gray-600">Cliques</p>
      <p class="text-xl font-bold text-green-600">${data.totalClicks.toLocaleString('pt-BR')}</p>
    </div>
    <div class="bg-orange-50 p-4 rounded">
      <p class="text-sm text-gray-600">CTR Médio</p>
      <p class="text-xl font-bold text-orange-600">${data.averageCTR.toFixed(2)}%</p>
    </div>
  </div>

  <h2 class="text-xl font-bold mb-4">Top Campanhas</h2>
  <table class="w-full border-collapse mb-8">
    <thead>
      <tr class="bg-gray-100">
        <th class="border px-4 py-2 text-left">Campanha</th>
        <th class="border px-4 py-2 text-right">Gasto</th>
        <th class="border px-4 py-2 text-right">Conversões</th>
      </tr>
    </thead>
    <tbody>
      ${data.topCampaigns
        .slice(0, 10)
        .map(
          (campaign) => `
        <tr>
          <td class="border px-4 py-2">${campaign.name}</td>
          <td class="border px-4 py-2 text-right">R$ ${campaign.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="border px-4 py-2 text-right">${campaign.conversions}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <footer class="mt-12 pt-4 border-t text-center text-sm text-gray-500">
    <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </footer>
</body>
</html>
    `
  }

  private generateClientsTemplate(
    data: ClientsReportData,
    options: { title: string; includeLogo?: boolean }
  ): string {
    const { title, includeLogo } = options
    const logoSection = includeLogo
      ? '<div class="text-center mb-8"><h1 class="text-4xl font-bold text-blue-600">Flowzz</h1></div>'
      : ''

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white p-8">
  ${logoSection}
  <h1 class="text-3xl font-bold mb-6">${title}</h1>
  
  <div class="grid grid-cols-3 gap-4 mb-8">
    <div class="bg-blue-50 p-4 rounded">
      <p class="text-sm text-gray-600">Total de Clientes</p>
      <p class="text-2xl font-bold text-blue-600">${data.totalClients}</p>
    </div>
    <div class="bg-green-50 p-4 rounded">
      <p class="text-sm text-gray-600">Clientes Ativos</p>
      <p class="text-2xl font-bold text-green-600">${data.activeClients}</p>
    </div>
    <div class="bg-purple-50 p-4 rounded">
      <p class="text-sm text-gray-600">LTV Médio</p>
      <p class="text-2xl font-bold text-purple-600">R$ ${data.averageLTV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
  </div>

  <h2 class="text-xl font-bold mb-4">Top 10 Clientes</h2>
  <table class="w-full border-collapse">
    <thead>
      <tr class="bg-gray-100">
        <th class="border px-4 py-2 text-left">Cliente</th>
        <th class="border px-4 py-2 text-right">Pedidos</th>
        <th class="border px-4 py-2 text-right">Total Gasto</th>
      </tr>
    </thead>
    <tbody>
      ${data.topClients
        .map(
          (client) => `
        <tr>
          <td class="border px-4 py-2">${client.name}</td>
          <td class="border px-4 py-2 text-right">${client.orderCount}</td>
          <td class="border px-4 py-2 text-right">R$ ${client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <footer class="mt-12 pt-4 border-t text-center text-sm text-gray-500">
    <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </footer>
</body>
</html>
    `
  }
}
