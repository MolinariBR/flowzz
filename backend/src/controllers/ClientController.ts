// Referência: design.md §Presentation Layer, dev-stories.md §Dev Story 2.1
// Atende user-stories.md Story 3.1 - Endpoints REST para gestão de clientes

import type { Request, Response } from 'express';
import { ClientService } from '../services/ClientService';
import {
  clientFiltersSchema,
  clientParamsSchema,
  createClientSchema,
  updateClientSchema,
} from '../validators/client.validator';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  // GET /clients?page=1&limit=20&search=&status=&tags[]
  getClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const validation = clientFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          error: 'Parâmetros inválidos',
          details: validation.error.errors,
        });
        return;
      }

      const { page, limit, search, status, tags } = validation.data;

      const cleanFilters = {
        search: search || undefined,
        status: status || undefined,
        tags: tags || undefined,
      };

      const result = await this.clientService.getClients(
        req.user.userId,
        page,
        limit,
        cleanFilters,
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  // GET /clients/:id
  getClientById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const validation = clientParamsSchema.safeParse(req.params);
      if (!validation.success) {
        res.status(400).json({
          error: 'ID inválido',
          details: validation.error.errors,
        });
        return;
      }

      const { id } = validation.data;
      const client = await this.clientService.getClientById(id, req.user.userId);

      res.status(200).json(client);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Cliente não encontrado') {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === 'Acesso negado') {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  // POST /clients
  createClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const validation = createClientSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.error.errors,
        });
        return;
      }

      const clientData = validation.data;

      // Convert optional fields to proper types
      const processedData = {
        name: clientData.name,
        email: clientData.email || undefined,
        phone: clientData.phone || undefined,
        cpf: clientData.cpf || undefined,
        address: clientData.address || undefined,
        city: clientData.city || undefined,
        state: clientData.state || undefined,
        cep: clientData.cep || undefined,
        status: clientData.status,
        external_id: clientData.external_id || undefined,
      };

      const client = await this.clientService.createClient(processedData, req.user.userId);

      res.status(201).json(client);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Já existe um cliente') ||
            error.message.includes('inválido')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  // PUT /clients/:id
  updateClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const paramsValidation = clientParamsSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        res.status(400).json({
          error: 'ID inválido',
          details: paramsValidation.error.errors,
        });
        return;
      }

      const bodyValidation = updateClientSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: bodyValidation.error.errors,
        });
        return;
      }

      const { id } = paramsValidation.data;
      const updateData = bodyValidation.data;

      const client = await this.clientService.updateClient(id, updateData, req.user.userId);

      res.status(200).json(client);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Acesso negado') {
          res.status(403).json({ error: error.message });
          return;
        }
        if (error.message.includes('Já existe um cliente') ||
            error.message.includes('inválido')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  // DELETE /clients/:id
  deleteClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const validation = clientParamsSchema.safeParse(req.params);
      if (!validation.success) {
        res.status(400).json({
          error: 'ID inválido',
          details: validation.error.errors,
        });
        return;
      }

      const { id } = validation.data;
      await this.clientService.deleteClient(id, req.user.userId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Acesso negado') {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };
}