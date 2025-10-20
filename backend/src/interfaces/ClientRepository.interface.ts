// Referência: design.md §Repository Pattern, dev-stories.md §Dev Story 2.1
// Atende user-stories.md Story 3.1

import type { Client, ClientStatus } from '@prisma/client'

export interface ClientFilters {
  search?: string | undefined
  status?: ClientStatus | undefined
  tags?: string[] | undefined
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginatedClients {
  data: Client[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface CreateClientDTO {
  name: string
  email?: string | undefined
  phone?: string | undefined
  cpf?: string | undefined
  address?: string | undefined
  city?: string | undefined
  state?: string | undefined
  cep?: string | undefined
  status: ClientStatus
  user_id: string
  external_id?: string | undefined
}

export interface UpdateClientDTO {
  name?: string | undefined
  email?: string | undefined
  phone?: string | undefined
  cpf?: string | undefined
  address?: string | undefined
  city?: string | undefined
  state?: string | undefined
  cep?: string | undefined
  status?: ClientStatus | undefined
}

export interface IClientRepository {
  findById(id: string): Promise<Client | null>
  findByUserId(
    userId: string,
    filters?: ClientFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedClients>
  create(data: CreateClientDTO): Promise<Client>
  update(id: string, data: UpdateClientDTO): Promise<Client>
  delete(id: string): Promise<void>
  count(userId: string, filters?: ClientFilters): Promise<number>
  checkOwnership(id: string, userId: string): Promise<boolean>
}
