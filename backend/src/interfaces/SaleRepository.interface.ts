// Referência: design.md §Repository Pattern, user-stories.md Story 2.1, tasks.md Task 3.2
// Interface do repositório de vendas seguindo Clean Architecture

import type { Sale, SaleStatus } from '@prisma/client';

export interface SaleFilters {
  client_id?: string | undefined;
  status?: SaleStatus | undefined;
  product_name?: string | undefined;
  start_date?: Date | undefined;
  end_date?: Date | undefined;
  min_amount?: number | undefined;
  max_amount?: number | undefined;
}

export interface PaginatedSales {
  sales: Sale[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateSaleDTO {
  client_id?: string | undefined;
  external_id?: string | undefined;
  product_name: string;
  product_sku?: string | undefined;
  quantity: number;
  unit_price: number;
  total_price: number;
  commission?: number | undefined;
  status?: SaleStatus | undefined;
  payment_method?: string | undefined;
  payment_due_date?: Date | undefined;
  payment_date?: Date | undefined;
  shipped_at?: Date | undefined;
  delivered_at?: Date | undefined;
}

export interface UpdateSaleDTO {
  client_id?: string | undefined;
  product_name?: string | undefined;
  product_sku?: string | undefined;
  quantity?: number | undefined;
  unit_price?: number | undefined;
  total_price?: number | undefined;
  commission?: number | undefined;
  status?: SaleStatus | undefined;
  payment_method?: string | undefined;
  payment_due_date?: Date | undefined;
  payment_date?: Date | undefined;
  shipped_at?: Date | undefined;
  delivered_at?: Date | undefined;
}

export interface ISaleRepository {
  findByUserId(
    userId: string,
    filters: SaleFilters,
    page: number,
    limit: number
  ): Promise<PaginatedSales>;
  
  findById(id: string, userId: string): Promise<Sale | null>;
  
  create(userId: string, data: CreateSaleDTO): Promise<Sale>;
  
  update(id: string, userId: string, data: UpdateSaleDTO): Promise<Sale | null>;
  
  delete(id: string, userId: string): Promise<boolean>;
  
  checkOwnership(id: string, userId: string): Promise<boolean>;
  
  findByExternalId(externalId: string, userId: string): Promise<Sale | null>;
  
  getTotalsByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    total_sales: number;
    total_commission: number;
    count: number;
  }>;
}