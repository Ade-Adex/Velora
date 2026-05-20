// /app/(vendor)/vendor/orders/page.tsx


export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Box, Title, Text, Stack } from '@mantine/core'
import { getVendorOrders } from '@/app/services/vendor-service'
import { getCurrentUser } from '@/app/services/auth-service'
import { RealtimeVendorTable } from '@/app/components/vendor/RealtimeVendorTable'

export default async function VendorOrdersPage() {
  const user = await getCurrentUser()
  const orders = await getVendorOrders()

  if (!user) return null

  const serializedOrders = JSON.parse(JSON.stringify(orders))
  const serializedUser = JSON.parse(JSON.stringify(user))

  return (
    <Box p={{ base: '4px', sm: '4px', lg: '4px' }}>
      <Stack mb="xl" gap={4}>
        <Title order={2} fw={900} lts="-1px" fz={{ base: 'xl', sm: '24px' }}>
          Order Fulfillment
        </Title>
        <Text c="dimmed" size="sm">
          Manage your shipments and track your net earnings per order.
        </Text>
      </Stack>

      <RealtimeVendorTable initialOrders={serializedOrders} user={serializedUser} />
    </Box>
  )
}