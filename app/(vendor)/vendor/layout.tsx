// /app/(vendor)/vendor/layout.tsx

import { getCurrentUser } from '@/app/services/auth-service'
import { redirect } from 'next/navigation'
import VendorShell from '@/app/components/vendor/VendorShell'

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Admins can view vendor pages, but customers/editors cannot.
  if (!user || !['vendor', 'admin'].includes(user.role)) {
    redirect('/')
  }

  return <VendorShell user={user}>{children}</VendorShell>
}