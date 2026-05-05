// /app/components/vendor/VendorShipmentForm.tsx
'use client'

import { useState } from 'react'
import { Select, TextInput, Button, Stack, Paper, Text } from '@mantine/core'
import { updateShipmentStatus } from '@/app/services/logisticsService'
import { IShipment } from '@/app/types'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack' // Import notistack hook

interface VendorShipmentFormProps {
  shipmentId: string
  currentStatus: IShipment['status']
  currentTracking: string
}

export default function VendorShipmentForm({
  shipmentId,
  currentStatus,
  currentTracking,
}: VendorShipmentFormProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar() // Initialize snackbar

  const [status, setStatus] = useState<string>(currentStatus)
  const [tracking, setTracking] = useState<string>(currentTracking)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await updateShipmentStatus(shipmentId, status, tracking)

      // Success Notification
      enqueueSnackbar('Shipment updated successfully!', {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      })

      router.refresh() // Sync Server Component data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'

      // Error Notification
      enqueueSnackbar(`Update failed: ${message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper withBorder p="xl" radius="md" shadow="sm">
      <Stack gap="md">
        <Text fw={700}>Logistics Update</Text>
        <Select
          label="Shipping Status"
          value={status}
          onChange={(val) => setStatus(val || 'label_created')}
          data={[
            { value: 'label_created', label: 'Label Created' },
            { value: 'pickup_pending', label: 'Pending Pickup' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'delivered', label: 'Delivered' },
          ]}
        />
        <TextInput
          label="Tracking Number"
          placeholder="e.g. GIGL-12345"
          value={tracking}
          onChange={(e) => setTracking(e.currentTarget.value)}
        />
        <Button
          color="black"
          onClick={handleUpdate}
          loading={loading}
          fullWidth
        >
          Save Logistics Info
        </Button>
      </Stack>
    </Paper>
  )
}
