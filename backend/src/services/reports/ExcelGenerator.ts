/**
 * ExcelGenerator - Geração de relatórios em formato Excel (.xlsx)
 * 
 * Referências:
 * - design.md §Task 10.1.2: Excel com biblioteca XLSX
 * - dev-stories.md §Dev Story 4.2: Geração assíncrona de relatórios
 * - user-stories.md §Story 6.1: Relatórios em PDF/Excel
 * - tasks.md §Task 10.1.2: XLSX Generator
 * 
 * Features:
 * - Múltiplas sheets (vendas, resumo, gráficos)
 * - Formatação de células (moeda, percentual, datas)
 * - Headers com bold
 * - Auto-width nas colunas
 * - Totals row
 */

import * as XLSX from 'xlsx';
import { logger } from '../../shared/utils/logger';
import type {
  SalesReportData,
  FinancialReportData,
  AdsReportData,
  ClientsReportData,
  ReportOptions,
} from '../../interfaces/ReportService.interface';

export class ExcelGenerator {
  /**
   * Gera relatório de vendas em Excel
   * Sheets: Resumo, Vendas Detalhadas, Clientes Top
   */
  async generateSalesReportExcel(
    data: SalesReportData,
    options: ReportOptions,
  ): Promise<Buffer> {
    try {
      logger.info('Gerando relatório de vendas em Excel');

      const workbook = XLSX.utils.book_new();

      // Sheet 1: Resumo
      const resumoData = [
        ['RELATÓRIO DE VENDAS'],
        [`Período: ${this.formatDate(options.startDate)} a ${this.formatDate(options.endDate)}`],
        [],
        ['RESUMO EXECUTIVO'],
        ['Métrica', 'Valor'],
        ['Total de Vendas', data.totalSales],
        ['Receita Total', this.formatCurrency(data.totalRevenue)],
        ['Ticket Médio', this.formatCurrency(data.averageTicket)],
        ['Total de Clientes', data.totalClients],
        ['Taxa de Conversão', this.formatPercentage(data.conversionRate)],
        [],
        ['VENDAS POR STATUS'],
        ['Status', 'Quantidade', 'Valor Total'],
        ...data.salesByStatus.map((item: { status: string; count: number; revenue: number }) => [
          item.status,
          item.count,
          this.formatCurrency(item.revenue),
        ]),
      ];

      const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
      this.applyHeaderStyle(resumoSheet, ['A1', 'A4', 'A12']);
      this.setColumnWidths(resumoSheet, [30, 20, 20]);
      XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo');

      // Sheet 2: Vendas Detalhadas
      const vendasData = [
        ['VENDAS DETALHADAS'],
        [],
        ['Data', 'Cliente', 'Valor', 'Status', 'Data Pagamento'],
        ...data.sales.slice(0, 100).map((sale: { id: string; clientName: string; totalPrice: number; status: string; createdAt: Date; paidAt: Date | null }) => [
          this.formatDate(sale.createdAt),
          sale.clientName || 'N/A',
          this.formatCurrency(sale.totalPrice),
          sale.status,
          sale.paidAt ? this.formatDate(sale.paidAt) : 'N/A',
        ]),
      ];

      const vendasSheet = XLSX.utils.aoa_to_sheet(vendasData);
      this.applyHeaderStyle(vendasSheet, ['A1', 'A3']);
      this.setColumnWidths(vendasSheet, [15, 30, 15, 15, 20]);
      XLSX.utils.book_append_sheet(workbook, vendasSheet, 'Vendas Detalhadas');

      // Sheet 3: Top Clientes
      const clientesData = [
        ['TOP 10 CLIENTES'],
        [],
        ['Posição', 'Cliente', 'Total de Compras', 'Valor Total'],
        ...data.topClients.slice(0, 10).map((client: { id: string; name: string; totalSpent: number; orderCount: number }, index: number) => [
          index + 1,
          client.name,
          client.orderCount,
          this.formatCurrency(client.totalSpent),
        ]),
      ];

      const clientesSheet = XLSX.utils.aoa_to_sheet(clientesData);
      this.applyHeaderStyle(clientesSheet, ['A1', 'A3']);
      this.setColumnWidths(clientesSheet, [12, 30, 20, 18]);
      XLSX.utils.book_append_sheet(workbook, clientesSheet, 'Top Clientes');

      // Converter workbook para buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      logger.info('Relatório de vendas Excel gerado com sucesso');

      return buffer as Buffer;
    } catch (error) {
      logger.error('Erro ao gerar relatório de vendas Excel:', error);
      throw new Error(`Falha ao gerar relatório Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera relatório financeiro em Excel
   * Sheets: Resumo Financeiro, Receitas, Despesas, Projeções
   */
  async generateFinancialReportExcel(
    data: FinancialReportData,
    options: ReportOptions,
  ): Promise<Buffer> {
    try {
      logger.info('Gerando relatório financeiro em Excel');

      const workbook = XLSX.utils.book_new();

      // Sheet 1: Resumo Financeiro
      const resumoData = [
        ['RELATÓRIO FINANCEIRO'],
        [`Período: ${this.formatDate(options.startDate)} a ${this.formatDate(options.endDate)}`],
        [],
        ['INDICADORES PRINCIPAIS'],
        ['Métrica', 'Valor'],
        ['Receita Total', this.formatCurrency(data.totalRevenue)],
        ['Despesas Totais', this.formatCurrency(data.totalExpenses)],
        ['Lucro Líquido', this.formatCurrency(data.netProfit)],
        ['Margem de Lucro', this.formatPercentage(data.profitMargin)],
        ['ROI', this.formatPercentage(data.roi)],
      ];

      const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
      this.applyHeaderStyle(resumoSheet, ['A1', 'A4']);
      this.setColumnWidths(resumoSheet, [30, 20]);
      XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo Financeiro');

      // Sheet 2: Receitas por Mês
      const receitasData = [
        ['RECEITAS POR MÊS'],
        [],
        ['Mês', 'Receita', 'Despesas', 'Lucro'],
        ...data.revenueByMonth.map((item: { month: string; revenue: number; expenses: number; profit: number }) => [
          item.month,
          this.formatCurrency(item.revenue),
          this.formatCurrency(item.expenses),
          this.formatCurrency(item.profit),
        ]),
        [],
        ['TOTAL', this.formatCurrency(data.totalRevenue), this.formatCurrency(data.totalExpenses), this.formatCurrency(data.netProfit)],
      ];

      const receitasSheet = XLSX.utils.aoa_to_sheet(receitasData);
      this.applyHeaderStyle(receitasSheet, ['A1', 'A3']);
      this.setColumnWidths(receitasSheet, [20, 18, 18, 18]);
      XLSX.utils.book_append_sheet(workbook, receitasSheet, 'Receitas');

      // Sheet 3: Projeções
      const projecoesData = [
        ['PROJEÇÕES FINANCEIRAS - PRÓXIMO MÊS'],
        [],
        ['Cenário', 'Projeção'],
        ['Pessimista', this.formatCurrency(data.projections.nextMonth.pessimistic)],
        ['Realista', this.formatCurrency(data.projections.nextMonth.realistic)],
        ['Otimista', this.formatCurrency(data.projections.nextMonth.optimistic)],
      ];

      const projecoesSheet = XLSX.utils.aoa_to_sheet(projecoesData);
      this.applyHeaderStyle(projecoesSheet, ['A1', 'A3']);
      this.setColumnWidths(projecoesSheet, [20, 20]);
      XLSX.utils.book_append_sheet(workbook, projecoesSheet, 'Projeções');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      logger.info('Relatório financeiro Excel gerado com sucesso');

      return buffer as Buffer;
    } catch (error) {
      logger.error('Erro ao gerar relatório financeiro Excel:', error);
      throw new Error(`Falha ao gerar relatório Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera relatório de anúncios em Excel
   * Sheets: Resumo Campanhas, Por Plataforma, Top Campanhas
   */
  async generateAdsReportExcel(
    data: AdsReportData,
    options: ReportOptions,
  ): Promise<Buffer> {
    try {
      logger.info('Gerando relatório de anúncios em Excel');

      const workbook = XLSX.utils.book_new();

      // Sheet 1: Resumo de Campanhas
      const resumoData = [
        ['RELATÓRIO DE ANÚNCIOS'],
        [`Período: ${this.formatDate(options.startDate)} a ${this.formatDate(options.endDate)}`],
        [],
        ['MÉTRICAS GERAIS'],
        ['Métrica', 'Valor'],
        ['Total Investido', this.formatCurrency(data.totalSpent)],
        ['Impressões', data.totalImpressions.toLocaleString('pt-BR')],
        ['Cliques', data.totalClicks.toLocaleString('pt-BR')],
        ['CTR Médio', this.formatPercentage(data.averageCTR)],
        ['CPC Médio', this.formatCurrency(data.averageCPC)],
        ['CPM Médio', this.formatCurrency(data.averageCPM)],
        ['Conversões', data.totalConversions.toLocaleString('pt-BR')],
        ['ROAS Médio', data.averageROAS.toFixed(2) + 'x'],
      ];

      const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
      this.applyHeaderStyle(resumoSheet, ['A1', 'A4']);
      this.setColumnWidths(resumoSheet, [30, 20]);
      XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo Campanhas');

      // Sheet 2: Campanhas por Plataforma
      const plataformasData = [
        ['CAMPANHAS POR PLATAFORMA'],
        [],
        ['Plataforma', 'Investimento', 'Impressões', 'Cliques', 'Conversões'],
        ...data.campaignsByPlatform.map((item: { platform: string; spent: number; impressions: number; clicks: number; conversions: number }) => [
          item.platform,
          this.formatCurrency(item.spent),
          item.impressions.toLocaleString('pt-BR'),
          item.clicks.toLocaleString('pt-BR'),
          item.conversions.toLocaleString('pt-BR'),
        ]),
      ];

      const plataformasSheet = XLSX.utils.aoa_to_sheet(plataformasData);
      this.applyHeaderStyle(plataformasSheet, ['A1', 'A3']);
      this.setColumnWidths(plataformasSheet, [20, 18, 18, 15, 15]);
      XLSX.utils.book_append_sheet(workbook, plataformasSheet, 'Por Plataforma');

      // Sheet 3: Top Campanhas
      const topCampanhasData = [
        ['TOP 10 CAMPANHAS'],
        [],
        ['Campanha', 'Investimento', 'Conversões', 'ROAS'],
        ...data.topCampaigns.slice(0, 10).map((campaign: { id: string; name: string; spent: number; roas: number; conversions: number }) => [
          campaign.name,
          this.formatCurrency(campaign.spent),
          campaign.conversions,
          campaign.roas.toFixed(2) + 'x',
        ]),
      ];

      const topCampanhasSheet = XLSX.utils.aoa_to_sheet(topCampanhasData);
      this.applyHeaderStyle(topCampanhasSheet, ['A1', 'A3']);
      this.setColumnWidths(topCampanhasSheet, [35, 18, 15, 12]);
      XLSX.utils.book_append_sheet(workbook, topCampanhasSheet, 'Top Campanhas');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      logger.info('Relatório de anúncios Excel gerado com sucesso');

      return buffer as Buffer;
    } catch (error) {
      logger.error('Erro ao gerar relatório de anúncios Excel:', error);
      throw new Error(`Falha ao gerar relatório Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera relatório de clientes em Excel
   * Sheets: Resumo, Clientes Ativos, Top Clientes
   */
  async generateClientsReportExcel(
    data: ClientsReportData,
    options: ReportOptions,
  ): Promise<Buffer> {
    try {
      logger.info('Gerando relatório de clientes em Excel');

      const workbook = XLSX.utils.book_new();

      // Sheet 1: Resumo de Clientes
      const resumoData = [
        ['RELATÓRIO DE CLIENTES'],
        [`Período: ${this.formatDate(options.startDate)} a ${this.formatDate(options.endDate)}`],
        [],
        ['INDICADORES DE CLIENTES'],
        ['Métrica', 'Valor'],
        ['Total de Clientes', data.totalClients],
        ['Clientes Ativos', data.activeClients],
        ['Novos Clientes', data.newClients],
        ['Clientes Perdidos', data.churned],
        ['LTV Médio', this.formatCurrency(data.averageLTV)],
        [],
        ['CLIENTES POR STATUS'],
        ['Status', 'Quantidade'],
        ...data.clientsByStatus.map((item) => [item.status, item.count]),
      ];

      const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
      this.applyHeaderStyle(resumoSheet, ['A1', 'A4', 'A12']);
      this.setColumnWidths(resumoSheet, [30, 20]);
      XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo');

      // Sheet 2: Top Clientes
      const topClientesData = [
        ['TOP 20 CLIENTES'],
        [],
        ['Posição', 'Nome', 'Total de Compras', 'Valor Total', 'Última Compra'],
        ...data.topClients.slice(0, 20).map((client: { id: string; name: string; totalSpent: number; orderCount: number; lastPurchase: Date }, index: number) => [
          index + 1,
          client.name,
          client.orderCount,
          this.formatCurrency(client.totalSpent),
          this.formatDate(client.lastPurchase),
        ]),
      ];

      const topClientesSheet = XLSX.utils.aoa_to_sheet(topClientesData);
      this.applyHeaderStyle(topClientesSheet, ['A1', 'A3']);
      this.setColumnWidths(topClientesSheet, [12, 30, 18, 18, 18]);
      XLSX.utils.book_append_sheet(workbook, topClientesSheet, 'Top Clientes');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      logger.info('Relatório de clientes Excel gerado com sucesso');

      return buffer as Buffer;
    } catch (error) {
      logger.error('Erro ao gerar relatório de clientes Excel:', error);
      throw new Error(`Falha ao gerar relatório Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Formata valor como moeda brasileira
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Formata valor como percentual
   */
  private formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Formata data no padrão brasileiro
   */
  private formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }

  /**
   * Aplica estilo de negrito aos headers
   */
  private applyHeaderStyle(worksheet: XLSX.WorkSheet, headerCells: string[]): void {
    headerCells.forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
        };
      }
    });
  }

  /**
   * Define largura das colunas
   */
  private setColumnWidths(worksheet: XLSX.WorkSheet, widths: number[]): void {
    worksheet['!cols'] = widths.map((width) => ({ wch: width }));
  }
}
