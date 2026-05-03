//  /app/(vendor)/vendor/profile/page.tsx

import {
  Box,
  Title,
  Paper,
  Stack,
  TextInput,
  Button,
  Group,
  Avatar,
  Text,
  Divider,
  Badge,
  Grid,
  GridCol,
} from '@mantine/core'
import { getCurrentUser } from '@/app/services/auth-service'
import { User, Mail, Camera } from 'lucide-react'

export default async function PersonalProfilePage() {
  const user = await getCurrentUser()

  return (
    <Box maw={800}>
      <Title order={2} fw={800} mb="xl">
        Personal Profile
      </Title>

      <Stack gap="xl">
        {/* Profile Header */}
        <Paper withBorder p="xl" radius="md">
          <Group gap="xl">
            <Box style={{ position: 'relative' }}>
              <Avatar
                src={user?.image}
                size={100}
                radius="100%"
                color="indigo"
              />
              <Button
                size="compact-xs"
                variant="filled"
                color="indigo"
                radius="xl"
                style={{ position: 'absolute', bottom: 5, right: 5 }}
              >
                <Camera size={14} />
              </Button>
            </Box>
            <Box>
              <Text size="xl" fw={700}>
                {user?.fullName}
              </Text>
              <Text c="dimmed">Vendor Account</Text>
              <Badge color="green" variant="light" mt="xs">
                Verified Merchant
              </Badge>
            </Box>
          </Group>
        </Paper>

        {/* Form Section */}
        <Paper withBorder p="xl" radius="md">
          <Title order={4} mb="lg">
            Account Information
          </Title>
          <Grid>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Full Name"
                placeholder="Your Name"
                defaultValue={user?.fullName}
                leftSection={<User size={16} />}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Email Address"
                value={user?.email}
                disabled
                description="Email cannot be changed"
                leftSection={<Mail size={16} />}
              />
            </GridCol>
          </Grid>

          <Divider my="xl" label="Security" labelPosition="center" />

          <Box maw={400}>
            <Button variant="outline" color="gray" fullWidth>
              Change Account Password
            </Button>
          </Box>

          <Group justify="flex-end" mt="xl">
            <Button color="indigo" radius="md">
              Save Profile Changes
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Box>
  )
}