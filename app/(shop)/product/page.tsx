


'use client'

import { useState } from 'react'
import { 
  TextInput, NumberInput, Textarea, Button, Paper, Stack, Title, 
  Grid, Group, Select, MultiSelect, ActionIcon, Text, Divider, Switch, Tabs
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { Plus, Trash, Check, ArrowLeft, Settings, Image as ImageIcon, Tag } from 'lucide-react'
import { createProduct } from '@/app/services/product-service'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfessionalNewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      name: '',
      brand: '',
      description: '',
      shortDescription: '',
      basePrice: 0,
      discountPrice: 0,
      category: '', // Should be fetched from Category model
      mainImage: '',
      gallery: [] as string[],
      stock: 0,
      tags: [] as string[],
      isPublished: false,
      specifications: [{ label: '', value: '' }],
      variants: [] as any[]
    },
    validate: {
      name: (v) => (!v ? 'Product name is required' : null),
      brand: (v) => (!v ? 'Brand is required' : null),
      basePrice: (v) => (v <= 0 ? 'Set a valid price' : null),
      mainImage: (v) => (!v ? 'Main image URL is required' : null),
    }
  })

  const handleCreate = async (values: typeof form.values) => {
    setLoading(true)
    const res = await createProduct({
      ...values,
      vendor: "CURRENT_USER_ID_FROM_SESSION" as any // Replace with actual auth logic
    })

    if (res.success) {
      notifications.show({ title: 'Product Created', message: 'Submitted for admin approval.', color: 'green' })
      router.push('/vendor/products')
    } else {
      notifications.show({ title: 'Error', message: res.error, color: 'red' })
    }
    setLoading(false)
  }

  return (
    <Stack gap="xl" pb={100}>
      <Group justify="space-between">
        <Group>
          <ActionIcon component={Link} href="/vendor/products" variant="light" radius="xl"><ArrowLeft size={18} /></ActionIcon>
          <div>
            <Title order={2} fw={900}>New Marketplace Listing</Title>
            <Text size="sm" c="dimmed">Complete details to list your product in the store.</Text>
          </div>
        </Group>
        <Button 
          loading={loading} 
          onClick={() => form.onSubmit(handleCreate)()} 
          leftSection={<Check size={18}/>}
          radius="md"
          color="indigo.6"
        >
          Submit for Approval
        </Button>
      </Group>

      <form>
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Content Section */}
              <Paper withBorder p="xl" radius="md">
                <Title order={4} mb="lg">Product Identity</Title>
                <Grid>
                  <Grid.Col span={8}><TextInput label="Product Name" {...form.getInputProps('name')} placeholder="e.g. Premium Wireless Headphones" required /></Grid.Col>
                  <Grid.Col span={4}><TextInput label="Brand" {...form.getInputProps('brand')} placeholder="e.g. Sony" required /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Short Pitch" {...form.getInputProps('shortDescription')} placeholder="One sentence summary..." /></Grid.Col>
                  <Grid.Col span={12}><Textarea label="Full Description" {...form.getInputProps('description')} minRows={5} required /></Grid.Col>
                </Grid>
              </Paper>

              {/* Asset Section */}
              <Paper withBorder p="xl" radius="md">
                <Title order={4} mb="lg">Media Assets</Title>
                <TextInput label="Main Image URL" {...form.getInputProps('mainImage')} placeholder="https://..." mb="md" />
                <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Gallery Images</Text>
                {form.values.gallery.map((_, i) => (
                  <Group key={i} mb="xs">
                    <TextInput flex={1} {...form.getInputProps(`gallery.${i}`)} />
                    <ActionIcon color="red" variant="subtle" onClick={() => form.removeListItem('gallery', i)}><Trash size={16}/></ActionIcon>
                  </Group>
                ))}
                <Button variant="light" size="xs" leftSection={<Plus size={14}/>} onClick={() => form.insertListItem('gallery', '')}>Add to Gallery</Button>
              </Paper>

              {/* Variants Section */}
              <Paper withBorder p="xl" radius="md">
                <Group justify="space-between" mb="lg">
                  <Title order={4}>Product Variants</Title>
                  <Button variant="outline" size="xs" onClick={() => form.insertListItem('variants', { sku: '', name: '', stock: 0 })}>Add Variant</Button>
                </Group>
                {form.values.variants.length === 0 && <Text size="sm" c="dimmed" ta="center" py="xl" className="border-2 border-dashed rounded-md">No variants defined (e.g. Sizes/Colors)</Text>}
                {form.values.variants.map((_, i) => (
                  <Card withBorder key={i} mb="sm" padding="sm">
                    <Grid align="flex-end">
                      <Grid.Col span={4}><TextInput label="Variant Name" placeholder="Red / XL" {...form.getInputProps(`variants.${i}.name`)} /></Grid.Col>
                      <Grid.Col span={4}><TextInput label="SKU" placeholder="SKU-001" {...form.getInputProps(`variants.${i}.sku`)} /></Grid.Col>
                      <Grid.Col span={3}><NumberInput label="Stock" {...form.getInputProps(`variants.${i}.stock`)} /></Grid.Col>
                      <Grid.Col span={1}><ActionIcon color="red" mb={5} onClick={() => form.removeListItem('variants', i)}><Trash size={16}/></ActionIcon></Grid.Col>
                    </Grid>
                  </Card>
                ))}
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Status Card */}
              <Paper withBorder p="xl" radius="md">
                <Title order={4} mb="md">Publishing</Title>
                <Switch 
                  label="Visible to Customers" 
                  description="Product won't show until approved by Admin"
                  {...form.getInputProps('isPublished', { type: 'checkbox' })}
                />
              </Paper>

              {/* Pricing Card */}
              <Paper withBorder p="xl" radius="md">
                <Title order={4} mb="md">Pricing</Title>
                <Stack gap="sm">
                  <NumberInput label="Base Price (₦)" prefix="₦" hideControls {...form.getInputProps('basePrice')} required />
                  <NumberInput label="Discount Price (₦)" prefix="₦" hideControls {...form.getInputProps('discountPrice')} />
                  <Divider label="Inventory" labelPosition="center" my="xs" />
                  <NumberInput label="Total Stock" {...form.getInputProps('stock')} />
                </Stack>
              </Paper>

              {/* Classification Card */}
              <Paper withBorder p="xl" radius="md">
                <Title order={4} mb="md">Classification</Title>
                <Stack gap="sm">
                  <Select label="Category" placeholder="Select category" data={['Electronics', 'Apparel', 'Footwear']} {...form.getInputProps('category')} />
                  <MultiSelect label="Tags" placeholder="e.g. Summer, Leather" data={['Trend', 'Eco', 'New']} searchable creatable {...form.getInputProps('tags')} />
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </form>
    </Stack>
  )
}
