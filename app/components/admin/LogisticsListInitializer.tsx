// /app/components/admin/LogisticsListInitializer.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useShipmentStore } from '@/app/store/useShipmentStore'
import { IShipment, IOrder, Serialized } from '@/app/types'

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

  useEffect(() => {
    // Treat the custom populated projection as an extension of the base type safely
    const baseShipments = shipments as unknown as Serialized<IShipment>[]

    if (!isInitialized.current) {
      useShipmentStore.getState().setShipments(baseShipments)
      isInitialized.current = true
    } else {
      useShipmentStore.getState().setShipments(baseShipments)
    }
  }, [shipments])

  return null
}
