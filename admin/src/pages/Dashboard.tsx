import { motion } from 'framer-motion'
import { AlertCircle, DollarSign, TrendingUp, Users, UserX } from 'lucide-react'
import type React from 'react'
import { RevenueChart } from '../components/charts/revenue-chart'
import { UserGrowthChart } from '../components/charts/user-growth-chart'
import { MetricCard } from '../components/ui/metric-card'
import { useAdminMetrics } from '../lib/hooks/use-admin-data'

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading } = useAdminMetrics()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={`skeleton-${i + 1}`} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const activeUserPercentage = ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white"
      >
        <h1 data-testid="dashboard-heading" className="text-2xl font-bold">
          Dashboard Administrativo
        </h1>
        <p className="text-primary-100 mt-2">Visão geral das métricas do FlowZZ SaaS</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Usuários"
          value={metrics.totalUsers}
          change={+12}
          trend="up"
          icon={Users}
        />

        <MetricCard
          title="Usuários Ativos"
          value={`${metrics.activeUsers} (${activeUserPercentage}%)`}
          change={+8}
          trend="up"
          icon={TrendingUp}
        />

        <MetricCard
          title="MRR"
          value={metrics.mrr}
          change={+15}
          trend="up"
          icon={DollarSign}
          prefix="R$ "
        />

        <MetricCard
          title="Churn Rate"
          value={`${metrics.churnRate}%`}
          change={+0.3}
          trend="down"
          icon={UserX}
        />
      </div>

      {/* Secondary KPIs - SaaS Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="ARR"
          value={metrics.arr}
          change={+15}
          trend="up"
          icon={TrendingUp}
          prefix="R$ "
          suffix=" anual"
        />

        <MetricCard
          title="LTV"
          value={metrics.ltv}
          change={+8}
          trend="up"
          icon={DollarSign}
          prefix="R$ "
        />

        <MetricCard
          title="CAC"
          value={metrics.cac}
          change={-5}
          trend="down"
          icon={UserX}
          prefix="R$ "
        />

        <MetricCard
          title="Novos Usuários"
          value={metrics.newUsersThisMonth}
          change={+100}
          trend="up"
          icon={Users}
          suffix=" este mês"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart />
        <RevenueChart />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-admin-surface p-6 rounded-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-left"
          >
            <Users className="w-6 h-6 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900">Gerenciar Usuários</h4>
            <p className="text-sm text-gray-500">Ver lista completa de usuários</p>
          </button>

          <button
            type="button"
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Relatórios</h4>
            <p className="text-sm text-gray-500">Gerar relatórios detalhados</p>
          </button>

          <button
            type="button"
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
          >
            <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Alertas</h4>
            <p className="text-sm text-gray-500">Configurar notificações</p>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
