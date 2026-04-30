// app/admin/team/page.tsx
import { getAdminStaff } from '@/app/services/adminService'
import TeamClient from '@/app/components/admin/team/TeamClient'

export default async function TeamPage() {
  const initialStaff = await getAdminStaff()

  return <TeamClient initialStaff={initialStaff} />
}
