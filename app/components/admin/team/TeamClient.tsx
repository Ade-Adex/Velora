//  /app/admin/team/TeamClient.tsx

'use client'

import { useState, useTransition } from 'react'
import { updateStaffRole, revokeAdminAccess } from '@/app/services/adminService'
import {
  UserPlus,
  ShieldCheck,
  Mail,
  User,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Divider,
  Container,
  Table,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import { useSnackbar } from 'notistack'
import { IUser } from '@/app/types'
import { modals } from '@mantine/modals'

export default function TeamClient({ initialStaff }: { initialStaff: IUser[] }) {
  const [formData, setFormData] = useState({ email: '', fullName: '' })
  const [isPending, startTransition] = useTransition() 
  const { enqueueSnackbar } = useSnackbar()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateStaffRole(
        formData.email,
        formData.fullName,
        'admin',
      )

      if (result.success) {
        enqueueSnackbar(result.message, {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        })
        setFormData({ email: '', fullName: '' })
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
         Are you sure you want to revoke administrative access for <b>{name}</b>
         ? They will immediately lose access to the admin dashboard and
         sensitive data.
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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="center">
            <Stack gap={0}>
              <Title order={2} fw={900}>
                Team Management
              </Title>
              <Text c="dimmed" size="sm">
                Manage administrative privileges
              </Text>
            </Stack>
            <Paper p="xs" radius="md" withBorder className="bg-blue-50/50">
              <ShieldCheck size={28} className="text-blue-600" />
            </Paper>
          </Group>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <Paper
            className="lg:col-span-4"
            p="xl"
            radius="md"
            withBorder
            shadow="xs"
          >
            <form onSubmit={handleInvite}>
              <Stack gap="lg">
                <Text fw={800} size="xs" tt="uppercase" c="dimmed">
                  Grant New Access
                </Text>
                <TextInput
                  label="Full Name"
                  required
                  leftSection={<User size={16} />}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
                <TextInput
                  label="Email Address"
                  required
                  leftSection={<Mail size={16} />}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Button
                  type="submit"
                  color="black"
                  fullWidth
                  loading={isPending}
                  leftSection={<UserPlus size={18} />}
                >
                  Confirm Admin
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* List */}
          <Paper
            className="lg:col-span-8"
            p="xl"
            radius="md"
            withBorder
            shadow="xs"
          >
            <Text fw={800} size="xs" tt="uppercase" c="dimmed" mb="lg">
              Current Staff
            </Text>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Member</Table.Th>
                  <Table.Th ta="right">Manage</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {initialStaff.map((staff) => (
                  <Table.Tr key={staff._id.toString()}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar radius="xl">{staff.fullName[0]}</Avatar>
                        <div>
                          <Text size="sm" fw={600}>
                            {staff.fullName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {staff.email}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        <Badge variant="light" color="blue">
                          Admin
                        </Badge>
                        <Tooltip label="Revoke Access">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            loading={isPending}
                            onClick={() =>
                              handleRevoke(staff._id.toString(), staff.fullName)
                            } // Pass the name here
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>
      </Stack>
    </Container>
  )
}