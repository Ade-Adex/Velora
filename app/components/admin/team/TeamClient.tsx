//  /app/admin/team/TeamClient.tsx

'use client'

import { useState, useTransition } from 'react'
import { updateStaffRole, revokeAdminAccess } from '@/app/services/adminService'
import { ShieldCheck, Mail, User, Trash2 } from 'lucide-react'
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Table,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
  Select,
  ScrollArea,
} from '@mantine/core'
import { useSnackbar } from 'notistack'
import { IUser } from '@/app/types'
import { modals } from '@mantine/modals'

export default function TeamClient({
  initialStaff,
}: {
  initialStaff: IUser[]
}) {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'editor' as 'admin' | 'editor',
  })
  const [isPending, startTransition] = useTransition()
  const { enqueueSnackbar } = useSnackbar()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateStaffRole(
        formData.email,
        formData.fullName,
        formData.role,
      )

      if (result.success) {
        enqueueSnackbar(result.message, {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        })
        setFormData({ email: '', fullName: '', role: 'editor' })
      } else {
        enqueueSnackbar(result.error, {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        })
      }
    })
  }

  const handleRevoke = (id: string, name: string) => {
    modals.openConfirmModal({
      title: <Text fw={700}>Confirm Revocation</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to revoke administrative access for{' '}
          <b>{name}</b>? They will immediately lose access to the admin
          dashboard and sensitive data.
        </Text>
      ),
      labels: { confirm: 'Revoke Access', cancel: 'Cancel' },
      confirmProps: { color: 'red', variant: 'filled' },
      onConfirm: () => {
        startTransition(async () => {
          const result = await revokeAdminAccess(id)
          if (result.success) {
            enqueueSnackbar(`Access revoked for ${name}`, { variant: 'info' })
          } else {
            enqueueSnackbar(result.error, { variant: 'error' })
          }
        })
      },
    })
  }

  return (
    <div className="md:px-4 py-0">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Stack gap={2}>
              <Title
                order={2}
                fw={900}
                fz={{ base: 'xl', md: '26px' }}
                lts="-1px"
              >
                Team Management
              </Title>
              <Text c="dimmed" size="sm" visibleFrom="sm">
                Manage administrative privileges and staff roles
              </Text>
            </Stack>
            <Paper
              p="xs"
              radius="md"
              withBorder
              className="bg-blue-50/50"
              visibleFrom="xs"
            >
              <ShieldCheck size={28} className="text-blue-600" />
            </Paper>
          </Group>
          {/* Mobile-only subtitle */}
          <Text c="dimmed" size="xs" hiddenFrom="sm" mt={4}>
            Manage administrative privileges
          </Text>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Form Section - Full width on mobile, 4-cols on desktop */}
          <Paper
            className="lg:col-span-4"
            p={{ base: 'md', md: 'xl' }}
            radius="md"
            withBorder
            shadow="xs"
          >
            <form onSubmit={handleInvite}>
              <Stack gap="lg">
                <Text fw={800} size="xs" tt="uppercase" c="dimmed" lts="0.5px">
                  Grant New Access
                </Text>
                <TextInput
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  required
                  leftSection={<User size={16} />}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
                <TextInput
                  label="Email Address"
                  placeholder="name@example.com"
                  required
                  leftSection={<Mail size={16} />}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Select
                  label="Assign Role"
                  placeholder="Pick a role"
                  data={[
                    { value: 'admin', label: 'Admin (Full Access)' },
                    { value: 'editor', label: 'Editor (Content Only)' },
                  ]}
                  value={formData.role}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as 'admin' | 'editor',
                    })
                  }
                  required
                />

                <Button
                  type="submit"
                  loading={isPending}
                  fullWidth
                  size="md"
                  radius="md"
                >
                  Grant Access
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* List Section - Full width on mobile, 8-cols on desktop */}
          <Paper
            className="lg:col-span-8"
            p={{ base: 'md', md: 'xl' }}
            radius="md"
            withBorder
            shadow="xs"
          >
            <Text
              fw={800}
              size="xs"
              tt="uppercase"
              c="dimmed"
              mb="lg"
              lts="0.5px"
            >
              Current Staff ({initialStaff.length})
            </Text>

            <ScrollArea scrollbars="x" offsetScrollbars>
              <Table verticalSpacing="md" miw={{ base: 500, md: '100%' }}>
                <Table.Thead className="bg-gray-50/50">
                  <Table.Tr>
                    <Table.Th className="rounded-l-md">Member</Table.Th>
                    <Table.Th ta="right" className="rounded-r-md">
                      Manage
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {initialStaff.map((staff) => (
                    <Table.Tr key={staff._id.toString()}>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar
                            radius="xl"
                            color={staff.role === 'admin' ? 'red' : 'blue'}
                            variant="light"
                            size="sm"
                          >
                            {staff.fullName[0]}
                          </Avatar>
                          <div className="overflow-hidden">
                            <Text size="sm" fw={700} truncate>
                              {staff.fullName}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                              {staff.email}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs" wrap="nowrap">
                          <Badge
                            variant="outline"
                            color={staff.role === 'admin' ? 'red' : 'blue'}
                            size="sm"
                          >
                            {staff.role}
                          </Badge>
                          {!staff.isSuperAdmin && (
                            <Tooltip label="Revoke Access" withArrow>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                loading={isPending}
                                onClick={() =>
                                  handleRevoke(
                                    staff._id.toString(),
                                    staff.fullName,
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </div>
      </Stack>
    </div>
  )
}
