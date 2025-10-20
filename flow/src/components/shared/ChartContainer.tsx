// src/components/shared/ChartContainer.tsx
// Componente reutilizável para gráficos com Recharts

import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ChartData {
  [key: string]: any
}

interface ChartContainerProps {
  title: string
  data: ChartData[]
  type: 'line' | 'area' | 'bar' | 'pie'
  dataKeys: {
    x: string
    y: string | string[]
  }
  colors?: string[]
  height?: number
  loading?: boolean
  emptyMessage?: string
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
]

export const ChartContainer = ({
  title,
  data,
  type,
  dataKeys,
  colors = COLORS,
  height = 300,
  loading = false,
  emptyMessage = 'Nenhum dado disponível',
}: ChartContainerProps) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className={`h-${height / 4} bg-gray-200 rounded`}></div>
        </div>
      </motion.div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">{emptyMessage}</div>
      </motion.div>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeys.x} />
            <YAxis />
            <Tooltip />
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                />
              ))
            ) : (
              <Line type="monotone" dataKey={dataKeys.y} stroke={colors[0]} strokeWidth={2} />
            )}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeys.x} />
            <YAxis />
            <Tooltip />
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={dataKeys.y}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeys.x} />
            <YAxis />
            <Tooltip />
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
              ))
            ) : (
              <Bar dataKey={dataKeys.y} fill={colors[0]} />
            )}
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={Array.isArray(dataKeys.y) ? dataKeys.y[0] : dataKeys.y}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name || index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          {renderChart() || <div>Nenhum gráfico disponível</div>}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
