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
  const setProducts = useProductStore((state) => state.setProducts)

  useEffect(() => {
    setProducts(products)
  }, [products, setProducts])

  return null // This component renders nothing, it just manages data
}
