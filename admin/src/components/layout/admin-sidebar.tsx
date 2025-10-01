// Referência: design.md §Admin Layout, user-stories.md Story 7.1, implement.md §Frontend Admin
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Button,
  Card,
  Link,
  Avatar,
  Chip,
  Tooltip,
} from '@heroui/react'
// Ícones temporários como texto - substituir por @heroicons/react quando disponível
const HomeIcon = ({ className }: { className?: string }) => <span className={className}>🏠</span>
const UsersIcon = ({ className }: { className?: string }) => <span className={className}>👥</span>
const ChartBarIcon = ({ className }: { className?: string }) => <span className={className}>📊</span>
const CogIcon = ({ className }: { className?: string }) => <span className={className}>⚙️</span>
const MagnifyingGlassIcon = ({ className }: { className?: string }) => <span className={className}>🔍</span>
const BellIcon = ({ className }: { className?: string }) => <span className={className}>🔔</span>
const XMarkIcon = ({ className }: { className?: string }) => <span className={className}>✕</span>
import { useAuthStore } from '@/lib/stores/auth-store'

interface NavItem {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  children?: NavItem[]
  adminOnly?: boolean
  superAdminOnly?: boolean
}

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navigationItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    key: 'metrics',
    label: 'Métricas SaaS',
    href: '/metrics',
    icon: ChartBarIcon,
    children: [
      { key: 'metrics-overview', label: 'Visão Geral', href: '/metrics', icon: ChartBarIcon },
      { key: 'metrics-revenue', label: 'Receita', href: '/metrics/revenue', icon: ChartBarIcon },
      { key: 'metrics-users', label: 'Usuários', href: '/metrics/users', icon: UsersIcon },
      { key: 'metrics-churn', label: 'Churn Analysis', href: '/metrics/churn', icon: ChartBarIcon },
    ],
  },
  {
    key: 'users',
    label: 'Gestão de Usuários',
    href: '/users',
    icon: UsersIcon,
    children: [
      { key: 'users-list', label: 'Lista de Usuários', href: '/users', icon: UsersIcon },
      { key: 'users-subscriptions', label: 'Assinaturas', href: '/users/subscriptions', icon: UsersIcon },
      { key: 'users-support', label: 'Tickets Suporte', href: '/users/support', icon: UsersIcon },
    ],
  },
  {
    key: 'audit',
    label: 'Auditoria',
    href: '/audit',
    icon: MagnifyingGlassIcon,
    superAdminOnly: true,
    children: [
      { key: 'audit-logs', label: 'Logs do Sistema', href: '/audit/logs', icon: MagnifyingGlassIcon },
      { key: 'audit-activities', label: 'Atividades', href: '/audit/activities', icon: MagnifyingGlassIcon },
    ],
  },
  {
    key: 'settings',
    label: 'Configurações',
    href: '/settings',
    icon: CogIcon,
    children: [
      { key: 'settings-general', label: 'Geral', href: '/settings', icon: CogIcon },
      { key: 'settings-integrations', label: 'Integrações', href: '/settings/integrations', icon: CogIcon },
      { key: 'settings-notifications', label: 'Notificações', href: '/settings/notifications', icon: BellIcon },
      { key: 'settings-admin', label: 'Administradores', href: '/settings/admin', icon: UsersIcon, superAdminOnly: true },
    ],
  },
]

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard'])
  const pathname = usePathname()
  const { user } = useAuthStore()

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key)
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }

  const filterItemsByRole = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (item.superAdminOnly && user?.role !== 'SUPER_ADMIN') return false
      if (item.adminOnly && !['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) return false
      
      if (item.children) {
        item.children = filterItemsByRole(item.children)
      }
      
      return true
    })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  const isExpanded = (key: string) => expandedItems.includes(key)

  const filteredItems = filterItemsByRole(navigationItems)

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
          onClick={onToggle}
          onKeyDown={(e) => e.key === 'Escape' && onToggle()}
          aria-label="Fechar sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-72
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">FlowZZ</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          
          <Button
            isIconOnly
            variant="light"
            className="lg:hidden"
            onClick={onToggle}
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <Card className="p-3 bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar
                size="sm"
                name={user?.nome}
                src={user?.avatar}
                className="bg-primary-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nome}
                </p>
                <div className="flex items-center gap-2">
                  <Chip
                    size="sm"
                    color={user?.role === 'SUPER_ADMIN' ? 'secondary' : 'primary'}
                    variant="flat"
                    className="text-xs"
                  >
                    {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                  </Chip>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.key}>
              {/* Main Item */}
              <div className="relative">
                {item.children ? (
                  <Button
                    variant="light"
                    className={`
                      w-full justify-start gap-3 h-auto p-3 font-medium
                      ${isActive(item.href) ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                    onClick={() => toggleExpanded(item.key)}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Chip size="sm" color="danger" variant="flat">
                        {item.badge}
                      </Chip>
                    )}
                    <div
                      className={`
                        w-4 h-4 transition-transform
                        ${isExpanded(item.key) ? 'rotate-90' : ''}
                      `}
                    >
                      ▶
                    </div>
                  </Button>
                ) : (
                  <Tooltip content={item.label} placement="right" className="lg:hidden">
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg font-medium transition-colors
                        ${isActive(item.href) 
                          ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Chip size="sm" color="danger" variant="flat">
                          {item.badge}
                        </Chip>
                      )}
                    </Link>
                  </Tooltip>
                )}
              </div>

              {/* Submenu */}
              {item.children && isExpanded(item.key) && (
                <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-100 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={`
                        flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive(child.href)
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <child.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>FlowZZ Admin v1.0</p>
            <p>© 2025 FlowZZ</p>
          </div>
        </div>
      </aside>
    </>
  )
}