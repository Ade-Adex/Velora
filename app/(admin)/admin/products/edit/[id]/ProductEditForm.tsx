'use client'

import { useTransition } from 'react'
import { useForm } from '@mantine/form'
import {
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Button,
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Container,
  Grid,
  Badge,
  Switch,
  SimpleGrid,
  Divider,
} from '@mantine/core'
import { Save, ArrowLeft, Package, Tag, Info } from 'lucide-react'
import { useSnackbar } from 'notistack'
import Link from 'next/link'
import { updateProduct, ProductUpdateDTO } from '@/app/services/adminService'
import { IProduct, ICategory, Serialized } from '@/app/types'

interface EditFormProps {
  product: Serialized<IProduct>
  categories: Serialized<ICategory>[]
}

export default function ProductEditForm({
  product,
  categories,
}: EditFormProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    initialValues: {
      name: product.name,
      brand: product.brand || '',
      basePrice: product.basePrice,
      discountPrice: product.discountPrice || 0,
      stock: product.stock,
      category:
        typeof product.category === 'string'
          ? product.category
          : product.category._id,
      description: product.description,
      onSale: product.onSale || false,
      isPublished: product.isPublished || false,
    },
    validate: {
      name: (val) => (val.length < 2 ? 'Name is too short' : null),
      basePrice: (val) => (val <= 0 ? 'Base price is required' : null),
      discountPrice: (val, values) =>
        values.onSale && val >= values.basePrice
          ? 'Discount must be less than base price'
          : null,
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    startTransition(async () => {
      // Safe casting via unknown
      const updateData = values as unknown as ProductUpdateDTO

      const result = await updateProduct(product._id, updateData)

      if (result.success) {
        enqueueSnackbar(result.message, { variant: 'success' })
      } else {
        enqueueSnackbar(result.error, { variant: 'error' })
      }
    })
  }

  return (
    <Container size="lg" py="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Button
                component={Link}
                href="/admin/products"
                variant="subtle"
                color="gray"
                leftSection={<ArrowLeft size={16} />}
                p={0}
              >
                Back to Dashboard
              </Button>
              <Group gap="sm">
                <Title order={2} fw={900}>
                  Edit Product
                </Title>
                <Badge
                  color={form.values.isPublished ? 'green' : 'orange'}
                  variant="dot"
                >
                  {form.values.isPublished ? 'Live' : 'Draft'}
                </Badge>
              </Group>
            </Stack>
            <Button
              type="submit"
              loading={isPending}
              leftSection={<Save size={18} />}
              color="black"
              size="md"
            >
              Save Changes
            </Button>
          </Group>

          <Grid gap="md">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Paper p="xl" withBorder radius="md">
                  <Stack gap="md">
                    <Group gap="xs">
                      <Info size={18} />
                      <Text fw={700}>Basic Information</Text>
                    </Group>
                    <TextInput
                      label="Product Name"
                      required
                      {...form.getInputProps('name')}
                    />
                    <SimpleGrid cols={2}>
                      <TextInput
                        label="Brand"
                        required
                        {...form.getInputProps('brand')}
                      />
                      <Select
                        label="Category"
                        data={categories.map((c) => ({
                          value: c._id,
                          label: c.name,
                        }))}
                        {...form.getInputProps('category')}
                      />
                    </SimpleGrid>
                    <Textarea
                      label="Description"
                      minRows={6}
                      {...form.getInputProps('description')}
                    />
                  </Stack>
                </Paper>

                <Paper p="xl" withBorder radius="md">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Tag size={18} />
                        <Text fw={700}>Pricing</Text>
                      </Group>
                      <Switch
                        label="On Sale"
                        {...form.getInputProps('onSale', { type: 'checkbox' })}
                      />
                    </Group>
                    <SimpleGrid cols={2}>
                      <NumberInput
                        label="Price (₦)"
                        required
                        {...form.getInputProps('basePrice')}
                      />
                      <NumberInput
                        label="Discount Price (₦)"
                        disabled={!form.values.onSale}
                        {...form.getInputProps('discountPrice')}
                      />
                    </SimpleGrid>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                <Paper p="xl" withBorder radius="md">
                  <Stack gap="md">
                    <Text fw={700}>Inventory</Text>
                    <NumberInput
                      label="Stock Count"
                      required
                      {...form.getInputProps('stock')}
                    />
                    <Divider />
                    <Switch
                      label="Is Published"
                      description="Visible to customers"
                      {...form.getInputProps('isPublished', {
                        type: 'checkbox',
                      })}
                    />
                  </Stack>
                </Paper>

                <Paper p="md" withBorder radius="md" bg="gray.0">
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">
                      <b>ID:</b> {product._id}
                    </Text>
                    <Text size="xs" c="dimmed">
                      <b>Updated:</b>{' '}
                      {new Date(product.updatedAt).toLocaleString()}
                    </Text>
                    <Text size="xs" c="blue" fw={600} mt={5}>
                      Audit: Updates are logged per admin session.
                    </Text>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </Container>
  )
}
