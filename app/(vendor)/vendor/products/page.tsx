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
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
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
} from 'lucide-react'
import { getVendorProducts } from '@/app/services/vendor-service'
import { Serialized, IProduct } from '@/app/types'

export default async function VendorProductsPage() {
  const products: Serialized<IProduct>[] = await getVendorProducts()

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Title order={2} fw={800}>
            Inventory
          </Title>
          <Text c="dimmed" size="sm">
            Manage your marketplace listings and stock levels.
          </Text>
        </Box>
        <Button leftSection={<Plus size={18} />} color="indigo" radius="md">
          Add New Product
        </Button>
      </Group>

      <Paper withBorder radius="md" className="overflow-hidden">
        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
          <TableThead bg="gray.0">
            <TableTr>
              <TableTh>Product</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Stock</TableTh>
              <TableTh>Price</TableTh>
              <TableTh />
            </TableTr>
          </TableThead>
          <TableTbody>
            {products.length === 0 ? (
              <TableTr>
                <TableTd colSpan={5} align="center" py="xl">
                  <Text c="dimmed">
                    No products found. Start by adding your first item!
                  </Text>
                </TableTd>
              </TableTr>
            ) : (
              products.map((product) => (
                <TableTr key={product._id}>
                  <TableTd>
                    <Group gap="sm">
                      <Avatar
                        src={product.mainImage as string}
                        radius="md"
                        size="lg"
                      />
                      <Box>
                        <Text size="sm" fw={700}>
                          {product.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {product.brand}
                        </Text>
                      </Box>
                    </Group>
                  </TableTd>
                  <TableTd>
                    <Badge
                      variant="light"
                      color={
                        product.approvalStatus === 'approved'
                          ? 'green'
                          : product.approvalStatus === 'pending'
                            ? 'orange'
                            : 'red'
                      }
                    >
                      {product.approvalStatus}
                    </Badge>
                  </TableTd>
                  <TableTd>
                    <Group gap={5}>
                      <Text
                        size="sm"
                        fw={500}
                        color={product.stock < 10 ? 'red' : 'inherit'}
                      >
                        {product.stock}
                      </Text>
                      {product.stock < 10 && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                    </Group>
                  </TableTd>
                  <TableTd>
                    <Text size="sm" fw={700}>
                      ₦{product.basePrice.toLocaleString()}
                    </Text>
                    <Text size="xs" c="indigo.6">
                      Fee: {product.commissionRate}%
                    </Text>
                  </TableTd>
                  <TableTd>
                    <Menu position="bottom-end">
                      <MenuTarget>
                        <ActionIcon variant="subtle" color="gray">
                          <MoreVertical size={16} />
                        </ActionIcon>
                      </MenuTarget>
                      <MenuDropdown>
                        <MenuItem leftSection={<Edit size={14} />}>
                          Edit
                        </MenuItem>
                        <MenuItem leftSection={<Eye size={14} />}>
                          View Shop
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem
                          color="red"
                          leftSection={<Trash size={14} />}
                        >
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
      </Paper>
    </Box>
  )
}