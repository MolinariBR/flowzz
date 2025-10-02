import React from 'react'
import {LucideIcon, TrendingUp, TrendingDown} from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  prefix?: string
  suffix?: string
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  prefix = '',
  suffix = '',
  className
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`
      }
      return val.toLocaleString('pt-BR')
    }
    return val
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-danger'
      default:
        return 'text-gray-500'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return TrendingUp
      case 'down':
        return TrendingDown
      default:
        return null
    }
  }

  const TrendIcon = getTrendIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'bg-admin-surface border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        
        {change !== undefined && TrendIcon && (
          <div className={clsx('flex items-center space-x-1', getTrendColor())}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">
          {prefix}{formatValue(value)}{suffix}
        </div>
        
        {change !== undefined && (
          <p className="text-sm text-gray-500">
            {trend === 'up' ? 'Aumento' : trend === 'down' ? 'Redução' : 'Variação'} em relação ao mês anterior
          </p>
        )}
      </div>
    </motion.div>
  )
}
