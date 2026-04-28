// /app/store/useWishlistStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/app/types'

interface WishlistState {
  wishlist: IProduct[]
  toggleWishlist: (product: IProduct) => void
  isInWishlist: (productId: string | undefined) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      toggleWishlist: (product) => {
        const current = get().wishlist
        // Fix: Convert both IDs to strings for comparison
        const isExist = current.find(
          (item) => item._id?.toString() === product._id?.toString(),
        )

        if (isExist) {
          set({
            wishlist: current.filter(
              (item) => item._id?.toString() !== product._id?.toString(),
            ),
          })
        } else {
          set({ wishlist: [...current, product] })
        }
      },
      isInWishlist: (productId) => {
        if (!productId) return false
        return get().wishlist.some((item) => item._id?.toString() === productId)
      },
      clearWishlist: () => set({ wishlist: [] }),
    }),
    { name: 'wishlist-storage' },
  ),
)
