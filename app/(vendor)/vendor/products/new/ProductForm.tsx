'use client'

import { useState } from 'react'
import {
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Paper,
  Stack,
  Title,
  Grid,
  Group,
  Select,
  TagsInput,
  ActionIcon,
  Text,
  Divider,
  Switch,
  Alert,
  Card,
  Badge,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  Plus,
  Trash,
  Check,
  ArrowLeft,
  ShieldAlert,
  Image as ImageIcon,
  Settings,
  DollarSign,
  Search,
  Info,
} from 'lucide-react'
import { createProduct } from '@/app/services/product-service'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IProduct, CategoryOption, IProductData } from '@/app/types'

interface UserStatus {
  isVerified: boolean
  hasShopData: boolean
  isAdmin: boolean
}

interface ProductFormProps {
  categoryOptions: CategoryOption[]
  userStatus: UserStatus
}

type ProductFormValues = Omit<IProductData, 'slug'>

export default function ProductForm({
  categoryOptions,
  userStatus,
}: ProductFormProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: '',
      brand: '',
      description: '',
      shortDescription: '',
      basePrice: 0,
      discountPrice: 0,
      category: '',
      tags: [],
      mainImage: '',
      gallery: [],
      stock: 0,
      variants: [],
      specifications: [],
      seo: { title: '', description: '', keywords: [] },
      isPublished: false,
      isFeatured: false,
      onSale: false,
      commissionRate: 10,
    },
    validate: {
      name: (v) => (v.length < 2 ? 'Name is too short' : null),
      category: (v) => (!v ? 'Please select a category' : null),
      basePrice: (v) => (v <= 0 ? 'Price must be positive' : null),
      mainImage: (v) => (!v ? 'Main image is required' : null),
    },
  })

  const handleCreate = async (values: ProductFormValues) => {
    setLoading(true)
    try {
      const res = await createProduct(values)

      if (res.success) {
        enqueueSnackbar('Product submitted for approval', {
          variant: 'success',
        })
        router.push('/vendor/products')
        router.refresh()
      } else {
        enqueueSnackbar(res.message || 'Error creating product', {
          variant: res.error === 'KYC_INCOMPLETE' ? 'warning' : 'error',
        })
      }
    } catch (err) {
      enqueueSnackbar('Internal connection error', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const isRestricted = !userStatus.isVerified && !userStatus.isAdmin

  return (
    <form onSubmit={form.onSubmit(handleCreate)}>
      <Stack gap="xl" pb={100} className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Button
              component={Link}
              href="/vendor/products"
              variant="subtle"
              leftSection={<ArrowLeft size={14} />}
              p={0}
              h="auto"
            >
              Back to Inventory
            </Button>
            <Title order={2} fw={800}>
              Create New Listing
            </Title>
          </Stack>

          <Group>
            <Button variant="default" onClick={() => router.back()}>
              Discard
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={isRestricted}
              leftSection={<Check size={18} />}
              color="indigo"
            >
              Submit Listing
            </Button>
          </Group>
        </Group>

        {isRestricted && (
          <Alert
            icon={<ShieldAlert size={16} />}
            title="Verification Pending"
            color="orange"
            radius="md"
          >
            Your vendor account is awaiting verification. You can save this
            draft, but it won&apos;t be live until approved.
          </Alert>
        )}

        <Grid gap="xl">
          {/* Main Content Column */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              {/* 1. General Info */}
              <Paper withBorder p="xl" radius="md">
                <Group mb="lg">
                  <Info size={20} color="var(--mantine-color-indigo-6)" />
                  <Text fw={700} size="lg">
                    General Information
                  </Text>
                </Group>
                <Stack gap="md">
                  <TextInput
                    label="Product Title"
                    placeholder="Official name"
                    required
                    {...form.getInputProps('name')}
                  />
                  <Grid>
                    <Grid.Col span={6}>
                      <TextInput
                        label="Brand"
                        placeholder="e.g. Apple"
                        {...form.getInputProps('brand')}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Select
                        label="Category"
                        placeholder="Select one"
                        data={categoryOptions}
                        searchable
                        {...form.getInputProps('category')}
                      />
                    </Grid.Col>
                  </Grid>
                  <Textarea
                    label="Short Summary"
                    placeholder="Brief catchphrase"
                    rows={2}
                    {...form.getInputProps('shortDescription')}
                  />
                  <Textarea
                    label="Detailed Description"
                    placeholder="Full product details..."
                    minRows={5}
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </Paper>

              {/* 2. Media Gallery (Restored from Old Form) */}
              <Paper withBorder p="xl" radius="md">
                <Group mb="lg">
                  <ImageIcon size={20} color="var(--mantine-color-indigo-6)" />
                  <Text fw={700} size="lg">
                    Product Gallery
                  </Text>
                </Group>
                <TextInput
                  label="Feature Image URL"
                  placeholder="https://..."
                  required
                  mb="md"
                  {...form.getInputProps('mainImage')}
                />

                <Divider
                  label="Additional Images"
                  labelPosition="center"
                  my="lg"
                />
                <Stack gap="xs">
                  {form.values.gallery.map((_, i) => (
                    <Group key={i}>
                      <TextInput
                        placeholder="Image URL"
                        flex={1}
                        {...form.getInputProps(`gallery.${i}`)}
                      />
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => form.removeListItem('gallery', i)}
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<Plus size={14} />}
                    onClick={() => form.insertListItem('gallery', '')}
                  >
                    Add Image to Gallery
                  </Button>
                </Stack>
              </Paper>

              {/* 3. Technical Specs (Restored from Old Form) */}
              <Paper withBorder p="xl" radius="md">
                <Group mb="lg">
                  <Settings size={20} color="var(--mantine-color-indigo-6)" />
                  <Text fw={700} size="lg">
                    Technical Specifications
                  </Text>
                </Group>
                <Stack gap="xs">
                  {form.values.specifications.map((_, i) => (
                    <Group key={i} grow>
                      <TextInput
                        placeholder="Label (e.g. Material)"
                        {...form.getInputProps(`specifications.${i}.label`)}
                      />
                      <TextInput
                        placeholder="Value (e.g. 100% Cotton)"
                        {...form.getInputProps(`specifications.${i}.value`)}
                      />
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => form.removeListItem('specifications', i)}
                        style={{ flex: 0 }}
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      form.insertListItem('specifications', {
                        label: '',
                        value: '',
                      })
                    }
                  >
                    Add Specification Row
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Sidebar Column */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xl">
              {/* Pricing & Logistics */}
              <Paper withBorder p="xl" radius="md">
                <Group mb="md">
                  <DollarSign size={18} color="var(--mantine-color-green-6)" />
                  <Text fw={700}>Pricing & Inventory</Text>
                </Group>
                <Stack gap="sm">
                  <NumberInput
                    label="Base Price"
                    prefix="₦"
                    thousandSeparator
                    required
                    {...form.getInputProps('basePrice')}
                  />
                  <NumberInput
                    label="Discount Price"
                    prefix="₦"
                    thousandSeparator
                    {...form.getInputProps('discountPrice')}
                  />
                  <NumberInput
                    label="Global Stock"
                    description="Ignored if variants exist"
                    {...form.getInputProps('stock')}
                  />
                  <Divider my="sm" />
                  <Switch
                    label="Currently on Sale"
                    {...form.getInputProps('onSale', { type: 'checkbox' })}
                  />
                  <Switch
                    label="Featured Product"
                    {...form.getInputProps('isFeatured', { type: 'checkbox' })}
                  />
                  <Switch
                    label="Publish Immediately"
                    {...form.getInputProps('isPublished', { type: 'checkbox' })}
                  />
                </Stack>
              </Paper>

              {/* Tags & Keywords */}
              <Paper withBorder p="xl" radius="md">
                <Group mb="md">
                  <Search size={18} color="var(--mantine-color-indigo-6)" />
                  <Text fw={700}>Search Visibility</Text>
                </Group>
                <Stack gap="sm">
                  <TagsInput
                    label="Search Keywords"
                    placeholder="Enter & press enter"
                    {...form.getInputProps('tags')}
                  />
                  <TextInput
                    label="SEO Title"
                    {...form.getInputProps('seo.title')}
                  />
                  <Textarea
                    label="SEO Description"
                    rows={3}
                    {...form.getInputProps('seo.description')}
                  />
                </Stack>
              </Paper>

              {/* Commission Info (New Field from IProduct) */}
              <Paper
                withBorder
                p="xl"
                radius="md"
                bg="var(--mantine-color-gray-0)"
              >
                <Text size="xs" c="dimmed" fw={700} mb={4}>
                  ADMINISTRATIVE
                </Text>
                <NumberInput
                  label="Commission Rate (%)"
                  description="Platform fee for this product"
                  {...form.getInputProps('commissionRate')}
                />
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </form>
  )
}
