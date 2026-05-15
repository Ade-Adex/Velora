
// /app/(admin)/admin/logistics/page.tsx


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
  ThemeIcon,
  ScrollArea,
  Center,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
} from '@mantine/core'
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Package,
  FilterX,
  AlertCircle,
  Ship,
} from 'lucide-react'
import connectDB from '@/app/lib/mongodb'
import { Shipment } from '@/app/models/Shipment'
import { IShipment, IOrder } from '@/app/types'
import Link from 'next/link'
import { ReactNode } from 'react'
import LogisticsActionMenu from '@/app/components/admin/LogisticsActionMenu'
import SearchInput from '@/app/components/admin/SearchInput'
import FilterSelect from '@/app/components/admin/FilterSelect'
import { Filter as MongoFilter } from 'mongodb'
import LogisticsPagination from '@/app/components/admin/LogisticsPagination'

export const dynamic = 'force-dynamic'

interface PopulatedShipment extends Omit<
  IShipment,
  'order' | 'vendor' | '_id'
> {
  _id: string
  order: Pick<IOrder, 'orderNumber'>
  vendor: {
    fullName: string
    vendorProfile?: { shopName: string }
  }
}

export default async function AdminLogisticsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const { q, status, page } = await searchParams
  await connectDB()

  const queryText = q || ''
  const statusFilter = status || ''
  const activePage = Math.max(1, parseInt(page || '1'))
  const itemsPerPage = 10

  const dbQuery: MongoFilter<IShipment> = {}

  if (queryText) {
    dbQuery.$or = [
      { trackingNumber: { $regex: queryText, $options: 'i' } },
      { 'orderItems.name': { $regex: queryText, $options: 'i' } },
    ]
  }

  if (statusFilter && statusFilter !== 'all') {
    dbQuery.status = statusFilter as IShipment['status']
  }

  const [shipments, totalDocs, statsData] = await Promise.all([
    Shipment.find(dbQuery)
      .populate('order', 'orderNumber')
      .populate('vendor', 'fullName vendorProfile')
      .sort({ createdAt: -1 })
      .skip((activePage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .lean<PopulatedShipment[]>(),
    Shipment.countDocuments(dbQuery),
    Shipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ])

  const totalPages = Math.ceil(totalDocs / itemsPerPage)

  const getStatCount = (statuses: string[]) =>
    statsData
      .filter((s) => statuses.includes(s._id))
      .reduce((acc, curr) => acc + curr.count, 0)

  const stats = [
    {
      title: 'Active Fleet',
      value: totalDocs,
      icon: <Ship size={20} />,
      color: 'blue',
      desc: 'Total filtered shipments',
    },
    {
      title: 'In Transit',
      value: getStatCount(['in_transit', 'out_for_delivery']),
      icon: <Clock size={20} />,
      color: 'orange',
      desc: 'Moving toward Hub',
    },
    {
      title: 'Received at Hub',
      value: getStatCount(['delivered']),
      icon: <CheckCircle2 size={20} />,
      color: 'teal',
      desc: 'Ready for processing',
    },
    {
      title: 'Failed/Returned',
      value: getStatCount(['failed_attempt', 'returned']),
      icon: <AlertCircle size={20} />,
      color: 'red',
      desc: 'Needs investigation',
    },
  ]

  const getStatusConfig = (status: IShipment['status']) => {
    const configs: Record<
      IShipment['status'],
      { color: string; label: string; progress: number }
    > = {
      label_created: { color: 'gray', label: 'Processing', progress: 15 },
      pickup_pending: {
        color: 'orange',
        label: 'Awaiting Pickup',
        progress: 30,
      },
      in_transit: { color: 'blue', label: 'In Transit', progress: 60 },
      out_for_delivery: {
        color: 'indigo',
        label: 'Out for Delivery',
        progress: 85,
      },
      delivered: { color: 'teal', label: 'Arrived at Hub', progress: 100 },
      failed_attempt: { color: 'red', label: 'Failed', progress: 60 },
      returned: { color: 'pink', label: 'Returned', progress: 100 },
    }
    return configs[status] || configs.label_created
  }

  return (
    <Box
      p={{ base: 'xs', sm: 'md', md: 'xl' }}
      bg="var(--mantine-color-gray-0)"
      mih="100vh"
    >
      <Stack gap="xl">
        <Stack gap={4}>
          <Group gap="xs">
            <ThemeIcon variant="filled" color="blue" size="lg" radius="md">
              <Package size={20} />
            </ThemeIcon>
            <Title order={2} fw={800} lts="-0.5px">
              Logistics Hub
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            Admin oversight for vendor-to-hub shipments.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </SimpleGrid>

        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group align="flex-end">
            <Box style={{ flex: 1 }}>
              <SearchInput
                defaultValue={queryText}
                placeholder="Search Tracking # or Product..."
              />
            </Box>
            <FilterSelect
              defaultValue={statusFilter}
              data={[
                { value: 'all', label: 'All Statuses' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'delivered', label: 'Arrived at Hub' },
                { value: 'failed_attempt', label: 'Failed Attempts' },
              ]}
            />
          </Group>
        </Paper>

        <Paper
          withBorder
          radius="md"
          shadow="sm"
          style={{ overflow: 'hidden' }}
        >
          <ScrollArea scrollbars="x">
            <Table
              verticalSpacing="md"
              horizontalSpacing="lg"
              highlightOnHover
              striped
            >
              <TableThead bg="gray.1">
                <TableTr>
                  <TableTh>Order Info</TableTh>
                  <TableTh>Origin Vendor</TableTh>
                  <TableTh w={220}>Pipeline Progress</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh align="right">Actions</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {shipments.length > 0 ? (
                  shipments.map((shipment) => {
                    const config = getStatusConfig(shipment.status)
                    return (
                      <TableTr key={shipment._id}>
                        <TableTd>
                          <Stack gap={0}>
                            <Text size="sm" fw={700}>
                              #{shipment.order?.orderNumber}
                            </Text>
                            <Text size="xs" c="dimmed" ff="monospace">
                              {shipment.trackingNumber || 'PENDING'}
                            </Text>
                          </Stack>
                        </TableTd>
                        <TableTd>
                          <Text size="sm" fw={500}>
                            {shipment.vendor?.vendorProfile?.shopName ||
                              shipment.vendor?.fullName}
                          </Text>
                        </TableTd>
                        <TableTd>
                          <Stack gap={4}>
                            <Group justify="space-between">
                              <Text size="10px" fw={700} c={config.color}>
                                {config.progress}%
                              </Text>
                            </Group>
                            <Progress
                              color={config.color}
                              value={config.progress}
                              size="xs"
                              radius="xl"
                              animated={[
                                'in_transit',
                                'out_for_delivery',
                              ].includes(shipment.status)}
                            />
                          </Stack>
                        </TableTd>
                        <TableTd>
                          <Badge
                            color={config.color}
                            variant="dot"
                            size="md"
                            radius="xs"
                          >
                            {config.label}
                          </Badge>
                          <Text size="xs">{shipment.carrier}</Text>
                        </TableTd>
                        <TableTd>
                          <Group gap={4} justify="flex-end">
                            <LogisticsActionMenu
                              shipmentId={shipment._id}
                              currentStatus={shipment.status}
                            />
                            <Link href={`/admin/logistics/${shipment._id}`}>
                              <ActionIcon variant="subtle" color="gray">
                                <ExternalLink size={16} />
                              </ActionIcon>
                            </Link>
                          </Group>
                        </TableTd>
                      </TableTr>
                    )
                  })
                ) : (
                  <TableTr>
                    <TableTd colSpan={5}>
                      <Center p="xl">
                        <Stack align="center" gap="xs">
                          <FilterX size={32} color="gray" />
                          <Text c="dimmed">
                            No shipments match your filters.
                          </Text>
                        </Stack>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </ScrollArea>
        </Paper>

        <Group justify="center">
          <LogisticsPagination
            totalPages={totalPages}
            activePage={activePage}
            queryText={queryText}
            statusFilter={statusFilter}
          />
        </Group>
      </Stack>
    </Box>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  desc,
}: {
  title: string
  value: number
  icon: ReactNode
  color: string
  desc: string
}) {
  return (
    <Paper withBorder p="md" radius="md" bg="white" shadow="xs">
      <Group justify="space-between">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            {title}
          </Text>
          <Text size="xl" fw={900}>
            {value.toLocaleString()}
          </Text>
          <Text size="10px" c="dimmed">
            {desc}
          </Text>
        </Stack>
        <ThemeIcon color={color} variant="light" size={44} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}
