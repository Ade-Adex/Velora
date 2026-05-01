// // /app/(admin)/admin/products/page.tsx

import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Paper,
  Table,
  Badge,
  ActionIcon,
  Avatar,
  Tooltip,
  Box,
  ScrollArea,
} from '@mantine/core'
import { Plus, Edit3, Trash2, ExternalLink, Star, Package } from 'lucide-react'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Category } from '@/app/models/Category'
import ProductFilters from '@/app/components/admin/ProductFilters'
import { IProduct, ICategory, IUser } from '@/app/types'

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
      .populate('updatedBy', 'fullName image')
      .sort({ createdAt: -1 })
      .lean(),
    Category.find().select('name _id').sort({ name: 1 }).lean(),
  ])

  return (
      <div className="md:px-4 py-0">
        <Stack gap="xl">
          <header>
            <Group justify="space-between" align="flex-end">
              <Stack gap={2}>
                <Title
                  order={2}
                  fw={900}
                  lts="-1px"
                  fz={{ base: 'xl', md: '26px' }}
                >
                  Products
                </Title>
                <Text c="dimmed" size="sm" visibleFrom="sm">
                  Manage your catalog and stock.
                </Text>
              </Stack>
              <Link href="/admin/products/new" className="no-underline">
                <Button
                  leftSection={<Plus size={18} />}
                  radius="md"
                  color="black"
                  size="sm"
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

          <Paper
            radius="md"
            withBorder
            shadow="xs"
            style={{ overflow: 'hidden' }}
          >
            <ScrollArea scrollbars="x">
              <Table
                verticalSpacing="md"
                horizontalSpacing="md"
                highlightOnHover
                miw={800}
              >
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
                    <th
                      className="p-4 text-xs font-bold text-gray-500 uppercase"
                      data-visible-from="md"
                    >
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
                    const categoryData =
                      product.category as unknown as ICategory
                    const editor = product.updatedBy as unknown as IUser | null
                    const displayName = editor?.fullName || 'System'
                    const initials = editor?.fullName
                      ? editor.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'S'

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
                          <Group gap="sm" wrap="nowrap">
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
                            <Box style={{ flex: 1, minWidth: 120 }}>
                              <Text size="sm" fw={800} truncate="end">
                                {product.name}
                              </Text>
                              <Group gap={4}>
                                <Star
                                  size={12}
                                  fill="#fab005"
                                  stroke="#fab005"
                                />
                                <Text size="xs" c="dimmed" fw={700}>
                                  {product.ratings?.average || 0}
                                </Text>
                              </Group>
                            </Box>
                          </Group>
                        </td>

                        <td className="p-4">
                          <Badge variant="light" color="gray" radius="sm">
                            {categoryData?.name || 'Uncategorized'}
                          </Badge>
                        </td>

                        <td className="p-4">
                          <Stack gap={0}>
                            <Group gap={6} align="center" wrap="nowrap">
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
                              <Text
                                size="xs"
                                c="dimmed"
                                td="line-through"
                                fw={500}
                              >
                                ₦{product.basePrice?.toLocaleString()}
                              </Text>
                            )}
                          </Stack>
                        </td>

                        <td className="p-4" data-visible-from="md">
                          <Group gap="xs" wrap="nowrap">
                            <Tooltip label={displayName}>
                              <Avatar
                                src={editor?.image}
                                size="xs"
                                radius="xl"
                                color={!editor ? 'gray' : 'blue'}
                              >
                                {initials}
                              </Avatar>
                            </Tooltip>
                            <Stack gap={0} visibleFrom="lg">
                              <Text size="xs" fw={700} truncate>
                                {displayName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {new Date(
                                  product.updatedAt,
                                ).toLocaleDateString()}
                              </Text>
                            </Stack>
                          </Group>
                        </td>

                        <td className="p-4">
                          <Group gap={6} wrap="nowrap">
                            <Box
                              w={8}
                              h={8}
                              style={{ borderRadius: '50%', flexShrink: 0 }}
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
                              {product.stock}{' '}
                              <span className="hidden md:inline">in stock</span>
                            </Text>
                          </Group>
                        </td>

                        <td className="p-4">
                          <Group justify="flex-end" gap={4} wrap="nowrap">
                            <Tooltip label="View">
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
            </ScrollArea>
          </Paper>
        </Stack>
      </div>
  )
}