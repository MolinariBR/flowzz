'use client'

import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  FileText,
  MessageCircle,
  Users,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

  // Mock data
  const salesData = [
    { name: 'Jan', vendas: 4000, gastos: 2400, lucro: 1600 },
    { name: 'Fev', vendas: 3000, gastos: 1398, lucro: 1602 },
    { name: 'Mar', vendas: 2000, gastos: 9800, lucro: -7800 },
    { name: 'Abr', vendas: 2780, gastos: 3908, lucro: -1128 },
    { name: 'Mai', vendas: 1890, gastos: 4800, lucro: -2910 },
    { name: 'Jun', vendas: 2390, gastos: 3800, lucro: -1410 },
    { name: 'Jul', vendas: 3490, gastos: 4300, lucro: -810 },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'sale',
      message: 'Nova venda de R$ 297,00',
      time: '2 min atrás',
      client: 'Maria Silva',
    },
    {
      id: 2,
      type: 'payment',
      message: 'Pagamento recebido R$ 150,00',
      time: '5 min atrás',
      client: 'João Santos',
    },
    {
      id: 3,
      type: 'delivery',
      message: 'Produto entregue',
      time: '12 min atrás',
      client: 'Ana Costa',
    },
    {
      id: 4,
      type: 'ad',
      message: 'Campanha Facebook ativada',
      time: '25 min atrás',
      client: 'Sistema',
    },
  ]

  const upcomingPayments = [
    { id: 1, client: 'Carlos Oliveira', amount: 297, date: '15/10', days: 2 },
    { id: 2, client: 'Fernanda Lima', amount: 150, date: '16/10', days: 3 },
    { id: 3, client: 'Roberto Silva', amount: 450, date: '18/10', days: 5 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-600 mt-1">Visão geral do seu negócio de afiliados</p>
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
          value="R$ 1.247,00"
          change="+12,5%"
          icon={DollarSign}
          color="bg-gradient-to-r from-green-500 to-emerald-600"
          trend="up"
        />
        <MetricCard
          title="Gasto em Anúncios"
          value="R$ 340,50"
          change="-8,2%"
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-500 to-indigo-600"
          trend="down"
        />
        <MetricCard
          title="Lucro Líquido"
          value="R$ 906,50"
          change="+15,3%"
          icon={DollarSign}
          color="bg-gradient-to-r from-purple-500 to-pink-600"
          trend="up"
        />
        <MetricCard
          title="Pagamentos Agendados"
          value="R$ 2.450,00"
          change="+5,7%"
          icon={DollarSign}
          color="bg-gradient-to-r from-amber-500 to-orange-600"
          trend="up"
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
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
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

          {/* Upcoming Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-card"
          >
            <h3 className="font-semibold text-slate-900 mb-4">Próximos Vencimentos</h3>
            <div className="space-y-3">
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{payment.client}</p>
                    <p className="text-xs text-slate-600">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-slate-900">
                      R$ {payment.amount}
                    </p>
                    <p className="text-xs text-amber-600">{payment.days} dias</p>
                  </div>
                </div>
              ))}
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
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
                            : activity.type === 'delivery'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {activity.type === 'sale' && <DollarSign className="h-4 w-4" />}
                      {activity.type === 'payment' && <CreditCard className="h-4 w-4" />}
                      {activity.type === 'delivery' && <Users className="h-4 w-4" />}
                      {activity.type === 'ad' && <Zap className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                      <p className="text-xs text-slate-600">
                        {activity.client} • {activity.time}
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
