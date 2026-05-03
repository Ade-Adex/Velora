//  /app/(vendor)/vendor/analytics/page.tsx

export const dynamic = 'force-dynamic'

import {
  SimpleGrid,
  Paper,
  Text,
  Group,
  Title,
  Stack,
  Box,
} from '@mantine/core'
import { DollarSign, ShoppingBag, Package, AlertCircle } from 'lucide-react'
import { getVendorAnalytics } from '@/app/services/vendor-analytics-service'

export default async function VendorAnalyticsPage() {
  const stats = await getVendorAnalytics()

  const data = [
    {
      label: 'Total Revenue',
      value: `₦${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Orders Processed',
      value: stats.orderCount,
      icon: ShoppingBag,
      color: 'blue',
    },
    {
      label: 'Items Sold',
      value: stats.unitsSold,
      icon: Package,
      color: 'indigo',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockAlerts,
      icon: AlertCircle,
      color: 'red',
    },
  ]

  return (
    <Stack gap="xl">
      <Box>
        <Title order={2} fw={800}>
          Performance Insights
        </Title>
        <Text c="dimmed">
          Real-time data on your shop&apos;s growth and sales.
        </Text>
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {data.map((item) => (
          <Paper key={item.label} p="xl" withBorder radius="md">
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                {item.label}
              </Text>
              <item.icon
                size={20}
                className={
                  item.color === 'red' ? 'text-red-500' : 'text-slate-400'
                }
              />
            </Group>
            <Text size="h3" fw={900}>
              {item.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* You can add charts here later using a library like Recharts */}
      <Paper
        h={300}
        withBorder
        radius="md"
        className="flex items-center justify-center bg-gray-50/50"
      >
        <Text c="dimmed" size="sm">
          Sales trend visualization will appear here.
        </Text>
      </Paper>
    </Stack>
  )
}