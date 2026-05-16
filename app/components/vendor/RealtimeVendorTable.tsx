// /app/components/vendor/RealtimeVendorTable.tsx
'use client'

import classes from '@/app/(vendor)/vendor/orders/VendorOrders.module.css'
import { pusherClient } from '@/app/lib/pusherClient'
import { IOrder, IUser, Serialized } from '@/app/types'
import {
  Button,
  Paper,
  ScrollArea,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from '@mantine/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RealtimeVendorTableProps {
  initialOrders: Serialized<IOrder>[]
  user: Serialized<IUser>
}

export function RealtimeVendorTable({
  initialOrders,
  user,
}: RealtimeVendorTableProps) {
  const router = useRouter()

  useEffect(() => {
    const channel = pusherClient.subscribe('global-orders-channel')

    const handleUpdate = () => {
      router.refresh()
    }

    channel.bind('order-created', handleUpdate)
    channel.bind('order-updated', handleUpdate)

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [router])

  return (
    <Paper withBorder radius="lg" shadow="xs">
      <ScrollArea>
        <Table
          verticalSpacing="md"
          horizontalSpacing="lg"
          highlightOnHover
          className={classes.responsiveTable}
        >
          <TableThead bg="gray.0">
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
            {initialOrders.map((order) => {
              const myItems = order.items.filter(
                (item) => item.vendor === user._id,
              )
              const myNetEarnings = myItems.reduce(
                (acc: number, item) => acc + (item.vendorNetEarning || 0),
                0,
              )

              return (
                <TableTr key={order._id}>
                  <TableTd data-label="Order Details">
                    <Stack gap={0}>
                      <Text size="sm" fw={800}>
                        #{order.orderNumber}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </TableTd>
                  <TableTd data-label="Your Products">
                    <Stack gap={2}>
                      {myItems.map((item, i) => (
                        <Text key={i} size="xs" fw={600}>
                          {item.name} (x{item.quantity})
                        </Text>
                      ))}
                    </Stack>
                  </TableTd>
                  <TableTd data-label="Earnings" style={{ textAlign: 'right' }}>
                    <Text fw={700} size="sm">
                      ₦{myNetEarnings.toLocaleString()}
                    </Text>
                  </TableTd>
                  <TableTd data-label="Payment Status">
                    <Text
                      size="xs"
                      fw={700}
                      c={order.paymentStatus === 'paid' ? 'green' : 'orange'}
                    >
                      {order.paymentStatus.toUpperCase()}
                    </Text>
                  </TableTd>
                  <TableTd style={{ textAlign: 'right' }}>
                    <Link href={`/vendor/orders/${order._id}`}>
                      <Button size="xs" variant="light">
                        Manage
                      </Button>
                    </Link>
                  </TableTd>
                </TableTr>
              )
            })}
          </TableTbody>
        </Table>
      </ScrollArea>
    </Paper>
  )
}
