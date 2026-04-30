// /app/(admin)/admin/layout.tsx

import { getCurrentUser } from '@/app/services/auth-service'
import { redirect } from 'next/navigation'
import AdminShell from '@/app/components/admin/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}