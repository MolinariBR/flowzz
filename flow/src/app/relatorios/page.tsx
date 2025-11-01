'use client'

import { motion } from 'framer-motion'
import { BarChart3, Clock, DollarSign, Download, FileText, Target, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ChartContainer } from '@/components/shared/ChartContainer'
import { FilterBar } from '@/components/shared/FilterBar'
import { MetricCard } from '@/components/shared/MetricCard'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useReports } from '@/lib/hooks/useReports'

export default function Relatorios() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  // Verificar autenticação
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    console.log('Relatorios auth check:', { isAuthenticated, authLoading })
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to login from relatorios...')
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  const { reports, isLoading, fetchReports, exportReport } = useReports()

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'vendas', name: 'Vendas' },
    { id: 'financeiro', name: 'Financeiro' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'clientes', name: 'Clientes' },
    { id: 'performance', name: 'Performance' },
  ]

  const periods = [
    { id: '7d', name: 'Últimos 7 dias' },
    { id: '30d', name: 'Últimos 30 dias' },
    { id: '90d', name: 'Últimos 3 meses' },
    { id: '1y', name: 'Último ano' },
  ]

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports({
        period: selectedPeriod,
        category: selectedCategory !== 'todos' ? selectedCategory : undefined,
      })
    }
  }, [selectedPeriod, selectedCategory, fetchReports, isAuthenticated])

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const aggregatedMetrics = reports.reduce(
    (acc, report) => ({
      totalRevenue: acc.totalRevenue + (report.metrics?.revenue || 0),
      totalSales: acc.totalSales + (report.metrics?.sales || 0),
      avgConversion: acc.avgConversion + (report.metrics?.conversion || 0),
      avgTicket: acc.avgTicket + (report.metrics?.avgTicket || 0),
    }),
    { totalRevenue: 0, totalSales: 0, avgConversion: 0, avgTicket: 0 }
  )

  const avgConversion = reports.length > 0 ? aggregatedMetrics.avgConversion / reports.length : 0
  const avgTicket = reports.length > 0 ? aggregatedMetrics.avgTicket / reports.length : 0

  const handleExport = async (reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    await exportReport(reportId, format)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada do desempenho do seu negócio</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Receita Total"
            value={formatCurrency(aggregatedMetrics.totalRevenue)}
            change="+12.5%"
            trend="up"
            icon={DollarSign}
            color="green"
            loading={isLoading}
          />
          <MetricCard
            title="Total de Vendas"
            value={aggregatedMetrics.totalSales}
            change="+8.2%"
            trend="up"
            icon={TrendingUp}
            color="blue"
            loading={isLoading}
          />
          <MetricCard
            title="Taxa de Conversão"
            value={formatPercent(avgConversion)}
            change="+2.1%"
            trend="up"
            icon={Target}
            color="purple"
            loading={isLoading}
          />
          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(avgTicket)}
            change="+5.7%"
            trend="up"
            icon={BarChart3}
            color="indigo"
            loading={isLoading}
          />
        </motion.div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          periods={periods}
          showExport={false}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={`loading-${item}`}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : filteredReports.length > 0 ? (
            filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Receita:</span>
                    <span className="font-medium">
                      {formatCurrency(report.metrics?.revenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vendas:</span>
                    <span className="font-medium">{report.metrics?.sales || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversão:</span>
                    <span className="font-medium">
                      {formatPercent(report.metrics?.conversion || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(report.generatedAt).toLocaleDateString('pt-BR')}</span>
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleExport(report.id, 'pdf')}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                    >
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport(report.id, 'excel')}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                    >
                      <Download className="h-4 w-4" />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum relatório encontrado
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Tente ajustar os filtros de busca'
                  : 'Os relatórios serão gerados automaticamente com base nos seus dados'}
              </p>
            </div>
          )}
        </motion.div>

        {reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <ChartContainer
              title="Tendências de Receita"
              data={reports.flatMap((report) => report.chartData || [])}
              type="area"
              dataKeys={{ x: 'date', y: 'revenue' }}
              height={300}
              loading={isLoading}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
