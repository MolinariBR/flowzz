// Clients API - Gestão de clientes
// Integração com backend /api/v1/clients

import type {
    Client,
    ClientFilters,
    ClientsResponse,
    CreateClientInput,
    CreateTagInput,
    Tag,
    UpdateClientInput,
    UpdateTagInput
} from '../types/client'
import { apiClient } from './client'

// ============================================
// TYPES
// ============================================

export interface ClientsListResponse {
  success: boolean
  data: Client[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ClientSingleResponse {
  success: boolean
  data: Client
}

export interface TagsResponse {
  success: boolean
  data: Tag[]
}

export interface TagResponse {
  success: boolean
  data: Tag
}

// ============================================
// CLIENT FUNCTIONS
// ============================================

/**
 * Obtém lista paginada de clientes com filtros
 * Endpoint: GET /clients
 */
export async function getClients(filters?: ClientFilters): Promise<ClientsResponse> {
  const params = new URLSearchParams()

  if (filters?.search) params.append('search', filters.search)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.tags?.length) {
    filters.tags.forEach(tag => params.append('tags', tag))
  }
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const queryString = params.toString()
  const endpoint = queryString ? `/clients?${queryString}` : '/clients'

  const response = await apiClient.get<ClientsListResponse>(endpoint)
  return response
}

/**
 * Obtém cliente específico por ID
 * Endpoint: GET /clients/:id
 */
export async function getClient(id: string): Promise<ClientSingleResponse> {
  const response = await apiClient.get<ClientSingleResponse>(`/clients/${id}`)
  return response
}

/**
 * Cria novo cliente
 * Endpoint: POST /clients
 */
export async function createClient(data: CreateClientInput): Promise<ClientSingleResponse> {
  const response = await apiClient.post<ClientSingleResponse>('/clients', data)
  return response
}

/**
 * Atualiza cliente existente
 * Endpoint: PUT /clients/:id
 */
export async function updateClient(id: string, data: UpdateClientInput): Promise<ClientSingleResponse> {
  const response = await apiClient.put<ClientSingleResponse>(`/clients/${id}`, data)
  return response
}

/**
 * Exclui cliente (soft delete)
 * Endpoint: DELETE /clients/:id
 */
export async function deleteClient(id: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/clients/${id}`)
  return response
}

// ============================================
// TAG FUNCTIONS
// ============================================

/**
 * Obtém todas as tags do usuário
 * Endpoint: GET /tags
 */
export async function getTags(): Promise<TagsResponse> {
  const response = await apiClient.get<TagsResponse>('/tags')
  return response
}

/**
 * Cria nova tag
 * Endpoint: POST /tags
 */
export async function createTag(data: CreateTagInput): Promise<TagResponse> {
  const response = await apiClient.post<TagResponse>('/tags', data)
  return response
}

/**
 * Atualiza tag existente
 * Endpoint: PUT /tags/:id
 */
export async function updateTag(id: string, data: UpdateTagInput): Promise<TagResponse> {
  const response = await apiClient.put<TagResponse>(`/tags/${id}`, data)
  return response
}

/**
 * Exclui tag
 * Endpoint: DELETE /tags/:id
 */
export async function deleteTag(id: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/tags/${id}`)
  return response
}

// ============================================
// CLIENT-TAG RELATIONS
// ============================================

/**
 * Adiciona tag a cliente
 * Endpoint: POST /clients/:clientId/tags
 */
export async function addTagToClient(clientId: string, tagId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(`/clients/${clientId}/tags`, { tagId })
  return response
}

/**
 * Remove tag de cliente
 * Endpoint: DELETE /clients/:clientId/tags/:tagId
 */
export async function removeTagFromClient(clientId: string, tagId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/clients/${clientId}/tags/${tagId}`)
  return response
}