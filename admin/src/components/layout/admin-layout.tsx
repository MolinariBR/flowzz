import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { useAdminStore } from '../../lib/stores/admin-store'

export const AdminLayout: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAdminStore()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      } else {
        setSidebarCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarCollapsed])

  return (
    <div className="h-screen bg-admin-background flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar collapsed={sidebarCollapsed} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarCollapsed && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  )
}
