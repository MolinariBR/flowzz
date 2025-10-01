// Referência: design.md §Application Layer, dev-stories.md §Dev Story 2.1
// Atende user-stories.md Story 3.1 - Business logic para gestão de clientes

import type { Client } from '@prisma/client';
import { ClientRepository } from '../repositories/ClientRepository';
import type { 
  ClientFilters, 
  CreateClientDTO, 
  PaginatedClients, 
  PaginationOptions, 
  UpdateClientDTO 
} from '../interfaces/ClientRepository.interface';
import type { CreateClientInput, UpdateClientInput } from '../validators/client.validator';

export class ClientService {
  private clientRepository: ClientRepository;

  constructor() {
    this.clientRepository = new ClientRepository();
  }

  async getClients(
    userId: string, 
    page: number = 1, 
    limit: number = 20, 
    filters?: ClientFilters
  ): Promise<PaginatedClients> {
    const pagination: PaginationOptions = { page, limit };
    return await this.clientRepository.findByUserId(userId, filters, pagination);
  }

  async getClientById(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    // Validate ownership
    if (client.user_id !== userId) {
      throw new Error('Acesso negado');
    }

    return client;
  }

  async createClient(data: Omit<CreateClientDTO, 'user_id'>, userId: string): Promise<Client> {
    // Validate business rules
    await this.validateClientData(data, userId);
    
    // Set user_id
    const clientData: CreateClientDTO = { ...data, user_id: userId };
    
    return await this.clientRepository.create(clientData);
  }

  async updateClient(id: string, data: UpdateClientDTO, userId: string): Promise<Client> {
    // Check ownership first
    const isOwner = await this.clientRepository.checkOwnership(id, userId);
    if (!isOwner) {
      throw new Error('Acesso negado');
    }

    // Validate business rules if email is being updated
    if (data.email) {
      await this.validateEmailUniqueness(data.email, userId, id);
    }

    return await this.clientRepository.update(id, data);
  }

  async deleteClient(id: string, userId: string): Promise<void> {
    // Check ownership first
    const isOwner = await this.clientRepository.checkOwnership(id, userId);
    if (!isOwner) {
      throw new Error('Acesso negado');
    }

    await this.clientRepository.delete(id);
  }

  private async validateClientData(data: Omit<CreateClientDTO, 'user_id'>, userId: string): Promise<void> {
    // Validate email uniqueness if provided
    if (data.email) {
      await this.validateEmailUniqueness(data.email, userId);
    }

    // Additional business validations can be added here
    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new Error('Formato de telefone inválido');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Formato de email inválido');
    }
  }

  private async validateEmailUniqueness(email: string, userId: string, excludeId?: string): Promise<void> {
    const filters: ClientFilters = { search: email };
    const existing = await this.clientRepository.findByUserId(userId, filters, { page: 1, limit: 1 });
    
    const duplicateClient = existing.data.find(client => 
      client.email === email && client.id !== excludeId
    );
    
    if (duplicateClient) {
      throw new Error('Já existe um cliente com este email');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Brazilian phone format: (11) 99999-9999 or 11999999999
    const phoneRegex = /^(\(\d{2}\)\s?|\d{2})\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone);
  }
}