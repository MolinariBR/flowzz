/**
 * Tag Controller
 * 
 * Referências:
 * - openapi.yaml: Tag endpoints especification
 * - design.md: REST API patterns and error handling
 * - tasks.md: Task 3.2 - Tags API
 */

import type { Request, Response } from 'express';
import { TagService } from '../services/TagService';

const tagService = new TagService();

export class TagController {
  /**
   * Criar nova tag
   * POST /api/v1/tags
   * Referência: openapi.yaml POST /tags
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const { nome, cor } = req.body;

      const tag = await tagService.create(userId, { nome, cor });

      return res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      if (error instanceof Error) {
        // Tratamento de erros específicos de negócio
        if (error.message.includes('Limite máximo')) {
          return res.status(400).json({
            error: error.message,
            code: 'TAG_LIMIT_EXCEEDED',
          });
        }
        if (error.message.includes('Já existe')) {
          return res.status(400).json({
            error: error.message,
            code: 'TAG_NAME_NOT_UNIQUE',
          });
        }
        return res.status(500).json({
          error: 'Erro ao criar tag',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Listar todas as tags do usuário
   * GET /api/v1/tags
   * Referência: openapi.yaml GET /tags
   */
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const tags = await tagService.getAll(userId);

      return res.status(200).json({
        success: true,
        data: tags,
        count: tags.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: 'Erro ao listar tags',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter tag por ID
   * GET /api/v1/tags/:id
   * Referência: openapi.yaml GET /tags/{id}
   */
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const tagId = req.params.id as string;

      const tag = await tagService.getById(userId, tagId);

      return res.status(200).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Tag não encontrada') {
          return res.status(404).json({
            error: error.message,
            code: 'TAG_NOT_FOUND',
          });
        }
        return res.status(500).json({
          error: 'Erro ao obter tag',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Atualizar tag
   * PUT /api/v1/tags/:id
   * Referência: openapi.yaml PUT /tags/{id}
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const tagId = req.params.id as string;
      const { nome, cor } = req.body;

      const tag = await tagService.update(userId, tagId, { nome, cor });

      return res.status(200).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Tag não encontrada') {
          return res.status(404).json({
            error: error.message,
            code: 'TAG_NOT_FOUND',
          });
        }
        if (error.message.includes('Já existe')) {
          return res.status(400).json({
            error: error.message,
            code: 'TAG_NAME_NOT_UNIQUE',
          });
        }
        return res.status(500).json({
          error: 'Erro ao atualizar tag',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Excluir tag
   * DELETE /api/v1/tags/:id
   * Referência: openapi.yaml DELETE /tags/{id}
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const tagId = req.params.id as string;

      await tagService.delete(userId, tagId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Tag não encontrada') {
          return res.status(404).json({
            error: error.message,
            code: 'TAG_NOT_FOUND',
          });
        }
        if (error.message.includes('clientes associados')) {
          return res.status(400).json({
            error: error.message,
            code: 'TAG_HAS_CLIENTS',
          });
        }
        return res.status(500).json({
          error: 'Erro ao excluir tag',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Adicionar tag a um cliente
   * POST /api/v1/clients/:clientId/tags
   * Referência: tasks.md Task 3.2.2 - Many-to-many associations
   */
  async addToClient(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const clientId = req.params.clientId as string;
      const { tagId } = req.body;

      await tagService.addTagToClient(userId, clientId, tagId);

      return res.status(200).json({
        success: true,
        message: 'Tag adicionada ao cliente com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Tag não encontrada') {
          return res.status(404).json({
            error: error.message,
            code: 'TAG_NOT_FOUND',
          });
        }
        if (error.message === 'Cliente não encontrado') {
          return res.status(404).json({
            error: error.message,
            code: 'CLIENT_NOT_FOUND',
          });
        }
        if (error.message.includes('já possui')) {
          return res.status(400).json({
            error: error.message,
            code: 'TAG_ALREADY_ASSIGNED',
          });
        }
        return res.status(500).json({
          error: 'Erro ao adicionar tag ao cliente',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Remover tag de um cliente
   * DELETE /api/v1/clients/:clientId/tags/:tagId
   * Referência: tasks.md Task 3.2.2 - Many-to-many associations
   */
  async removeFromClient(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const clientId = req.params.clientId as string;
      const tagId = req.params.tagId as string;

      await tagService.removeTagFromClient(userId, clientId, tagId);

      return res.status(200).json({
        success: true,
        message: 'Tag removida do cliente com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Tag não encontrada') {
          return res.status(404).json({
            error: error.message,
            code: 'TAG_NOT_FOUND',
          });
        }
        if (error.message === 'Cliente não encontrado') {
          return res.status(404).json({
            error: error.message,
            code: 'CLIENT_NOT_FOUND',
          });
        }
        if (error.message.includes('não possui')) {
          return res.status(400).json({
            error: error.message,
            code: 'TAG_NOT_ASSIGNED',
          });
        }
        return res.status(500).json({
          error: 'Erro ao remover tag do cliente',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Listar clientes de uma tag
   * GET /api/v1/tags/:id/clients
   * Retorna todos os clientes associados a uma tag específica
   */
  async getClients(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const tagId = req.params.id as string;

      const clients = await tagService.getClientsByTag(userId, tagId);

      return res.status(200).json({
        success: true,
        data: clients,
        count: clients.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Tag não encontrada') {
          return res.status(404).json({
            error: error.message,
            code: 'TAG_NOT_FOUND',
          });
        }
        return res.status(500).json({
          error: 'Erro ao listar clientes da tag',
          details: error.message,
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
