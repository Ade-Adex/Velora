//  /app/(shop)/product/[slug]/page.tsx

import { getProductBySlug } from '@/app/services/product-service'
import { notFound } from 'next/navigation'
import ProductDetailsClient from '@/app/components/shop/ProductDetailsClient'
import ProductHydrator from '@/app/components/shop/ProductHydrator'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const serializedProduct = JSON.parse(JSON.stringify(product))

  return (
    <>
      {/* 1. Sync this specific product to the Zustand store */}
      <ProductHydrator products={[serializedProduct]} />

      {/* 2. Render the UI */}
      <ProductDetailsClient product={serializedProduct} />
    </>
  )
}