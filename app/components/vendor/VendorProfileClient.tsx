// /app/components/vendor/VendorProfileClient.tsx

'use client'

import { useState, useTransition, useRef, ChangeEvent } from 'react'
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
import { User as UserIcon, Mail, Camera } from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'
import { enqueueSnackbar } from 'notistack'
import { IUser, Serialized } from '@/app/types'
import { updateUserProfile } from '@/app/services/user-actions'

interface Props {
  initialUser: Serialized<IUser>
}

export default function VendorProfileClient({ initialUser }: Props) {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync with global store
  const user = useUserStore((state) => state.user) || initialUser
  const setUser = useUserStore((state) => state.setUser)

  const [fullName, setFullName] = useState(user.fullName || '')

  const handleUpdate = async (payload: Partial<IUser>, msg: string) => {
    const previousUser = useUserStore.getState().user

    startTransition(async () => {
      const result = await updateUserProfile(payload)
      if (result.success && result.user) {
        setUser(result.user)
        enqueueSnackbar(msg, { variant: 'success' })
      } else {
        if (previousUser) setUser(previousUser)
        enqueueSnackbar(result.error || 'Update failed', { variant: 'error' })
      }
    })
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 400
        const scaleSize = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)

        // Optimistic UI update
        setUser({ ...user, image: compressedBase64 })
        handleUpdate({ image: compressedBase64 }, 'Profile picture updated!')
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <Box maw={800}>
      <Title order={2} fw={800} mb="xl">
        Personal Profile
      </Title>

      <Stack gap="xl">
        <Paper withBorder p="xl" radius="md">
          <Group gap="xl">
            <Box style={{ position: 'relative' }}>
              <Avatar src={user?.image} size={100} radius="100%" color="indigo">
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Button
                size="compact-xs"
                variant="filled"
                color="indigo"
                radius="xl"
                loading={isPending}
                style={{ position: 'absolute', bottom: 5, right: 5 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
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

        <Paper withBorder p="xl" radius="md">
          <Title order={4} mb="lg">
            Account Information
          </Title>
          <Grid>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Full Name"
                placeholder="Your Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftSection={<UserIcon size={16} />}
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
            <Button
              color="indigo"
              radius="md"
              loading={isPending}
              onClick={() => handleUpdate({ fullName }, 'Profile updated!')}
            >
              Save Profile Changes
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Box>
  )
}