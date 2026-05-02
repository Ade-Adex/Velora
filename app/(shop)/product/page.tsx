

'use client'

import { useState, useEffect } from 'react'
import { 
  TextInput, NumberInput, Textarea, Button, Paper, Stack, Title, 
  Grid, Group, Select, MultiSelect, TagsInput, ActionIcon, Text, Divider, Switch, Card 
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { Plus, Trash, Check, ArrowLeft, Layers, Image as ImageIcon, Info } from 'lucide-react'
import { createProduct, getCategoryOptions} from '@/app/services/product-service'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IVariant, ICategory, IProduct, IReview } from '@/app/types'


// Define the form shape to match your Schema exactly
interface ProductFormValues {
  name: string
  brand: string
  description: string
  shortDescription: string
  basePrice: number
  discountPrice: number
  category: string
  mainImage: string
  gallery: string[]
  stock: number
  tags: string[]
  isPublished: boolean
  specifications: { label: string; value: string }[]
  // ADD PARENTHESES HERE
  variants: (Omit<IVariant, 'attributes'> & { attributes: Record<string, string> })[]
  }

export default function ProfessionalNewProductPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])

  // 1. Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      const options = await getCategoryOptions()
      setCategories(options)
    }
    loadCategories()
  }, [])

  
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
      gallery: [] as string[],
      stock: 0,
      tags: [] as string[],
      isPublished: false,
      specifications: [{ label: '', value: '' }],
      // FIX: Use 'as unknown' to bridge the gap between never[] and your Variant type
      variants: [] as unknown as ProductFormValues['variants']
    },
    validate: {
      name: (v) => (v.length < 3 ? 'Name must be at least 3 characters' : null),
      brand: (v) => (!v ? 'Brand is required' : null),
      basePrice: (v) => (v <= 0 ? 'Price must be greater than 0' : null),
      mainImage: (v) => (!v ? 'Main image URL is required' : null),
      category: (v) => (!v ? 'Please select a category' : null),
    }
  })
      


