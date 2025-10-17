// Referência: design.md §Reporting, dev-stories.md Dev Story 4.2, user-stories.md Story 6.1
// Atende tasks.md Task 10.1 - ReportService com geração assíncrona

import { PrismaClient } from '@prisma/client';
import type { ReportType } from '@prisma/client';
import type {
  AdsReportData,
  ClientsReportData,
  CreateReportDTO,
  FinancialReportData,
  IReportService,
  ListReportsParams,
  ListReportsResult,
  ReportFilters,
  ReportOptions,
  ReportStatistics,
  ReportWithStatus,
  SalesReportData,
} from '../interfaces/ReportService.interface';
import { ReportFormat, ReportStatus } from '../interfaces/ReportService.interface';
import { logger } from '../shared/utils/logger';
import { reportQueue } from '../queues/queues';
import { PDFGenerator } from './reports/PDFGenerator';
import { ExcelGenerator } from './reports/ExcelGenerator';
import { StorageService } from './StorageService';
import { redisService } from '../shared/services/RedisService';

/**
 * ReportService - Serviço de geração e gerenciamento de relatórios
 *
 * Funcionalidades:
 * - Coleta de dados para relatórios (vendas, financeiro, anúncios, clientes)
 * - Geração assíncrona via Bull queue
 * - CRUD completo de relatórios
 * - Estatísticas de uso
 *
 * Padrão: Clean Architecture + Repository Pattern
 */
export class ReportService implements IReportService {
  private prisma: PrismaClient;
  private pdfGenerator: PDFGenerator;
  private excelGenerator: ExcelGenerator;
  private storageService: StorageService;

  constructor() {
    this.prisma = new PrismaClient();
    this.pdfGenerator = new PDFGenerator();
    this.excelGenerator = new ExcelGenerator();
    this.storageService = new StorageService();
  }

  /**
   * Gera um novo relatório (enfileira na Bull queue)
   * Referência: user-stories.md Story 6.1 - Cenário "Gerar relatório padrão"
   */
  async generateReport(userId: string, data: CreateReportDTO): Promise<ReportWithStatus> {
    try {
      // 1. Criar registro do relatório com status PENDING
      const report = await this.prisma.report.create({
        data: {
          user_id: userId,
          type: data.type,
          title: data.title,
          filters: JSON.parse(JSON.stringify(data.filters)),
          data: {}, // Será preenchido pelo worker
          file_url: null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        },
      });

      // 2. Enfileirar job na reportQueue
      await reportQueue.add(
        'generate-report',
        {
          reportId: report.id,
          userId,
          type: data.type,
          title: data.title,
          format: data.format,
          filters: data.filters,
          sendEmail: data.sendEmail,
          emailRecipients: data.emailRecipients,
        },
        {
          attempts: 3,
          timeout: 5 * 60 * 1000, // 5 minutos
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      logger.info('Report generation queued', {
        reportId: report.id,
        userId,
        type: data.type,
        format: data.format,
      });

      return this.mapToReportWithStatus(report, ReportStatus.PENDING, data.format);
    } catch (error) {
      logger.error('Error generating report', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        type: data.type,
      });
      throw error;
    }
  }

  /**
   * Obtém status de um relatório
   */
  async getReportStatus(reportId: string, userId: string): Promise<ReportWithStatus> {
    const report = await this.prisma.report.findFirst({
      where: {
        id: reportId,
        user_id: userId,
      },
    });

    if (!report) {
      throw new Error('Relatório não encontrado');
    }

    // Determinar status baseado nos campos
    let status: ReportStatus;
    if (report.file_url) {
      status = ReportStatus.READY;
    } else if (this.isExpired(report.expires_at)) {
      status = ReportStatus.EXPIRED;
    } else {
      status = ReportStatus.GENERATING;
    }

    return this.mapToReportWithStatus(report, status, ReportFormat.PDF);
  }

  /**
   * Obtém um relatório por ID
   */
  async getReportById(reportId: string, userId: string): Promise<ReportWithStatus> {
    return this.getReportStatus(reportId, userId);
  }

  /**
   * Lista relatórios do usuário com paginação
   * Referência: user-stories.md Story 6.1 - "Histórico de relatórios gerados"
   */
  async listReports(userId: string, params: ListReportsParams): Promise<ListReportsResult> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      user_id: userId,
    };

    if (params.type) {
      where.type = params.type;
    }

