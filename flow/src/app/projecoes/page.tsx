'use client'

import { ChartContainer } from '@/components/shared/ChartContainer'
import { FilterBar } from '@/components/shared/FilterBar'
import { MetricCard } from '@/components/shared/MetricCard'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useProjections } from '@/lib/hooks/useProjections'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    PiggyBank,
    Target,
    TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Projecoes() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedPeriod, setSelectedPeriod] = useState('3m')

  // Verificar autenticação
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    console.log('Projecoes auth check:', { isAuthenticated, authLoading })
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to login from projecoes...')
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  const { projections, goals, isLoading, fetchProjections } = useProjections()

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'vendas', name: 'Vendas' },
    { id: 'financeiro', name: 'Financeiro' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'operacional', name: 'Operacional' },
  ]

  const periods = [
    { id: '3m', name: 'Próximos 3 meses' },
    { id: '6m', name: 'Próximos 6 meses' },
    { id: '12m', name: 'Próximo ano' },
  ]

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjections(selectedPeriod)
    }
  }, [selectedPeriod, fetchProjections, isAuthenticated])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getGoalStatus = (percentage: number) => {
    if (percentage >= 100) return { color: 'text-green-600', icon: CheckCircle }
    if (percentage >= 75) return { color: 'text-amber-600', icon: Clock }
    return { color: 'text-red-600', icon: AlertTriangle }
  }

  const aggregatedMetrics = projections.reduce(
    (acc, projection) => ({
      totalRevenue: acc.totalRevenue + (projection.projectedValue || 0),
      totalExpenses: acc.totalExpenses + (projection.currentValue || 0),
      totalProfit:
        acc.totalProfit + ((projection.projectedValue || 0) - (projection.currentValue || 0)),
    }),
    { totalRevenue: 0, totalExpenses: 0, totalProfit: 0 }
  )

  const profitMargin =
    aggregatedMetrics.totalRevenue > 0
      ? (aggregatedMetrics.totalProfit / aggregatedMetrics.totalRevenue) * 100
      : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projeções</h1>
          <p className="text-gray-600">
            Visualize seu futuro financeiro com clareza e defina metas alcançáveis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Receita Projetada"
            value={formatCurrency(aggregatedMetrics.totalRevenue)}
            change="+15.2%"
            trend="up"
            icon={TrendingUp}
            color="green"
            loading={isLoading}
          />
          <MetricCard
            title="Gastos Projetados"
            value={formatCurrency(aggregatedMetrics.totalExpenses)}
            change="-5.8%"
            trend="down"
            icon={DollarSign}
            color="red"
            loading={isLoading}
          />
          <MetricCard
            title="Lucro Projetado"
            value={formatCurrency(aggregatedMetrics.totalProfit)}
            change="+22.4%"
            trend="up"
            icon={Target}
            color="blue"
            loading={isLoading}
          />
          <MetricCard
            title="Margem de Lucro"
            value={formatPercent(profitMargin)}
            change="+3.1%"
            trend="up"
            icon={PiggyBank}
            color="purple"
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
          showExport={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Projeções de Receita */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projeções de Receita</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {projections
                  .filter((p) => p.type === 'revenue')
                  .map((projection) => (
                    <div
                      key={projection.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{projection.title}</h4>
                        <p className="text-sm text-gray-600">
                          Crescimento: {formatPercent(projection.growthRate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(projection.projectedValue)}
                        </p>
                        <p className="text-sm text-gray-600">Confiança: {projection.confidence}%</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>

          {/* Metas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Metas Atuais</h3>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Nova Meta
              </button>
            </div>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progressPercent = (goal.currentValue / goal.targetValue) * 100
                  const status = getGoalStatus(progressPercent)

                  return (
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <status.icon className={`h-5 w-5 ${status.color}`} />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}
                        </span>
                        <span>{progressPercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Gráfico de Projeções */}
        {projections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <ChartContainer
              title="Fluxo de Caixa Projetado"
              data={projections.flatMap(
                (projection) =>
                  projection.chartData?.map((point) => ({
                    date: point.date,
                    revenue: point.projected,
                    expenses: point.actual,
                    profit: point.projected - point.actual,
                  })) || []
              )}
              type="area"
              dataKeys={{ x: 'date', y: 'revenue' }}
              height={400}
              loading={isLoading}
            />
          </motion.div>
        )}

        {/* Cenários de Projeção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cenários de Projeção</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projections.slice(0, 3).map((projection) => (
              <div key={projection.id} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{projection.title}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pessimista:</span>
                    <span className="font-medium">
                      {formatCurrency(projection.scenarios.pessimistic)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Realista:</span>
                    <span className="font-medium">
                      {formatCurrency(projection.scenarios.realistic)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Otimista:</span>
                    <span className="font-medium">
                      {formatCurrency(projection.scenarios.optimistic)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
