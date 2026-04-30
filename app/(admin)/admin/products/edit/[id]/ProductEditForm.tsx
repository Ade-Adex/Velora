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
  Divider,
} from '@mantine/core'
import { Save, ArrowLeft, Package } from 'lucide-react'
import { useSnackbar } from 'notistack'
import Link from 'next/link'
import { updateProduct } from '@/app/services/adminService'
import { IProduct, ICategory, Serialized } from '@/app/types'

interface EditFormProps {
  product: Serialized<IProduct>
  categories: Serialized<ICategory>[]
}


type ProductUpdatePayload = Partial<
  Omit<IProduct, keyof import('mongoose').Document>
>

export default function ProductEditForm({
  product,
  categories,
}: EditFormProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [isPending, startTransition] = useTransition()

  // Define the structure of our form values based on the IProduct model
  const form = useForm({
    initialValues: {
      name: product.name,
      brand: product.brand || '',
      basePrice: product.basePrice,
      stock: product.stock,
      category:
        typeof product.category === 'string'
          ? product.category
          : product.category._id,
      description: product.description,
    },
    validate: {
      name: (val) => (val.length < 2 ? 'Name is too short' : null),
      brand: (val) => (!val ? 'Brand is required' : null),
      basePrice: (val) => (val <= 0 ? 'Invalid price' : null),
    },
  })

const handleSubmit = (values: typeof form.values) => {
  startTransition(async () => {
    // 2. Cast to unknown first, then to your specific Payload type.
    // This is the standard TypeScript pattern to switch between
    // incompatible but related types without losing all type safety.
    const updateData = values as unknown as ProductUpdatePayload

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
          <Group justify="space-between">
            <Group>
              <Button
                component={Link}
                href="/admin/products"
                variant="subtle"
                color="gray"
                leftSection={<ArrowLeft size={16} />}
              >
                Back
              </Button>
              <Title order={2} fw={900}>
                Edit {product.name}
              </Title>
            </Group>
            <Button
              type="submit"
              loading={isPending}
              leftSection={<Save size={18} />}
              color="black"
            >
              Save Changes
            </Button>
          </Group>

          <Grid gap="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper p="xl" withBorder radius="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <Package size={20} />
                    <Text fw={700}>Basic Information</Text>
                  </Group>

                  <TextInput
                    label="Product Name"
                    required
                    {...form.getInputProps('name')}
                  />

                  <TextInput
                    label="Brand"
                    placeholder="e.g. Apple, Nike"
                    required
                    {...form.getInputProps('brand')}
                  />

                  <Textarea
                    label="Description"
                    minRows={5}
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                <Paper p="xl" withBorder radius="md">
                  <Stack gap="md">
                    <Text fw={700}>Inventory & Pricing</Text>
                    <NumberInput
                      label="Price (₦)"
                      required
                      {...form.getInputProps('basePrice')}
                    />
                    <NumberInput
                      label="Stock Count"
                      required
                      {...form.getInputProps('stock')}
                    />
                    <Select
                      label="Category"
                      data={categories.map((c) => ({
                        value: c._id,
                        label: c.name,
                      }))}
                      {...form.getInputProps('category')}
                    />
                  </Stack>
                </Paper>

                <Paper p="md" withBorder radius="md" bg="gray.0">
                  <Text size="xs" c="dimmed">
                    <b>ID:</b> {product._id}
                  </Text>
                  <Text size="xs" c="dimmed">
                    <b>Last Updated:</b>{' '}
                    {new Date(product.updatedAt).toLocaleString()}
                  </Text>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </Container>
  )
}
