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
} from '@mantine/core'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { IOrder, IUser } from '@/app/types'
import { Types } from 'mongoose'
import { Filter as MongoFilter } from 'mongodb'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import OrderFilters from '@/app/components/admin/OrderFilters'
import { ReactNode } from 'react'

type PopulatedOrder = Omit<IOrder, 'user'> & {
  user: Pick<IUser, 'fullName' | 'email'> | null
  _id: Types.ObjectId
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    q?: string
    status?: string
  }>
}

interface PaginationLinkProps {
  page: number
  disabled: boolean
  children: ReactNode
  icon: ReactNode
  right?: boolean
  currentQ?: string
  currentStatus?: string
}

type OrderQuery = MongoFilter<IOrder>

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { page, q, status } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10
  const skip = (currentPage - 1) * limit

  await connectDB()

  const query: OrderQuery = {}

  if (q) {
    query.$or = [
      { orderNumber: { $regex: q, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
    ]
  }

  if (status && status !== 'all') {
    query.orderStatus = status as IOrder['orderStatus']
  }

  // 2. FETCH DATA
  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{
        user: Pick<IUser, 'fullName' | 'email'>
      }>('user', 'fullName email')
      .lean<PopulatedOrder[]>(),
    Order.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalOrders / limit)

  return (
    <div className="md:px-4 py-0">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="flex-end">
            <Stack gap={2}>
              <Title order={2} fw={900} lts="-0.5px">
                Customer Orders
              </Title>
              <Text c="dimmed" size="sm">
                {q || (status && status !== 'all')
                  ? `Found ${totalOrders} results for your search`
                  : `Managing ${totalOrders} total transactions`}
              </Text>
            </Stack>
          </Group>
        </header>

        <OrderFilters currentQuery={q} currentStatus={status} />

        <Paper radius="md" withBorder shadow="sm" className="overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table verticalSpacing="md" highlightOnHover>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-left">
                    Order
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-left">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-left">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-left">
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
                    className="border-t border-gray-100"
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
                        {order.user?.fullName ?? order.shippingAddress.fullName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {order.user?.email ?? 'Guest Account'}
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

          {/* Mobile View */}
          <div className="md:hidden">
            {orders.map((order) => (
              <div
                key={order._id.toString()}
                className="p-4 border-b border-gray-100"
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
                      {order.user?.fullName ?? order.shippingAddress.fullName}
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
          </div>

          {orders.length === 0 && <EmptyState isFiltered={!!(q || status)} />}

          <footer className="p-4 bg-gray-50 border-t border-gray-100">
            <Group justify="center">
              <PaginationLink
                page={currentPage - 1}
                disabled={currentPage <= 1}
                icon={<ChevronLeft size={14} />}
                currentQ={q}
                currentStatus={status}
              >
                Prev
              </PaginationLink>

              <PaginationLink
                page={currentPage + 1}
                disabled={currentPage >= totalPages}
                icon={<ChevronRight size={14} />}
                right
                currentQ={q}
                currentStatus={status}
              >
                Next
              </PaginationLink>
            </Group>
          </footer>
        </Paper>
      </Stack>
    </div>
  )
}

function PaginationLink({
  page,
  disabled,
  children,
  icon,
  right,
  currentQ,
  currentStatus,
}: PaginationLinkProps) {
  return (
    <Link
      href={{
        pathname: '/admin/orders',
        query: {
          page: page.toString(),
          ...(currentQ ? { q: currentQ } : {}),
          ...(currentStatus ? { status: currentStatus } : {}),
        },
      }}
      style={{
        pointerEvents: disabled ? 'none' : 'auto',
        opacity: disabled ? 0.5 : 1,
        textDecoration: 'none',
      }}
    >
      <Button
        variant="default"
        size="xs"
        leftSection={!right ? icon : undefined}
        rightSection={right ? icon : undefined}
      >
        {children}
      </Button>
    </Link>
  )
}

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

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <Stack align="center" py={80} gap="xs">
      <Text fw={700} c="dimmed">
        {isFiltered ? 'No matching orders' : 'No orders yet'}
      </Text>
      <Text size="sm" c="dimmed">
        Try adjusting your filters or checking back later.
      </Text>
    </Stack>
  )
}
