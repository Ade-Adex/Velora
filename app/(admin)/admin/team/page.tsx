'use client'

import { useState } from 'react'
import { UserPlus, ShieldCheck, Mail, User } from 'lucide-react'
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
} from '@mantine/core'
import { useSnackbar } from 'notistack'

export default function TeamPage() {
  const [formData, setFormData] = useState({ email: '', fullName: '' })
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        enqueueSnackbar(`${formData.email} added to the team!`, {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        })
        setFormData({ email: '', fullName: '' })
      } else {
        const err = await res.json()
        enqueueSnackbar(err.error || 'Failed to grant access', {
          variant: 'error',
        })
      }
    } catch (error) {
      enqueueSnackbar('Network error. Please try again.', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <header>
          <Group justify="space-between" align="flex-end">
            <div>
              <Title order={2} fw={900} lts="-0.5px">
                Team Management
              </Title>
              <Text c="dimmed" size="sm">
                Control administrative access and staff permissions
              </Text>
            </div>
            <Paper p="xs" radius="md" withBorder className="bg-blue-50/50">
              <ShieldCheck size={28} className="text-blue-600" />
            </Paper>
          </Group>
        </header>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Invitation Form */}
          <Paper
            className="md:col-span-2"
            p="xl"
            radius="md"
            withBorder
            shadow="xs"
          >
            <form onSubmit={handleInvite}>
              <Stack gap="lg">
                <div>
                  <Text fw={800} size="sm" tt="uppercase" c="dimmed" mb="md">
                    Invite New Admin
                  </Text>
                </div>

                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  leftSection={<User size={16} />}
                  required
                  size="md"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />

                <TextInput
                  label="Email Address"
                  placeholder="staff@velora.com"
                  leftSection={<Mail size={16} />}
                  required
                  size="md"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <Button
                  type="submit"
                  color="black"
                  fullWidth
                  size="md"
                  radius="md"
                  loading={loading}
                  leftSection={<UserPlus size={18} />}
                >
                  Grant Admin Access
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* Security & Instructions Section */}
          <div className="md:col-span-3">
            <Stack gap="md">
              <Paper p="xl" radius="md" bg="gray.0" withBorder>
                <Text fw={700} mb="xs" size="lg">
                  Security Protocol
                </Text>
                <Text size="sm" c="dimmed" lh={1.6}>
                  Adding a staff member grants them **full administrative
                  privileges**. This includes the ability to view sensitive
                  customer data, manage financial orders, and modify product
                  inventory.
                </Text>

                <Divider
                  my="xl"
                  label="Access Details"
                  labelPosition="center"
                />

                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <Text size="xs">
                      Newly invited staff will use their email to log in via the
                      standard login portal.
                    </Text>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <Text size="xs">
                      They do not need a password initially; the Magic Link will
                      authenticate them.
                    </Text>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <Text size="xs">
                      You can revoke access at any time through the database or
                      the &quot;Staff List&quot; (upcoming).
                    </Text>
                  </li>
                </ul>
              </Paper>
            </Stack>
          </div>
        </div>
      </Stack>
    </Container>
  )
}
