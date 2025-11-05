import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Calendar, Eye, History, Mail, UserCheck, UserX } from 'lucide-react'
import type React from 'react'
import { useId, useState } from 'react'
import { DataTable } from '../components/ui/data-table'
import {
  useImpersonateUser,
  useReactivateUser,
  useSuspendUser,
  useUsers,
} from '../lib/hooks/use-admin-data'
import { useAuthStore } from '../lib/stores/auth-store'
import type { User } from '../types/admin'

export const Users: React.FC = () => {
  const { hydrated, isAuthenticated, token } = useAuthStore()
  const [filters, setFilters] = useState({
    search: '',
    plan: '',
    status: '',
  })

  const searchId = useId()
  const planId = useId()
  const statusId = useId()

  const { data: usersData, isLoading, error } = useUsers(filters)
  const suspendUser = useSuspendUser()
  const reactivateUser = useReactivateUser()
  const impersonateUser = useImpersonateUser()

  // Debug logs completos
  console.log('🔍 Users component debug:', {
    hydrated,
    isAuthenticated,
    hasToken: !!token,
    usersData: usersData ? { total: usersData.total, dataLength: usersData.data?.length } : null,
    isLoading,
    error: error?.message
  })

  // Remover detecção de ambiente de teste - não é mais necessário
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-500 mt-1">Carregando...</p>
          </div>
        </motion.div>

        <div className="bg-admin-surface rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Aguardando autenticação...</p>
        </div>
      </div>
    )
  }

  const handleSuspend = (userId: string) => {
    if (globalThis.confirm('Tem certeza que deseja suspender este usuário?')) {
      suspendUser.mutate({ userId, reason: 'Suspenso pelo administrador' })
    }
  }

  const handleReactivate = (userId: string) => {
    if (window.confirm('Tem certeza que deseja reativar este usuário?')) {
      reactivateUser.mutate(userId)
    }
  }

  const handleImpersonate = (userId: string) => {
    if (globalThis.confirm('Deseja acessar como este usuário?')) {
      impersonateUser.mutate(userId)
    }
  }

  const getStatusBadge = (status: User['status']) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Ativo</span>
      case 'suspended':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Suspenso</span>
      case 'cancelled':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Cancelado</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>
    }
  }

  const getPlanBadge = (plan: User['plan']) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
    switch (plan) {
      case 'trial':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Trial</span>
      case 'basic':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Basic</span>
      case 'pro':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Pro</span>
      case 'premium':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Premium</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{plan}</span>
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Usuário',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {row.original.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: 'Plano',
      cell: ({ row }) => getPlanBadge(row.original.plan),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'mrr',
      header: 'MRR',
      cell: ({ row }) => (
        <span className="font-medium">R$ {row.original.mrr.toLocaleString('pt-BR')}</span>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Último Login',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{format(row.original.lastLogin, 'dd/MM/yyyy', { locale: ptBR })}</div>
          <div className="text-gray-500">{format(row.original.lastLogin, 'HH:mm')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'signupDate',
      header: 'Cadastro',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(row.original.signupDate, 'dd/MM/yyyy', { locale: ptBR })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleImpersonate(row.original.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Impersonificar usuário"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>

          {row.original.status === 'active' ? (
            <button
              type="button"
              onClick={() => handleSuspend(row.original.id)}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Suspender usuário"
            >
              <UserX className="w-4 h-4 text-red-600" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleReactivate(row.original.id)}
              className="p-1 hover:bg-green-100 rounded transition-colors"
              title="Reativar usuário"
            >
              <UserCheck className="w-4 h-4 text-green-600" />
            </button>
          )}

          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Ver histórico"
          >
            <History className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-500 mt-1">Gerencie todos os usuários da plataforma FlowZZ</p>
        </div>

        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Exportar Lista
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-admin-surface p-4 rounded-lg border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor={searchId} className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              id={searchId}
              type="text"
              placeholder="Nome ou email..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor={planId} className="block text-sm font-medium text-gray-700 mb-1">
              Plano
            </label>
            <select
              id={planId}
              value={filters.plan}
              onChange={(e) => setFilters((prev) => ({ ...prev, plan: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os planos</option>
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label htmlFor={statusId} className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id={statusId}
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setFilters({ search: '', plan: '', status: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-admin-surface p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{usersData?.total || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-admin-surface p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {usersData?.data.filter((u) => u.status === 'active').length || 0}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-admin-surface p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suspensos</p>
              <p className="text-2xl font-bold text-red-600">
                {usersData?.data.filter((u) => u.status === 'suspended').length || 0}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-admin-surface p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Este Mês</p>
              <p className="text-2xl font-bold text-purple-600">23</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="bg-admin-surface rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando usuários...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
            <p className="text-red-600">Erro ao carregar usuários: {error.message}</p>
          </div>
        ) : !usersData?.data || usersData.data.length === 0 ? (
          <div className="bg-admin-surface rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <DataTable
            data={usersData.data}
            columns={columns}
            searchPlaceholder="Buscar usuários..."
            filters={['plan', 'status']}
            pagination={true}
          />
        )}
      </motion.div>
    </div>
  )
}
