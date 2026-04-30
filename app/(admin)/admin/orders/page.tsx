import {
  Table,
  Badge,
  Button,
  Title,
  Paper,
  Container,
  Text,
  Group,
  Stack,
  ActionIcon,
  Pagination,
} from '@mantine/core'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { IOrder, IUser } from '@/app/types'
import { Types } from 'mongoose'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'

type PopulatedOrder = Omit<IOrder, 'user'> & {
  user: Pick<IUser, 'fullName' | 'email'> | null
  _id: Types.ObjectId
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 5 
  const skip = (currentPage - 1) * limit

  await connectDB()

  // Fetch data with pagination
  const [orders, totalOrders] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{
        user: Pick<IUser, 'fullName' | 'email'>
      }>('user', 'fullName email')
      .lean<PopulatedOrder[]>(),
    Order.countDocuments(),
  ])

  const totalPages = Math.ceil(totalOrders / limit)

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="flex-end">
            <Stack gap={2}>
              <Title order={2} fw={900} lts="-0.5px">
                Customer Orders
              </Title>
              <Text c="dimmed" size="sm">
                Managing {totalOrders} total transactions
              </Text>
            </Stack>

            {/* Desktop Pagination Status */}
            <Text size="xs" fw={700} c="dimmed" className="hidden md:block">
              SHOWING {skip + 1} - {Math.min(skip + limit, totalOrders)} OF{' '}
              {totalOrders}
            </Text>
          </Group>
        </header>

        <Paper radius="md" withBorder shadow="sm" className="overflow-hidden">
          {/* DESKTOP TABLE - Hidden on Mobile */}
          <div className="hidden md:block">
            <Table verticalSpacing="md" highlightOnHover>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Order
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id.toString()}
                    className="border-t border-gray-100 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Text fw={800} size="sm" c="blue.9">
                        #{order.orderNumber}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </td>
                    <td className="px-6 py-4">
                      <Text size="sm" fw={600}>
                        {order.user?.fullName ?? 'Guest'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {order.user?.email ?? 'N/A'}
                      </Text>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <Text fw={700} size="sm">
                        ₦{order.totals.grandTotal.toLocaleString()}
                      </Text>
                    </td>
                    {/* Replace the old Button + Link combo with this */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order._id.toString()}`}
                        className="no-underline"
                      >
                        <Button variant="light" size="xs">
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* MOBILE LIST VIEW - Hidden on Desktop */}
          <div className="md:hidden">
            <Stack gap={0}>
              {orders.map((order) => (
                <div
                  key={order._id.toString()}
                  className="p-4 border-b border-gray-100 active:bg-gray-50"
                >
                  <Group justify="space-between" mb={4}>
                    <Text fw={800} size="sm" c="blue.9">
                      #{order.orderNumber}
                    </Text>
                    <StatusBadge status={order.orderStatus} />
                  </Group>
                  <Group justify="space-between" align="flex-end">
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>
                        {order.user?.fullName ?? 'Guest'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ₦{order.totals.grandTotal.toLocaleString()}
                      </Text>
                    </Stack>
                    <Link href={`/admin/orders/${order._id.toString()}`}>
                      <ActionIcon variant="light" size="lg" radius="md">
                        <Eye size={18} />
                      </ActionIcon>
                    </Link>
                  </Group>
                </div>
              ))}
            </Stack>
          </div>

          {/* EMPTY STATE */}
          {orders.length === 0 && <EmptyState />}

          {/* PAGINATION FOOTER */}
          <footer className="p-4 bg-gray-50 border-t border-gray-100">
            <Group justify="center">
              <Link
                href={`?page=${currentPage - 1}`}
                className={
                  currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                }
              >
                <Button
                  variant="default"
                  size="xs"
                  leftSection={<ChevronLeft size={14} />}
                >
                  Prev
                </Button>
              </Link>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Link key={i} href={`?page=${i + 1}`}>
                    <ActionIcon
                      variant={currentPage === i + 1 ? 'filled' : 'light'}
                      size="sm"
                    >
                      {i + 1}
                    </ActionIcon>
                  </Link>
                ))}
              </div>

              <Link
                href={`?page=${currentPage + 1}`}
                className={
                  currentPage >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              >
                <Button
                  variant="default"
                  size="xs"
                  rightSection={<ChevronRight size={14} />}
                >
                  Next
                </Button>
              </Link>
            </Group>
          </footer>
        </Paper>
      </Stack>
    </Container>
  )
}

// Sub-components for cleaner code
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    delivered: 'green',
    pending: 'orange',
    cancelled: 'red',
    shipped: 'blue',
  }
  return (
    <Badge variant="dot" color={colors[status] || 'gray'} size="sm">
      {status.toUpperCase()}
    </Badge>
  )
}

function EmptyState() {
  return (
    <Stack align="center" py={80} gap="xs">
      <Text fw={700} c="dimmed">
        No orders found
      </Text>
      <Text size="sm" c="dimmed text-center px-4">
        Transactions will appear here once customers checkout.
      </Text>
    </Stack>
  )
}
