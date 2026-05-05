// /app/(vendor)/vendor/orders/view/[id]/page.tsx

export const dynamic = 'force-dynamic'

import {
  Box,
  Container,
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Badge,
  SimpleGrid,
  Table,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  ScrollArea,
} from '@mantine/core'
import { ChevronLeft, MapPin, CreditCard, Package, User } from 'lucide-react'
import Link from 'next/link'
import { getOrderByIdAction } from '@/app/services/order-service'
import { getCurrentUser } from '@/app/services/auth-service'
import { notFound } from 'next/navigation'
import classes from './OrderView.module.css'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VendorOrderViewPage({ params }: Props) {
  const { id } = await params

  const [order, user] = await Promise.all([
    getOrderByIdAction(id),
    getCurrentUser(),
  ])

  if (!order || !user) return notFound()

  const myItems = order.items.filter(
    (item) => item.vendor.toString() === user._id.toString(),
  )

  const myNetEarnings = myItems.reduce(
    (acc, item) => acc + (item.vendorNetEarning || 0),
    0,
  )

  return (
    <div className="px-2 py-2">
      <Stack gap="lg">
        {/* Header Navigation */}
        <Group justify="space-between" align="center">
          <Link href="/vendor/orders" style={{ textDecoration: 'none' }}>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<ChevronLeft size={16} />}
            >
              Back
            </Button>
          </Link>
          <Badge
            size="lg"
            variant="dot"
            color={order.paymentStatus === 'paid' ? 'teal' : 'orange'}
          >
            {order.paymentStatus?.toUpperCase()}
          </Badge>
        </Group>

        {/* Order Title and Earnings */}
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Box>
            <Title
              order={2}
              fw={900}
              lts="-1px"
              fz={{ base: 'md', sm: '20px' }}
            >
              Order #{order.orderNumber.split('-').pop()?.toUpperCase()}
            </Title>
            <Text c="dimmed" size="xs">
              Placed {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </Box>
          <Paper withBorder p="xs" px="md" radius="md" bg="blue.0">
            <Text size="10px" fw={700} c="blue.9" tt="uppercase">
              Your Earning
            </Text>
            <Text fw={900} fz="lg" c="blue.9">
              ₦{myNetEarnings.toLocaleString()}
            </Text>
          </Paper>
        </Group>

        {/* Info Cards Grid */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs" c="indigo">
              <User size={16} />
              <Text fw={700} size="xs" tt="uppercase">
                Customer
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {order.shippingAddress?.fullName}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {order.user &&
              typeof order.user !== 'string' &&
              'email' in order.user
                ? order.user.email
                : 'Guest User'}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs" c="indigo">
              <MapPin size={16} />
              <Text fw={700} size="xs" tt="uppercase">
                Shipping To
              </Text>
            </Group>
            <Text size="sm" lineClamp={1}>
              {order.shippingAddress?.addressLine1}
            </Text>
            <Text size="xs" c="dimmed">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs" c="indigo">
              <CreditCard size={16} />
              <Text fw={700} size="xs" tt="uppercase">
                Payment
              </Text>
            </Group>
            <Text size="sm" tt="capitalize">
              {order.paymentMethod || 'Card'}
            </Text>
            <Text
              size="xs"
              fw={700}
              c={order.paymentStatus === 'paid' ? 'teal' : 'orange'}
            >
              {order.paymentStatus?.toUpperCase()}
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Responsive Product Table */}
        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <ScrollArea>
            <Table
              verticalSpacing="md"
              horizontalSpacing="lg"
              className={classes.responsiveTable}
            >
              <TableThead bg="gray.0" className={classes.hideOnMobile}>
                <TableTr>
                  <TableTh>
                    <Text size="xs" fw={700} tt="uppercase">
                      Product
                    </Text>
                  </TableTh>
                  <TableTh>
                    <Text size="xs" fw={700} tt="uppercase">
                      Quantity
                    </Text>
                  </TableTh>
                  <TableTh>
                    <Text size="xs" fw={700} tt="uppercase">
                      Status
                    </Text>
                  </TableTh>
                  <TableTh style={{ textAlign: 'right' }}>
                    <Text size="xs" fw={700} tt="uppercase">
                      Earning
                    </Text>
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {myItems.map((item, idx) => (
                  <TableTr key={idx} className={classes.responsiveRow}>
                    <TableTd data-label="Product">
                      <Group gap="sm" wrap="nowrap">
                        <Package size={16} color="gray" />
                        <Text size="sm" fw={600} ta="left">
                          {item.name}
                        </Text>
                      </Group>
                    </TableTd>
                    <TableTd data-label="Quantity">
                      <Text size="sm">{item.quantity}</Text>
                    </TableTd>
                    <TableTd data-label="Status">
                      <Badge
                        variant="light"
                        size="sm"
                        color={item.status === 'shipped' ? 'indigo' : 'gray'}
                      >
                        {item.status}
                      </Badge>
                    </TableTd>
                    <TableTd data-label="Earning">
                      <Text size="sm" fw={800}>
                        ₦{item.vendorNetEarning?.toLocaleString()}
                      </Text>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </ScrollArea>
        </Paper>
        {/* Responsive Footer Action */}
        <Paper
          withBorder
          p={{ base: 'lg', sm: 'xl' }}
          radius="md"
          bg="blue.0"
          style={{ borderStyle: 'dashed' }}
        >
          <Stack align="center" gap="xs">
            <Title order={4} ta="center">
              Fulfillment Action
            </Title>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Update the shipment status to keep your customer informed and
              release your funds.
            </Text>
            <Link
              href={`/vendor/orders/${myItems[0]?.shipment}`}
              style={{
                textDecoration: 'none',
                width: '100%',
                maxWidth: '300px',
              }}
            >
              <Button color="blue" radius="md" mt="md" fullWidth>
                Update Shipment Details
              </Button>
            </Link>
          </Stack>
        </Paper>
      </Stack>
    </div>
  )
}