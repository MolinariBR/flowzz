// Referência: design.md §Admin Pages, user-stories.md Story 7.1
import type { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import AdminLayout from '@/components/layout/admin-layout'
import MetricsContent from '@/components/metrics/metrics-content'

export const metadata: Metadata = {
  title: 'Métricas SaaS - FlowZZ Admin',
  description: 'Análise detalhada de métricas SaaS: MRR, ARR, Churn, LTV, CAC',
}

export default function MetricsPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <MetricsContent />
      </AdminLayout>
    </AuthGuard>
  )
}