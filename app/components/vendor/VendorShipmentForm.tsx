// // /app/components/vendor/VendorShipmentForm.tsx
// 'use client'

// import { useState } from 'react'
// import { Select, TextInput, Button, Stack, Paper, Text } from '@mantine/core'
// import { updateShipmentStatus } from '@/app/services/logisticsService'
// import { IShipment } from '@/app/types'
// import { useRouter } from 'next/navigation'
// import { useSnackbar } from 'notistack'

// interface VendorShipmentFormProps {
//   shipmentId: string
//   currentStatus: IShipment['status']
//   currentTracking: string
// }

// export default function VendorShipmentForm({
//   shipmentId,
//   currentStatus,
//   currentTracking,
// }: VendorShipmentFormProps) {
//   const router = useRouter()
//   const { enqueueSnackbar } = useSnackbar()

//   const [status, setStatus] = useState<string>(currentStatus)
//   const [tracking, setTracking] = useState<string>(currentTracking)
//   const [loading, setLoading] = useState(false)

//  const vendorOptions = [
//   { value: 'label_created', label: 'Preparing Package' },
//   { value: 'ready_for_pickup', label: 'Ready for Collection' },
//   { value: 'in_transit', label: 'Handed to Carrier' },
// ]

//   const isFinalizedByVendor = [
//     'in_transit',
//     'out_for_delivery',
//     'delivered',
//   ].includes(currentStatus)

//   const handleUpdate = async () => {
//     setLoading(true)
//     try {
//       await updateShipmentStatus(shipmentId, status, tracking)

//       // Success Notification
//       enqueueSnackbar('Shipment updated successfully!', {
//         variant: 'success',
//         anchorOrigin: { vertical: 'top', horizontal: 'right' },
//       })

//       router.refresh() // Sync Server Component data
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Unknown error'

//       // Error Notification
//       enqueueSnackbar(`Update failed: ${message}`, {
//         variant: 'error',
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

// return (
//   <Paper withBorder p="xl" radius="md" shadow="sm">
//     <Stack gap="md">
//       <Text fw={700} size="lg">
//         Shipment Fulfillment
//       </Text>
//       <Text size="xs" c="dimmed" mt={-10}>
//         Confirm items are packed and ready for the logistics provider.
//       </Text>

//       <Select
//         label="Fulfillment Status"
//         value={status}
//         onChange={(val) => setStatus(val || 'label_created')}
//         data={vendorOptions}
//         disabled={isFinalizedByVendor || loading}
//       />

//       <TextInput
//         label="Tracking ID (Air Waybill)"
//         placeholder="Enter carrier tracking number"
//         value={tracking}
//         onChange={(e) => setTracking(e.currentTarget.value)}
//         disabled={isFinalizedByVendor || loading}
//         description="Provided by your logistics partner"
//       />

//       <Button
//         color="black"
//         onClick={handleUpdate}
//         loading={loading}
//         fullWidth
//         disabled={isFinalizedByVendor}
//       >
//         {isFinalizedByVendor ? 'Fulfillment Complete' : 'Confirm Dispatch'}
//       </Button>

//       {isFinalizedByVendor && (
//         <Text size="xs" c="blue" ta="center" fw={500}>
//           This shipment is now being managed by the carrier.
//         </Text>
//       )}
//     </Stack>
//   </Paper>
// )
// }





// /app/components/vendor/VendorShipmentForm.tsx
'use client'

import { useState } from 'react'
import { Select, TextInput, Button, Stack, Paper, Text } from '@mantine/core'
import { updateShipmentStatus } from '@/app/services/logisticsService'
import { IShipment } from '@/app/types'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack' 
import { useShipmentStore } from '@/app/store/useShipmentStore'

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
  const { enqueueSnackbar } = useSnackbar() 
  const updateShipmentInStore = useShipmentStore((state) => state.updateShipmentInStore)

  const [status, setStatus] = useState<string>(currentStatus)
  const [tracking, setTracking] = useState<string>(currentTracking)
  const [loading, setLoading] = useState(false)

  const vendorOptions = [
    { value: 'label_created', label: 'Preparing Package' },
    { value: 'ready_for_pickup', label: 'Ready for Collection' },
    { value: 'in_transit', label: 'Handed to Carrier' }, 
  ]

  const isFinalizedByVendor = [
    'in_transit', 
    'out_for_delivery',
    'delivered',
  ].includes(currentStatus)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const updatedShipment = await updateShipmentStatus(shipmentId, status, tracking)

      // Sync state globally into Zustand store
      updateShipmentInStore(updatedShipment)

      enqueueSnackbar('Shipment updated successfully!', {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      })

      router.refresh() // Sync Server Component data fallback
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      enqueueSnackbar(`Update failed: ${message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper withBorder p="xl" radius="md" shadow="sm">
      <Stack gap="md">
        <Text fw={700} size="lg">Shipment Fulfillment</Text>
        <Text size="xs" c="dimmed" mt={-10}>
          Confirm items are packed and ready for the logistics provider.
        </Text>

        <Select
          label="Fulfillment Status"
          value={status}
          onChange={(val) => setStatus(val || 'label_created')}
          data={vendorOptions}
          disabled={isFinalizedByVendor || loading}
        />

        <TextInput
          label="Tracking ID (Air Waybill)"
          placeholder="Enter carrier tracking number"
          value={tracking}
          onChange={(e) => setTracking(e.currentTarget.value)}
          disabled={isFinalizedByVendor || loading}
          description="Provided by your logistics partner"
        />

        <Button
          color="black"
          onClick={handleUpdate}
          loading={loading}
          fullWidth
          disabled={isFinalizedByVendor}
        >
          {isFinalizedByVendor ? 'Fulfillment Complete' : 'Confirm Dispatch'}
        </Button>

        {isFinalizedByVendor && (
          <Text size="xs" c="blue" ta="center" fw={500}>
            This shipment is now being managed by the carrier.
          </Text>
        )}
      </Stack>
    </Paper>
  )
}