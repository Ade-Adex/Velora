// /app/(admin)/admin/layout.tsx

import { getCurrentUser } from '@/app/services/auth-service'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/app/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] isolation-auto">
      {/* Sidebar - Fixed */}
      <AdminSidebar />

      {/* Main Content: 
          Using a standard <main> tag instead of Mantine <Box> 
          here prevents style injection conflicts during hydration.
      */}
      <main className="flex-1 ml-64 min-h-screen p-8 relative">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}