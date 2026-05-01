// /app/(admin)/admin/page.tsx
import {
  Container,
  Stack,
  Title,
  Grid,
  Paper,
  Text,
  Group,
  Button,
  GridCol,
} from '@mantine/core'
import { AdminStats } from '@/app/components/admin/AdminStats'
import { Order } from '@/app/models/Order'
import { User } from '@/app/models/User'
import connectDB from '@/app/lib/mongodb'
import {
  Banknote,
  Package,
  Users,
  BarChart3,
  ArrowRight,
  PlusCircle,
  Settings2,
} from 'lucide-react'
import Link from 'next/link'
import { IOrder } from '@/app/types'

export default async function AdminDashboardPage() {
  await connectDB()

  // Fetch metrics from MongoDB
  const [totalOrders, totalUsers, ordersData] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.find().select('totals.grandTotal').lean(),
  ])

  const totalRevenue = ordersData.reduce(
    (acc, order) => acc + (order.totals?.grandTotal || 0),
    0,
  )

  const stats = [
    {
      title: 'Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      diff: 12.5,
      icon: Banknote,
      color: 'green',
    },
    {
      title: 'Orders',
      value: totalOrders,
      diff: 5.2,
      icon: Package,
      color: 'blue',
    },
    {
      title: 'Customers',
      value: totalUsers,
      diff: -1.4,
      icon: Users,
      color: 'violet',
    },
    {
      title: 'Avg. Sale',
      value: `₦${(totalRevenue / (totalOrders || 1)).toFixed(0)}`,
      diff: 3.8,
      icon: BarChart3,
      color: 'orange',
    },
  ]

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  return (
    <div className="md:px-4 py-0">
      <Stack gap="xl">
        <header>
          <Title order={2} fw={900} lts="-1px">
            Dashboard Overview
          </Title>
          <Text c="dimmed" size="sm">
            Real-time performance and store activity.
          </Text>
        </header>

        <AdminStats data={stats} />

        <Grid gap="md">
          {/* Recent Orders Feed */}
          <GridCol span={{ base: 12, md: 8 }}>
            <Paper withBorder radius="md" shadow="sm">
              <Group
                p="md"
                justify="space-between"
                className="border-b border-gray-100"
              >
                <Text fw={800} size="sm" className="uppercase tracking-tight">
                  Recent Activity
                </Text>
                <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="subtle"
                    size="xs"
                    rightSection={<ArrowRight size={14} />}
                  >
                    View All
                  </Button>
                </Link>
              </Group>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                        Order
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: IOrder) => (
                      <tr
                        key={order._id.toString()}
                        className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <Text size="sm" fw={700}>
                            #{order.orderNumber}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Text>
                        </td>
                        <td className="p-4">
                          <Text
                            size="xs"
                            fw={800}
                            className="uppercase px-2 py-1 bg-gray-100 rounded-md inline-block"
                          >
                            {order.orderStatus}
                          </Text>
                        </td>
                        <td className="p-4 text-right">
                          <Text size="sm" fw={800}>
                            ₦{order.totals.grandTotal.toLocaleString()}
                          </Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Paper>
          </GridCol>

          {/* Sidebar Actions */}
          <GridCol span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Paper withBorder p="md" radius="md" shadow="sm">
                <Text
                  fw={800}
                  size="xs"
                  mb="md"
                  className="uppercase tracking-widest opacity-60"
                >
                  Quick Actions
                </Text>
                <Stack gap="xs">
                  {/* Add Product Link */}
                  <Link href="/admin/products/new" className="no-underline">
                    <Button
                      variant="light"
                      fullWidth
                      justify="flex-start"
                      leftSection={<PlusCircle size={16} />}
                    >
                      Add Product
                    </Button>
                  </Link>

                  {/* Store Settings Link */}
                  <Link href="/admin/settings" className="no-underline">
                    <Button
                      variant="light"
                      fullWidth
                      justify="flex-start"
                      color="gray"
                      leftSection={<Settings2 size={16} />}
                    >
                      Store Settings
                    </Button>
                  </Link>
                </Stack>
              </Paper>

              <Paper
                withBorder
                p="md"
                radius="md"
                bg="blue.9"
                c="white"
                shadow="md"
              >
                <Text
                  size="xs"
                  fw={800}
                  className="uppercase tracking-widest opacity-70"
                >
                  Inventory Sync
                </Text>
                <Text size="sm" mt="sm" fw={500} style={{ lineHeight: 1.5 }}>
                  Low stock levels detected for <b>5 items</b>. Restocking now
                  ensures you don&apos;t miss out on upcoming sales trends.
                </Text>
                <Button
                  mt="md"
                  variant="white"
                  color="blue"
                  size="xs"
                  fullWidth
                  fw={800}
                >
                  Restock Now
                </Button>
              </Paper>
            </Stack>
          </GridCol>
        </Grid>
      </Stack>
    </div>
  )
}
