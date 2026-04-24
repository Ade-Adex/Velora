//  /app/(shop)/product/[slug]/page.tsx

import { getProductBySlug } from '@/app/services/product-service'
import { notFound } from 'next/navigation'
import ProductDetailsClient from '@/app/components/shop/ProductDetailsClient'

interface Props {
  params: { slug: string }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Serialize MongoDB data (converts ObjectIds to strings)
  const serializedProduct = JSON.parse(JSON.stringify(product))

  return <ProductDetailsClient product={serializedProduct} />
}