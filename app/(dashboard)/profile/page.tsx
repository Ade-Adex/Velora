//  / app/(dashboard)/profile/page.tsx


import { getCurrentUser } from '@/app/services/auth-service'
import { getUserOrdersAction } from '@/app/services/user-actions'
import ProfileClient from '@/app/components/dashboard/ProfileClient'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  // 1. Fetch data on the server
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const ordersResponse = await getUserOrdersAction()
  const initialOrders = ordersResponse.success ? ordersResponse.orders : []

  // 2. Pass data to the Client Component
  return <ProfileClient initialUser={user} initialOrders={initialOrders} />
}