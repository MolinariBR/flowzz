import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { motion } from 'framer-motion'
import { useRevenueData } from '../../lib/hooks/use-admin-data'

export const RevenueChart: React.FC = () => {
  const { data: revenueData, isLoading } = useRevenueData()

  if (isLoading) {
    return (
      <div className="h-80 bg-admin-surface rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-admin-surface p-6 rounded-lg border border-gray-200"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Receita Mensal (MRR)</h3>
        <p className="text-sm text-gray-500">Evolução da receita recorrente</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [formatCurrency(value), 'MRR']}
          />
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMRR)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}