import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {Menu, Bell, Search, ChevronRight, User, Settings, LogOut, X} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../lib/stores/auth-store'
import { useAdminStore } from '../../lib/stores/admin-store'
import type { Notification } from '../../types/admin'

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Churn Rate Alto',
    message: 'Taxa subiu para 8.5% (acima de 7%)',
    actionUrl: '/metrics/users',
    timestamp: new Date(),
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Integração Facebook Falhou',
    message: '3 usuários com erro de sincronização',
    timestamp: new Date(Date.now() - 3600000),
    read: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Novo usuário Premium',
    message: 'João Silva atualizou para plano Premium',
    timestamp: new Date(Date.now() - 7200000),
    read: true
  }
]

export const AdminTopbar: React.FC = () => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useAdminStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Admin', href: '/dashboard' }]

    pathSegments.forEach((segment, index) => {
      // Pular 'dashboard' se for o primeiro segmento (já está em 'Admin')
      if (segment === 'dashboard' && index === 0) {
        return
      }
      
      const href = '/' + pathSegments.slice(0, index + 1).join('/')
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      
      // Customize labels
      switch (segment) {
        case 'dashboard':
          label = 'Dashboard'
          break
        case 'metrics':
          label = 'Métricas SaaS'
          break
        case 'users':
          label = 'Usuários'
          break
        case 'integrations':
          label = 'Integrações'
          break
        case 'revenue':
          label = 'Receita'
          break
      }

      breadcrumbs.push({ label, href })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const unreadCount = mockNotifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    const baseClasses = "w-2 h-2 rounded-full"
    switch (type) {
      case 'danger':
        return <div className={`${baseClasses} bg-danger`} />
      case 'warning':
        return <div className={`${baseClasses} bg-warning`} />
      case 'success':
        return <div className={`${baseClasses} bg-success`} />
      default:
        return <div className={`${baseClasses} bg-primary-500`} />
    }
  }

  return (
    <header className="bg-admin-surface border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              <Link
                to={crumb.href}
                className={`hover:text-primary-600 transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Notificações</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    Ver todas as notificações
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    <User className="w-4 h-4" />
                    <span>Perfil</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
