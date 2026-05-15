//  /app/(vendor)/vendor/DashboardClient.tsx

'use client'

import {
  Stack,
  Title,
  Grid,
  GridCol,
  Paper,
  Text,
  Group,
  Button,
  Badge,
  ActionIcon,
  Table,
  ScrollArea,
  Avatar,
  Box,
  Menu,
  rem,
  Alert,
} from '@mantine/core'
import {
  Plus,
  MoreHorizontal,
  TrendingUp,
  Eye,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import AdminStats from '@/app/components/admin/AdminStats'
import { IUser, IOrder, StatItem, Serialized } from '@/app/types'

interface DashboardClientProps {
  user: Serialized<IUser>
  allOrders: Serialized<IOrder>[]
  stats: StatItem[]
}

export default function DashboardClient({
  user,
  allOrders,
  stats,
}: DashboardClientProps) {
  const hasNoStoreName = !user.vendorProfile?.shopName;

  return (
    <Stack gap="xl">
      {/* 1. Store Details Alert */}
      {hasNoStoreName && (
        <Alert
          variant="light"
          color="red"
          title="Action Required: Store Setup Incomplete"
          icon={<AlertTriangle size={18} />}
          radius="md"
          className="border-red-200"
        >
          <Stack gap="xs">
            <Text size="sm">
              Your store name is not set.{' '}
              <strong>Administrators cannot verify your account</strong> and
              customers cannot find your products until you provide your
              business details.
            </Text>
            <Group>
              <Button
                component={Link}
                href="/vendor/settings"
                variant="filled"
                color="red"
                size="xs"
                leftSection={<Store size={14} />}
              >
                Set Store Name Now
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}

      {/* Header */}
      <Group justify="space-between" align="center">
        <Box>
          <Badge variant="dot" color="indigo" size="md" mb="xs">
            Merchant Active
          </Badge>
          <Title order={2} fw={900} lts="-1.5px">
            Dashboard
          </Title>
          <Text c="dimmed" size="sm">
            Overview for{' '}
            <Text component="span" c="indigo.7" fw={700}>
              {user.vendorProfile?.shopName || user.fullName}
            </Text>
          </Text>
        </Box>
        <Link
          href="/vendor/products/new"
          passHref
          style={{ textDecoration: 'none' }}
        >
          <Button
            leftSection={<Plus size={18} />}
            size="md"
            radius="md"
            variant="filled"
            color="indigo.6"
            className="shadow-sm"
          >
            Add New Product
          </Button>
        </Link>
      </Group>

      <AdminStats data={stats} />

      <Grid gap="lg">
        {/* Main Column */}
        <GridCol span={{ base: 12, lg: 8 }}>
          <Paper
            withBorder
            radius="md"
            shadow="xs"
            p={0}
            style={{ overflow: 'hidden' }}
          >
            <Group p="lg" justify="space-between">
              <Stack gap={0}>
                <Text fw={800} size="md">
                  Recent Sales Activity
                </Text>
                <Text size="xs" c="dimmed">
                  Latest transactions from your store
                </Text>
              </Stack>
              <Link href="/vendor/orders" passHref>
                <Button variant="subtle" size="xs" radius="md">
                  View Ledger
                </Button>
              </Link>
            </Group>

            <ScrollArea>
              <Table
                verticalSpacing="md"
                horizontalSpacing="lg"
                highlightOnHover
              >
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th
                      style={{
                        color: '#64748b',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Ref
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#64748b',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Status
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#64748b',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                      }}
                    >
                      My Earnings
                    </Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {allOrders.length > 0 ? (
                    allOrders.map((order) => {
                      // Use string comparison for serialized IDs
                      const myVendorItems = order.items.filter(
                        (i) => i.vendor.toString() === user._id.toString(),
                      )

                      // We show the Net Earning (what the vendor actually takes home)
                      const myNetTotal = myVendorItems.reduce(
                        (sum, item) => sum + (item.vendorNetEarning || 0),
                        0,
                      )

                      const targetShipmentId =
                        myVendorItems[0]?.shipment?.toString()

                      return (
                        <Table.Tr key={order._id}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar size="sm" color="indigo" radius="md">
                                #{order.orderNumber.slice(-2)}
                              </Avatar>
                              <Box>
                                <Text size="sm" fw={700}>
                                  #{order.orderNumber}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleDateString()}
                                </Text>
                              </Box>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                order.orderStatus === 'pending'
                                  ? 'yellow'
                                  : order.orderStatus === 'confirmed'
                                    ? 'blue'
                                    : order.orderStatus === 'shipped'
                                      ? 'indigo'
                                      : order.orderStatus === 'delivered'
                                        ? 'green'
                                        : 'red'
                              }
                              c="white"
                              variant="filled"
                              size="sm"
                            >
                              {order.orderStatus}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Stack gap={2}>
                              <Text size="sm" fw={800} c="indigo">
                                ₦{myNetTotal.toLocaleString()}
                              </Text>
                              <Text size="10px" c="dimmed" fw={500}>
                                {myVendorItems.length}{' '}
                                {myVendorItems.length === 1 ? 'item' : 'items'}{' '}
                                in order
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Menu
                              shadow="md"
                              width={200}
                              position="bottom-end"
                              transitionProps={{ transition: 'pop' }}
                              withArrow
                            >
                              <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  radius="xl"
                                  className="hover:bg-gray-100"
                                >
                                  <MoreHorizontal size={16} />
                                </ActionIcon>
                              </Menu.Target>

                              <Menu.Dropdown>
                                <Menu.Label>Order Actions</Menu.Label>

                                <Link
                                  href={`/vendor/orders/view/${order._id}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Menu.Item
                                    leftSection={
                                      <Eye
                                        style={{
                                          width: rem(14),
                                          height: rem(14),
                                        }}
                                      />
                                    }
                                  >
                                    View Details
                                  </Menu.Item>
                                </Link>

                                <Menu.Item
                                  component="a"
                                  target="_blank"
                                  href={`https://wa.me/${order.shippingAddress.phone.replace(/\s+/g, '')}?text=Hello ${order.shippingAddress.fullName}, I am the vendor for your order #${order.orderNumber}`}
                                  leftSection={
                                    <MessageCircle
                                      style={{
                                        width: rem(14),
                                        height: rem(14),
                                      }}
                                    />
                                  }
                                >
                                  Contact on WhatsApp
                                </Menu.Item>

                                <Menu.Divider />

                                <Menu.Label>Management</Menu.Label>

                                <Link
                                  href={`/vendor/orders/${targetShipmentId}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Menu.Item
                                    color="indigo"
                                    leftSection={
                                      <ExternalLink
                                        style={{
                                          width: rem(14),
                                          height: rem(14),
                                        }}
                                      />
                                    }
                                  >
                                    Update Status
                                  </Menu.Item>
                                </Link>
                              </Menu.Dropdown>
                            </Menu>
                          </Table.Td>
                        </Table.Tr>
                      )
                    }
                  )
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4} align="center" py="xl">
                      <Text c="dimmed">No orders found yet.</Text>
                    </Table.Td>
                  </Table.Tr>
                  )}
                  </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </GridCol>

        {/* Sidebar Column */}
        <GridCol span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <Paper
              withBorder
              p="xl"
              radius="xl"
              bg="indigo.9"
              c="white"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <TrendingUp
                size={100}
                style={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  opacity: 0.15,
                }}
              />
              <Title order={3} mb="xs" lts="-0.5px">
                Revenue Growth
              </Title>
              <Text size="sm" opacity={0.9} mb="xl">
                Your store is growing faster than average. Keep it up!
              </Text>
              <Link
                href="/vendor/analytics"
                passHref
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="white"
                  color="indigo"
                  fullWidth
                  radius="md"
                  fw={700}
                >
                  Full Analytics
                </Button>
              </Link>
            </Paper>

            <Paper withBorder p="lg" radius="xl" shadow="xs">
              <Text
                fw={800}
                size="xs"
                tt="uppercase"
                c="dimmed"
                mb="md"
                lts="1px"
              >
                Store Health
              </Text>
              <Stack gap="sm">
                <Group
                  justify="space-between"
                  p="xs"
                  className="bg-gray-50 rounded-lg"
                >
                  <Text size="xs" fw={700}>
                    Verification
                  </Text>
                  <Badge color="green" variant="light">
                    {user.vendorProfile?.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </Group>
                <Group
                  justify="space-between"
                  p="xs"
                  className="bg-gray-50 rounded-lg"
                >
                  <Text size="xs" fw={700}>
                    Payout
                  </Text>
                  <Text size="xs" fw={600}>
                    Bi-weekly
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </GridCol>
      </Grid>
    </Stack>
  )
}