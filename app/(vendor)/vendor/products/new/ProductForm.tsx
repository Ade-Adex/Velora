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
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { Plus, Trash, Check, ArrowLeft, Info, ShieldAlert } from 'lucide-react'
import { createProduct } from '@/app/services/product-service' // Ensure this returns a typed Promise
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      mainImage: '',
      gallery: [],
      stock: 0,
      tags: [],
      isPublished: true,
      specifications: [],
      variants: [],
      seo: { title: '', description: '' },
    },
    validate: {
      name: (value) =>
        value.length < 3 ? 'Name must be at least 3 characters' : null,
      category: (value) => (!value ? 'Please select a category' : null),
      basePrice: (value) =>
        value <= 0 ? 'Price must be greater than 0' : null,
      mainImage: (value) => (!value ? 'Main image URL is required' : null),
    },
  })

  const handleCreate = async (values: ProductFormValues) => {
    setLoading(true)
    try {
      const res = await createProduct(values)

      if (res.success) {
        enqueueSnackbar('Product successfully listed!', { variant: 'success' })
        router.push('/vendor/products')
        router.refresh()
      } else {
        const errorMessage = res.error || 'Failed to create product'
        enqueueSnackbar(errorMessage, {
          variant: res.error === 'KYC_INCOMPLETE' ? 'warning' : 'error',
        })
      }
    } catch (err) {
      enqueueSnackbar('An unexpected error occurred', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const isRestricted = !userStatus.isVerified && !userStatus.isAdmin

  return (
    <form onSubmit={form.onSubmit(handleCreate)}>
      <Stack gap="xl" pb={100} className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Group gap="xs">
              <Button
                component={Link}
                href="/vendor/products"
                variant="subtle"
                leftSection={<ArrowLeft size={16} />}
                px={0}
              >
                Back to Products
              </Button>
            </Group>
            <Title order={2}>Create New Product</Title>
          </Stack>

          <Group>
            <Button variant="default" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={isRestricted}
              leftSection={<Check size={18} />}
            >
              Publish Product
            </Button>
          </Group>
        </Group>

        {isRestricted && (
          <Alert
            icon={<ShieldAlert size={16} />}
            title="Verification Required"
            color="orange"
          >
            Your account is currently under review. You can draft products, but
            publishing is restricted until your vendor profile is verified.
          </Alert>
        )}

        <Grid gutter="lg">
          {/* Main Information */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Text fw={600} size="lg">
                    Basic Details
                  </Text>
                  <TextInput
                    label="Product Name"
                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                    required
                    {...form.getInputProps('name')}
                  />
                  <Grid>
                    <Grid.Col span={6}>
                      <TextInput
                        label="Brand"
                        placeholder="e.g. Sony"
                        {...form.getInputProps('brand')}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Select
                        label="Category"
                        placeholder="Select category"
                        data={categoryOptions}
                        required
                        {...form.getInputProps('category')}
                      />
                    </Grid.Col>
                  </Grid>
                  <Textarea
                    label="Short Description"
                    placeholder="Brief summary for search results..."
                    rows={2}
                    {...form.getInputProps('shortDescription')}
                  />
                  <Textarea
                    label="Full Description"
                    placeholder="Detailed product information..."
                    minRows={5}
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Text fw={600} size="lg">
                    Inventory & Pricing
                  </Text>
                  <Grid>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Base Price"
                        prefix="$"
                        min={0}
                        hideControls
                        {...form.getInputProps('basePrice')}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Discount Price"
                        prefix="$"
                        min={0}
                        hideControls
                        {...form.getInputProps('discountPrice')}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <NumberInput
                        label="Stock Quantity"
                        min={0}
                        {...form.getInputProps('stock')}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Sidebar Settings */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Text fw={600} size="lg">
                    Status & Visibility
                  </Text>
                  <Divider />
                  <Switch
                    label="Publish to storefront"
                    description="Make this product visible to customers immediately"
                    {...form.getInputProps('isPublished', { type: 'checkbox' })}
                  />
                  <TagsInput
                    label="Search Tags"
                    placeholder="Add keywords"
                    {...form.getInputProps('tags')}
                  />
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Text fw={600} size="lg">
                    Product Images
                  </Text>
                  <TextInput
                    label="Main Image URL"
                    placeholder="https://..."
                    required
                    {...form.getInputProps('mainImage')}
                  />
                  <Text size="xs" c="dimmed">
                    Please provide direct links to your hosted images.
                  </Text>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </form>
  )
}
