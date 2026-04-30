import {
  Table,
  Badge,
  Button,
  Title,
  Paper,
  Container,
  Text,
  Group,
  Stack,
} from '@mantine/core'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { IOrder, IUser } from '@/app/types'
import { Types } from 'mongoose'

// We create a specific type for the Order after population
// This takes everything from IOrder but replaces 'user' with the IUser object
type PopulatedOrder = Omit<IOrder, 'user'> & {
  user: Pick<IUser, 'fullName' | 'email'> | null
  _id: Types.ObjectId // Ensures the ID is treated as a Mongoose ID object
}

export default async function AdminOrdersPage() {
  await connectDB()

  // Execute query and cast specifically to our PopulatedOrder array
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate<{
      user: Pick<IUser, 'fullName' | 'email'>
    }>('user', 'fullName email')
    .lean<PopulatedOrder[]>()

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <header>
          <Title order={2} fw={900} lts="-0.5px">
            Customer Orders
          </Title>
          <Text c="dimmed" size="sm">
            Review and manage fulfillment for all store transactions
          </Text>
        </header>

        <Paper
          radius="md"
          withBorder
          shadow="xs"
          p="0"
          className="overflow-hidden"
        >
          <Table verticalSpacing="md" highlightOnHover>
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Order Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Customer Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Fulfillment
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id.toString()}
                  className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <Text fw={800} size="sm" c="blue.9">
                      #{order.orderNumber}
                    </Text>
                  </td>

                  <td className="px-4 py-4">
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>
                        {order.user?.fullName ?? 'Guest User'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {order.user?.email ?? 'No email'}
                      </Text>
                    </Stack>
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      variant="dot"
                      color={
                        order.orderStatus === 'delivered'
                          ? 'green'
                          : order.orderStatus === 'pending'
                            ? 'orange'
                            : 'blue'
                      }
                    >
                      {order.orderStatus.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="px-4 py-4">
                    <Text fw={700} size="sm">
                      ₦{order.totals.grandTotal.toLocaleString()}
                    </Text>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order._id.toString()}`}
                      className="no-underline"
                    >
                      <Button
                        variant="subtle"
                        color="gray"
                        size="xs"
                        radius="md"
                      >
                        Manage
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {orders.length === 0 && (
            <Stack align="center" py={80} gap="xs">
              <Text fw={700} c="dimmed">
                No orders found
              </Text>
              <Text size="sm" c="dimmed">
                Transactions will appear here once customers checkout.
              </Text>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  )
}
