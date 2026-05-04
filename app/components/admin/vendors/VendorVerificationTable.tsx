// app/components/admin/vendors/VendorVerificationTable.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  Button,
  Badge,
  Group,
  Avatar,
  Text,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import { Check, X, Store, Mail, Calendar } from 'lucide-react'
import { Serialized, IUser } from '@/app/types'
import { toggleVendorVerification } from '@/app/services/adminService'
import { useSnackbar } from 'notistack'

interface Props {
  initialVendors: Serialized<IUser>[]
}

export default function VendorVerificationTable({ initialVendors }: Props) {
  const [vendors, setVendors] = useState(initialVendors)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleVerify = async (userId: string) => {
    setLoadingId(userId)
    const res = await toggleVendorVerification(userId, true)

    if (res.success) {
      enqueueSnackbar(res.message, { variant: 'success' })
      // Remove from the "Pending" list locally
      setVendors((prev) => prev.filter((v) => v._id !== userId))
    } else {
      enqueueSnackbar(res.error || 'Failed to verify', { variant: 'error' })
    }
    setLoadingId(null)
  }

  const rows = vendors.map((vendor) => (
    <Table.Tr key={vendor._id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={vendor.image} radius="xl" size="md">
            {vendor.fullName.charAt(0)}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {vendor.fullName}
            </Text>
            <Group gap={4}>
              <Mail size={12} className="text-gray-400" />
              <Text size="xs" c="dimmed">
                {vendor.email}
              </Text>
            </Group>
          </div>
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Store size={16} className="text-red-500" />
          <Text size="sm" fw={600}>
            {vendor.vendorProfile?.shopName || 'N/A'}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text size="xs" c="dimmed">
          {new Date(vendor.createdAt).toLocaleDateString()}
        </Text>
      </Table.Td>

      <Table.Td>
        <Badge variant="light" color="orange">
          Pending Review
        </Badge>
      </Table.Td>

      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <Button
            size="compact-xs"
            color="green"
            leftSection={<Check size={14} />}
            loading={loadingId === vendor._id}
            onClick={() => handleVerify(vendor._id)}
          >
            Approve
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Paper withBorder radius="md" p="0" className="overflow-hidden">
      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            <Table.Th>Seller</Table.Th>
            <Table.Th>Shop Name</Table.Th>
            <Table.Th>Applied On</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5} align="center" py="xl">
                <Text c="dimmed">No pending verification requests found.</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  )
}
