// /app/(vendor)/vendor/settings/VendorSettingsForm.tsx

'use client'

import { useForm } from '@mantine/form'
import {
  TextInput,
  Textarea,
  Button,
  Grid,
  GridCol,
  Paper,
  Group,
  Title,
  Stack,
} from '@mantine/core'
import { Store, CreditCard, Save } from 'lucide-react'
import { updateVendorProfile } from '@/app/services/vendor-service'
import { useSnackbar } from 'notistack' // Import the hook
import { IVendorProfile, Serialized } from '@/app/types'
import { useState } from 'react'

interface Props {
  initialData?: Serialized<IVendorProfile>
}

export default function VendorSettingsForm({ initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar() // Initialize snackbar

  const form = useForm({
    initialValues: {
      shopName: initialData?.shopName || '',
      description: initialData?.description || '',
      bankDetails: {
        bankName: initialData?.bankDetails?.bankName || '',
        accountNumber: initialData?.bankDetails?.accountNumber || '',
        accountName: initialData?.bankDetails?.accountName || '',
      },
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    const result = await updateVendorProfile(values)
    setLoading(false)

    if (result.success) {
      enqueueSnackbar('Profile updated successfully!', {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      })
    } else {
      enqueueSnackbar(result.error || 'Failed to update profile', {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      })
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">
        <Paper withBorder p="xl" radius="md">
          <Group mb="lg">
            <Store size={22} className="text-indigo-600" />
            <Title order={4}>Business Profile</Title>
          </Group>
          <Grid>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Shop Name"
                placeholder="Business Name"
                {...form.getInputProps('shopName')}
              />
            </GridCol>
            <GridCol span={{ base: 12 }}>
              <Textarea
                label="About the Shop"
                placeholder="Briefly describe your shop..."
                minRows={3}
                {...form.getInputProps('description')}
              />
            </GridCol>
          </Grid>
        </Paper>

        <Paper withBorder p="xl" radius="md">
          <Group mb="lg">
            <CreditCard size={22} className="text-green-600" />
            <Title order={4}>Payout Information</Title>
          </Group>
          <Grid>
            <GridCol span={6}>
              <TextInput
                label="Bank Name"
                {...form.getInputProps('bankDetails.bankName')}
              />
            </GridCol>
            <GridCol span={6}>
              <TextInput
                label="Account Number"
                {...form.getInputProps('bankDetails.accountNumber')}
              />
            </GridCol>
            <GridCol span={12}>
              <TextInput
                label="Account Name"
                {...form.getInputProps('bankDetails.accountName')}
              />
            </GridCol>
          </Grid>
        </Paper>

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={loading}
            leftSection={<Save size={18} />}
            color="indigo"
            radius="md"
          >
            Update Settings
          </Button>
        </Group>
      </Stack>
    </form>
  )
}