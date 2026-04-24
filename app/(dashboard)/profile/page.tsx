//  / app/(dashboard)/profile/page.tsx


'use client'

import { useState } from 'react'
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
  rem,
} from '@mantine/core'
import {
  User,
  Package,
  Settings,
  MapPin,
  ShieldCheck,
  Bell,
  Camera,
  Plus,
  Trash2,
} from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'
import { enqueueSnackbar } from 'notistack'
import Link from 'next/link'
import { IAddress } from '@/app/types'

export default function ProfilePage() {
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  const [activeTab, setActiveTab] = useState<string | null>('details')
  const [loading, setLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    birthday: user?.birthday
      ? new Date(user.birthday).toISOString().split('T')[0]
      : '',
  })

  if (!user) return null

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setUser(data.user) // Update global Zustand state
        enqueueSnackbar('Profile updated successfully!', { variant: 'success' })
      } else {
        enqueueSnackbar(data.error || 'Failed to update', { variant: 'error' })
      }
    } catch (err) {
      enqueueSnackbar('An error occurred', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header Section (Keep as is, just ensure Avatar uses user.fullName) */}
        <Paper p="xl" radius="md" withBorder className="bg-gray-50/50">
          <Group justify="space-between" align="flex-end">
            <Group gap="xl">
              <div className="relative">
                <Avatar
                  size={120}
                  radius={100}
                  src={user.image}
                  color="blue"
                  variant="filled"
                >
                  {user.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <ActionIcon
                  size="lg"
                  radius="xl"
                  variant="filled"
                  color="orange"
                  className="absolute bottom-1 right-1 border-4 border-white"
                >
                  <Camera size={18} />
                </ActionIcon>
              </div>
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
                  <Tabs.Tab value="details" leftSection={<User size={18} />}>
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
              {activeTab === 'details' && (
                <Stack gap="lg">
                  <div>
                    <Text size="lg" fw={700}>
                      Personal Information
                    </Text>
                    <Text size="xs" c="dimmed">
                      Update your personal data
                    </Text>
                  </div>
                  <Divider />
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Email Address"
                        value={user.email}
                        disabled
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+234..."
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) =>
                          setFormData({ ...formData, birthday: e.target.value })
                        }
                      />
                    </Grid.Col>
                  </Grid>
                  <Group justify="flex-end" mt="md">
                    <Button
                      color="blue"
                      radius="md"
                      onClick={handleUpdateProfile}
                      loading={loading}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              )}
              {activeTab === 'addresses' && (
                <Stack gap="lg">
                  <Group justify="space-between">
                    <div>
                      <Text size="lg" fw={700}>
                        Shipping Addresses
                      </Text>
                      <Text size="xs" c="dimmed">
                        Manage where your orders are delivered
                      </Text>
                    </div>
                    <Button variant="light" leftSection={<Plus size={16} />}>
                      Add New
                    </Button>
                  </Group>
                  <Divider />

                  {user.addresses && user.addresses.length > 0 ? (
                    <Grid>
                      {user.addresses.map((addr: IAddress, index: number) => (
                        <Grid.Col span={{ base: 12, sm: 6 }} key={index}>
                          <Paper
                            withBorder
                            p="md"
                            radius="md"
                            className="relative group"
                          >
                            <Text fw={700} size="sm">
                              {addr.label || 'Home'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {addr.street}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {addr.city}, {addr.state} {addr.zipCode}
                            </Text>
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </ActionIcon>
                          </Paper>
                        </Grid.Col>
                      ))}
                    </Grid>
                  ) : (
                    <Paper
                      withBorder
                      p="xl"
                      radius="md"
                      className="bg-gray-50/50 border-dashed text-center"
                    >
                      <MapPin
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <Text size="sm" c="dimmed">
                        No addresses saved yet.
                      </Text>
                    </Paper>
                  )}
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
                  <Text size="lg" fw={700}>
                    Order History
                  </Text>
                  {/* If orders exist, map them here. Otherwise show empty state */}
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
                </Stack>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}