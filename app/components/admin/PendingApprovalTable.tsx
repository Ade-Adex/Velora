// /app/components/admin/PendingApprovalTable.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  Group,
  Text,
  Avatar,
  Badge,
  Button,
  ScrollArea,
  Modal,
  Textarea,
  Stack,
  Box,
} from '@mantine/core'
import { Package, Check, X, AlertCircle, RefreshCcw } from 'lucide-react'
import { useSnackbar } from 'notistack'
import { updateProductApproval } from '@/app/services/adminService'
import { IProduct, IUser, Serialized } from '@/app/types'

interface Props {
  products: Serialized<IProduct>[]
  isRejectedTab?: boolean // Optional prop with default logic in component
}

export default function PendingApprovalTable({
  products: initialProducts,
  isRejectedTab = false,
}: Props) {
  const { enqueueSnackbar } = useSnackbar()

  // Update local state if initialProducts changes (e.g., switching tabs)
  const [products, setProducts] = useState(initialProducts)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Modal states for rejection reason
  const [opened, setOpened] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')


  const handleAction = async (
    productId: string,
    action: 'approved' | 'rejected',
    reason?: string,
  ) => {
    setLoadingId(productId)

    try {
      const result = await updateProductApproval(productId, action, reason)

      if (result.success) {
        enqueueSnackbar(
          action === 'approved'
            ? isRejectedTab
              ? 'Product re-approved successfully'
              : 'Product approved successfully'
            : 'Product rejected',
          { variant: action === 'approved' ? 'success' : 'info' },
        )
        // Optimistically remove the product from the current list
        setProducts((prev) => prev.filter((p) => p._id !== productId))

        if (action === 'rejected') {
          setOpened(false)
          setRejectionReason('')
          setSelectedId(null)
        }
      } else {
        enqueueSnackbar(result.error || 'Update failed', { variant: 'error' })
      }
    } catch (error) {
      enqueueSnackbar('A server error occurred', { variant: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  const openRejectionModal = (id: string) => {
    setSelectedId(id)
    setOpened(true)
  }

  if (products.length === 0) {
    return (
      <Stack align="center" py={60} gap="xs">
        <Check size={40} color="#40c057" />
        <Text fw={700}>All caught up!</Text>
        <Text size="sm" c="dimmed">
          No products are currently in the{' '}
          {isRejectedTab ? 'rejected' : 'pending'} queue.
        </Text>
      </Stack>
    )
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Text fw={900}>Reject Product Submission</Text>}
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Please let the vendor know why this product was rejected.
          </Text>
          <Textarea
            label="Reason for Rejection"
            placeholder="e.g., Image resolution is too low..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.currentTarget.value)}
            minRows={4}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setOpened(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<X size={16} />}
              disabled={!rejectionReason.trim()}
              loading={loadingId === selectedId}
              onClick={() =>
                handleAction(selectedId!, 'rejected', rejectionReason)
              }
            >
              Confirm Rejection
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ScrollArea scrollbars="x">
        <Table
          verticalSpacing="md"
          horizontalSpacing="md"
          highlightOnHover
          miw={800}
        >
          <thead className={isRejectedTab ? 'bg-red-50' : 'bg-orange-50'}>
            <tr>
              <th
                className={`p-4 text-xs font-bold uppercase ${isRejectedTab ? 'text-red-700' : 'text-orange-700'}`}
              >
                Product Details
              </th>
              <th
                className={`p-4 text-xs font-bold uppercase ${isRejectedTab ? 'text-red-700' : 'text-orange-700'}`}
              >
                Vendor & Shop
              </th>
              <th
                className={`p-4 text-xs font-bold uppercase text-right ${isRejectedTab ? 'text-red-700' : 'text-orange-700'}`}
              >
                Moderation Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const vendor = product.vendor as unknown as Serialized<IUser>
              const shopName = vendor?.vendorProfile?.shopName || 'No Shop Name'

              return (
                <tr key={product._id} className="border-t border-gray-100">
                  <td className="p-4">
                    <Group gap="sm">
                      <Avatar
                        src={
                          typeof product.mainImage === 'string'
                            ? product.mainImage
                            : product.mainImage?.src
                        }
                        radius="md"
                        size="lg"
                      >
                        <Package size={20} />
                      </Avatar>
                      <Box>
                        <Text size="sm" fw={800} className="line-clamp-1">
                          {product.name}
                        </Text>
                        <Badge
                          size="xs"
                          variant="outline"
                          color={isRejectedTab ? 'red' : 'orange'}
                        >
                          {isRejectedTab ? 'Rejected' : 'Pending Review'}
                        </Badge>
                      </Box>
                    </Group>
                  </td>
                  <td className="p-4">
                    <Text size="sm" fw={700} c="blue.9">
                      {shopName}
                    </Text>
                    <Text size="xs" fw={500} c="dimmed">
                      By: {vendor?.fullName || 'Unknown'}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </Text>
                  </td>
                  <td className="p-4">
                    <Group justify="flex-end" gap="xs">
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        leftSection={
                          isRejectedTab ? (
                            <RefreshCcw size={14} />
                          ) : (
                            <Check size={14} />
                          )
                        }
                        loading={loadingId === product._id}
                        disabled={!!loadingId && loadingId !== product._id}
                        onClick={() => handleAction(product._id, 'approved')}
                      >
                        {isRejectedTab ? 'Re-approve' : 'Approve'}
                      </Button>

                      {!isRejectedTab && (
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          leftSection={<AlertCircle size={14} />}
                          disabled={!!loadingId && loadingId !== product._id}
                          onClick={() => openRejectionModal(product._id)}
                        >
                          Reject
                        </Button>
                      )}
                    </Group>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </>
  )
}