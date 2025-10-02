// Referência: design.md §Controller Layer, user-stories.md Story 2.1, tasks.md Task 3.2
// Controller REST de vendas com endpoints CRUD

import type { Request, Response } from 'express';
import { SaleService } from '../services/SaleService';
import {
  createSaleSchema,
  saleFiltersSchema,
  updateSaleSchema,
} from '../validators/sale.validator';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class SaleController {
  private saleService: SaleService;

  constructor() {
    this.saleService = new SaleService();
  }

  /**
   * GET /sales - Listar vendas com filtros e paginação
   * Referência: user-stories.md Story 2.1 Dashboard
   */
  getAllSales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }

      // Validate and parse query parameters
      const validatedQuery = saleFiltersSchema.parse(req.query);

      const filters = {
        client_id: validatedQuery.client_id,
        status: validatedQuery.status,
        product_name: validatedQuery.product_name,
        start_date: validatedQuery.start_date,
        end_date: validatedQuery.end_date,
        min_amount: validatedQuery.min_amount,
        max_amount: validatedQuery.max_amount,
      };

      const result = await this.saleService.getAllSales(
        userId,
        filters,
        validatedQuery.page,
        validatedQuery.limit,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({
          success: false,
          error: 'Dados de filtro inválidos',
          details: error.message,
        });
        return;
      }

      console.error('Error fetching sales:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  /**
   * GET /sales/:id - Buscar venda por ID
   */
  getSaleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID da venda é obrigatório',
        });
        return;
      }

      const sale = await this.saleService.getSaleById(id, userId);

      if (!sale) {
        res.status(404).json({
          success: false,
          error: 'Venda não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      console.error('Error fetching sale by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  /**
   * POST /sales - Criar nova venda
   */
  createSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }

      // Validate request body
      const validatedData = createSaleSchema.parse(req.body);

      const sale = await this.saleService.createSale(userId, validatedData);

      res.status(201).json({
        success: true,
        data: sale,
        message: 'Venda criada com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('validation') || error.message.includes('obrigatório') || error.message.includes('inválid')) {
          res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            details: error.message,
          });
          return;
        }
      }

      console.error('Error creating sale:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  /**
   * PUT /sales/:id - Atualizar venda
   */
  updateSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID da venda é obrigatório',
        });
        return;
      }

      // Validate request body
      const validatedData = updateSaleSchema.parse(req.body);

      const sale = await this.saleService.updateSale(id, userId, validatedData);

      if (!sale) {
        res.status(404).json({
          success: false,
          error: 'Venda não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sale,
        message: 'Venda atualizada com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('validation') || error.message.includes('obrigatório') || error.message.includes('inválid')) {
          res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            details: error.message,
          });
          return;
        }
      }

      console.error('Error updating sale:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  /**
   * DELETE /sales/:id - Deletar venda
   */
  deleteSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID da venda é obrigatório',
        });
        return;
      }

      const deleted = await this.saleService.deleteSale(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Venda não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Venda deletada com sucesso',
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };

  /**
   * GET /sales/analytics/summary - Obter resumo de vendas por período
   * Usado para Dashboard Metrics (Task 3.3)
   */
  getSalesSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          success: false,
          error: 'Data inicial e final são obrigatórias',
        });
        return;
      }

      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Formato de data inválido',
        });
        return;
      }

      if (endDate < startDate) {
        res.status(400).json({
          success: false,
          error: 'Data final deve ser posterior à data inicial',
        });
        return;
      }

      const summary = await this.saleService.getSalesByPeriod(userId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };
}