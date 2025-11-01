// src/lib/hooks/useFacebookAds.ts
// Hook para integração com Facebook Ads API

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { facebookApi } from '../api/facebook'
import type {
  FacebookCallbackResponse,
  FacebookInsightsParams,
  FacebookInsightsResponse,
  FacebookIntegrationStatus,
  FacebookSyncResponse,
} from '../types/facebook'

export const useFacebookAds = (isAuthenticated: boolean = false) => {
  const [isLoading, setIsLoading] = useState(false)
  const [integrationStatus, setIntegrationStatus] = useState<FacebookIntegrationStatus | null>(null)
  const router = useRouter()

  // Verificar status da integração
  const checkStatus = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      console.log('useFacebookAds: No access token, skipping status check')
      return null
    }

    try {
      setIsLoading(true)
      const data = await facebookApi.getStatus()
      setIntegrationStatus(data)
      return data
    } catch (error) {
      console.error('Error checking Facebook status:', error)
      toast.error('Erro ao verificar status do Facebook Ads')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Iniciar conexão OAuth
  const connect = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await facebookApi.connect()
      // Redirecionar para URL de autorização do Facebook
      window.location.href = data.authorizationUrl
    } catch (error) {
      console.error('Error connecting to Facebook:', error)
      toast.error('Erro ao conectar com Facebook Ads')
      setIsLoading(false)
    }
  }, [])

  // Buscar insights
  const getInsights = useCallback(
    async (params: FacebookInsightsParams): Promise<FacebookInsightsResponse | null> => {
      try {
        setIsLoading(true)
        const data = await facebookApi.getInsights(params)
        return data
      } catch (error) {
        console.error('Error fetching Facebook insights:', error)
        toast.error('Erro ao buscar dados do Facebook Ads')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Sincronizar dados manualmente
  const syncData = useCallback(async (): Promise<FacebookSyncResponse | null> => {
    try {
      setIsLoading(true)
      const data = await facebookApi.sync()
      toast.success(data.message)
      return data
    } catch (error) {
      console.error('Error syncing Facebook data:', error)
      toast.error('Erro ao sincronizar dados do Facebook Ads')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Desconectar integração
  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true)
      await facebookApi.disconnect()
      setIntegrationStatus(null)
      toast.success('Integração com Facebook Ads desconectada')
    } catch (error) {
      console.error('Error disconnecting Facebook:', error)
      toast.error('Erro ao desconectar Facebook Ads')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Processar callback OAuth (chamado automaticamente na página de callback)
  const handleCallback = useCallback(
    async (code: string, state: string): Promise<FacebookCallbackResponse | null> => {
      try {
        setIsLoading(true)
        const data = await facebookApi.callback(code, state)

        if (data.success) {
          toast.success('Facebook Ads conectado com sucesso!')
          // Recarregar status da integração
          await checkStatus()
          // Redirecionar para dashboard de anúncios
          router.push('/anuncios')
        } else {
          toast.error(data.message || 'Erro ao conectar Facebook Ads')
        }

        return data
      } catch (error) {
        console.error('Error processing Facebook callback:', error)
        toast.error('Erro ao processar callback do Facebook')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [checkStatus, router]
  )

  // Carregar status inicial
  useEffect(() => {
    if (isAuthenticated) {
      checkStatus()
    }
  }, [checkStatus, isAuthenticated])

  return {
    isLoading,
    integrationStatus,
    connect,
    disconnect,
    getInsights,
    syncData,
    handleCallback,
    refreshStatus: checkStatus,
  }
}
