// Referência: design.md §Admin Layout, user-journeys.md Ana's Journey, implement.md §Frontend Admin
'use client'

import { useState } from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Link,
  Chip,
} from '@heroui/react'
import { useAuthStore } from '@/lib/stores/auth-store'
import AdminSidebar from './admin-sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

// Ícones temporários
const Bars3Icon = ({ className }: { className?: string }) => <span className={className}>☰</span>
const BellIcon = ({ className }: { className?: string }) => <span className={className}>�</span>

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <Navbar
        className="bg-white border-b border-gray-200 lg:pl-72"
        maxWidth="full"
        height="64px"
      >
        <NavbarContent>
          {/* Mobile Menu Button */}
          <NavbarItem className="lg:hidden">
            <Button
              isIconOnly
              variant="light"
              onClick={toggleSidebar}
              aria-label="Abrir menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </Button>
          </NavbarItem>

          {/* Mobile Brand */}
          <NavbarBrand className="lg:hidden">
            <Link href="/dashboard" className="font-bold text-xl text-primary">
              FlowZZ Admin
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end">
          {/* Notifications */}
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              className="relative"
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </NavbarItem>

          {/* User Menu */}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button variant="light" className="p-0 min-w-0 h-auto">
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-900">
                        {user?.nome}
                      </span>
                      <Chip
                        size="sm"
                        color={user?.role === 'SUPER_ADMIN' ? 'secondary' : 'primary'}
                        variant="flat"
                        className="text-xs"
                      >
                        {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </Chip>
                    </div>
                    <Avatar
                      size="sm"
                      name={user?.nome}
                      src={user?.avatar}
                      className="bg-primary-100"
                    />
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-medium">Logado como</p>
                  <p className="font-medium text-primary">{user?.email}</p>
                </DropdownItem>
                <DropdownItem key="settings" href="/settings">
                  ⚙️ Configurações
                </DropdownItem>
                <DropdownItem key="help" href="/help">
                  ❓ Ajuda
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  color="danger"
                  onClick={logout}
                >
                  🚪 Sair
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <main className="lg:ml-72 pt-16">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}