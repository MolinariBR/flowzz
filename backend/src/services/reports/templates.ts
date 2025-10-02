// Referência: dev-stories.md Dev Story 4.2 - Geração PDF com Puppeteer
// Atende tasks.md Task 10.1.1 - Templates HTML para relatórios

import type { SalesReportData } from '../../interfaces/ReportService.interface';

/**
 * Gera template HTML para relatório de vendas
 * Usa Tailwind CSS inline para formatação
 */
export function generateSalesReportTemplate(data: SalesReportData, options: { title: string; includeLogo?: boolean }): string {
  const { title, includeLogo } = options;
  
  const logoSection = includeLogo
    ? `
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-600">Flowzz</h1>
        <p class="text-gray-500">Gestão Financeira para Afiliados</p>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4;
      margin: 1cm;
    }
    body {
      font-family: 'Inter', sans-serif;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body class="bg-white p-8">
  ${logoSection}
  
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">${title}</h1>
    <p class="text-gray-600">Período: ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>

  <!-- Resumo Geral -->
  <div class="grid grid-cols-4 gap-4 mb-8">
    <div class="bg-blue-50 p-4 rounded-lg">
      <p class="text-sm text-gray-600">Total de Vendas</p>
      <p class="text-2xl font-bold text-blue-600">${data.totalSales}</p>
    </div>
    <div class="bg-green-50 p-4 rounded-lg">
      <p class="text-sm text-gray-600">Receita Total</p>
      <p class="text-2xl font-bold text-green-600">R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
    <div class="bg-purple-50 p-4 rounded-lg">
      <p class="text-sm text-gray-600">Ticket Médio</p>
      <p class="text-2xl font-bold text-purple-600">R$ ${data.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
    <div class="bg-orange-50 p-4 rounded-lg">
      <p class="text-sm text-gray-600">Total de Clientes</p>
      <p class="text-2xl font-bold text-orange-600">${data.totalClients}</p>
    </div>
  </div>

  <!-- Vendas por Status -->
  <div class="mb-8">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Vendas por Status</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left">Status</th>
          <th class="border border-gray-300 px-4 py-2 text-right">Quantidade</th>
          <th class="border border-gray-300 px-4 py-2 text-right">Receita</th>
        </tr>
      </thead>
      <tbody>
        ${data.salesByStatus.map(item => `
          <tr>
            <td class="border border-gray-300 px-4 py-2">${item.status}</td>
            <td class="border border-gray-300 px-4 py-2 text-right">${item.count}</td>
            <td class="border border-gray-300 px-4 py-2 text-right">R$ ${item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Top Clientes -->
  <div class="mb-8 page-break">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Top 10 Clientes</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left">Cliente</th>
          <th class="border border-gray-300 px-4 py-2 text-right">Pedidos</th>
          <th class="border border-gray-300 px-4 py-2 text-right">Total Gasto</th>
        </tr>
      </thead>
      <tbody>
        ${data.topClients.map(client => `
          <tr>
            <td class="border border-gray-300 px-4 py-2">${client.name}</td>
            <td class="border border-gray-300 px-4 py-2 text-right">${client.orderCount}</td>
            <td class="border border-gray-300 px-4 py-2 text-right">R$ ${client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Detalhamento de Vendas (primeiras 50) -->
  <div class="mb-8">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Detalhamento de Vendas</h2>
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-2 py-1 text-left">Data</th>
          <th class="border border-gray-300 px-2 py-1 text-left">Cliente</th>
          <th class="border border-gray-300 px-2 py-1 text-left">Status</th>
          <th class="border border-gray-300 px-2 py-1 text-right">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${data.sales.slice(0, 50).map(sale => `
          <tr>
            <td class="border border-gray-300 px-2 py-1">${new Date(sale.createdAt).toLocaleDateString('pt-BR')}</td>
            <td class="border border-gray-300 px-2 py-1">${sale.clientName}</td>
            <td class="border border-gray-300 px-2 py-1">${sale.status}</td>
            <td class="border border-gray-300 px-2 py-1 text-right">R$ ${sale.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${data.sales.length > 50 ? `<p class="mt-2 text-sm text-gray-500">* Mostrando primeiras 50 vendas de ${data.sales.length} total</p>` : ''}
  </div>

  <!-- Rodapé -->
  <div class="mt-12 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
    <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
    <p>Flowzz Platform - Gestão Financeira para Afiliados</p>
  </div>
</body>
</html>
  `;
}
