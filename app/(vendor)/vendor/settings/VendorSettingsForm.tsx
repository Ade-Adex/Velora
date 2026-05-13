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
  Divider,
  Badge,
  Text,
  ActionIcon,
  Select
} from '@mantine/core'
import {
  Store,
  CreditCard,
  Save,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Globe,
  MapPin,
  Building2,
} from 'lucide-react'
import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
} from 'react-icons/fa6'
import { updateVendorProfile } from '@/app/services/vendor-service'
import { useSnackbar } from 'notistack'
import { IVendorProfile, Serialized } from '@/app/types'
import { useState } from 'react'

interface Props {
  initialData?: Serialized<IVendorProfile>
}

interface VendorFormValues {
  shopName: string
  businessType: 'Individual' | 'Registered Business'
  description: string
  logo: string
  banner: string
  supportEmail: string
  supportPhone: string
  website: string
  // New Address Structure
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  bankDetails: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  socialLinks: {
    facebook: string
    instagram: string
    twitter: string
  }
}

export default function VendorSettingsForm({ initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const form = useForm<VendorFormValues>({
    initialValues: {
      shopName: initialData?.shopName || '',
      businessType: initialData?.businessType || 'Individual',
      description: initialData?.description || '',
      logo: initialData?.logo || '',
      banner: initialData?.banner || '',
      supportEmail: initialData?.supportEmail || '',
      supportPhone: initialData?.supportPhone || '',
      website: initialData?.website || '',
      address: {
        street: initialData?.address?.street || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || '',
        zipCode: initialData?.address?.zipCode || '',
      },
      bankDetails: {
        bankName: initialData?.bankDetails?.bankName || '',
        accountNumber: initialData?.bankDetails?.accountNumber || '',
        accountName: initialData?.bankDetails?.accountName || '',
      },
      socialLinks: {
        facebook: initialData?.socialLinks?.facebook || '',
        instagram: initialData?.socialLinks?.instagram || '',
        twitter: initialData?.socialLinks?.twitter || '',
      },
    },
    validate: {
      shopName: (val) =>
        val.length < 3 ? 'Professional shop name required' : null,
      supportEmail: (val) =>
        /^\S+@\S+$/.test(val) ? null : 'Invalid business email',
    },
  })

  const handleSubmit = async (values: VendorFormValues) => {
    setLoading(true)
    const result = await updateVendorProfile(values)
    setLoading(false)

    if (result.success) {
      enqueueSnackbar('Business profile synced successfully', {
        variant: 'success',
      })
    } else {
      enqueueSnackbar(result.error || 'Sync failed', { variant: 'error' })
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">
        {/* HEADER: STATUS CARD */}
        <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="sm" c="dimmed" fw={500}>
                Store Verification Status
              </Text>
              <Group gap="xs">
                {initialData?.isVerified ? (
                  <Badge
                    variant="filled"
                    color="green"
                    leftSection={<CheckCircle2 size={12} />}
                  >
                    Verified Merchant
                  </Badge>
                ) : (
                  <Badge
                    variant="filled"
                    color="orange"
                    leftSection={<AlertCircle size={12} />}
                  >
                    Pending Verification
                  </Badge>
                )}
              </Group>
            </Stack>
            <Text size="xs" c="dimmed">
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </Group>
        </Paper>

        {/* SECTION 1: IDENTITY & ASSETS */}
        <Paper withBorder p="xl" radius="md" shadow="xs">
          <Group mb="md">
            <Store size={20} className="text-indigo-600" />
            <Title order={5}>Storefront Branding</Title>
          </Group>
          <Divider mb="xl" />
          <Grid gap="lg">
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Public Shop Name"
                required
                {...form.getInputProps('shopName')}
                description="This appears on your invoices and product pages"
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Official Website"
                placeholder="https://..."
                {...form.getInputProps('website')}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Logo URL"
                placeholder="Square image recommended"
                {...form.getInputProps('logo')}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Banner URL"
                placeholder="Wide cover image"
                {...form.getInputProps('banner')}
              />
            </GridCol>
            <GridCol span={12}>
              <Textarea
                label="Business Bio"
                placeholder="Describe your brand to your customers..."
                minRows={4}
                {...form.getInputProps('description')}
              />
            </GridCol>
          </Grid>
        </Paper>

        {/* SECTION: BUSINESS INFO & ADDRESS */}
        <Paper withBorder p="xl" radius="md" shadow="xs">
          <Group mb="md">
            <MapPin size={20} className="text-indigo-600" />
            <Title order={5}>Business Location & Type</Title>
          </Group>
          <Divider mb="xl" />
          <Grid gap="lg">
            <GridCol span={{ base: 12, md: 6 }}>
              <Select
                label="Business Type"
                data={['Individual', 'Registered Business']}
                {...form.getInputProps('businessType')}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Street Address"
                placeholder="123 Business Way"
                {...form.getInputProps('address.street')}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }}>
              <TextInput label="City" {...form.getInputProps('address.city')} />
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }}>
              <TextInput
                label="State"
                {...form.getInputProps('address.state')}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }}>
              <TextInput
                label="Zip Code"
                {...form.getInputProps('address.zipCode')}
              />
            </GridCol>
          </Grid>
        </Paper>

        {/* CONTACT & SOCIALS */}
        <Grid>
          <GridCol span={{ base: 12, md: 6 }}>
            <Paper withBorder p="xl" radius="md" h="100%">
              <Title order={5} mb="lg">
                Support Details
              </Title>
              <Stack>
                <TextInput
                  label="Support Email"
                  leftSection={<Mail size={16} />}
                  {...form.getInputProps('supportEmail')}
                />
                <TextInput
                  label="Support Phone"
                  leftSection={<Phone size={16} />}
                  {...form.getInputProps('supportPhone')}
                />
              </Stack>
            </Paper>
          </GridCol>
          <GridCol span={{ base: 12, md: 6 }}>
            <Paper withBorder p="xl" radius="md" h="100%">
              <Title order={5} mb="lg">
                Social Presence
              </Title>
              <Stack gap="sm">
                <TextInput
                  placeholder="Instagram Profile"
                  leftSection={<FaInstagram size={16} color="#E4405F" />}
                  {...form.getInputProps('socialLinks.instagram')}
                />
                <TextInput
                  placeholder="Facebook Page"
                  leftSection={<FaFacebookF size={16} color="#1877F2" />}
                  {...form.getInputProps('socialLinks.facebook')}
                />
                <TextInput
                  placeholder="X (Twitter) Handle"
                  leftSection={<FaXTwitter size={16} />}
                  {...form.getInputProps('socialLinks.twitter')}
                />
              </Stack>
            </Paper>
          </GridCol>
        </Grid>

        {/* SECTION 3: SETTLEMENTS */}
        <Paper
          withBorder
          p="xl"
          radius="md"
          shadow="xs"
          style={{ borderLeft: '4px solid var(--mantine-color-indigo-6)' }}
        >
          <Group mb="md">
            <CreditCard size={20} className="text-indigo-600" />
            <Title order={5}>Settlement Bank Account</Title>
          </Group>
          <Text size="xs" c="dimmed" mb="lg">
            Ensure these details are correct. Settlement is processed every
            Friday.
          </Text>
          <Grid>
            <GridCol span={{ base: 12, md: 4 }}>
              <TextInput
                label="Financial Institution"
                {...form.getInputProps('bankDetails.bankName')}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }}>
              <TextInput
                label="Account Number"
                {...form.getInputProps('bankDetails.accountNumber')}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }}>
              <TextInput
                label="Beneficiary Name"
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
            size="md"
            radius="md"
          >
            Update Business Profile
          </Button>
        </Group>
      </Stack>
    </form>
  )
}