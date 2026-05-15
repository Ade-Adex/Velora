// // /app/components/admin/LogisticsActionMenu.tsx

// 'use client'

// import { ActionIcon, Menu } from '@mantine/core'
// import { MoreVertical, CheckCircle, AlertTriangle, Undo2 } from 'lucide-react'
// import { useTransition } from 'react'
// import { useSnackbar } from 'notistack'
// import { addLogisticsUpdate } from '@/app/services/logisticsService'
// import { IShipment } from '@/app/types'

// interface Props {
//   shipmentId: string
//   currentStatus: IShipment['status']
// }

// export default function LogisticsActionMenu({ shipmentId, currentStatus }: Props) {
//   const [isPending, startTransition] = useTransition()
//   const { enqueueSnackbar } = useSnackbar()

//   const handleUpdate = (status: IShipment['status'], description: string) => {
//     startTransition(async () => {
//       try {
//         await addLogisticsUpdate(shipmentId, status, 'Logistics Hub', description)
//         enqueueSnackbar(`Shipment marked as ${status.replace('_', ' ')}`, { variant: 'success' })
//       } catch (error) {
//         enqueueSnackbar('Failed to update status', { variant: 'error' })
//       }
//     })
//   }

//   return (
//     <Menu shadow="md" width={200} position="bottom-end" withArrow>
//       <Menu.Target>
//         <ActionIcon variant="light" loading={isPending} color="gray">
//           <MoreVertical size={16} />
//         </ActionIcon>
//       </Menu.Target>

//       <Menu.Dropdown>
//         <Menu.Label>Hub Operations</Menu.Label>

//         <Menu.Item
//           leftSection={<CheckCircle size={14} />}
//           color="teal"
//           disabled={currentStatus === 'delivered'}
//           onClick={() =>
//             handleUpdate(
//               'delivered',
//               'Package safely received at Hub. Ready for consolidation.',
//             )
//           }
//         >
//           Confirm Hub Arrival
//         </Menu.Item>

//         <Menu.Divider />
//         <Menu.Label>Exceptions</Menu.Label>

//         <Menu.Item
//           leftSection={<AlertTriangle size={14} />}
//           color="red"
//           onClick={() =>
//             handleUpdate(
//               'failed_attempt',
//               'Shipment rejected or address unreachable',
//             )
//           }
//         >
//           Mark as Failed
//         </Menu.Item>

//         <Menu.Item
//           leftSection={<Undo2 size={14} />}
//           color="pink"
//           onClick={() =>
//             handleUpdate('returned', 'Initiating return to vendor')
//           }
//         >
//           Mark as Returned
//         </Menu.Item>
//       </Menu.Dropdown>
//     </Menu>
//   )
// }




// /app/components/admin/LogisticsActionMenu.tsx
'use client'

import { ActionIcon, Menu } from '@mantine/core'
import { MoreVertical, CheckCircle, AlertTriangle, Undo2 } from 'lucide-react'
import { useTransition } from 'react'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/navigation' // Add this
import { addLogisticsUpdate } from '@/app/services/logisticsService'
import { IShipment } from '@/app/types'
import { useShipmentStore } from '@/app/store/useShipmentStore'

interface Props {
  shipmentId: string
  currentStatus: IShipment['status']
}

export default function LogisticsActionMenu({ shipmentId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter() // Initialize router
  const updateShipmentInStore = useShipmentStore((state) => state.updateShipmentInStore)

  const handleUpdate = (status: IShipment['status'], description: string) => {
    startTransition(async () => {
      try {
        const updatedShipment = await addLogisticsUpdate(shipmentId, status, 'Logistics Hub', description)
        
        // Push the update into the global state store instantly
        updateShipmentInStore(updatedShipment)

        // Force Next.js to pull fresh Server Component data immediately
        router.refresh()

        enqueueSnackbar(`Shipment marked as ${status.replace('_', ' ')}`, { variant: 'success' })
      } catch (error) {
        enqueueSnackbar('Failed to update status', { variant: 'error' })
      }
    })
  }

  return (
    <Menu shadow="md" width={200} position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon variant="light" loading={isPending} color="gray">
          <MoreVertical size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Hub Operations</Menu.Label>

        <Menu.Item
          leftSection={<CheckCircle size={14} />}
          color="teal"
          disabled={currentStatus === 'delivered'}
          onClick={() =>
            handleUpdate(
              'delivered',
              'Package safely received at Hub. Ready for consolidation.',
            )
          }
        >
          Confirm Hub Arrival
        </Menu.Item>

        <Menu.Divider />
        <Menu.Label>Exceptions</Menu.Label>

        <Menu.Item
          leftSection={<AlertTriangle size={14} />}
          color="red"
          disabled={currentStatus === 'failed_attempt'}
          onClick={() =>
            handleUpdate(
              'failed_attempt',
              'Shipment rejected or address unreachable',
            )
          }
        >
          Mark as Failed
        </Menu.Item>

        <Menu.Item
          leftSection={<Undo2 size={14} />}
          color="pink"
          disabled={currentStatus === 'returned'}
          onClick={() =>
            handleUpdate('returned', 'Initiating return to vendor')
          }
        >
          Mark as Returned
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}