const handleCreate = async (values: ProductFormValues) => {
    setLoading(true)
    try {
      const res = await createProduct({
  ...values,
  variants: values.variants.map((v): IVariant => ({
    sku: v.sku,
    name: v.name || '',
    stock: Number(v.stock),
    price: v.price ? Number(v.price) : undefined,
    images: v.images || [],
    attributes: v.attributes 
  }))
})

      if (res.success) {
        enqueueSnackbar('Product listing created and pending approval', { variant: 'success' })
        router.push('/vendor/products')
      } else {
        enqueueSnackbar(res.error || 'Failed to create product', { variant: 'error' })
      }
    } catch (error: unknown) {
      enqueueSnackbar('An unexpected error occurred', { variant: 'error' })
    } finally {
      setLoading(false)
    }
          }


  return (
    <Stack gap="xl" pb={100}>
      <Group justify="space-between">
        <Group>
          <ActionIcon component={Link} href="/vendor/products" variant="subtle" radius="xl" size="lg">
            <ArrowLeft size={22} />
          </ActionIcon>
          <div>
            <Title order={2} fw={900} lts="-0.5px">Create Listing</Title>
            <Text size="sm" c="dimmed">Submit your product for marketplace verification.</Text>
          </div>
        </Group>
        <Group>
          <Button variant="subtle" color="gray" component={Link} href="/vendor/products">Cancel</Button>
          <Button 
  loading={loading} 
  onClick={() => form.onSubmit(handleCreate)()} 
  leftSection={<Check size={18}/>}
  radius="md"
  color="indigo.6"
  px="xl"
>
  Submit for Approval
</Button>
        </Group>
      </Group>

      <form>
        <Grid gap="xl">
          {/* Main Content Area */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              <Paper withBorder p="xl" radius="md" shadow="sm">
                <Group mb="lg">
                  <Info size={20} className="text-indigo-600" />
                  <Title order={4}>General Information</Title>
                </Group>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 8 }}>
                    <TextInput label="Product Name" placeholder="e.g. Wireless Noise Cancelling Headphones" {...form.getInputProps('name')} required />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <TextInput label="Brand" placeholder="e.g. Sony" {...form.getInputProps('brand')} required />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput label="Short Description" placeholder="A brief catchphrase for search results" {...form.getInputProps('shortDescription')} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea label="Full Product Description" placeholder="Highlight features, materials, and benefits..." minRows={6} {...form.getInputProps('description')} required />
                  </Grid.Col>
                </Grid>
              </Paper>

              <Paper withBorder p="xl" radius="md" shadow="sm">
                <Group mb="lg">
                  <ImageIcon size={20} className="text-indigo-600" />
                  <Title order={4}>Visual Assets</Title>
                </Group>
                <TextInput label="Main Display Image URL" placeholder="https://..." {...form.getInputProps('mainImage')} required mb="md" />
                
                <Divider label="Gallery Selection" labelPosition="center" my="lg" />
                
                {form.values.gallery.map((_, i) => (
                  <Group key={i} mb="sm">
                    <TextInput placeholder="Secondary Image URL" flex={1} {...form.getInputProps(`gallery.${i}`)} />
                    <ActionIcon color="red" variant="subtle" onClick={() => form.removeListItem('gallery', i)}>
                      <Trash size={18}/>
                    </ActionIcon>
                  </Group>
                ))}
                <Button variant="light" size="xs" leftSection={<Plus size={14}/>} onClick={() => form.insertListItem('gallery', '')}>
                  Add Gallery Image
                </Button>
              </Paper>

              <Paper withBorder p="xl" radius="md" shadow="sm">
                <Group mb="lg" justify="space-between">
                  <Group>
                    <Layers size={20} className="text-indigo-600" />
                    <Title order={4}>Variants & Inventory</Title>
                  </Group>
                  <Button variant="outline" size="xs" onClick={() => form.insertListItem('variants', { sku: '', name: '', stock: 0, attributes: {} })}>
                    Add Variant (Size/Color)
                  </Button>
                </Group>
                
                {form.values.variants.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl" style={{ border: '1px dashed #ced4da', borderRadius: '8px' }}>
                    No variants added. Use variants for products with different sizes, colors, or materials.
                  </Text>
                ) : (
                  form.values.variants.map((_, i) => (
                    <Card withBorder key={i} mb="sm" bg="gray.0">
                      <Grid align="flex-end">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <TextInput label="Variant Name" placeholder="e.g. Matte Black / Large" {...form.getInputProps(`variants.${i}.name`)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, sm: 4 }}>
                          <TextInput label="SKU" placeholder="HD-BLK-01" {...form.getInputProps(`variants.${i}.sku`)} required />
                        </Grid.Col>
                        <Grid.Col span={{ base: 5, sm: 3 }}>
                          <NumberInput label="Stock" {...form.getInputProps(`variants.${i}.stock`)} />
                        </Grid.Col>
                        <Grid.Col span={1}>
                          <ActionIcon color="red" mb={5} onClick={() => form.removeListItem('variants', i)}>
                            <Trash size={16}/>
                          </ActionIcon>
                        </Grid.Col>
                      </Grid>
                    </Card>
                  ))
                )}
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Sidebar Section */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              <Paper withBorder p="xl" radius="md" shadow="sm">
                <Title order={4} mb="lg">Pricing & Status</Title>
                <Stack gap="md">
                  <NumberInput label="Regular Price (₦)" prefix="₦" hideControls {...form.getInputProps('basePrice')} required />
                  <NumberInput label="Sale Price (₦)" prefix="₦" hideControls {...form.getInputProps('discountPrice')} />
                  <NumberInput label="Total Global Stock" description="Total across all variants" {...form.getInputProps('stock')} />
                  
                  <Divider my="sm" />
                  
                  <Switch 
                    label="Publish immediately" 
                    description="Visible once admin approves"
                    {...form.getInputProps('isPublished', { type: 'checkbox' })}
                  />
                </Stack>
              </Paper>

              <Paper withBorder p="xl" radius="md" shadow="sm">
                <Group mb="lg">
    {/* Using the icon you already imported */}
    <Layers size={20} className="text-indigo-600" /> 
    <Title order={4}>Organization</Title>
  </Group>
                <Stack gap="md">
                  <Select 
    label="Category" 
    placeholder={categories.length > 0 ? "Choose category" : "Loading categories..."} 
    data={categories} // Now uses the real IDs from the DB
    {...form.getInputProps('category')} 
    required
    disabled={categories.length === 0}
  />
                  <TagsInput 
                    label="Search Tags" 
                    placeholder="Add keywords" 
                    data={['New Arrival', 'Sale', 'Limited Edition', 'Best Seller']} 
                    {...form.getInputProps('tags')} 
                  />
                </Stack>
              </Paper>

              <Paper withBorder p="xl" radius="md" shadow="sm" bg="indigo.0">
                <Title order={5} c="indigo.9" mb="xs">Marketplace Tip</Title>
                <Text size="xs" c="indigo.8" style={{ lineHeight: 1.5 }}>
                  Detailed descriptions and high-quality image URLs increase your approval speed by 40%. Ensure your SKUs are unique.
                </Text>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </form>
    </Stack>
  )
    }
