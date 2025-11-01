// src/lib/hooks/useClients.ts
// Hook para integração com Clients API

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  addTagToClient,
  createClient,
  createTag,
  deleteClient,
  deleteTag,
  getClient,
  getClients,
  getTags,
  removeTagFromClient,
  updateClient,
  updateTag,
} from '../api/clients'
import type {
  Client,
  ClientFilters,
  CreateClientInput,
  CreateTagInput,
  Tag,
  UpdateClientInput,
  UpdateTagInput,
} from '../types/client'

export const useClients = (isAuthenticated: boolean = false) => {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [filters, setFilters] = useState<ClientFilters>({})
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // Carregar lista de clientes com filtros
  const loadClients = useCallback(
    async (clientFilters?: ClientFilters) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      console.log('useClients: loadClients called with token:', !!token)
      if (!token) {
        console.log('useClients: No access token, skipping API call')
        return
      }
      try {
        setIsLoading(true)
        const response = await getClients(clientFilters || filters)

        setClients(response.data)
        setPagination(
          response.meta || {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          }
        )

        return response.data
      } catch (error) {
        console.error('Error loading clients:', error)
        toast.error('Erro ao carregar clientes')
        // Garantir que pagination tenha valores padrão em caso de erro
        setPagination({
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [filters]
  )

  // Carregar cliente específico
  const loadClient = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const response = await getClient(id)
      setCurrentClient(response.data)
      return response.data
    } catch (error) {
      console.error('Error loading client:', error)
      toast.error('Erro ao carregar cliente')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Criar novo cliente
  const createNewClient = useCallback(
    async (data: CreateClientInput) => {
      try {
        setIsLoading(true)
        const response = await createClient(data)

        // Recarregar lista após criação
        await loadClients()

        toast.success('Cliente criado com sucesso!')
        return response.data
      } catch (error) {
        console.error('Error creating client:', error)
        toast.error('Erro ao criar cliente')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [loadClients]
  )

  // Atualizar cliente
  const updateExistingClient = useCallback(
    async (id: string, data: UpdateClientInput) => {
      try {
        setIsLoading(true)
        const response = await updateClient(id, data)

        // Atualizar cliente na lista local
        setClients((prev) => prev.map((client) => (client.id === id ? response.data : client)))

        // Atualizar cliente atual se for o mesmo
        if (currentClient?.id === id) {
          setCurrentClient(response.data)
        }

        toast.success('Cliente atualizado com sucesso!')
        return response.data
      } catch (error) {
        console.error('Error updating client:', error)
        toast.error('Erro ao atualizar cliente')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentClient]
  )

  // Excluir cliente
  const removeClient = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        await deleteClient(id)

        // Remover cliente da lista local
        setClients((prev) => prev.filter((client) => client.id !== id))

        // Limpar cliente atual se for o excluído
        if (currentClient?.id === id) {
          setCurrentClient(null)
        }

        toast.success('Cliente excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting client:', error)
        toast.error('Erro ao excluir cliente')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentClient]
  )

  // Carregar tags
  const loadTags = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      console.log('useClients: No access token, skipping tags API call')
      return []
    }

    try {
      const response = await getTags()
      setTags(response.data)
      return response.data
    } catch (error) {
      console.error('Error loading tags:', error)
      toast.error('Erro ao carregar tags')
      return []
    }
  }, [])

  // Criar nova tag
  const createNewTag = useCallback(async (data: CreateTagInput) => {
    try {
      const response = await createTag(data)
      setTags((prev) => [...prev, response.data])
      toast.success('Tag criada com sucesso!')
      return response.data
    } catch (error) {
      console.error('Error creating tag:', error)
      toast.error('Erro ao criar tag')
      throw error
    }
  }, [])

  // Atualizar tag
  const updateExistingTag = useCallback(async (id: string, data: UpdateTagInput) => {
    try {
      const response = await updateTag(id, data)
      setTags((prev) => prev.map((tag) => (tag.id === id ? response.data : tag)))
      toast.success('Tag atualizada com sucesso!')
      return response.data
    } catch (error) {
      console.error('Error updating tag:', error)
      toast.error('Erro ao atualizar tag')
      throw error
    }
  }, [])

  // Excluir tag
  const removeTag = useCallback(async (id: string) => {
    try {
      await deleteTag(id)
      setTags((prev) => prev.filter((tag) => tag.id !== id))
      toast.success('Tag excluída com sucesso!')
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Erro ao excluir tag')
      throw error
    }
  }, [])

  // Adicionar tag a cliente
  const addTagToExistingClient = useCallback(
    async (clientId: string, tagId: string) => {
      try {
        await addTagToClient(clientId, tagId)

        // Atualizar cliente na lista local
        setClients((prev) =>
          prev.map((client) => {
            if (client.id === clientId) {
              const tag = tags.find((t) => t.id === tagId)
              if (tag) {
                return {
                  ...client,
                  tags: [
                    ...client.tags,
                    {
                      id: `${clientId}-${tagId}`,
                      client_id: clientId,
                      tag_id: tagId,
                      created_at: new Date().toISOString(),
                      client,
                      tag,
                    },
                  ],
                }
              }
            }
            return client
          })
        )

        toast.success('Tag adicionada ao cliente!')
      } catch (error) {
        console.error('Error adding tag to client:', error)
        toast.error('Erro ao adicionar tag ao cliente')
        throw error
      }
    },
    [tags]
  )

  // Remover tag de cliente
  const removeTagFromExistingClient = useCallback(async (clientId: string, tagId: string) => {
    try {
      await removeTagFromClient(clientId, tagId)

      // Atualizar cliente na lista local
      setClients((prev) =>
        prev.map((client) => {
          if (client.id === clientId) {
            return {
              ...client,
              tags: client.tags.filter((ct: any) => ct.tag_id !== tagId),
            }
          }
          return client
        })
      )

      toast.success('Tag removida do cliente!')
    } catch (error) {
      console.error('Error removing tag from client:', error)
      toast.error('Erro ao remover tag do cliente')
      throw error
    }
  }, [])

  // Atualizar filtros
  const updateFilters = useCallback(
    (newFilters: Partial<ClientFilters>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      loadClients(updatedFilters)
    },
    [filters, loadClients]
  )

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({})
    loadClients({})
  }, [loadClients])

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated) {
      loadClients()
      loadTags()
    }
  }, [loadClients, loadTags, isAuthenticated])

  return {
    // State
    isLoading,
    clients,
    currentClient,
    tags,
    filters,
    pagination,

    // Actions
    loadClients,
    loadClient,
    createNewClient,
    updateExistingClient,
    removeClient,
    loadTags,
    createNewTag,
    updateExistingTag,
    removeTag,
    addTagToExistingClient,
    removeTagFromExistingClient,
    updateFilters,
    clearFilters,
  }
}
