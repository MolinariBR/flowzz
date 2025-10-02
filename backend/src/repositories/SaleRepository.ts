// Referência: design.md §Repository Pattern, user-stories.md Story 2.1, tasks.md Task 3.2
// Implementação do repositório de vendas seguindo padrões Prisma

import type { Sale } from '@prisma/client';
import { prisma } from '../shared/config/database';
import type {
  CreateSaleDTO,
  ISaleRepository,
  PaginatedSales,
  SaleFilters,
  UpdateSaleDTO,
} from '../interfaces/SaleRepository.interface';

export class SaleRepository implements ISaleRepository {
  async findByUserId(
    userId: string,
    filters: SaleFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedSales> {
    const offset = (page - 1) * limit;

    // Build where clause with filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      user_id: userId,
    };

    if (filters.client_id) {
      whereClause.client_id = filters.client_id;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.product_name) {
      whereClause.product_name = {
        contains: filters.product_name,
        mode: 'insensitive',
      };
    }

    if (filters.start_date || filters.end_date) {
      whereClause.created_at = {};
      if (filters.start_date) {
        whereClause.created_at.gte = filters.start_date;
      }
      if (filters.end_date) {
        whereClause.created_at.lte = filters.end_date;
      }
    }

    if (filters.min_amount || filters.max_amount) {
      whereClause.total_price = {};
      if (filters.min_amount) {
        whereClause.total_price.gte = filters.min_amount;
      }
      if (filters.max_amount) {
        whereClause.total_price.lte = filters.max_amount;
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.sale.count({
        where: whereClause,
      }),
    ]);

    return {
      sales,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<Sale | null> {
    return prisma.sale.findFirst({
      where: {
        id,
        user_id: userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async create(userId: string, data: CreateSaleDTO): Promise<Sale> {
    const saleData = {
      ...data,
      user_id: userId,
      client_id: data.client_id || null,
      external_id: data.external_id || null,
      product_sku: data.product_sku || null,
      commission: data.commission || null,
      payment_method: data.payment_method || null,
      payment_due_date: data.payment_due_date || null,
      payment_date: data.payment_date || null,
      shipped_at: data.shipped_at || null,
      delivered_at: data.delivered_at || null,
      status: data.status || 'PENDING',
    };

    return prisma.sale.create({
      data: saleData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, data: UpdateSaleDTO): Promise<Sale | null> {
    // Check ownership first
    const exists = await this.checkOwnership(id, userId);
    if (!exists) {
      return null;
    }

    // Convert undefined to null for Prisma
    const updateData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value]),
    );

    return prisma.sale.update({
      where: {
        id,
        user_id: userId,
      },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.sale.delete({
        where: {
          id,
          user_id: userId,
        },
      });
      return true;
    } catch (_error) {
      return false;
    }
  }

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const sale = await prisma.sale.findFirst({
      where: {
        id,
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    return !!sale;
  }

  async findByExternalId(externalId: string, userId: string): Promise<Sale | null> {
    return prisma.sale.findFirst({
      where: {
        external_id: externalId,
        user_id: userId,
      },
    });
  }

  async getTotalsByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    total_sales: number;
    total_commission: number;
    count: number;
  }> {
    const result = await prisma.sale.aggregate({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['PAID', 'DELIVERED'], // Only count completed sales
        },
      },
      _sum: {
        total_price: true,
        commission: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      total_sales: Number(result._sum.total_price) || 0,
      total_commission: Number(result._sum.commission) || 0,
      count: result._count.id || 0,
    };
  }
}