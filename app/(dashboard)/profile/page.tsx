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
  rem
} from '@mantine/core'
import { 
  User, 
  Package, 
  Settings, 
  MapPin, 
  CreditCard, 
  Camera,
  ShieldCheck,
  Bell
} from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'

export default function ProfilePage() {
  const user = useUserStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<string | null>('details')

  // Prevent crash if user is null (auth middleware should handle this, but safety first)
  if (!user) return null

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
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
                  <Text size="xl" fw={900} className="text-gray-900">
                    {user.fullName}
                  </Text>
                  <Badge color="blue" variant="light" radius="sm">
                    Verified Account
                  </Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  {user.email}
                </Text>
                <Text size="xs" c="dimmed">
                  Member since {new Date().getFullYear()}
                </Text>
              </Stack>
            </Group>
            <Button
              variant="light"
              color="blue"
              leftSection={<Settings size={16} />}
            >
              Edit Profile
            </Button>
          </Group>
        </Paper>

        {/* Content Tabs */}
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Paper radius="md" withBorder p="xs">
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={setActiveTab}
                variant="pills"
                styles={{
                  tab: { justifyContent: 'flex-start', padding: rem(12) },
                  panel: { paddingLeft: rem(20) },
                }}
              >
                <Tabs.List className="w-full">
                  <Tabs.Tab value="details" leftSection={<User size={18} />}>
                    Account Details
                  </Tabs.Tab>
                  <Tabs.Tab value="orders" leftSection={<Package size={18} />}>
                    Orders & Returns
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
                    Password & Security
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="notifications"
                    leftSection={<Bell size={18} />}
                  >
                    Notifications
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Paper radius="md" withBorder p="xl">
              {/* Account Details Tab */}
              {activeTab === 'details' && (
                <Stack gap="lg">
                  <div>
                    <Text size="lg" fw={700}>
                      Personal Information
                    </Text>
                    <Text size="xs" c="dimmed">
                      Update your personal data and how we can reach you
                    </Text>
                  </div>
                  <Divider />
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Full Name"
                        defaultValue={user.fullName}
                        placeholder="John Doe"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Email Address"
                        defaultValue={user.email}
                        disabled
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput label="Phone Number" placeholder="+234..." />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput label="Birthday" type="date" />
                    </Grid.Col>
                  </Grid>
                  <Group justify="flex-end" mt="md">
                    <Button color="blue" radius="md">
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              )}

              {/* Orders Tab Placeholder */}
              {activeTab === 'orders' && (
                <Stack align="center" py="xl" gap="md">
                  <Package size={48} className="text-gray-300" />
                  <div className="text-center">
                    <Text fw={700}>No recent orders</Text>
                    <Text size="sm" c="dimmed">
                      When you buy items, they will appear here.
                    </Text>
                  </div>
                  <Button variant="outline" color="blue" radius="md">
                    Start Shopping
                  </Button>
                </Stack>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Stack gap="lg">
                  <div>
                    <Text size="lg" fw={700}>
                      Security Settings
                    </Text>
                    <Text size="xs" c="dimmed">
                      Manage your password and account protection
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
                          Add an extra layer of security to your account
                        </Text>
                      </Stack>
                      <Button variant="light" color="blue" size="xs">
                        Enable
                      </Button>
                    </Group>
                  </Paper>
                  <TextInput
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <TextInput
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Button color="blue" radius="md" w="fit-content">
                    Update Password
                  </Button>
                </Stack>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}