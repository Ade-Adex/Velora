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
} from '@mantine/core'
import {
  CheckCircle,
  Building2,
  Truck,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { getOrderByIdAction } from '@/app/services/order-service'
import { IOrder, Serialized } from '@/app/types'
import { useMediaQuery } from '@mantine/hooks'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const method = searchParams.get('method')

  const [order, setOrder] = useState<Serialized<IOrder> | null>(null)
  const [loading, setLoading] = useState(true)

  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  // Logic to determine the current step based on order status
  const getStep = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'processing':
        return 1
      case 'shipped':
        return 2
      case 'delivered':
        return 3
      default:
        return 1
    }
  }

  useEffect(() => {
    if (orderId) {
      getOrderByIdAction(orderId).then((data) => {
        setOrder(data)
        setLoading(false)
      })
    }
  }, [orderId])

  if (loading) {
    return <LoaderState />
  }

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
        <CheckCircle size={60} color="#40C057" />

        <Stack gap={4} align="center">
          <Title order={1} ta="center" fz={{ base: 24, sm: 32 }} fw={900}>
            Order Confirmed!
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Thank you for your purchase,{' '}
            {order.shippingAddress?.fullName.split(' ')[0]}. <br />
            Order <b>#{order.orderNumber.split('-').pop()?.toUpperCase()}</b> is
            being prepared.
          </Text>
        </Stack>

        {/* VISUAL TRACKING STEPPER */}
        <Box w="100%" py="xl">
          <Stepper
            active={getStep(order.orderStatus)}
            size="sm"
            allowNextStepsSelect={false}
            color="blue"
            orientation={isMobile ? 'vertical' : 'horizontal'}
          >
            <Stepper.Step
              label="Placed"
              description="Confirmed"
              icon={<Package size={18} />}
            />
            <Stepper.Step
              label="Processing"
              description="Preparing"
              icon={<Building2 size={18} />}
            />
            <Stepper.Step
              label="Shipped"
              description="On the way"
              icon={<Truck size={18} />}
            />
            <Stepper.Step
              label="Delivered"
              description="Received"
              icon={<CheckCircle size={18} />}
            />
          </Stepper>
        </Box>

        <Divider w="100%" label="Order Summary" labelPosition="center" />

        {/* ORDER DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <MapPin size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Shipping Address
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {order.shippingAddress?.addressLine1 ?? 'No address provided'}
            </Text>
            <Text size="sm" c="dimmed">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </Text>
          </Stack>

          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <Truck size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Delivery Status
              </Text>
            </Group>
            <Badge color="blue" variant="light" radius="sm">
              {order.orderStatus?.toUpperCase() || 'PENDING'}
            </Badge>
            <Text size="xs" c="dimmed">
              Tracking:{' '}
              <span className="font-mono">
                {order.trackingNumber || 'Processing...'}
              </span>
            </Text>
          </Stack>

          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <CreditCard size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Payment Method
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {method === 'card' ? 'Paystack (Card/Transfer)' : 'Bank Transfer'}
            </Text>
            <Badge
              color={order.paymentStatus === 'paid' ? 'green' : 'orange'}
              size="xs"
              variant="dot"
            >
              {order.paymentStatus?.toUpperCase()}
            </Badge>
          </Stack>

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
            title="Action Required: Complete your Transfer"
            color="blue"
            radius="md"
            w="100%"
          >
            <Text size="xs" mb={5}>
              Please transfer the exact total to the account below to avoid
              delays:
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
          mt={{ base: 40, sm: 'xl' }}
          gap={{ base: 'lg', sm: 'md' }}
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
            py={10}
            radius="md"
            styles={{
              root: { height: 'auto' }, // Allows padding to dictate the height
              inner: { fontSize: '16px' }, // Ensures text remains legible
            }}
          >
            Order History
          </Button>

          <Button
            variant="light"
            color="gray"
            component={Link}
            href="/"
            flex={1}
            size="md"
            py={10}
            radius="md"
            styles={{
              root: { height: 'auto' },
              inner: { fontSize: '16px' },
            }}
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
    <Container size="sm" py={20}>
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
            Updating order status...
          </Text>
        </Stack>
      </Center>
    </Paper>
  )
} 