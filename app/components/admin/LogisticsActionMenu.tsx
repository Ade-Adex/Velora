'use client'

import { ActionIcon, Menu } from '@mantine/core'
import {
  MoreVertical,
  Truck,
  CheckCircle,
  Package,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import { useTransition } from 'react'
import { useSnackbar } from 'notistack' // Import the hook
import { addLogisticsUpdate } from '@/app/services/logisticsService'
import { IShipment } from '@/app/types'

interface Props {
  shipmentId: string
  currentStatus: IShipment['status']
}

export default function LogisticsActionMenu({
  shipmentId,
  currentStatus,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const { enqueueSnackbar } = useSnackbar() // Initialize snackbar

  const handleUpdate = (status: IShipment['status'], description: string) => {
    startTransition(async () => {
      try {
        await addLogisticsUpdate(
          shipmentId,
          status,
          'Main Warehouse',
          description,
        )

        // Success Snackbar
        enqueueSnackbar(
          `Shipment status updated to ${status.replace('_', ' ')}`,
          {
            variant: 'success',
            autoHideDuration: 3000,
          },
        )
      } catch (error) {
        console.error('Update failed:', error)

        // Error Snackbar
        enqueueSnackbar('Failed to update shipment status', {
          variant: 'error',
        })
      }
    })
  }

  return (
    <Menu shadow="md" width={220} position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon
          variant="light"
          loading={isPending}
          color="gray"
          aria-label="Shipment actions"
        >
          <MoreVertical size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Update Pipeline</Menu.Label>

        <Menu.Item
          leftSection={<Package size={14} />}
          disabled={currentStatus === 'pickup_pending'}
          onClick={() =>
            handleUpdate('pickup_pending', 'Package ready for pickup')
          }
        >
          Mark Pickup Pending
        </Menu.Item>

        <Menu.Item
          leftSection={<Truck size={14} />}
          color="blue"
          disabled={currentStatus === 'in_transit'}
          onClick={() =>
            handleUpdate('in_transit', 'Departed sorting facility')
          }
        >
          Dispatch (In Transit)
        </Menu.Item>

        <Menu.Item
          leftSection={<MapPin size={14} />}
          color="indigo"
          disabled={currentStatus === 'out_for_delivery'}
          onClick={() =>
            handleUpdate('out_for_delivery', 'Package with delivery agent')
          }
        >
          Out for Delivery
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<CheckCircle size={14} />}
          color="teal"
          onClick={() => handleUpdate('delivered', 'Handed over to recipient')}
        >
          Confirm Delivery
        </Menu.Item>

        <Menu.Item
          leftSection={<AlertTriangle size={14} />}
          color="red"
          onClick={() => handleUpdate('failed_attempt', 'Receiver unavailable')}
        >
          Fail Attempt
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
