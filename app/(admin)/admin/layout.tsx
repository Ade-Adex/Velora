// /app/(admin)/admin/layout.tsx
import { getCurrentUser } from '@/app/services/auth-service'
import { redirect } from 'next/navigation'
import AdminShell from '@/app/components/admin/AdminShell'
import { IUser, Serialized } from '@/app/types'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  // Pass the user to the client component
  return <AdminShell user={user as Serialized<IUser>}>{children}</AdminShell>
}
