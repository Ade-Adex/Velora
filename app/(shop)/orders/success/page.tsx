//  /app/%28shop%29/orders/success/page.tsx


'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Alert,
  Flex,
  Loader,
  Center,
  Badge,
  Divider,
  Group,
  Stepper,
  Box,
  useMantineTheme,
  Anchor,
} from '@mantine/core'
import {
  CheckCircle,
  Building2,
  Truck,
  MapPin,
  CreditCard,
  Package,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { getOrderByIdAction } from '@/app/services/order-service'
import { IOrder, Serialized } from '@/app/types'
import { useMediaQuery } from '@mantine/hooks'
import dayjs from 'dayjs'

/**
 * Helper to determine the current Stepper index.
 * 0: Placed, 1: Processing, 2: Shipped, 3: Delivered
 */
const getStep = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 0
    case 'processing':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    default:
      return 0
  }
}

/**
 * Generates a tracking URL based on the carrier prefix.
 */
const getTrackingLink = (trackingNumber: string) => {
  if (!trackingNumber) return null
  const num = trackingNumber.toUpperCase()
  if (num.startsWith('GIG')) return `https://www.giglogistics.com/track/${num}`
  if (num.startsWith('DHL'))
    return `https://www.dhl.com/en/express/tracking.html?AWB=${num}`
  return `https://www.google.com/search?q=track+package+${num}`
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const method = searchParams.get('method')

  const [order, setOrder] = useState<Serialized<IOrder> | null>(null)
  const [loading, setLoading] = useState(true)

  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  useEffect(() => {
    if (orderId) {
      getOrderByIdAction(orderId).then((data) => {
        setOrder(data)
        setLoading(false)
      })
    }
  }, [orderId])

  if (loading) return <LoaderState />

  if (!order) {
    return (
      <Alert color="red" title="Order Not Found" radius="md">
        We couldn&apos;t retrieve the details for this order. Please check your
        profile or contact support.
      </Alert>
    )
  }

  return (
    <Paper withBorder p={{ base: 20, sm: 40 }} radius="xl" shadow="md">
      <Stack align="center" gap="xl">
        <CheckCircle size={60} color={theme.colors.green[6]} />

        <Stack gap={4} align="center">
          <Title order={1} ta="center" fz={{ base: 24, sm: 32 }} fw={900}>
            Order Confirmed!
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Thank you for your purchase,{' '}
            <b>{order.shippingAddress?.fullName.split(' ')[0]}</b>. <br />
            Order <b>#{order.orderNumber.split('-').pop()?.toUpperCase()}</b> is
            being prepared.
          </Text>
        </Stack>

        {/* VISUAL TRACKING STEPPER */}
        <Box w="100%" py="md">
          <Stepper
            active={getStep(order.orderStatus)}
            size="sm"
            allowNextStepsSelect={false}
            color="blue"
            orientation={isMobile ? 'vertical' : 'horizontal'}
          >
            <Stepper.Step label="Placed" icon={<Package size={18} />} />
            <Stepper.Step label="Processing" icon={<Building2 size={18} />} />
            <Stepper.Step label="Shipped" icon={<Truck size={18} />} />
            <Stepper.Step label="Delivered" icon={<CheckCircle size={18} />} />
          </Stepper>
        </Box>

        <Divider w="100%" label="Logistics & Payment" labelPosition="center" />

        {/* ORDER DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          {/* COLUMN 1: SHIPPING ADDRESS */}
          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <MapPin size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Shipping Address
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {order.shippingAddress?.fullName}
            </Text>
            <Text size="sm" c="dimmed">
              {order.shippingAddress?.addressLine1},{' '}
              {order.shippingAddress?.city}
            </Text>
          </Stack>

          {/* COLUMN 2: ORDER TRACKING */}
          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <Truck size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Delivery Tracking
              </Text>
            </Group>

            {order.trackingNumber ? (
              <Group justify="space-between" wrap="nowrap">
                <Badge color="blue" variant="dot" size="sm">
                  {order.orderStatus?.toUpperCase()}
                </Badge>
                <Anchor
                  href={getTrackingLink(order.trackingNumber) || '#'}
                  target="_blank"
                  size="xs"
                  fw={700}
                  display="flex"
                  style={{ alignItems: 'center', gap: '4px' }}
                >
                  {order.trackingNumber} <ExternalLink size={10} />
                </Anchor>
              </Group>
            ) : (
              <Badge color="blue" variant="light" radius="sm">
                {order.orderStatus?.toUpperCase() || 'PROCESSING'}
              </Badge>
            )}
          </Stack>

          {/* COLUMN 3: PAYMENT METHOD */}
          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <CreditCard size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Payment Method
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {method === 'card' ? 'Paystack (Secure Card)' : 'Bank Transfer'}
            </Text>
            <Badge
              color={order.paymentStatus === 'paid' ? 'green' : 'orange'}
              size="xs"
              variant="dot"
            >
              {order.paymentStatus?.toUpperCase()}
            </Badge>
          </Stack>

          {/* COLUMN 4: TOTAL AMOUNT */}
          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <CheckCircle size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Total Amount
              </Text>
            </Group>
            <Text size="xl" fw={900} c="blue.9">
              ₦{order.totals?.grandTotal.toLocaleString()}
            </Text>
          </Stack>
        </div>

        {/* BANK TRANSFER INSTRUCTIONS */}
        {method === 'transfer' && order.paymentStatus !== 'paid' && (
          <Alert
            icon={<Building2 size={20} />}
            title="Pending Transfer"
            color="blue"
            radius="md"
            w="100%"
          >
            <Text size="xs" mb={5}>
              Please transfer the exact total to confirm your order:
            </Text>
            <Box
              p="xs"
              className="bg-white/50 rounded-md border border-blue-100"
            >
              <Text size="xs" fw={700}>
                Bank: Zenith Bank
              </Text>
              <Text size="xs" fw={700}>
                Account: 1234567890
              </Text>
              <Text size="xs" fw={700}>
                Ref: {order.orderNumber}
              </Text>
            </Box>
          </Alert>
        )}

        {/* NAVIGATION ACTIONS */}
        <Flex
          mt={20}
          gap="md"
          direction={{ base: 'column', sm: 'row' }}
          w="100%"
        >
          <Button
            variant="filled"
            color="blue"
            component={Link}
            href="/profile?tab=orders"
            leftSection={<Package size={18} />}
            flex={1}
            size="md"
            radius="md"
          >
            Track in My Account
          </Button>

          <Button
            variant="light"
            color="gray"
            component={Link}
            href="/"
            flex={1}
            size="md"
            radius="md"
          >
            Back to Home
          </Button>
        </Flex>
      </Stack>
    </Paper>
  )
}

export default function OrderSuccessPage() {
  return (
    <Container size="sm" py={40}>
      <Suspense fallback={<LoaderState />}>
        <OrderSuccessContent />
      </Suspense>
    </Container>
  )
}

function LoaderState() {
  return (
    <Paper withBorder p={40} radius="xl" shadow="md">
      <Center h={200}>
        <Stack align="center" gap="xs">
          <Loader size="lg" color="blue" />
          <Text c="dimmed" size="sm" fw={500}>
            Fetching order details...
          </Text>
        </Stack>
      </Center>
    </Paper>
  )
}