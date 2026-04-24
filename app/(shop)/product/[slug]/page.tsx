//  /app/(shop)/product/[slug]/page.tsx

import { getProductBySlug } from '@/app/services/product-service'
import { notFound } from 'next/navigation'
import ProductDetailsClient from '@/app/components/shop/ProductDetailsClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const product = await getProductBySlug(slug)

  console.log('Fetched product for slug:', slug, product)

  if (!product) {
    notFound()
  }

  // Serialize MongoDB data
  const serializedProduct = JSON.parse(JSON.stringify(product))

  return <ProductDetailsClient product={serializedProduct} />
}