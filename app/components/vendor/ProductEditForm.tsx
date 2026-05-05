// /app/components/vendor/ProductEditForm.tsx

'use client'

import { useState } from 'react'
import {
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Grid,
  Switch,
  Group,
  Paper,
  Text,
  Box,
  Divider,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useRouter } from 'next/navigation'
import { Save, X, ImageIcon, Search, Tag } from 'lucide-react'
import { updateVendorProduct } from '@/app/services/vendor-service'
import { Serialized, IProduct } from '@/app/types'

export default function ProductEditForm({
  product,
}: {
  product: Serialized<IProduct>
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm({
    initialValues: {
      name: product.name,
      brand: product.brand || '',
      basePrice: product.basePrice,
      stock: product.stock,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      mainImage: typeof product.mainImage === 'string' ? product.mainImage : product.mainImage?.src || '',
      onSale: product.onSale || false,
      discountPrice: product.discountPrice || 0,
      seoTitle: product.seo?.title || '',
      seoDescription: product.seo?.description || '',
    },
    validate: {
      name: (v) => (v.length < 3 ? 'Name is too short' : null),
      brand: (v) => (!v ? 'Brand is required' : null),
      basePrice: (v) => (v <= 0 ? 'Price must be greater than 0' : null),
      mainImage: (v) => (!v ? 'Image URL is required' : null),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    try {
      // Map flat form values back to nested SEO structure if needed
      const payload = {
        ...values,
        seo: {
          title: values.seoTitle,
          description: values.seoDescription,
        }
      }
      
      const result = await updateVendorProduct(product._id, payload)
      if (result.success) {
        router.push('/vendor/products')
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">
        {/* Basic Information */}
        <Box>
          <Group gap="xs" mb="sm">
            <Tag size={18} />
            <Text fw={700}>Basic Information</Text>
          </Group>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                label="Product Name"
                placeholder="e.g. Wireless Noise Cancelling Headphones"
                {...form.getInputProps('name')}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Brand"
                placeholder="e.g. Sony"
                {...form.getInputProps('brand')}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Short Description"
                placeholder="A brief catchy summary of the product"
                {...form.getInputProps('shortDescription')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Full Description"
                placeholder="Detail everything about the product..."
                minRows={5}
                {...form.getInputProps('description')}
                required
              />
            </Grid.Col>
          </Grid>
        </Box>

        <Divider />

        {/* Pricing & Inventory */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Text fw={700} size="sm">Pricing & Stock</Text>
              <NumberInput
                label="Base Price (₦)"
                placeholder="0.00"
                hideControls
                {...form.getInputProps('basePrice')}
                required
              />
              <NumberInput
                label="Available Stock"
                placeholder="Quantity"
                {...form.getInputProps('stock')}
                required
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" bg="gray.0" radius="md">
              <Group justify="space-between" mb="xs">
                <Box>
                  <Text fw={700} size="sm">Sale Mode</Text>
                  <Text size="xs" c="dimmed">Apply a discount to this product</Text>
                </Box>
                <Switch
                  {...form.getInputProps('onSale', { type: 'checkbox' })}
                  color="green"
                />
              </Group>

              {form.values.onSale && (
                <NumberInput
                  mt="md"
                  label="Discounted Price (₦)"
                  placeholder="Lower than base price"
                  hideControls
                  {...form.getInputProps('discountPrice')}
                />
              )}
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider />

        {/* Media */}
        <Box>
          <Group gap="xs" mb="sm">
            <ImageIcon size={18} />
            <Text fw={700}>Product Media</Text>
          </Group>
          <TextInput
            label="Main Image URL"
            placeholder="https://..."
            {...form.getInputProps('mainImage')}
            required
          />
          <Text size="xs" c="dimmed" mt={5}>
            Enter the direct link to your product image.
          </Text>
        </Box>

        <Divider />

        {/* SEO Settings */}
        <Box>
          <Group gap="xs" mb="sm">
            <Search size={18} />
            <Text fw={700}>SEO (Search Engine Optimization)</Text>
          </Group>
          <Stack gap="md">
            <TextInput
              label="Meta Title"
              placeholder="Title for Google search results"
              {...form.getInputProps('seoTitle')}
            />
            <Textarea
              label="Meta Description"
              placeholder="Brief description for search engines"
              {...form.getInputProps('seoDescription')}
            />
          </Stack>
        </Box>

        {/* Form Actions */}
        <Paper 
          withBorder 
          p="md" 
          pos="sticky" 
          bottom={0} 
          style={{ zIndex: 10, borderLeft: 0, borderRight: 0, borderBottom: 0 }}
        >
          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => router.push('/vendor/products')}
              leftSection={<X size={16} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              color="black"
              size="md"
              leftSection={<Save size={16} />}
            >
              Save Changes
            </Button>
          </Group>
        </Paper>
      </Stack>
    </form>
  )
}