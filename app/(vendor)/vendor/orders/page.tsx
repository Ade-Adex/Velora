//  /app/(vendor)/vendor/orders/page.tsx

import {
  Box,
  Title,
  Text,
  Group,
  Button,
  Table,
  Badge,
  Avatar,
  Paper,
  Menu,
  ActionIcon,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  MenuTarget,
  MenuDropdown,
  MenuItem,
  MenuDivider,
  Tooltip,
} from '@mantine/core'
import { Eye, Package } from 'lucide-react'
import { getVendorOrders } from '@/app/services/vendor-service'
import { Serialized, IOrder } from '@/app/types'

export default async function VendorOrdersPage() {
  const orders: Serialized<IOrder>[] = await getVendorOrders()

  return (
    <Box>
      <Title order={2} fw={800} mb="lg">
        Order Fulfillment
      </Title>

      <Paper withBorder radius="md" className="overflow-hidden">
        <Table verticalSpacing="lg">
          <TableThead bg="gray.0">
            <TableTr>
              <TableTh>Order #</TableTh>
              <TableTh>Your Items</TableTh>
              <TableTh>Earnings</TableTh>
              <TableTh>Status</TableTh>
              <TableTh />
            </TableTr>
          </TableThead>
          <TableTbody>
            {orders.map((order) => (
              <TableTr key={order._id}>
                <TableTd>
                  <Text size="sm" fw={700}>
                    {order.orderNumber}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </TableTd>
                <TableTd>
                  {order.items.map((item, idx) => (
                    <Box key={idx} mb={4}>
                      <Text size="sm" fw={500}>
                        {item.quantity}x {item.name}
                      </Text>
                      <Badge size="xs" variant="outline">
                        {item.fulfillmentStatus}
                      </Badge>
                    </Box>
                  ))}
                </TableTd>
                <TableTd>
                  <Text size="sm" fw={700} c="green.7">
                    ₦
                    {order.items
                      .reduce(
                        (acc, item) => acc + (item.vendorNetEarning || 0),
                        0,
                      )
                      .toLocaleString()}
                  </Text>
                </TableTd>
                <TableTd>
                  <Badge
                    color={order.paymentStatus === 'paid' ? 'green' : 'orange'}
                    variant="filled"
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableTd>
                <TableTd>
                  <Tooltip label="Update Shipment">
                    <ActionIcon color="indigo" variant="light">
                      <Package size={16} />
                    </ActionIcon>
                  </Tooltip>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>
    </Box>
  )
}