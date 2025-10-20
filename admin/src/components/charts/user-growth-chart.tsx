import { motion } from 'framer-motion'
import type React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useUserGrowth } from '../../lib/hooks/use-admin-data'

export const UserGrowthChart: React.FC = () => {
  const { data: userGrowth, isLoading } = useUserGrowth()

  if (isLoading) {
    return (
      <div className="h-80 bg-admin-surface rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-admin-surface p-6 rounded-lg border border-gray-200"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Crescimento de Usuários</h3>
        <p className="text-sm text-gray-500">Últimos 6 meses</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={userGrowth}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Total de Usuários"
          />
          <Line
            type="monotone"
            dataKey="active"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Usuários Ativos"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
