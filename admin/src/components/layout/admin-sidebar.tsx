import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {LayoutDashboard, TrendingUp, Users, Zap, Shield, ChevronDown, ChevronRight} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useAuthStore } from '../../lib/stores/auth-store'
import { useAdminStore } from '../../lib/stores/admin-store'
import type { NavigationItem } from '../../types/admin'

const navigationItems: NavigationItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    key: 'metrics',
    label: 'Métricas SaaS',
    icon: TrendingUp,
    children: [
      { key: 'overview', label: 'Visão Geral', href: '/metrics', icon: TrendingUp },
      { key: 'revenue', label: 'Receita (MRR/ARR)', href: '/metrics/revenue', icon: TrendingUp },
      { key: 'users', label: 'Usuários & Churn', href: '/metrics/users', icon: TrendingUp }
    ]
  },
  {
    key: 'users',
    label: 'Gestão Usuários',
    icon: Users,
    badge: 3,
    children: [
      { key: 'list', label: 'Lista Usuários', href: '/users', icon: Users },
      { key: 'subscriptions', label: 'Assinaturas', href: '/users/subscriptions', icon: Users },
      { key: 'support', label: 'Tickets Suporte', href: '/users/support', icon: Users }
    ]
  },
  {
    key: 'integrations',
    label: 'Integrações',
    icon: Zap,
    children: [
      { key: 'status', label: 'Status Geral', href: '/integrations', icon: Zap },
      { key: 'whatsapp', label: 'WhatsApp Business', href: '/whatsapp', icon: Zap },
      { key: 'coinzz', label: 'Coinzz API', href: '/integrations/coinzz', icon: Zap }
    ]
  },
  {
    key: 'audit',
    label: 'Auditoria',
    icon: Shield,
    href: '/audit',
    requiredRole: 'SUPER_ADMIN'
  }
]

interface AdminSidebarProps {
  collapsed?: boolean
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed = false }) => {
  const location = useLocation()
  const { role } = useAuthStore()
  const { sidebarCollapsed } = useAdminStore()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['metrics', 'users'])

  const isCollapsed = collapsed || sidebarCollapsed

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const canAccess = (item: NavigationItem) => {
    if (!item.requiredRole) return true
    return role === item.requiredRole || role === 'SUPER_ADMIN'
  }

  const renderNavItem = (item: NavigationItem, depth = 0) => {
    if (!canAccess(item)) return null

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.key)
    const active = isActive(item.href)

    return (
      <div key={item.key}>
        {item.href ? (
          <Link
            to={item.href}
            className={clsx(
              'flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              depth > 0 && 'ml-4',
              active
                ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-danger text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ) : (
          <button
            onClick={() => toggleExpanded(item.key)}
            className={clsx(
              'w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white',
              depth > 0 && 'ml-4'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-danger text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </>
            )}
          </button>
        )}

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1">
                {item.children?.map(child => renderNavItem(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ duration: 0.3 }}
      className="bg-admin-sidebar border-r border-gray-700 flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">FlowZZ</h1>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map(item => renderNavItem(item))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            FlowZZ Admin v2.5
          </div>
        </div>
      )}
    </motion.aside>
  )
}
