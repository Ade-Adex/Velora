//  /app/(admin)/admin/logistics/page.tsx

export const dynamic = 'force-dynamic'

import {
  Box,
  Title,
  Text,
  Table,
  Badge,
  Paper,
  Group,
  Stack,
  ActionIcon,
  SimpleGrid,
  Progress,
  TextInput,
  Select,
  ThemeIcon,
  Tooltip,
  Menu,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
} from '@mantine/core'
import {
  Truck,
  Search,
  Filter,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  MoreVertical,
  MapPin,
} from 'lucide-react'
import connectDB from '@/app/lib/mongodb'
import { Shipment } from '@/app/models/Shipment'
import { IShipment, IUser, IOrder } from '@/app/types'
import Link from 'next/link'
import { JSX, ReactNode } from 'react'
import LogisticsActionMenu from '@/app/components/admin/LogisticsActionMenu' 



interface StatCardProps {
  title: string
  value: number
  icon: ReactNode
  color: string
}

// Populate types helper
interface PopulatedShipment extends Omit<IShipment, 'order' | 'vendor'> {
  order: Pick<IOrder, 'orderNumber'>
  vendor: Pick<IUser, 'fullName' | 'vendorProfile'>
}

export default async function AdminLogisticsPage() {
  await connectDB()

  const shipmentsData = await Shipment.find()
    .populate<{ order: Pick<IOrder, 'orderNumber'> }>('order', 'orderNumber')
    .populate<{
      vendor: Pick<IUser, 'fullName' | 'vendorProfile'>
    }>('vendor', 'fullName vendorProfile')
    .sort({ createdAt: -1 })
    .lean()

  const shipments = shipmentsData as unknown as PopulatedShipment[]

  // KPI Logic (keeping your existing logic)
  const stats = {
    total: shipments.length,
    pending: shipments.filter(
      (s) => s.status === 'label_created' || s.status === 'pickup_pending',
    ).length,
    active: shipments.filter(
      (s) => s.status === 'in_transit' || s.status === 'out_for_delivery',
    ).length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
  }

  const getStatusVisuals = (status: IShipment['status']) => {
    const configs: Record<
      IShipment['status'],
      { color: string; icon: JSX.Element; progress: number }
    > = {
      label_created: { color: 'gray', icon: <Clock size={14} />, progress: 15 },
      pickup_pending: {
        color: 'orange',
        icon: <Package size={14} />,
        progress: 35,
      },
      in_transit: { color: 'blue', icon: <Truck size={14} />, progress: 65 },
      out_for_delivery: {
        color: 'indigo',
        icon: <Truck size={14} />,
        progress: 90,
      },
      delivered: {
        color: 'teal',
        icon: <CheckCircle2 size={14} />,
        progress: 100,
      },
      failed_attempt: {
        color: 'red',
        icon: <AlertCircle size={14} />,
        progress: 65,
      },
      returned: {
        color: 'pink',
        icon: <AlertCircle size={14} />,
        progress: 100,
      },
    }
    return (
      configs[status] || {
        color: 'gray',
        icon: <Clock size={14} />,
        progress: 0,
      }
    )
  }

  return (
    <Box p="md">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={0}>
            <Title order={2} fw={900} lts="-1px">
              Logistics Command Center
            </Title>
            <Text c="dimmed" size="sm">
              Admin control for platform-wide shipment lifecycle.
            </Text>
          </Stack>
        </Group>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <StatCard
            title="Total Volume"
            value={stats.total}
            icon={<Package size={20} />}
            color="blue"
          />
          <StatCard
            title="Awaiting Pickup"
            value={stats.pending}
            icon={<Clock size={20} />}
            color="orange"
          />
          <StatCard
            title="Active Fleet"
            value={stats.active}
            icon={<Truck size={20} />}
            color="indigo"
          />
          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon={<CheckCircle2 size={20} />}
            color="teal"
          />
        </SimpleGrid>

        {/* Search Bar */}
        <Paper withBorder p="sm" radius="md">
          <Group gap="sm">
            <TextInput
              placeholder="Tracking ID..."
              style={{ flex: 1 }}
              leftSection={<Search size={16} />}
            />
            <Select
              placeholder="Carrier"
              data={['Velora Logistics', 'DHL']}
              w={150}
            />
          </Group>
        </Paper>

        {/* Table */}
        <Paper withBorder radius="md">
          <Table verticalSpacing="md" highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Reference</TableTh>
                <TableTh>Vendor</TableTh>
                <TableTh>Progress</TableTh>
                <TableTh>Carrier</TableTh>
                <TableTh style={{ width: 100 }}>Actions</TableTh>
              </TableTr>
            </TableThead>

            <TableTbody>
              {shipments.map((shipment) => {
                const visual = getStatusVisuals(shipment.status)
                const shipmentId = String(shipment._id)

                return (
                  <TableTr key={shipmentId}>
                    <TableTd>
                      <Stack gap={0}>
                        <Text size="sm" fw={800}>
                          #{shipment.order?.orderNumber}
                        </Text>
                        <Text size="10px" c="dimmed">
                          {shipment.trackingNumber || 'UNASSIGNED'}
                        </Text>
                      </Stack>
                    </TableTd>

                    <TableTd>
                      <Text size="sm">
                        {shipment.vendor?.vendorProfile?.shopName ||
                          'Marketplace Vendor'}
                      </Text>
                    </TableTd>

                    <TableTd>
                      <Box w={200}>
                        <Group justify="space-between" mb={4}>
                          <Badge color={visual.color} size="sm" variant="light">
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                          <Text size="xs" fw={700}>
                            {visual.progress}%
                          </Text>
                        </Group>
                        <Progress
                          color={visual.color}
                          value={visual.progress}
                          size="xs"
                          radius="xl"
                          animated={shipment.status === 'in_transit'}
                        />
                      </Box>
                    </TableTd>

                    <TableTd>
                      <Text size="sm">{shipment.carrier}</Text>
                    </TableTd>

                    <TableTd>
                      <Group gap={4} wrap="nowrap">
                        <LogisticsActionMenu
                          shipmentId={shipmentId}
                          currentStatus={shipment.status}
                        />

                        <Tooltip label="View Full Details">
                          <Link
                            href={`/admin/logistics/${shipmentId}`}
                            style={{ textDecoration: 'none', display: 'flex' }}
                          >
                            <ActionIcon variant="subtle" color="gray">
                              <ExternalLink size={16} />
                            </ActionIcon>
                          </Link>
                        </Tooltip>
                      </Group>
                    </TableTd>
                  </TableTr>
                )
              })}
            </TableTbody>
          </Table>
        </Paper>
      </Stack>
    </Box>
  )
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{ borderLeft: `4px solid var(--mantine-color-${color}-6)` }}
    >
      <Group justify="space-between">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            {title}
          </Text>
          <Text size="h3" fw={900}>
            {value.toLocaleString()}
          </Text>
        </Stack>
        <ThemeIcon color={color} variant="light" size={44} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}