    if (params.startDate || params.endDate) {
      where.created_at = {};
      if (params.startDate) {
        where.created_at.gte = params.startDate;
      }
      if (params.endDate) {
        where.created_at.lte = params.endDate;
      }
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    const reportsWithStatus = reports.map((report) => {
      let status: ReportStatus;
      if (report.file_url) {
        status = ReportStatus.READY;
      } else if (this.isExpired(report.expires_at)) {
        status = ReportStatus.EXPIRED;
      } else {
        status = ReportStatus.GENERATING;
      }

      return this.mapToReportWithStatus(report, status, ReportFormat.PDF);
    });

    return {
      reports: reportsWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtém URL de download do relatório
   */
  async getDownloadUrl(reportId: string, userId: string): Promise<string> {
    const report = await this.prisma.report.findFirst({
      where: {
        id: reportId,
        user_id: userId,
      },
    });

    if (!report) {
      throw new Error('Relatório não encontrado');
    }

    if (!report.file_url) {
      throw new Error('Relatório ainda não foi gerado');
    }

    if (this.isExpired(report.expires_at)) {
      throw new Error('Relatório expirado');
    }

    return report.file_url;
  }

  /**
   * Exclui um relatório
   */
  async deleteReport(reportId: string, userId: string): Promise<void> {
    const report = await this.prisma.report.findFirst({
      where: {
        id: reportId,
        user_id: userId,
      },
    });

    if (!report) {
      throw new Error('Relatório não encontrado');
    }

    await this.prisma.report.delete({
      where: {
        id: reportId,
      },
    });

    logger.info('Report deleted', { reportId, userId });
  }

  /**
   * Coleta dados para relatório de vendas
   * Referência: user-stories.md Story 6.1 - Dados do relatório
   */
  async collectSalesData(userId: string, filters: ReportFilters): Promise<SalesReportData> {
    // Criar chave de cache baseada nos filtros
    const cacheKey = `report:sales:${userId}:${JSON.stringify(filters)}`;

    // Verificar cache primeiro
    const cached = await redisService.get<SalesReportData>(cacheKey);
    if (cached) {
      logger.info('Cache hit for sales data', { userId, cacheKey });
      return cached;
    }

    logger.info('Cache miss for sales data, fetching from database', { userId, cacheKey });
    const where: {
      user_id: string;
      created_at: { gte: Date; lte: Date };
      client_id?: { in: string[] };
      status?: { in: string[] };
    } = {
      user_id: userId,
      created_at: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    };

    if (filters.clientIds && filters.clientIds.length > 0) {
      where.client_id = { in: filters.clientIds };
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    // Buscar vendas
    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calcular métricas
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_price), 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Clientes únicos
    const uniqueClients = new Set(sales.map((s) => s.client_id));
    const totalClients = uniqueClients.size;

    // Vendas por status
    const salesByStatus = Object.entries(
      sales.reduce((acc: Record<string, { count: number; revenue: number }>, sale) => {
        const status = sale.status;
        if (!acc[status]) {
          acc[status] = { count: 0, revenue: 0 };
        }
        acc[status].count++;
        acc[status].revenue += Number(sale.total_price);
        return acc;
      }, {}),
    ).map(([status, data]) => ({
      status,
      count: data.count,
      revenue: data.revenue,
    }));

    // Vendas por dia
    const salesByDay = this.groupSalesByDay(sales);

    // Top clientes
    const topClients = await this.getTopClients(userId, filters.startDate, filters.endDate);

    // Taxa de conversão (simplificada)
    const conversionRate = totalSales > 0 ? (sales.filter((s) => s.status === 'PAID' || s.status === 'DELIVERED').length / totalSales) * 100 : 0;

    const result = {
      totalSales,
      totalRevenue,
      averageTicket,
      totalClients,
      totalOrders: totalSales,
      conversionRate,
      salesByStatus,
      salesByDay,
      topClients,
      sales: sales.map((sale) => ({
        id: sale.id,
        clientName: (sale as any).client?.name || 'N/A',
        totalPrice: Number(sale.total_price),
        status: sale.status,
        createdAt: sale.created_at,
        paidAt: null, // Campo não existe no schema
      })),
    };

    // Armazenar no cache (TTL 10 minutos para dados de relatório)
    await redisService.set(cacheKey, result, 600);

    return result;
  }

  /**
   * Coleta dados para relatório financeiro
   */
  async collectFinancialData(userId: string, filters: ReportFilters): Promise<FinancialReportData> {
    // Criar chave de cache baseada nos filtros
    const cacheKey = `report:financial:${userId}:${JSON.stringify(filters)}`;

    // Verificar cache primeiro
    const cached = await redisService.get<FinancialReportData>(cacheKey);
    if (cached) {
      logger.info('Cache hit for financial data', { userId, cacheKey });
      return cached;
    }

    logger.info('Cache miss for financial data, fetching from database', { userId, cacheKey });
    // Buscar receitas (vendas pagas)
    const sales = await this.prisma.sale.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
        status: {
          in: ['PAID', 'DELIVERED'],
        },
      },
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_price), 0);

