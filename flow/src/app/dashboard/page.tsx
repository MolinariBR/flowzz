'use client'

import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  FileText,
  MessageCircle,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../../lib/contexts/AuthContext'
import { useDashboard } from '../../lib/hooks/useDashboard'

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend: 'up' | 'down'
}

const MetricCard = ({ title, value, change, icon: Icon, color, trend }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
    data-testid="metric-card"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 font-mono">{value}</p>
        <div
          className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
        >
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          <span className="font-medium">{change}</span>
          <span className="text-slate-500 ml-1">vs ontem</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </motion.div>
)

export default function Dashboard() {
  // State
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')

  // Verificar autenticação
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    console.log('Dashboard auth check:', { isAuthenticated, authLoading })
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to login from dashboard...')
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  // Hook para dados do dashboard
  const { isLoading, metrics, activities, chartData } = useDashboard(isAuthenticated)

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatar percentual
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Calcular tendência baseada no valor
  const getTrend = (value: number) => (value >= 0 ? 'up' : 'down')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-600 mt-1">Visão geral do seu negócio de afiliados</p>
          {isLoading && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span className="text-sm text-slate-500">Atualizando dados...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setPeriod('7d')}
              data-testid="period-7d"
              className={`px-4 py-2 transition-colors ${
                period === '7d' ? 'bg-indigo-500 text-white' : 'hover:bg-slate-50'
              }`}
            >
              7 dias
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30d')}
              data-testid="period-30d"
              className={`px-4 py-2 transition-colors ${
                period === '30d' ? 'bg-indigo-500 text-white' : 'hover:bg-slate-50'
              }`}
            >
              30 dias
            </button>
          </div>
          <button
            type="button"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            <span>Nova Venda</span>
          </button>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas Hoje"
          value={metrics ? formatCurrency(metrics.vendas_hoje) : 'R$ 0,00'}
          change={metrics ? formatPercentage(metrics.comparisons.vendas_hoje) : '0%'}
          icon={DollarSign}
          color="bg-gradient-to-r from-green-500 to-emerald-600"
          trend={metrics ? getTrend(metrics.comparisons.vendas_hoje) : 'up'}
        />
        <MetricCard
          title="Gasto em Anúncios"
          value={metrics ? formatCurrency(metrics.gasto_anuncios) : 'R$ 0,00'}
          change={metrics ? formatPercentage(metrics.comparisons.gasto_anuncios) : '0%'}
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-500 to-indigo-600"
          trend={metrics ? getTrend(metrics.comparisons.gasto_anuncios) : 'down'}
        />
        <MetricCard
          title="Lucro Líquido"
          value={metrics ? formatCurrency(metrics.lucro_liquido) : 'R$ 0,00'}
          change={metrics ? formatPercentage(metrics.comparisons.lucro_liquido) : '0%'}
          icon={DollarSign}
          color="bg-gradient-to-r from-purple-500 to-pink-600"
          trend={metrics ? getTrend(metrics.comparisons.lucro_liquido) : 'up'}
        />
        <MetricCard
          title="Pagamentos Agendados"
          value={metrics ? formatCurrency(metrics.pagamentos_agendados) : 'R$ 0,00'}
          change={metrics ? formatPercentage(metrics.comparisons.pagamentos_agendados) : '0%'}
          icon={DollarSign}
          color="bg-gradient-to-r from-amber-500 to-orange-600"
          trend={metrics ? getTrend(metrics.comparisons.pagamentos_agendados) : 'up'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Vendas vs Gastos</h3>
                <p className="text-sm text-slate-600">Análise de performance dos últimos 7 meses</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Vendas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Gastos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Lucro</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'vendas' ? 'Vendas' : name === 'gastos' ? 'Gastos' : 'Lucro'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="gastos"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:row-span-2">
          {/* Weather Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Humor do Negócio</h3>
              <div className="text-2xl">☀️</div>
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-90">Ensolarado</p>
              <p className="text-2xl font-bold">Excelente</p>
              <p className="text-sm opacity-75">ROI acima da média, vendas em alta</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-card"
          >
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                type="button"
                className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Enviar Cobrança WhatsApp</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Gerar Relatório</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <CreditCard className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Agendar Pagamento</span>
              </button>
            </div>
          </motion.div>

          {/* Top Clients Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-card"
          >
            <h3 className="font-semibold text-slate-900 mb-4">Top Clientes</h3>
            <div className="space-y-3">
              <div className="text-center py-4 text-slate-500">
                <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm">Em breve</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Atividades Recentes</h3>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === 'sale'
                          ? 'bg-green-100 text-green-600'
                          : activity.type === 'payment'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {activity.type === 'sale' && <DollarSign className="h-4 w-4" />}
                      {activity.type === 'payment' && <CreditCard className="h-4 w-4" />}
                      {activity.type === 'payment' && <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-600">
                        {activity.description} • {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-semibold text-slate-900">
                        {formatCurrency(activity.amount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
