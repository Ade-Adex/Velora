'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, TextInput, Button, Paper, Text, Stack } from '@mantine/core'
import { useSnackbar } from 'notistack'
import { Save, Truck } from 'lucide-react'

export default function StatusUpdateForm({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState<string | null>(currentStatus)
  const [tracking, setTracking] = useState('')
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, trackingNumber: tracking }),
      })

      if (res.ok) {
        enqueueSnackbar('Order updated successfully', { variant: 'success' })
        router.refresh()
      } else {
        enqueueSnackbar('Failed to update order', { variant: 'error' })
      }
    } catch (err) {
      enqueueSnackbar('Server error', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper p="sm" radius="md" withBorder shadow="xs">
      <Stack gap="md">
        <Text fw={800} tt="uppercase" size="xs" c="dimmed">Fulfillment</Text>
        <Select
          label="Order Status"
          value={status}
          onChange={setStatus}
          data={['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']}
        />
        {status === 'shipped' && (
          <TextInput
            label="Tracking ID"
            placeholder="Courier Tracking #"
            leftSection={<Truck size={16} />}
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        )}
        <Button onClick={handleUpdate} loading={loading} color="black" fullWidth>
          Save Changes
        </Button>
      </Stack>
    </Paper>
  )
}