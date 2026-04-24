// /app/components/shop/ProductHydrator.tsx

'use client'
import { useEffect } from 'react'
import { useProductStore } from '@/app/store/useProductStore'
import { IProduct } from '@/app/types'

export default function ProductHydrator({
  products,
}: {
  products: IProduct[]
}) {
  const { products: existingProducts, setProducts } = useProductStore()

  useEffect(() => {
    // Only add products that aren't already in the store to avoid duplicates
    const newItems = products.filter(
      (p) => !existingProducts.some((existing) => existing.slug === p.slug),
    )

    if (newItems.length > 0) {
      setProducts([...existingProducts, ...newItems])
    }
  }, [products, setProducts, existingProducts])

  return null
}