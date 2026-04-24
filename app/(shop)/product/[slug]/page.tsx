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

  // Ensure MongoDB objects are converted to plain JSON for Client Components
  const serializedProduct = JSON.parse(JSON.stringify(product))

  return (
    <>
      {/* Sync this specific product to the store for other components to use */}
      <ProductHydrator products={[serializedProduct]} />

      {/* Render the detailed view */}
      <ProductDetailsClient product={serializedProduct} />
    </>
  )
}