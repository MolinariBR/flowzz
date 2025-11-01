'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import {
    Bell,
    ChevronRight,
    CreditCard,
    Crown,
    FileText,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    PieChart,
    Search,
    Settings,
    TrendingUp,
    User,
    Users,
    X,
    Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()

  // Páginas de autenticação não devem ter sidebar/menu
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/'

  if (isAuthPage) {
    return <>{children}</>
  }

  const handleLogout = async () => {
    logout()
    router.push('/login')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral dos seus dados',
    },
    { name: 'Clientes', href: '/clientes', icon: Users, description: 'Gestão de clientes' },
    { name: 'Anúncios', href: '/anuncios', icon: TrendingUp, description: 'Facebook Ads Manager' },
    {
      name: 'Integrações',
      href: '/integracoes',
      icon: Zap,
      description: 'Conecte suas ferramentas',
    },
    { name: 'Projeções', href: '/projecoes', icon: PieChart, description: 'Análise financeira' },
  ]

  const breadcrumbMap: Record<string, string> = {
    '/dashboard': 'Command Center',
    '/clientes': 'Customer Intelligence',
    '/anuncios': 'Facebook Ads Manager',
    '/integracoes': 'Connection Hub',
    '/projecoes': 'Financial Crystal Ball',
    '/relatorios': 'Reports Center',
    '/ajuda': 'Help Center',
    '/planos': 'Plans & Pricing',
    '/configuracoes': 'Settings',
  }

  const currentPage = breadcrumbMap[pathname] || 'Dashboard'

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSidebarOpen(false)
          }}
        />
      )}

      {/* Sidebar - Desktop sempre visível, Mobile com toggle */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="flex h-full flex-col">
          {/* Logo Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  FLOWZZ
                </span>
                <p className="text-xs text-slate-500 font-medium">Afiliado Pro</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="px-4 py-4 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700">Receita Hoje</span>
                </div>
                <p className="text-lg font-bold text-green-800 mt-1">R$ 2.847</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-700">Conversões</span>
                </div>
                <p className="text-lg font-bold text-blue-800 mt-1">23</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Principais
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="relative flex items-center w-full">
                      <item.icon
                        className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`}
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${isActive ? 'text-white' : 'text-slate-700'}`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {item.description}
                        </p>
                      </div>
                      {isActive && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Ações Rápidas
              </p>
              <div className="space-y-2">
                <Link
                  href="/relatorios"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Relatório
                </Link>
                <Link
                  href="/ajuda"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Ajuda
                </Link>
                <Link
                  href="/planos"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Planos
                </Link>
              </div>
            </div>
          </nav>

          {/* Upgrade Banner */}
          <div className="border-t border-slate-200 p-4">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Upgrade para Pro</p>
                  <p className="text-xs text-amber-600">Desbloqueie recursos avançados</p>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md"
              >
                Fazer Upgrade
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t border-slate-200 p-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex w-full items-center space-x-3 p-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-900">{user?.nome || 'Usuário'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'email@exemplo.com'}</p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-slate-400 transform transition-transform ${profileOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <Link
                    href="/configuracoes"
                    onClick={() => {
                      setProfileOpen(false)
                      setSidebarOpen(false)
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Moon className="h-4 w-4" />
                    <span>Modo Escuro</span>
                  </button>
                  <Link
                    href="/configuracoes"
                    onClick={() => {
                      setProfileOpen(false)
                      setSidebarOpen(false)
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                  <hr className="my-2 border-slate-200" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sair da Conta"
                    data-testid="logout-button"
                    className="flex w-full items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm">
                <span className="text-slate-500 font-medium">FLOWZZ</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900">{currentPage}</span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar clientes, vendas, relatórios..."
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-72 text-sm bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Notifications */}
              <button
                type="button"
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
              </button>

              {/* Quick Stats */}
              <div className="hidden xl:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
