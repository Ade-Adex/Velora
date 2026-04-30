// /app/(admin)/admin/products/page.tsx

import {
  Container, Stack, Group, Title, Text, Button,
  Paper, Table, Badge, ActionIcon, Avatar, Tooltip, Box
} from '@mantine/core'
import {
  Plus, Edit3, Trash2, ExternalLink, Star, AlertCircle,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Category } from '@/app/models/Category'
import ProductFilters from '@/app/components/admin/ProductFilters'
import { IProduct, ICategory, IUser } from '@/app/types'
import mongoose from 'mongoose'


export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  await connectDB()

  const query: Record<string, unknown> = {}
  if (q) query.name = { $regex: q, $options: 'i' }
  if (category && category !== 'all') query.category = category

  const [products, categories] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .populate('updatedBy', 'fullName image') // Populate the editor's details
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
              <Title order={2} fw={900} lts="-1px">
                Products
              </Title>
              <Text c="dimmed" size="sm">
                Manage your catalog and stock.
              </Text>
            </Stack>
            <Link href="/admin/products/new" className="no-underline">
              <Button
                leftSection={<Plus size={18} />}
                radius="md"
                color="black"
              >
                Add Product
              </Button>
            </Link>
          </Group>
        </header>

        <ProductFilters
          categories={JSON.parse(JSON.stringify(categories))}
          currentQuery={q}
          currentCategory={category}
        />

        <Paper radius="md" withBorder shadow="sm" className="overflow-hidden">
          <Table verticalSpacing="md" highlightOnHover>
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                  Product
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                  Category
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                  Pricing
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                  Last Edit
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                  Inventory
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: IProduct) => {
                const categoryData = product.category as unknown as ICategory
                const editor = product.updatedBy as unknown as IUser


                // console.log('Product:', product)
                // console.log('Category:', categoryData)
                console.log('Editor:', editor)

                // Professional Pricing Calculation
                const hasDiscount =
                  product.onSale &&
                  product.discountPrice &&
                  product.discountPrice < product.basePrice
                const displayPrice = hasDiscount
                  ? product.discountPrice
                  : product.basePrice

                return (
                  <tr
                    key={product._id.toString()}
                    className="border-t border-gray-100"
                  >
                    <td className="p-4">
                      <Group gap="sm">
                        <Avatar
                          src={
                            typeof product.mainImage === 'string'
                              ? product.mainImage
                              : null
                          }
                          radius="md"
                          size="lg"
                          bg="gray.1"
                        >
                          <Package size={20} />
                        </Avatar>
                        <div style={{ maxWidth: 200 }}>
                          <Text size="sm" fw={800} truncate="end">
                            {product.name}
                          </Text>
                          <Group gap={4}>
                            <Star size={12} fill="#fab005" stroke="#fab005" />
                            <Text size="xs" c="dimmed" fw={700}>
                              {product.ratings?.average || 0} (
                              {product.ratings?.count || 0})
                            </Text>
                          </Group>
                        </div>
                      </Group>
                    </td>
                    <td className="p-4">
                      <Badge variant="light" color="gray" radius="sm">
                        {categoryData?.name || 'Uncategorized'}
                      </Badge>
                    </td>

                    {/* PROFESSIONAL PRICING SECTION */}
                    <td className="p-4">
                      <Stack gap={0}>
                        <Group gap={6} align="center">
                          <Text size="sm" fw={900}>
                            ₦{displayPrice?.toLocaleString()}
                          </Text>
                          {hasDiscount && (
                            <Badge
                              color="red"
                              variant="filled"
                              size="xs"
                              radius="xs"
                              px={4}
                            >
                              SALE
                            </Badge>
                          )}
                        </Group>
                        {hasDiscount && (
                          <Text size="xs" c="dimmed" td="line-through" fw={500}>
                            ₦{product.basePrice?.toLocaleString()}
                          </Text>
                        )}
                      </Stack>
                    </td>

                    <td className="p-4">
                      <Group gap="xs">
                        <Tooltip label={editor?.fullName || 'System'}>
                          <Avatar
                            src={editor?.image}
                            size="xs"
                            radius="xl"
                            alt={editor?.fullName}
                          >
                            {editor?.fullName?.charAt(0) || 'A'}
                          </Avatar>
                        </Tooltip>
                        <Stack gap={0}>
                          <Text size="xs" fw={700}>
                            {editor?.fullName?.split(' ')[0] || 'Admin'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </Text>
                        </Stack>
                      </Group>
                    </td>

                    <td className="p-4">
                      <Group gap={6}>
                        <Box
                          w={8}
                          h={8}
                          style={{ borderRadius: '50%' }}
                          bg={
                            product.stock <= 0
                              ? 'red.6'
                              : product.stock <= 5
                                ? 'orange.6'
                                : 'green.6'
                          }
                        />
                        <Text
                          size="sm"
                          fw={700}
                          c={product.stock <= 5 ? 'red.7' : 'gray.7'}
                        >
                          {product.stock} in stock
                        </Text>
                      </Group>
                    </td>
                    <td className="p-4">
                      <Group justify="flex-end" gap="xs">
                        <Tooltip label="View in Store">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            component="a"
                            href={`/product/${product.slug}`}
                            target="_blank"
                          >
                            <ExternalLink size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Link href={`/admin/products/edit/${product._id}`}>
                          <ActionIcon variant="subtle" color="blue">
                            <Edit3 size={16} />
                          </ActionIcon>
                        </Link>
                        <ActionIcon variant="subtle" color="red">
                          <Trash2 size={16} />
                        </ActionIcon>
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