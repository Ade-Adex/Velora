// /app/components/vendor/RealtimeVendorTable.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { pusherClient } from '@/app/lib/pusherClient'
import { IOrder, IUser, Serialized } from '@/app/types'
import {
  Box,
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
  Text,
} from '@mantine/core'
import { Package, Eye, Inbox } from 'lucide-react'
import classes from '@/app/(vendor)/vendor/orders/VendorOrders.module.css'

interface RealtimeVendorTableProps {
  initialOrders: Serialized<IOrder>[]
  user: Serialized<IUser>
}

export function RealtimeVendorTable({
  initialOrders,
  user,
}: RealtimeVendorTableProps) {
 const router = useRouter()
 const [orders, setOrders] = useState<Serialized<IOrder>[]>(initialOrders)
 const [prevInitialOrders, setPrevInitialOrders] =
   useState<Serialized<IOrder>[]>(initialOrders)

 // Sync state directly during render pass if props change
 if (initialOrders !== prevInitialOrders) {
   setPrevInitialOrders(initialOrders)
   setOrders(initialOrders)
 }

useEffect(() => {
  if (!user?._id) return

  const channelName = `private-vendor-${user._id.toString()}`
  const channel = pusherClient.subscribe(channelName)

  const handleUpdate = () => {
    router.refresh()
  }

  channel.bind('order-created', handleUpdate)
  channel.bind('order-updated', handleUpdate)

  return () => {
    channel.unbind('order-created', handleUpdate)
    channel.unbind('order-updated', handleUpdate)
    pusherClient.unsubscribe(channelName)
  }
}, [router, user?._id])
  return (
    <Paper withBorder radius="lg" shadow="xs">
      <ScrollArea>
        <Table
          verticalSpacing="md"
          horizontalSpacing="lg"
          highlightOnHover
          className={classes.responsiveTable}
        >
          <TableThead bg="gray.0" className={classes.hideOnMobile}>
            <TableTr>
              <TableTh style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Order Details
              </TableTh>
              <TableTh style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Your Products
              </TableTh>
              <TableTh
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  textAlign: 'right',
                }}
              >
                Earnings
              </TableTh>
              <TableTh style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                Payment Status
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

                const myGrossTotal = myItems.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0,
                )

                const myNetEarnings = myItems.reduce(
                  (acc, item) => acc + (item.vendorNetEarning || 0),
                  0,
                )

                const commissionRate = myItems[0]?.adminCommissionRate || 0
                const targetShipmentId = myItems[0]?.shipment?.toString()

                return (
                  <TableTr key={order._id} className={classes.responsiveRow}>
                    {/* Order Details */}
                    <TableTd data-label="Order Details">
                      <Stack gap={0} align="flex-end">
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

                    {/* Your Products */}
                    <TableTd data-label="Your Products">
                      <Stack gap={6} align="flex-end">
                        {myItems.map((item, idx) => {
                          const currentStatus = item.status?.toLowerCase()
                          const currentVendorStatus =
                            item.vendorStatus?.toLowerCase()

                          let badgeColor = 'gray'
                          let badgeLabel: string = item.status || 'Pending'

                          if (
                            currentStatus === 'in_transit' &&
                            currentVendorStatus !== 'in_transit'
                          ) {
                            badgeColor = 'indigo'
                            badgeLabel = 'In Transit'
                          } else if (currentVendorStatus === 'in_transit') {
                            badgeColor = 'teal'
                            badgeLabel = 'Received at Hub'
                          } else if (currentStatus === 'delivered') {
                            badgeColor = 'green'
                            badgeLabel = 'Delivered to Client'
                          } else if (
                            ['failed_attempt', 'returned'].includes(
                              currentStatus,
                            )
                          ) {
                            badgeColor = 'red'
                            badgeLabel = currentStatus.replace('_', ' ')
                          }

                          return (
                            <Box key={idx} style={{ textAlign: 'right' }}>
                              <Text size="xs" fw={700}>
                                {item.quantity}x {item.name}
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color={badgeColor}
                                tt="uppercase"
                              >
                                {badgeLabel}
                              </Badge>
                            </Box>
                          )
                        })}
                      </Stack>
                    </TableTd>

                    {/* Earnings */}
                    <TableTd data-label="Earnings">
                      <Tooltip
                        label={`Gross: ₦${myGrossTotal.toLocaleString()} (Before ${commissionRate}% Fees)`}
                      >
                        <Stack gap={0} align="flex-end">
                          <Text size="sm" fw={800} c="indigo.7">
                            ₦{myNetEarnings.toLocaleString()}
                          </Text>
                          <Text size="10px" fw={600} c="dimmed" tt="uppercase">
                            Net Earning
                          </Text>
                          {/* Visible on Mobile only via CSS layout configuration */}
                          <Text
                            size="10px"
                            c="orange.8"
                            fw={500}
                            className={classes.showOnlyMobile}
                          >
                            Gross: ₦{myGrossTotal.toLocaleString()} (
                            {commissionRate}% Fee)
                          </Text>
                        </Stack>
                      </Tooltip>
                    </TableTd>

                    {/* Payment Status */}
                    <TableTd data-label="Payment Status">
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

                    {/* Action Buttons */}
                    <TableTd>
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        {targetShipmentId ? (
                          <Link
                            href={`/vendor/orders/${targetShipmentId}`}
                            passHref
                          >
                            <ActionIcon
                              color="indigo"
                              variant="light"
                              radius="md"
                              size="lg"
                              component="a"
                            >
                              <Package size={18} />
                            </ActionIcon>
                          </Link>
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
  )
}
