// /app/(vendor)/vendor/layout.tsx

import { getCurrentUser } from '@/app/services/auth-service'
import { redirect } from 'next/navigation'
import VendorShell from '@/app/components/vendor/VendorShell'
import { IUser } from '@/app/types'

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Explicitly typing the returned user
  const user: IUser | null = await getCurrentUser()

  // Guard clause using the IUser role types
  if (!user || !['vendor', 'admin'].includes(user.role)) {
    redirect('/')
  }

  // Passing the typed user to the shell
  return <VendorShell user={JSON.parse(JSON.stringify(user))}>{children}</VendorShell>
}
