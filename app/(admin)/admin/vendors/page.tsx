// app/(admin)/admin/vendors/page.tsx

export const dynamic = 'force-dynamic'


import { Title, Text, Container, Stack } from '@mantine/core'
import { getPendingVendors } from '@/app/services/adminService'
import VendorVerificationTable from '@/app/components/admin/vendors/VendorVerificationTable'

export const metadata = {
  title: 'Vendor Verification | Velora Admin',
}

export default async function VendorVerificationPage() {
  const pendingVendors = await getPendingVendors()

  return (
    <div className="p-2">
      <Stack gap="lg">
        <div>
          <Title order={2} fz="28px" fw={900}>
            Vendor Verification
          </Title>
          <Text c="dimmed" fz="sm">
            Review and approve shop applications from new sellers.
          </Text>
        </div>

        <VendorVerificationTable initialVendors={pendingVendors} />
      </Stack>
    </div>
  )
}
