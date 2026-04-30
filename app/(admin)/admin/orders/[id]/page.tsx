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

export default async function SingleOrderPage({
  params,
}: {
  params: { id: string }
}) {
  await connectDB()
  const order = await Order.findById(params.id).populate('user')
  if (!order) notFound()

  return (
    <Container size="xl">
      <Title order={2} mb="xl">
        Management: {order.orderNumber}
      </Title>
      <Grid gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="xl" withBorder radius="md">
            <Text fw={700} mb="md">
              Order Items
            </Text>
            <Stack gap="sm">
              {order.items.map((item: IOrderItem, idx: number) => (
                <Group key={idx} justify="space-between">
                  <Text size="sm">
                    {item.name} (x{item.quantity})
                  </Text>
                  <Text size="sm" fw={700}>
                    ₦{item.price.toLocaleString()}
                  </Text>
                </Group>
              ))}
              <Divider my="sm" />
              <Group justify="space-between">
                <Text fw={900}>Total Paid</Text>
                <Text fw={900} size="lg">
                  ₦{order.totals.grandTotal.toLocaleString()}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatusUpdateForm
            orderId={order._id.toString()}
            currentStatus={order.orderStatus}
          />
        </Grid.Col>
      </Grid>
    </Container>
  )
}
