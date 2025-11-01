// Tipos TypeScript para clientes
// Baseado na estrutura do backend (Prisma schema + validators)

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export interface Client {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  address?: string
  city?: string
  state?: string
  cep?: string
  status: ClientStatus
  external_id?: string
  total_spent: number
  total_orders: number
  last_order_at?: string
  created_at: string
  updated_at: string
  tags: ClientTag[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface ClientTag {
  id: string
  client_id: string
  tag_id: string
  created_at: string
  client: Client
  tag: Tag
}

export interface ClientFilters {
  search?: string
  status?: ClientStatus
  tags?: string[]
  page?: number
  limit?: number
}

export interface ClientsResponse {
  success: boolean
  data: Client[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ClientResponse {
  success: boolean
  data: Client
}

export interface CreateClientInput {
  name: string
  email?: string
  phone?: string
  cpf?: string
  address?: string
  city?: string
  state?: string
  cep?: string
  status: ClientStatus
  external_id?: string
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

export interface CreateTagInput {
  name: string
  color?: string
}

export interface UpdateTagInput extends Partial<CreateTagInput> {}