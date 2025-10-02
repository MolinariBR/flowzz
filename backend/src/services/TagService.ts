/**
 * Tag Service
 * 
 * Referências:
 * - openapi.yaml: Tag CRUD endpoints
 * - design.md: Clean Architecture + Repository Pattern
 * - tasks.md: Task 3.2 - Tags API (CRUD, many-to-many, validações)
 * 
 * Regras de Negócio:
 * - Usuário pode ter no máximo 20 tags (tasks.md Task 3.2.3)
 * - Nome de tag deve ser único por usuário
 * - Não pode excluir tag com clientes associados
 * - Multi-tenancy: tags isoladas por userId
 */

import { PrismaClient, type Tag as PrismaTag } from '@prisma/client';
import type { CreateTagDTO, ITag, ITagService, UpdateTagDTO } from '../interfaces/TagService.interface';

const prisma = new PrismaClient();

/**
 * Helper para converter Tag do Prisma (snake_case) para ITag (camelCase)
 */
function mapPrismaTagToITag(prismaTag: PrismaTag): ITag {
  return {
    id: prismaTag.id,
    nome: prismaTag.name,
    cor: prismaTag.color,
    userId: prismaTag.user_id,
    createdAt: prismaTag.created_at,
    updatedAt: prismaTag.updated_at,
  };
}

export class TagService implements ITagService {
  /**
   * Criar nova tag
   * Validações: limite de 20 tags, nome único
   * Referência: openapi.yaml POST /tags
   */
  async create(userId: string, data: CreateTagDTO): Promise<ITag> {
    // Validar limite de 20 tags por usuário (tasks.md Task 3.2.3)
    const hasReachedLimit = await this.validateTagLimit(userId);
    if (hasReachedLimit) {
      throw new Error('Limite máximo de 20 tags atingido');
    }

    // Validar nome único
    const isUnique = await this.isTagNameUnique(userId, data.nome);
    if (!isUnique) {
      throw new Error('Já existe uma tag com este nome');
    }

    // Criar tag
    const tag = await prisma.tag.create({
      data: {
        name: data.nome,
        color: data.cor,
        user_id: userId,
      },
    });

    return mapPrismaTagToITag(tag);
  }

  /**
   * Listar todas as tags do usuário
   * Multi-tenancy: retorna apenas tags do userId
   * Referência: openapi.yaml GET /tags
   */
  async getAll(userId: string): Promise<ITag[]> {
    const tags = await prisma.tag.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tags.map(mapPrismaTagToITag);
  }

