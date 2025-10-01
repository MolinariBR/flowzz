// Referência: design.md §Testing, user-stories.md Story 2.1, tasks.md Task 3.2
// Testes unitários para SaleService seguindo padrão dos testes existentes

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaleService } from '../services/SaleService';
import { SaleRepository } from '../repositories/SaleRepository';

// Mock do SaleRepository
vi.mock('../repositories/SaleRepository');

describe('SaleService', () => {
  let saleService: SaleService;
  let mockSaleRepository: vi.Mocked<SaleRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaleRepository = vi.mocked(new SaleRepository());
    saleService = new SaleService();
    
    // Replace the repository instance
    (saleService as any).saleRepository = mockSaleRepository;
  });

  describe('getAllSales', () => {
    it('deve retornar vendas paginadas com filtros', async () => {
      const userId = 'user-123';
      const mockResult = {
        sales: [
          {
            id: 'sale-1',
            user_id: userId,
            product_name: 'Produto Teste',
            quantity: 2,
            unit_price: 100,
            total_price: 200,
            status: 'PAID'
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        total_pages: 1
      };

      mockSaleRepository.findByUserId.mockResolvedValue(mockResult as any);

      const result = await saleService.getAllSales(userId, {}, 1, 10);

      expect(result).toEqual(mockResult);
      expect(mockSaleRepository.findByUserId).toHaveBeenCalledWith(userId, {}, 1, 10);
    });

    it('deve validar parâmetros de paginação', async () => {
      const userId = 'user-123';
      mockSaleRepository.findByUserId.mockResolvedValue({
        sales: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0
      });

      // Teste com página inválida
      await saleService.getAllSales(userId, {}, 0, 10);
      expect(mockSaleRepository.findByUserId).toHaveBeenCalledWith(userId, {}, 1, 10);

      // Teste com limit inválido
      await saleService.getAllSales(userId, {}, 1, 150);
      expect(mockSaleRepository.findByUserId).toHaveBeenCalledWith(userId, {}, 1, 10);
    });
  });

  describe('getSaleById', () => {
    it('deve retornar venda quando encontrada', async () => {
      const saleId = 'sale-123';
      const userId = 'user-123';
      const mockSale = {
        id: saleId,
        user_id: userId,
        product_name: 'Produto Teste',
        quantity: 1,
        unit_price: 100,
        total_price: 100,
        status: 'PAID'
      };

      mockSaleRepository.findById.mockResolvedValue(mockSale as any);

      const result = await saleService.getSaleById(saleId, userId);

      expect(result).toEqual(mockSale);
      expect(mockSaleRepository.findById).toHaveBeenCalledWith(saleId, userId);
    });

    it('deve retornar null quando venda não encontrada', async () => {
      mockSaleRepository.findById.mockResolvedValue(null);

      const result = await saleService.getSaleById('invalid-id', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('createSale', () => {
    it('deve criar venda com dados válidos', async () => {
      const userId = 'user-123';
      const saleData = {
        product_name: 'Produto Teste',
        quantity: 2,
        unit_price: 100,
        total_price: 200
      };

      const mockCreatedSale = {
        id: 'sale-123',
        user_id: userId,
        ...saleData,
        commission: 20, // 10% default
        status: 'PENDING'
      };

      mockSaleRepository.create.mockResolvedValue(mockCreatedSale as any);

      const result = await saleService.createSale(userId, saleData);

      expect(result).toEqual(mockCreatedSale);
      expect(mockSaleRepository.create).toHaveBeenCalledWith(userId, {
        ...saleData,
        commission: 20
      });
    });

    it('deve calcular total_price automaticamente', async () => {
      const userId = 'user-123';
      const saleData = {
        product_name: 'Produto Teste',
        quantity: 3,
        unit_price: 50,
        total_price: 150 // Deve ser recalculado
      };

      mockSaleRepository.create.mockResolvedValue({} as any);

      await saleService.createSale(userId, saleData);

      expect(mockSaleRepository.create).toHaveBeenCalledWith(userId, {
        ...saleData,
        total_price: 150, // quantity * unit_price
        commission: 15 // 10% of total_price
      });
    });

    it('deve validar nome do produto obrigatório', async () => {
      const userId = 'user-123';
      const saleData = {
        product_name: '',
        quantity: 1,
        unit_price: 100,
        total_price: 100
      };

      await expect(saleService.createSale(userId, saleData))
        .rejects.toThrow('Nome do produto é obrigatório');
    });

    it('deve validar quantidade positiva', async () => {
      const userId = 'user-123';
      const saleData = {
        product_name: 'Produto',
        quantity: 0,
        unit_price: 100,
        total_price: 100
      };

      await expect(saleService.createSale(userId, saleData))
        .rejects.toThrow('Quantidade deve ser maior que zero');
    });

    it('deve validar preços não negativos', async () => {
      const userId = 'user-123';
      const saleData = {
        product_name: 'Produto',
        quantity: 1,
        unit_price: -10,
        total_price: 100
      };

      await expect(saleService.createSale(userId, saleData))
        .rejects.toThrow('Preço unitário não pode ser negativo');
    });

    it('deve validar formato de SKU', async () => {
      const userId = 'user-123';
      const saleData = {
        product_name: 'Produto',
        product_sku: 'sku@invalid',
        quantity: 1,
        unit_price: 100,
        total_price: 100
      };

      await expect(saleService.createSale(userId, saleData))
        .rejects.toThrow('SKU deve conter apenas letras, números e hífens');
    });
  });

  describe('updateSale', () => {
    it('deve atualizar venda existente', async () => {
      const saleId = 'sale-123';
      const userId = 'user-123';
      const existingSale = {
        id: saleId,
        user_id: userId,
        product_name: 'Produto Antigo',
        quantity: 1,
        unit_price: 100,
        total_price: 100
      };

      const updateData = {
        product_name: 'Produto Atualizado',
        quantity: 2
      };

      const updatedSale = {
        ...existingSale,
        ...updateData,
        total_price: 200 // Recalculado
      };

      mockSaleRepository.findById.mockResolvedValue(existingSale as any);
      mockSaleRepository.update.mockResolvedValue(updatedSale as any);

      const result = await saleService.updateSale(saleId, userId, updateData);

      expect(result).toEqual(updatedSale);
      expect(mockSaleRepository.update).toHaveBeenCalledWith(saleId, userId, {
        ...updateData,
        total_price: 200
      });
    });

    it('deve retornar null quando venda não existe', async () => {
      mockSaleRepository.findById.mockResolvedValue(null);

      const result = await saleService.updateSale('invalid-id', 'user-123', {
        product_name: 'Teste'
      });

      expect(result).toBeNull();
    });

    it('deve recalcular total_price quando quantity ou unit_price mudam', async () => {
      const existingSale = {
        id: 'sale-123',
        quantity: 2,
        unit_price: 50,
        total_price: 100
      };

      mockSaleRepository.findById.mockResolvedValue(existingSale as any);
      mockSaleRepository.update.mockResolvedValue({} as any);

      // Atualizar apenas quantity
      await saleService.updateSale('sale-123', 'user-123', { quantity: 3 });
      expect(mockSaleRepository.update).toHaveBeenCalledWith('sale-123', 'user-123', {
        quantity: 3,
        total_price: 150 // 3 * 50
      });

      // Atualizar apenas unit_price
      await saleService.updateSale('sale-123', 'user-123', { unit_price: 75 });
      expect(mockSaleRepository.update).toHaveBeenCalledWith('sale-123', 'user-123', {
        unit_price: 75,
        total_price: 150 // 2 * 75
      });
    });
  });

  describe('deleteSale', () => {
    it('deve deletar venda quando existe', async () => {
      const saleId = 'sale-123';
      const userId = 'user-123';

      mockSaleRepository.checkOwnership.mockResolvedValue(true);
      mockSaleRepository.delete.mockResolvedValue(true);

      const result = await saleService.deleteSale(saleId, userId);

      expect(result).toBe(true);
      expect(mockSaleRepository.checkOwnership).toHaveBeenCalledWith(saleId, userId);
      expect(mockSaleRepository.delete).toHaveBeenCalledWith(saleId, userId);
    });

    it('deve retornar false quando venda não existe', async () => {
      mockSaleRepository.checkOwnership.mockResolvedValue(false);

      const result = await saleService.deleteSale('invalid-id', 'user-123');

      expect(result).toBe(false);
      expect(mockSaleRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getSalesByPeriod', () => {
    it('deve retornar resumo de vendas por período', async () => {
      const userId = 'user-123';
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      const mockSummary = {
        total_sales: 1500,
        total_commission: 150,
        count: 5
      };

      mockSaleRepository.getTotalsByPeriod.mockResolvedValue(mockSummary);

      const result = await saleService.getSalesByPeriod(userId, startDate, endDate);

      expect(result).toEqual(mockSummary);
      expect(mockSaleRepository.getTotalsByPeriod).toHaveBeenCalledWith(userId, startDate, endDate);
    });
  });

  describe('findByExternalId', () => {
    it('deve encontrar venda por ID externo', async () => {
      const userId = 'user-123';
      const externalId = 'coinzz-123';
      const mockSale = {
        id: 'sale-123',
        external_id: externalId,
        user_id: userId
      };

      mockSaleRepository.findByExternalId.mockResolvedValue(mockSale as any);

      const result = await saleService.findByExternalId(externalId, userId);

      expect(result).toEqual(mockSale);
      expect(mockSaleRepository.findByExternalId).toHaveBeenCalledWith(externalId, userId);
    });
  });
});