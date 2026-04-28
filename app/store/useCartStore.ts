//  /app/store/useCartStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/app/types'

interface CartState {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) => {
        const currentCart = get().cart
        const existingItem = currentCart.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            cart: currentCart.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          })
        } else {
          set({ cart: [...currentCart, item] })
        }
      },

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, qty) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id === id) {
              // Limit quantity between 1 and the available stock
              const maxStock = item.stock || 0
              const validQty = Math.max(1, Math.min(qty, maxStock))
              return { ...item, quantity: validQty }
            }
            return item
          }),
        })),

      clearCart: () => set({ cart: [] }),

      getTotalPrice: () => {
        return get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        )
      },

      getItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'vantage-commerce-storage',
    },
  ),
)
