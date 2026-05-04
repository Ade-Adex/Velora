// /app/(vendor)/vendor/orders/page.tsx

export const dynamic = 'force-dynamic'

import {
  Box,
  Title,
  Text,
  Table,
  Badge,
  Paper,
  ActionIcon,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  Tooltip,
  Group,
  Stack,
} from '@mantine/core'
import { Package, Eye } from 'lucide-react'
import { getVendorOrders } from '@/app/services/vendor-service'
import { getCurrentUser } from '@/app/services/auth-service'
import { Serialized, IOrder } from '@/app/types'
import Link from 'next/link'

export default async function VendorOrdersPage() {
  // 1. Get current vendor to filter items
  const user = await getCurrentUser()
  const orders: Serialized<IOrder>[] = await getVendorOrders()

  if (!user) return null

  return (
    <Box p="md">
      <Stack mb="xl" gap={4}>
        <Title order={2} fw={900} lts="-1px">
          Order Fulfillment
        </Title>
        <Text c="dimmed" size="sm">
          Manage your shipments and track your net earnings per order.
        </Text>
      </Stack>

      <Paper withBorder radius="lg" shadow="xs" style={{ overflow: 'hidden' }}>
        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
          <TableThead bg="gray.0">
            <TableTr>
              <TableTh style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Order Details
              </TableTh>
              <TableTh style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Your Products
              </TableTh>
              <TableTh style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Your Earnings
              </TableTh>
              <TableTh style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Payment
              </TableTh>
              <TableTh />
            </TableTr>
          </TableThead>
          <TableTbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                // Filter items to only show what belongs to THIS vendor
                const myItems = order.items.filter(
                  (item) => item.vendor.toString() === user._id.toString(),
                )

                // Calculate only this vendor's earnings for this order
                const myNetEarnings = myItems.reduce(
                  (acc, item) => acc + (item.vendorNetEarning || 0),
                  0,
                )

                return (
                  <TableTr key={order._id}>
                    <TableTd>
                      <Stack gap={2}>
                        <Text size="sm" fw={800}>
                          #{order.orderNumber}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </Text>
                      </Stack>
                    </TableTd>

                    <TableTd>
                      <Stack gap={6}>
                        {myItems.map((item, idx) => (
                          <Group
                            key={idx}
                            justify="space-between"
                            wrap="nowrap"
                          >
                            <Box>
                              <Text size="xs" fw={700}>
                                {item.quantity}x {item.name}
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color={
                                  item.status === 'shipped' ||
                                  item.status === 'delivered'
                                    ? 'indigo'
                                    : 'gray'
                                }
                              >
                                {item.status}
                              </Badge>
                            </Box>
                          </Group>
                        ))}
                      </Stack>
                    </TableTd>

                    <TableTd>
                      <Text size="sm" fw={800} c="indigo.7">
                        ₦{myNetEarnings.toLocaleString()}
                      </Text>
                      <Text size="10px" c="dimmed">
                        Net after commission
                      </Text>
                    </TableTd>

                    <TableTd>
                      <Badge
                        color={
                          order.paymentStatus === 'paid' ? 'teal' : 'orange'
                        }
                        variant="dot"
                        size="sm"
                        fw={700}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableTd>

                    <TableTd>
                      <Group gap="xs" justify="flex-end">
                        <Tooltip label="Update Shipping">
                          {/* Wrap with Link instead of passing it as a prop */}
                          <Link
                            href={`/vendor/orders/${order._id}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <ActionIcon
                              color="indigo"
                              variant="subtle"
                              radius="md"
                            >
                              <Package size={18} />
                            </ActionIcon>
                          </Link>
                        </Tooltip>

                        <ActionIcon color="gray" variant="subtle" radius="md">
                          <Eye size={18} />
                        </ActionIcon>
                      </Group>
                    </TableTd>
                  </TableTr>
                )
              })
            ) : (
              <TableTr>
                <TableTd colSpan={5} align="center" py="xl">
                  <Text c="dimmed" size="sm">
                    No orders to fulfill yet.
                  </Text>
                </TableTd>
              </TableTr>
            )}
          </TableTbody>
        </Table>
      </Paper>
    </Box>
  )
}