    // Buscar despesas (anúncios)
    const ads = await this.prisma.ad.findMany({
      where: {
        user_id: userId,
        date: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
    });

    const totalExpenses = ads.reduce((sum, ad) => sum + Number(ad.spend), 0);

    // Calcular métricas
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

    // Receita e despesas por mês (simplificado)
    const revenueByMonth = this.groupByMonth(sales, ads);

    // Despesas por categoria (simplificado - só temos ads)
    const expensesByCategory = [
      {
        category: 'Anúncios',
        amount: totalExpenses,
        percentage: 100,
      },
    ];

    // Projeções (placeholder - integrar com ProjectionService depois)
    const projections = {
      nextMonth: {
        pessimistic: totalRevenue * 0.8,
        realistic: totalRevenue,
        optimistic: totalRevenue * 1.2,
      },
    };

    const result = {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      roi,
      revenueByMonth,
      expensesByCategory,
      projections,
    };

    // Armazenar no cache (TTL 10 minutos para dados de relatório)
    await redisService.set(cacheKey, result, 600);

    return result;
  }

  /**
   * Coleta dados para relatório de anúncios
   */
  async collectAdsData(userId: string, filters: ReportFilters): Promise<AdsReportData> {
    const ads = await this.prisma.ad.findMany({
      where: {
        user_id: userId,
        date: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: {
        spend: 'desc',
      },
    });

    const totalSpent = ads.reduce((sum, ad) => sum + Number(ad.spend), 0);
    const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
    const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const totalConversions = 0; // Campo results não existe no schema

    const averageCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const averageCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // ROAS: precisaria das vendas relacionadas (simplificado)
    const averageROAS = 0;

    // Campanhas por plataforma
    const campaignsByPlatform = Object.entries(
      ads.reduce((acc: Record<string, { spent: number; impressions: number; clicks: number; conversions: number }>, ad) => {
        const platform = ad.campaign_name?.split(' ')[0] || 'Facebook';
        if (!acc[platform]) {
          acc[platform] = {
            spent: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
          };
        }
        acc[platform].spent += Number(ad.spend);
        acc[platform].impressions += ad.impressions || 0;
        acc[platform].clicks += ad.clicks || 0;
        acc[platform].conversions += 0; // Campo results não existe
        return acc;
      }, {}),
    ).map(([platform, data]) => ({
      platform,
      ...data,
    }));

    // Top campanhas
    const topCampaigns = ads.slice(0, 10).map((ad) => ({
      id: ad.id,
      name: ad.campaign_name || 'N/A',
      spent: Number(ad.spend),
      roas: 0, // Simplificado
      conversions: 0, // Campo results não existe no schema
    }));

    return {
      totalSpent,
      totalImpressions,
      totalClicks,
      totalConversions,
      averageCPC,
      averageCPM,
      averageCTR,
      averageROAS,
      campaignsByPlatform,
      topCampaigns,
    };
  }

  /**
   * Coleta dados para relatório de clientes
   */
  async collectClientsData(userId: string, filters: ReportFilters): Promise<ClientsReportData> {
    const where: {
      user_id: string;
      tags?: { some: { tag_id: { in: string[] } } };
    } = {
      user_id: userId,
    };

    if (filters.tagIds && filters.tagIds.length > 0) {
      where.tags = {
        some: {
          tag_id: {
            in: filters.tagIds,
          },
        },
      };
    }

    const clients = await this.prisma.client.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        sales: {
          where: {
            created_at: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          },
        },
      },
    });

    const totalClients = clients.length;

    // Clientes com vendas no período
    const activeClients = clients.filter((c) => c.sales.length > 0).length;

    // Novos clientes (cadastrados no período)
    const newClients = clients.filter(
      (c) => c.created_at >= filters.startDate && c.created_at <= filters.endDate,
    ).length;

    // Churned (simplificado - sem vendas há mais de 90 dias)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const churned = clients.filter(
      (c) => c.sales.length > 0 && c.sales.every((s) => s.created_at < ninetyDaysAgo),
    ).length;

    // LTV médio
    const totalRevenue = clients.reduce(
      (sum, c) => sum + c.sales.reduce((s, sale) => s + Number(sale.total_price), 0),
      0,
    );
    const averageLTV = totalClients > 0 ? totalRevenue / totalClients : 0;

    // Clientes por status (baseado em sales)
    const clientsByStatus = [
      { status: 'Ativos', count: activeClients },
      { status: 'Inativos', count: totalClients - activeClients },
      { status: 'Churned', count: churned },
    ];

    // Clientes por tag
    const clientsByTag = Object.entries(
      clients.reduce((acc: Record<string, number>, client) => {
        client.tags.forEach((ct) => {
          const tagName = ct.tag.name;
          acc[tagName] = (acc[tagName] || 0) + 1;
        });
        return acc;
      }, {}),
    ).map(([tag, count]) => ({ tag, count }));

    // Top clientes
    const topClients = clients
      .map((client) => ({
        id: client.id,
        name: client.name,
        totalSpent: client.sales.reduce((sum, sale) => sum + Number(sale.total_price), 0),
        orderCount: client.sales.length,
        lastPurchase: client.sales.length > 0 && client.sales[0]
          ? client.sales.reduce((latest, sale) => (sale.created_at > latest ? sale.created_at : latest), client.sales[0].created_at)
          : client.created_at,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      totalClients,
      activeClients,
      newClients,
      churned,
      averageLTV,
      clientsByStatus,
      clientsByTag,
      topClients,
    };
  }

  /**
   * Gera PDF usando PDFGenerator
   * Referência: tasks.md Task 10.1.1 - Puppeteer PDF
   */
  async generatePDF(
    data: SalesReportData | FinancialReportData | AdsReportData | ClientsReportData,
    options: ReportOptions,
  ): Promise<Buffer> {
    try {
      // Determinar tipo de relatório baseado na estrutura dos dados
      if ('totalSales' in data) {
        return await this.pdfGenerator.generateSalesReportPDF(data, options);
      } else if ('totalRevenue' in data && 'totalExpenses' in data) {
        return await this.pdfGenerator.generateFinancialReportPDF(data, options);
      } else if ('totalSpent' in data && 'totalImpressions' in data) {
        return await this.pdfGenerator.generateAdsReportPDF(data, options);
      } else if ('totalClients' in data && 'activeClients' in data) {
        return await this.pdfGenerator.generateClientsReportPDF(data, options);
      }

      throw new Error('Tipo de relatório não identificado para geração de PDF');
    } catch (error) {
      logger.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  /**
   * Gera Excel usando ExcelGenerator
   * Referência: tasks.md Task 10.1.2 - XLSX Excel
   */
  async generateExcel(
    data: SalesReportData | FinancialReportData | AdsReportData | ClientsReportData,
    options: ReportOptions,
  ): Promise<Buffer> {
    try {
      // Determinar tipo de relatório baseado na estrutura dos dados
      if ('totalSales' in data) {
        return await this.excelGenerator.generateSalesReportExcel(data, options);
      } else if ('totalRevenue' in data && 'totalExpenses' in data) {
        return await this.excelGenerator.generateFinancialReportExcel(data, options);
      } else if ('totalSpent' in data && 'totalImpressions' in data) {
        return await this.excelGenerator.generateAdsReportExcel(data, options);
      } else if ('totalClients' in data && 'activeClients' in data) {
        return await this.excelGenerator.generateClientsReportExcel(data, options);
      }

      throw new Error('Tipo de relatório não identificado para geração de Excel');
    } catch (error) {
      logger.error('Erro ao gerar Excel:', error);
      throw error;
    }
  }

  /**
   * Faz upload do arquivo para S3/R2 e retorna signed URL
   * Referência: tasks.md Task 10.1.5 - Storage Service
   *
   * @param buffer - Buffer do arquivo gerado (PDF ou Excel)
   * @param filename - Nome do arquivo (ex: report-uuid.pdf)
   * @returns Signed URL válida por 7 dias para download
   */
  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    try {
      // Detectar content type baseado na extensão
      const contentType = filename.endsWith('.pdf')
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Upload para S3/R2
      const key = await this.storageService.uploadFile(buffer, filename, contentType);

      // Gerar signed URL válida por 7 dias (604800 segundos)
      const signedUrl = await this.storageService.getSignedUrl(key, 604800);

      logger.info('File uploaded and signed URL generated', {
        filename,
        key,
        size: buffer.length,
        expiresIn: '7 days',
      });

      return signedUrl;
    } catch (error) {
      logger.error('Error uploading file', {
        filename,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Limpa relatórios expirados (>30 dias)
   */
  async cleanupExpiredReports(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.report.deleteMany({
      where: {
        created_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    logger.info('Expired reports cleaned up', { count: result.count });
    return result.count;
  }

  /**
   * Obtém estatísticas de relatórios
   */
  async getStatistics(userId: string): Promise<ReportStatistics> {
    const reports = await this.prisma.report.findMany({
      where: {
        user_id: userId,
      },
    });

    const totalReports = reports.length;

    const reportsByType = Object.entries(
      reports.reduce((acc: Record<string, number>, report) => {
        acc[report.type] = (acc[report.type] || 0) + 1;
        return acc;
      }, {}),
    ).map(([type, count]) => ({ type: type as ReportType, count }));

    // Format simplificado (assumir PDF por padrão)
    const reportsByFormat = [
      { format: ReportFormat.PDF, count: totalReports },
    ];

    // Status simplificado
    const readyCount = reports.filter((r) => r.file_url).length;
    const reportsByStatus = [
      { status: ReportStatus.READY, count: readyCount },
      { status: ReportStatus.GENERATING, count: totalReports - readyCount },
    ];

    // Tempo médio (simplificado - assumir 30s)
    const averageGenerationTime = 30;

    const lastGenerated = reports.length > 0 && reports[0]
      ? reports.reduce((latest, report) =>
        report.created_at > latest ? report.created_at : latest,
      reports[0].created_at,
      )
      : null;

    return {
      totalReports,
      reportsByType,
      reportsByFormat,
      reportsByStatus,
      averageGenerationTime,
      lastGenerated,
    };
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private mapToReportWithStatus(report: { id: string; user_id: string; type: ReportType; title: string; file_url: string | null; filters: unknown; created_at: Date; expires_at: Date | null }, status: ReportStatus, format: ReportFormat): ReportWithStatus {
    return {
      id: report.id,
      user_id: report.user_id,
      type: report.type,
      title: report.title,
      format,
      status,
      file_url: report.file_url,
      error_message: null,
      filters: report.filters as ReportFilters,
      created_at: report.created_at,
      expires_at: report.expires_at,
    };
  }

  private isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) {
      return false;
    }
    return new Date() > expiresAt;
  }

  private groupSalesByDay(sales: Array<{ created_at: Date; total_price: number | { toNumber: () => number } }>): Array<{ date: string; count: number; revenue: number }> {
    const days: Record<string, { count: number; revenue: number }> = {};

    sales.forEach((sale) => {
      const date = sale.created_at.toISOString().split('T')[0];
      if (!days[date]) {
        days[date] = { count: 0, revenue: 0 };
      }
      days[date].count++;
      days[date].revenue += Number(sale.total_price);
    });

    return Object.entries(days).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
    }));
  }

  private async getTopClients(userId: string, startDate: Date, endDate: Date) {
    const clientSales = await this.prisma.sale.groupBy({
      by: ['client_id'],
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        total_price: true,
      },
      _count: {
        id: true,
      },
    });

    const clientIds = clientSales.map((cs) => cs.client_id).filter((id): id is string => id !== null);

    if (clientIds.length === 0) {
      return [];
    }

    const clients = await this.prisma.client.findMany({
      where: {
        id: { in: clientIds },
      },
    });

    return clientSales
      .map((cs) => {
        const client = clients.find((c) => c.id === cs.client_id);
        return {
          id: cs.client_id,
          name: client?.name || 'N/A',
          totalSpent: Number(cs._sum.total_price || 0),
          orderCount: cs._count.id,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  private groupByMonth(sales: Array<{ created_at: Date; total_price: number | { toNumber: () => number } }>, ads: Array<{ date: Date; spend: number | { toNumber: () => number } }>) {
    const months: Record<string, { revenue: number; expenses: number }> = {};

    sales.forEach((sale) => {
      const month = sale.created_at.toISOString().substring(0, 7); // YYYY-MM
      if (!months[month]) {
        months[month] = { revenue: 0, expenses: 0 };
      }
      months[month].revenue += Number(sale.total_price);
    });

    ads.forEach((ad) => {
      const month = ad.date.toISOString().substring(0, 7);
      if (!months[month]) {
        months[month] = { revenue: 0, expenses: 0 };
      }
      months[month].expenses += Number(ad.spend);
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
    }));
  }
}
