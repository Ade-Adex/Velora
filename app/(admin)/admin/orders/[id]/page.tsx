import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import StatusUpdateForm from '@/app/components/admin/StatusUpdateForm'
import { notFound } from 'next/navigation'
import {
  Container,
  Grid,
  Title,
  Text,
  Paper,
  Stack,
  Divider,
  Group,
} from '@mantine/core'
import { IOrderItem } from '@/app/types'

// Define the shape of the Page Props for Next.js 15
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SingleOrderPage({ params }: PageProps) {
  // 1. Await the params to unwrap the ID
  const { id } = await params

  await connectDB()

  // 2. Use the unwrapped id
  const order = await Order.findById(id).populate('user').lean()

  if (!order) notFound()

  return (
    <Container size="xl" py="xl">
      <header className="mb-xl">
        <Title order={2} fw={900}>
          Management:{' '}
          <span className="text-blue-600">#{order.orderNumber}</span>
        </Title>
        <Text size="sm" c="dimmed">
          View line items and update fulfillment status
        </Text>
      </header>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="xl" withBorder radius="md" shadow="sm">
            <Text fw={700} mb="md" size="lg">
              Order Items
            </Text>
            <Stack gap="md">
              {order.items.map((item: IOrderItem, idx: number) => (
                <Group key={idx} justify="space-between" align="center">
                  <Stack gap={2}>
                    <Text size="sm" fw={600}>
                      {item.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      SKU: {item.variantSku || 'N/A'} — Quantity:{' '}
                      {item.quantity}
                    </Text>
                  </Stack>
                  <Text size="sm" fw={700}>
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </Text>
                </Group>
              ))}

              <Divider my="sm" variant="dashed" />

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Subtotal
                  </Text>
                  <Text size="sm">
                    ₦{order.totals.subtotal.toLocaleString()}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Shipping
                  </Text>
                  <Text size="sm">
                    ₦{order.totals.shipping.toLocaleString()}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={900} size="xl">
                    Total Paid
                  </Text>
                  <Text fw={900} size="xl" c="blue.9">
                    ₦{order.totals.grandTotal.toLocaleString()}
                  </Text>
                </Group>
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            <Paper p="xl" withBorder radius="md" shadow="sm" bg="gray.0">
              <Text fw={700} mb="md">
                Update Status
              </Text>
              <StatusUpdateForm
                orderId={order._id.toString()}
                currentStatus={order.orderStatus}
              />
            </Paper>

            <Paper p="xl" withBorder radius="md">
              <Text fw={700} mb="xs">
                Shipping Address
              </Text>
              <Text size="sm">{order.shippingAddress.fullName}</Text>
              <Text size="sm">{order.shippingAddress.addressLine1}</Text>
              <Text size="sm">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </Text>
              <Text size="sm" fw={600} mt="xs">
                {order.shippingAddress.phone}
              </Text>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
