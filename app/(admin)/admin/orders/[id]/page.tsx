import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import StatusUpdateForm from '@/app/components/admin/StatusUpdateForm'
import { notFound } from 'next/navigation'
import {
  Container,
  Grid,
  GridCol,
  Title,
  Text,
  Paper,
  Stack,
  Divider,
  Group,
  Badge,
  ActionIcon,
  Box,
  ThemeIcon,
} from '@mantine/core'
import { IOrderItem } from '@/app/types'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  CreditCard,
  Calendar,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SingleOrderPage({ params }: PageProps) {
  const { id } = await params
  await connectDB()

  const order = await Order.findById(id).populate('user').lean()
  if (!order) notFound()

  // Helper for status colors
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red',
    }
    return map[status] || 'gray'
  }

  return (
    <Container size="xl" py="xl">
      {/* 1. TOP NAVIGATION & HEADER */}
      <Stack gap="lg" mb="xl">
        <Link
          href="/admin/orders"
          style={{ textDecoration: 'none', width: 'fit-content' }}
        >
          <Group gap={5} c="dimmed">
            <ArrowLeft size={16} />
            <Text size="sm" fw={500}>
              Back to Orders
            </Text>
          </Group>
        </Link>

        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap="sm" mb={4}>
              <Title order={2} fw={900} lts="-0.5px">
                Order{' '}
                <span style={{ color: 'var(--mantine-color-blue-filled)' }}>
                  #{order.orderNumber}
                </span>
              </Title>
              <Badge
                size="lg"
                variant="light"
                color={getStatusColor(order.orderStatus)}
              >
                {order.orderStatus}
              </Badge>
            </Group>
            <Group gap="xs" c="dimmed">
              <Calendar size={14} />
              <Text size="sm">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </Text>
            </Group>
          </Box>

          <Box className="hidden md:block">
            <Text size="xs" fw={700} c="dimmed" ta="right">
              CUSTOMER ID
            </Text>
            <Text size="sm" fw={500}>
              {order.user?._id.toString().slice(-8).toUpperCase()}
            </Text>
          </Box>
        </Group>
      </Stack>

      <Grid gap="xl">
        {/* 2. LEFT COLUMN: ITEMS & PAYMENT */}
        <GridCol span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            <Paper p="xl" withBorder radius="md" shadow="sm">
              <Group mb="xl">
                <ThemeIcon variant="light" size="lg" radius="md">
                  <Package size={20} />
                </ThemeIcon>
                <Text fw={700} size="lg">
                  Order Items
                </Text>
              </Group>

              <Stack gap="md">
                {order.items.map((item: IOrderItem, idx: number) => (
                  <Group
                    key={idx}
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <Group align="flex-start" wrap="nowrap">
                      {/* Placeholder for Product Image if you have it */}
                      <Box
                        w={50}
                        h={50}
                        bg="gray.1"
                        style={{ borderRadius: '8px', flexShrink: 0 }}
                        className="flex items-center justify-center"
                      >
                        <Package size={20} color="gray" />
                      </Box>
                      <Stack gap={2}>
                        <Text size="sm" fw={700} lineClamp={1}>
                          {item.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          SKU: {item.variantSku || 'N/A'}
                        </Text>
                        <Text
                          size="xs"
                          fw={600}
                          bg="gray.1"
                          px={6}
                          py={2}
                          style={{ borderRadius: '4px', width: 'fit-content' }}
                        >
                          Qty: {item.quantity}
                        </Text>
                      </Stack>
                    </Group>
                    <Text size="sm" fw={800}>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </Group>
                ))}

                <Divider my="md" variant="dashed" />

                <Box bg="gray.0" p="md" style={{ borderRadius: '8px' }}>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Subtotal
                      </Text>
                      <Text size="sm" fw={500}>
                        ₦{order.totals.subtotal.toLocaleString()}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Shipping Fee
                      </Text>
                      <Text size="sm" fw={500}>
                        ₦{order.totals.shipping.toLocaleString()}
                      </Text>
                    </Group>
                    <Divider my={4} />
                    <Group justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon color="blue" size="sm" variant="light">
                          <CreditCard size={12} />
                        </ThemeIcon>
                        <Text fw={800} size="lg">
                          Total Paid
                        </Text>
                      </Group>
                      <Text fw={900} size="xl" c="blue.9">
                        ₦{order.totals.grandTotal.toLocaleString()}
                      </Text>
                    </Group>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </GridCol>

        {/* 3. RIGHT COLUMN: ACTIONS & CUSTOMER */}
        <GridCol span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Status Update Card */}
            <Paper
              p="md"
              withBorder
              radius="md"
              shadow="sm"
              style={{
                borderTop: '4px solid var(--mantine-color-blue-filled)',
              }}
            >
              <Text fw={700} mb="md" size="md">
                Logistics Management
              </Text>
              <StatusUpdateForm
                orderId={order._id.toString()}
                currentStatus={order.orderStatus}
              />
            </Paper>

            {/* Customer Details Card */}
            <Paper p="xl" withBorder radius="md">
              <Group mb="md" gap="xs">
                <User size={18} />
                <Text fw={700}>Customer Details</Text>
              </Group>
              <Text size="sm" fw={600}>
                {order.user?.fullName ?? 'Guest Checkout'}
              </Text>
              <Text size="xs" c="dimmed" mb="md">
                {order.user?.email}
              </Text>

              <Divider mb="md" />

              <Group mb="xs" gap="xs">
                <Truck size={18} />
                <Text fw={700} size="sm">
                  Shipping Address
                </Text>
              </Group>
              <Stack gap={2}>
                <Text size="sm">{order.shippingAddress.fullName}</Text>
                <Text size="sm" c="dimmed">
                  {order.shippingAddress.addressLine1}
                </Text>
                <Text size="sm" c="dimmed">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </Text>
                <Text size="sm" fw={700} mt="xs" c="blue">
                  {order.shippingAddress.phone}
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </GridCol>
      </Grid>
    </Container>
  )
}
