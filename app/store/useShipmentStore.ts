// /app/store/useShipmentStore.ts
import { create } from 'zustand'
import { IShipment, Serialized } from '@/app/types'

interface ShipmentState {
  shipments: Serialized<IShipment>[]
  currentShipment: Serialized<IShipment> | null
  isLoading: boolean

  // Actions
  setShipments: (shipments: Serialized<IShipment>[]) => void
  setCurrentShipment: (shipment: Serialized<IShipment> | null) => void
  setLoading: (status: boolean) => void

  // Update a single shipment in place inside the list and matching current selection
  updateShipmentInStore: (updatedShipment: Serialized<IShipment>) => void
}

export const useShipmentStore = create<ShipmentState>((set) => ({
  shipments: [],
  currentShipment: null,
  isLoading: false,

  setShipments: (shipments) => set({ shipments, isLoading: false }),
  setCurrentShipment: (shipment) => set({ currentShipment: shipment }),
  setLoading: (status) => set({ isLoading: status }),

  updateShipmentInStore: (updatedShipment) =>
    set((state) => ({
      currentShipment:
        state.currentShipment?._id === updatedShipment._id
          ? updatedShipment
          : state.currentShipment,
      shipments: state.shipments.map((shipment) =>
        shipment._id === updatedShipment._id ? updatedShipment : shipment,
      ),
    })),
}))
