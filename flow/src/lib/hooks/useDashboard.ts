// src/lib/hooks/useDashboard.ts
// Hook para integração com Dashboard API

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
    getDashboardActivities,
    getDashboardChart,
    getDashboardMetrics,
    getTopClients,
    type ChartDataPoint,
    type DashboardActivity,
    type DashboardMetricsWithComparisons,
} from '../api/dashboard'

export const useDashboard = (isAuthenticated: boolean = false) => {
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<DashboardMetricsWithComparisons | null>(null)
  const [activities, setActivities] = useState<DashboardActivity[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [topClients, setTopClients] = useState<any[]>([])

  // Carregar métricas do dashboard
  const loadMetrics = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      console.log('useDashboard: No access token, skipping API call')
      return null
    }

    try {
      setIsLoading(true)
      const data = await getDashboardMetrics()
      setMetrics(data)
      return data
    } catch (error) {
      console.error('Error loading dashboard metrics:', error)
      toast.error('Erro ao carregar métricas do dashboard')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar atividades recentes
  const loadActivities = useCallback(async (limit: number = 10) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      console.log('useDashboard: No access token, skipping activities API call')
      return []
    }

    try {
      setIsLoading(true)
      const response = await getDashboardActivities(limit)
      setActivities(response.data)
      return response.data
    } catch (error) {
      console.error('Error loading dashboard activities:', error)
      toast.error('Erro ao carregar atividades do dashboard')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar dados do gráfico
  const loadChartData = useCallback(async (period: '7d' | '30d' | '90d' | '1y' = '30d') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      console.log('useDashboard: No access token, skipping chart API call')
      return null
    }

    try {
      setIsLoading(true)
      const response = await getDashboardChart(period)
      setChartData(response.data)
      return response
    } catch (error) {
      console.error('Error loading chart data:', error)
      toast.error('Erro ao carregar dados do gráfico')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar top clientes
  const loadTopClients = useCallback(async (limit: number = 10) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      console.log('useDashboard: No access token, skipping top clients API call')
      return []
    }

    try {
      setIsLoading(true)
      const data = await getTopClients(limit)
      setTopClients(data)
      return data
    } catch (error) {
      console.error('Error loading top clients:', error)
      toast.error('Erro ao carregar top clientes')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar todos os dados do dashboard
  const loadAllDashboardData = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      console.log('useDashboard: No access token, skipping all dashboard data API calls')
      return null
    }

    try {
      setIsLoading(true)
      const [metricsData, activitiesData, chartDataResponse, topClientsData] = await Promise.all([
        getDashboardMetrics(),
        getDashboardActivities(10),
        getDashboardChart('30d'),
        getTopClients(5),
      ])

      setMetrics(metricsData)
      setActivities(activitiesData.data)
      setChartData(chartDataResponse.data)
      setTopClients(topClientsData)

      return {
        metrics: metricsData,
        activities: activitiesData.data,
        chartData: chartDataResponse.data,
        topClients: topClientsData,
      }
    } catch (error) {
      console.error('Error loading all dashboard data:', error)
      toast.error('Erro ao carregar dados do dashboard')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar dados automaticamente quando o hook é usado
  useEffect(() => {
    console.log('useDashboard effect triggered, isAuthenticated:', isAuthenticated)
    if (isAuthenticated) {
      loadAllDashboardData()
    }
  }, [loadAllDashboardData, isAuthenticated])

  return {
    // State
    isLoading,
    metrics,
    activities,
    chartData,
    topClients,

    // Actions
    loadMetrics,
    loadActivities,
    loadChartData,
    loadTopClients,
    loadAllDashboardData,
  }
}