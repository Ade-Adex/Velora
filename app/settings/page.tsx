'use client'
import {
  Box,
  Title,
  Paper,
  Switch,
  Stack,
  Text,
  Divider,
  Group,
  Select,
  Grid,
  GridCol,
} from '@mantine/core'
import { Bell, Shield, Eye, Globe } from 'lucide-react'

export default function GlobalSettingsPage() {
  return (
    <Box maw={800} mx="auto" p="xl">
      <Title order={2} fw={800} mb="xl">
        Global Settings
      </Title>

      <Stack gap="lg">
        {/* Notifications */}
        <Paper withBorder p="xl" radius="md">
          <Group mb="md">
            <Bell size={20} className="text-indigo-600" />
            <Text fw={700}>Notifications</Text>
          </Group>
          <Stack>
            <Switch label="Email notifications for new orders" defaultChecked />
            <Switch label="SMS alerts for high-priority updates" />
            <Switch label="Marketing and newsletter updates" />
          </Stack>
        </Paper>

        {/* Privacy & Security */}
        <Paper withBorder p="xl" radius="md">
          <Group mb="md">
            <Shield size={20} className="text-red-600" />
            <Text fw={700}>Privacy & Security</Text>
          </Group>
          <Stack>
            <Switch
              label="Make my shop profile visible to the public"
              defaultChecked
            />
            <Switch label="Two-factor authentication (2FA)" />
          </Stack>
        </Paper>

        {/* Preferences */}
        <Paper withBorder p="xl" radius="md">
          <Group mb="md">
            <Globe size={20} className="text-green-600" />
            <Text fw={700}>Regional Preferences</Text>
          </Group>
          <Grid>
            <GridCol span={6}>
              <Select
                label="Language"
                data={['English', 'French', 'Yoruba', 'Hausa', 'Igbo']}
                defaultValue="English"
              />
            </GridCol>
            <GridCol span={6}>
              <Select
                label="Currency"
                data={['NGN (₦)', 'USD ($)', 'EUR (€)']}
                defaultValue="NGN (₦)"
              />
            </GridCol>
          </Grid>
        </Paper>
      </Stack>
    </Box>
  )
}
