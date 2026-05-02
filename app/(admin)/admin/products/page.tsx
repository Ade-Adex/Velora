import {
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
  Pagination,
} from '@mantine/core'
import {
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Category } from '@/app/models/Category'
import ProductFilters from '@/app/components/admin/ProductFilters'
import { IProduct, ICategory, IUser } from '@/app/types'
import { redirect } from 'next/navigation'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const { q, category, page } = await searchParams
  await connectDB()

  // Pagination Logic
  const limit = 10
  const currentPage = Math.max(1, parseInt(page || '1'))
  const skip = (currentPage - 1) * limit

  const query: Record<string, unknown> = {}
  if (q) query.name = { $regex: q, $options: 'i' }
  if (category && category !== 'all') query.category = category

  const [products, categories, totalProducts] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .populate('updatedBy', 'fullName image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Category.find().select('name _id').sort({ name: 1 }).lean(),
    Product.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalProducts / limit)

  return (
    <div className="md:px-4 py-0">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Title
                order={2}
                fw={900}
                lts="-1px"
                fz={{ base: 'xl', md: '26px' }}
              >
                Products
              </Title>
              <Text c="dimmed" size="sm">
                Total {totalProducts} items found
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
              miw={850}
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
                  const editor = product.updatedBy as unknown as IUser | null
                  const displayName = editor?.fullName || 'System'
                  const initials =
                    editor?.fullName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'S'

                  const hasDiscount =
                    product.onSale &&
                    product.discountPrice &&
                    product.discountPrice < product.basePrice
                  const displayPrice = hasDiscount
                    ? product.discountPrice
                    : product.basePrice
                  const imageSrc =
                    typeof product.mainImage === 'string'
                      ? product.mainImage
                      : product.mainImage?.src

                  return (
                    <tr
                      key={product._id.toString()}
                      className="border-t border-gray-100"
                    >
                      <td className="p-4">
                        <Group gap="sm" wrap="nowrap">
                          <Avatar
                            src={imageSrc}
                            radius="md"
                            size="lg"
                            bg="gray.1"
                          >
                            <Package size={20} />
                          </Avatar>
                          <Box style={{ flex: 1, minWidth: 150 }}>
                            <Text size="sm" fw={800} className="line-clamp-1">
                              {product.name}
                            </Text>
                            <Group gap={4}>
                              <Star size={12} fill="#fab005" stroke="#fab005" />
                              <Text size="xs" c="dimmed" fw={700}>
                                {product.ratings?.average || 0}
                              </Text>
                            </Group>
                          </Box>
                        </Group>
                      </td>

                      <td className="p-4">
                        <Badge variant="dot" color="blue" radius="sm">
                          {categoryData?.name || 'Uncategorized'}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <Stack gap={0}>
                          <Text size="sm" fw={900}>
                            ₦{displayPrice?.toLocaleString()}
                          </Text>
                          {hasDiscount && (
                            <Text
                              size="xs"
                              c="red.6"
                              td="line-through"
                              fw={500}
                            >
                              ₦{product.basePrice?.toLocaleString()}
                            </Text>
                          )}
                        </Stack>
                      </td>

                      {/* Mobile Optimized "Last Edit" Section */}
                      <td className="p-4">
                        <Group gap="sm" wrap="nowrap">
                          <Avatar
                            src={editor?.image}
                            size="sm" // Increased size for better visibility
                            radius="xl"
                            color="blue"
                            className="border border-gray-100 shadow-sm"
                          >
                            {initials}
                          </Avatar>
                          <Stack gap={0}>
                            <Text
                              size="xs"
                              fw={800}
                              className="whitespace-nowrap"
                            >
                              {displayName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {new Date(product.updatedAt).toLocaleDateString()}
                            </Text>
                          </Stack>
                        </Group>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant="light"
                          color={
                            product.stock <= 0
                              ? 'red'
                              : product.stock <= 5
                                ? 'orange'
                                : 'green'
                          }
                        >
                          {product.stock} in stock
                        </Badge>
                      </td>

                      <td className="p-4">
                        <Group justify="flex-end" gap={4} wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            component="a"
                            href={`/product/${product.slug}`}
                            target="_blank"
                          >
                            <ExternalLink size={16} />
                          </ActionIcon>
                          <Link href={`/admin/products/edit/${product._id}`}>
                            <ActionIcon variant="light" color="blue">
                              <Edit3 size={16} />
                            </ActionIcon>
                          </Link>
                          <ActionIcon variant="light" color="red">
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

          {/* Professional Pagination Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={600}>
                Showing {skip + 1} to {Math.min(skip + limit, totalProducts)} of{' '}
                {totalProducts}
              </Text>

              <Group gap="xs">
                <Link
                  href={`/admin/products?page=${currentPage - 1}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}`}
                  style={{ pointerEvents: currentPage <= 1 ? 'none' : 'auto' }}
                >
                  <Button
                    variant="default"
                    size="compact-sm"
                    disabled={currentPage <= 1}
                    leftSection={<ChevronLeft size={14} />}
                  >
                    Prev
                  </Button>
                </Link>

                <div className="flex items-center px-3">
                  <Text size="xs" fw={800}>
                    Page {currentPage} of {totalPages}
                  </Text>
                </div>

                <Link
                  href={`/admin/products?page=${currentPage + 1}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}`}
                  style={{
                    pointerEvents: currentPage >= totalPages ? 'none' : 'auto',
                  }}
                >
                  <Button
                    variant="default"
                    size="compact-sm"
                    disabled={currentPage >= totalPages}
                    rightSection={<ChevronRight size={14} />}
                  >
                    Next
                  </Button>
                </Link>
              </Group>
            </Group>
          </div>
        </Paper>
      </Stack>
    </div>
  )
}
