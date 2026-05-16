// /app/components/admin/LogisticsListInitializer.tsx
// 'use client'

// import { useEffect, useRef } from 'react'
// import { useShipmentStore } from '@/app/store/useShipmentStore'
// import { IShipment, IOrder, Serialized } from '@/app/types'

// export type PopulatedAdminShipment = Serialized<
//   Omit<IShipment, 'order' | 'vendor'>
// > & {
//   _id: string
//   order: Pick<Serialized<IOrder>, 'orderNumber'>
//   vendor: {
//     fullName: string
//     vendorProfile?: { shopName: string }
//   }
// }

// interface Props {
//   shipments: PopulatedAdminShipment[]
// }

// export default function LogisticsListInitializer({ shipments }: Props) {
//   const isInitialized = useRef(false)

//   useEffect(() => {
//     // Treat the custom populated projection as an extension of the base type safely
//     const baseShipments = shipments as unknown as Serialized<IShipment>[]

//     if (!isInitialized.current) {
//       useShipmentStore.getState().setShipments(baseShipments)
//       isInitialized.current = true
//     } else {
//       useShipmentStore.getState().setShipments(baseShipments)
//     }
//   }, [shipments])

//   return null
// }





// /app/components/admin/LogisticsListInitializer.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useShipmentStore } from '@/app/store/useShipmentStore'
import { IShipment, IOrder, Serialized } from '@/app/types'
import PusherClient from 'pusher-js'

export type PopulatedAdminShipment = Serialized<
  Omit<IShipment, 'order' | 'vendor'>
> & {
  _id: string
  order: Pick<Serialized<IOrder>, 'orderNumber'>
  vendor: {
    fullName: string
    vendorProfile?: { shopName: string }
  }
}

interface Props {
  shipments: PopulatedAdminShipment[]
}

export default function LogisticsListInitializer({ shipments }: Props) {
  const isInitialized = useRef(false)

  // 1. Core State Population Sync
  useEffect(() => {
    const baseShipments = shipments as unknown as Serialized<IShipment>[]
    useShipmentStore.getState().setShipments(baseShipments)
  }, [shipments])

  // 2. Realtime Subscription Pipeline
  useEffect(() => {
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe('logistics-fleet-channel')

    // Bind to the exact update event name we defined inside logisticsService.ts
    channel.bind(
      'shipment-status-updated',
      (data: { shipmentId: string; status: string }) => {
        const store = useShipmentStore.getState()

        // Find the active record in the client array
        const existingShipment = store.shipments.find(s => s._id === data.shipmentId)
        
        if (existingShipment) {
          // Leverage your existing store action!
          // We assert the incoming string token matches the strict model literal definition
          store.updateShipmentInStore({
            ...existingShipment,
            status: data.status as IShipment['status'], 
            updatedAt: new Date().toISOString(),
          })
        }
      },
    )

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [])

  return null
}