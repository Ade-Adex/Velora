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
import { DollarSign, ShoppingBag, Package, AlertCircle, TrendingUp } from 'lucide-react'
import { getVendorAnalytics } from '@/app/services/vendor-analytics-service'
import { SimpleSalesChart } from '@/app/components/vendor/analytics/SalesChart'

export default async function VendorAnalyticsPage() {
  let stats

  try {
    stats = await getVendorAnalytics()
  } catch (error) {
    return (
      <Text>Unable to load analytics. Please ensure you are logged in.</Text>
    )
  }

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
      color: stats.lowStockAlerts > 0 ? 'red' : 'gray',
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
          <Paper key={item.label} p="md" withBorder radius="md">
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
      <Paper p="xl" withBorder radius="md">
        <Group justify="space-between" mb="xl">
          <Stack gap={0}>
            <Group gap="xs">
              <TrendingUp size={18} className="text-blue-500" />
              <Text fw={700}>Weekly Revenue Distribution</Text>
            </Group>
            <Text size="xs" c="dimmed">
              Daily performance overview
            </Text>
          </Stack>
        </Group>

        {/* The Custom Chart */}
        <Box mt="xl">
          {stats.salesTrend && stats.salesTrend.length > 0 ? (
            <SimpleSalesChart data={stats.salesTrend} />
          ) : (
            <Box
              h={200}
              className="flex items-center justify-center border-2 border-dashed rounded-md"
            >
              <Text c="dimmed">No sales data recorded for this period.</Text>
            </Box>
          )}
        </Box>
      </Paper>
    </Stack>
  )
}