//  /app/(vendor)/vendor/profile/page.tsx

import { getCurrentUser } from '@/app/services/auth-service'
import VendorProfileClient from '@/app/components/vendor/VendorProfileClient'
import { redirect } from 'next/navigation'

export default async function PersonalProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <VendorProfileClient initialUser={JSON.parse(JSON.stringify(user))} />
}