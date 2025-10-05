import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type AdminMetrics } from '../api/admin-api'
import { toast } from 'react-hot-toast'

export const useAdminMetrics = () => {
  return useQuery<AdminMetrics>({
    queryKey: ['admin-metrics'],
    queryFn: adminApi.getMetrics,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 minutos
  })
}

export const useUserGrowth = (period: number = 12) => {
  return useQuery({
    queryKey: ['user-growth', period],
    queryFn: () => adminApi.getUsersGrowth(period),
    staleTime: 2 * 60 * 1000 // 2 minutos
  })
}

// Mock temporário para useRevenueData - TODO: Implementar endpoint backend
export const useRevenueData = () => {
  return useQuery({
    queryKey: ['revenue-data'],
    queryFn: async () => {
      // Mock data temporário
      return [
        { month: 'Jan', mrr: 0 },
        { month: 'Fev', mrr: 0 },
        { month: 'Mar', mrr: 0 },
        { month: 'Abr', mrr: 0 },
        { month: 'Mai', mrr: 0 },
        { month: 'Jun', mrr: 0 },
      ]
    },
    staleTime: 5 * 60 * 1000
  })
}

export const useUsers = (params: {
  page?: number
  search?: string
  plan?: string
  status?: string
} = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => adminApi.listUsers(params)
  })
}

export const useSuspendUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => 
      adminApi.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
      toast.success('Usuário suspenso com sucesso')
    },
    onError: () => {
      toast.error('Erro ao suspender usuário')
    }
  })
}

export const useReactivateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: adminApi.reactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
      toast.success('Usuário reativado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao reativar usuário')
    }
  })
}

export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: adminApi.impersonateUser,
    onSuccess: (data) => {
      toast.success('Token de impersonificação gerado')
      // Aqui você pode redirecionar para o app principal com o token
      console.log('Impersonate token:', data.access_token)
    },
    onError: () => {
      toast.error('Erro ao gerar token de impersonificação')
    }
  })
}
