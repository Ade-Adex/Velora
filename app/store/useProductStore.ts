// /app/store/useProductStore.ts
import { create } from 'zustand'
import { IProduct } from '@/app/types'

interface ProductState {
  products: IProduct[]
  featuredProducts: IProduct[]
  isLoading: boolean

  // Actions
  setProducts: (products: IProduct[]) => void
  setFeaturedProducts: (products: IProduct[]) => void
  setLoading: (status: boolean) => void

  // Helper to find a single product from the state
  getProductBySlug: (slug: string) => IProduct | undefined
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  isLoading: false,

  setProducts: (products) => set({ products, isLoading: false }),

  setFeaturedProducts: (products) => set({ featuredProducts: products }),

  setLoading: (status) => set({ isLoading: status }),

  getProductBySlug: (slug) => {
    return get().products.find((p) => p.slug === slug)
  },
}))
