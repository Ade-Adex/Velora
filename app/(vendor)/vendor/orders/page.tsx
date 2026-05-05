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
  ScrollArea,
  Center,
} from '@mantine/core'
import { Package, Eye, Inbox } from 'lucide-react'
import { getVendorOrders } from '@/app/services/vendor-service'
import { getCurrentUser } from '@/app/services/auth-service'
import { Serialized, IOrder } from '@/app/types'
import Link from 'next/link'
import classes from './VendorOrders.module.css' // See CSS below

export default async function VendorOrdersPage() {
  const user = await getCurrentUser()
  const orders: Serialized<IOrder>[] = await getVendorOrders()

  if (!user) return null

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

      <Paper withBorder radius="lg" shadow="xs">
        {/* ScrollArea handles overflow if table is still too wide for small devices */}
        <ScrollArea>
          <Table
            verticalSpacing="md"
            horizontalSpacing="lg"
            highlightOnHover
            className={classes.responsiveTable}
          >
            <TableThead bg="gray.0" className={classes.hideOnMobile}>
              <TableTr>
                <TableTh
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  Order Details
                </TableTh>
                <TableTh
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  Your Products
                </TableTh>
                <TableTh
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  Your Earnings
                </TableTh>
                <TableTh
                  style={{ fontSize: '11px', textTransform: 'uppercase' }}
                >
                  Payment
                </TableTh>
                <TableTh />
              </TableTr>
            </TableThead>
            <TableTbody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  const myItems = order.items.filter(
                    (item) => item.vendor.toString() === user._id.toString(),
                  )

                  const myNetEarnings = myItems.reduce(
                    (acc, item) => acc + (item.vendorNetEarning || 0),
                    0,
                  )

                  const targetShipmentId = myItems[0]?.shipment?.toString()

                  return (
                    <TableTr key={order._id} className={classes.responsiveRow}>
                      <TableTd data-label="Order Details">
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

                      <TableTd data-label="Your Products">
                        <Stack gap={6}>
                          {myItems.map((item, idx) => (
                            <Box key={idx}>
                              <Text size="xs" fw={700}>
                                {item.quantity}x {item.name}
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color={
                                  ['shipped', 'delivered'].includes(
                                    item.status?.toLowerCase(),
                                  )
                                    ? 'indigo'
                                    : 'gray'
                                }
                              >
                                {item.status}
                              </Badge>
                            </Box>
                          ))}
                        </Stack>
                      </TableTd>

                      <TableTd data-label="Your Earnings">
                        <Box>
                          <Text size="sm" fw={800} c="indigo.7">
                            ₦{myNetEarnings.toLocaleString()}
                          </Text>
                          <Text size="10px" c="dimmed">
                            Net earning
                          </Text>
                        </Box>
                      </TableTd>

                      <TableTd data-label="Payment">
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
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          {targetShipmentId ? (
                            <Tooltip label="Update Shipping">
                              <Link
                                href={`/vendor/orders/${targetShipmentId}`}
                                passHref
                              >
                                <ActionIcon
                                  color="indigo"
                                  variant="light"
                                  radius="md"
                                  size="lg"
                                >
                                  <Package size={18} />
                                </ActionIcon>
                              </Link>
                            </Tooltip>
                          ) : (
                            <Text size="xs" c="red" fw={600}>
                              Pending Shipment
                            </Text>
                          )}
                          <Link
                            href={`/vendor/orders/view/${order._id}`}
                            passHref
                          >
                            <ActionIcon
                              color="gray"
                              variant="subtle"
                              component="a"
                            >
                              <Eye size={18} />
                            </ActionIcon>
                          </Link>
                        </Group>
                      </TableTd>
                    </TableTr>
                  )
                })
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={50}>
                      <Stack align="center" gap="xs">
                        <Inbox size={40} strokeWidth={1} color="gray" />
                        <Text c="dimmed" size="sm">
                          No orders to fulfill yet.
                        </Text>
                      </Stack>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Box>
  )
}