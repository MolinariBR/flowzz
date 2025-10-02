// Referência: design.md §Repository Pattern, dev-stories.md §Dev Story 2.1
// Atende user-stories.md Story 3.1 - API de clientes com paginação e filtros

import type { Client } from '@prisma/client';
import { prisma } from '../shared/config/database';
import type {
  ClientFilters,
  CreateClientDTO,
  IClientRepository,
  PaginatedClients,
  PaginationOptions,
  UpdateClientDTO,
} from '../interfaces/ClientRepository.interface';

export class ClientRepository implements IClientRepository {
  async findById(id: string): Promise<Client | null> {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async findByUserId(
    userId: string,
    filters?: ClientFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedClients> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause with filters
    const where: { [key: string]: unknown } = {
      user_id: userId,
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag_id: {
            in: filters.tags,
          },
        },
      };
    }

    // Execute query with pagination
    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.count(userId, filters),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: CreateClientDTO): Promise<Client> {
    const createData = {
      user_id: data.user_id,
      name: data.name,
      status: data.status,
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
      ...(data.cpf && { cpf: data.cpf }),
      ...(data.address && { address: data.address }),
      ...(data.city && { city: data.city }),
      ...(data.state && { state: data.state }),
      ...(data.cep && { cep: data.cep }),
      ...(data.external_id && { external_id: data.external_id }),
    };

    return await prisma.client.create({
      data: createData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateClientDTO): Promise<Client> {
    const updateData = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.cpf !== undefined && { cpf: data.cpf }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.cep !== undefined && { cep: data.cep }),
      ...(data.status !== undefined && { status: data.status }),
    };

    return await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id },
    });
  }

  async count(userId: string, filters?: ClientFilters): Promise<number> {
    const where: { [key: string]: unknown } = {
      user_id: userId,
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag_id: {
            in: filters.tags,
          },
        },
      };
    }

    return await prisma.client.count({ where });
  }

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const client = await prisma.client.findFirst({
      where: { id, user_id: userId },
      select: { id: true },
    });

    return client !== null;
  }
}