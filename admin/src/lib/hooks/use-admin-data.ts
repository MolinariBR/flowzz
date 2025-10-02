import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin-api'
import { useAdminStore } from '../stores/admin-store'
import { toast } from 'react-hot-toast'

export const useAdminMetrics = () => {
  const setMetrics = useAdminStore((state) => state.setMetrics)
  
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminApi.getMetrics,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 minutos
    onSuccess: (data) => {
      setMetrics(data)
    }
  })
}

export const useUserGrowth = (period: number = 12) => {
  return useQuery({
    queryKey: ['user-growth', period],
    queryFn: () => adminApi.getUserGrowth(period),
    staleTime: 2 * 60 * 1000 // 2 minutos
  })
}

export const useRevenueData = (period: number = 12) => {
  return useQuery({
    queryKey: ['revenue-data', period],
    queryFn: () => adminApi.getRevenueData(period),
    staleTime: 2 * 60 * 1000
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
    queryFn: () => adminApi.getUsers(params),
    keepPreviousData: true
  })
}

export const useSuspendUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: adminApi.suspendUser,
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
      console.log('Impersonate token:', data.token)
    },
    onError: () => {
      toast.error('Erro ao gerar token de impersonificação')
    }
  })
}