  /**
   * Obter tag por ID
   * Multi-tenancy: valida que tag pertence ao userId
   * Referência: openapi.yaml GET /tags/{id}
   */
  async getById(userId: string, tagId: string): Promise<ITag> {
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        user_id: userId, // Multi-tenancy isolation
      },
    });

    if (!tag) {
      throw new Error('Tag não encontrada');
    }

    return mapPrismaTagToITag(tag);
  }

  /**
   * Atualizar tag
   * Validações: nome único (se alterado)
   * Referência: openapi.yaml PUT /tags/{id}
   */
  async update(userId: string, tagId: string, data: UpdateTagDTO): Promise<ITag> {
    // Verificar se tag existe e pertence ao usuário
    await this.getById(userId, tagId);

    // Validar nome único (se nome foi alterado)
    if (data.nome) {
      const isUnique = await this.isTagNameUnique(userId, data.nome, tagId);
      if (!isUnique) {
        throw new Error('Já existe uma tag com este nome');
      }
    }

    // Preparar dados para update (converter camelCase para snake_case)
    const updateData: { name?: string; color?: string } = {};
    if (data.nome !== undefined) {
      updateData.name = data.nome;
    }
    if (data.cor !== undefined) {
      updateData.color = data.cor;
    }

    // Atualizar tag
    const updatedTag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: updateData,
    });

    return mapPrismaTagToITag(updatedTag);
  }

  /**
   * Excluir tag
   * Validação: não pode excluir tag com clientes associados
   * Referência: openapi.yaml DELETE /tags/{id}
   */
  async delete(userId: string, tagId: string): Promise<void> {
    // Verificar se tag existe e pertence ao usuário
    await this.getById(userId, tagId);

    // Validar se tag tem clientes associados
    const hasClients = await this.checkTagHasClients(userId, tagId);
    if (hasClients) {
      throw new Error('Não é possível excluir tag com clientes associados');
    }

    // Excluir tag
    await prisma.tag.delete({
      where: {
        id: tagId,
      },
    });
  }

  /**
   * Adicionar tag a um cliente
   * Many-to-many association via ClientTag
   * Referência: tasks.md Task 3.2.2
   */
  async addTagToClient(userId: string, clientId: string, tagId: string): Promise<void> {
    // Validar que tag pertence ao usuário
    await this.getById(userId, tagId);

    // Validar que cliente pertence ao usuário
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        user_id: userId,
      },
    });

    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se associação já existe
    const existingAssociation = await prisma.clientTag.findUnique({
      where: {
        client_id_tag_id: {
          client_id: clientId,
          tag_id: tagId,
        },
      },
    });

    if (existingAssociation) {
      throw new Error('Cliente já possui esta tag');
    }

    // Criar associação
    await prisma.clientTag.create({
      data: {
        client_id: clientId,
        tag_id: tagId,
      },
    });
  }

  /**
   * Remover tag de um cliente
   * Remove associação many-to-many via ClientTag
   * Referência: tasks.md Task 3.2.2
   */
  async removeTagFromClient(userId: string, clientId: string, tagId: string): Promise<void> {
    // Validar que tag pertence ao usuário
    await this.getById(userId, tagId);

    // Validar que cliente pertence ao usuário
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        user_id: userId,
      },
    });

    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se associação existe
    const association = await prisma.clientTag.findUnique({
      where: {
        client_id_tag_id: {
          client_id: clientId,
          tag_id: tagId,
        },
      },
    });

    if (!association) {
      throw new Error('Cliente não possui esta tag');
    }

    // Remover associação
    await prisma.clientTag.delete({
      where: {
        client_id_tag_id: {
          client_id: clientId,
          tag_id: tagId,
        },
      },
    });
  }

  /**
   * Listar clientes de uma tag
   * Retorna clientes associados à tag
   */
  async getClientsByTag(userId: string, tagId: string): Promise<unknown[]> {
    // Validar que tag pertence ao usuário
    await this.getById(userId, tagId);

    // Buscar clientes através da tabela de junção ClientTag
    const clientTags = await prisma.clientTag.findMany({
      where: {
        tag_id: tagId,
        client: {
          user_id: userId, // Multi-tenancy isolation
        },
      },
      include: {
        client: true,
      },
    });

    return clientTags.map((ct) => ct.client);
  }

  /**
   * Validar limite de 20 tags por usuário
   * Retorna true se usuário atingiu o limite
   * Referência: tasks.md Task 3.2.3
   */
  async validateTagLimit(userId: string): Promise<boolean> {
    const count = await prisma.tag.count({
      where: {
        user_id: userId,
      },
    });

    return count >= 20;
  }

  /**
   * Verificar se tag tem clientes associados
   * Usado antes de permitir exclusão
   */
  async checkTagHasClients(userId: string, tagId: string): Promise<boolean> {
    const count = await prisma.clientTag.count({
      where: {
        tag_id: tagId,
        client: {
          user_id: userId, // Multi-tenancy isolation
        },
      },
    });

    return count > 0;
  }

  /**
   * Verificar se nome de tag é único para o usuário
   * excludeTagId: permite excluir uma tag da verificação (útil para update)
   */
  async isTagNameUnique(userId: string, nome: string, excludeTagId?: string): Promise<boolean> {
    const existingTag = await prisma.tag.findFirst({
      where: {
        user_id: userId,
        name: {
          equals: nome,
          mode: 'insensitive', // Case-insensitive comparison
        },
        ...(excludeTagId && {
          id: {
            not: excludeTagId,
          },
        }),
      },
    });

    return !existingTag;
  }
}
