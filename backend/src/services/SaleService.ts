// Referência: design.md §Service Layer, user-stories.md Story 2.1, tasks.md Task 3.2
// Service de vendas com regras de negócio e validações

import type { Sale } from '@prisma/client';
import { SaleRepository } from '../repositories/SaleRepository';
import type {
  CreateSaleDTO,
  PaginatedSales,
  SaleFilters,
  UpdateSaleDTO,
} from '../interfaces/SaleRepository.interface';

export class SaleService {
  private saleRepository: SaleRepository;

  constructor() {
    this.saleRepository = new SaleRepository();
  }

  async getAllSales(
    userId: string,
    filters: SaleFilters = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedSales> {
    // Validate pagination parameters
    if (page < 1) {
      page = 1;
    }
    if (limit < 1 || limit > 100) {
      limit = 10;
    } // Max 100 per page

    return await this.saleRepository.findByUserId(userId, filters, page, limit);
  }

  async getSaleById(id: string, userId: string): Promise<Sale | null> {
    return await this.saleRepository.findById(id, userId);
  }

  async createSale(userId: string, data: CreateSaleDTO): Promise<Sale> {
    // Business validations
    this.validateSaleData(data);

    // Ensure total_price consistency
    if (data.quantity && data.unit_price) {
      data.total_price = data.quantity * data.unit_price;
    }

    // Calculate commission if not provided (default 10%)
    if (!data.commission && data.total_price) {
      data.commission = data.total_price * 0.1;
    }

    return await this.saleRepository.create(userId, data);
  }

  async updateSale(
    id: string,
    userId: string,
    data: UpdateSaleDTO,
  ): Promise<Sale | null> {
    // Check if sale exists and belongs to user
    const existingSale = await this.saleRepository.findById(id, userId);
    if (!existingSale) {
      return null;
    }

    // Business validations for update data
    if (Object.keys(data).length > 0) {
      this.validateSaleUpdateData(data);
    }

    // Recalculate total_price if quantity or unit_price changed
    if (data.quantity !== undefined || data.unit_price !== undefined) {
      const quantity = data.quantity ?? existingSale.quantity;
      const unitPrice = data.unit_price ?? Number(existingSale.unit_price);
      data.total_price = quantity * unitPrice;
    }

    return await this.saleRepository.update(id, userId, data);
  }

  async deleteSale(id: string, userId: string): Promise<boolean> {
    // Check ownership first
    const exists = await this.saleRepository.checkOwnership(id, userId);
    if (!exists) {
      return false;
    }

    return await this.saleRepository.delete(id, userId);
  }

  async getSalesByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    total_sales: number;
    total_commission: number;
    count: number;
  }> {
    return await this.saleRepository.getTotalsByPeriod(userId, startDate, endDate);
  }

  async findByExternalId(externalId: string, userId: string): Promise<Sale | null> {
    return await this.saleRepository.findByExternalId(externalId, userId);
  }

  private validateSaleData(data: CreateSaleDTO): void {
    if (!data.product_name || data.product_name.trim().length === 0) {
      throw new Error('Nome do produto é obrigatório');
    }

    if (data.product_name.length > 200) {
      throw new Error('Nome do produto deve ter no máximo 200 caracteres');
    }

    if (data.quantity < 1) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    if (data.unit_price < 0) {
      throw new Error('Preço unitário não pode ser negativo');
    }

    if (data.total_price < 0) {
      throw new Error('Preço total não pode ser negativo');
    }

    if (data.commission && data.commission < 0) {
      throw new Error('Comissão não pode ser negativa');
    }

    // Validate product SKU format if provided
    if (data.product_sku && !/^[A-Z0-9-]{3,50}$/i.test(data.product_sku)) {
      throw new Error('SKU deve conter apenas letras, números e hífens (3-50 caracteres)');
    }

    // Validate payment dates if provided
    if (data.payment_due_date && data.payment_date) {
      if (data.payment_date < data.payment_due_date) {
        throw new Error('Data de pagamento não pode ser anterior à data de vencimento');
      }
    }

    // Validate delivery dates logic
    if (data.shipped_at && data.delivered_at) {
      if (data.delivered_at < data.shipped_at) {
        throw new Error('Data de entrega não pode ser anterior à data de envio');
      }
    }
  }

  private validateSaleUpdateData(data: UpdateSaleDTO): void {
    if (data.product_name !== undefined) {
      if (!data.product_name || data.product_name.trim().length === 0) {
        throw new Error('Nome do produto é obrigatório');
      }
      if (data.product_name.length > 200) {
        throw new Error('Nome do produto deve ter no máximo 200 caracteres');
      }
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    if (data.unit_price !== undefined && data.unit_price < 0) {
      throw new Error('Preço unitário não pode ser negativo');
    }

    if (data.total_price !== undefined && data.total_price < 0) {
      throw new Error('Preço total não pode ser negativo');
    }

    if (data.commission !== undefined && data.commission < 0) {
      throw new Error('Comissão não pode ser negativa');
    }

    if (data.product_sku && !/^[A-Z0-9-]{3,50}$/i.test(data.product_sku)) {
      throw new Error('SKU deve conter apenas letras, números e hífens (3-50 caracteres)');
    }
  }
}