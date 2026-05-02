//  /app/(vendor)/vendor/settings/page.tsx

import { Box, Title } from '@mantine/core'
import { getCurrentUser } from '@/app/services/auth-service'
import VendorSettingsForm from './VendorSettingsForm'

export default async function VendorSettingsPage() {
  const user = await getCurrentUser()

  // Cast the profile to Serialized to avoid ObjectId errors
  const profile = user?.vendorProfile
    ? JSON.parse(JSON.stringify(user.vendorProfile))
    : undefined

  return (
    <Box maw={900}>
      <Title order={2} fw={800} mb="xl">
        Shop Management
      </Title>

      <VendorSettingsForm initialData={profile} />
    </Box>
  )
}