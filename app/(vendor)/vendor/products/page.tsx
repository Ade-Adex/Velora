// /app/(vendor)/vendor/products/page.tsx
export const dynamic = 'force-dynamic'

import {
  Box,
  Title,
  Text,
  Group,
  Button,
  Table,
  Badge,
  Avatar,
  Paper,
  Menu,
  ActionIcon,
  Tooltip,
  ScrollArea,
  // Direct Table Imports
  TableThead,
  TableTbody,
  TableTr,
  TableTh,
  TableTd,
  // Direct Menu Imports
  MenuTarget,
  MenuDropdown,
  MenuItem,
  MenuDivider,
} from '@mantine/core'
import {
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Trash,
  AlertTriangle,
  Package,
} from 'lucide-react'
import { getVendorProducts } from '@/app/services/vendor-service'
import { Serialized, IProduct } from '@/app/types'
import Link from 'next/link'

export default async function VendorProductsPage() {
  const products: Serialized<IProduct>[] = await getVendorProducts()

  return (
    <Box py="md">
      <Group justify="space-between" mb="xl" wrap="nowrap">
        <Box>
          <Title order={2} fw={900} fz={{ base: 'xl', md: '26px' }}>
            Inventory
          </Title>
          <Text c="dimmed" size="sm" visibleFrom="sm">
            Manage your marketplace listings and stock levels.
          </Text>
        </Box>
        <Link href="/vendor/products/new" style={{ textDecoration: 'none' }}>
          <Button leftSection={<Plus size={18} />} color="black" radius="md">
            Add <span className="hidden sm:inline ml-1">Product</span>
          </Button>
        </Link>
      </Group>

      <Paper withBorder radius="md" shadow="xs" style={{ overflow: 'hidden' }}>
        <ScrollArea h={600} offsetScrollbars>
          <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover miw={700}>
            <TableThead bg="gray.0">
              <TableTr>
                <TableTh style={{ width: '40%' }}>Product</TableTh>
                <TableTh>Status</TableTh>
                <TableTh>Stock</TableTh>
                <TableTh>Price</TableTh>
                <TableTh />
              </TableTr>
            </TableThead>
            <TableTbody>
              {products.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={5} align="center" py={50}>
                    <Package size={40} strokeWidth={1} color="gray" />
                    <Text c="dimmed" mt="sm">No products found.</Text>
                  </TableTd>
                </TableTr>
              ) : (
                products.map((product) => (
                  <TableTr key={product._id}>
                    <TableTd>
                      <Group gap="sm" wrap="nowrap">
                        <Avatar
                          src={typeof product.mainImage === 'string' ? product.mainImage : product.mainImage?.src}
                          radius="md"
                          size="lg"
                          bg="gray.1"
                        >
                          <Package size={20} />
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={800} className="line-clamp-1">
                            {product.name}
                          </Text>
                          <Text size="xs" c="dimmed" fw={600}>
                            {product.brand || 'No Brand'}
                          </Text>
                        </Box>
                      </Group>
                    </TableTd>
                    <TableTd>
                      <Badge
                        variant="light"
                        radius="sm"
                        color={
                          product.approvalStatus === 'approved' ? 'green' : 
                          product.approvalStatus === 'pending' ? 'orange' : 'red'
                        }
                      >
                        {product.approvalStatus}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Group gap={5}>
                        <Text size="sm" fw={700} c={product.stock < 5 ? 'red' : 'inherit'}>
                          {product.stock}
                        </Text>
                        {product.stock < 10 && (
                          <Tooltip label="Low Stock">
                            <AlertTriangle size={14} color="red" />
                          </Tooltip>
                        )}
                      </Group>
                    </TableTd>
                    <TableTd>
                      <Text size="sm" fw={900}>
                        ₦{product.onSale ? product.discountPrice?.toLocaleString() : product.basePrice?.toLocaleString()}
                      </Text>
                    </TableTd>
                    <TableTd>
                      {/* FIX: Use MenuTarget, MenuDropdown, etc. directly */}
                      <Menu position="bottom-end" shadow="md" width={160}>
                        <MenuTarget>
                          <ActionIcon variant="subtle" color="gray">
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </MenuTarget>
                        <MenuDropdown>
                          <Link 
                            href={`/vendor/products/edit/${product._id}`} 
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <MenuItem leftSection={<Edit size={14} />}>
                              Edit Details
                            </MenuItem>
                          </Link>

                          <a 
                            href={`/product/${product.slug}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <MenuItem leftSection={<Eye size={14} />}>
                              View in Shop
                            </MenuItem>
                          </a>
                          
                          <MenuDivider />
                          <MenuItem color="red" leftSection={<Trash size={14} />}>
                            Delete
                          </MenuItem>
                        </MenuDropdown>
                      </Menu>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Box>
  )
}