//  / app/(dashboard)/profile/page.tsx

'use client'

import { useState, useEffect, Suspense } from 'react'
import {
  Container,
  Grid,
  Paper,
  Text,
  Avatar,
  Tabs,
  TextInput,
  Button,
  Group,
  Stack,
  Divider,
  Badge,
  ActionIcon,
  Modal,
  Table,
  ScrollArea,
  Loader,
} from '@mantine/core'
import {
  User as UserIcon,
  Package,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'
import { enqueueSnackbar } from 'notistack'
import Link from 'next/link'
import { IAddress, IOrder, IUser, Serialized } from '@/app/types'
import { useSearchParams } from 'next/navigation'

function ProfileContent() {
  const searchParams = useSearchParams()
  const queryTab = searchParams.get('tab')

  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)

  const [activeTab, setActiveTab] = useState<string | null>(
    queryTab || 'details',
  )
  const [loading, setLoading] = useState(false)

  const [orders, setOrders] = useState<Serialized<IOrder>[]>([])
  const [fetchingOrders, setFetchingOrders] = useState(false)

  const [opened, setOpened] = useState(false)
  const [newAddr, setNewAddr] = useState<IAddress>({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
    isDefault: false,
  })

const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    birthday: user?.birthday
      ? new Date(user.birthday).toISOString().split('T')[0]
      : '',
  })

  // if (queryTab && queryTab !== activeTab) {
  //   setActiveTab(queryTab)
  // }

  const [prevQueryTab, setPrevQueryTab] = useState(queryTab)

  if (queryTab !== prevQueryTab) {
    setPrevQueryTab(queryTab)
    setActiveTab(queryTab || 'details')
  }

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (activeTab !== 'orders') return

      setFetchingOrders(true)
      try {
        const res = await fetch('/api/user/orders')
        const data = await res.json()
        if (data.success) {
          setOrders(data.orders)
        }
      } catch (err) {
        enqueueSnackbar('Failed to load orders', { variant: 'error' })
      } finally {
        setFetchingOrders(false)
      }
    }

    fetchUserOrders()
  }, [activeTab])

  if (!user) return null

  const handleUpdate = async (
    payload: Partial<IUser>,
    successMessage: string,
  ) => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        setUser(data.user)
        enqueueSnackbar(successMessage, { variant: 'success' })
        setOpened(false)
      } else {
        enqueueSnackbar(data.error || 'Update failed', { variant: 'error' })
      }
    } catch (err) {
      enqueueSnackbar('An error occurred', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const removeAddress = (index: number) => {
    if (!user.addresses) return

    const updatedAddresses = user.addresses.filter(
      (_: IAddress, i: number) => i !== index,
    )

    handleUpdate({ addresses: updatedAddresses }, 'Address removed')
  }

  const addAddress = () => {
    const updatedAddresses = [...(user.addresses || []), newAddr]
    handleUpdate({ addresses: updatedAddresses }, 'Address added successfully!')
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header - Profile Info */}
        <Paper p="xl" radius="md" withBorder className="bg-gray-50/50">
          <Group justify="space-between" align="flex-end">
            <Group gap="xl">
              <Avatar
                size={120}
                radius={100}
                src={user.image}
                color="blue"
                variant="filled"
              >
                {user.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Stack gap={4}>
                <Group gap="xs">
                  <Text size="xl" fw={900}>
                    {user.fullName}
                  </Text>
                  <Badge color="blue" variant="light">
                    Verified Account
                  </Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  {user.email}
                </Text>
              </Stack>
            </Group>
          </Group>
        </Paper>

        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Paper radius="md" withBorder p="xs">
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={setActiveTab}
                variant="pills"
              >
                <Tabs.List className="w-full">
                  <Tabs.Tab
                    value="details"
                    leftSection={<UserIcon size={18} />}
                  >
                    Account Details
                  </Tabs.Tab>
                  <Tabs.Tab value="orders" leftSection={<Package size={18} />}>
                    Orders
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="addresses"
                    leftSection={<MapPin size={18} />}
                  >
                    Addresses
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="security"
                    leftSection={<ShieldCheck size={18} />}
                  >
                    Security
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Paper radius="md" withBorder p="xl">
              {/* DETAILS TAB */}
              {activeTab === 'details' && (
                <Stack gap="lg">
                  <Text size="lg" fw={700}>
                    Personal Information
                  </Text>
                  <Divider />
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </Grid.Col>
                  </Grid>
                  <Button
                    loading={loading}
                    onClick={() =>
                      handleUpdate(
                        {
                          ...formData,
                          birthday: formData.birthday
                            ? new Date(formData.birthday)
                            : undefined,
                        },
                        'Profile updated!',
                      )
                    }
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <Stack gap="lg">
                  <Group justify="space-between">
                    <Text size="lg" fw={700}>
                      Shipping Addresses
                    </Text>
                    <Button
                      variant="light"
                      leftSection={<Plus size={16} />}
                      onClick={() => setOpened(true)}
                    >
                      Add New
                    </Button>
                  </Group>
                  <Divider />
                  <Grid>
                    {user.addresses?.map((addr: IAddress, i: number) => (
                      <Grid.Col span={{ base: 12, sm: 6 }} key={i}>
                        <Paper
                          withBorder
                          p="md"
                          radius="md"
                          className="relative group"
                        >
                          <Text fw={700} size="sm">
                            {addr.label}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {addr.street}, {addr.city}
                          </Text>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            className="absolute top-2 right-2"
                            onClick={() => removeAddress(i)}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Paper>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              )}
              {activeTab === 'security' && (
                <Stack gap="lg">
                  <div>
                    <Text size="lg" fw={700}>
                      Security & Access
                    </Text>
                    <Text size="xs" c="dimmed">
                      Manage your session and account protection
                    </Text>
                  </div>
                  <Divider />

                  <Paper
                    p="md"
                    withBorder
                    radius="md"
                    className="bg-blue-50/30"
                  >
                    <Group justify="space-between">
                      <Stack gap={0}>
                        <Text fw={600} size="sm">
                          Two-Factor Authentication
                        </Text>
                        <Text size="xs" c="dimmed">
                          Confirm login via your mobile device
                        </Text>
                      </Stack>
                      <Badge color="gray" variant="outline">
                        Coming Soon
                      </Badge>
                    </Group>
                  </Paper>

                  <div className="mt-4">
                    <Text fw={600} size="sm" mb="xs">
                      Active Sessions
                    </Text>
                    <Paper withBorder p="md" radius="md">
                      <Group justify="space-between">
                        <Group gap="sm">
                          <div className="p-2 bg-green-100 rounded-full">
                            <ShieldCheck size={16} className="text-green-600" />
                          </div>
                          <div>
                            <Text size="xs" fw={700}>
                              Current Device (Chrome - Windows)
                            </Text>
                            <Text size="xs" c="dimmed">
                              Last active: Just now
                            </Text>
                          </div>
                        </Group>
                        <Button variant="subtle" color="red" size="xs">
                          Logout Other Devices
                        </Button>
                      </Group>
                    </Paper>
                  </div>
                </Stack>
              )}

              {activeTab === 'orders' && (
                <Stack gap="lg">
                  <Group justify="space-between">
                    <Text size="lg" fw={700}>
                      Order History
                    </Text>
                    {orders.length > 0 && (
                      <Badge variant="light" color="blue">
                        {orders.length} Total
                      </Badge>
                    )}
                  </Group>
                  <Divider />

                  {fetchingOrders ? (
                    <Stack align="center" py={40}>
                      <Loader size="sm" />
                      <Text size="xs" c="dimmed">
                        Fetching your orders...
                      </Text>
                    </Stack>
                  ) : orders.length > 0 ? (
                    <ScrollArea>
                      <Table verticalSpacing="md">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Order #</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Total</Table.Th>
                            <Table.Th ta="right">Action</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {orders.map((order) => (
                            <Table.Tr key={order._id}>
                              <Table.Td>
                                <Text fw={700} size="sm">
                                  {order.orderNumber.replace('Velora-', '')}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Badge
                                  variant="light"
                                  color={
                                    order.paymentStatus === 'paid'
                                      ? 'green'
                                      : 'orange'
                                  }
                                  size="sm"
                                >
                                  {order.paymentStatus}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                <Text size="xs">
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleDateString()}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fw={700} size="sm">
                                  ₦{order.totals.grandTotal.toLocaleString()}
                                </Text>
                              </Table.Td>
                              <Table.Td ta="right">
                                <Button
                                  variant="subtle"
                                  size="compact-xs"
                                  component={Link}
                                  href={`/orders/success?id=${order._id}`}
                                >
                                  View
                                </Button>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <Stack align="center" py={40} gap="md">
                      <Package
                        size={48}
                        className="text-gray-200"
                        strokeWidth={1}
                      />
                      <div className="text-center">
                        <Text fw={600}>Nothing ordered yet</Text>
                        <Text size="xs" c="dimmed">
                          Once you buy something, it&apos;ll show up here.
                        </Text>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        component={Link}
                        href="/"
                      >
                        Explore Products
                      </Button>
                    </Stack>
                  )}
                </Stack>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* ADD ADDRESS MODAL */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="New Address"
        centered
      >
        <Stack>
          <TextInput
            label="Label (e.g. Home)"
            value={newAddr.label} // Added value for controlled component
            onChange={(e) =>
              setNewAddr((prev) => ({ ...prev, label: e.target.value }))
            }
          />
          <TextInput
            label="Street"
            value={newAddr.street}
            onChange={(e) =>
              setNewAddr((prev) => ({ ...prev, street: e.target.value }))
            }
          />
          <Group grow>
            <TextInput
              label="City"
              value={newAddr.city}
              onChange={(e) =>
                setNewAddr((prev) => ({ ...prev, city: e.target.value }))
              }
            />
            <TextInput
              label="State"
              value={newAddr.state}
              onChange={(e) =>
                setNewAddr((prev) => ({ ...prev, state: e.target.value }))
              }
            />
          </Group>
          <TextInput
            label="Zip Code"
            value={newAddr.zipCode}
            onChange={(e) =>
              setNewAddr((prev) => ({ ...prev, zipCode: e.target.value }))
            }
          />
          <Button fullWidth onClick={addAddress} loading={loading}>
            Save Address
          </Button>
        </Stack>
      </Modal>
    </Container>
  )
}




// MAIN EXPORT: This fixes the prerender error
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <Container size="lg" py="xl">
        <Stack align="center" py={100}>
          <Loader size="xl" />
          <Text c="dimmed">Loading your profile...</Text>
        </Stack>
      </Container>
    }>
      <ProfileContent />
    </Suspense>
  )
}