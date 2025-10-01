// Referência: design.md §Admin Routing
import { redirect } from 'next/navigation'

export default function AdminHomePage() {
  redirect('/dashboard')
}
