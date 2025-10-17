// Referência: design.md §Repository Pattern
// Atende milestone02.md §WhatsApp Business API - Gerenciamento de integrações

import type { Integration, IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { prisma } from '../shared/config/database';

export interface IntegrationFilters {
  provider?: IntegrationProvider;
  status?: IntegrationStatus;
  search?: string;
}

export interface CreateIntegrationDTO {
  user_id: string;
  provider: IntegrationProvider;
  config: Record<string, any>;
  status?: IntegrationStatus;
}

export interface UpdateIntegrationDTO {
  config?: Record<string, any>;
  status?: IntegrationStatus;
}

export class IntegrationRepository {
  async findById(id: string): Promise<Integration | null> {
    return await prisma.integration.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Integration[]> {
    return await prisma.integration.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByUserAndProvider(
    userId: string,
    provider: IntegrationProvider
  ): Promise<Integration | null> {
    return await prisma.integration.findFirst({
      where: {
        user_id: userId,
        provider: provider,
      },
    });
  }

  async findByBusinessAccountId(businessAccountId: string): Promise<Integration | null> {
    const integrations = await prisma.integration.findMany({
      where: {
        provider: 'WHATSAPP',
        status: 'CONNECTED',
      },
    });

    return integrations.find(integration => {
      const config = integration.config as any;
      return config?.businessAccountId === businessAccountId;
    }) || null;
  }

  async findByPhoneNumberId(phoneNumberId: string): Promise<Integration | null> {
    const integrations = await prisma.integration.findMany({
      where: {
        provider: 'WHATSAPP',
        status: 'CONNECTED',
      },
    });

    return integrations.find(integration => {
      const config = integration.config as any;
      return config?.phoneNumberId === phoneNumberId;
    }) || null;
  }

  async create(data: CreateIntegrationDTO): Promise<Integration> {
    return await prisma.integration.create({
      data: {
        user_id: data.user_id,
        provider: data.provider,
        config: data.config,
        status: data.status || 'PENDING',
      },
    });
  }

  async update(id: string, data: UpdateIntegrationDTO): Promise<Integration> {
    return await prisma.integration.update({
      where: { id },
      data: {
        ...(data.config && { config: data.config }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.integration.delete({
      where: { id },
    });
  }

  async findAll(filters?: IntegrationFilters): Promise<Integration[]> {
    const where: { [key: string]: unknown } = {};

    if (filters?.provider) {
      where.provider = filters.provider;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { provider: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.integration.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }
}