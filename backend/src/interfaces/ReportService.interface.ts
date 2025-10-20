// Referência: design.md §Reporting, dev-stories.md Dev Story 4.2, user-stories.md Story 6.1
// Atende tasks.md Task 10.1 - Sistema de Relatórios PDF/Excel

import type { ReportType } from '@prisma/client'

/**
 * Formato do relatório gerado
 */
export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

/**
 * Status de geração do relatório
 */
export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  READY = 'ready',
  ERROR = 'error',
  EXPIRED = 'expired',
}

/**
 * Filtros para geração de relatório
 */
export interface ReportFilters {
  startDate: Date
  endDate: Date
  clientIds?: string[]
  tagIds?: string[]
  status?: string[]
  includeCharts?: boolean
  includeLogo?: boolean
  customFields?: string[]
}

/**
 * Opções para geração de PDF/Excel
 */
export interface ReportOptions {
  title: string
  startDate: Date
  endDate: Date
  includeLogo?: boolean
  includeCharts?: boolean
  sheets?: string[]
}

/**
 * Dados para geração de relatório de vendas
 */
export interface SalesReportData {
  totalSales: number
  totalRevenue: number
  averageTicket: number
  totalClients: number
  totalOrders: number
  conversionRate: number
  salesByStatus: Array<{
    status: string
    count: number
    revenue: number
  }>
  salesByDay: Array<{
    date: string
    count: number
    revenue: number
  }>
  topClients: Array<{
    id: string
    name: string
    totalSpent: number
    orderCount: number
  }>
  sales: Array<{
    id: string
    clientName: string
    totalPrice: number
    status: string
    createdAt: Date
    paidAt: Date | null
  }>
}

/**
 * Dados para geração de relatório financeiro
 */
export interface FinancialReportData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  roi: number
  revenueByMonth: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  expensesByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  projections: {
    nextMonth: {
      pessimistic: number
      realistic: number
      optimistic: number
    }
  }
}

/**
 * Dados para geração de relatório de anúncios
 */
export interface AdsReportData {
  totalSpent: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  averageCPC: number
  averageCPM: number
  averageCTR: number
  averageROAS: number
  campaignsByPlatform: Array<{
    platform: string
    spent: number
    impressions: number
    clicks: number
    conversions: number
  }>
  topCampaigns: Array<{
    id: string
    name: string
    spent: number
    roas: number
    conversions: number
  }>
}

/**
 * Dados para geração de relatório de clientes
 */
export interface ClientsReportData {
  totalClients: number
  activeClients: number
  newClients: number
  churned: number
  averageLTV: number
  clientsByStatus: Array<{
    status: string
    count: number
  }>
  clientsByTag: Array<{
    tag: string
    count: number
  }>
  topClients: Array<{
    id: string
    name: string
    totalSpent: number
    orderCount: number
    lastPurchase: Date
  }>
}

/**
 * DTO para criação de relatório
 */
export interface CreateReportDTO {
  type: ReportType
  title: string
  format: ReportFormat
  filters: ReportFilters
  sendEmail?: boolean
  emailRecipients?: string[]
}

/**
 * DTO para atualização de relatório
 */
export interface UpdateReportDTO {
  title?: string
  status?: ReportStatus
  file_url?: string
  error_message?: string
}

/**
 * Relatório com status e metadados
 */
export interface ReportWithStatus {
  id: string
  user_id: string
  type: ReportType
  title: string
  format: ReportFormat
  status: ReportStatus
  file_url: string | null
  error_message: string | null
  filters: ReportFilters
  created_at: Date
  expires_at: Date | null
  progress?: number // 0-100
}

/**
 * Parâmetros para listagem de relatórios
 */
export interface ListReportsParams {
  page?: number
  limit?: number
  type?: ReportType
  status?: ReportStatus
  format?: ReportFormat
  startDate?: Date
  endDate?: Date
}

/**
 * Resultado de listagem de relatórios
 */
export interface ListReportsResult {
  reports: ReportWithStatus[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Estatísticas de relatórios
 */
export interface ReportStatistics {
  totalReports: number
  reportsByType: Array<{
    type: ReportType
    count: number
  }>
  reportsByFormat: Array<{
    format: ReportFormat
    count: number
  }>
  reportsByStatus: Array<{
    status: ReportStatus
    count: number
  }>
  averageGenerationTime: number // em segundos
  lastGenerated: Date | null
}

/**
 * Interface do serviço de relatórios
 */
export interface IReportService {
  /**
   * Gera um novo relatório (assíncrono via Bull queue)
   */
  generateReport(userId: string, data: CreateReportDTO): Promise<ReportWithStatus>

  /**
   * Obtém status de um relatório
   */
  getReportStatus(reportId: string, userId: string): Promise<ReportWithStatus>

  /**
   * Obtém um relatório por ID
   */
  getReportById(reportId: string, userId: string): Promise<ReportWithStatus>

  /**
   * Lista relatórios do usuário
   */
  listReports(userId: string, params: ListReportsParams): Promise<ListReportsResult>

  /**
   * Obtém URL de download do relatório
   */
  getDownloadUrl(reportId: string, userId: string): Promise<string>

  /**
   * Exclui um relatório
   */
  deleteReport(reportId: string, userId: string): Promise<void>

  /**
   * Coleta dados para relatório de vendas
   */
  collectSalesData(userId: string, filters: ReportFilters): Promise<SalesReportData>

  /**
   * Coleta dados para relatório financeiro
   */
  collectFinancialData(userId: string, filters: ReportFilters): Promise<FinancialReportData>

  /**
   * Coleta dados para relatório de anúncios
   */
  collectAdsData(userId: string, filters: ReportFilters): Promise<AdsReportData>

  /**
   * Coleta dados para relatório de clientes
   */
  collectClientsData(userId: string, filters: ReportFilters): Promise<ClientsReportData>

  /**
   * Gera PDF a partir dos dados
   */
  generatePDF(
    data: SalesReportData | FinancialReportData | AdsReportData | ClientsReportData,
    options: { title: string; includeLogo?: boolean }
  ): Promise<Buffer>

  /**
   * Gera Excel a partir dos dados
   */
  generateExcel(
    data: SalesReportData | FinancialReportData | AdsReportData | ClientsReportData,
    options: { title: string; sheets?: string[] }
  ): Promise<Buffer>

  /**
   * Faz upload do arquivo para S3/R2
   */
  uploadFile(buffer: Buffer, filename: string): Promise<string>

  /**
   * Limpa relatórios expirados (>30 dias)
   */
  cleanupExpiredReports(): Promise<number>

  /**
   * Obtém estatísticas de relatórios
   */
  getStatistics(userId: string): Promise<ReportStatistics>
}
