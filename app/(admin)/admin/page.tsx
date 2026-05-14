// /app/(admin)/admin/page.tsx

import {
  Stack,
  Title,
  Grid,
  Paper,
  Text,
  Group,
  Button,
  GridCol,
} from '@mantine/core'
import AdminStats from '@/app/components/admin/AdminStats'
import { Order } from '@/app/models/Order'
import { User } from '@/app/models/User'
import { Product } from '@/app/models/Product' 
import connectDB from '@/app/lib/mongodb'
import {
  ArrowRight,
  PlusCircle,
  Settings2,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { IOrder, StatItem } from '@/app/types'



const calculateDiff = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return parseFloat((((current - previous) / previous) * 100).toFixed(1))
}


export default async function AdminDashboardPage() {
  await connectDB()

  const LOW_STOCK_THRESHOLD = 5

  const now = new Date()
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalOrders,
    totalUsers,
    totalVendors,
    ordersData,
    lowStockCount,
    prevOrders,
    prevUsers,
    prevVendors,
    prevOrdersData,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'vendor' }),
    Order.find().select('totals.grandTotal').lean(),
    Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),

    // Previous Month Data
    Order.countDocuments({
      createdAt: { $lt: startOfCurrentMonth, $gte: startOfLastMonth },
    }),
    User.countDocuments({
      role: 'customer',
      createdAt: { $lt: startOfCurrentMonth, $gte: startOfLastMonth },
    }),
    User.countDocuments({
      role: 'vendor',
      createdAt: { $lt: startOfCurrentMonth, $gte: startOfLastMonth },
    }),
    Order.find({
      createdAt: { $lt: startOfCurrentMonth, $gte: startOfLastMonth },
    })
      .select('totals.grandTotal')
      .lean(),
  ])

  // Revenue Calculations
  const totalRevenue = ordersData.reduce(
    (acc, o) => acc + (o.totals?.grandTotal || 0),
    0,
  )
  const prevRevenue = prevOrdersData.reduce(
    (acc, o) => acc + (o.totals?.grandTotal || 0),
    0,
  )

  // Current Month Activity (to compare against previous month growth)
  const currentMonthOrders = await Order.countDocuments({
    createdAt: { $gte: startOfCurrentMonth },
  })
  const currentMonthUsers = await User.countDocuments({
    role: 'customer',
    createdAt: { $gte: startOfCurrentMonth },
  })
  const currentMonthVendors = await User.countDocuments({
    role: 'vendor',
    createdAt: { $gte: startOfCurrentMonth },
  })
  const currentMonthRevData = await Order.find({
    createdAt: { $gte: startOfCurrentMonth },
  })
    .select('totals.grandTotal')
    .lean()
  const currentMonthRevenue = currentMonthRevData.reduce(
    (acc, o) => acc + (o.totals?.grandTotal || 0),
    0,
  )

  const stats: StatItem[] = [
    {
      title: 'Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      diff: calculateDiff(currentMonthRevenue, prevRevenue),
      icon: 'bank',
      color: 'green',
    },
    {
      title: 'Orders',
      value: totalOrders,
      diff: calculateDiff(currentMonthOrders, prevOrders),
      icon: 'package',
      color: 'blue',
    },
    {
      title: 'Customers',
      value: totalUsers,
      diff: calculateDiff(currentMonthUsers, prevUsers),
      icon: 'users',
      color: 'violet',
    },
    {
      title: 'Vendors',
      value: totalVendors,
      diff: calculateDiff(currentMonthVendors, prevVendors),
      icon: 'vendor',
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
                <Link href="/admin/orders" className="no-underline">
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

              {/* Professional Dynamic Inventory Sync Card */}
              <Paper
                withBorder
                p="md"
                radius="md"
                bg={lowStockCount > 0 ? 'orange.9' : 'blue.9'} // Color changes based on urgency
                c="white"
                shadow="md"
              >
                <Group justify="space-between" align="center" mb="xs">
                  <Text
                    size="xs"
                    fw={800}
                    className="uppercase tracking-widest opacity-70"
                  >
                    Inventory Sync
                  </Text>
                  {lowStockCount > 0 && <AlertTriangle size={16} />}
                </Group>

                {lowStockCount > 0 ? (
                  <>
                    <Text size="sm" fw={500} style={{ lineHeight: 1.5 }}>
                      Low stock levels detected for{' '}
                      <b>
                        {lowStockCount} {lowStockCount === 1 ? 'item' : 'items'}
                      </b>
                      . Restocking ensures continuity during peak sales periods.
                    </Text>
                    <Link
                      href="/admin/products?stock=low"
                      className="no-underline"
                    >
                      <Button
                        mt="md"
                        variant="white"
                        color="orange.9"
                        size="xs"
                        fullWidth
                        fw={800}
                      >
                        Restock Now
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Text size="sm" fw={500} style={{ lineHeight: 1.5 }}>
                      Your inventory is healthy! All products are currently
                      above the threshold.
                    </Text>
                    <Link href="/admin/products" className="no-underline">
                      <Button
                        mt="md"
                        variant="white"
                        color="blue.9"
                        size="xs"
                        fullWidth
                        fw={800}
                      >
                        Manage Inventory
                      </Button>
                    </Link>
                  </>
                )}
              </Paper>
            </Stack>
          </GridCol>
        </Grid>
      </Stack>
    </div>
  )
}
