// /app/(admin)/admin/products/page.tsx



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
  Box,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTab,
  TabsPanel,
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
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Category } from '@/app/models/Category'
import ProductFilters from '@/app/components/admin/ProductFilters'
import PendingApprovalTable from '@/app/components/admin/PendingApprovalTable'
import { IProduct, ICategory, IUser, Serialized } from '@/app/types'
import {
  getPendingProducts,
  getRejectedProducts,
} from '@/app/services/adminService'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
    tab?: string
  }>
}) {
  const { q, category, page, tab = 'active' } = await searchParams
  await connectDB()

  // --- 1. Pagination & Query Logic for Active Products ---
  const limit = 10
  const currentPage = Math.max(1, parseInt(page || '1'))
  const skip = (currentPage - 1) * limit

  const activeQuery: Record<string, unknown> = { approvalStatus: 'approved' }
  if (q) activeQuery.name = { $regex: q, $options: 'i' }
  if (category && category !== 'all') activeQuery.category = category

  // --- 2. Data Fetching ---
  const [products, categories, totalActive, pendingProducts, rejectedProducts] =
    await Promise.all([
      Product.find(activeQuery)
        .populate('category', 'name')
        .populate('updatedBy', 'fullName image')
        .populate('vendor', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.find().select('name _id').sort({ name: 1 }).lean(),
      Product.countDocuments(activeQuery),
      getPendingProducts(),
      getRejectedProducts(),
    ])

  const totalPages = Math.ceil(totalActive / limit)

  return (
    <div className="md:px-4 py-0">
      <Stack gap="xl">
        {/* Header Section */}
        <header>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Title
                order={2}
                fw={900}
                lts="-1px"
                fz={{ base: 'xl', md: '26px' }}
              >
                Inventory Management
              </Title>
              <Text c="dimmed" size="sm">
                Control product visibility and marketplace approvals
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

        {/* Tabbed Navigation */}
        <Tabs defaultValue={tab} variant="outline" radius="md">
          <TabsList mb="lg">
            <TabsTab value="active" leftSection={<CheckCircle size={16} />}>
              Active Catalog{' '}
              <Badge size="xs" ml={5}>
                {totalActive}
              </Badge>
            </TabsTab>

            <TabsTab
              value="pending"
              color="orange"
              leftSection={<Clock size={16} />}
            >
              Pending{' '}
              <Badge size="xs" color="orange" ml={5}>
                {pendingProducts.length}
              </Badge>
            </TabsTab>

            {/* NEW REJECTED TAB */}
            <TabsTab
              value="rejected"
              color="red"
              leftSection={<XCircle size={16} />}
            >
              Rejected{' '}
              <Badge size="xs" color="red" ml={5}>
                {rejectedProducts.length}
              </Badge>
            </TabsTab>
          </TabsList>

          {/* PANEL: ACTIVE PRODUCTS */}
          <TabsPanel value="active">
            <Stack gap="md">
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
                          Editor
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
                        const editor =
                          product.updatedBy as unknown as Serialized<IUser>
                        const initials =
                          editor?.fullName
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || 'S'
                        const displayPrice =
                          product.onSale && product.discountPrice
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
                                      : product.mainImage?.src
                                  }
                                  radius="md"
                                  size="lg"
                                  bg="gray.1"
                                >
                                  <Package size={20} />
                                </Avatar>
                                <Box>
                                  <Text
                                    size="sm"
                                    fw={800}
                                    className="line-clamp-1"
                                  >
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
                              <Badge variant="dot" color="blue">
                                {categoryData?.name || 'General'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Text size="sm" fw={900}>
                                ₦{displayPrice?.toLocaleString()}
                              </Text>
                            </td>
                            <td className="p-4">
                              <Group gap="xs">
                                <Avatar
                                  src={editor?.image}
                                  size="xs"
                                  radius="xl"
                                >
                                  {initials}
                                </Avatar>
                                <Text size="xs" fw={700}>
                                  {editor?.fullName || 'System'}
                                </Text>
                              </Group>
                            </td>
                            <td className="p-4">
                              <Group justify="flex-end" gap={4}>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  component="a"
                                  href={`/product/${product.slug}`}
                                  target="_blank"
                                >
                                  <ExternalLink size={16} />
                                </ActionIcon>
                                <Link
                                  href={`/admin/products/edit/${product._id}`}
                                >
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

                {/* Pagination Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={600}>
                      Showing {skip + 1} to{' '}
                      {Math.min(skip + limit, totalActive)} of {totalActive}
                    </Text>
                    <Group gap="xs">
                      <Link
                        href={`/admin/products?page=${currentPage - 1}${q ? `&q=${q}` : ''}`}
                        style={{
                          pointerEvents: currentPage <= 1 ? 'none' : 'auto',
                        }}
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

                      <Text size="xs" fw={800}>
                        Page {currentPage} of {totalPages}
                      </Text>

                      <Link
                        href={`/admin/products?page=${currentPage + 1}${q ? `&q=${q}` : ''}`}
                        style={{
                          pointerEvents:
                            currentPage >= totalPages ? 'none' : 'auto',
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
          </TabsPanel>

          {/* PANEL: PENDING APPROVALS */}
          <TabsPanel value="pending">
            <Paper
              radius="md"
              withBorder
              shadow="xs"
              style={{ overflow: 'hidden' }}
            >
              <PendingApprovalTable
                key={`pending-${pendingProducts.length}`}
                products={JSON.parse(JSON.stringify(pendingProducts))}
              />
            </Paper>
          </TabsPanel>

          {/* PANEL: REJECTED PRODUCTS */}
          <TabsPanel value="rejected">
            <Paper
              radius="md"
              withBorder
              shadow="xs"
              style={{ overflow: 'hidden' }}
            >
              <PendingApprovalTable
                key={`rejected-${rejectedProducts.length}`}
                products={JSON.parse(JSON.stringify(rejectedProducts))}
                isRejectedTab={true}
              />
            </Paper>
          </TabsPanel>
        </Tabs>
      </Stack>
    </div>
  )
}