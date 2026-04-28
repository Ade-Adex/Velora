// /app/components/dashboard/ProfileClient.tsx

'use client'

import { useState, useTransition, useRef, ChangeEvent } from 'react'
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
  Table,
  ScrollArea,
  Select,
  Box,
  Checkbox,
  Tooltip,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  User as UserIcon,
  Package,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  Camera,
  Eye,
} from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'
import { enqueueSnackbar } from 'notistack'
import { IAddress, IOrder, IUser, Serialized } from '@/app/types'
import { useSearchParams, useRouter } from 'next/navigation'
import { updateUserProfile } from '@/app/services/user-actions'
// import Image from 'next/image'
import NextImage from 'next/image'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'

dayjs.extend(relativeTime)

interface ProfileFormData {
  fullName: string
  phone: string
  gender: 'male' | 'female' | 'other' | 'unspecified'
  birthday: string
}

interface Props {
  initialUser: Serialized<IUser>
  initialOrders: Serialized<IOrder>[]
}

export default function ProfileClient({ initialUser, initialOrders }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const user = useUserStore((state) => state.user) || initialUser
  const setUser = useUserStore((state) => state.setUser)
  const activeTab = searchParams.get('tab') || 'details'

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    gender: (user?.gender as ProfileFormData['gender']) || 'unspecified',
    birthday: user?.birthday
      ? new Date(user.birthday).toISOString().split('T')[0]
      : '',
  })

  const handleTabChange = (value: string | null) => {
    router.push(`/profile?tab=${value}`, { scroll: false })
  }

  const handleUpdate = async (payload: Partial<IUser>, msg: string) => {
    // 1. Capture the current state before the update
    const previousUser = useUserStore.getState().user

    startTransition(async () => {
      const result = await updateUserProfile(payload)

      if (result.success && result.user) {
        // 2. Server succeeded: Update store with the official data from DB
        // (This replaces the Base64 string with the Cloudinary URL)
        setUser(result.user)
        enqueueSnackbar(msg, { variant: 'success' })
      } else {
        // 3. Server failed: Revert the store to the previous state
        if (previousUser) {
          setUser(previousUser)
        }
        enqueueSnackbar(result.error || 'Update failed', { variant: 'error' })
      }
    })
  }

  const saveProfileInfo = () => {
    const finalPayload: Partial<IUser> = {
      fullName: formData.fullName,
      phone: formData.phone,
      gender: formData.gender,
      birthday: formData.birthday ? new Date(formData.birthday) : undefined,
    }
    handleUpdate(finalPayload, 'Profile updated!')
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const scaleSize = MAX_WIDTH / img.width

        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)

        if (user) {
          setUser({ ...user, image: compressedBase64 })
        }

        handleUpdate({ image: compressedBase64 }, 'Profile picture updated!')
      }
    }
    reader.readAsDataURL(file)
  }

  const openAddressModal = () => {
    modals.open({
      title: 'Add New Address',
      centered: true,
      children: (
        <AddressForm
          onSave={(newAddr) => {
            const updated = [...(user.addresses || []), newAddr]
            handleUpdate({ addresses: updated }, 'Address added!')
            modals.closeAll()
          }}
          loading={isPending}
        />
      ),
    })
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Paper p="xl" radius="md" withBorder className="bg-gray-50/50">
          <Group gap="xl">
            <Box className="relative group overflow-hidden rounded-full w-[120px] h-[120px] border border-gray-200">
              {user.image ? (
                <NextImage
                  src={user.image}
                  alt={user.fullName || 'User'}
                  fill
                  sizes="120px"
                  className="object-cover"
                  priority
                />
              ) : (
                <Avatar size={120} radius={100} color="blue" variant="filled">
                  {user.fullName?.charAt(0).toUpperCase()}
                </Avatar>
              )}

              {/* Upload Overlay */}
              <div
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={24} color="white" />
                <Text size="xs" c="white" fw={700}>
                  Change
                </Text>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Box>

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
        </Paper>

        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Paper radius="md" withBorder p="xs">
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={handleTabChange}
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
            <Paper radius="md" withBorder p="xl" className="min-h-[400px]">
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
                          setFormData({
                            ...formData,
                            fullName: e.currentTarget.value,
                          })
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.currentTarget.value,
                          })
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        type="date"
                        label="Birthday"
                        leftSection={<Calendar size={16} />}
                        value={formData.birthday}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            birthday: e.currentTarget.value,
                          })
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Gender"
                        data={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                          { value: 'unspecified', label: 'Prefer not to say' },
                        ]}
                        value={formData.gender}
                        onChange={(val) =>
                          setFormData({
                            ...formData,
                            gender:
                              (val as ProfileFormData['gender']) ||
                              'unspecified',
                          })
                        }
                      />
                    </Grid.Col>
                  </Grid>
                  <Button
                    loading={isPending}
                    onClick={saveProfileInfo}
                    className="w-fit"
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}

              {activeTab === 'addresses' && (
                <Stack gap="lg">
                  <Group justify="space-between">
                    <Text size="lg" fw={700}>
                      Shipping Addresses
                    </Text>
                    <Button
                      variant="light"
                      leftSection={<Plus size={16} />}
                      onClick={openAddressModal}
                    >
                      Add New
                    </Button>
                  </Group>
                  <Divider />
                  <Grid>
                    {user.addresses?.map((addr, i) => (
                      <Grid.Col span={{ base: 12, sm: 6 }} key={i}>
                        <Paper
                          withBorder
                          p="md"
                          radius="md"
                          className="relative"
                        >
                          <Group justify="space-between" mb={4}>
                            <Text fw={700} size="sm" c="blue">
                              {addr.label}
                            </Text>
                            {addr.isDefault && <Badge size="xs">Default</Badge>}
                          </Group>

                          <Text fw={600} size="sm">
                            {addr.fullName}
                          </Text>

                          <Text size="xs" c="dimmed">
                            {addr.addressLine1}, {addr.city}
                          </Text>

                          <Text size="xs" c="dimmed">
                            {addr.state}, {addr.country}
                          </Text>

                          <Text size="xs" mt={4} fw={500}>
                            {addr.phone}
                          </Text>

                          <ActionIcon
                            color="red"
                            variant="subtle"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              handleUpdate(
                                {
                                  addresses: user.addresses?.filter(
                                    (_, idx) => idx !== i,
                                  ),
                                },
                                'Address removed',
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Paper>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              )}

              {activeTab === 'orders' && <OrderTable orders={initialOrders} />}

              {activeTab === 'security' && (
                <Stack gap="md">
                  <Text size="lg" fw={700}>
                    Security
                  </Text>
                  <Divider />
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    className="bg-blue-50/30"
                  >
                    <Group justify="space-between">
                      <Box>
                        <Text size="sm" fw={600}>
                          Email Address
                        </Text>
                        <Text size="xs" c="dimmed">
                          Your email is {user.email}
                        </Text>
                      </Box>
                      <Badge variant="outline">Verified</Badge>
                    </Group>
                  </Paper>
                </Stack>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}

function AddressForm({
  onSave,
  loading,
}: {
  onSave: (addr: IAddress) => void
  loading: boolean
}) {
  const [val, setVal] = useState<IAddress>({
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
    isDefault: false,
  })

  return (
    <Stack gap="sm">
      <TextInput
        label="Address Label (e.g. Home, Office)"
        placeholder="Home"
        required
        value={val.label}
        onChange={(e) => setVal({ ...val, label: e.target.value })}
      />
      <Group grow>
        <TextInput
          label="Full Name"
          placeholder="John Doe"
          required
          value={val.fullName}
          onChange={(e) => setVal({ ...val, fullName: e.target.value })}
        />
        <TextInput
          label="Phone Number"
          placeholder="08012345678"
          required
          value={val.phone}
          onChange={(e) => setVal({ ...val, phone: e.target.value })}
        />
      </Group>
      <TextInput
        label="Street Address"
        placeholder="123 Church Street"
        required
        value={val.addressLine1}
        onChange={(e) => setVal({ ...val, addressLine1: e.target.value })}
      />
      <Group grow>
        <TextInput
          label="City"
          required
          value={val.city}
          onChange={(e) => setVal({ ...val, city: e.target.value })}
        />
        <TextInput
          label="State"
          required
          value={val.state}
          onChange={(e) => setVal({ ...val, state: e.target.value })}
        />
      </Group>

      {/* Added ZipCode and Country Row */}
      <Group grow>
        <TextInput
          label="Zip Code"
          placeholder="optional"
          value={val.zipCode}
          onChange={(e) => setVal({ ...val, zipCode: e.target.value })}
        />
        <Select
          label="Country"
          data={['Nigeria', 'Ghana', 'United Kingdom', 'United States']}
          value={val.country}
          onChange={(v) => setVal({ ...val, country: v || 'Nigeria' })}
        />
      </Group>

      {/* Added Default Toggle */}
      <Checkbox
        label="Set as default shipping address"
        checked={val.isDefault}
        onChange={(e) => setVal({ ...val, isDefault: e.currentTarget.checked })}
      />

      <Button fullWidth mt="md" onClick={() => onSave(val)} loading={loading}>
        Save Address
      </Button>
    </Stack>
  )
}

function OrderTable({ orders }: { orders: Serialized<IOrder>[] }) {
  if (orders.length === 0)
    return (
      <Stack align="center" py={50} gap="xs">
        <Package size={40} strokeWidth={1.5} color="gray" />
        <Text c="dimmed">No orders found yet.</Text>
        <Button variant="subtle" component={Link} href="/">
          Start Shopping
        </Button>
      </Stack>
    )

  return (
    <ScrollArea>
      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Order Info</Table.Th>
            <Table.Th>Items</Table.Th>
            <Table.Th>Payment</Table.Th>
            <Table.Th>Delivery</Table.Th>
            <Table.Th>Total</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {orders.map((order) => (
            <Table.Tr key={order._id}>
              {/* ORDER NUMBER & DATE */}
              <Table.Td>
                <Stack gap={0}>
                  <Text fw={700} size="sm">
                    #{order.orderNumber.split('-').pop()?.toUpperCase()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {dayjs(order.createdAt).format('MMM DD, YYYY')}
                  </Text>
                  <Text size="10px" c="blue.4">
                    {dayjs(order.createdAt).fromNow()}
                  </Text>
                </Stack>
              </Table.Td>

              {/* ITEMS SUMMARY */}
              <Table.Td>
                <Tooltip label={order.items.map((i) => i.name).join(', ')}>
                  {/* Fixed maxW to maw for Mantine v7 */}
                  <Box>
                    <Text size="sm" truncate="end" maw={150}>
                      {order.items[0]?.name}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} more`}
                    </Text>
                  </Box>
                </Tooltip>
              </Table.Td>

              {/* PAYMENT STATUS */}
              <Table.Td>
                <Badge
                  size="sm"
                  variant="dot"
                  color={order.paymentStatus === 'paid' ? 'green' : 'orange'}
                >
                  {order.paymentStatus.toUpperCase()}
                </Badge>
              </Table.Td>

              {/* DELIVERY STATUS */}
              <Table.Td>
                <Badge
                  size="sm"
                  variant="light"
                  color={
                    order.orderStatus === 'delivered'
                      ? 'blue'
                      : order.orderStatus === 'shipped'
                        ? 'cyan'
                        : 'gray'
                  }
                >
                  {order.orderStatus || 'PENDING'}
                </Badge>
              </Table.Td>

              {/* GRAND TOTAL */}
              <Table.Td>
                <Text fw={800} size="sm">
                  ₦{order.totals.grandTotal.toLocaleString()}
                </Text>
              </Table.Td>

              {/* ACTIONS */}
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<Eye size={14} />}
                    component={Link}
                    href={`/orders/success?id=${order._id}`}
                  >
                    Details
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
