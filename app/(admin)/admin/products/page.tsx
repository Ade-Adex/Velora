// /app/(admin)/admin/products/page.tsx

import {
  Container, Stack, Group, Title, Text, Button,
  Paper, Table, Badge, ActionIcon, Avatar, Tooltip, Box
} from '@mantine/core'
import {
  Plus, Edit3, Trash2, ExternalLink, Star, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Category } from '@/app/models/Category'
import ProductFilters from '@/app/components/admin/ProductFilters'
import { IProduct, ICategory } from '@/app/types'
import mongoose from 'mongoose'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  await connectDB()

const query: Record<string, unknown> = {}

if (q) {
  query.name = { $regex: q, $options: 'i' }
}

if (category && category !== 'all') {
  query.category = category
}

  // 2. Fetch Products and Categories
  const [products, categories] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    Category.find().select('name _id').sort({ name: 1 }).lean(),
  ])

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="flex-end">
            <Stack gap={2}>
              <Title order={2} fw={900} lts="-1px">Products</Title>
              <Text c="dimmed" size="sm">Manage your catalog and stock.</Text>
            </Stack>
            <Link href="/admin/products/new" className="no-underline">
              <Button leftSection={<Plus size={18} />} radius="md">
                Add Product
              </Button>
            </Link>
          </Group>
        </header>

        {/* 3. This matches the updated ProductFilters props below */}
        <ProductFilters
          categories={JSON.parse(JSON.stringify(categories))}
          currentQuery={q}
          currentCategory={category}
        />

        <Paper radius="md" withBorder shadow="sm" className="overflow-hidden">
          <Table verticalSpacing="md" highlightOnHover>
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Pricing</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Inventory</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: IProduct) => {
                // 4. Type cast the populated category safely
                const categoryData = product.category as unknown as ICategory;
                
                return (
                  <tr key={product._id.toString()} className="border-t border-gray-100">
                    <td className="p-4">
                      <Group gap="sm">
                        <Avatar
                          // 5. Fixed the Avatar src type error by ensuring it's a string
                          src={typeof product.mainImage === 'string' ? product.mainImage : null}
                          radius="md"
                          size="lg"
                          bg="gray.1"
                        >
                          <Box size={20} />
                        </Avatar>
                        <div style={{ maxWidth: 200 }}>
                          <Text size="sm" fw={800} truncate="end">{product.name}</Text>
                          <Group gap={4}>
                            <Star size={12} fill="#fab005" stroke="#fab005" />
                            <Text size="xs" c="dimmed" fw={700}>
                              {product.ratings?.average || 0} ({product.ratings?.count || 0})
                            </Text>
                          </Group>
                        </div>
                      </Group>
                    </td>
                    <td className="p-4">
                      <Badge variant="light" color="blue" radius="sm">
                        {/* 6. Fixed property 'name' does not exist error */}
                        {categoryData?.name || 'Uncategorized'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Text size="sm" fw={800}>₦{product.basePrice?.toLocaleString()}</Text>
                    </td>
                    <td className="p-4">
                      <Text size="sm" fw={700} c={product.stock <= 5 ? 'red' : 'inherit'}>
                        {product.stock} in stock
                      </Text>
                    </td>
                    <td className="p-4">
                      <Group justify="flex-end" gap="xs">
                        <Link href={`/admin/products/edit/${product._id}`}>
                          <ActionIcon variant="subtle" color="blue"><Edit3 size={16} /></ActionIcon>
                        </Link>
                        <ActionIcon variant="subtle" color="red"><Trash2 size={16} /></ActionIcon>
                      </Group>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Paper>
      </Stack>
    </Container>
  )
}