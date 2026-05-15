// /app/components/vendor/StoreInitializer.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useShipmentStore } from '@/app/store/useShipmentStore'
import { IShipment, IOrder, Serialized } from '@/app/types'

// Define a strict, type-safe composite type for a populated record
export type PopulatedSerializedShipment = Serialized<IShipment> & {
  order: Serialized<IOrder>
}

interface StoreInitializerProps {
  shipment: PopulatedSerializedShipment
}

export default function StoreInitializer({ shipment }: StoreInitializerProps) {
  const isInitialized = useRef(false)

  useEffect(() => {
    // Cast down safely to the base state interface expected by the store
    const baseShipment = shipment as Serialized<IShipment>

    if (!isInitialized.current) {
      useShipmentStore.getState().setCurrentShipment(baseShipment)
      isInitialized.current = true
    } else {
      useShipmentStore.getState().setCurrentShipment(baseShipment)
    }
  }, [shipment])

  return null
}
