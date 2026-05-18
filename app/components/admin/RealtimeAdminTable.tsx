// /app/components/admin/RealtimeAdminTable.tsx
'use client'

import { pusherClient } from '@/app/lib/pusherClient'
import { IOrder, IUser, Serialized } from '@/app/types'
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
} from '@mantine/core'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Define explicit component prop contracts
interface PopulatedAdminOrder extends Omit<Serialized<IOrder>, 'user'> {
  user: Pick<Serialized<IUser>, 'fullName' | 'email'> | null
}

interface RealtimeAdminTableProps {
  initialOrders: PopulatedAdminOrder[]
  currentPage: number
  totalPages: number
  q?: string
  status?: string
}

export function RealtimeAdminTable({
  initialOrders,
  currentPage,
  totalPages,
  q,
  status,
}: RealtimeAdminTableProps) {
  const router = useRouter()

useEffect(() => {
    const channelName = 'private-admin-system-channel'
    const channel = pusherClient.subscribe(channelName)

    const handleRefresh = () => {
      router.refresh()
    }

    channel.bind('admin-notification', handleRefresh)

    return () => {
      channel.unbind('admin-notification', handleRefresh)
      pusherClient.unsubscribe(channelName)
    }
  }, [router])

  return (
    <Paper radius="md" withBorder shadow="sm" className="overflow-hidden">
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
            {initialOrders.map((order) => (
              <tr key={order._id} className="border-t border-gray-100">
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
                  <Stack gap={4}>
                    <StatusBadge status={order.orderStatus} />
                    <Group gap={4} wrap="nowrap">
                      <Text
                        size="10px"
                        fw={700}
                        c={
                          order.items.every(
                            (item) => item.vendorStatus === 'in_transit',
                          )
                            ? 'green.7'
                            : 'orange.7'
                        }
                      >
                        {
                          order.items.filter(
                            (item) => item.vendorStatus === 'in_transit',
                          ).length
                        }
                        /{order.items.length} READY
                      </Text>
                    </Group>
                  </Stack>
                </td>
                <td className="px-6 py-4">
                  <Text fw={700} size="sm">
                    ₦{order.totals.grandTotal.toLocaleString()}
                  </Text>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/orders/${order._id}`}
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
        {initialOrders.map((order) => (
          <div key={order._id} className="p-4 border-b border-gray-100">
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
              <Link href={`/admin/orders/${order._id}`}>
                <ActionIcon variant="light" size="lg" radius="md">
                  <Eye size={18} />
                </ActionIcon>
              </Link>
            </Group>
          </div>
        ))}
      </div>

      <footer className="p-4 bg-gray-50 border-t border-gray-100">
        <Group justify="center">
          <Link
            href={{
              pathname: '/admin/orders',
              query: {
                page: (currentPage - 1).toString(),
                ...(q ? { q } : {}),
                ...(status ? { status } : {}),
              },
            }}
            style={{
              pointerEvents: currentPage <= 1 ? 'none' : 'auto',
              opacity: currentPage <= 1 ? 0.5 : 1,
            }}
          >
            <Button
              variant="default"
              size="xs"
              leftSection={<ChevronLeft size={14} />}
            >
              Prev
            </Button>
          </Link>
          <Link
            href={{
              pathname: '/admin/orders',
              query: {
                page: (currentPage + 1).toString(),
                ...(q ? { q } : {}),
                ...(status ? { status } : {}),
              },
            }}
            style={{
              pointerEvents: currentPage >= totalPages ? 'none' : 'auto',
              opacity: currentPage >= totalPages ? 0.5 : 1,
            }}
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
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'orange',
    confirmed: 'cyan',
    processing: 'yellow',
    shipped: 'blue',
    'in transit': 'indigo',
    'out for delivery': 'teal',
    delivered: 'green',
    cancelled: 'red',
  }
  return (
    <Badge
      variant="dot"
      color={colors[status.toLowerCase()] || 'gray'}
      size="sm"
    >
      {status.replace(/[_-]/g, ' ').toUpperCase()}
    </Badge>
  )
}
