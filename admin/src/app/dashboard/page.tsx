// Referência: design.md §Admin Dashboard, user-stories.md Story 7.1
import type { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import AdminLayout from '@/components/layout/admin-layout'
import DashboardContent from '@/components/dashboard/dashboard-content'

export const metadata: Metadata = {
  title: 'Dashboard - FlowZZ Admin',
  description: 'Painel administrativo do FlowZZ com métricas SaaS e gestão de usuários',
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <DashboardContent />
      </AdminLayout>
    </AuthGuard>
  )
}