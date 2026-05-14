// /app/(vendor)/vendor/orders/[id]/page.tsx
import connectDB from '@/app/lib/mongodb'
import { Shipment } from '@/app/models/Shipment'
import { notFound } from 'next/navigation'
import {
  Stack,
  Title,
  Text,
  Paper,
  Badge,
  Group,
  Box,
  ThemeIcon,
  Divider,
} from '@mantine/core'
import { Package, MapPin, Truck } from 'lucide-react'
import VendorShipmentForm from '@/app/components/vendor/VendorShipmentForm'
import { IShipment, IOrder } from '@/app/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VendorShipmentPage({ params }: PageProps) {
  const { id } = await params
  await connectDB()

  // Find the shipment and cast to IShipment
  const shipment = (await Shipment.findOne({ _id: id }).populate('order')) as
    | (IShipment & { order: IOrder })
    | null

  if (!shipment) notFound()

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      label_created: 'gray',
      ready_for_pickup: 'orange',
      shipped: 'blue',
      delivered: 'green',
    }
    return map[status] || 'gray'
  }

  return (
    <div className="px-2 py-2">
      <Stack gap="xl">
        <Box>
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Title order={2} fw={900}>
                Fulfillment Task
              </Title>
              <Text size="sm" c="dimmed">
                Shipment ID: {String(shipment._id).toUpperCase()}
              </Text>
            </Stack>
            <Badge
              size="xl"
              variant="filled"
              color={getStatusColor(shipment.status)}
            >
              {shipment.status.replace('_', ' ')}
            </Badge>
          </Group>
        </Box>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Paper withBorder p="xl" radius="md">
              <Group mb="lg">
                <ThemeIcon variant="light" size="lg">
                  <Package size={20} />
                </ThemeIcon>
                <Text fw={700}>Items to Include</Text>
              </Group>
              <Stack gap="md">
                {shipment.orderItems.map((item, idx) => (
                  <Group key={idx} justify="space-between">
                    <Text size="sm" fw={500}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Badge variant="outline" color="gray">
                      Ready
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Paper>

            <VendorShipmentForm
              shipmentId={String(shipment._id)}
              currentStatus={shipment.status}
              currentTracking={shipment.trackingNumber || ''}
            />
          </div>

          <div className="space-y-6">
            <Paper withBorder p="xl" radius="md">
              <Stack gap="md">
                <Group gap="xs">
                  <MapPin size={18} className="text-indigo-600" />
                  <Text fw={700} size="sm">
                    Delivery Destination
                  </Text>
                </Group>

                <Box>
                  <Text size="sm" fw={600}>
                    {shipment.order?.shippingAddress?.fullName || 'Customer'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {shipment.order?.shippingAddress?.addressLine1}
                    <br />
                    {shipment.order?.shippingAddress?.city},{' '}
                    {shipment.order?.shippingAddress?.state}
                  </Text>
                </Box>

                <Divider />

                <Group gap="xs">
                  <Truck size={18} className="text-gray-500" />
                  <Text size="sm" fw={600}>
                    Logistics Provider
                  </Text>
                </Group>
                <Badge variant="outline" color="gray" fullWidth>
                  {shipment.carrier || 'Standard Shipping'}
                </Badge>
              </Stack>
            </Paper>
          </div>
        </div>
      </Stack>
    </div>
  )
}
