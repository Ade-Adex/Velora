// /app/(vendor)/vendor/orders/view/[id]/page.tsx

export const dynamic = 'force-dynamic'

import {
  Box,
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
  ThemeIcon,
} from '@mantine/core'
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Package,
  User,
  Truck,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { getOrderByIdAction } from '@/app/services/order-service'
import { getCurrentUser } from '@/app/services/auth-service'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VendorOrderViewPage({ params }: Props) {
  const { id } = await params

  const [order, user] = await Promise.all([
    getOrderByIdAction(id),
    getCurrentUser(),
  ])

  if (!user) redirect('/login')
  if (!order) return notFound()

  // Filter items specifically for THIS vendor
  const myItems = order.items.filter(
    (item) => item.vendor.toString() === user._id.toString(),
  )

  if (myItems.length === 0) return notFound()

  // Group unique shipments for the footer actions
  const uniqueShipmentIds = Array.from(
    new Set(myItems.map((item) => item.shipment).filter(Boolean)),
  )

  // Financial Calculations using your exact Model names
  const myNetEarnings = myItems.reduce(
    (acc, item) => acc + (item.vendorNetEarning || 0),
    0,
  )
  const myGrossTotal = myItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  )
  const totalCommission = myItems.reduce(
    (acc, item) => acc + (item.adminCommissionAmount || 0),
    0,
  )

  // --- DISBURSAL COMPUTE LOGIC ---
  // A vendor's payout is unlocked if all of THEIR specific items are marked 'delivered'.
  // This protects against multi-vendor orders holding up your cash flow.
  const allMyItemsDelivered = myItems.every(
    (item) => item.status === 'delivered',
  )
  const hasAnyCancelledItems = myItems.some(
    (item) => item.status === 'cancelled',
  )

  let payoutStatusLabel = 'Escrow: Awaiting Delivery'
  let revenueCardBg = 'var(--mantine-color-blue-light)'
  let revenueBadgeColor = 'blue'

  if (allMyItemsDelivered) {
    payoutStatusLabel = 'Disbursed to Wallet'
    revenueCardBg = 'var(--mantine-color-teal-light)'
    revenueBadgeColor = 'teal'
  } else if (hasAnyCancelledItems && myNetEarnings === 0) {
    payoutStatusLabel = 'Order Cancelled'
    revenueCardBg = 'var(--mantine-color-red-light)'
    revenueBadgeColor = 'red'
  }

  return (
    <Box p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Link href="/vendor/orders" style={{ textDecoration: 'none' }}>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<ChevronLeft size={16} />}
            >
              Back to List
            </Button>
          </Link>
          <Badge
            size="lg"
            variant="filled"
            color={order.paymentStatus === 'paid' ? 'teal' : 'orange'}
          >
            PAYMENT: {order.paymentStatus?.toUpperCase()}
          </Badge>
        </Group>

        {/* Summary Section */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Box>
            <Title order={2} fw={900} lts="-1px">
              Order #{order.orderNumber.split('-').pop()?.toUpperCase()}
            </Title>
            <Text c="dimmed" size="sm">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                dateStyle: 'full',
              })}
            </Text>
          </Box>

          {/* Dynamic Money Card connected to item.status state */}
          <Paper
            withBorder
            p="md"
            radius="md"
            bg={revenueCardBg}
            style={{ transition: 'all 0.2s ease' }}
          >
            <Group justify="space-between" mb={5}>
              <Text size="xs" fw={700} c={`${revenueBadgeColor}.9`}>
                YOUR REVENUE
              </Text>
              <Badge
                size="xs"
                color={revenueBadgeColor}
                variant="filled"
                tt="uppercase"
              >
                {payoutStatusLabel}
              </Badge>
            </Group>

            <Text fw={900} fz="28px" c={`${revenueBadgeColor}.9`} lh={1}>
              ₦{myNetEarnings.toLocaleString()}
            </Text>

            <Group gap="xs" mt="sm">
              <Text size="xs" c="dimmed">
                Gross: ₦{myGrossTotal.toLocaleString()}
              </Text>
              <Text size="xs" c="red.8" fw={600}>
                Fees: -₦{totalCommission.toLocaleString()}
              </Text>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* Shipping & Customer Info */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs" c="indigo">
              <User size={16} />
              <Text fw={700} size="xs">
                CUSTOMER
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {order.shippingAddress?.fullName}
            </Text>
            <Text size="xs" c="dimmed">
              {order.shippingAddress.phone || 'Guest'}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs" c="indigo">
              <MapPin size={16} />
              <Text fw={700} size="xs">
                SHIPPING ADDRESS
              </Text>
            </Group>
            <Text size="sm" lineClamp={2}>
              {order.shippingAddress?.addressLine1},{' '}
              {order.shippingAddress?.city}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs" c="indigo">
              <CreditCard size={16} />
              <Text fw={700} size="xs">
                METHOD
              </Text>
            </Group>
            <Text size="sm" tt="capitalize">
              {order.paymentMethod}
            </Text>
            <Text size="xs" c="teal" fw={700}>
              Secure Transaction
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Product Details Table */}
        <Paper withBorder radius="md">
          <ScrollArea>
            <Table verticalSpacing="md" horizontalSpacing="lg">
              <TableThead bg="gray.0">
                <TableTr>
                  <TableTh>PRODUCT</TableTh>
                  <TableTh>QTY</TableTh>
                  <TableTh>STATUS</TableTh>
                  <TableTh style={{ textAlign: 'right' }}>EARNING</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {myItems.map((item, idx) => {
                  const currentStatus = item.status?.toLowerCase()
                  const currentVendorStatus = item.vendorStatus?.toLowerCase()

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
                    badgeLabel = 'Delivered'
                  } else if (
                    ['failed_attempt', 'returned'].includes(currentStatus)
                  ) {
                    badgeColor = 'red'
                    badgeLabel = currentStatus.replace('_', ' ')
                  } else if (currentStatus === 'cancelled') {
                    badgeColor = 'red'
                    badgeLabel = 'Cancelled'
                  }

                  return (
                    <TableTr key={idx}>
                      <TableTd>
                        <Group gap="sm">
                          <ThemeIcon size="sm" color="gray" variant="light">
                            <Package size={14} />
                          </ThemeIcon>
                          <Text size="sm" fw={600}>
                            {item.name}
                          </Text>
                        </Group>
                      </TableTd>
                      <TableTd>
                        <Text size="sm">{item.quantity}</Text>
                      </TableTd>
                      <TableTd>
                        <Badge variant="dot" color={badgeColor} tt="uppercase">
                          {badgeLabel}
                        </Badge>
                      </TableTd>
                      <TableTd style={{ textAlign: 'right' }}>
                        <Text size="sm" fw={700}>
                          ₦{item.vendorNetEarning?.toLocaleString()}
                        </Text>
                      </TableTd>
                    </TableTr>
                  )
                })}
              </TableTbody>
            </Table>
          </ScrollArea>
        </Paper>

        {/* Shipment Tasks Tracker */}
        <Title order={4} mt="md">
          Shipment Tasks
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {uniqueShipmentIds.length > 0 ? (
            uniqueShipmentIds.map((shipId) => (
              <Paper key={String(shipId)} withBorder p="md" radius="md">
                <Group justify="space-between">
                  <Group>
                    <ThemeIcon color="blue" variant="light">
                      <Truck size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={700}>
                        Fulfillment Task
                      </Text>
                      <Text size="xs" c="dimmed">
                        ID: {String(shipId).slice(-6).toUpperCase()}
                      </Text>
                    </Box>
                  </Group>
                  <Link
                    href={`/vendor/orders/${shipId}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button
                      size="compact-sm"
                      variant="light"
                      rightSection={<ExternalLink size={14} />}
                    >
                      Manage
                    </Button>
                  </Link>
                </Group>
              </Paper>
            ))
          ) : (
            <Text size="sm" c="dimmed italic">
              No active shipments found for these items.
            </Text>
          )}
        </SimpleGrid>
      </Stack>
    </Box>
  )
}